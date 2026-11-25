"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

/** Opening curtain: the wordmark sets letter by letter, then the curtain lifts. */
export default function Loader() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) { gsap.set(ref.current, { display: "none" }); return; }
      gsap.timeline({ onComplete: () => { gsap.set(ref.current, { display: "none" }); } })
        .from(".ld-ch", { yPercent: 120, duration: 0.8, stagger: 0.06, ease: "power4.out" })
        .from(".ld-sub", { opacity: 0, y: 8, duration: 0.5 }, "-=0.3")
        .to(".ld-line i", { scaleX: 1, duration: 0.7, ease: "power2.inOut" }, "-=0.4")
        .to(".ld-inner", { opacity: 0, y: -20, duration: 0.4, ease: "power2.in" }, "+=0.05")
        .to(ref.current, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.15");
    },
    { scope: ref }
  );

  return (
    <div className="loader" ref={ref} aria-hidden="true">
      <div className="ld-inner">
        <div className="ld-word">
          {"VARDE".split("").map((c, i) => <span className="ld-mask" key={i}><span className="ld-ch">{c}</span></span>)}
        </div>
        <div className="ld-sub">Low Tide · Autumn Winter 2026</div>
        <div className="ld-line"><i /></div>
      </div>
    </div>
  );
}
