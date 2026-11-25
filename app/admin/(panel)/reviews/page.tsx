import Link from "next/link";
import { listAllReviews } from "@/lib/queries";
import Stars from "@/components/Stars";
import { reviewAction } from "../../actions";

export default async function ReviewsAdmin({ searchParams }: { searchParams: Promise<{ s?: string }> }) {
  const sp = await searchParams;
  const status = sp.s === "approved" ? "approved" : sp.s === "all" ? undefined : "pending";
  const [list, all] = await Promise.all([listAllReviews(status), listAllReviews()]);
  const pending = all.filter((r) => !r.approved).length;

  return (
    <div className="adm-page narrow">
      <header className="adm-head"><div><p className="adm-eyebrow">Community</p><h1>Reviews</h1></div></header>
      <div className="atabs">
        <Link href="/admin/reviews" className={status === "pending" ? "on" : ""}>Waiting <sup>{pending}</sup></Link>
        <Link href="/admin/reviews?s=approved" className={status === "approved" ? "on" : ""}>Published <sup>{all.length - pending}</sup></Link>
        <Link href="/admin/reviews?s=all" className={!status ? "on" : ""}>All <sup>{all.length}</sup></Link>
      </div>
      {!list.length && <p className="adm-muted">{status === "pending" ? "Nothing waiting. New reviews from product pages land here for approval." : "No reviews here yet."}</p>}
      <div className="msgs">
        {list.map((r) => (
          <article key={r.id} className={`adm-card msg${r.approved ? "" : " unread"}`}>
            <div className="msg-h">
              <div><Stars value={r.rating} size={15} /> <b style={{ marginLeft: 8 }}>{r.title || "No title"}</b></div>
              <span className="adm-muted sm">{new Date(r.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
            </div>
            <p className="msg-s">{r.productName}</p>
            <p className="msg-b">{r.body}</p>
            <p className="adm-muted sm">{r.name} · <a className="adm-link" href={`mailto:${r.email}`}>{r.email}</a></p>
            <div className="msg-a">
              {r.approved ? (
                <form action={reviewAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value="hide" /><button className="adm-link">Unpublish</button></form>
              ) : (
                <form action={reviewAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value="approve" /><button className="a-btn">Approve &amp; publish</button></form>
              )}
              <form action={reviewAction}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="op" value="delete" /><button className="adm-link red">Delete</button></form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
