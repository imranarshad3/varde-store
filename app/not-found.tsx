import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nf">
      <p className="eyebrow">Error 404</p>
      <h1 className="display">Lost at <em>low tide.</em></h1>
      <p className="lead">The page you&apos;re looking for has drifted away.</p>
      <Link href="/" className="btn">Back to the collection</Link>
    </main>
  );
}
