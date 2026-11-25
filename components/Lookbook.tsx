"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import type { Look } from "@/lib/types";
import { useStore } from "@/lib/store";

gsap.registerPlugin(useGSAP);

type Slot = { l: number; h: number; b: number; o: number };
// rel position → where the figure stands. 0 = hero, 1..5 = queue, 6 = waiting off-stage, -1 = just left
const DESKTOP: Record<number, Slot> = {
  [-1]: { l: 18, h: 92, b: 2, o: 0 },
  0: { l: 38, h: 88, b: 3, o: 1 },
  1: { l: 57, h: 52, b: 18, o: 1 },
  2: { l: 65, h: 46, b: 20, o: 1 },
  3: { l: 72, h: 40, b: 22, o: 1 },
  4: { l: 79, h: 37, b: 23, o: 1 },
  5: { l: 86, h: 35, b: 24, o: 1 },
  6: { l: 93, h: 34, b: 24, o: 0 },
};
const MOBILE: Record<number, Slot> = {
  [-1]: { l: 10, h: 72, b: 12, o: 0 },
  0: { l: 32, h: 70, b: 13, o: 1 },
  1: { l: 66, h: 42, b: 24, o: 1 },
  2: { l: 80, h: 38, b: 26, o: 1 },
  3: { l: 92, h: 35, b: 27, o: 1 },
  4: { l: 100, h: 34, b: 27, o: 0 },
  5: { l: 100, h: 34, b: 27, o: 0 },
  6: { l: 100, h: 34, b: 27, o: 0 },
};

