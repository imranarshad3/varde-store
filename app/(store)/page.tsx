import Image from "next/image";
import Link from "next/link";
import { getLooks, getProducts } from "@/lib/queries";
import { ARTICLES, fmtDate } from "@/lib/journal";
import HomeHero from "@/components/HomeHero";
import Loader from "@/components/Loader";
import Reveal from "@/components/Reveal";
import Rail from "@/components/Rail";

export default async function Home() {
  const [looks, products] = await Promise.all([getLooks(), getProducts()]);
  const pick = (cat: string) => products.find((p) => p.category === cat);
  const cats = [
    { c: "outer", t: "Outerwear", sub: "Coats, bombers and overshirts", p: pick("outer") },
    { c: "knit", t: "Knitwear", sub: "Lambswool, merino, cashmere", p: products.find((p) => p.slug === "chunky-rib-jumper") ?? pick("knit") },
    { c: "shoes", t: "Footwear", sub: "Made to be resoled", p: pick("shoes") },
  ];
  const fresh = [...products].sort((a, b) => b.price - a.price).slice(0, 10);

  return (
    <>
      <Loader />
      <HomeHero looks={looks.filter((l) => l.products.length)} />

      <Reveal className="sec intro">
        <p className="eyebrow" data-reveal>The Autumn Winter 2026 collection</p>
        <h2 className="display" data-reveal>
          Brushed wool, bouclé and soft suede, in the colours of a <em>winter shoreline</em>.
        </h2>
        <Link href="/lookbook" className="btn-line" data-reveal>Explore the lookbook</Link>
      </Reveal>

      <Reveal className="sec cats">
        {cats.map((c, i) => c.p && (
          <Link href={`/shop?c=${c.c}`} className="cat-tile" key={c.c} data-reveal data-delay={i * 0.12}>
            <div className="ct-img" data-reveal="img">
              <Image src={c.p.img} alt="" fill sizes="(max-width:700px) 100vw, 33vw" data-parallax />
            </div>
            <div className="ct-txt">
              <h3>{c.t}</h3>
              <span>{c.sub}</span>
            </div>
          </Link>
        ))}
      </Reveal>

      <Reveal className="sec feat">
        <div className="sec-head" data-reveal>
          <div>
            <p className="eyebrow">Signature pieces</p>
            <h2 className="h2">The pieces we&apos;d keep forever</h2>
          </div>
          <Link href="/shop" className="btn-line">Shop all</Link>
        </div>
        <Rail products={fresh} />
      </Reveal>

      <Reveal className="sec story">
        <div className="st-img" data-reveal="img">
          <Image src="/img/m5.webp" alt="Model wearing the camel knit dress and cream scarf" fill sizes="(max-width:800px) 100vw, 45vw" data-parallax />
        </div>
        <div className="st-txt">
          <p className="eyebrow" data-reveal>Our promise</p>
          <h2 className="display sm" data-reveal>Made slowly, <em>worn for years.</em></h2>
          <p data-reveal>Every VARDE piece is made in small runs by workshops we know by name. We use natural fibres, finish by hand, and repair what we make for as long as you own it.</p>
          <ul className="promises" data-reveal>
            <li><b>Free repairs for life</b><span>On every coat and knit</span></li>
            <li><b>365-day returns</b><span>Free, no questions</span></li>
            <li><b>Natural fibres</b><span>Wool, cashmere, silk, leather</span></li>
          </ul>
          <Link href="/about" className="btn-line" data-reveal>Our story</Link>
        </div>
      </Reveal>

      <Reveal className="sec journal-teaser">
        <div className="sec-head" data-reveal>
          <div>
            <p className="eyebrow">The journal</p>
            <h2 className="h2">Notes from the studio</h2>
          </div>
          <Link href="/journal" className="btn-line">All stories</Link>
        </div>
        <div className="jt-grid">
          {ARTICLES.map((a, i) => (
            <Link href={`/journal/${a.slug}`} className="jcard" key={a.slug} data-reveal data-delay={i * 0.1}>
              <div className="jc-img"><Image src={a.cover} alt="" fill sizes="(max-width:700px) 100vw, 33vw" /></div>
              <p className="jc-k">{a.kicker} · {fmtDate(a.date)}</p>
              <h3>{a.title}</h3>
              <p className="jc-x">{a.excerpt}</p>
            </Link>
          ))}
        </div>
      </Reveal>
    </>
  );
}
