import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../lib/server/db";
import { getSessionUser, unauthorised } from "../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const actionSchema = z.object({ action: z.enum(["read-all"]) });

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorised();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  }

  await db.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const user = await getSessionUser();
  if (!user) return unauthorised();
  await db.notification.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
