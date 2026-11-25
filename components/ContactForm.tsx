"use client";

import { useActionState } from "react";
import { sendMessage } from "@/lib/actions";

export default function ContactForm() {
  const [state, action, pending] = useActionState(sendMessage, null);
  if (state?.ok)
    return (
      <div className="auth-card sent">
        <h2>Message sent</h2>
        <p>{state.message}</p>
      </div>
    );
  return (
    <form action={action} className="auth-card">
      <div className="fld full"><label htmlFor="c-n">Name</label><input id="c-n" name="name" required autoComplete="name" /></div>
      <div className="fld full"><label htmlFor="c-e">Email</label><input id="c-e" name="email" type="email" required autoComplete="email" /></div>
      <div className="fld full">
        <label htmlFor="c-s">Topic</label>
        <select id="c-s" name="subject" defaultValue="Order">
          {["Order", "Sizing", "Returns", "Repairs", "Press", "Something else"].map((t) => <option key={t}>{t}</option>)}
        </select>
      </div>
      <div className="fld full"><label htmlFor="c-b">Message</label><textarea id="c-b" name="body" rows={6} required /></div>
      {state?.error && <p className="form-err">{state.error}</p>}
      <button className="btn big" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
