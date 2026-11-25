"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStore } from "@/lib/store";
import { CATEGORY_LABEL, money } from "@/lib/types";

gsap.registerPlugin(useGSAP);

const SUGGEST = ["Cashmere", "Coat", "Suede", "Boots", "Knit", "Silk"];

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { catalog } = useStore();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const terms = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!terms.length) return [];
    return catalog
      .map((p) => {
        const hay = `${p.name} ${p.colorName} ${p.material} ${CATEGORY_LABEL[p.category]}`.toLowerCase();
        if (!terms.every((t) => hay.includes(t))) return null;
        const score = terms.reduce((s, t) => s + (p.name.toLowerCase().includes(t) ? 2 : 1), 0);
        return { p, score };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((x) => x.p);
  }, [q, catalog]);

  useEffect(() => { setActive(0); }, [q]);

  useGSAP(() => {
    if (open) {
      gsap.fromTo(box.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 });
      gsap.fromTo(".so-panel", { yPercent: -8, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
      setTimeout(() => input.current?.focus(), 50);
    } else {
      gsap.to(box.current, { autoAlpha: 0, duration: 0.25 });
    }
  }, { dependencies: [open], scope: box });

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);

  useGSAP(() => {
    if (results.length) gsap.fromTo(".so-res li", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.35, stagger: 0.03, ease: "power2.out" });
  }, { dependencies: [results.map((r) => r.id).join()], scope: box });

  const go = (href: string) => { onClose(); setQ(""); router.push(href); };

  return (
    <div className="so" ref={box} aria-hidden={!open} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="so-panel" role="dialog" aria-modal="true" aria-label="Search">
        <div className="so-top">
          <svg width="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="m13.5 13.5 5 5" stroke="currentColor" strokeWidth="1.3" /></svg>
          <input
            ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the collection" aria-label="Search the collection"
            role="combobox" aria-expanded={results.length > 0} aria-controls="so-list" aria-activedescendant={results[active] ? `so-${results[active].id}` : undefined}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(results.length - 1, a + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
              if (e.key === "Enter") {
                e.preventDefault();
                if (results[active]) go(`/product/${results[active].slug}`);
                else if (q.trim()) go(`/shop?q=${encodeURIComponent(q.trim())}`);
              }
            }}
          />
          <button className="so-x" onClick={onClose} aria-label="Close search">Esc</button>
        </div>
        {!q && (
          <div className="so-sug">
            <span>Popular</span>
            {SUGGEST.map((s) => <button key={s} onClick={() => setQ(s)}>{s}</button>)}
          </div>
        )}
        {q && !results.length && <p className="so-none">Nothing for “{q}”. Try “wool” or “boots”.</p>}
        {results.length > 0 && (
          <>
            <ul className="so-res" id="so-list" role="listbox">
              {results.map((p, i) => (
                <li key={p.id} id={`so-${p.id}`} role="option" aria-selected={i === active} className={i === active ? "on" : ""} onMouseEnter={() => setActive(i)}>
                  <Link href={`/product/${p.slug}`} onClick={onClose}>
                    <span className="ti"><Image src={p.img} alt="" fill sizes="56px" /></span>
                    <span className="so-n">{p.name}<i>{CATEGORY_LABEL[p.category]} · {p.colorName}</i></span>
                    <span>{money(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <button className="btn-line so-all" onClick={() => go(`/shop?q=${encodeURIComponent(q.trim())}`)}>See all results</button>
          </>
        )}
      </div>
    </div>
  );
}
