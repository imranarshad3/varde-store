"use client";

import { useActionState } from "react";
import { waitlistAction } from "@/lib/actions";

export default function Waitlist({ productId }: { productId: number }) {
  const [state, action, pending] = useActionState(waitlistAction, null);
  if (state?.ok) return <p className="wl-ok">{state.message}</p>;
  return (
    <form action={action} className="wl">
      <p><b>Sold out.</b> Leave your email and we&apos;ll tell you the moment it&apos;s back.</p>
      <input type="hidden" name="productId" value={productId} />
      <div className="code-row">
        <label htmlFor="wl-e" className="sr">Email</label>
        <input id="wl-e" name="email" type="email" required placeholder="Your email" autoComplete="email" />
        <button disabled={pending}>{pending ? "…" : "Notify me"}</button>
      </div>
      {state?.error && <p className="code-err">{state.error}</p>}
    </form>
  );
}
