"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";

import { getOrCreateAnonymousUserHash } from "../../../lib/anon";
import { clientGet, clientPost } from "../../../lib/clientApi";
import { useRequireAuth } from "../../../lib/useRequireAuth";

type AreaDto = { id: string; city: string; zone: string | null; ward: string | null };
type CategoryDto = { id: string; name: string };

type CreateComplaintResponse = { id: string };

export default function NewComplaintPage() {
  const { checking } = useRequireAuth();

  const [areas, setAreas] = useState<AreaDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [areaId, setAreaId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imagesCsv, setImagesCsv] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const images = useMemo(() => {
    return imagesCsv
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [imagesCsv]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const [a, c] = await Promise.all([
          clientGet<AreaDto[]>("/api/areas"),
          clientGet<CategoryDto[]>("/api/complaint-categories"),
        ]);
        if (cancelled) return;
        setAreas(a);
        setCategories(c);

        if (!areaId && a.length > 0) setAreaId(a[0].id);
        if (!categoryId && c.length > 0) setCategoryId(c[0].id);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load dropdowns");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return (
      <Container>
        <h1 className="text-2xl font-semibold">Raise Complaint</h1>
        <p className="mt-2 text-sm opacity-70">Checking session…</p>
      </Container>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreatedId(null);

    try {
      const anonymousUserHash = getOrCreateAnonymousUserHash();

      const res = await clientPost<CreateComplaintResponse>("/api/complaints", {
        areaId,
        categoryId,
        anonymousUserHash,
        title,
        description,
        images,
      });

      setCreatedId(res.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Raise Complaint</h1>
        <Link href="/complaints/my" className="text-sm underline">
          My complaints
        </Link>
      </div>

      {loading ? <p className="mt-3 text-sm opacity-70">Loading…</p> : null}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <Card className="mt-4">
        <CardHeader title="Details" subtitle="Provide accurate info to help resolve faster." />

        <form onSubmit={onSubmit} className="mt-4 grid gap-4 max-w-[640px]">
          <FieldLabel label="Area">
            <select
              className="h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30 disabled:opacity-60"
              value={areaId}
              onChange={(e) => setAreaId(e.target.value)}
              disabled={loading}
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.city}
                  {a.zone ? ` · ${a.zone}` : ""}
                  {a.ward ? ` · ${a.ward}` : ""}
                </option>
              ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Category">
            <select
              className="h-10 w-full rounded-md border border-black/15 bg-white px-3 text-sm outline-none focus:border-black/30 disabled:opacity-60"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              disabled={loading}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </FieldLabel>

          <FieldLabel label="Title">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
          </FieldLabel>

          <FieldLabel label="Description">
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              className="min-h-[140px]"
            />
          </FieldLabel>

          <FieldLabel label="Images (comma-separated URLs, optional)">
            <Input value={imagesCsv} onChange={(e) => setImagesCsv(e.target.value)} />
          </FieldLabel>

          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={submitting || loading}>
              {submitting ? "Submitting…" : "Submit"}
            </Button>
          </div>
        </form>

        {createdId ? (
          <p className="mt-4 text-sm">
            Created complaint: <span className="font-semibold">{createdId}</span> ·{" "}
            <Link href="/complaints/my" className="underline">
              View my complaints
            </Link>
          </p>
        ) : null}
      </Card>
    </Container>
  );
}
