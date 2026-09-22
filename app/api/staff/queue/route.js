import { db } from "../../../lib/server/db";
import { getSessionUser, unauthorised } from "../../../lib/server/auth";
import {
  ACTIVE_STATUSES,
  aheadCountFor,
  expireOverdueCalls,
  serialiseStaffTicket,
  serializeBranch,
} from "../../../lib/server/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Live queue for one branch, powering the staff console. */
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

  // Same lazy release as /api/state, scoped to this branch so the staff
  // console never shows an already-expired CALLED ticket.
  await expireOverdueCalls(branchId);

  const branch = await db.branch.findUnique({
    where: { id: branchId },
    include: {
      services: true,
      tickets: {
        where: { status: { in: ACTIVE_STATUSES } },
        orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
        include: { user: { select: { name: true, phone: true } } },
      },
    },
  });
  if (!branch) return Response.json({ error: "Branch not found." }, { status: 404 });

  const waiting = branch.tickets.filter((t) => t.status === "WAITING");
  return Response.json({
    branch: serializeBranch(branch, branch.tickets.length),
    tickets: branch.tickets.map((t) => serialiseStaffTicket(t, aheadCountFor(t, waiting))),
    waitingCount: waiting.length,
  });
}
