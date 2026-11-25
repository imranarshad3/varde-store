import Image from "next/image";
import Link from "next/link";
import { ARTICLES, fmtDate } from "@/lib/journal";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Journal · VARDE" };

export default function Journal() {
  const [lead, ...rest] = ARTICLES;
  return (
    <main className="page journal">
      <Reveal className="page-hero">
        <p className="eyebrow" data-reveal>The journal</p>
        <h1 className="display" data-reveal>Notes from the <em>studio</em></h1>
      </Reveal>
      <Reveal className="j-lead">
        <Link href={`/journal/${lead.slug}`} className="j-lead-link">
          <div className="j-lead-img" data-reveal="img"><Image src={lead.cover} alt="" fill priority sizes="(max-width:800px) 100vw, 55vw" data-parallax /></div>
          <div className="j-lead-txt">
            <p className="eyebrow" data-reveal>{lead.kicker} · {fmtDate(lead.date)}</p>
            <h2 className="display sm" data-reveal>{lead.title}</h2>
            <p data-reveal>{lead.excerpt}</p>
            <span className="btn-line" data-reveal>Read the story</span>
          </div>
        </Link>
      </Reveal>
      <Reveal className="sec jt-grid two">
        {rest.map((a, i) => (
          <Link href={`/journal/${a.slug}`} className="jcard" key={a.slug} data-reveal data-delay={i * 0.1}>
            <div className="jc-img"><Image src={a.cover} alt="" fill sizes="(max-width:700px) 100vw, 45vw" /></div>
            <p className="jc-k">{a.kicker} · {fmtDate(a.date)}</p>
            <h3>{a.title}</h3>
            <p className="jc-x">{a.excerpt}</p>
          </Link>
        ))}
      </Reveal>
    </main>
  );
}
