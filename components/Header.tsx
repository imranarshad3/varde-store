"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStore } from "@/lib/store";

gsap.registerPlugin(useGSAP);

export default function Header() {
  const { count, saved, setBagOpen, notify } = useStore();
  const ref = useRef<HTMLElement>(null);
  const badge = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      gsap.from(".logo", { y: -14, opacity: 0, duration: 1, ease: "power3.out", delay: 0.1 });
      gsap.from("nav button", { y: -8, opacity: 0, duration: 0.7, stagger: 0.05, ease: "power2.out", delay: 0.3 });
    },
    { scope: ref }
  );

  // bounce the bag badge whenever the count changes
  useGSAP(() => {
    if (count > 0 && badge.current)
      gsap.fromTo(badge.current, { scale: 1.6 }, { scale: 1, duration: 0.5, ease: "back.out(3)" });
  }, { dependencies: [count] });

  const demo = () => notify("This is a demo store");

  return (
    <header className="header" ref={ref}>
      <nav className="l cap">
        <button onClick={demo}>Shop all</button>
        <button onClick={demo}>Low tide</button>
        <button onClick={demo}>Everyday</button>
        <button onClick={demo}>Knitwear</button>
      </nav>
      <button className="burger cap" onClick={demo}>Menu</button>
      <div className="logo">VARDE</div>
      <nav className="r cap">
        <button className="hide" onClick={demo}>Search</button>
        <button className="hide" onClick={demo}>Account</button>
        <button
          className="hide"
          onClick={() =>
            notify(saved.size ? `${saved.size} saved piece${saved.size > 1 ? "s" : ""}` : "Tap a heart to save pieces")
          }
        >
          <svg width="12" viewBox="0 0 24 22" aria-hidden="true">
            <path d="M12 21 2.5 11.6A5.6 5.6 0 0 1 12 3.8a5.6 5.6 0 0 1 9.5 7.8Z" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          Saved {saved.size > 0 && saved.size}
        </button>
        <button onClick={() => setBagOpen(true)} aria-label={`Bag, ${count} items`}>
          Bag <span className="count" ref={badge}>{count}</span>
        </button>
      </nav>
    </header>
  );
}
