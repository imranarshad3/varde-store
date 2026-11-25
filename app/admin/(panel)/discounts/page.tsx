import { listDiscounts } from "@/lib/queries";
import { money } from "@/lib/types";
import { deleteDiscountAction, toggleDiscountAction } from "../../actions";
import DiscountForm from "./DiscountForm";

export default async function Discounts() {
  const list = await listDiscounts();
  const now = Date.now();
  return (
    <div className="adm-page">
      <header className="adm-head"><div><p className="adm-eyebrow">Marketing</p><h1>Discount codes</h1></div></header>
      <DiscountForm />
      <div className="adm-card flush">
        <table className="atable">
          <thead><tr><th>Code</th><th>Discount</th><th>Minimum</th><th>Used</th><th>Expires</th><th>Status</th><th /></tr></thead>
          <tbody>
            {list.map((d) => {
              const expired = d.expiresAt && new Date(d.expiresAt).getTime() < now;
              const used = d.maxUses != null && d.uses >= d.maxUses;
              const status = !d.active ? ["Paused", "pending"] : expired ? ["Expired", "cancelled"] : used ? ["Used up", "cancelled"] : ["Live", "delivered"];
              return (
                <tr key={d.code}>
                  <td><code className="dcode">{d.code}</code></td>
                  <td>{d.kind === "percent" ? `${d.value}% off` : `${money(d.value)} off`}</td>
                  <td>{d.minSubtotal ? money(d.minSubtotal) : "None"}</td>
                  <td>{d.uses}{d.maxUses != null ? ` / ${d.maxUses}` : ""}</td>
                  <td className="nowrap">{d.expiresAt ? new Date(d.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "Never"}</td>
                  <td><span className={`pill ${status[1]}`}>{status[0]}</span></td>
                  <td className="num">
                    <div className="row-acts">
                      <form action={toggleDiscountAction}><input type="hidden" name="code" value={d.code} /><input type="hidden" name="active" value={d.active ? "0" : "1"} /><button className="adm-link">{d.active ? "Pause" : "Activate"}</button></form>
                      <form action={deleteDiscountAction}><input type="hidden" name="code" value={d.code} /><button className="adm-link red">Delete</button></form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!list.length && <tr><td colSpan={7} className="adm-muted center pad">No codes yet. Create one above.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
