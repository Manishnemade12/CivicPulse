"use client";

import { useEffect, useState } from "react";

import { getOrCreateAnonymousUserHash } from "../../../../lib/anon";
import { clientGet } from "../../../../lib/clientApi";
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

export default function ComplaintDetailPage({ params }: { params: { id: string } }) {
  const { checking } = useRequireAuth();

  const [data, setData] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const hash = getOrCreateAnonymousUserHash();
        const res = await clientGet<ComplaintDetail>(
          `/api/complaints/${encodeURIComponent(params.id)}?anonymousUserHash=${encodeURIComponent(hash)}`
        );
        if (!cancelled) setData(res);
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
  }, [params.id]);

  if (checking) {
    return (
      <main>
        <h1>Complaint Detail</h1>
        <p>Checking session…</p>
      </main>
    );
  }

  return (
    <main>
      <h1>Complaint Detail</h1>

      {loading ? <p>Loading…</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      {data ? (
        <div style={{ display: "grid", gap: 10, maxWidth: 720 }}>
          <div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>ID</div>
            <div>{data.id}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>Title</div>
            <div style={{ fontWeight: 600 }}>{data.title}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>Status</div>
            <div>{data.status}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>Description</div>
            <div style={{ whiteSpace: "pre-wrap" }}>{data.description}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>Created</div>
            <div>{new Date(data.createdAt).toLocaleString()}</div>
          </div>
          <div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>Updated</div>
            <div>{new Date(data.updatedAt).toLocaleString()}</div>
          </div>
          {data.images?.length ? (
            <div>
              <div style={{ opacity: 0.8, fontSize: 14 }}>Images</div>
              <ul style={{ paddingLeft: 18 }}>
                {data.images.map((u) => (
                  <li key={u}>{u}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
