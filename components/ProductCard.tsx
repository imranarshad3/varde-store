"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useStore } from "@/lib/store";
import { CATEGORY_LABEL, SIZES, money, type Product } from "@/lib/types";
import Stars from "./Stars";

/** Fly a copy of the product image into the bag icon. */
export function flyToBag(from: HTMLElement | null) {
  const bag = document.getElementById("bagBtn");
  const img = from?.querySelector("img");
  if (!bag || !img || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const a = img.getBoundingClientRect();
  const b = bag.getBoundingClientRect();
  const ghost = document.createElement("img");
  ghost.src = img.currentSrc || img.src;
  Object.assign(ghost.style, {
    position: "fixed", left: `${a.left}px`, top: `${a.top}px`, width: `${a.width}px`, height: `${a.height}px`,
    objectFit: "contain", zIndex: "70", pointerEvents: "none",
  });
  document.body.appendChild(ghost);
  gsap.timeline({ onComplete: () => ghost.remove() })
    .to(ghost, { left: b.left + b.width / 2 - a.width * 0.06, top: b.top + b.height / 2 - a.height * 0.06, width: a.width * 0.12, height: a.height * 0.12, duration: 0.85, ease: "power3.inOut" })
    .to(ghost, { opacity: 0, duration: 0.15 }, "-=0.1");
}

export default function ProductCard({ p, tag, sizes = "(max-width:600px) 50vw, (max-width:900px) 33vw, 22vw" }: { p: Product; tag?: string; sizes?: string }) {
  const { saved, toggleSaved, notify, add } = useStore();
  const media = useRef<HTMLDivElement>(null);
  const on = saved.has(p.id);
  const soldOut = p.stock <= 0;
  const low = !soldOut && p.stock <= 5;

  return (
    <article className="card">
      <div className="media" ref={media}>
        {(tag || soldOut || low) && <span className={`tag${soldOut ? " out" : ""}`}>{soldOut ? "Sold out" : low ? `Only ${p.stock} left` : tag}</span>}
        <button
          className={`heart${on ? " on" : ""}`}
          aria-label={`${on ? "Unsave" : "Save"} ${p.name}`}
          aria-pressed={on}
          onClick={(e) => {
            toggleSaved(p.id);
            notify(on ? "Removed from saved" : `${p.name} saved`);
            gsap.fromTo(e.currentTarget.firstChild, { scale: 0.5 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,0.4)" });
          }}
        >
          <svg viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 2.8 11.4A5.4 5.4 0 0 1 12 4a5.4 5.4 0 0 1 9.2 7.4Z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
        </button>
        <Link href={`/product/${p.slug}`} className="shot" aria-label={p.name}>
          <Image src={p.img} alt={p.name} fill sizes={sizes} />
        </Link>
        {!soldOut && (
          <div className="qa">
            <span>Quick add</span>
            <div className="qs">
              {SIZES.map((s) => (
                <button key={s} aria-label={`Add ${p.name} in size ${s}`} onClick={() => { add(p.id, s); flyToBag(media.current); notify(`${p.name} · ${s} added to bag`); }}>{s}</button>
              ))}
            </div>
          </div>
        )}
      </div>
      <Link href={`/product/${p.slug}`} className="info">
        <div className="cat">{CATEGORY_LABEL[p.category]}</div>
        <div className="nr">
          <h3 className="name">{p.name}</h3>
          <span className="price">{money(p.price)}</span>
        </div>
        <div className="col"><i style={{ background: p.color }} />{p.colorName}{p.reviews ? <span className="card-rt"><Stars value={p.rating ?? 0} size={11} /> {p.reviews}</span> : null}</div>
      </Link>
    </article>
  );
}
