"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input } from "@/components/ui/Field";

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
    <Container>
      <h1 className="text-2xl font-semibold">Admin · Complaints</h1>

      <p className="mt-2 text-sm opacity-70">
        This page requires an admin JWT. If you don&apos;t have one yet, use{" "}
        <Link className="underline" href="/login">
          Login
        </Link>
        .
      </p>

      <Card className="mt-4">
        <CardHeader
          title="Filters"
          subtitle={me ? `Signed in as ${me.email}` : undefined}
        />

        <div className="mt-4 grid gap-3 max-w-[420px]">
          <FieldLabel label="Filter by status">
            <select
              className="h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FieldLabel>
        </div>
      </Card>

      {loading ? <p className="mt-3 text-sm opacity-70">Loading…</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
      {success ? <p className="mt-3 text-sm text-green-700">{success}</p> : null}

      <div className="mt-4 grid gap-3">
        {items.map((c) => (
          <Card key={c.id}>
            <CardHeader
              title={c.title}
              subtitle={`ID: ${c.id} · Created: ${new Date(c.createdAt).toLocaleString()}`}
              right={
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => void updateStatus(c.id)}
                  disabled={submittingId === c.id}
                >
                  {submittingId === c.id ? "Saving…" : "Submit"}
                </Button>
              }
            />

            <div className="mt-4 grid gap-3 md:grid-cols-3 md:items-end">
              <FieldLabel label="Status">
                <select
                  className="h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30"
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
              </FieldLabel>

              <FieldLabel label="Comment (optional)">
                <Input
                  value={commentById[c.id] ?? ""}
                  onChange={(e) =>
                    setCommentById((prev) => ({ ...prev, [c.id]: e.target.value }))
                  }
                  maxLength={500}
                />
              </FieldLabel>

              <div className="text-xs opacity-70">
                Current status: <span className="font-medium">{c.status}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
