"use client";

import Link from "next/link";
import { useActionState } from "react";
import { joinNewsletter } from "@/lib/actions";

const COLS = [
  { h: "Shop", l: [["All pieces", "/shop"], ["Outerwear", "/shop?c=outer"], ["Knitwear", "/shop?c=knit"], ["Footwear", "/shop?c=shoes"], ["Bags", "/shop?c=bag"]] },
  { h: "House", l: [["Lookbook", "/lookbook"], ["Our story", "/about"], ["Journal", "/journal"], ["Account", "/account"]] },
  { h: "Help", l: [["Contact", "/contact"], ["FAQ", "/faq"], ["Shipping & returns", "/shipping-returns"], ["Size guide", "/size-guide"]] },
];

export default function Footer() {
  const [state, action, pending] = useActionState(joinNewsletter, null);
  return (
    <footer className="footer">
      <div className="ft-top">
        <div className="ft-news">
          <h2>Letters from the shoreline</h2>
          <p>New collections, quiet sales and stories from the studio. Twice a month, never more.</p>
          {state?.ok ? (
            <p className="ft-ok">{state.message}</p>
          ) : (
            <form action={action} className="ft-form">
              <label className="sr" htmlFor="nl-email">Email address</label>
              <input id="nl-email" name="email" type="email" required placeholder="Your email address" autoComplete="email" />
              <button disabled={pending}>{pending ? "Joining…" : "Subscribe"}</button>
            </form>
          )}
          {state?.error && <p className="ft-err">{state.error}</p>}
        </div>
        {COLS.map((c) => (
          <div key={c.h} className="ft-col">
            <h3>{c.h}</h3>
            {c.l.map(([t, h]) => <Link key={t} href={h} className="ul">{t}</Link>)}
          </div>
        ))}
      </div>
      <div className="ft-word" aria-hidden="true">VARDE</div>
      <div className="ft-bot">
        <span>© 2026 VARDE. A demo store.</span>
        <span>Made slowly, worn for years.</span>
        <Link href="/admin" className="ul">Admin</Link>
      </div>
    </footer>
  );
}
