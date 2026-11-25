"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useStore } from "@/lib/store";
import { CATEGORY_LABEL, SIZES, money, type Look, type Product, type Review } from "@/lib/types";
import ProductCard, { flyToBag } from "./ProductCard";
import Reveal from "./Reveal";
import Stars from "./Stars";
import Reviews from "./Reviews";
import Waitlist from "./Waitlist";
import RecentlyViewed from "./RecentlyViewed";

gsap.registerPlugin(useGSAP);

export default function ProductView({ p, look, related, reviews }: { p: Product; look: Look | null; related: Product[]; reviews: Review[] }) {
  const { add, notify, saved, toggleSaved, setBagOpen, settings } = useStore();
  const [size, setSize] = useState<string | null>(null);
  const [shot, setShot] = useState(0);
  const [open, setOpen] = useState<number>(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const root = useRef<HTMLElement>(null);
  const mainImg = useRef<HTMLDivElement>(null);

  const shots = [
    { src: p.img, alt: p.name, kind: "product" },
    ...(look ? [{ src: look.model, alt: `${p.name} worn in the ${look.name} look`, kind: "model" }] : []),
  ];
  const soldOut = p.stock <= 0;

  useGSAP(() => {
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".pv-main", { clipPath: "inset(0 0 100% 0)", duration: 1.3, ease: "expo.out" })
      .from(".pv-info > *", { y: 24, opacity: 0, duration: 0.8, stagger: 0.06 }, 0.2);
  }, { scope: root });

  useGSAP(() => {
    gsap.fromTo(".pv-main img", { opacity: 0, scale: 1.04 }, { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" });
  }, { scope: root, dependencies: [shot] });

  const addToBag = () => {
    if (!size) {
      gsap.fromTo(".pv-sizes", { x: -8 }, { x: 0, duration: 0.5, ease: "elastic.out(1,0.3)" });
      notify("Please choose a size");
      return;
    }
    add(p.id, size);
    flyToBag(mainImg.current);
    notify(`${p.name} · ${size} added to bag`);
    setTimeout(() => setBagOpen(true), 700);
  };

  const acc = [
    { h: "Details", b: <><p>{p.description}</p><p><b>Composition:</b> {p.material}</p><p>Colour: {p.colorName}. Designed in our studio, made in small runs.</p></> },
    { h: "Care", b: <p>{p.care}</p> },
    { h: "Delivery & returns", b: <p>Complimentary delivery on orders over {money(settings.freeShipping)}, otherwise $15. Express delivery $25. Free returns within 365 days. <Link className="ul" href="/shipping-returns">Read more</Link></p> },
  ];

  return (
    <>
      <main className="pv" ref={root}>
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href="/" className="ul">Home</Link><span>/</span>
          <Link href={`/shop?c=${p.category}`} className="ul">{CATEGORY_LABEL[p.category]}</Link><span>/</span>
          <span aria-current="page">{p.name}</span>
        </nav>
        <div className="pv-gal">
          <div className="pv-thumbs">
            {shots.map((s, i) => (
              <button key={s.src} className={i === shot ? "on" : ""} onClick={() => setShot(i)} aria-label={`Show ${s.kind} photo`}>
                <Image src={s.src} alt="" fill sizes="80px" className={s.kind} />
              </button>
            ))}
          </div>
          <div
            className={`pv-main ${shots[shot].kind}${zoom ? " zoomed" : ""}`}
            ref={mainImg}
            onMouseMove={(e) => {
              if (shots[shot].kind !== "product" || window.matchMedia("(pointer:coarse)").matches) return;
              const r = e.currentTarget.getBoundingClientRect();
              setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoom(null)}
          >
            <Image
              src={shots[shot].src} alt={shots[shot].alt} fill priority sizes="(max-width:900px) 100vw, 55vw"
              style={zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%`, transform: "scale(1.8)" } : undefined}
            />
          </div>
        </div>

        <div className="pv-info">
          <p className="eyebrow">{CATEGORY_LABEL[p.category]}{look ? ` · ${look.name}` : ""}</p>
          <h1 className="pv-name">{p.name}</h1>
          <div className="pv-pr">
            <p className="pv-price">{money(p.price)}</p>
            {p.reviews ? <a href="#reviews" className="pv-rating"><Stars value={p.rating ?? 0} /> <span className="ul">{p.reviews} review{p.reviews > 1 ? "s" : ""}</span></a> : null}
          </div>
          <div className="pv-color"><i style={{ background: p.color }} />{p.colorName}</div>

          <div className="pv-size-h">
            <span>Size{size ? <b> · {size}</b> : ""}</span>
            <Link href="/size-guide" className="ul">Size guide</Link>
          </div>
          <div className="pv-sizes" role="radiogroup" aria-label="Size">
            {SIZES.map((s) => (
              <button key={s} role="radio" aria-checked={size === s} className={size === s ? "on" : ""} disabled={soldOut} onClick={() => setSize(s)}>{s}</button>
            ))}
          </div>
          <p className={`pv-stock${p.stock <= 5 ? " low" : ""}`}>
            {soldOut ? "Sold out for now" : p.stock <= 5 ? `Only ${p.stock} left, made in a small run` : "In stock, ships within 1–2 working days"}
          </p>
          {soldOut && <Waitlist productId={p.id} />}
          <div className="pv-ctas">
            <button className="btn big" onClick={addToBag} disabled={soldOut}>{soldOut ? "Sold out" : size ? `Add to bag · ${money(p.price)}` : "Select a size"}</button>
            <button className={`pv-save${saved.has(p.id) ? " on" : ""}`} aria-pressed={saved.has(p.id)} aria-label="Save"
              onClick={() => { toggleSaved(p.id); notify(saved.has(p.id) ? "Removed from saved" : "Saved for later"); }}>
              <svg viewBox="0 0 24 22" width="18" aria-hidden="true"><path d="M12 20.5 2.8 11.4A5.4 5.4 0 0 1 12 4a5.4 5.4 0 0 1 9.2 7.4Z" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>
          <ul className="pv-perks">
            <li>Free repairs for life</li><li>365-day free returns</li><li>Natural fibres only</li>
          </ul>
          <div className="acc">
            {acc.map((a, i) => (
              <div key={a.h} className={`acc-i${open === i ? " open" : ""}`}>
                <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{a.h}<span>{open === i ? "−" : "+"}</span></button>
                <div className="acc-b">{a.b}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Reviews productId={p.id} productName={p.name} reviews={reviews} rating={p.rating} count={p.reviews} />

      {look && look.products.length > 1 && (
        <Reveal className="sec ctl">
          <div className="ctl-img" data-reveal="img"><Image src={look.model} alt={`The ${look.name} look`} fill sizes="(max-width:800px) 100vw, 30vw" /></div>
          <div>
            <div className="sec-head" data-reveal>
              <div><p className="eyebrow">Complete the look</p><h2 className="h2">{look.name}</h2></div>
              <Link href="/lookbook" className="btn-line">All looks</Link>
            </div>
            <div className="ctl-grid">
              {look.products.filter((x) => x.id !== p.id).map((x) => <div key={x.id} data-reveal><ProductCard p={x} sizes="(max-width:700px) 50vw, 20vw" /></div>)}
            </div>
          </div>
        </Reveal>
      )}

      {related.length > 0 && (
        <Reveal className="sec">
          <div className="sec-head" data-reveal><div><p className="eyebrow">You may also like</p><h2 className="h2">More {CATEGORY_LABEL[p.category].toLowerCase()}</h2></div></div>
          <div className="four">{related.map((x) => <div key={x.id} data-reveal><ProductCard p={x} /></div>)}</div>
        </Reveal>
      )}

      <RecentlyViewed currentId={p.id} />
    </>
  );
}
