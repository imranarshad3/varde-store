import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { logoutAction } from "../actions";
import AdminNav from "./AdminNav";

export default async function Panel({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="adm">
      <aside className="adm-side">
        <Link href="/admin" className="adm-logo">VARDE<span>Studio</span></Link>
        <AdminNav />
        <div className="adm-side-foot">
          <Link href="/" target="_blank" className="adm-view">View store ↗</Link>
          <form action={logoutAction}><button className="adm-out">Sign out</button></form>
        </div>
      </aside>
      <div className="adm-body">
        {!hasDb && (
          <div className="adm-warn">
            <b>Database not connected.</b> You&apos;re seeing the built-in catalogue, read-only. Connect a Neon Postgres database to this project in Vercel to save products, take orders and see live data.
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
