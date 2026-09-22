import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../lib/server/db";
import { getSessionUser, unauthorised } from "../../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const branchSchema = z.object({
  name: z.string().min(3).max(80),
  type: z.enum(["home-affairs", "clinic", "bank"]),
  address: z.string().min(3).max(140),
  latitude: z.number().min(-35).max(-22),
  longitude: z.number().min(16).max(33),
  closes: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/),
  wait: z.number().int().min(0).max(180),
  counters: z.number().int().min(1).max(12),
  capacity: z.number().int().min(5).max(150),
  services: z
    .array(z.object({ name: z.string().min(2).max(80), duration: z.string().min(2).max(40) }))
    .min(1)
    .max(8),
});

function requireAdmin(user) {
  if (!user) return unauthorised();
  if (user.role !== "ADMIN") {
    return NextResponse.json({ error: "Administrator access only." }, { status: 403 });
  }
  return null;
}

/** Branch network overview for the admin console. */
export async function GET() {
  const guard = requireAdmin(await getSessionUser());
  if (guard) return guard;

  const branches = await db.branch.findMany({
    include: {
      services: true,
      staff: { select: { name: true, phone: true } },
      tickets: { where: { status: { in: ["WAITING", "CALLED", "SERVING"] } }, select: { status: true } },
    },
    orderBy: { id: "asc" },
  });

  return NextResponse.json({
    branches: branches.map((branch) => ({
      id: branch.id,
      name: branch.name,
      type: branch.type,
      address: branch.address,
      latitude: branch.latitude,
      longitude: branch.longitude,
      closes: branch.closes,
      wait: branch.wait,
      people: branch.people,
      capacity: branch.capacity,
      counters: branch.counters,
      operationalStatus: branch.operationalStatus,
      virtualJoins: branch.virtualJoins,
      accent: branch.accent,
      activeTickets: branch.tickets.length,
      staff: branch.staff.map((s) => ({ name: s.name, phone: s.phone })),
      services: branch.services.map((s) => ({ name: s.name, duration: s.duration })),
      updatedAt: branch.updatedAt.getTime(),
    })),
  });
}

/** Create a branch in the network. */
export async function POST(request) {
  const guard = requireAdmin(await getSessionUser());
  if (guard) return guard;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = branchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check the branch details — some fields are missing or invalid." }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await db.branch.findUnique({ where: { name: data.name }, select: { id: true } });
  if (existing) {
    return NextResponse.json({ error: "A branch with that exact name already exists." }, { status: 409 });
  }

  const created = await db.branch.create({
    data: {
      name: data.name,
      type: data.type,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      closes: data.closes,
      wait: data.wait,
      counters: data.counters,
      capacity: data.capacity,
      accent: data.type === "clinic" ? "coral" : data.type === "bank" ? "blue" : data.wait > 35 ? "gold" : "teal",
      status: data.wait <= 20 ? "Low wait" : data.wait <= 35 ? "Moderate" : "Busy now",
      priorityAccess: data.type === "clinic",
      services: { create: data.services },
    },
  });

  return NextResponse.json({ branch: { id: created.id, name: created.name } }, { status: 201 });
}
