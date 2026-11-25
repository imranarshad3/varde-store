"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SIZES, money, productById } from "@/lib/data";
import { useStore } from "@/lib/store";

gsap.registerPlugin(useGSAP);

export default function QuickAdd() {
  const { quickAdd, setQuickAdd, add, setBagOpen } = useStore();
  const [size, setSize] = useState<string | null>(null);
  const [pid, setPid] = useState<number | null>(null);
  const modal = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const open = quickAdd !== null;

  useEffect(() => {
    if (quickAdd !== null) { setPid(quickAdd); setSize(null); }
  }, [quickAdd]);

  useGSAP(() => {
    if (open) {
      gsap.to(scrim.current, { autoAlpha: 1, duration: 0.3 });
      gsap.fromTo(modal.current, { autoAlpha: 0, y: 24, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" });
      gsap.from(".modal .stagger", { y: 12, opacity: 0, duration: 0.4, stagger: 0.05, delay: 0.1, ease: "power2.out" });
    } else {
      gsap.to(modal.current, { autoAlpha: 0, y: 16, duration: 0.25, ease: "power2.in" });
      if (!document.querySelector(".drawer.open")) gsap.to(scrim.current, { autoAlpha: 0, duration: 0.3 });
    }
  }, { dependencies: [open] });

  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setQuickAdd(null);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, setQuickAdd]);

  const p = pid ? productById(pid) : null;

  return (
    <>
      <div className="scrim" ref={scrim} onClick={() => setQuickAdd(null)} />
      <div className={`modal${open ? " open" : ""}`} ref={modal} role="dialog" aria-modal="true" aria-label={p?.name ?? "Quick add"}>
        {p && (
          <>
            <button className="x" aria-label="Close" onClick={() => setQuickAdd(null)}>×</button>
            <div className="mi">
              <Image src={p.img} alt={p.name} fill sizes="210px" />
            </div>
            <div>
              <h3 className="stagger">{p.name}</h3>
              <div className="mp stagger">{money(p.price)}</div>
              <div className="lbl stagger">Size <span>{size ?? "Choose"}</span></div>
              <div className="sizes stagger">
                {SIZES.map((s) => (
                  <button key={s} className={s === size ? "on" : ""} onClick={() => setSize(s)}>{s}</button>
                ))}
              </div>
              <div className="lbl stagger">Color <span>{p.colorName}</span></div>
              <div className="sw stagger"><span style={{ background: p.color }} /></div>
              <button
                className="btn stagger"
                disabled={!size}
                onClick={() => {
                  if (!size) return;
                  add(p.id, size);
                  setQuickAdd(null);
                  setTimeout(() => setBagOpen(true), 200);
                }}
              >
                {size ? "Add to bag" : "Choose a size"}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
