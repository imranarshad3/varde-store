import { getSettings } from "@/lib/queries";
import { clearSampleAction } from "../../actions";
import SettingsForm from "./SettingsForm";

export default async function Settings({ searchParams }: { searchParams: Promise<{ cleared?: string }> }) {
  const [s, sp] = await Promise.all([getSettings(), searchParams]);
  return (
    <div className="adm-page narrow">
      <header className="adm-head"><div><p className="adm-eyebrow">Store</p><h1>Settings</h1></div></header>
      <SettingsForm s={s} />
      <section className="adm-card">
        <div className="adm-card-h"><h2>Sample data</h2></div>
        <p className="adm-muted">The store started with 34 sample orders and 12 sample customers (emails ending in @example.com) so the dashboard had something to show. Remove them before you go live. Real orders are never touched.</p>
        {sp.cleared ? <p className="a-ok">Sample orders and customers removed.</p> : (
          <form action={clearSampleAction} className="danger inline">
            <label className="adm-muted sm confirm"><input type="checkbox" required /> Yes, remove the sample data</label>
            <button className="a-btn danger">Remove sample data</button>
          </form>
        )}
      </section>
    </div>
  );
}
