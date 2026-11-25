import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Our story · VARDE" };

const VALUES = [
  { h: "Fewer, better", p: "Two collections a year, never more. Every piece earns its place, and nothing is made to be thrown away." },
  { h: "Natural fibres", p: "Wool, cashmere, alpaca, silk, cotton and leather. They breathe, they age well and they can be mended." },
  { h: "Workshops we know", p: "We work with a small group of mills and makers, visit them every season and pay for their time properly." },
  { h: "Repairs for life", p: "Send back any VARDE coat or knit and we'll mend it free, for as long as you own it." },
];

export default function About() {
  return (
    <main className="page about">
      <Reveal className="ab-hero">
        <div className="ab-hero-txt">
          <p className="eyebrow" data-reveal>Our story</p>
          <h1 className="display xl" data-reveal>Clothes for a <em>long life.</em></h1>
          <p className="lead" data-reveal>VARDE is Norwegian for a stone cairn: a small marker left on a coastline so the next walker can find the way. We make clothes the same way, quietly and to last.</p>
        </div>
        <div className="ab-hero-img" data-reveal="img"><Image src="/img/m9.webp" alt="Model in the bouclé wool coat" fill priority sizes="(max-width:800px) 100vw, 40vw" data-parallax /></div>
      </Reveal>

      <Reveal className="sec quote">
        <blockquote data-reveal>
          “We would rather sell you one coat that you wear for ten winters than ten coats you wear for one.”
        </blockquote>
        <p className="eyebrow" data-reveal>The VARDE studio</p>
      </Reveal>

      <Reveal className="sec values">
        {VALUES.map((v, i) => (
          <div key={v.h} className="val" data-reveal data-delay={i * 0.08}>
            <h3>{v.h}</h3>
            <p>{v.p}</p>
          </div>
        ))}
      </Reveal>

      <Reveal className="sec story">
        <div className="st-img" data-reveal="img"><Image src="/img/m2.webp" alt="Model in the suede bomber" fill sizes="(max-width:800px) 100vw, 45vw" data-parallax /></div>
        <div className="st-txt">
          <p className="eyebrow" data-reveal>From the studio</p>
          <h2 className="display sm" data-reveal>Designed slowly, <em>by hand.</em></h2>
          <p data-reveal>Each collection begins with a walk and a camera, and ends nine months later with a garment we&apos;re proud to put our name in. In between there are lab dips, fittings, wear tests and a lot of patience.</p>
          <p data-reveal>We publish what we make, how it&apos;s made, and how to look after it. If something isn&apos;t right, tell us. That&apos;s how the next collection gets better.</p>
          <Link href="/journal" className="btn-line" data-reveal>Read the journal</Link>
        </div>
      </Reveal>
    </main>
  );
}
