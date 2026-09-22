import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../../lib/server/db";
import { getSessionUser, unauthorised } from "../../../../lib/server/auth";
import { ACTIVE_STATUSES } from "../../../../lib/server/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const updateSchema = z.object({
  name: z.string().min(3).max(80).optional(),
  type: z.enum(["home-affairs", "clinic", "bank"]).optional(),
  address: z.string().min(3).max(140).optional(),
  latitude: z.number().min(-35).max(-22).optional(),
  longitude: z.number().min(16).max(33).optional(),
  closes: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  wait: z.number().int().min(0).max(180).optional(),
  counters: z.number().int().min(1).max(12).optional(),
  capacity: z.number().int().min(5).max(150).optional(),
  services: z
    .array(z.object({ name: z.string().min(2).max(80), duration: z.string().min(2).max(40) }))
    .min(1)
    .max(8)
    .optional(),
});

function requireAdmin(user) {
  if (!user) return unauthorised();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access only." }, { status: 403 });
  }
  return null;
}

/** Update one branch; replacing services wipes and recreates the catalogue. */
export async function PATCH(request, context) {
  const guard = requireAdmin(await getSessionUser());
  if (guard) return guard;

  const { id } = await context.params;
  const branchId = Number(id);
  if (!Number.isInteger(branchId)) {
    return NextResponse.json({ error: "Invalid branch." }, { status: 400 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the branch details — some fields are missing or invalid." }, { status: 400 });
  }
  const { services, ...fields } = parsed.data;

  const branch = await db.branch.findUnique({ where: { id: branchId }, select: { id: true } });
  if (!branch) return NextResponse.json({ error: "Branch not found." }, { status: 404 });

  const updated = await db.branch.update({
    where: { id: branchId },
    data: {
      ...fields,
      ...(fields.wait !== undefined
        ? { status: fields.wait <= 20 ? "Low wait" : fields.wait <= 35 ? "Moderate" : "Busy now" }
        : {}),
      ...(services ? { services: { deleteMany: {}, create: services } } : {}),
    },
  });

  return NextResponse.json({ branch: { id: updated.id, name: updated.name } });
}

/** Retire a branch; refused while citizens are still actively queued. */
export async function DELETE(request, context) {
  const guard = requireAdmin(await getSessionUser());
  if (guard) return guard;

  const { id } = await context.params;
  const branchId = Number(id);
  if (!Number.isInteger(branchId)) {
    return NextResponse.json({ error: "Invalid branch." }, { status: 400 });
  }

  const branch = await db.branch.findUnique({
    where: { id: branchId },
    include: { tickets: { where: { status: { in: ACTIVE_STATUSES } }, select: { id: true } } },
  });
  if (!branch) return NextResponse.json({ error: "Branch not found." }, { status: 404 });
  if (branch.tickets.length) {
    return NextResponse.json(
      { error: `${branch.tickets.length} citizen${branch.tickets.length === 1 ? " is" : "s are"} still queued here. Serve or release them first.` },
      { status: 409 },
    );
  }

  await db.branch.delete({ where: { id: branchId } });
  return NextResponse.json({ ok: true });
}
