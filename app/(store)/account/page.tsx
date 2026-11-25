import Image from "next/image";
import Link from "next/link";
import { customerId } from "@/lib/auth";
import { customerById, getOrdersByEmail } from "@/lib/queries";
import { logout } from "@/lib/actions";
import { money } from "@/lib/types";
import AuthForms from "@/components/AuthForms";
import SavedList from "@/components/SavedList";

export const metadata = { title: "Account · VARDE" };

const STEP: Record<string, number> = { pending: 0, paid: 1, shipped: 2, delivered: 3, cancelled: -1 };

export default async function Account() {
  const id = await customerId();
  const me = id ? await customerById(id) : undefined;
  const orders = me ? await getOrdersByEmail(me.email) : [];

  return (
    <main className="page account">
      <header className="page-hero">
        <p className="eyebrow">{me ? "Welcome back" : "Your account"}</p>
        <h1 className="display">{me ? <>Hello, <em>{me.name.split(" ")[0]}</em></> : "Sign in"}</h1>
        {me && <form action={logout}><button className="ul">Sign out</button></form>}
      </header>

      {me ? (
        <section className="acc-orders">
          <h2 className="h2">Your orders</h2>
          {!orders.length && <p className="muted">No orders yet. <Link className="ul" href="/shop">Start with the collection</Link>.</p>}
          {orders.map((o) => (
            <article className="ord" key={o.id}>
              <div className="ord-h">
                <div><b>{o.number}</b><span>{new Date(o.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                <span className={`pill ${o.status}`}>{o.status}</span>
                <b>{money(o.total)}</b>
              </div>
              {o.status !== "cancelled" && (
                <ol className="track-steps">
                  {["Placed", "Confirmed", "Shipped", "Delivered"].map((t, i) => <li key={t} className={i <= STEP[o.status] ? "done" : ""}>{t}</li>)}
                </ol>
              )}
              <div className="ord-items">
                {o.items.map((i, k) => (
                  <div className="ord-it" key={k}><span className="ti"><Image src={i.img} alt="" fill sizes="56px" /></span><span>{i.name}<i>{i.size} · ×{i.qty}</i></span></div>
                ))}
              </div>
            </article>
          ))}
        </section>
      ) : (
        <AuthForms />
      )}

      <section className="acc-saved" id="saved">
        <h2 className="h2">Saved pieces</h2>
        <SavedList />
      </section>
    </main>
  );
}
