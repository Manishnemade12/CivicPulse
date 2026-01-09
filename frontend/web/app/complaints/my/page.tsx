"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";

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
      <Container>
        <h1 className="text-2xl font-semibold">My Complaints</h1>
        <p className="mt-2 text-sm opacity-70">Checking session…</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Complaints</h1>
        <Link href="/complaints/new" className="text-sm underline">
          Raise new
        </Link>
      </div>

      {loading ? <p className="mt-3 text-sm opacity-70">Loading…</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="mt-3 text-sm text-red-700">{actionError}</p> : null}

      {!loading && items.length === 0 ? (
        <Card className="mt-4">
          <CardHeader title="No complaints" subtitle="You haven’t raised any complaints yet." />
          <Link className="mt-3 inline-block text-sm underline" href="/complaints/new">
            Raise your first complaint
          </Link>
        </Card>
      ) : null}

      <div className="mt-4 grid gap-3">
        {items.map((c) => (
          <Card key={c.id}>
            <CardHeader
              title={
                <Link className="underline" href={`/complaints/my/${c.id}`}>
                  {c.title}
                </Link>
              }
              subtitle={`Status: ${c.status} · Created: ${new Date(c.createdAt).toLocaleString()}`}
              right={
                <Button
                  size="sm"
                  variant="danger"
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
                </Button>
              }
            />
          </Card>
        ))}
      </div>
    </Container>
  );
}
