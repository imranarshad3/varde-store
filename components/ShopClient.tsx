"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { CATEGORY_LABEL, type Category, type Product } from "@/lib/types";
import ProductCard from "./ProductCard";

gsap.registerPlugin(useGSAP);

const SORTS = { featured: "Featured", low: "Price, low to high", high: "Price, high to low", az: "Name, A–Z" } as const;
type Sort = keyof typeof SORTS;

export default function ShopClient({ products, initialCat, initialQ }: { products: Product[]; initialCat: string; initialQ: string }) {
  const [cat, setCat] = useState(initialCat);
  const [q, setQ] = useState(initialQ);
  const [sort, setSort] = useState<Sort>("featured");
  const [colors, setColors] = useState<Set<string>>(new Set());
  const [inStock, setInStock] = useState(false);
  const [maxPrice, setMaxPrice] = useState(600);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const grid = useRef<HTMLDivElement>(null);

  // keep the category in the URL so filtered views can be shared
  useEffect(() => {
    const u = new URL(window.location.href);
    cat === "all" ? u.searchParams.delete("c") : u.searchParams.set("c", cat);
    q ? u.searchParams.set("q", q) : u.searchParams.delete("q");
    window.history.replaceState(null, "", u);
  }, [cat, q]);

  const cats = useMemo(() => {
    const m = new Map<Category, number>();
    products.forEach((p) => m.set(p.category, (m.get(p.category) ?? 0) + 1));
    return [...m.entries()];
  }, [products]);

  const swatches = useMemo(() => {
    const m = new Map<string, string>();
    products.forEach((p) => m.has(p.colorName) || m.set(p.colorName, p.color));
    return [...m.entries()];
  }, [products]);

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    let r = products.filter((p) =>
      (cat === "all" || p.category === cat) &&
      (!term || `${p.name} ${p.colorName} ${p.material} ${CATEGORY_LABEL[p.category]}`.toLowerCase().includes(term)) &&
      (!colors.size || colors.has(p.colorName)) &&
      (!inStock || p.stock > 0) &&
      p.price <= maxPrice
    );
    if (sort === "low") r = [...r].sort((a, b) => a.price - b.price);
    if (sort === "high") r = [...r].sort((a, b) => b.price - a.price);
    if (sort === "az") r = [...r].sort((a, b) => a.name.localeCompare(b.name));
    return r;
  }, [products, cat, q, colors, inStock, maxPrice, sort]);

  useGSAP(() => {
    gsap.fromTo(".shop-grid .card", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.035, ease: "power3.out" });
  }, { scope: grid, dependencies: [cat, sort, colors.size, inStock, maxPrice, q.length > 0] });

  useGSAP(() => {
    gsap.from(".shop-hero > *", { y: 30, opacity: 0, duration: 1, stagger: 0.1, ease: "power3.out" });
  });

  const reset = () => { setCat("all"); setQ(""); setColors(new Set()); setInStock(false); setMaxPrice(600); setSort("featured"); };
  const active = cat !== "all" || q || colors.size || inStock || maxPrice < 600;
  const title = cat === "all" ? "The collection" : CATEGORY_LABEL[cat as Category] ?? "The collection";

  return (
    <main className="shop">
      <header className="shop-hero">
        <p className="eyebrow">Low Tide · Autumn Winter 2026</p>
        <h1 className="display">{title}</h1>
        <p className="lead">{list.length} {list.length === 1 ? "piece" : "pieces"}, made in small runs from natural fibres.</p>
      </header>

      <div className="chips" role="tablist" aria-label="Category">
        <button role="tab" aria-selected={cat === "all"} className={cat === "all" ? "on" : ""} onClick={() => setCat("all")}>All <sup>{products.length}</sup></button>
        {cats.map(([c, n]) => (
          <button role="tab" key={c} aria-selected={cat === c} className={cat === c ? "on" : ""} onClick={() => setCat(c)}>{CATEGORY_LABEL[c]} <sup>{n}</sup></button>
        ))}
      </div>

      <div className="toolbar">
        <div className="search">
          <svg width="15" viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.3" /><path d="m13.5 13.5 5 5" stroke="currentColor" strokeWidth="1.3" /></svg>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search coats, cashmere, suede…" aria-label="Search products" />
          {q && <button onClick={() => setQ("")} aria-label="Clear search">×</button>}
        </div>
        <button className="filt-btn" onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}>
          Filters{colors.size || inStock || maxPrice < 600 ? ` · ${colors.size + Number(inStock) + Number(maxPrice < 600)}` : ""}
        </button>
        <label className="sort">
          <span>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </label>
      </div>

      {filtersOpen && (
        <div className="filters">
          <div className="f-group">
            <h4>Colour</h4>
            <div className="f-sw">
              {swatches.map(([name, hex]) => {
                const on = colors.has(name);
                return (
                  <button key={name} className={on ? "on" : ""} aria-pressed={on}
                    onClick={() => setColors((s) => { const n = new Set(s); on ? n.delete(name) : n.add(name); return n; })}>
                    <i style={{ background: hex }} />{name}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="f-group">
            <h4>Price up to <b>${maxPrice}</b></h4>
            <input type="range" min={50} max={600} step={10} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} aria-label="Maximum price" />
            <label className="f-check"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} /> In stock only</label>
          </div>
          {active ? <button className="ul f-reset" onClick={reset}>Clear all filters</button> : null}
        </div>
      )}

      <div className="shop-grid" ref={grid}>
        {list.map((p, i) => <ProductCard key={p.id} p={p} tag={i < 2 && sort === "featured" && cat === "all" ? "New in" : undefined} />)}
      </div>
      {!list.length && (
        <div className="none">
          <p className="display sm">Nothing matches just yet.</p>
          <button className="btn-line" onClick={reset}>Clear filters</button>
        </div>
      )}
    </main>
  );
}
