"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { LOOKS, money } from "@/lib/data";
import { useStore } from "@/lib/store";

gsap.registerPlugin(useGSAP);

export default function ProductGrid({ cur }: { cur: number }) {
  const [shown, setShown] = useState(cur);
  const ref = useRef<HTMLElement>(null);
  const first = useRef(true);
  const { saved, toggleSaved, setQuickAdd, notify } = useStore();

  // animate the old cards out, then swap to the new look
  useEffect(() => {
    if (cur === shown) return;
    const cards = ref.current?.querySelectorAll(".p > *");
    if (!cards) return setShown(cur);
    const tl = gsap.to(cards, {
      opacity: 0, y: -10, duration: 0.25, stagger: 0.02, ease: "power2.in",
      onComplete: () => setShown(cur),
    });
    return () => { tl.kill(); };
  }, [cur, shown]);

  // and animate the new ones in
  useGSAP(
    () => {
      gsap.fromTo(
        ".p > *",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.05, ease: "power3.out", delay: first.current ? 0.6 : 0 }
      );
      first.current = false;
    },
    { scope: ref, dependencies: [shown] }
  );

  return (
    <section className="grid" ref={ref} aria-label={`Pieces in ${LOOKS[shown].name}`}>
      {LOOKS[shown].products.map((p, i) => {
        const on = saved.has(p.id);
        return (
          <article className="p" key={p.id}>
            <button
              className={`heart${on ? " on" : ""}`}
              aria-label={`${on ? "Unsave" : "Save"} ${p.name}`}
              aria-pressed={on}
              onClick={(e) => {
                toggleSaved(p.id);
                notify(on ? "Removed from saved" : "Saved");
                gsap.fromTo(e.currentTarget, { scale: 0.6 }, { scale: 1, duration: 0.5, ease: "back.out(4)" });
              }}
            >
              <svg viewBox="0 0 24 22" aria-hidden="true">
                <path d="M12 20.5 2.8 11.4A5.4 5.4 0 0 1 12 4a5.4 5.4 0 0 1 9.2 7.4Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            <div className="img" onClick={() => setQuickAdd(p.id)}>
              <Image src={p.img} alt={p.name} fill sizes="(max-width:600px) 50vw, (max-width:900px) 25vw, 13vw" priority={i < 4} />
            </div>
            <div className="meta">
              <div>
                <div className="nm">{p.name}</div>
                <div className="pr">{money(p.price)}</div>
              </div>
              <button className="add" aria-label={`Quick add ${p.name}`} onClick={() => setQuickAdd(p.id)}>+</button>
            </div>
          </article>
        );
      })}
    </section>
  );
}
