import { db } from "../../lib/server/db";
import { getSessionUser, unauthorised } from "../../lib/server/auth";
import {
  ACTIVE_STATUSES,
  aheadCountFor,
  expireOverdueCalls,
  notifyUser,
  serializeBranch,
  serializeNotification,
  serializeTicket,
  serializeVisit,
  serialiseStaffTicket,
} from "../../lib/server/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** One poll endpoint powering the whole citizen (and staff) app. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorised();

  // Lazy automatic no-show release: any CALLED ticket past its branch's
  // arrival grace period flips to NO_SHOW before we build the response,
  // so citizen + staff views agree on the outcome within one poll cycle.
  await expireOverdueCalls();

  // Appointment reminders: CONFIRMED slots starting within the next 2h get
  // one "leaving soon" notification each (reminderSent keeps it once-only).
  // Lazy, like the no-show release — no scheduler needed on serverless.
  const reminderWindowEnd = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const dueReminders = await db.appointment.findMany({
    where: {
      userId: user.id,
      status: "CONFIRMED",
      reminderSent: false,
      slotAt: { gte: new Date(), lte: reminderWindowEnd },
    },
    include: { branch: true },
  });
  for (const appt of dueReminders) {
    await db.appointment.update({ where: { id: appt.id }, data: { reminderSent: true } });
    const when = appt.slotAt.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit", hour12: false });
    await notifyUser(
      user.id,
      "Appointment coming up",
      `${appt.serviceName} at ${appt.branch?.name || "your branch"} · ${when}. Leave now to arrive on time.`,
      "appointment",
    );
  }

  const branchesRaw = await db.branch.findMany({
    include: {
      services: true,
      tickets: { where: { status: { in: ACTIVE_STATUSES } }, select: { status: true } },
    },
    orderBy: { id: "asc" },
  });
  const branches = branchesRaw.map((branch) =>
    serializeBranch(branch, branch.tickets.length),
  );

  const myActive = await db.queueTicket.findFirst({
    where: { userId: user.id, status: { in: ACTIVE_STATUSES } },
    include: {
      branch: {
        include: {
          services: true,
          tickets: { where: { status: { in: ACTIVE_STATUSES } } },
        },
      },
    },
  });

  let ticket = null;
  if (myActive) {
    const waiting = myActive.branch.tickets.filter((t) => t.status === "WAITING");
    const ahead = myActive.branch.people + aheadCountFor(myActive, waiting);
    ticket = serializeTicket(myActive, ahead, serializeBranch(myActive.branch, myActive.branch.tickets.length));
  }

  const notificationsRaw = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { id: "desc" },
    take: 20,
  });

  const appointment = await db.appointment.findFirst({
    where: { userId: user.id, status: "CONFIRMED", slotAt: { gte: new Date(Date.now() - 2 * 60 * 60 * 1000) } },
    orderBy: { slotAt: "asc" },
    include: { branch: { include: { services: true } } },
  });

  const completed = await db.queueTicket.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    orderBy: { completedAt: "desc" },
    take: 20,
    include: { branch: true },
  });

  let staffQueue = null;
  if ((user.role === "STAFF" || user.role === "ADMIN") && user.branchId) {
    const active = await db.queueTicket.findMany({
      where: { branchId: user.branchId, status: { in: ACTIVE_STATUSES } },
      orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
      include: { user: { select: { name: true, phone: true } } },
    });
    const waiting = active.filter((t) => t.status === "WAITING");
    staffQueue = {
      branchId: user.branchId,
      tickets: active.map((t) => serialiseStaffTicket(t, aheadCountFor(t, waiting))),
    };
  }

  const totalSavedMinutes = completed.reduce((total, visit) => total + (visit.savedMinutes ?? 0), 0);

  return Response.json({
    serverNow: Date.now(),
    branches,
    ticket,
    notifications: notificationsRaw.map(serializeNotification),
    appointment: appointment
      ? {
          id: appointment.id,
          service: appointment.serviceName,
          slotAt: appointment.slotAt.getTime(),
          branch: serializeBranch(appointment.branch, 0),
        }
      : null,
    visits: completed.map(serializeVisit),
    totalSavedMinutes,
    staffQueue,
    user: {
      id: user.id,
      phone: user.phone,
      name: user.name,
      city: user.city,
      province: user.province,
      avatar: user.avatar,
      role: user.role,
      branchId: user.branchId,
    },
  });
}
