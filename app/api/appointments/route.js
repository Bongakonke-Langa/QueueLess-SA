import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../lib/server/db";
import { getSessionUser, unauthorised } from "../../lib/server/auth";
import { notifyUser, serializeBranch } from "../../lib/server/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bookSchema = z.object({
  branchId: z.number().int().positive(),
  serviceName: z.string().min(1).max(120),
  day: z.enum(["today", "tomorrow"]),
  time: z.string().regex(/^([01][0-9]|2[0-3]):[0-5][0-9]$/, "Choose a valid time."),
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
  const parsed = bookSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Choose a day and time for the appointment." }, { status: 400 });
  }

  const branch = await db.branch.findUnique({
    where: { id: parsed.data.branchId },
    include: { services: true },
  });
  if (!branch) return NextResponse.json({ error: "That branch could not be found." }, { status: 404 });

  const service = branch.services.find((item) => item.name === parsed.data.serviceName);
  if (!service) {
    return NextResponse.json({ error: "Choose one of the services offered at this branch." }, { status: 400 });
  }

  const [hours, minutes] = parsed.data.time.split(":").map(Number);
  const slotAt = new Date();
  if (parsed.data.day === "tomorrow") slotAt.setDate(slotAt.getDate() + 1);
  slotAt.setHours(hours, minutes, 0, 0);

  const appointment = await db.appointment.create({
    data: {
      userId: user.id,
      branchId: branch.id,
      serviceName: service.name,
      slotAt,
    },
    include: { branch: { include: { services: true } } },
  });

  await notifyUser(
    user.id,
    "Appointment confirmed",
    `${parsed.data.day === "today" ? "Today" : "Tomorrow"} at ${parsed.data.time} · ${branch.name}.`,
  );

  return NextResponse.json({
    appointment: {
      id: appointment.id,
      service: appointment.serviceName,
      slotAt: appointment.slotAt.getTime(),
      status: appointment.status,
      branch: serializeBranch(appointment.branch, 0),
    },
  });
}

export async function DELETE(request) {
  const user = await getSessionUser();
  if (!user) return unauthorised();
  const { searchParams } = new URL(request.url);
  const id = Number(searchParams.get("id"));
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid appointment." }, { status: 400 });
  }
  const result = await db.appointment.updateMany({
    where: { id, userId: user.id, status: "CONFIRMED" },
    data: { status: "CANCELLED" },
  });
  if (!result.count) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
