import Image from "next/image";
import Link from "next/link";
import { getLooks } from "@/lib/queries";
import { money } from "@/lib/types";
import Reveal from "@/components/Reveal";
import ShopLookButton from "@/components/ShopLookButton";

export const metadata = { title: "Lookbook · VARDE" };

export default async function LookbookPage() {
  const looks = (await getLooks()).filter((l) => l.products.length);
  return (
    <main className="page lookbook">
      <Reveal className="page-hero center">
        <p className="eyebrow" data-reveal>Autumn Winter 2026</p>
        <h1 className="display xl" data-reveal>Low <em>Tide</em></h1>
        <p className="lead" data-reveal>Nine looks in sand, stone, ink and rust. Each one is shoppable piece by piece.</p>
      </Reveal>
      {looks.map((l, i) => {
        const total = l.products.reduce((s, p) => s + p.price, 0);
        return (
          <Reveal className={`lk${i % 2 ? " flip" : ""}`} key={l.id}>
            <div className="lk-img" data-reveal="img">
              <span className="lk-no" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <Image src={l.model} alt={`Look ${i + 1}: ${l.name}`} fill sizes="(max-width:800px) 100vw, 45vw" data-parallax />
            </div>
            <div className="lk-txt">
              <p className="eyebrow" data-reveal>Look {String(i + 1).padStart(2, "0")}</p>
              <h2 className="display sm" data-reveal><em>{l.name}</em></h2>
              <ul className="lk-list" data-reveal>
                {l.products.map((p) => (
                  <li key={p.id}>
                    <Link href={`/product/${p.slug}`}>
                      <span className="lk-thumb"><Image src={p.img} alt="" fill sizes="56px" /></span>
                      <span className="lk-n">{p.name}<i>{p.colorName}</i></span>
                      <span className="lk-p">{money(p.price)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="lk-foot" data-reveal>
                <span>The full look · {money(total)}</span>
                <ShopLookButton ids={l.products.filter((p) => p.stock > 0).map((p) => p.id)} />
              </div>
            </div>
          </Reveal>
        );
      })}
    </main>
  );
}
