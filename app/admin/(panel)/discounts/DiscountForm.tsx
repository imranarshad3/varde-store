"use client";

import { useActionState, useRef, useState } from "react";
import { createDiscountAction } from "../../actions";

export default function DiscountForm() {
  const [state, action, pending] = useActionState(createDiscountAction, null);
  const [kind, setKind] = useState("percent");
  const form = useRef<HTMLFormElement>(null);
  const random = () => {
    const el = form.current?.elements.namedItem("code") as HTMLInputElement | null;
    if (el) el.value = "VARDE" + Math.random().toString(36).slice(2, 7).toUpperCase();
  };
  return (
    <form action={action} ref={form} className="adm-card dform">
      <div className="adm-card-h"><h2>New code</h2></div>
      <div className="dgrid">
        <div className="af"><label htmlFor="d-code">Code</label>
          <div className="colorpick"><input id="d-code" name="code" required maxLength={30} placeholder="WINTER20" style={{ textTransform: "uppercase", flex: 1 }} /><button type="button" className="a-btn ghost" onClick={random}>Generate</button></div>
        </div>
        <div className="af"><label htmlFor="d-kind">Type</label>
          <select id="d-kind" name="kind" value={kind} onChange={(e) => setKind(e.target.value)}><option value="percent">Percentage off</option><option value="fixed">Fixed amount off</option></select>
        </div>
        <div className="af"><label htmlFor="d-val">{kind === "percent" ? "Percent" : "Amount (USD)"}</label><input id="d-val" name="value" type="number" min={1} max={kind === "percent" ? 90 : undefined} defaultValue={kind === "percent" ? 15 : 50} required /></div>
        <div className="af"><label htmlFor="d-min">Minimum spend <i>(USD)</i></label><input id="d-min" name="minSubtotal" type="number" min={0} defaultValue={0} /></div>
        <div className="af"><label htmlFor="d-max">Usage limit <i>(blank = unlimited)</i></label><input id="d-max" name="maxUses" type="number" min={1} /></div>
        <div className="af"><label htmlFor="d-exp">Expires <i>(optional)</i></label><input id="d-exp" name="expiresAt" type="date" /></div>
      </div>
      {state?.error && <p className="a-err">{state.error}</p>}
      {state?.ok && <p className="a-ok">{state.message}</p>}
      <div><button className="a-btn" disabled={pending}>{pending ? "Creating…" : "Create code"}</button></div>
    </form>
  );
}
