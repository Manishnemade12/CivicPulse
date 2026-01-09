"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Input, Textarea } from "@/components/ui/Field";

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
      <Container>
        <h1 className="text-2xl font-semibold">Create Post</h1>
        <p className="mt-2 text-sm opacity-70">Checking session…</p>
      </Container>
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
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Create Post</h1>
        <Link href="/community" className="text-sm underline">
          Back
        </Link>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <Card className="mt-4">
        <CardHeader
          title="Post details"
          subtitle="Keep it clear and respectful."
        />

        <form onSubmit={onSubmit} className="mt-4 grid gap-4 max-w-[720px]">
          <FieldLabel label="Title (optional)">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Road repair completed"
              maxLength={200}
            />
          </FieldLabel>

          <FieldLabel label="Content">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post..."
              rows={6}
              maxLength={5000}
              className="min-h-[160px]"
            />
          </FieldLabel>

          <FieldLabel label="Media URLs (optional, one per line)">
            <Textarea
              value={mediaUrlsText}
              onChange={(e) => setMediaUrlsText(e.target.value)}
              placeholder="https://..."
              rows={4}
            />
          </FieldLabel>

          <div className="flex items-center gap-2">
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? "Posting…" : "Post"}
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
}
