import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "../../lib/server/db";
import { getSessionUser, unauthorised } from "../../lib/server/auth";
import {
  ACTIVE_STATUSES,
  aheadCountFor,
  branchLivePeople,
  notifyUser,
  sendLeaveAlerts,
  serializeBranch,
  serializeTicket,
} from "../../lib/server/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const joinSchema = z.object({
  branchId: z.number().int().positive(),
  serviceName: z.string().min(1).max(120),
});

export async function POST(request) {
  const user = await getSessionUser();
  if (!user) return unauthorised();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = joinSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a branch and service first." }, { status: 400 });
  }

  // Concurrent joins are serialised with row locks so two citizens cannot both
  // squeeze past the capacity check, and one person cannot open two tickets.
  let joined;
  try {
    joined = await db.$transaction(async (tx) => {
      // Always lock citizen then branch, in that order, so parallel joins cannot
      // deadlock against each other.
      await tx.$queryRaw`SELECT "id" FROM "User" WHERE "id" = ${user.id} FOR UPDATE`;
      await tx.$queryRaw`SELECT "id" FROM "Branch" WHERE "id" = ${parsed.data.branchId} FOR UPDATE`;

      const existing = await tx.queueTicket.findFirst({
        where: { userId: user.id, status: { in: ACTIVE_STATUSES } },
      });
      if (existing) {
        throw new JoinError(`You already hold ticket ${existing.code}. One active ticket per person.`, 409);
      }

      const branch = await tx.branch.findUnique({
        where: { id: parsed.data.branchId },
        include: { services: true, tickets: { where: { status: { in: ACTIVE_STATUSES } } } },
      });
      if (!branch) throw new JoinError("That branch could not be found.", 404);

      if (branch.operationalStatus === "closed") {
        throw new JoinError("Branch closed. Book a time or choose another centre.", 409);
      }
      if (branch.operationalStatus === "paused" || !branch.virtualJoins) {
        throw new JoinError("Online joins are paused at this branch right now.", 409);
      }
      const people = branchLivePeople(branch, branch.tickets.length);
      if (people >= branch.capacity) {
        throw new JoinError("Queue at capacity. Choose an appointment or a quieter branch.", 409);
      }

      const service = branch.services.find((item) => item.name === parsed.data.serviceName);
      if (!service) throw new JoinError("Choose one of the services offered at this branch.", 400);

      const unavailable = JSON.parse(branch.unavailableServices || "[]");
      if (unavailable.includes(service.name)) {
        throw new JoinError("That service is unavailable today. Pick another one.", 409);
      }

      const waiting = branch.tickets.filter((t) => t.status === "WAITING");
      const ahead = branch.people + aheadCountFor({ joinedAt: new Date(), id: Number.MAX_SAFE_INTEGER }, waiting);

      const created = await tx.queueTicket.create({
        data: {
          userId: user.id,
          branchId: branch.id,
          serviceName: service.name,
          initialAhead: ahead + 1,
          code: `pending-${randomUUID()}`,
        },
      });
      const code = `QL-${String(created.id).padStart(3, "0")}`;
      const ticket = await tx.queueTicket.update({
        where: { id: created.id },
        data: { code },
        include: { branch: { include: { services: true, tickets: { where: { status: { in: ACTIVE_STATUSES } } } } } },
      });

      const finalAhead = branch.people + aheadCountFor(ticket, ticket.branch.tickets.filter((t) => t.status === "WAITING"));
      return { ticket, finalAhead, branchShape: serializeBranch(ticket.branch, ticket.branch.tickets.length) };
    }, { timeout: 15000, maxWait: 15000 });
  } catch (error) {
    if (error instanceof JoinError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    throw error;
  }

  const { ticket, finalAhead, branchShape } = joined;

  // Side effects run after the lock is released so the branch is not held open
  // while notifications are written.
  await notifyUser(
    user.id,
    `You’re in queue ${ticket.code}`,
    `${ticket.branch.name} · ${ticket.serviceName}. We’ll watch the queue and alert you when to leave.`,
  );
  await sendLeaveAlerts(ticket.branchId);

  return NextResponse.json({ ticket: serializeTicket(ticket, finalAhead, branchShape) });
}

/** Carries an HTTP status out of the join transaction. */
class JoinError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "JoinError";
    this.status = status;
  }
}
