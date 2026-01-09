"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const params = useParams<{ id: string }>();
  const postId = params.id;

  const [post, setPost] = useState<FeedItem | null>(null);
  const [comments, setComments] = useState<CommentDto[]>([]);

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
      const [feedRes, commentsRes] = await Promise.all([
        fetch("/api/community/feed", { cache: "no-store" }),
        fetch(`/api/community/posts/${postId}/comments`, { cache: "no-store" }),
      ]);

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
      <main>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <p>
        <Link href="/community">← Back to feed</Link>
      </p>

      {error ? (
        <p style={{ color: "crimson" }}>
          <strong>Error:</strong> {error}
        </p>
      ) : null}

      <h1>{postTitle}</h1>
      {post ? (
        <>
          <div style={{ opacity: 0.8, fontSize: 14 }}>
            {post.type} · {new Date(post.createdAt).toLocaleString()}
          </div>
          <p style={{ whiteSpace: "pre-wrap" }}>{post.content}</p>

          {post.mediaUrls && post.mediaUrls.length > 0 ? (
            <section>
              <h2>Media</h2>
              <ul style={{ paddingLeft: 18 }}>
                {post.mediaUrls.map((u) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noreferrer">
                      {firstLine(u, 120)}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : (
        <p>Post not found in the latest feed.</p>
      )}

      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={onToggleLike}>
          {liked ? "Unlike" : "Like"}
        </button>
        {actionError ? (
          <span style={{ marginLeft: 10, color: "crimson" }}>{actionError}</span>
        ) : null}
      </div>

      <section style={{ marginTop: 18 }}>
        <h2>Comments</h2>

        {comments.length === 0 ? <p>No comments yet.</p> : null}

        <ul style={{ paddingLeft: 18 }}>
          {comments.map((c) => (
            <li key={c.id} style={{ marginBottom: 10 }}>
              <div style={{ opacity: 0.8, fontSize: 13 }}>
                {new Date(c.createdAt).toLocaleString()}
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{c.comment}</div>
            </li>
          ))}
        </ul>

        <form onSubmit={onAddComment} style={{ display: "grid", gap: 10, maxWidth: 720 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Add a comment</span>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              maxLength={1000}
            />
          </label>
          <button type="submit">Comment</button>
        </form>
      </section>
    </main>
  );
}
