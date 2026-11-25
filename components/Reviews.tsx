"use client";

import { useActionState, useState } from "react";
import { submitReview } from "@/lib/actions";
import type { Review } from "@/lib/types";
import Stars from "./Stars";

export default function Reviews({ productId, productName, reviews, rating, count }: { productId: number; productName: string; reviews: Review[]; rating?: number; count?: number }) {
  const [state, action, pending] = useActionState(submitReview, null);
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: reviews.filter((r) => r.rating === n).length }));

  return (
    <section className="sec reviews" id="reviews">
      <div className="rv-grid">
        <div className="rv-sum">
          <p className="eyebrow">Reviews</p>
          {count ? (
            <>
              <p className="rv-big">{rating?.toFixed(1)}</p>
              <Stars value={rating ?? 0} size={18} />
              <p className="muted">{count} review{count > 1 ? "s" : ""}</p>
              <ul className="rv-dist">
                {dist.map((d) => (
                  <li key={d.n}><span>{d.n}★</span><i><b style={{ width: `${reviews.length ? (d.c / reviews.length) * 100 : 0}%` }} /></i><span>{d.c}</span></li>
                ))}
              </ul>
            </>
          ) : (
            <p className="h2">Be the first to review the {productName.toLowerCase()}.</p>
          )}
          {!state?.ok && <button className="btn ghost" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? "Close" : "Write a review"}</button>}
        </div>

        <div className="rv-list">
          {state?.ok && <p className="rv-thanks">{state.message}</p>}
          {open && !state?.ok && (
            <form action={action} className="rv-form">
              <input type="hidden" name="productId" value={productId} />
              <input type="hidden" name="rating" value={stars} />
              <div className="rv-pick" role="radiogroup" aria-label="Your rating" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button type="button" key={n} role="radio" aria-checked={stars === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
                    className={(hover || stars) >= n ? "on" : ""} onMouseEnter={() => setHover(n)} onClick={() => setStars(n)}>★</button>
                ))}
              </div>
              <div className="rv-two">
                <div className="fld"><label htmlFor="rv-n">Name</label><input id="rv-n" name="name" required maxLength={60} autoComplete="name" /></div>
                <div className="fld"><label htmlFor="rv-e">Email <i>(never shown)</i></label><input id="rv-e" name="email" type="email" required autoComplete="email" /></div>
              </div>
              <div className="fld"><label htmlFor="rv-t">Title</label><input id="rv-t" name="title" maxLength={100} placeholder="Sum it up in a few words" /></div>
              <div className="fld"><label htmlFor="rv-b">Your review</label><textarea id="rv-b" name="body" rows={4} required minLength={10} maxLength={2000} placeholder="How does it fit, feel and wear?" /></div>
              {state?.error && <p className="form-err">{state.error}</p>}
              <button className="btn" disabled={pending}>{pending ? "Sending…" : "Submit review"}</button>
            </form>
          )}
          {reviews.map((r) => (
            <article key={r.id} className="rv">
              <div className="rv-h"><Stars value={r.rating} /><span className="muted">{new Date(r.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span></div>
              {r.title && <h3>{r.title}</h3>}
              <p>{r.body}</p>
              <span className="rv-by">{r.name} · Verified review</span>
            </article>
          ))}
          {!reviews.length && !open && !state?.ok && <p className="muted">No reviews yet.</p>}
        </div>
      </div>
    </section>
  );
}
