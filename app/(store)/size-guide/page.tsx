export const metadata = { title: "Size guide · VARDE" };

const ROWS = [
  ["XS", "82–86", "64–68", "88–92", "0–2", "6"],
  ["S", "87–91", "69–73", "93–97", "4–6", "8"],
  ["M", "92–97", "74–79", "98–103", "8–10", "10–12"],
  ["L", "98–104", "80–86", "104–110", "12–14", "14"],
  ["XL", "105–112", "87–94", "111–118", "16", "16–18"],
];

export default function SizeGuide() {
  return (
    <main className="page prose-page">
      <header className="page-hero">
        <p className="eyebrow">Help</p>
        <h1 className="display">Size guide</h1>
        <p className="lead">Our pieces have an easy, relaxed fit. Measurements are body measurements in centimetres.</p>
      </header>
      <div className="table-wrap">
        <table className="sz">
          <thead><tr><th>Size</th><th>Chest / bust</th><th>Waist</th><th>Hips</th><th>US</th><th>UK</th></tr></thead>
          <tbody>{ROWS.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <article className="prose">
        <h2>How to measure</h2>
        <p><b>Chest:</b> around the fullest part, keeping the tape level under your arms. <b>Waist:</b> around your natural waistline. <b>Hips:</b> around the fullest part, feet together.</p>
        <h2>Between sizes?</h2>
        <p>Take your usual size for our intended relaxed fit, or size down for a closer fit. Coats are cut to layer over knitwear.</p>
        <h2>Footwear</h2>
        <p>Shoe sizes XS to XL correspond to EU 36–37, 38–39, 40–41, 42–43 and 44–45.</p>
      </article>
    </main>
  );
}
