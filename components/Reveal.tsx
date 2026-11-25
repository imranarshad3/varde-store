"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/**
 * Wraps a page section. Children marked data-reveal rise in as they scroll into view;
 * data-reveal="img" children get a curtain-style clip reveal; data-parallax drifts slowly.
 */
export default function Reveal({ children, className, as: Tag = "section" }: { children: React.ReactNode; className?: string; as?: "section" | "div" | "main" }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const img = el.dataset.reveal === "img";
        gsap.fromTo(
          el,
          img ? { clipPath: "inset(100% 0 0 0)" } : { y: 36, opacity: 0 },
          {
            ...(img ? { clipPath: "inset(0% 0 0 0)", duration: 1.3, ease: "expo.out" } : { y: 0, opacity: 1, duration: 1, ease: "power3.out" }),
            delay: Number(el.dataset.delay || 0),
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        gsap.fromTo(el, { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: el, scrub: true, start: "top bottom", end: "bottom top" } });
      });
    },
    { scope: ref }
  );
  // @ts-expect-error polymorphic ref
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