export default function Lookbook({ looks, cur, setCur }: { looks: Look[]; cur: number; setCur: (n: number) => void }) {
  const N = looks.length;
  const stage = useRef<HTMLElement>(null);
  const figs = useRef<(HTMLDivElement | null)[]>([]);
  const last = useRef<number[]>([]);
  const busy = useRef(false);
  const curRef = useRef(cur);
  const [mobile, setMobile] = useState(false);
  const { add, setBagOpen, notify } = useStore();

  const rel = useCallback(
    (i: number, c: number) => {
      const d = (i - c + N) % N;
      return d === N - 1 ? -1 : d > 6 ? 6 : d;
    },
    [N]
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width:600px)");
    const on = () => setMobile(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);

  // place / move the figures whenever the current look changes
  const { contextSafe } = useGSAP(
    () => {
      const slots = mobile ? MOBILE : DESKTOP;
      figs.current.forEach((el, i) => {
        if (!el) return;
        const r = rel(i, cur);
        const s = slots[r];
        const prev = last.current[i];
        const vars = {
          left: `${s.l}%`,
          height: `${s.h}%`,
          bottom: `${s.b}%`,
          opacity: s.o,
          zIndex: r === 0 ? 12 : r < 0 ? 1 : 11 - r,
        };
        const jump = prev === undefined || Math.abs(r - prev) > 2;
        if (jump) gsap.set(el, vars);
        else
          gsap.to(el, {
            ...vars,
            duration: 1,
            ease: "power3.inOut",
            delay: r > 0 ? r * 0.035 : 0,
            overwrite: "auto",
          });
        el.classList.toggle("is-hero", r === 0);
        el.setAttribute("aria-hidden", String(r < 0 || r > 5));
        last.current[i] = r;
      });
    },
    { scope: stage, dependencies: [cur, mobile] }
  );

  // intro: models walk in, copy rises
  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(".fig img", { y: 60, opacity: 0, duration: 1.2, stagger: { each: 0.08, from: "start" } }, 1.55)
        .from(".wm", { opacity: 0, xPercent: -6, duration: 1.6 }, 1.6)
        .from(".copy > *", { y: 20, opacity: 0, duration: 0.9, stagger: 0.1 }, 1.8)
        .from(".foot", { y: 20, opacity: 0, duration: 0.8 }, 2.1);
    },
    { scope: stage }
  );

  // look name: letters roll up on each change
  useGSAP(
    () => {
      gsap.fromTo(
        ".lookname .ch",
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.7, stagger: 0.025, ease: "power3.out", delay: 0.25 }
      );
    },
    { scope: stage, dependencies: [cur] }
  );

  // giant italic look name behind the models
  useGSAP(
    () => {
      gsap.fromTo(".wm span", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 1.2, ease: "power3.out" });
    },
    { scope: stage, dependencies: [cur] }
  );

  // magnetic arrow buttons
  useGSAP(
    () => {
      if (window.matchMedia("(pointer:coarse)").matches) return;
      const btns = gsap.utils.toArray<HTMLElement>(".arrows button");
      const offs = btns.map((b) => {
        const mx = gsap.quickTo(b, "x", { duration: 0.4, ease: "power3.out" });
        const my = gsap.quickTo(b, "y", { duration: 0.4, ease: "power3.out" });
        const move = (e: MouseEvent) => { const r = b.getBoundingClientRect(); mx((e.clientX - r.left - r.width / 2) * 0.35); my((e.clientY - r.top - r.height / 2) * 0.35); };
        const leave = () => { mx(0); my(0); };
        b.addEventListener("mousemove", move); b.addEventListener("mouseleave", leave);
        return () => { b.removeEventListener("mousemove", move); b.removeEventListener("mouseleave", leave); };
      });
      return () => offs.forEach((f) => f());
    },
    { scope: stage }
  );

  // subtle mouse parallax on the hero and the queue
  useGSAP(
    () => {
      const el = stage.current;
      if (!el || window.matchMedia("(pointer:coarse)").matches) return;
      const imgs = gsap.utils.toArray<HTMLElement>(".fig img");
      const movers = imgs.map((img) => gsap.quickTo(img, "x", { duration: 0.8, ease: "power3.out" }));
      const onMove = (e: MouseEvent) => {
        const r = el.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        movers.forEach((m, i) => {
          const depth = figs.current[i]?.classList.contains("is-hero") ? 14 : 6;
          m(dx * depth);
        });
      };
      el.addEventListener("mousemove", onMove);
      return () => el.removeEventListener("mousemove", onMove);
    },
    { scope: stage }
  );

  curRef.current = cur;

  // step one look at a time so the queue walks forward instead of jumping
  const go = contextSafe((target: number) => {
    target = ((target % N) + N) % N;
    if (busy.current || target === curRef.current) return;
    busy.current = true;
    const fwd = (target - curRef.current + N) % N;
    const dir = fwd <= N / 2 ? 1 : -1;
    const step = () => {
      const next = (curRef.current + dir + N) % N;
      curRef.current = next;
      setCur(next);
      if (next !== target) setTimeout(step, 240);
      else setTimeout(() => (busy.current = false), 650);
    };
    step();
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.querySelector(".modal.open, .drawer.open")) return;
      if (e.key === "ArrowRight") go(curRef.current + 1);
      if (e.key === "ArrowLeft") go(curRef.current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  const touchX = useRef<number | null>(null);
  const look = looks[cur];
  const lookNo = "LOOK " + String(cur + 1).padStart(2, "0");

  return (
    <section
      className="stage"
      ref={stage}
      aria-label="Lookbook"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const d = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(d) > 50) go(curRef.current + (d < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="wm" aria-hidden="true"><span key={cur}>{look.name}</span></div>
      <div className="copy">
        <div className="cap">Varde · Low tide · <b>{String(cur + 1).padStart(2, "0")}</b> / {String(N).padStart(2, "0")}</div>
        <h1>Autumn Winter<br />2026</h1>
        <p>Brushed wool, bouclé and soft suede in the colours of a winter shoreline, cut easy for long walks home.</p>
      </div>

      {looks.map((l, i) => (
        <div
          key={l.id}
          className="fig"
          ref={(el) => { figs.current[i] = el; }}
          title={l.name}
          onClick={() => rel(i, cur) > 0 && go(i)}
        >
          <Image
            src={l.model}
            alt={`Model wearing look ${l.id}, ${l.name}`}
            width={330}
            height={1080}
            sizes="(max-width:600px) 60vw, 30vw"
            priority={Math.abs(i - cur) <= 3}
            draggable={false}
          />
        </div>
      ))}

      <div className="lookname" aria-live="polite" key={cur}>
        <span className="ln-i">
          {look.name.split("").map((c, i) => <span className="ch" key={i}>{c}</span>)}
        </span>
        <span className="ln-b">
          {lookNo.split("").map((c, i) => <span className="ch" key={i}>{c}</span>)}
        </span>
      </div>

      <div className="foot">
        <div className="arrows">
          <button aria-label="Previous look" onClick={() => go(curRef.current - 1)}>
            <svg width="14" viewBox="0 0 16 16" aria-hidden="true"><path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
          </button>
          <button aria-label="Next look" onClick={() => go(curRef.current + 1)}>
            <svg width="14" viewBox="0 0 16 16" aria-hidden="true"><path d="m6 3 5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
          </button>
        </div>
        <div className="shop">
          <button
            className="cap shoplook"
            onClick={() => {
              look.products.forEach((p) => add(p.id, "M"));
              setBagOpen(true);
              notify("Whole look added in size M");
            }}
          >
            Shop the look <svg width="18" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.2" /></svg>
          </button>
          <div className="prog">
            {looks.map((l, i) => (
              <button key={l.id} className={i === cur ? "on" : ""} aria-label={`Go to look ${i + 1}`} onClick={() => go(i)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
