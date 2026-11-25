import { isAdmin } from "@/lib/auth";
import { listOrders } from "@/lib/queries";

export const dynamic = "force-dynamic";

/** Download every order (or one status) as CSV for spreadsheets and accounting. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return new Response("Not signed in", { status: 401 });
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  const orders = await listOrders(status || undefined);
  // quote every cell; neutralise leading = + - @ so spreadsheets don't run them as formulas
  const cell = (v: unknown) => {
    let s = String(v ?? "");
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const head = ["Order", "Date", "Status", "Name", "Email", "Phone", "Items", "Units", "Subtotal", "Discount", "Code", "Delivery", "Shipping", "Total", "Address", "City", "Postcode", "Country", "Sample"];
  const rows = orders.map((o) => [
    o.number, o.createdAt, o.status, o.name, o.email, o.phone,
    o.items.map((i) => `${i.name} (${i.size}) x${i.qty}`).join("; "),
    o.items.reduce((s, i) => s + i.qty, 0),
    o.subtotal, o.discount, o.discountCode ?? "", o.delivery, o.shipping, o.total,
    [o.address.line1, o.address.line2].filter(Boolean).join(", "), o.address.city, o.address.postcode, o.address.country,
    o.sample ? "yes" : "",
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const day = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="varde-orders-${status ?? "all"}-${day}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
