"use client";

import { useActionState } from "react";
import { loginAction } from "../actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="al-form">
      <label htmlFor="a-e">Email</label>
      <input id="a-e" name="email" type="email" required autoComplete="username" />
      <label htmlFor="a-p">Password</label>
      <input id="a-p" name="password" type="password" required autoComplete="current-password" />
      {state?.error && <p className="a-err" role="alert">{state.error}</p>}
      <button className="a-btn" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
