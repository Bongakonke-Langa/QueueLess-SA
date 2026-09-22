import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "../../../lib/server/db";
import {
  createSession,
  normalisePhone,
  publicUser,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "../../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  phone: z.string().min(6).max(30),
  code: z.string().regex(/^[0-9]{6}$/, "Enter the 6-digit code."),
  name: z.string().max(80).optional(),
});

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter the 6-digit code from your messages." }, { status: 400 });
  }

  const phone = normalisePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Enter a valid South African mobile number." }, { status: 400 });
  }

  const otp = await db.otpCode.findFirst({
    where: { phone, code: parsed.data.code, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) {
    return NextResponse.json({ error: "That code is not valid or has expired. Request a new one." }, { status: 401 });
  }
  await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

  let user = await db.user.findUnique({ where: { phone } });
  if (!user) {
    const carriedName = parsed.data.name?.trim() || "";
    user = await db.user.create({
      data: { phone, name: carriedName },
    });
  }

  const { token, expiresAt } = await createSession(user.id);
  const response = NextResponse.json({ user: publicUser(user) });
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions(expiresAt));
  return response;
}
