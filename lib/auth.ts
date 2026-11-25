import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";

const ADMIN_COOKIE = "varde_admin";
const CUSTOMER_COOKIE = "varde_c";
const WEEK = 60 * 60 * 24 * 7;

function secret() {
  // A dedicated SESSION_SECRET is best; otherwise derive one from values only the server knows.
  return (
    process.env.SESSION_SECRET ||
    createHash("sha256")
      .update(`${process.env.ADMIN_PASSWORD ?? ""}|${process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? ""}|varde`)
      .digest("hex")
  );
}

const sign = (payload: string) => {
  const mac = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${Buffer.from(payload).toString("base64url")}.${mac}`;
};

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const [b, mac] = token.split(".");
  if (!b || !mac) return null;
  const payload = Buffer.from(b, "base64url").toString();
  const expect = createHmac("sha256", secret()).update(payload).digest("base64url");
  const a = Buffer.from(mac), e = Buffer.from(expect);
  if (a.length !== e.length || !timingSafeEqual(a, e)) return null;
  const exp = Number(payload.split("|").pop());
  return Number.isFinite(exp) && exp > Date.now() ? payload : null;
}

const safeEq = (x: string, y: string) => {
  const a = createHash("sha256").update(x).digest(), b = createHash("sha256").update(y).digest();
  return timingSafeEqual(a, b);
};

const cookieOpts = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: WEEK };

/* ---------------- admin ---------------- */
export const adminConfigured = () => Boolean(process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD);

export async function adminLogin(email: string, password: string) {
  if (!adminConfigured()) return false;
  const ok = safeEq(email.trim().toLowerCase(), process.env.ADMIN_EMAIL!.trim().toLowerCase()) && safeEq(password, process.env.ADMIN_PASSWORD!);
  if (!ok) return false;
  (await cookies()).set(ADMIN_COOKIE, sign(`admin|${Date.now() + WEEK * 1000}`), cookieOpts);
  return true;
}

export async function isAdmin() {
  if (!adminConfigured()) return false;
  return verify((await cookies()).get(ADMIN_COOKIE)?.value)?.startsWith("admin|") ?? false;
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/login");
}

export async function adminLogout() {
  (await cookies()).delete(ADMIN_COOKIE);
}

/* ---------------- customers ---------------- */
export function hashPassword(pw: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(pw, salt, 32).toString("hex")}`;
}
export function checkPassword(pw: string, stored: string | null) {
  if (!stored) return false;
  const [salt, hash] = stored.split(":");
  const got = scryptSync(pw, salt, 32);
  const want = Buffer.from(hash, "hex");
  return got.length === want.length && timingSafeEqual(got, want);
}
export async function setCustomer(id: number) {
  (await cookies()).set(CUSTOMER_COOKIE, sign(`c|${id}|${Date.now() + WEEK * 4 * 1000}`), { ...cookieOpts, maxAge: WEEK * 4 });
}
export async function customerId(): Promise<number | null> {
  const p = verify((await cookies()).get(CUSTOMER_COOKIE)?.value);
  return p?.startsWith("c|") ? Number(p.split("|")[1]) : null;
}
export async function customerLogout() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}
