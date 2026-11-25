import { redirect } from "next/navigation";
import { adminConfigured, isAdmin } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function AdminLogin() {
  if (await isAdmin()) redirect("/admin");
  const configured = adminConfigured();
  return (
    <main className="adm-login">
      <div className="al-card">
        <div className="al-logo">VARDE</div>
        <p className="al-sub">Studio admin</p>
        {configured ? (
          <LoginForm />
        ) : (
          <div className="al-setup">
            <h1>Admin login isn&apos;t set up yet</h1>
            <p>Add two environment variables to this project in Vercel, then redeploy:</p>
            <ul>
              <li><code>ADMIN_EMAIL</code>: the email you&apos;ll sign in with</li>
              <li><code>ADMIN_PASSWORD</code>: a long, unique password</li>
            </ul>
            <p className="al-hint">Vercel → your project → Settings → Environment Variables.</p>
          </div>
        )}
      </div>
    </main>
  );
}
