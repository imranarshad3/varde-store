import Image from "next/image";
import Link from "next/link";
import { dashboard, subscriberCount } from "@/lib/queries";
import { money } from "@/lib/types";
import RevenueChart from "./RevenueChart";

export default async function Dashboard() {
  const [d, subs] = await Promise.all([dashboard(), subscriberCount()]);
  const now = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  if (!d)
    return (
      <div className="adm-page">
        <header className="adm-head"><div><p className="adm-eyebrow">{now}</p><h1>Dashboard</h1></div></header>
        <p className="adm-muted">Connect the database to see sales, orders and customers here.</p>
      </div>
    );

  const change = d.revPrev7 ? Math.round(((d.rev7 - d.revPrev7) / d.revPrev7) * 100) : null;
  const aov = d.orders ? Math.round(d.revenue / d.orders) : 0;

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div><p className="adm-eyebrow">{now}</p><h1>Good day. Here&apos;s the studio.</h1></div>
        <Link href="/admin/products/new" className="a-btn">+ New product</Link>
      </header>

      <section className="kpis">
        <div className="kpi feature">
          <span>Revenue · last 30 days</span>
          <b>{money(d.revenue)}</b>
          <em className={change != null && change < 0 ? "down" : "up"}>
            {change == null ? "No sales in the week before" : `${change >= 0 ? "▲" : "▼"} ${Math.abs(change)}% this week vs last`}
          </em>
        </div>
        <div className="kpi"><span>Orders · 30 days</span><b>{d.orders}</b><em>{money(aov)} average order</em></div>
        <Link href="/admin/orders?status=paid" className="kpi link"><span>To ship</span><b>{d.toShip}</b><em>Paid or pending →</em></Link>
        <Link href="/admin/customers" className="kpi link"><span>Customers</span><b>{d.customers}</b><em>{subs} newsletter subscribers</em></Link>
      </section>

      <section className="adm-card">
        <div className="adm-card-h"><h2>Daily revenue</h2><span className="adm-muted">Last 30 days, cancelled orders excluded</span></div>
        <RevenueChart days={d.days} />
      </section>

      <div className="adm-two">
        <section className="adm-card">
          <div className="adm-card-h"><h2>Recent orders</h2><Link href="/admin/orders" className="adm-link">View all →</Link></div>
          <table className="atable">
            <tbody>
              {d.recent.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/orders/${o.id}`} className="adm-link"><b>{o.number}</b></Link><div className="adm-muted sm">{o.name}</div></td>
                  <td><span className={`pill ${o.status}`}>{o.status}</span></td>
                  <td className="num">{money(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="adm-card">
          <div className="adm-card-h"><h2>Best sellers</h2><span className="adm-muted">30 days</span></div>
          <ul className="toplist">
            {d.top.map((t, i) => (
              <li key={t.name}>
                <span className="tl-r">{i + 1}</span>
                <span className="tl-img"><Image src={t.img} alt="" fill sizes="44px" /></span>
                <span className="tl-n">{t.name}<i>{t.units} sold</i></span>
                <b>{money(t.revenue)}</b>
              </li>
            ))}
            {!d.top.length && <li className="adm-muted">No sales yet.</li>}
          </ul>
          {d.low.length > 0 && (
            <>
              <div className="adm-card-h mt"><h2>Low stock</h2><Link href="/admin/products?sort=stock" className="adm-link">Restock →</Link></div>
              <ul className="toplist">
                {d.low.map((p) => (
                  <li key={p.id}>
                    <span className="tl-img"><Image src={p.img} alt="" fill sizes="44px" /></span>
                    <Link href={`/admin/products/${p.id}`} className="tl-n adm-link">{p.name}</Link>
                    <span className={`stock ${p.stock === 0 ? "out" : "low"}`}>{p.stock} left</span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
      {d.unread > 0 && <Link href="/admin/messages" className="adm-note">You have {d.unread} unread message{d.unread > 1 ? "s" : ""} from customers →</Link>}
    </div>
  );
}
