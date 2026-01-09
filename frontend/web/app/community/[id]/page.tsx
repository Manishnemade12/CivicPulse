"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { FieldLabel, Textarea } from "@/components/ui/Field";
import { useRequireAuth } from "@/lib/useRequireAuth";

type FeedItem = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  mediaUrls?: string[];
  createdAt: string;
};

type CommentDto = {
  id: string;
  userId: string;
  comment: string;
  createdAt: string;
};

function firstLine(s: string, max = 200): string {
  const trimmed = s.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}…`;
}

export default function CommunityPostDetailPage() {
  const { checking } = useRequireAuth();

  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [post, setPost] = useState<FeedItem | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);
  const [meId, setMeId] = useState<string | null>(null);

  const [commentText, setCommentText] = useState("");
  const [liked, setLiked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const postTitle = useMemo(() => post?.title ?? "(untitled)", [post]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [meRes, feedRes, commentsRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
        fetch("/api/community/feed", { cache: "no-store" }),
        fetch(`/api/community/posts/${postId}/comments`, { cache: "no-store" }),
      ]);

      if (meRes.ok) {
        const me = (await meRes.json()) as { id: string };
        setMeId(me.id);
      } else {
        setMeId(null);
      }

      if (feedRes.ok) {
        const feed = (await feedRes.json()) as FeedItem[];
        setPost(feed.find((p) => p.id === postId) ?? null);
      }

      if (!commentsRes.ok) {
        throw new Error(`Failed to load comments (HTTP ${commentsRes.status})`);
      }
      setComments((await commentsRes.json()) as CommentDto[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post");
    } finally {
      setLoading(false);
    }
  }

  async function onDeleteComment(commentId: string) {
    setActionError(null);
    try {
      const res = await fetch(
        `/api/community/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
        {
          method: "DELETE",
          cache: "no-store",
        }
      );
      if (!res.ok) {
        if (res.status === 401) throw new Error("Login required.");
        if (res.status === 403) throw new Error("You can only delete your own comment.");
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Request failed (HTTP ${res.status})`);
      }
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete comment");
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  async function onAddComment(e: React.FormEvent) {
    e.preventDefault();
    setActionError(null);

    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ comment: trimmed }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Login required to comment.");
        }
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Request failed (HTTP ${res.status})`);
      }
      setCommentText("");
      await load();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to comment");
    }
  }

  async function onToggleLike() {
    setActionError(null);

    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: liked ? "DELETE" : "POST",
        headers: {},
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Login required to like/unlike.");
        }
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `Request failed (HTTP ${res.status})`);
      }

      setLiked(!liked);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to toggle like");
    }
  }

  if (loading) {
    return (
      <Container>
        <p className="text-sm opacity-70">{checking ? "Checking session…" : "Loading..."}</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/community" className="text-sm underline">
          ← Back to feed
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => void load()}>
            Refresh
          </Button>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <Card className="mt-4">
        <CardHeader
          title={<span className="break-words">{postTitle}</span>}
          subtitle={post ? `${post.type} · ${new Date(post.createdAt).toLocaleString()}` : undefined}
          right={
            <Button size="sm" variant="secondary" onClick={() => void onToggleLike()}>
              {liked ? "Unlike" : "Like"}
            </Button>
          }
        />

        {post ? (
          <>
            <p className="mt-3 whitespace-pre-wrap text-sm">{post.content}</p>

            {post.mediaUrls && post.mediaUrls.length > 0 ? (
              <div className="mt-4">
                <div className="text-sm font-medium">Media</div>
                <ul className="mt-2 grid gap-1 text-sm">
                  {post.mediaUrls.map((u) => (
                    <li key={u}>
                      <a className="underline" href={u} target="_blank" rel="noreferrer">
                        {firstLine(u, 120)}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <p className="mt-3 text-sm opacity-70">
            Post header not found in feed. Comments below will still work.
          </p>
        )}

        {actionError ? <p className="mt-3 text-sm text-red-700">{actionError}</p> : null}
      </Card>

      <Card className="mt-4">
        <CardHeader
          title="Comments"
          subtitle={comments.length === 0 ? "No comments yet." : `${comments.length} comment(s)`}
        />

        <ul className="mt-4 grid gap-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-black/10 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs opacity-70">{new Date(c.createdAt).toLocaleString()}</div>
                {meId && c.userId === meId ? (
                  <Button size="sm" variant="danger" onClick={() => void onDeleteComment(c.id)}>
                    Delete
                  </Button>
                ) : null}
              </div>
              <div className="mt-2 whitespace-pre-wrap text-sm">{c.comment}</div>
            </li>
          ))}
        </ul>

        <form onSubmit={onAddComment} className="mt-4 grid gap-3 max-w-[720px]">
          <FieldLabel label="Add a comment">
            <Textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              maxLength={1000}
              className="min-h-[88px]"
            />
          </FieldLabel>
          <div>
            <Button type="submit" variant="primary">
              Comment
            </Button>
          </div>
        </form>
      </Card>
    </Container>
  );
}
