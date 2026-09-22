import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../lib/server/db";
import { getSessionUser, SESSION_COOKIE, unauthorised } from "../../../lib/server/auth";
import {
  ACTIVE_STATUSES,
  aheadCountFor,
  notifyUser,
  sendLeaveAlerts,
  serializeBranch,
  serializeTicket,
} from "../../../lib/server/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const actionSchema = z.object({
  action: z.enum(["check-in", "cancel", "complete", "call", "serve", "no-show"]),
});

async function loadTicket(id) {
  return db.queueTicket.findUnique({
    where: { id },
    include: {
      branch: { include: { services: true, tickets: { where: { status: { in: ACTIVE_STATUSES } } } } },
    },
  });
}

function shapeTicket(ticket) {
  const waiting = ticket.branch.tickets.filter((t) => t.status === "WAITING");
  const ahead = ticket.branch.people + aheadCountFor(ticket, waiting);
  return serializeTicket(ticket, ahead, serializeBranch(ticket.branch, ticket.branch.tickets.length));
}

export async function PATCH(request, context) {
  const user = await getSessionUser();
  if (!user) return unauthorised();

  const { id } = await context.params;
  const ticketId = Number(id);
  if (!Number.isInteger(ticketId)) {
    return NextResponse.json({ error: "Invalid ticket." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }
  const action = parsed.data.action;

  const ticket = await loadTicket(ticketId);
  if (!ticket) return NextResponse.json({ error: "Ticket not found." }, { status: 404 });

  const isOwner = ticket.userId === user.id;
  const isStaffHere =
    (user.role === "STAFF" || user.role === "ADMIN")
    && (user.branchId === ticket.branchId || user.role === "ADMIN");
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "1";

  // Staff-only transitions; in demo mode the ticket owner may drive them too.
  if (["call", "serve", "no-show"].includes(action) && !isStaffHere && !(demoMode && isOwner)) {
    return NextResponse.json({ error: "Only branch staff can do that." }, { status: 403 });
  }
  // Check-in/cancel stay owner-only; closing a visit may come from either side.
  if (["check-in", "cancel"].includes(action) && !isOwner) {
    return NextResponse.json({ error: "That is not your ticket." }, { status: 403 });
  }
  if (action === "complete" && !isOwner && !isStaffHere) {
    return NextResponse.json({ error: "Only the citizen or branch staff can complete this ticket." }, { status: 403 });
  }

  const now = new Date();
  let updated = ticket;

  switch (action) {
    case "check-in": {
      // Check-in is allowed while WAITING, or after being CALLED (citizen
      // arrived on the call — the normal real-world sequence). It is only
      // rejected once staff have started serving or the ticket is closed.
      if (!["WAITING", "CALLED"].includes(ticket.status)) {
        return NextResponse.json({ error: "This ticket is already being handled." }, { status: 409 });
      }
      updated = await db.queueTicket.update({
        where: { id: ticket.id },
        data: { checkedIn: true },
        include: relationArgs(),
      });
      await notifyUser(user.id, "Check-in confirmed", `The branch is ready for ticket ${ticket.code}.`);
      break;
    }
    case "cancel": {
      if (!ACTIVE_STATUSES.includes(ticket.status)) {
        return NextResponse.json({ error: "This ticket is already closed." }, { status: 409 });
      }
      updated = await db.queueTicket.update({
        where: { id: ticket.id },
        data: { status: "CANCELLED", cancelledAt: now },
        include: relationArgs(),
      });
      await sendLeaveAlerts(ticket.branchId);
      break;
    }
    case "complete": {
      // Only a still-active ticket can be closed out; the message explains which
      // situation the caller is in rather than always blaming a missing check-in.
      if (!ACTIVE_STATUSES.includes(ticket.status)) {
        return NextResponse.json(
          { error: `Ticket ${ticket.code} is already ${ticket.status.toLowerCase().replace("_", " ")}.` },
          { status: 409 },
        );
      }
      if (ticket.status === "WAITING" && !ticket.checkedIn) {
        return NextResponse.json({ error: "Check in at the branch before completing." }, { status: 409 });
      }
      const waitedMinutes = Math.max(1, Math.round((now.getTime() - ticket.joinedAt.getTime()) / 60000));
      const savedMinutes = Math.max(1, ticket.branch.wait - waitedMinutes);
      updated = await db.queueTicket.update({
        where: { id: ticket.id },
        data: { status: "COMPLETED", completedAt: now, savedMinutes },
        include: relationArgs(),
      });
      await db.branch.update({ where: { id: ticket.branchId }, data: { servedToday: { increment: 1 } } });
      await notifyUser(
        ticket.userId,
        "Service completed",
        `${ticket.branch.name} has been added to your Activity · ${savedMinutes} min saved.`,
      );
      await sendLeaveAlerts(ticket.branchId);
      break;
    }
    case "call": {
      if (ticket.status !== "WAITING") {
        return NextResponse.json({ error: "Only a waiting ticket can be called." }, { status: 409 });
      }
      updated = await db.queueTicket.update({
        where: { id: ticket.id },
        data: { status: "CALLED", calledAt: now },
        include: relationArgs(),
      });
      await notifyUser(ticket.userId, "You’re next", `Please check in at ${ticket.branch.name} — ticket ${ticket.code} is being called.`);
      await sendLeaveAlerts(ticket.branchId);
      break;
    }
    case "serve": {
      if (ticket.status !== "CALLED") {
        return NextResponse.json({ error: "Call the ticket before serving it." }, { status: 409 });
      }
      updated = await db.queueTicket.update({
        where: { id: ticket.id },
        data: { status: "SERVING", servedAt: now },
        include: relationArgs(),
      });
      await notifyUser(ticket.userId, "Now serving", `You are being served at ${ticket.branch.name}.`);
      break;
    }
    case "no-show": {
      if (!["WAITING", "CALLED"].includes(ticket.status)) {
        return NextResponse.json({ error: "This ticket can no longer be marked as a no-show." }, { status: 409 });
      }
      updated = await db.queueTicket.update({
        where: { id: ticket.id },
        data: { status: "NO_SHOW" },
        include: relationArgs(),
      });
      await notifyUser(ticket.userId, "Your place was released", `Ticket ${ticket.code} at ${ticket.branch.name} was closed after no response.`);
      await sendLeaveAlerts(ticket.branchId);
      break;
    }
    default:
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  return NextResponse.json({ ticket: shapeTicket(updated) });
}

/** Include args reused for every update so the response carries branch + queue. */
function relationArgs() {
  return {
    branch: { include: { services: true, tickets: { where: { status: { in: ACTIVE_STATUSES } } } } },
  };
}
