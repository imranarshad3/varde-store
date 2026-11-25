import Image from "next/image";
import Link from "next/link";
import { getProducts, waitlistCounts } from "@/lib/queries";
import { hasDb } from "@/lib/db";
import { CATEGORY_LABEL, money } from "@/lib/types";
import { quickStockAction } from "../../actions";

export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; c?: string; sort?: string; deleted?: string }> }) {
  const sp = await searchParams;
  let list = await getProducts({ all: true });
  const wl = await waitlistCounts();
  const q = (sp.q ?? "").toLowerCase();
  if (q) list = list.filter((p) => `${p.name} ${p.colorName} ${p.slug}`.toLowerCase().includes(q));
  if (sp.c) list = list.filter((p) => p.category === sp.c);
  if (sp.sort === "stock") list = [...list].sort((a, b) => a.stock - b.stock);
  if (sp.sort === "price") list = [...list].sort((a, b) => b.price - a.price);
  const value = list.reduce((s, p) => s + p.price * p.stock, 0);

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div><p className="adm-eyebrow">Catalogue</p><h1>Products</h1></div>
        <Link href="/admin/products/new" className="a-btn">+ New product</Link>
      </header>
      {sp.deleted && <p className="a-ok">Product deleted.</p>}
      <form className="afilters">
        <input name="q" defaultValue={sp.q} placeholder="Search products…" aria-label="Search products" />
        <select name="c" defaultValue={sp.c ?? ""} aria-label="Category">
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select name="sort" defaultValue={sp.sort ?? ""} aria-label="Sort">
          <option value="">By look</option><option value="stock">Lowest stock</option><option value="price">Highest price</option>
        </select>
        <button className="a-btn ghost">Apply</button>
        <span className="adm-muted">{list.length} products · {money(value)} stock value</span>
      </form>
      <div className="adm-card flush">
        <table className="atable">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="prod-cell">
                    <span className="tl-img"><Image src={p.img} alt="" fill sizes="44px" /></span>
                    <div><Link href={`/admin/products/${p.id}`} className="adm-link"><b>{p.name}</b></Link><div className="adm-muted sm"><i className="dot" style={{ background: p.color }} />{p.colorName}{p.reviews ? ` · ★ ${p.rating} (${p.reviews})` : ""}{wl[p.id] ? <span className="tagsm">{wl[p.id]} waiting</span> : null}</div></div>
                  </div>
                </td>
                <td>{CATEGORY_LABEL[p.category]}</td>
                <td className="num">{money(p.price)}</td>
                <td>
                  {hasDb ? (
                    <form action={quickStockAction} className="qstock">
                      <input type="hidden" name="id" value={p.id} />
                      <input name="stock" type="number" min={0} defaultValue={p.stock} aria-label={`Stock for ${p.name}`} className={p.stock <= 5 ? "low" : ""} />
                      <button aria-label="Save stock">✓</button>
                    </form>
                  ) : p.stock}
                </td>
                <td><span className={`pill ${p.published ? "delivered" : "pending"}`}>{p.published ? "Live" : "Hidden"}</span></td>
                <td className="num"><Link href={`/admin/products/${p.id}`} className="adm-link">Edit</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
