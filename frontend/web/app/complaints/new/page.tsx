"use client";

import { useEffect, useMemo, useState } from "react";

import Link from "next/link";

import { getOrCreateAnonymousUserHash } from "../../../lib/anon";
import { clientGet, clientPost } from "../../../lib/clientApi";

type AreaDto = { id: string; city: string; zone: string | null; ward: string | null };
type CategoryDto = { id: string; name: string };

type CreateComplaintResponse = { id: string };

export default function NewComplaintPage() {
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
    <main>
      <h1>Raise Complaint</h1>

      {loading ? <p>Loading…</p> : null}
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Area</span>
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} disabled={loading}>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.city}
                {a.zone ? ` · ${a.zone}` : ""}
                {a.ward ? ` · ${a.ward}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Category</span>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} disabled={loading}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} required />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Description</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={5} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Images (comma-separated URLs, optional)</span>
          <input value={imagesCsv} onChange={(e) => setImagesCsv(e.target.value)} />
        </label>

        <button type="submit" disabled={submitting || loading}>
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </form>

      {createdId ? (
        <p>
          Created complaint: <strong>{createdId}</strong> ·{" "}
          <Link href="/complaints/my">View my complaints</Link>
        </p>
      ) : null}
    </main>
  );
}
