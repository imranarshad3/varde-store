import Link from "next/link";
import { listCustomers, subscriberCount } from "@/lib/queries";
import { money } from "@/lib/types";

export default async function Customers() {
  const [list, subs] = await Promise.all([listCustomers(), subscriberCount()]);
  const total = list.reduce((s, c) => s + (c.spent ?? 0), 0);
  return (
    <div className="adm-page">
      <header className="adm-head"><div><p className="adm-eyebrow">People</p><h1>Customers</h1></div></header>
      <section className="kpis three">
        <div className="kpi"><span>Customers</span><b>{list.length}</b></div>
        <div className="kpi"><span>Lifetime revenue</span><b>{money(total)}</b></div>
        <div className="kpi"><span>Newsletter</span><b>{subs}</b></div>
      </section>
      <div className="adm-card flush">
        <table className="atable">
          <thead><tr><th>Customer</th><th>Joined</th><th>Orders</th><th className="num">Spent</th></tr></thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id}>
                <td><div className="prod-cell"><span className="avatar">{(c.name || c.email).slice(0, 1).toUpperCase()}</span><div><b>{c.name || "No name"}</b><div className="adm-muted sm">{c.email}</div></div></div></td>
                <td>{new Date(c.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td>{c.orders ? <Link className="adm-link" href={`/admin/orders?q=${encodeURIComponent(c.email)}`}>{c.orders}</Link> : 0}</td>
                <td className="num"><b>{money(c.spent ?? 0)}</b></td>
              </tr>
            ))}
            {!list.length && <tr><td colSpan={4} className="adm-muted center pad">No customers yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
