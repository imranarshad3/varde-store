"use client";

import { useActionState } from "react";
import { login, register } from "@/lib/actions";

export default function AuthForms() {
  const [ls, loginAct, lp] = useActionState(login, null);
  const [rs, regAct, rp] = useActionState(register, null);
  return (
    <div className="auth">
      <form action={loginAct} className="auth-card">
        <h2>Sign in</h2>
        <p className="muted">Track orders and check out faster.</p>
        <div className="fld full"><label htmlFor="li-e">Email</label><input id="li-e" name="email" type="email" required autoComplete="email" /></div>
        <div className="fld full"><label htmlFor="li-p">Password</label><input id="li-p" name="password" type="password" required autoComplete="current-password" /></div>
        {ls?.error && <p className="form-err">{ls.error}</p>}
        <button className="btn big" disabled={lp}>{lp ? "Signing in…" : "Sign in"}</button>
      </form>
      <form action={regAct} className="auth-card alt">
        <h2>New to VARDE?</h2>
        <p className="muted">Create an account. Orders placed with the same email appear automatically.</p>
        <div className="fld full"><label htmlFor="re-n">Full name</label><input id="re-n" name="name" required autoComplete="name" /></div>
        <div className="fld full"><label htmlFor="re-e">Email</label><input id="re-e" name="email" type="email" required autoComplete="email" /></div>
        <div className="fld full"><label htmlFor="re-p">Password <i>(8+ characters)</i></label><input id="re-p" name="password" type="password" minLength={8} required autoComplete="new-password" /></div>
        {rs?.error && <p className="form-err">{rs.error}</p>}
        <button className="btn big ghost" disabled={rp}>{rp ? "Creating…" : "Create account"}</button>
      </form>
    </div>
  );
}
