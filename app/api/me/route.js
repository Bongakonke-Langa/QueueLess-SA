import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../lib/server/db";
import { getSessionUser, publicUser, unauthorised } from "../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const patchSchema = z.object({
  name: z.string().min(1).max(80),
  city: z.string().min(1).max(60),
  province: z.string().min(1).max(60),
  avatar: z.string().max(500000).optional().default(""),
});

export async function GET() {
  const user = await getSessionUser();
  if (!user) return unauthorised();
  return NextResponse.json({ user: publicUser(user) });
}

export async function PATCH(request) {
  const user = await getSessionUser();
  if (!user) return unauthorised();

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Check your details and try again." }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: parsed.data,
  });
  return NextResponse.json({ user: publicUser(updated) });
}
