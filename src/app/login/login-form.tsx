"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });
    setLoading(false);
    if (res?.error) {
      setErr("Wrong email or password.");
      return;
    }
    router.push(from);
    router.refresh();
  }

  return (
    <>
      <h1 className="text-xl font-medium">Log in</h1>
      <p className="mt-1 text-sm text-ink-muted">Welcome back to MM26.</p>

      <form className="mt-6 space-y-3" onSubmit={submit}>
        <div>
          <label className="text-xs text-ink-muted">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border-line"
          />
        </div>
        <div>
          <label className="text-xs text-ink-muted">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border-line"
          />
        </div>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-ink px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-ink-muted">
        No account yet?{" "}
        <Link href="/signup" className="text-accent">
          Sign up
        </Link>
      </p>
    </>
  );
}
