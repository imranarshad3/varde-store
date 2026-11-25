"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasDb } from "./db";
import { discountAmount } from "./types";
import * as q from "./queries";
import { checkPassword, customerLogout, hashPassword, setCustomer } from "./auth";

export type FormState = { ok?: boolean; error?: string; message?: string } | null;

const s = (f: FormData, k: string, max = 300) => String(f.get(k) ?? "").trim().slice(0, max);
const isEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
const NO_DB = "The store database isn't connected yet, so this can't be saved. Please try again soon.";

/* ---------- checkout ---------- */
export async function placeOrder(_: FormState, f: FormData): Promise<FormState> {
  if (!hasDb) return { error: NO_DB };
  const email = s(f, "email");
  const name = `${s(f, "first", 80)} ${s(f, "last", 80)}`.trim();
  const address = { line1: s(f, "line1"), line2: s(f, "line2"), city: s(f, "city", 100), postcode: s(f, "postcode", 20), country: s(f, "country", 60) };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (!name || !address.line1 || !address.city || !address.postcode || !address.country) return { error: "Please complete your delivery address." };
  let lines: { id: number; size: string; qty: number }[] = [];
  try { lines = JSON.parse(String(f.get("lines") || "[]")); } catch {}
  let number: string;
  try {
    const order = await q.createOrder({
      email, name, phone: s(f, "phone", 40), address,
      delivery: f.get("delivery") === "express" ? "express" : "standard",
      lines: lines.slice(0, 30).map((l) => ({ id: Number(l.id), size: String(l.size), qty: Number(l.qty) })),
      code: s(f, "code", 40) || undefined,
    });
    number = order.number;
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Something went wrong placing your order." };
  }
  redirect(`/checkout/success/${number}?e=${encodeURIComponent(email)}`);
}

/* ---------- contact & newsletter ---------- */
export async function sendMessage(_: FormState, f: FormData): Promise<FormState> {
  const m = { name: s(f, "name", 100), email: s(f, "email"), subject: s(f, "subject", 120), body: s(f, "body", 4000) };
  if (!m.name || !isEmail(m.email) || m.body.length < 5) return { error: "Please add your name, a valid email and a message." };
  if (!hasDb) return { error: NO_DB };
  await q.createMessage(m);
  return { ok: true, message: "Thank you. We reply within one working day." };
}

export async function joinNewsletter(_: FormState, f: FormData): Promise<FormState> {
  const email = s(f, "email");
  if (!isEmail(email)) return { error: "Please enter a valid email." };
  if (!hasDb) return { error: NO_DB };
  await q.subscribe(email);
  return { ok: true, message: "You're on the list. Welcome to VARDE." };
}

/* ---------- customer accounts ---------- */
export async function register(_: FormState, f: FormData): Promise<FormState> {
  const email = s(f, "email").toLowerCase(), name = s(f, "name", 100), pw = String(f.get("password") ?? "");
  if (!name || !isEmail(email)) return { error: "Please add your name and a valid email." };
  if (pw.length < 8) return { error: "Use at least 8 characters for your password." };
  if (!hasDb) return { error: NO_DB };
  const existing = await q.findCustomer(email);
  if (existing?.password_hash) return { error: "An account with this email already exists. Sign in instead." };
  const id = await q.createCustomer(email, name, hashPassword(pw));
  if (!id) return { error: "Couldn't create the account. Please try again." };
  await setCustomer(id);
  redirect("/account");
}

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const email = s(f, "email").toLowerCase(), pw = String(f.get("password") ?? "");
  if (!hasDb) return { error: NO_DB };
  const c = await q.findCustomer(email);
  if (!c || !checkPassword(pw, c.password_hash)) return { error: "That email and password don't match." };
  await setCustomer(c.id);
  redirect("/account");
}

export async function logout() {
  await customerLogout();
  redirect("/account");
}

/* ---------- discount codes ---------- */
export type CodeResult = { ok: true; code: string; discount: number; label: string } | { ok: false; error: string };

export async function checkCode(code: string, subtotal: number): Promise<CodeResult> {
  const c = code.trim().slice(0, 40);
  if (!c) return { ok: false, error: "Enter a code." };
  if (!hasDb) return { ok: false, error: NO_DB };
  const d = await q.findDiscount(c);
  if (!d) return { ok: false, error: "That code doesn't exist." };
  const why = q.discountProblem(d, subtotal);
  if (why) return { ok: false, error: why };
  return { ok: true, code: d.code, discount: discountAmount(d, subtotal), label: d.kind === "percent" ? `${d.value}% off` : `$${d.value} off` };
}

/* ---------- reviews ---------- */
export async function submitReview(_: FormState, f: FormData): Promise<FormState> {
  const productId = Number(f.get("productId"));
  const rating = Math.round(Number(f.get("rating")));
  const r = { productId, rating, name: s(f, "name", 60), email: s(f, "email"), title: s(f, "title", 100), body: s(f, "body", 2000) };
  if (!r.name || !isEmail(r.email)) return { error: "Please add your name and a valid email." };
  if (!(rating >= 1 && rating <= 5)) return { error: "Please choose a star rating." };
  if (r.body.length < 10) return { error: "Please write a few more words about the piece." };
  if (!hasDb) return { error: NO_DB };
  await q.createReview(r);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Thank you. Your review will appear once our team has checked it." };
}

/* ---------- back-in-stock waitlist ---------- */
export async function waitlistAction(_: FormState, f: FormData): Promise<FormState> {
  const email = s(f, "email");
  if (!isEmail(email)) return { error: "Please enter a valid email." };
  if (!hasDb) return { error: NO_DB };
  await q.joinWaitlist(Number(f.get("productId")), email);
  return { ok: true, message: "You're on the list. We'll email you the moment it's back." };
}
