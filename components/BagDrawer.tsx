"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { money } from "@/lib/types";
import BagLines from "./BagLines";

gsap.registerPlugin(useGSAP);

export default function BagDrawer() {
  const { lines, subtotal, bagOpen, setBagOpen, settings, catalog, add, notify } = useStore();
  const drawer = useRef<HTMLElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLElement>(null);
  const path = usePathname();

  useEffect(() => { setBagOpen(false); }, [path, setBagOpen]);

  useGSAP(() => {
    if (bagOpen) {
      gsap.to(scrim.current, { autoAlpha: 1, duration: 0.35 });
      gsap.fromTo(drawer.current, { x: "100%", autoAlpha: 1 }, { x: "0%", duration: 0.7, ease: "expo.out" });
      gsap.from(".drawer .li, .drawer .ups", { x: 30, opacity: 0, duration: 0.5, stagger: 0.06, delay: 0.15, ease: "power3.out" });
    } else {
      gsap.to(drawer.current, { x: "100%", duration: 0.45, ease: "power3.in", onComplete: () => { gsap.set(drawer.current, { autoAlpha: 0 }); } });
      gsap.to(scrim.current, { autoAlpha: 0, duration: 0.35 });
    }
  }, { dependencies: [bagOpen] });

  useGSAP(() => {
    gsap.to(track.current, { width: `${Math.min(100, (subtotal / settings.freeShipping) * 100)}%`, duration: 0.8, ease: "power3.out" });
  }, { dependencies: [subtotal, settings.freeShipping] });

  useEffect(() => {
    if (!bagOpen) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setBagOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [bagOpen, setBagOpen]);

  const inBag = new Set(lines.map((l) => l.id));
  const ups = catalog.filter((p) => !inBag.has(p.id) && p.stock > 0 && ["knit", "accessory", "top"].includes(p.category)).slice(0, 5);

  return (
    <>
      <div className="scrim" ref={scrim} onClick={() => setBagOpen(false)} />
      <aside className={`drawer${bagOpen ? " open" : ""}`} ref={drawer} aria-label="Your bag" aria-hidden={!bagOpen}>
        <div className="dh">
          <h2>Your bag <sup>{lines.reduce((s, l) => s + l.qty, 0)}</sup></h2>
          <button className="x" aria-label="Close bag" onClick={() => setBagOpen(false)}>×</button>
          <div className="free">
            {subtotal >= settings.freeShipping ? <b>Complimentary delivery unlocked</b> : <><b>{money(settings.freeShipping - subtotal)}</b> away from complimentary delivery</>}
          </div>
          <div className="track"><i ref={track} /></div>
        </div>
        <div className="db">
          {lines.length === 0 ? (
            <div className="empty">
              <p>Your bag is empty.</p>
              <Link href="/shop" className="btn-line">Discover the collection</Link>
            </div>
          ) : <BagLines />}
          {ups.length > 0 && (
            <div className="ups">
              <h4>Complete the look</h4>
              <div className="rail">
                {ups.map((p) => (
                  <div className="uc" key={p.id}>
                    <Link href={`/product/${p.slug}`} className="ti"><Image src={p.img} alt={p.name} fill sizes="64px" /></Link>
                    <div>
                      <div className="n">{p.name}</div>
                      <div className="row">
                        <span>{money(p.price)}</span>
                        <button onClick={() => { add(p.id, "M"); notify(`${p.name} · M added`); }}>Add · M</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {lines.length > 0 && (
          <div className="df">
            <div className="sub"><span>Subtotal</span><span>{money(subtotal)}</span></div>
            <small>Taxes and delivery calculated at checkout</small>
            <div className="df-btns">
              <Link href="/cart" className="btn ghost">View bag</Link>
              <Link href="/checkout" className="btn">Checkout</Link>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
