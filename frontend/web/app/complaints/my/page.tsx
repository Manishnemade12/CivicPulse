"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getOrCreateAnonymousUserHash } from "../../../lib/anon";
import { clientGet } from "../../../lib/clientApi";

type ComplaintSummary = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function MyComplaintsPage() {
  const [items, setItems] = useState<ComplaintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const hash = getOrCreateAnonymousUserHash();
        const res = await clientGet<ComplaintSummary[]>(
          `/api/complaints/my?anonymousUserHash=${encodeURIComponent(hash)}`
        );
        if (!cancelled) setItems(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main>
      <h1>My Complaints</h1>

      {loading ? <p>Loading…</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {!loading && items.length === 0 ? <p>No complaints yet.</p> : null}

      <ul style={{ paddingLeft: 18 }}>
        {items.map((c) => (
          <li key={c.id} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 600 }}>
              <Link href={`/complaints/my/${c.id}`}>{c.title}</Link>
            </div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>
              Status: {c.status} · Created: {new Date(c.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>

      <p>
        <Link href="/complaints/new">Raise another complaint</Link>
      </p>
    </main>
  );
}
