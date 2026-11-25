"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStore } from "@/lib/store";
import SearchOverlay from "./SearchOverlay";

gsap.registerPlugin(useGSAP);

const NAV = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?c=outer", label: "Outerwear" },
  { href: "/lookbook", label: "Lookbook" },
  { href: "/journal", label: "Journal" },
];

export default function Header() {
  const { count, saved, setBagOpen, settings } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLSpanElement>(null);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const path = usePathname();
  const home = path === "/";

  useGSAP(
    () => {
      const d = home ? 1.5 : 0;
      gsap.from(".logo", { y: 14, opacity: 0, letterSpacing: "0.55em", duration: 1.3, ease: "power3.out", delay: d });
      gsap.from(".header nav > *", { y: -8, autoAlpha: 0, duration: 0.7, stagger: 0.05, ease: "power2.out", delay: d + 0.2, clearProps: "opacity,visibility,transform" });
      gsap.to(".mq-track", { xPercent: -50, duration: 40, ease: "none", repeat: -1 });
    },
    { scope: ref }
  );

  useGSAP(() => {
    if (count > 0 && badge.current) gsap.fromTo(badge.current, { scale: 1.8 }, { scale: 1, duration: 0.6, ease: "elastic.out(1,0.45)" });
  }, { dependencies: [count] });

  useGSAP(() => {
    if (menu) gsap.fromTo(".mmenu a", { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.06, duration: 0.6, ease: "power3.out" });
  }, { dependencies: [menu], scope: ref });

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(t.tagName)) { e.preventDefault(); setSearch(true); }
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const items = [...settings.announcements, ...settings.announcements];

  return (
    <div ref={ref} className="topwrap">
      <div className="bar" aria-label="Announcements">
        <div className="mq-track">{items.map((t, i) => <span key={i}>{t}<em>✦</em></span>)}</div>
      </div>
      <header className="header">
        <nav className="l">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className={`ul${path === n.href.split("?")[0] ? " act" : ""}`}>{n.label}</Link>
          ))}
        </nav>
        <button className="burger" onClick={() => setMenu(!menu)} aria-label={menu ? "Close menu" : "Open menu"} aria-expanded={menu}>
          <svg width="22" viewBox="0 0 22 12" aria-hidden="true">
            {menu ? <path d="M4 0l14 12M18 0 4 12" stroke="currentColor" strokeWidth="1.3" /> : <path d="M0 1h22M0 11h14" stroke="currentColor" strokeWidth="1.3" />}
          </svg>
        </button>
        <Link href="/" className="logo" aria-label="VARDE home">VARDE</Link>
        <nav className="r">
          <button className="ic" aria-label="Search" onClick={() => setSearch(true)}>
            <svg width="17" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="m13.5 13.5 5 5" stroke="currentColor" strokeWidth="1.3" /></svg>
          </button>
          <Link href="/account" className="hide ic" aria-label="Account">
            <svg width="17" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="6.5" r="4" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M2.5 19c.8-4 3.8-6 7.5-6s6.7 2 7.5 6" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
          </Link>
          <Link href="/account#saved" className="hide ic" aria-label={`Saved, ${saved.size} pieces`}>
            <svg width="18" viewBox="0 0 24 22" aria-hidden="true"><path d="M12 20.5 2.8 11.4A5.4 5.4 0 0 1 12 4a5.4 5.4 0 0 1 9.2 7.4Z" fill={saved.size ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.4" /></svg>
          </Link>
          <button id="bagBtn" className="ic bagbtn" onClick={() => setBagOpen(true)} aria-label={`Bag, ${count} items`}>
            <svg width="18" viewBox="0 0 20 22" aria-hidden="true"><path d="M3 7h14l-1 14H4L3 7Z" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="M7 9V5a3 3 0 0 1 6 0v4" fill="none" stroke="currentColor" strokeWidth="1.3" /></svg>
            <span className="count" ref={badge}>{count}</span>
          </button>
        </nav>
      </header>
      <SearchOverlay open={search} onClose={() => setSearch(false)} />
      {menu && (
        <div className="mmenu" onClick={() => setMenu(false)}>
          {[...NAV, { href: "/about", label: "About" }, { href: "/account", label: "Account" }, { href: "/contact", label: "Contact" }].map((n) => (
            <Link key={n.href + n.label} href={n.href}>{n.label}</Link>
          ))}
        </div>
      )}
    </div>
  );
}
