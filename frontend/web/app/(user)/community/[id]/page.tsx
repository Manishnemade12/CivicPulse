"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ArrowLeft, Heart, Send, Trash2, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
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

function relativeTime(iso: string): string {
  try {
    return formatDistanceToNow(new Date(iso), { addSuffix: true });
  } catch {
    return iso;
  }
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
      }

      if (feedRes.ok) {
        const feed = (await feedRes.json()) as FeedItem[];
        setPost(feed.find((p) => p.id === postId) ?? null);
      }

      if (!commentsRes.ok) throw new Error(`Failed to load comments`);
      setComments((await commentsRes.json()) as CommentDto[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load post");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [postId]);

  async function onDeleteComment(commentId: string) {
    try {
      const res = await fetch(
        `/api/community/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`,
        { method: "DELETE", cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to delete comment");
      toast.success("Comment deleted");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function onAddComment(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;

    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ comment: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      setCommentText("");
      toast.success("Comment added!");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to comment");
    }
  }

  async function onToggleLike() {
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: liked ? "DELETE" : "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      setLiked(!liked);
      toast.success(liked ? "Unlike removed" : "Post liked!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    }
  }

  if (loading || checking) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="h-6 w-32 rounded-lg animate-shimmer" />
        <div className="rounded-2xl border border-slate-100 bg-white p-6 space-y-4">
          <div className="h-6 w-2/3 rounded-lg animate-shimmer" />
          <div className="h-4 w-full rounded-lg animate-shimmer" />
          <div className="h-4 w-4/5 rounded-lg animate-shimmer" />
          <div className="h-48 w-full rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Back nav */}
      <div className="flex items-center justify-between gap-3 mb-6">
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to feed
        </Link>
        <Button variant="secondary" size="sm" onClick={() => void load()}>
          <RefreshCw size={14} />
          Refresh
        </Button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Post Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-900">{postTitle}</h1>
              {post && (
                <p className="mt-1 text-sm text-slate-400 font-medium">
                  {post.type} · {relativeTime(post.createdAt)}
                </p>
              )}
            </div>
            <Button
              variant={liked ? "primary" : "secondary"}
              size="sm"
              onClick={() => void onToggleLike()}
            >
              <Heart size={14} className={liked ? "fill-current" : ""} />
              {liked ? "Liked" : "Like"}
            </Button>
          </div>

          {post ? (
            <>
              <p className="mt-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {post.content}
              </p>
              {post.mediaUrls && post.mediaUrls.length > 0 && (
                <div className="mt-5 grid gap-3">
                  {post.mediaUrls.map((u) => (
                    <div key={u} className="rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="" className="w-full max-h-96 object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-400">Post not found in feed.</p>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div id="comments" className="mt-6 rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-bold text-slate-900">
            Comments
            <span className="ml-2 text-sm font-medium text-slate-400">({comments.length})</span>
          </h2>

          {/* Comment form */}
          <form onSubmit={onAddComment} className="mt-5 flex gap-3 items-end">
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={2}
                maxLength={1000}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:bg-white resize-none"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              <Send size={14} />
            </Button>
          </form>

          {/* Comment List */}
          <div className="mt-6 space-y-3">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No comments yet. Be the first!</p>
            ) : (
              comments.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="rounded-xl bg-slate-50 border border-slate-100 p-4 group"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-[10px]">
                        U
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {relativeTime(c.createdAt)}
                      </span>
                    </div>
                    {meId && c.userId === meId && (
                      <button
                        onClick={() => void onDeleteComment(c.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-700 whitespace-pre-wrap">{c.comment}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
