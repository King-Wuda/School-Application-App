import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE = "sf_admin";
export const ADMIN_MAX_AGE_S = 60 * 60 * 8; // 8 hours

/**
 * Admin cookie format: "<iat>.<hmac>" where hmac = HMAC-SHA256(ADMIN_PASSWORD, iat).
 * We never store the password itself; we verify by recomputing the HMAC and
 * timing-safe comparing. Issued-at is used to enforce expiry.
 */
export function issueAdminToken(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error("ADMIN_PASSWORD is not set");
  const iat = Math.floor(Date.now() / 1000).toString();
  const hmac = createHmac("sha256", secret).update(iat).digest("hex");
  return `${iat}.${hmac}`;
}

export function isAdminAuthed(): boolean {
  const cookie = cookies().get(ADMIN_COOKIE)?.value;
  const secret = process.env.ADMIN_PASSWORD;
  if (!cookie || !secret) return false;

  const [iat, sig] = cookie.split(".");
  if (!iat || !sig) return false;

  const iatNum = Number(iat);
  if (!Number.isFinite(iatNum)) return false;
  const ageS = Math.floor(Date.now() / 1000) - iatNum;
  if (ageS < 0 || ageS > ADMIN_MAX_AGE_S) return false;

  const expected = createHmac("sha256", secret).update(iat).digest();
  let provided: Buffer;
  try {
    provided = Buffer.from(sig, "hex");
  } catch {
    return false;
  }
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

export function verifyAdminPassword(submitted: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  const a = Buffer.from(submitted, "utf8");
  const b = Buffer.from(expected, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
