import { NextResponse } from "next/server";
import { db } from "../../../lib/server/db";
import { getSessionUser, unauthorised } from "../../../lib/server/auth";
import { resetDemoState } from "../../../lib/server/demoData";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Restore the operations demo to its opening state.
 *
 * Available to any signed-in user while demo mode is on, and to staff/admin
 * accounts otherwise, so a presenter can reset between runs without needing
 * the administrator login.
 */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return unauthorised();

  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "1";
  const isStaff = user.role === "STAFF" || user.role === "ADMIN";
  if (!demoMode && !isStaff) {
    return NextResponse.json({ error: "Demo mode is off, so demo data cannot be reset." }, { status: 403 });
  }

  const summary = await resetDemoState(db);

  return NextResponse.json({
    ok: true,
    message: `Demo reset: ${summary.ticketsReleased} ticket${summary.ticketsReleased === 1 ? "" : "s"} released, ${summary.appointmentsCancelled} appointment${summary.appointmentsCancelled === 1 ? "" : "s"} cancelled, ${summary.branchesReset} branches restored.`,
    ...summary,
  });
}
