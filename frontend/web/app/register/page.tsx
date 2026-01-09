"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
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
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Register failed (HTTP ${res.status})`);
      }

      await res.json();
      setOk(true);

      const next = searchParams.get("next") || "/community";
      router.replace(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Register</h1>

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {ok ? (
        <p style={{ color: "green" }}>
          Account created and logged in. Redirecting…
        </p>
      ) : null}

      <p>
        Already have an account? <Link href="/login">Login</Link>
      </p>
    </main>
  );
}
