"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Variants } from "framer-motion";
import type { FeedItem } from "@/lib/types";

function relativeTime(iso: string): string {
    try {
        return formatDistanceToNow(new Date(iso), { addSuffix: true });
    } catch {
        return iso;
    }
}

function firstLine(s: string, max = 300): string {
    const trimmed = s.trim();
    if (trimmed.length <= max) return trimmed;
    return `${trimmed.slice(0, max)}…`;
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" },
    }),
};

async function toggleLike(postId: string, liked: boolean): Promise<void> {
    const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: liked ? "DELETE" : "POST",
        cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to toggle like");
}

export function CommunityFeed({
    items,
    loading,
    error,
    onRefresh,
}: {
    items: FeedItem[];
    loading: boolean;
    error: string | null;
    onRefresh?: () => void;
}) {
    const router = useRouter();

    async function handleLike(e: React.MouseEvent, item: FeedItem) {
        e.preventDefault();
        e.stopPropagation();
        try {
            await toggleLike(item.id, item.likedByMe ?? false);
            toast.success(item.likedByMe ? "Like removed" : "Post liked! ❤️");
            onRefresh?.();
        } catch {
            toast.error("Failed to update like");
        }
    }

    function handleComment(e: React.MouseEvent, item: FeedItem) {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/community/${item.id}#comments`);
    }

    function handleShare(e: React.MouseEvent, item: FeedItem) {
        e.preventDefault();
        e.stopPropagation();
        const url = `${window.location.origin}/community/${item.id}`;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link copied to clipboard!");
        }).catch(() => {
            toast.error("Could not copy link");
        });
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
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
                        <div className="h-4 w-full rounded-lg animate-shimmer" />
                        <div className="h-4 w-4/5 rounded-lg animate-shimmer" />
                    </div>
                ))}
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
                <div className="h-16 w-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                    <MessageCircle className="h-8 w-8 text-indigo-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No posts yet</h3>
                <p className="mt-1 text-sm text-slate-500 max-w-xs">
                    Be the first to share something with the community!
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {items.map((item, i) => (
                <motion.div
                    key={item.id}
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={cardVariants}
                >
                    <article
                        onClick={() => router.push(`/community/${item.id}`)}
                        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-slate-300/80 hover:-translate-y-0.5 cursor-pointer group"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {(item.authorName ?? item.type ?? "U").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-slate-900">
                                        {item.authorName ?? "Community Member"}
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        {relativeTime(item.createdAt)}
                                        {item.type ? (
                                            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                                                {item.type === "RESOLVED_COMPLAINT" ? "Resolved" : item.type}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="p-1.5 text-slate-300 hover:text-slate-500 rounded-lg hover:bg-slate-50 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <MoreHorizontal size={16} />
                            </button>
                        </div>

                        {/* Title */}
                        {item.title ? (
                            <h3 className="mt-3 text-base font-bold text-slate-900 leading-snug">
                                {item.title}
                            </h3>
                        ) : null}

                        {/* Content */}
                        <p className="mt-2 text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                            {firstLine(item.content)}
                        </p>

                        {/* Media */}
                        {item.mediaUrls && item.mediaUrls.length > 0 ? (
                            <div className="mt-4 rounded-xl overflow-hidden bg-slate-100 border border-slate-200/60">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.mediaUrls[0]}
                                    alt=""
                                    className="w-full max-h-80 object-cover"
                                    loading="lazy"
                                />
                            </div>
                        ) : null}

                        {/* Actions — now fully wired */}
                        <div className="mt-4 flex items-center gap-1 pt-3 border-t border-slate-100">
                            <button
                                onClick={(e) => void handleLike(e, item)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${item.likedByMe
                                        ? "text-rose-500 bg-rose-50"
                                        : "text-slate-500 hover:text-rose-500 hover:bg-rose-50"
                                    }`}
                            >
                                <Heart size={15} className={item.likedByMe ? "fill-current" : ""} />
                                {item.likeCount && item.likeCount > 0 ? item.likeCount : "Like"}
                            </button>
                            <button
                                onClick={(e) => handleComment(e, item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            >
                                <MessageCircle size={15} />
                                {item.commentCount && item.commentCount > 0 ? item.commentCount : "Comment"}
                            </button>
                            <button
                                onClick={(e) => handleShare(e, item)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                            >
                                <Share2 size={15} />
                                Share
                            </button>
                        </div>
                    </article>
                </motion.div>
            ))}
        </div>
    );
}
