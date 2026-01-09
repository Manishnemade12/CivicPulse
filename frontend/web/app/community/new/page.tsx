"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useRequireAuth } from "../../../lib/useRequireAuth";

type CreatePostResponse = {
  id: string;
};

function parseMediaUrls(text: string): string[] {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export default function CommunityNewPostPage() {
  const router = useRouter();

  const { checking } = useRequireAuth();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mediaUrlsText, setMediaUrlsText] = useState("");
  const mediaUrls = useMemo(() => parseMediaUrls(mediaUrlsText), [mediaUrlsText]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // auth enforced by useRequireAuth

  if (checking) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Create Post</h1>
        <p>Checking session…</p>
      </main>
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setError("Content is required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/community/posts", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim() ? title.trim() : null,
          content: trimmedContent,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : null,
        }),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Request failed (HTTP ${res.status})`);
      }

      const json = (await res.json()) as CreatePostResponse;
      router.push("/community");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create post");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Create Post</h1>

      {error ? (
        <p style={{ color: "crimson" }}>
          <strong>Error:</strong> {error}
        </p>
      ) : null}

      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12, maxWidth: 720 }}>
        <label style={{ display: "grid", gap: 6 }}>
          <span>Title (optional)</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Road repair completed"
            maxLength={200}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Content</span>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post..."
            rows={6}
            maxLength={5000}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <span>Media URLs (optional, one per line)</span>
          <textarea
            value={mediaUrlsText}
            onChange={(e) => setMediaUrlsText(e.target.value)}
            placeholder="https://..."
            rows={4}
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? "Posting..." : "Post"}
        </button>
      </form>
    </main>
  );
}
