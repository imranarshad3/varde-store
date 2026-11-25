"use client";

import Link from "next/link";
import { useStore } from "@/lib/store";
import ProductCard from "./ProductCard";

export default function SavedList() {
  const { saved, byId, hydrated } = useStore();
  if (!hydrated) return null;
  const items = [...saved].map(byId).filter((p): p is NonNullable<typeof p> => Boolean(p));
  if (!items.length) return <p className="muted">Nothing saved yet. Tap the heart on any piece to keep it here. <Link href="/shop" className="ul">Browse the shop</Link></p>;
  return <div className="four">{items.map((p) => <ProductCard key={p.id} p={p} />)}</div>;
}
