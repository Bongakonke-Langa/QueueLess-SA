import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../lib/server/db";
import { getSessionUser, unauthorised } from "../../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  branchId: z.number().int().positive(),
  wait: z.number().int().min(0).max(180),
  people: z.number().int().min(0).max(200),
  counters: z.number().int().min(1).max(12),
  capacity: z.number().int().min(5).max(150),
  operationalStatus: z.enum(["open", "paused", "closed"]),
  virtualJoins: z.boolean(),
  graceMinutes: z.number().int().min(5).max(30),
  priorityAccess: z.boolean(),
  unavailableServices: z.array(z.string().min(1).max(80)).max(12),
});

/** Publish branch operating settings; instantly notifies queued citizens on joins-closed transitions. */
export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorised();
  if (user.role !== "STAFF" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Branch staff access only." }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Some branch settings are out of range." }, { status: 400 });
  }
  const settings = parsed.data;

  if (user.role !== "ADMIN" && user.branchId !== settings.branchId) {
    return NextResponse.json({ error: "You can only manage your own branch." }, { status: 403 });
  }

  const branch = await db.branch.findUnique({
    where: { id: settings.branchId },
    select: { id: true, name: true, operationalStatus: true, virtualJoins: true },
  });
  if (!branch) return NextResponse.json({ error: "Branch not found." }, { status: 404 });

  const { branchId, ...fields } = settings;
  const updated = await db.branch.update({
    where: { id: branchId },
    data: {
      ...fields,
      unavailableServices: JSON.stringify(fields.unavailableServices),
    },
  });

  // Queued citizens must hear immediately when their remote place stops being usable.
  const joinsClosed = fields.operationalStatus !== "open" || fields.virtualJoins === false;
  const joinsWereOpen = branch.operationalStatus === "open" && branch.virtualJoins === true;
  if (joinsClosed && joinsWereOpen) {
    const reason =
      fields.operationalStatus === "closed"
        ? "The branch has closed for today."
        : "The branch has paused its virtual queue.";
    const waiting = await db.queueTicket.findMany({
      where: { branchId, status: "WAITING" },
      select: { userId: true },
    });
    await db.notification.createMany({
      data: waiting.map((t) => ({
        userId: t.userId,
        title: "Queue update",
        body: `${branch.name}: ${reason} Please speak to branch staff about your ticket.`,
        type: "branch",
      })),
    });
  }

  return NextResponse.json({ branch: { id: updated.id, updatedAt: updated.updatedAt.getTime() } });
}
