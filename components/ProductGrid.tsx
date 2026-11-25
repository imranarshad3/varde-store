"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Look } from "@/lib/types";
import ProductCard from "./ProductCard";

gsap.registerPlugin(useGSAP);

export default function ProductGrid({ looks, cur }: { looks: Look[]; cur: number }) {
  const [shown, setShown] = useState(cur);
  const ref = useRef<HTMLElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (cur === shown) return;
    const cards = ref.current?.querySelectorAll(".card");
    if (!cards?.length) return setShown(cur);
    const tl = gsap.to(cards, { opacity: 0, y: -12, duration: 0.28, stagger: 0.03, ease: "power2.in", onComplete: () => setShown(cur) });
    return () => { tl.kill(); };
  }, [cur, shown]);

  useGSAP(
    () => {
      const tl = gsap.timeline({ delay: first.current ? 1.9 : 0 });
      tl.fromTo(".card", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.07, ease: "power3.out" })
        .fromTo(".card img", { scale: 1.12 }, { scale: 1, duration: 1.1, stagger: 0.07, ease: "power3.out" }, 0);
      first.current = false;
    },
    { scope: ref, dependencies: [shown] }
  );

  const look = looks[shown];
  return (
    <section className="grid" ref={ref} aria-label={`Pieces in ${look.name}`}>
      <div className="grid-head">
        <span>In this look</span>
        <Link href="/shop" className="ul">Shop all</Link>
      </div>
      <div className="cards">
        {look.products.slice(0, 4).map((p, i) => (
          <ProductCard key={p.id} p={p} tag={i === 0 ? "New in" : undefined} sizes="(max-width:600px) 50vw, (max-width:900px) 25vw, 13vw" />
        ))}
      </div>
    </section>
  );
}
