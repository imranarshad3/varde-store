"use client";

import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { money } from "@/lib/types";

export default function BagLines({ big = false }: { big?: boolean }) {
  const { lines, setQty, remove } = useStore();
  return (
    <div className={big ? "lines big" : "lines"}>
      {lines.map((l) => (
        <div className="li" key={l.key}>
          <Link href={`/product/${l.p.slug}`} className="ti"><Image src={l.p.img} alt={l.p.name} fill sizes={big ? "140px" : "80px"} /></Link>
          <div className="li-m">
            <Link href={`/product/${l.p.slug}`} className="n">{l.p.name}</Link>
            <div className="s">{l.p.colorName} · Size {l.size}</div>
            <div className="qty">
              <div className="q">
                <button aria-label="Decrease quantity" onClick={() => setQty(l.key, l.qty - 1)}>−</button>
                <span>{l.qty}</span>
                <button aria-label="Increase quantity" onClick={() => setQty(l.key, Math.min(l.p.stock, l.qty + 1))}>+</button>
              </div>
              <button className="rm ul" onClick={() => remove(l.key)}>Remove</button>
            </div>
          </div>
          <div className="t">{money(l.p.price * l.qty)}</div>
        </div>
      ))}
    </div>
  );
}
