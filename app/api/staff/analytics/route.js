import { db } from "../../../lib/server/db";
import { getSessionUser, unauthorised } from "../../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Branch analytics for the staff console, computed from data the app already
 * stores (ticket timestamps, statuses, savedMinutes). No new tables.
 *
 * GET /api/staff/analytics?branchId=11 → 200 { branchId, generatedAt, today, history }
 * - today: live counters for the current day (served, no-shows, cancellations,
 *   avg actual wait of completed visits, total minutes saved, no-show rate).
 * - history: per-day totals for the last 14 days (served, no-shows, saved).
 */
export async function GET(request) {
  const user = await getSessionUser();
  if (!user) return unauthorised();
  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    return Response.json({ error: "Branch staff access only." }, { status: 403 });
  }

  const requestedId = Number(new URL(request.url).searchParams.get("branchId"));
  // Staff are locked to their own branch; administrators may inspect any branch.
  const branchId =
    user.role === "ADMIN" && Number.isInteger(requestedId) ? requestedId : user.branchId;
  if (!Number.isInteger(branchId)) {
    return Response.json({ error: "No branch is assigned to this account." }, { status: 400 });
  }
  const branch = await db.branch.findUnique({ where: { id: branchId }, select: { id: true } });
  if (!branch) return Response.json({ error: "Branch not found." }, { status: 404 });

  // Day bounds. Prisma's DateTime filter serialises Date objects to ISO strings,
  // and Postgres `timestamp` columns compare them in the same wall-clock
  // domain the app already writes — so local-midnight Dates are correct here.
  // (The earlier 500s came from passing a "YYYY-MM-DD HH:MM:SS" string, which
  // Prisma rejects: DateTime filters require ISO-8601.)
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const fortnightAgo = new Date(startOfToday);
  fortnightAgo.setDate(fortnightAgo.getDate() - 13);
  const dayKeyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const [served, noShows, cancelled, completedToday] = await Promise.all([
    db.queueTicket.count({ where: { branchId, status: "COMPLETED", completedAt: { gte: startOfToday } } }),
    db.queueTicket.count({ where: { branchId, status: "NO_SHOW" } }),
    db.queueTicket.count({ where: { branchId, status: "CANCELLED" } }),
    db.queueTicket.findMany({
      where: { branchId, status: "COMPLETED", completedAt: { gte: startOfToday } },
      select: { joinedAt: true, completedAt: true, savedMinutes: true },
    }),
  ]);

  const waits = completedToday
    .filter((t) => t.completedAt)
    .map((t) => Math.max(1, Math.round((t.completedAt.getTime() - t.joinedAt.getTime()) / 60000)));
  const avgWaitMinutes = waits.length
    ? Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)
    : 0;
  const savedToday = completedToday.reduce((total, t) => total + (t.savedMinutes ?? 0), 0);
  const closedToday = served + noShows + cancelled;
  const noShowRate = closedToday ? Math.round((noShows / closedToday) * 100) : 0;

  // Last-14-day history, one grouped query.
  const recent = await db.queueTicket.findMany({
    where: {
      branchId,
      status: { in: ["COMPLETED", "NO_SHOW"] },
      OR: [
        { completedAt: { gte: fortnightAgo } },
        { status: "NO_SHOW", joinedAt: { gte: fortnightAgo } },
      ],
    },
    select: { status: true, joinedAt: true, completedAt: true, savedMinutes: true },
  });
  const buckets = new Map();
  for (let i = 0; i < 14; i += 1) {
    const d = new Date(fortnightAgo);
    d.setDate(d.getDate() + i);
    buckets.set(dayKeyOf(d), { day: dayKeyOf(d), served: 0, noShows: 0, savedMinutes: 0 });
  }
  for (const t of recent) {
    const anchor = t.status === "COMPLETED" ? t.completedAt : t.joinedAt;
    if (!anchor) continue;
    const bucket = buckets.get(dayKeyOf(anchor));
    if (!bucket) continue;
    if (t.status === "COMPLETED") {
      bucket.served += 1;
      bucket.savedMinutes += t.savedMinutes ?? 0;
    } else {
      bucket.noShows += 1;
    }
  }

  return Response.json({
    branchId,
    generatedAt: now.getTime(),
    today: {
      served,
      noShows,
      cancelled,
      avgWaitMinutes,
      savedMinutes: savedToday,
      noShowRate,
      visits: completedToday.length,
    },
    history: [...buckets.values()],
  });
}
