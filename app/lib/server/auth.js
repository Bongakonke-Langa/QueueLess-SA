import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { db } from "./db";

export const SESSION_COOKIE = "queueless_session";
const SESSION_DAYS = 30;

const PHONE_DIGITS = /[^0-9+]/g;

/** Normalise South African mobile numbers to +27XXXXXXXXX format. */
export function normalisePhone(input) {
  const raw = String(input || "").replace(PHONE_DIGITS, "");
  let digits = raw.replace(/\+/g, "");
  if (digits.startsWith("0") && digits.length === 10) {
    digits = `27${digits.slice(1)}`;
  } else if (digits.startsWith("27") && digits.length === 11) {
    // already international without +
  } else {
    return null;
  }
  if (!/^27[6-8][0-9]{8}$/.test(digits)) return null;
  return `+${digits}`;
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    phone: user.phone,
    name: user.name,
    city: user.city,
    province: user.province,
    avatar: user.avatar,
    role: user.role,
    branchId: user.branchId,
  };
}

export async function createSession(userId) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });
  return { token, expiresAt };
}

export function sessionCookieOptions(expiresAt) {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  };
}

/** Resolve the signed-in user from the session cookie, or null. */
export async function getSessionUser() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { token },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await db.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

export function unauthorised() {
  return Response.json({ error: "Sign in to continue." }, { status: 401 });
}
