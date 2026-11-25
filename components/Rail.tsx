"use client";

import { useRef } from "react";
import type { Product } from "@/lib/types";
import ProductCard from "./ProductCard";

/** Horizontal, snap-scrolling row of product cards with arrow controls. */
export default function Rail({ products }: { products: Product[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => {
    const el = ref.current;
    if (!el) return;
    const w = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 300;
    el.scrollBy({ left: d * (w + 20) * 2, behavior: "smooth" });
  };
  return (
    <div className="rail-wrap">
      <div className="prail" ref={ref} onKeyDown={(e) => { if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); }}>
        {products.map((p) => (
          <div className="prail-item" key={p.id} data-reveal><ProductCard p={p} sizes="(max-width:600px) 70vw, 24vw" /></div>
        ))}
      </div>
      <div className="rail-ctl">
        <button aria-label="Scroll back" onClick={() => go(-1)}>
          <svg width="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
        </button>
        <button aria-label="Scroll forward" onClick={() => go(1)}>
          <svg width="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
        </button>
      </div>
    </div>
  );
}
