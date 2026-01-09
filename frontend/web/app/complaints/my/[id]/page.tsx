"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";

import { getOrCreateAnonymousUserHash } from "../../../../lib/anon";
import { clientDelete, clientGet } from "../../../../lib/clientApi";
import { useRequireAuth } from "../../../../lib/useRequireAuth";

type ComplaintDetail = {
  id: string;
  title: string;
  description: string;
  status: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
};

export default function ComplaintDetailPage() {
  const { checking } = useRequireAuth();
  const router = useRouter();
  const routeParams = useParams<{ id: string }>();
  const complaintId = routeParams.id;

  const [data, setData] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const hash = getOrCreateAnonymousUserHash();
        const res = await clientGet<ComplaintDetail>(
          `/api/complaints/${encodeURIComponent(complaintId)}?anonymousUserHash=${encodeURIComponent(hash)}`
        );
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (complaintId) void load();
    return () => {
      cancelled = true;
    };
  }, [complaintId]);

  if (checking) {
    return (
      <Container>
        <h1 className="text-2xl font-semibold">Complaint Detail</h1>
        <p className="mt-2 text-sm opacity-70">Checking session…</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/complaints/my" className="text-sm underline">
          ← Back to My Complaints
        </Link>
      </div>

      <h1 className="mt-3 text-2xl font-semibold">Complaint Detail</h1>

      {loading ? <p className="mt-3 text-sm opacity-70">Loading…</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {actionError ? <p className="mt-3 text-sm text-red-700">{actionError}</p> : null}

      {data ? (
        <Card className="mt-4 max-w-[780px]">
          <CardHeader
            title={data.title}
            subtitle={`Status: ${data.status}`}
            right={
              <Button
                size="sm"
                variant="danger"
                onClick={async () => {
                  setActionError(null);
                  try {
                    const hash = getOrCreateAnonymousUserHash();
                    await clientDelete(
                      `/api/complaints/${encodeURIComponent(complaintId)}?anonymousUserHash=${encodeURIComponent(hash)}`
                    );
                    router.push("/complaints/my");
                  } catch (e) {
                    setActionError(e instanceof Error ? e.message : "Failed to delete");
                  }
                }}
              >
                Delete
              </Button>
            }
          />

          <div className="mt-4 grid gap-3 text-sm">
            <div className="grid gap-1">
              <div className="text-xs opacity-70">ID</div>
              <div className="break-all">{data.id}</div>
            </div>
            <div className="grid gap-1">
              <div className="text-xs opacity-70">Description</div>
              <div className="whitespace-pre-wrap">{data.description}</div>
            </div>
            <div className="grid gap-1">
              <div className="text-xs opacity-70">Created</div>
              <div>{new Date(data.createdAt).toLocaleString()}</div>
            </div>
            <div className="grid gap-1">
              <div className="text-xs opacity-70">Updated</div>
              <div>{new Date(data.updatedAt).toLocaleString()}</div>
            </div>
            {data.images?.length ? (
              <div className="grid gap-1">
                <div className="text-xs opacity-70">Images</div>
                <ul className="grid gap-1">
                  {data.images.map((u) => (
                    <li key={u}>
                      <a className="underline" href={u} target="_blank" rel="noreferrer">
                        {u}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </Card>
      ) : null}
    </Container>
  );
}
