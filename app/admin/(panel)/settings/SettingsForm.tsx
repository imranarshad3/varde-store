"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "../../actions";
import type { Settings } from "@/lib/types";

export default function SettingsForm({ s }: { s: Settings }) {
  const [state, action, pending] = useActionState(saveSettingsAction, null);
  return (
    <form action={action} className="adm-card setf">
      <div className="adm-card-h"><h2>Storefront</h2></div>
      <div className="af full">
        <label htmlFor="ann">Announcement bar <i>(one message per line, they scroll across the top of every page)</i></label>
        <textarea id="ann" name="announcements" rows={5} defaultValue={s.announcements.join("\n")} />
      </div>
      <div className="af">
        <label htmlFor="fs">Free delivery threshold (USD)</label>
        <input id="fs" name="freeShipping" type="number" min={0} step={10} defaultValue={s.freeShipping} />
      </div>
      {state?.error && <p className="a-err">{state.error}</p>}
      {state?.ok && <p className="a-ok">{state.message}</p>}
      <div><button className="a-btn" disabled={pending}>{pending ? "Saving…" : "Save settings"}</button></div>
    </form>
  );
}
