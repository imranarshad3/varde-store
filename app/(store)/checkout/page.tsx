"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useState } from "react";
import { useStore } from "@/lib/store";
import { placeOrder } from "@/lib/actions";
import { money } from "@/lib/types";

export default function CheckoutPage() {
  const { lines, subtotal, settings, hydrated } = useStore();
  const [delivery, setDelivery] = useState<"standard" | "express">("standard");
  const [state, action, pending] = useActionState(placeOrder, null);

  const shipping = delivery === "express" ? 25 : subtotal >= settings.freeShipping ? 0 : 15;

  if (hydrated && !lines.length)
    return (
      <main className="page"><div className="none">
        <p className="display sm">Your bag is empty.</p>
        <Link href="/shop" className="btn">Continue shopping</Link>
      </div></main>
    );

  return (
    <main className="page checkout">
      <header className="page-hero slim">
        <Link href="/cart" className="ul back">← Back to bag</Link>
        <h1 className="display">Checkout</h1>
      </header>
      <form action={action} className="co-grid">
        <input type="hidden" name="lines" value={JSON.stringify(lines.map((l) => ({ id: l.id, size: l.size, qty: l.qty })))} />
        <div className="co-form">
          <fieldset>
            <legend><span>1</span>Contact</legend>
            <div className="fld full"><label htmlFor="email">Email</label><input id="email" name="email" type="email" required autoComplete="email" /></div>
            <div className="fld full"><label htmlFor="phone">Phone <i>(for delivery updates)</i></label><input id="phone" name="phone" type="tel" autoComplete="tel" /></div>
          </fieldset>
          <fieldset>
            <legend><span>2</span>Delivery address</legend>
            <div className="fld"><label htmlFor="first">First name</label><input id="first" name="first" required autoComplete="given-name" /></div>
            <div className="fld"><label htmlFor="last">Last name</label><input id="last" name="last" required autoComplete="family-name" /></div>
            <div className="fld full"><label htmlFor="line1">Address</label><input id="line1" name="line1" required autoComplete="address-line1" /></div>
            <div className="fld full"><label htmlFor="line2">Apartment, suite <i>(optional)</i></label><input id="line2" name="line2" autoComplete="address-line2" /></div>
            <div className="fld"><label htmlFor="city">City</label><input id="city" name="city" required autoComplete="address-level2" /></div>
            <div className="fld"><label htmlFor="postcode">Postcode</label><input id="postcode" name="postcode" required autoComplete="postal-code" /></div>
            <div className="fld full"><label htmlFor="country">Country</label>
              <select id="country" name="country" defaultValue="Pakistan" autoComplete="country-name">
                {["Pakistan", "United Arab Emirates", "United Kingdom", "United States", "Canada", "Germany", "France", "Saudi Arabia", "Australia"].map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </fieldset>
          <fieldset>
            <legend><span>3</span>Delivery method</legend>
            <div className="opts">
              <label className={delivery === "standard" ? "on" : ""}>
                <input type="radio" name="delivery" value="standard" checked={delivery === "standard"} onChange={() => setDelivery("standard")} />
                <span><b>Standard</b><i>3–5 working days</i></span>
                <em>{subtotal >= settings.freeShipping ? "Complimentary" : "$15"}</em>
              </label>
              <label className={delivery === "express" ? "on" : ""}>
                <input type="radio" name="delivery" value="express" checked={delivery === "express"} onChange={() => setDelivery("express")} />
                <span><b>Express</b><i>1–2 working days</i></span>
                <em>$25</em>
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend><span>4</span>Payment</legend>
            <div className="demo-pay">
              <b>This is a demo store.</b> No payment is taken and no card details are collected. Your order is saved and appears in the admin.
            </div>
          </fieldset>
          {state?.error && <p className="form-err" role="alert">{state.error}</p>}
          <button className="btn big" disabled={pending || !lines.length}>{pending ? "Placing your order…" : `Place order · ${money(subtotal + shipping)}`}</button>
        </div>

        <aside className="summary sticky">
          <h2>In your bag</h2>
          {lines.map((l) => (
            <div className="sum-item" key={l.key}>
              <div className="ti"><Image src={l.p.img} alt="" fill sizes="64px" /><sup>{l.qty}</sup></div>
              <div><b>{l.p.name}</b><span>{l.p.colorName} · {l.size}</span></div>
              <span>{money(l.p.price * l.qty)}</span>
            </div>
          ))}
          <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
          <div className="sum-row"><span>Delivery</span><span>{shipping ? money(shipping) : "Complimentary"}</span></div>
          <div className="sum-row tot"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
        </aside>
      </form>
    </main>
  );
}
