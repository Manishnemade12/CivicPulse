"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Login failed (HTTP ${res.status})`);
      }

      await res.json();
      setOk(true);

      const next = searchParams.get("next") || "/community";
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-md rounded-xl border border-black/10 bg-white p-6">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-1 text-sm opacity-70">Sign in to continue.</p>

        <form onSubmit={onSubmit} className="mt-6 grid gap-4">
          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Email</span>
            <input
              className="h-10 rounded-md border border-black/15 px-3"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm font-medium">Password</span>
            <input
              className="h-10 rounded-md border border-black/15 px-3"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="h-10 rounded-md border border-black/15 bg-black px-4 text-white disabled:opacity-60"
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        {ok ? <p className="mt-4 text-sm text-green-700">Logged in. Redirecting…</p> : null}

        <p className="mt-6 text-sm">
          Don&apos;t have an account? <Link className="underline" href="/register">Register</Link>
        </p>
      </div>
    </main>
  );
}
