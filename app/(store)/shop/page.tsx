import type { Metadata } from "next";
import { getProducts } from "@/lib/queries";
import ShopClient from "@/components/ShopClient";

export const metadata: Metadata = { title: "Shop all · VARDE" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string; q?: string }> }) {
  const [products, sp] = await Promise.all([getProducts(), searchParams]);
  return <ShopClient products={products} initialCat={sp.c ?? "all"} initialQ={sp.q ?? ""} />;
}
