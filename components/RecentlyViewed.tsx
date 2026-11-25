"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import type { Product } from "@/lib/types";
import Rail from "./Rail";

const KEY = "varde-recent";

/** Records this product as viewed and shows the others the visitor looked at. */
export default function RecentlyViewed({ currentId }: { currentId: number }) {
  const { byId } = useStore();
  const [items, setItems] = useState<Product[]>([]);

  useEffect(() => {
    let ids: number[] = [];
    try { ids = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
    const others = ids.filter((id) => id !== currentId);
    setItems(others.map(byId).filter((p): p is Product => Boolean(p)).slice(0, 10));
    try { localStorage.setItem(KEY, JSON.stringify([currentId, ...others].slice(0, 16))); } catch {}
  }, [currentId, byId]);

  if (!items.length) return null;
  return (
    <section className="sec recent">
      <div className="sec-head"><div><p className="eyebrow">Picking up where you left off</p><h2 className="h2">Recently viewed</h2></div></div>
      <Rail products={items} />
    </section>
  );
}
