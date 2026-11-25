"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ALL_PRODUCTS, FREE_SHIPPING, LOOKS, SIZES, money, productById } from "@/lib/data";
import { useStore } from "@/lib/store";

gsap.registerPlugin(useGSAP);

export default function BagDrawer({ cur }: { cur: number }) {
  const { bag, subtotal, bagOpen, setBagOpen, setQty, remove, add, notify } = useStore();
  const drawer = useRef<HTMLElement>(null);
  const track = useRef<HTMLElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  const [dot, setDot] = useState(0);
  const [pick, setPick] = useState<Record<number, string>>({});

  useGSAP(() => {
    const scrim = document.querySelector(".scrim");
    if (bagOpen) {
      gsap.to(scrim, { autoAlpha: 1, duration: 0.35 });
      gsap.fromTo(drawer.current, { x: "100%", autoAlpha: 1 }, { x: "0%", duration: 0.6, ease: "expo.out" });
      gsap.from(".drawer .li, .drawer .ups", { x: 30, opacity: 0, duration: 0.5, stagger: 0.06, delay: 0.15, ease: "power3.out" });
    } else {
      gsap.to(drawer.current, { x: "100%", duration: 0.45, ease: "power3.in", onComplete: () => { gsap.set(drawer.current, { autoAlpha: 0 }); } });
      if (!document.querySelector(".modal.open")) gsap.to(scrim, { autoAlpha: 0, duration: 0.35 });
    }
  }, { dependencies: [bagOpen] });

  useGSAP(() => {
    gsap.to(track.current, { width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%`, duration: 0.8, ease: "power3.out" });
  }, { dependencies: [subtotal] });

  useEffect(() => {
    if (!bagOpen) return;
    const scrim = document.querySelector(".scrim") as HTMLElement | null;
    const close = () => setBagOpen(false);
    const k = (e: KeyboardEvent) => e.key === "Escape" && close();
    scrim?.addEventListener("click", close);
    window.addEventListener("keydown", k);
    return () => { scrim?.removeEventListener("click", close); window.removeEventListener("keydown", k); };
  }, [bagOpen, setBagOpen]);

  const inBag = new Set(bag.map((l) => l.id));
  const current = new Set(LOOKS[cur].products.map((p) => p.id));
  const ups = ALL_PRODUCTS.filter(
    (p) => !inBag.has(p.id) && !current.has(p.id) && (p.category === "knit" || p.category === "accessory" || p.category === "top")
  ).slice(0, 5);

  return (
    <aside className={`drawer${bagOpen ? " open" : ""}`} ref={drawer} aria-label="Your bag" aria-hidden={!bagOpen}>
      <div className="dh">
        <h2>Your bag</h2>
        <button className="x" aria-label="Close bag" onClick={() => setBagOpen(false)}>×</button>
        <div className="free">
          {subtotal >= FREE_SHIPPING ? (
            <b>You&apos;ve unlocked free delivery</b>
          ) : (
            <><b>{money(FREE_SHIPPING - subtotal)} CAD</b> away from free delivery</>
          )}
        </div>
        <div className="track"><i ref={track} /></div>
      </div>

      <div className="db">
        <div className="th"><span>Product</span><span>Total</span></div>
        {bag.length === 0 && (
          <div className="empty">Your bag is empty.<br />Step through the looks and add a piece.</div>
        )}
        {bag.map((l) => {
          const p = productById(l.id);
          return (
            <div className="li" key={l.key}>
              <div className="ti"><Image src={p.img} alt={p.name} fill sizes="76px" /></div>
              <div>
                <div className="n">{p.name}</div>
                <div className="s">{money(p.price)}<br />Size: {l.size}<br />Color: {p.colorName}</div>
                <div className="qty">
                  <div className="q">
                    <button aria-label="Decrease" onClick={() => setQty(l.key, l.qty - 1)}>−</button>
                    <span>{l.qty}</span>
                    <button aria-label="Increase" onClick={() => setQty(l.key, l.qty + 1)}>+</button>
                  </div>
                  <button className="rm" aria-label={`Remove ${p.name}`} onClick={() => remove(l.key)}>
                    <svg width="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 4h10M6 4V2.5h4V4M4.5 4l.7 9.5h5.6l.7-9.5" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
                  </button>
                </div>
              </div>
              <div className="t">{money(p.price * l.qty)}</div>
            </div>
          );
        })}

        {ups.length > 0 && (
          <div className="ups">
            <h4>You&apos;ll love with it</h4>
            <div
              className="rail"
              ref={rail}
              onScroll={(e) => {
                const r = e.currentTarget;
                const w = (r.firstElementChild as HTMLElement | null)?.offsetWidth ?? 1;
                setDot(Math.round(r.scrollLeft / (w + 10)));
              }}
            >
              {ups.map((p) => (
                <div className="uc" key={p.id}>
                  <div className="ti"><Image src={p.img} alt={p.name} fill sizes="64px" /></div>
                  <div>
                    <div className="n">{p.name}</div>
                    <select
                      aria-label={`Size for ${p.name}`}
                      value={pick[p.id] ?? "S"}
                      onChange={(e) => setPick({ ...pick, [p.id]: e.target.value })}
                    >
                      {SIZES.map((s) => <option key={s} value={s}>{s} / {p.colorName}</option>)}
                    </select>
                    <div className="row">
                      <span>{money(p.price)}</span>
                      <button onClick={() => { add(p.id, pick[p.id] ?? "S"); notify("Added to bag"); }}>Add to cart</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="dots">{ups.map((p, i) => <i key={p.id} className={i === dot ? "on" : ""} />)}</div>
          </div>
        )}
      </div>

      <div className="df">
        <div className="sub"><span>Subtotal</span><span>{money(subtotal)}</span></div>
        <small>Taxes and shipping calculated at checkout</small>
        <button className="btn" onClick={() => notify("This is a demo store")}>Checkout</button>
      </div>
    </aside>
  );
}
