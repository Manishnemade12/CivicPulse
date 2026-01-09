"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

type MeResponse = { id: string; name: string; email: string; role: string };

type AdminComplaint = {
  id: string;
  title: string;
  status: string;
  areaId: string;
  categoryId: string;
  createdAt: string;
};

type UpdateStatusResponse = { ok: boolean };

const STATUSES = ["RAISED", "IN_PROGRESS", "RESOLVED"] as const;

export default function AdminComplaintsPage() {
  const [items, setItems] = useState<AdminComplaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse | null>(null);

  const [statusFilter, setStatusFilter] = useState<string>("");
  const [draftStatusById, setDraftStatusById] = useState<Record<string, string>>({});
  const [commentById, setCommentById] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const meRes = await fetch("/api/me", { cache: "no-store" });
      if (meRes.status === 401) {
        window.location.href = "/login";
        return;
      }
      if (!meRes.ok) throw new Error(`Auth check failed (HTTP ${meRes.status})`);
      const meJson = (await meRes.json()) as MeResponse;
      setMe(meJson);
      if (meJson.role !== "ADMIN") {
        setItems([]);
        setError("Forbidden: admin role required.");
        return;
      }

      const qs = statusFilter ? `?status=${encodeURIComponent(statusFilter)}` : "";
      const res = await fetch(`/api/admin/complaints${qs}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Failed to load (HTTP ${res.status})`);
      }

      const data = (await res.json()) as AdminComplaint[];
      setItems(data);
      setDraftStatusById((prev) => {
        const next = { ...prev };
        for (const c of data) {
          if (!next[c.id]) next[c.id] = c.status;
        }
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function updateStatus(id: string) {
    setSubmittingId(id);
    setError(null);
    setSuccess(null);

    try {
      const status = draftStatusById[id] ?? "";
      const comment = commentById[id] ?? "";

      const res = await fetch(`/api/admin/complaints/${encodeURIComponent(id)}/status`, {
        method: "POST",
        cache: "no-store",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ status, comment: comment.trim() ? comment.trim() : null }),
      });

      if (!res.ok) throw new Error(`Update failed (HTTP ${res.status})`);
      const out = (await res.json()) as UpdateStatusResponse;
      if (!out.ok) throw new Error("Update failed");

      setSuccess("Updated successfully.");
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <main className="p-6">
      <h1>Admin · Complaints</h1>

      <p style={{ opacity: 0.85 }}>
        This page requires an admin JWT. If you don&apos;t have one yet, use{" "}
        <Link href="/login">Login</Link>.
      </p>

      <label style={{ display: "grid", gap: 6, maxWidth: 320 }}>
        <span>Filter by status</span>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {loading ? <p>Loading…</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      {success ? <p style={{ color: "green" }}>{success}</p> : null}

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {items.map((c) => (
          <section
            key={c.id}
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              borderRadius: 8,
              padding: 12,
            }}
          >
            <div style={{ display: "grid", gap: 6 }}>
              <div style={{ fontWeight: 700 }}>{c.title}</div>
              <div style={{ opacity: 0.8, fontSize: 14 }}>
                ID: {c.id} · Created: {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 120px",
                gap: 10,
                alignItems: "end",
                marginTop: 12,
                maxWidth: 900,
              }}
            >
              <label style={{ display: "grid", gap: 6 }}>
                <span>Status</span>
                <select
                  value={draftStatusById[c.id] ?? c.status}
                  onChange={(e) =>
                    setDraftStatusById((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ display: "grid", gap: 6 }}>
                <span>Comment (optional)</span>
                <input
                  value={commentById[c.id] ?? ""}
                  onChange={(e) => setCommentById((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  maxLength={500}
                />
              </label>

              <button
                onClick={() => void updateStatus(c.id)}
                disabled={submittingId === c.id}
              >
                {submittingId === c.id ? "Saving…" : "Submit"}
              </button>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
