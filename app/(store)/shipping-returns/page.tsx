import Link from "next/link";

export const metadata = { title: "Shipping & returns · VARDE" };

export default function Shipping() {
  return (
    <main className="page prose-page">
      <header className="page-hero">
        <p className="eyebrow">Help</p>
        <h1 className="display">Shipping &amp; <em>returns</em></h1>
      </header>
      <div className="cards3">
        <div className="info-card"><h3>Standard</h3><p className="big">$15</p><p>3–5 working days. Complimentary on orders over $300.</p></div>
        <div className="info-card"><h3>Express</h3><p className="big">$25</p><p>1–2 working days, tracked and signed for.</p></div>
        <div className="info-card"><h3>Returns</h3><p className="big">365 days</p><p>Free returns on unworn pieces with tags attached.</p></div>
      </div>
      <article className="prose">
        <h2>Dispatch</h2>
        <p>Orders placed before 14:00 on a working day are packed the same day. You&apos;ll receive an email with tracking as soon as your parcel leaves the studio.</p>
        <h2>Packaging</h2>
        <p>Everything ships in recycled, recyclable card with tissue made from forestry offcuts. No plastic, no glossy inserts.</p>
        <h2>How to return</h2>
        <p>Contact us with your order number and we&apos;ll send a prepaid label. Refunds go back to your original payment method within five working days of the parcel reaching us.</p>
        <h2>Repairs</h2>
        <p>Every VARDE coat and knit can be repaired free for life. <Link className="ul" href="/contact">Get in touch</Link> and we&apos;ll arrange collection.</p>
      </article>
    </main>
  );
}
