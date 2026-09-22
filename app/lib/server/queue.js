import { db } from "./db";

export const ACTIVE_STATUSES = ["WAITING", "CALLED", "SERVING"];

/** Queue position helper: how many WAITING tickets joined before this one. */
export function aheadCountFor(ticket, waitingTickets) {
  return waitingTickets.filter(
    (other) => other.joinedAt.getTime() < ticket.joinedAt.getTime()
      || (other.joinedAt.getTime() === ticket.joinedAt.getTime() && other.id < ticket.id),
  ).length;
}

export function branchLivePeople(branch, activeCount) {
  return branch.people + activeCount;
}

/** Estimated minutes until this ticket is served, from branch throughput. */
export function estimateWaitMinutes(branch, ahead, people) {
  const perPerson = Math.max(2, Math.round(branch.wait / Math.max(people, 1)));
  return Math.max(ahead * perPerson, ahead > 0 ? 2 : 0);
}

export function serializeBranch(branch, activeCount = 0) {
  return {
    id: branch.id,
    name: branch.name,
    type: branch.type,
    address: branch.address,
    latitude: branch.latitude,
    longitude: branch.longitude,
    wait: branch.wait,
    people: branchLivePeople(branch, activeCount),
    walkIns: branch.people, // baseline without the live virtual queue (staff console edits this)
    status: branch.status,
    closes: branch.closes,
    accent: branch.accent,
    counters: branch.counters,
    capacity: branch.capacity,
    virtualJoins: branch.virtualJoins,
    operationalStatus: branch.operationalStatus,
    graceMinutes: branch.graceMinutes,
    priorityAccess: branch.priorityAccess,
    updatedMinutes: branch.updatedMinutes,
    dataSource: branch.dataSource,
    servedToday: branch.servedToday,
    // Client recomputes these from the live position (withLiveDistance).
    distance: 0,
    travel: 3,
    unavailableServices: JSON.parse(branch.unavailableServices || "[]"),
    services: branch.services
      ? branch.services.map((service) => ({ name: service.name, duration: service.duration }))
      : [],
    updatedAt: branch.updatedAt.getTime(),
  };
}

export function serializeTicket(ticket, ahead, branch) {
  const people = branch
    ? branchLivePeople(branch, ticket._branchActiveCount ?? 0)
    : undefined;
  return {
    id: ticket.id,
    code: ticket.code,
    branchId: ticket.branchId,
    service: ticket.serviceName,
    status: ticket.status,
    checkedIn: ticket.checkedIn,
    ahead,
    initialAhead: ticket.initialAhead,
    waitMinutes: branch ? estimateWaitMinutes(branch, ahead, people) : null,
    joinedAt: ticket.joinedAt.getTime(),
    calledAt: ticket.calledAt?.getTime() || null,
    completedAt: ticket.completedAt?.getTime() || null,
    savedMinutes: ticket.savedMinutes,
    branch: branch ? branch : undefined,
  };
}

export function serializeNotification(notification) {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    type: notification.type,
    read: notification.read,
    createdAt: notification.createdAt.getTime(),
  };
}

export function serializeVisit(ticket) {
  const branch = ticket.branch;
  const savedMinutes = ticket.savedMinutes ?? Math.max(1, branch?.wait ?? 1);
  const date = ticket.completedAt
    ? ticket.completedAt.toLocaleDateString("en-ZA", { day: "numeric", month: "short", year: "numeric" })
    : "";
  return {
    id: `visit-${ticket.id}`,
    ticketId: ticket.id,
    name: branch?.name || "Service visit",
    service: ticket.serviceName,
    date,
    type: branch?.type || "home-affairs",
    tone: branch?.accent || "teal",
    savedMinutes,
  };
}

export function serialiseStaffTicket(ticket, ahead) {
  return {
    id: ticket.id,
    code: ticket.code,
    status: ticket.status,
    serviceName: ticket.serviceName,
    checkedIn: ticket.checkedIn,
    joinedAt: ticket.joinedAt.getTime(),
    ahead,
    userName: ticket.user?.name || "Citizen",
    userPhone: maskPhone(ticket.user?.phone || ""),
  };
}

export function maskPhone(phone) {
  const digits = phone.replace(/[^0-9]/g, "");
  if (digits.length < 4) return "••••";
  const prefix = phone.startsWith("+") ? `+${digits.slice(0, 2)}` : digits.slice(0, 3);
  return `${prefix} ••• ${digits.slice(-4)}`;
}

export async function notifyUser(userId, title, body, type = "queue") {
  await db.notification.create({ data: { userId, title, body, type } });
}

/** Fire "head to the branch now" alerts for tickets that are next in the virtual queue. */
export async function sendLeaveAlerts(branchId) {
  const waiting = await db.queueTicket.findMany({
    where: { branchId, status: "WAITING", leaveAlertSent: false },
    orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
  });
  for (const ticket of waiting) {
    const virtualAhead = await db.queueTicket.count({
      where: {
        branchId,
        status: "WAITING",
        joinedAt: { lt: ticket.joinedAt },
      },
    });
    if (virtualAhead === 0) {
      await db.queueTicket.update({ where: { id: ticket.id }, data: { leaveAlertSent: true } });
      await notifyUser(
        ticket.userId,
        "Time to head to the branch",
        `You are next in the virtual queue for your service. Check in when you arrive.`,
      );
    }
  }
}
