import Link from "next/link";
import { notFound } from "next/navigation";
import { getLooks, getProductById } from "@/lib/queries";
import { IMAGE_CHOICES } from "@/lib/seed";
import { deleteProductAction } from "../../../actions";
import ProductForm from "./ProductForm";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const isNew = id === "new";
  const p = isNew ? null : await getProductById(Number(id));
  if (!isNew && !p) notFound();
  const looks = (await getLooks()).map((l) => ({ id: l.id, name: l.name }));

  return (
    <div className="adm-page narrow">
      <header className="adm-head">
        <div>
          <Link href="/admin/products" className="adm-link sm">← Products</Link>
          <h1>{isNew ? "New product" : p!.name}</h1>
        </div>
        {p && <Link href={`/product/${p.slug}`} target="_blank" className="a-btn ghost">View in store ↗</Link>}
      </header>
      {sp.saved && <p className="a-ok">Product created. It&apos;s live in the store.</p>}
      <ProductForm p={p} looks={looks} images={IMAGE_CHOICES} />
      {p && (
        <form action={deleteProductAction} className="danger">
          <input type="hidden" name="id" value={p.id} />
          <div><b>Delete this product</b><p className="adm-muted sm">It disappears from the store. Past orders keep their copy of it.</p></div>
          <label className="adm-muted sm confirm"><input type="checkbox" required /> Yes, delete it</label>
          <button className="a-btn danger">Delete product</button>
        </form>
      )}
    </div>
  );
}
