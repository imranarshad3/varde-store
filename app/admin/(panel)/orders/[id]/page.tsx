import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { listOrders } from "@/lib/queries";
import { ORDER_STATUSES, money } from "@/lib/types";
import { setStatusAction } from "../../../actions";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const o = (await listOrders()).find((x) => x.id === id);
  if (!o) notFound();
  const a = o.address;

  return (
    <div className="adm-page narrow">
      <header className="adm-head">
        <div>
          <Link href="/admin/orders" className="adm-link sm">← Orders</Link>
          <h1>Order {o.number} <span className={`pill ${o.status}`}>{o.status}</span></h1>
          <p className="adm-muted">{new Date(o.createdAt).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}{o.sample ? " · sample order" : ""}</p>
        </div>
      </header>
      <div className="adm-two wide">
        <section className="adm-card">
          <div className="adm-card-h"><h2>Items</h2></div>
          {o.items.map((i, k) => (
            <div className="oi" key={k}>
              <span className="tl-img"><Image src={i.img} alt="" fill sizes="56px" /></span>
              <div><b>{i.name}</b><div className="adm-muted sm">{i.colorName} · Size {i.size} · {money(i.price)} × {i.qty}</div></div>
              <b className="num">{money(i.price * i.qty)}</b>
            </div>
          ))}
          <div className="otot"><span>Subtotal</span><span>{money(o.subtotal)}</span></div>
          {o.discount > 0 && <div className="otot disc"><span>Discount · {o.discountCode}</span><span>−{money(o.discount)}</span></div>}
          <div className="otot"><span>Delivery · {o.delivery}</span><span>{o.shipping ? money(o.shipping) : "Free"}</span></div>
          <div className="otot big"><span>Total</span><span>{money(o.total)}</span></div>
        </section>
        <div className="stack">
          <section className="adm-card">
            <div className="adm-card-h"><h2>Status</h2></div>
            <form action={setStatusAction} className="statusf">
              <input type="hidden" name="id" value={o.id} />
              <div className="statusbtns">
                {ORDER_STATUSES.map((s) => (
                  <button key={s} name="status" value={s} className={s === o.status ? "on" : ""} aria-pressed={s === o.status}>{s}</button>
                ))}
              </div>
            </form>
            <p className="adm-muted sm">The customer sees this progress in their account.</p>
          </section>
          <section className="adm-card">
            <div className="adm-card-h"><h2>Customer</h2></div>
            <p><b>{o.name}</b><br /><a className="adm-link" href={`mailto:${o.email}`}>{o.email}</a>{o.phone && <><br />{o.phone}</>}</p>
            <h3 className="adm-sub">Ship to</h3>
            <p>{a.line1}{a.line2 && <><br />{a.line2}</>}<br />{a.city} {a.postcode}<br />{a.country}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
