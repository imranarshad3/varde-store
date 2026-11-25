import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ARTICLES, articleBySlug, fmtDate } from "@/lib/journal";
import Reveal from "@/components/Reveal";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const a = articleBySlug((await params).slug);
  return { title: a ? `${a.title} · VARDE Journal` : "Journal · VARDE", description: a?.excerpt };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const next = ARTICLES[(ARTICLES.indexOf(a) + 1) % ARTICLES.length];
  return (
    <main className="page article">
      <Reveal className="art-head">
        <Link href="/journal" className="ul back" data-reveal>← Journal</Link>
        <p className="eyebrow" data-reveal>{a.kicker} · {fmtDate(a.date)}</p>
        <h1 className="display" data-reveal>{a.title}</h1>
        <p className="lead" data-reveal>{a.excerpt}</p>
      </Reveal>
      <div className="art-img"><Image src={a.cover} alt="" fill priority sizes="(max-width:800px) 100vw, 50vw" /></div>
      <Reveal className="art-body">
        {a.body.map((p, i) => <p key={i} data-reveal className={i === 0 ? "drop" : ""}>{p}</p>)}
      </Reveal>
      <Link href={`/journal/${next.slug}`} className="art-next">
        <span className="eyebrow">Next story</span>
        <span className="display sm">{next.title} →</span>
      </Link>
    </main>
  );
}
