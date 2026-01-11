"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";

import { Container } from "@/components/Container";

export type FeedItem = {
    id: string;
    type: string;
    title: string | null;
    content: string;
    mediaUrls?: string[];
    createdAt: string;
    authorName?: string;
    authorId?: string;
};

// Helper for relative time (e.g. "2h ago")
function timeAgo(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;

    return date.toLocaleDateString();
}

function Avatar({ name }: { name: string }) {
    // Generate a consistent color based on name
    const colors = [
        "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500",
        "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-sky-500",
        "bg-blue-500", "bg-indigo-500", "bg-violet-500", "bg-purple-500",
        "bg-fuchsia-500", "bg-pink-500", "bg-rose-500"
    ];
    const charCode = name.charCodeAt(0) || 0;
    const color = colors[charCode % colors.length];

    return (
        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${color}`}>
            {name.substring(0, 1).toUpperCase()}
        </div>
    );
}

export function CommunityFeed({ initialFeed }: { initialFeed: FeedItem[] }) {
    const [feed, setFeed] = useState<FeedItem[]>(initialFeed);

    useEffect(() => {
        setFeed(initialFeed);
    }, [initialFeed]);

    return (
        <Container className="max-w-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">Community</h1>
                </div>
            </div>

            {feed.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
                    <h3 className="mt-2 text-sm font-semibold text-gray-900">No posts yet</h3>
                    <p className="mt-1 text-sm text-gray-500">Be the first to share something.</p>
                </div>
            ) : null}

            <div className="grid gap-6 pb-20">
                {feed.map((p) => {
                    const authorName = p.authorName || "Anonymous User";

                    return (
                        <article key={p.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            {/* Header */}
                            <div className="flex items-center justify-between p-3">
                                <div className="flex items-center gap-3">
                                    <Avatar name={authorName} />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 leading-none">{authorName}</span>
                                        <span className="text-xs text-gray-500 mt-0.5">{p.title ? p.title : "Community Post"}</span>
                                    </div>
                                </div>
                                <button className="text-gray-400 hover:text-gray-600">
                                    <MoreHorizontal size={20} />
                                </button>
                            </div>

                            {/* Media */}
                            {/* If media exists, show first image full width. If no media, show content as "text post" style or just empty if purely Title based */}
                            {/* For this style, text-only posts should be rendered cleanly too. */}

                            {p.mediaUrls && p.mediaUrls.length > 0 ? (
                                <div className="bg-gray-100 aspect-video w-full flex items-center justify-center overflow-hidden">
                                    {/* In a real app we'd map all images or use a carousel. Just showing first for now. */}
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={p.mediaUrls[0]}
                                        alt="Post content"
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ) : null}

                            {/* Actions */}
                            <div className="p-3 pb-1">
                                <div className="flex items-center gap-4">
                                    <button className="text-gray-900 hover:opacity-70 transition-opacity">
                                        <Heart size={24} />
                                    </button>
                                    <Link href={`/community/${p.id}`} className="text-gray-900 hover:opacity-70 transition-opacity">
                                        <MessageCircle size={24} />
                                    </Link>
                                    <button className="text-gray-900 hover:opacity-70 transition-opacity">
                                        <Share2 size={24} />
                                    </button>
                                </div>
                                {/* Likes count placeholder */}
                                {/* <div className="font-semibold text-sm mt-2">12 likes</div> */}
                            </div>

                            {/* Content / Caption */}
                            <div className="px-3 pb-3">
                                <div className="text-sm">
                                    <span className="font-semibold mr-2">{authorName}</span>
                                    <span className="whitespace-pre-wrap text-gray-900">{p.content}</span>
                                </div>

                                <div className="mt-1">
                                    <Link href={`/community/${p.id}`} className="text-xs text-gray-500 hover:text-gray-800">
                                        View details and comments
                                    </Link>
                                </div>

                                <div className="text-[10px] uppercase text-gray-400 mt-2 tracking-wide">
                                    {timeAgo(p.createdAt)}
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </Container>
    );
}
