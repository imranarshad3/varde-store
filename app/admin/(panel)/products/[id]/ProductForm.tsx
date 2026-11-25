"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { saveProductAction } from "../../../actions";
import { CATEGORY_LABEL, type Product } from "@/lib/types";

export default function ProductForm({ p, looks, images }: { p: Product | null; looks: { id: number; name: string }[]; images: string[] }) {
  const [state, action, pending] = useActionState(saveProductAction, null);
  const [img, setImg] = useState(p?.img ?? images[0]);
  const [color, setColor] = useState(p?.color ?? "#b07a4c");
  const [pick, setPick] = useState(false);

  return (
    <form action={action} className="pform">
      {p && <input type="hidden" name="id" value={p.id} />}
      <input type="hidden" name="img" value={img} />
      <div className="pf-img adm-card">
        <div className="pf-prev"><Image src={img} alt="" fill sizes="280px" /></div>
        <button type="button" className="a-btn ghost full" onClick={() => setPick(!pick)}>{pick ? "Close" : "Change photo"}</button>
        {pick && (
          <div className="pf-pick">
            {images.map((src) => (
              <button type="button" key={src} className={src === img ? "on" : ""} onClick={() => { setImg(src); setPick(false); }} aria-label={`Use ${src}`}>
                <Image src={src} alt="" fill sizes="70px" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="pf-fields adm-card">
        <div className="af full"><label htmlFor="name">Name</label><input id="name" name="name" defaultValue={p?.name} required maxLength={120} /></div>
        <div className="af"><label htmlFor="price">Price (USD)</label><input id="price" name="price" type="number" min={1} step={1} defaultValue={p?.price ?? 200} required /></div>
        <div className="af"><label htmlFor="stock">Stock</label><input id="stock" name="stock" type="number" min={0} step={1} defaultValue={p?.stock ?? 10} required /></div>
        <div className="af"><label htmlFor="category">Category</label>
          <select id="category" name="category" defaultValue={p?.category ?? "knit"}>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="af"><label htmlFor="lookId">Look</label>
          <select id="lookId" name="lookId" defaultValue={p?.lookId ?? 0}>
            <option value={0}>Not in a look</option>
            {looks.map((l) => <option key={l.id} value={l.id}>{String(l.id).padStart(2, "0")} · {l.name}</option>)}
          </select>
        </div>
        <div className="af"><label htmlFor="colorName">Colour name</label><input id="colorName" name="colorName" defaultValue={p?.colorName} maxLength={40} /></div>
        <div className="af"><label htmlFor="color">Swatch</label>
          <div className="colorpick"><input id="color" name="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} /><code>{color}</code></div>
        </div>
        <div className="af full"><label htmlFor="description">Description</label><textarea id="description" name="description" rows={4} defaultValue={p?.description} /></div>
        <div className="af"><label htmlFor="material">Composition</label><input id="material" name="material" defaultValue={p?.material} maxLength={200} /></div>
        <div className="af"><label htmlFor="slug">URL slug <i>(optional)</i></label><input id="slug" name="slug" defaultValue={p?.slug} maxLength={120} placeholder="made-from-the-name" /></div>
        <div className="af full"><label htmlFor="care">Care</label><input id="care" name="care" defaultValue={p?.care} maxLength={400} /></div>
        <label className="toggle full"><input type="checkbox" name="published" defaultChecked={p?.published ?? true} /><span />Show in the store</label>
        {state?.error && <p className="a-err full" role="alert">{state.error}</p>}
        {state?.ok && <p className="a-ok full" role="status">{state.message}</p>}
        <div className="full pf-save"><button className="a-btn" disabled={pending}>{pending ? "Saving…" : p ? "Save changes" : "Create product"}</button></div>
      </div>
    </form>
  );
}
