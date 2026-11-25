import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderByNumber } from "@/lib/queries";
import { money } from "@/lib/types";
import ClearBag from "@/components/ClearBag";

export const metadata = { title: "Thank you · VARDE" };

export default async function Success({ params, searchParams }: { params: Promise<{ number: string }>; searchParams: Promise<{ e?: string }> }) {
  const [{ number }, { e }] = await Promise.all([params, searchParams]);
  const order = await getOrderByNumber(number);
  // only show order details to someone who knows the email it was placed with
  if (!order || !e || e.toLowerCase() !== order.email.toLowerCase()) notFound();
  return (
    <main className="page success">
      <ClearBag />
      <div className="succ-card">
        <div className="tick" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="1.2" /><path d="M15 27l7 7 15-16" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg></div>
        <p className="eyebrow">Order {order.number}</p>
        <h1 className="display">Thank you, {order.name.split(" ")[0]}.</h1>
        <p className="lead">Your order is confirmed. We&apos;ll email {order.email} when it ships.</p>
        <div className="succ-items">
          {order.items.map((i, k) => (
            <div className="sum-item" key={k}>
              <div className="ti"><Image src={i.img} alt="" fill sizes="64px" /><sup>{i.qty}</sup></div>
              <div><b>{i.name}</b><span>{i.colorName} · {i.size}</span></div>
              <span>{money(i.price * i.qty)}</span>
            </div>
          ))}
          <div className="sum-row"><span>Delivery ({order.delivery})</span><span>{order.shipping ? money(order.shipping) : "Complimentary"}</span></div>
          <div className="sum-row tot"><span>Total</span><span>{money(order.total)}</span></div>
        </div>
        <p className="succ-addr">Delivering to {order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city} {order.address.postcode}, {order.address.country}</p>
        <div className="succ-ctas">
          <Link href="/shop" className="btn">Continue shopping</Link>
          <Link href="/account" className="btn ghost">Track in your account</Link>
        </div>
      </div>
    </main>
  );
}
