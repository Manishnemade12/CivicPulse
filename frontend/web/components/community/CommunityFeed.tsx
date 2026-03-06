"use client";

import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, Send, Trash2, MoreHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { toast } from "sonner";
import type { FeedItem, CommentDto } from "@/lib/types";

/* ─── helpers ─── */
function relativeTime(iso: string): string {
    try { return formatDistanceToNow(new Date(iso), { addSuffix: true }); }
    catch { return iso; }
}
function firstLine(s: string, max = 320): string {
    const t = s.trim();
    return t.length <= max ? t : `${t.slice(0, max)}…`;
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
    }),
};

type LikeState = { liked: boolean; count: number };

/* ─── Inline comment drawer ─── */
function CommentDrawer({
    postId,
    meId,
    open,
    onClose,
}: {
    postId: string;
    meId: string | null;
    open: boolean;
    onClose: () => void;
}) {
    const [comments, setComments] = useState<CommentDto[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Fetch when drawer opens (reactive on open / postId dependency)
    useEffect(() => {
        if (!open) {
            setComments([]);
            setText("");
            return;
        }
        let cancelled = false;
        setLoadingComments(true);
        fetch(`/api/community/posts/${postId}/comments`, { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : Promise.reject()))
            .then((data: CommentDto[]) => { if (!cancelled) setComments(data); })
            .catch(() => { })
            .finally(() => { if (!cancelled) setLoadingComments(false); });
        return () => { cancelled = true; };
    }, [open, postId]);

    // Auto-scroll to bottom when comments arrive
    useEffect(() => {
        if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments, open]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const trimmed = text.trim();
        if (!trimmed) return;
        setSubmitting(true);
        try {
            const res = await fetch(`/api/community/posts/${postId}/comments`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ comment: trimmed }),
            });
            if (!res.ok) throw new Error();
            setText("");
            // Refresh comment list after posting
            const refreshed = await fetch(`/api/community/posts/${postId}/comments`, { cache: "no-store" });
            if (refreshed.ok) setComments(await refreshed.json() as CommentDto[]);
            toast.success("Comment posted!");
        } catch {
            toast.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(commentId: string) {
        try {
            const res = await fetch(`/api/community/posts/${postId}/comments/${commentId}`, { method: "DELETE" });
            if (!res.ok) throw new Error();
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            toast.success("Comment deleted");
        } catch {
            toast.error("Failed to delete");
        }
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden border-t border-slate-100"
                >
                    <div className="bg-slate-50/60 px-5 py-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                {loadingComments ? "Loading…" : `${comments.length} Comment${comments.length !== 1 ? "s" : ""}`}
                            </span>
                            <button
                                onClick={onClose}
                                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {comments.length === 0 && !loadingComments && (
                                <p className="text-sm text-slate-400 text-center py-4">No comments yet. Be first!</p>
                            )}
                            {comments.map((c, i) => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, y: 6 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="flex gap-3 group"
                                >
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white font-bold text-[10px] shrink-0 mt-0.5">
                                        U
                                    </div>
                                    <div className="flex-1 rounded-xl bg-white border border-slate-100 px-3 py-2 text-sm text-slate-700 shadow-sm leading-relaxed whitespace-pre-wrap">
                                        {c.comment}
                                        <div className="flex items-center justify-between mt-1">
                                            <span className="text-[11px] text-slate-400">{relativeTime(c.createdAt)}</span>
                                            {meId && c.userId === meId && (
                                                <button
                                                    onClick={() => void handleDelete(c.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-300 hover:text-red-500 transition-all"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2 mt-3">
                            <input
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Write a comment…"
                                maxLength={1000}
                                className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={submitting || !text.trim()}
                                className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 disabled:opacity-40 transition-colors shrink-0"
                            >
                                <Send size={14} />
                            </button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ─── Main Feed ─── */
export function CommunityFeed({
    items,
    loading,
    error,
    meId,
}: {
    items: FeedItem[];
    loading: boolean;
    error: string | null;
    meId?: string | null;
}) {
    // Per-post like state — ALWAYS re-seeded when items arrive from server
    const [likeStates, setLikeStates] = useState<Record<string, LikeState>>({});
    // Track in-flight like requests to prevent double-clicking
    const pendingLikeRef = useRef<Set<string>>(new Set());
    // Which post has its comment drawer open
    const [openComments, setOpenComments] = useState<string | null>(null);

    // Re-sync from server every time items prop changes (i.e., on data reload)
    useEffect(() => {
        const next: Record<string, LikeState> = {};
        for (const item of items) {
            next[item.id] = {
                liked: item.likedByMe ?? false,
                count: item.likeCount ?? 0,
            };
        }
        setLikeStates(next);
    }, [items]); // ← reactive dependency: runs whenever items are refreshed from API

    async function handleLike(e: React.MouseEvent, item: FeedItem) {
        e.preventDefault();
        e.stopPropagation();

        // Prevent double-click spam while request is in flight
        if (pendingLikeRef.current.has(item.id)) return;
        pendingLikeRef.current.add(item.id);

        const cur = likeStates[item.id] ?? { liked: false, count: 0 };

        // Optimistic update
        const next: LikeState = {
            liked: !cur.liked,
            count: cur.liked ? Math.max(0, cur.count - 1) : cur.count + 1,
        };
        setLikeStates((prev) => ({ ...prev, [item.id]: next }));

        try {
            const res = await fetch(`/api/community/posts/${item.id}/like`, {
                method: cur.liked ? "DELETE" : "POST",
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            toast.success(cur.liked ? "Like removed" : "Liked! ❤️", { duration: 1500 });
        } catch (err) {
            // Rollback on failure
            setLikeStates((prev) => ({ ...prev, [item.id]: cur }));
            const msg = err instanceof Error ? err.message : "Failed";
            toast.error(`Could not update like (${msg})`);
        } finally {
            pendingLikeRef.current.delete(item.id);
        }
    }

    function handleShare(e: React.MouseEvent, item: FeedItem) {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/community/${item.id}`;
        navigator.clipboard.writeText(url)
            .then(() => toast.success("Link copied!"))
            .catch(() => toast.error("Could not copy link"));
    }

    function toggleComments(e: React.MouseEvent, itemId: string) {
        e.preventDefault();
        e.stopPropagation();
        setOpenComments((prev) => (prev === itemId ? null : itemId));
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-sm font-semibold text-red-600">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full animate-shimmer" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 rounded-lg animate-shimmer" />
                                <div className="h-3 w-1/4 rounded-lg animate-shimmer" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="h-4 w-full rounded-lg animate-shimmer" />
                            <div className="h-4 w-4/5 rounded-lg animate-shimmer" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No posts yet</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-xs">Be the first to share something!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, i) => {
                const ls = likeStates[item.id] ?? { liked: false, count: 0 };
                const commentsOpen = openComments === item.id;

                return (
                    <motion.article
                        key={item.id}
                        custom={i}
                        initial="hidden"
                        animate="visible"
                        variants={cardVariants}
                        className="rounded-2xl border border-slate-200/80 bg-white shadow-sm overflow-hidden transition-shadow duration-200 hover:shadow-md"
                    >
                        <div className="p-5">
                            {/* Author row */}
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {(item.authorName ?? item.type ?? "U").charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="text-sm font-semibold text-slate-900">
                                            {item.authorName ?? "Community Member"}
                                        </div>
                                        <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                            {relativeTime(item.createdAt)}
                                            {item.type && (
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                                    {item.type === "RESOLVED_COMPLAINT" ? "Resolved" : item.type}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button className="p-1.5 text-slate-300 hover:text-slate-500 rounded-lg hover:bg-slate-50 transition-colors">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>

                            {/* Title */}
                            {item.title && (
                                <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                            )}

                            {/* Content */}
                            <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                {firstLine(item.content)}
                            </p>

                            {/* Media */}
                            {item.mediaUrls && item.mediaUrls.length > 0 && (
                                <div className="mt-4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={item.mediaUrls[0]} alt="" className="w-full max-h-80 object-cover" loading="lazy" />
                                </div>
                            )}

                            {/* Action bar */}
                            <div className="mt-4 flex items-center gap-1 pt-3 border-t border-slate-100">
                                {/* Like */}
                                <button
                                    onClick={(e) => void handleLike(e, item)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 select-none ${ls.liked
                                            ? "text-rose-500 bg-rose-50"
                                            : "text-slate-500 hover:text-rose-500 hover:bg-rose-50"
                                        }`}
                                >
                                    <Heart size={15} className={ls.liked ? "fill-current" : ""} />
                                    {ls.count > 0 ? ls.count : "Like"}
                                </button>

                                {/* Comment — toggles inline drawer */}
                                <button
                                    onClick={(e) => toggleComments(e, item.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 select-none ${commentsOpen
                                            ? "text-indigo-600 bg-indigo-50"
                                            : "text-slate-500 hover:text-indigo-500 hover:bg-indigo-50"
                                        }`}
                                >
                                    <MessageCircle size={15} className={commentsOpen ? "fill-current" : ""} />
                                    {(item.commentCount ?? 0) > 0 ? item.commentCount : "Comment"}
                                </button>

                                {/* Share */}
                                <button
                                    onClick={(e) => handleShare(e, item)}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                                >
                                    <Share2 size={15} />
                                    Share
                                </button>
                            </div>
                        </div>

                        {/* Inline comment drawer */}
                        <CommentDrawer
                            postId={item.id}
                            meId={meId ?? null}
                            open={commentsOpen}
                            onClose={() => setOpenComments(null)}
                        />
                    </motion.article>
                );
            })}
        </div>
    );
}
