import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLooks, getProductBySlug, getProducts, getReviews } from "@/lib/queries";
import ProductView from "@/components/ProductView";

type P = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  return { title: p ? `${p.name} · VARDE` : "Not found · VARDE", description: p?.description };
}

export default async function ProductPage({ params }: P) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  const [looks, all, reviews] = await Promise.all([getLooks(), getProducts(), getReviews(p.id)]);
  const look = looks.find((l) => l.id === p.lookId) ?? null;
  const related = all.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  return <ProductView p={p} look={look} related={related} reviews={reviews} />;
}
