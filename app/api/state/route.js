import { db } from "../../lib/server/db";
import { getSessionUser, unauthorised } from "../../lib/server/auth";
import {
  ACTIVE_STATUSES,
  aheadCountFor,
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
