"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { getOrCreateAnonymousUserHash } from "../../../lib/anon";
import { clientDelete, clientGet } from "../../../lib/clientApi";
import { useRequireAuth } from "../../../lib/useRequireAuth";

type ComplaintSummary = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export default function MyComplaintsPage() {
  const { checking } = useRequireAuth();

  const [items, setItems] = useState<ComplaintSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setActionError(null);

    try {
      const hash = getOrCreateAnonymousUserHash();
      const res = await clientGet<ComplaintSummary[]>(
        `/api/complaints/my?anonymousUserHash=${encodeURIComponent(hash)}`
      );
      setItems(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        await load();
      } finally {
        // no-op
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (checking) {
    return (
      <main className="p-6">
        <h1>My Complaints</h1>
        <p>Checking session…</p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1>My Complaints</h1>

      {loading ? <p>Loading…</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {actionError ? <p style={{ color: "crimson" }}>{actionError}</p> : null}

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
            <div style={{ marginTop: 8 }}>
              <button
                type="button"
                onClick={async () => {
                  setActionError(null);
                  try {
                    const hash = getOrCreateAnonymousUserHash();
                    await clientDelete(
                      `/api/complaints/${encodeURIComponent(c.id)}?anonymousUserHash=${encodeURIComponent(hash)}`
                    );
                    await load();
                  } catch (e) {
                    setActionError(e instanceof Error ? e.message : "Failed to delete");
                  }
                }}
              >
                Delete
              </button>
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
