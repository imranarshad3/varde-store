import Link from "next/link";

export const metadata = { title: "FAQ · VARDE" };

const FAQ: { g: string; q: [string, string][] }[] = [
  { g: "Orders", q: [
    ["Can I change or cancel my order?", "Yes, within two hours of placing it. Write to us through the contact page with your order number."],
    ["How do I track my order?", "Sign in to your account with the email you ordered with. Each order shows its progress from confirmed to delivered."],
  ]},
  { g: "Delivery", q: [
    ["How much is delivery?", "Standard delivery is complimentary on orders over $300 and $15 below that. Express delivery is $25."],
    ["How long does it take?", "Standard delivery takes 3 to 5 working days, express 1 to 2 working days, once your order has shipped."],
  ]},
  { g: "Returns & repairs", q: [
    ["What is your returns policy?", "You can return unworn pieces with their tags within 365 days for a full refund. Returns are free."],
    ["Do you really repair for life?", "Yes. Send back any VARDE coat or knit and we'll mend seams, replace buttons and darn small holes free of charge."],
  ]},
  { g: "Products", q: [
    ["How do your sizes run?", "Our pieces are cut with an easy, relaxed fit. If you're between sizes, take your usual size for a relaxed fit or size down for a closer one. See the size guide for measurements."],
    ["Where are your clothes made?", "In small workshops we visit every season. Each product page lists its composition and care."],
  ]},
];

export default function Faq() {
  return (
    <main className="page prose-page">
      <header className="page-hero">
        <p className="eyebrow">Help</p>
        <h1 className="display">Frequently asked</h1>
      </header>
      {FAQ.map((g) => (
        <section key={g.g} className="faq-g">
          <h2 className="h2">{g.g}</h2>
          {g.q.map(([q, a]) => (
            <details key={q} className="faq-i">
              <summary>{q}<span aria-hidden="true">+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </section>
      ))}
      <p className="muted center">Still curious? <Link href="/contact" className="ul">Contact client care</Link>.</p>
    </main>
  );
}
