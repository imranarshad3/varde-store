import Link from "next/link";
import { listOrders } from "@/lib/queries";
import { ORDER_STATUSES, money } from "@/lib/types";

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = ORDER_STATUSES.includes(sp.status as never) ? sp.status : undefined;
  const [orders, all] = await Promise.all([listOrders(status, sp.q), listOrders()]);
  const counts = Object.fromEntries(ORDER_STATUSES.map((s) => [s, all.filter((o) => o.status === s).length]));

  return (
    <div className="adm-page">
      <header className="adm-head"><div><p className="adm-eyebrow">Sales</p><h1>Orders</h1></div></header>
      <div className="atabs">
        <Link href="/admin/orders" className={!status ? "on" : ""}>All <sup>{all.length}</sup></Link>
        {ORDER_STATUSES.map((s) => <Link key={s} href={`/admin/orders?status=${s}`} className={status === s ? "on" : ""}>{s} <sup>{counts[s]}</sup></Link>)}
      </div>
      <form className="afilters">
        {status && <input type="hidden" name="status" value={status} />}
        <input name="q" defaultValue={sp.q} placeholder="Search order number, name or email…" aria-label="Search orders" />
        <button className="a-btn ghost">Search</button>
      </form>
      <div className="adm-card flush">
        <table className="atable">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Items</th><th>Status</th><th className="num">Total</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><Link href={`/admin/orders/${o.id}`} className="adm-link"><b>{o.number}</b></Link>{o.sample && <span className="tagsm">sample</span>}</td>
                <td>{o.name}<div className="adm-muted sm">{o.email}</div></td>
                <td className="nowrap">{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}<div className="adm-muted sm">{new Date(o.createdAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</div></td>
                <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                <td className="num"><b>{money(o.total)}</b></td>
              </tr>
            ))}
            {!orders.length && <tr><td colSpan={6} className="adm-muted center pad">No orders here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
