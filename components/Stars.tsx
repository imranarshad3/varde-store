/** Read-only star rating, with partial fill for decimals. */
export default function Stars({ value, size = 13, label = true }: { value: number; size?: number; label?: boolean }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="stars" style={{ fontSize: size }} aria-label={label ? `Rated ${value} out of 5` : undefined} role={label ? "img" : undefined}>
      <span className="st-bg" aria-hidden="true">★★★★★</span>
      <span className="st-fg" style={{ width: `${pct}%` }} aria-hidden="true">★★★★★</span>
    </span>
  );
}
