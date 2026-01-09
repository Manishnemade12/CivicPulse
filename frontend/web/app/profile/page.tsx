"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";
import { useRequireAuth } from "@/lib/useRequireAuth";

type MeResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type MyPostDto = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  mediaUrls: string[];
  createdAt: string;
};

function toMediaText(urls: string[] | null | undefined): string {
  return (urls ?? []).join("\n");
}

function parseMediaText(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function ProfilePage() {
  const { checking } = useRequireAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [posts, setPosts] = useState<MyPostDto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const [draftMedia, setDraftMedia] = useState("");
  const [saving, setSaving] = useState(false);

  const sortedPosts = useMemo(() => posts, [posts]);

  async function load() {
    setLoading(true);
    setError(null);

    try {
      const [meRes, myPostsRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
        fetch("/api/community/me/posts", { cache: "no-store" }),
      ]);

      if (!meRes.ok) throw new Error(`Failed to load profile (HTTP ${meRes.status})`);
      if (!myPostsRes.ok) throw new Error(`Failed to load posts (HTTP ${myPostsRes.status})`);

      const meJson = (await meRes.json()) as MeResponse;
      const postsJson = (await myPostsRes.json()) as MyPostDto[];
      setMe(meJson);
      setPosts(postsJson);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (checking) return;
    void load();
  }, [checking]);

  if (checking) {
    return (
      <Container>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm opacity-70">Checking session…</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Button onClick={() => void load()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      <Card className="mt-6">
        <CardHeader title="Account" />
        {!me ? (
          <p className="mt-3 text-sm opacity-70">Click Refresh to load profile.</p>
        ) : (
          <div className="mt-3 grid gap-1 text-sm">
            <div>
              <span className="opacity-70">Name:</span> {me.name}
            </div>
            <div>
              <span className="opacity-70">Email:</span> {me.email}
            </div>
            <div>
              <span className="opacity-70">Role:</span> {me.role}
            </div>
            <div>
              <span className="opacity-70">User ID:</span> {me.id}
            </div>
          </div>
        )}
      </Card>

      <Card className="mt-4">
        <CardHeader
          title="My Complaints"
          subtitle="Delete is available inside My Complaints."
          right={
            <Link className="text-sm underline" href="/complaints/my">
              Open
            </Link>
          }
        />
      </Card>

      <Card className="mt-4">
        <CardHeader
          title="My Community Posts"
          right={
            <Link className="text-sm underline" href="/community/new">
              Create new
            </Link>
          }
        />

        {!me ? <p className="mt-3 text-sm opacity-70">Click Refresh to load posts.</p> : null}
        {me && sortedPosts.length === 0 ? <p className="mt-3 text-sm opacity-70">No posts yet.</p> : null}

        <ul className="mt-4 grid gap-3">
          {sortedPosts.map((p) => (
            <li key={p.id} className="rounded-lg border border-black/10 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="font-semibold">
                    <Link className="underline" href={`/community/${p.id}`}>
                      {p.title ?? "(untitled)"}
                    </Link>
                  </div>
                  <div className="mt-1 text-xs opacity-70">
                    {p.type} · {new Date(p.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      if (editingId === p.id) {
                        setEditingId(null);
                        return;
                      }
                      setEditingId(p.id);
                      setDraftTitle(p.title ?? "");
                      setDraftContent(p.content);
                      setDraftMedia(toMediaText(p.mediaUrls));
                    }}
                  >
                    {editingId === p.id ? "Cancel" : "Edit"}
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={async () => {
                      setError(null);
                      const res = await fetch(`/api/community/posts/${encodeURIComponent(p.id)}`, {
                        method: "DELETE",
                        cache: "no-store",
                      });
                      if (!res.ok) {
                        setError(`Delete failed (HTTP ${res.status})`);
                        return;
                      }
                      await load();
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <p className="mt-3 text-sm whitespace-pre-wrap">{p.content}</p>

              {editingId === p.id ? (
                <div className="mt-4 grid gap-3">
                  <FieldLabel label="Title (optional)">
                    <Input
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      maxLength={200}
                    />
                  </FieldLabel>

                  <FieldLabel label="Content">
                    <Textarea
                      className="min-h-[120px]"
                      value={draftContent}
                      onChange={(e) => setDraftContent(e.target.value)}
                      maxLength={5000}
                    />
                  </FieldLabel>

                  <FieldLabel label="Media URLs (one per line)">
                    <Textarea
                      className="min-h-[80px]"
                      value={draftMedia}
                      onChange={(e) => setDraftMedia(e.target.value)}
                    />
                  </FieldLabel>

                  <Button
                    variant="primary"
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      setError(null);
                      try {
                        const mediaUrls = parseMediaText(draftMedia);
                        const res = await fetch(`/api/community/posts/${encodeURIComponent(p.id)}`, {
                          method: "PUT",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({
                            title: draftTitle.trim() ? draftTitle.trim() : null,
                            content: draftContent.trim(),
                            mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
                          }),
                          cache: "no-store",
                        });
                        if (!res.ok) throw new Error(`Update failed (HTTP ${res.status})`);
                        setEditingId(null);
                        await load();
                      } catch (e) {
                        setError(e instanceof Error ? e.message : "Update failed");
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      </Card>
    </Container>
  );
}
