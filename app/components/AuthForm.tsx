"use client";
import { useActionState } from "react";
import Link from "next/link";
import type { FormState } from "@/app/lib/actions";

export function AuthForm({ mode, action }: {
  mode: "login" | "signup";
  action: (s: FormState, f: FormData) => Promise<FormState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const signup = mode === "signup";
  return (
    <form action={formAction} className="card auth">
      <h1 className="page">{signup ? "Create your account" : "Log in to Loupe"}</h1>
      <label htmlFor="username">Username</label>
      <input id="username" name="username" autoComplete="username" required defaultValue={state?.values?.username} key={`u${state?.values?.username}`} />
      {signup && (<><label htmlFor="name">Display name</label><input id="name" name="name" required defaultValue={state?.values?.name} key={`n${state?.values?.name}`} /></>)}
      <label htmlFor="password">Password</label>
      <input id="password" name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} required />
      {state?.error && <p className="err">{state.error}</p>}
      <button className="primary" disabled={pending}>{pending ? "…" : signup ? "Sign up" : "Log in"}</button>
      <p className="note">
        {signup ? <>Have an account? <Link href="/login">Log in</Link></> : <>New here? <Link href="/signup">Sign up</Link></>}
      </p>
    </form>
  );
}
