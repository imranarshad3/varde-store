"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import { money } from "@/lib/types";
import BagLines from "@/components/BagLines";
import Rail from "@/components/Rail";

export default function CartPage() {
  const { lines, subtotal, settings, hydrated, catalog } = useStore();
  const shipping = subtotal >= settings.freeShipping || !subtotal ? 0 : 15;
  const inBag = new Set(lines.map((l) => l.id));
  const recs = catalog.filter((p) => !inBag.has(p.id) && p.stock > 0).slice(8, 18);

  return (
    <main className="page cart">
      <header className="page-hero">
        <p className="eyebrow">Your selection</p>
        <h1 className="display">Shopping bag</h1>
      </header>
      {!hydrated ? null : lines.length === 0 ? (
        <div className="none">
          <p className="display sm">Your bag is empty.</p>
          <Link href="/shop" className="btn">Discover the collection</Link>
        </div>
      ) : (
        <div className="cart-grid">
          <BagLines big />
          <aside className="summary">
            <h2>Order summary</h2>
            <div className="sum-row"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="sum-row"><span>Standard delivery</span><span>{shipping ? money(shipping) : "Complimentary"}</span></div>
            {shipping > 0 && <p className="sum-note">Add {money(settings.freeShipping - subtotal)} more for complimentary delivery.</p>}
            <div className="sum-row tot"><span>Total</span><span>{money(subtotal + shipping)}</span></div>
            <Link href="/checkout" className="btn big">Proceed to checkout</Link>
            <ul className="pv-perks"><li>Secure checkout</li><li>365-day free returns</li><li>Free repairs for life</li></ul>
          </aside>
        </div>
      )}
      {recs.length > 0 && (
        <section className="sec">
          <div className="sec-head"><div><p className="eyebrow">Before you go</p><h2 className="h2">You might also love</h2></div></div>
          <Rail products={recs} />
        </section>
      )}
    </main>
  );
}
