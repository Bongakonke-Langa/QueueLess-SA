import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { z } from "zod";
import { db } from "../../../lib/server/db";
import { normalisePhone, publicUser } from "../../../lib/server/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ phone: z.string().min(6).max(30) });

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid mobile number." }, { status: 400 });
  }

  const phone = normalisePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json(
      { error: "Enter a valid South African mobile number, e.g. 082 555 0142." },
      { status: 400 },
    );
  }

  // Simple abuse guard: at most 5 codes per number per 10 minutes.
  const recentCount = await db.otpCode.count({
    where: { phone, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
  });
  if (recentCount >= 5) {
    return NextResponse.json(
      { error: "Too many codes requested. Try again in a few minutes." },
      { status: 429 },
    );
  }

  // Any previous code for this number is now void.
  await db.otpCode.updateMany({
    where: { phone, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = String(randomInt(0, 1000000)).padStart(6, "0");
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await db.otpCode.create({ data: { phone, code, expiresAt } });

  // Real SMS delivery is a future integration; until then the code lands in
  // the server console, and on the login screen whenever demo mode is on.
  console.log(`[QueueLess] OTP for ${phone}: ${code} (valid 5 minutes)`);

  const payload = { ok: true };
  if (process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEMO_MODE === "1") {
    payload.devCode = code;
  }
  return NextResponse.json(payload);
}
