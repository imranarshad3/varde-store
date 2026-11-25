"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminLogin, adminLogout, requireAdmin } from "@/lib/auth";
import * as q from "@/lib/queries";
import { ORDER_STATUSES, type Category, type OrderStatus } from "@/lib/types";
import type { FormState } from "@/lib/actions";

const refresh = () => revalidatePath("/", "layout");
const str = (f: FormData, k: string, max = 2000) => String(f.get(k) ?? "").trim().slice(0, max);

export async function loginAction(_: FormState, f: FormData): Promise<FormState> {
  const ok = await adminLogin(str(f, "email", 200), String(f.get("password") ?? ""));
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return { error: "Those details don't match the admin login." };
  }
  redirect("/admin");
}

export async function logoutAction() {
  await adminLogout();
  redirect("/admin/login");
}

export async function saveProductAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(f.get("id")) || null;
  const price = Math.round(Number(f.get("price")));
  const stock = Math.round(Number(f.get("stock")));
  const name = str(f, "name", 120);
  if (!name) return { error: "Give the product a name." };
  if (!Number.isFinite(price) || price < 1) return { error: "Price must be at least $1." };
  if (!Number.isFinite(stock) || stock < 0) return { error: "Stock can't be negative." };
  let newId: number;
  try {
    newId = await q.saveProduct(id, {
      name, slug: str(f, "slug", 120), price, stock,
      category: str(f, "category", 20) as Category,
      color: str(f, "color", 9) || "#cccccc",
      colorName: str(f, "colorName", 40),
      img: str(f, "img", 200),
      lookId: Number(f.get("lookId")) || 0,
      description: str(f, "description"),
      material: str(f, "material", 200),
      care: str(f, "care", 400),
      published: f.get("published") === "on",
    });
  } catch (e) {
    return { error: e instanceof Error && /unique/i.test(e.message) ? "That URL slug is already used by another product." : "Couldn't save. Is the database connected?" };
  }
  refresh();
  if (!id) redirect(`/admin/products/${newId}?saved=1`);
  return { ok: true, message: "Saved. The store is updated." };
}

export async function deleteProductAction(f: FormData) {
  await requireAdmin();
  await q.deleteProduct(Number(f.get("id")));
  refresh();
  redirect("/admin/products?deleted=1");
}

export async function quickStockAction(f: FormData) {
  await requireAdmin();
  const p = await q.getProductById(Number(f.get("id")));
  if (!p) return;
  const stock = Math.max(0, Math.round(Number(f.get("stock"))));
  await q.saveProduct(p.id, { ...p, stock });
  refresh();
}

export async function setStatusAction(f: FormData) {
  await requireAdmin();
  const status = String(f.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return;
  await q.setOrderStatus(Number(f.get("id")), status);
  refresh();
}

export async function markMessageAction(f: FormData) {
  await requireAdmin();
  await q.markMessage(Number(f.get("id")), f.get("read") === "1");
  revalidatePath("/admin", "layout");
}

export async function deleteMessageAction(f: FormData) {
  await requireAdmin();
  await q.deleteMessage(Number(f.get("id")));
  revalidatePath("/admin", "layout");
}

export async function saveSettingsAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const announcements = str(f, "announcements", 2000).split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 8);
  const freeShipping = Math.max(0, Math.round(Number(f.get("freeShipping"))));
  if (!announcements.length) return { error: "Add at least one announcement line." };
  await q.saveSettings({ announcements, freeShipping });
  refresh();
  return { ok: true, message: "Settings saved. The store is updated." };
}

export async function clearSampleAction() {
  await requireAdmin();
  await q.clearSampleData();
  refresh();
  redirect("/admin/settings?cleared=1");
}

/* ---------- discounts ---------- */
export async function createDiscountAction(_: FormState, f: FormData): Promise<FormState> {
  await requireAdmin();
  const code = str(f, "code", 30).toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  const kind = f.get("kind") === "fixed" ? "fixed" : "percent";
  const value = Math.round(Number(f.get("value")));
  const minSubtotal = Math.max(0, Math.round(Number(f.get("minSubtotal")) || 0));
  const maxUses = str(f, "maxUses") ? Math.max(1, Math.round(Number(f.get("maxUses")))) : null;
  const expires = str(f, "expiresAt", 20);
  if (code.length < 3) return { error: "Codes need at least 3 letters or numbers." };
  if (!(value > 0) || (kind === "percent" && value > 90)) return { error: kind === "percent" ? "Percent must be between 1 and 90." : "Amount must be at least $1." };
  try {
    await q.createDiscount({ code, kind, value, minSubtotal, maxUses, expiresAt: expires ? new Date(expires + "T23:59:59").toISOString() : null });
  } catch {
    return { error: `A code called ${code} already exists.` };
  }
  revalidatePath("/admin/discounts");
  return { ok: true, message: `${code} is live. Customers can use it at checkout now.` };
}

export async function toggleDiscountAction(f: FormData) {
  await requireAdmin();
  await q.setDiscountActive(String(f.get("code")), f.get("active") === "1");
  revalidatePath("/admin/discounts");
}

export async function deleteDiscountAction(f: FormData) {
  await requireAdmin();
  await q.deleteDiscount(String(f.get("code")));
  revalidatePath("/admin/discounts");
}

/* ---------- reviews ---------- */
export async function reviewAction(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const op = String(f.get("op"));
  if (op === "delete") await q.deleteReview(id);
  else await q.setReviewApproved(id, op === "approve");
  refresh();
}
