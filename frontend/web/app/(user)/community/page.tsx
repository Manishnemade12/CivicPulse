"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";

import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { Button } from "@/components/ui/Button";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { FeedItem, MeResponse } from "@/lib/types";

export default function CommunityPage() {
  const { checking } = useRequireAuth();

  const [items, setItems] = useState<FeedItem[]>([]);
  const [meId, setMeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Increment this to trigger a reactive re-fetch (e.g. after creating a post)
  const [fetchTick, setFetchTick] = useState(0);

  // Auto-fetch whenever auth resolves OR fetchTick increments
  useEffect(() => {
    if (checking) return; // wait for auth check before fetching
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetch("/api/community/feed", { cache: "no-store" }),
      fetch("/api/me", { cache: "no-store" }),
    ])
      .then(async ([feedRes, meRes]) => {
        if (cancelled) return;
        if (!feedRes.ok) throw new Error(`Feed failed (HTTP ${feedRes.status})`);
        const [feedData, meData] = await Promise.all([
          feedRes.json() as Promise<FeedItem[]>,
          meRes.ok ? (meRes.json() as Promise<MeResponse>) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setItems(feedData);
        setMeId(meData?.id ?? null);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load feed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [checking, fetchTick]); // ← reactive deps: re-runs when auth done, or after post creation

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community</h1>
          <p className="text-sm text-slate-500 mt-0.5">Share experiences and discuss local issues</p>
        </div>
        <Button
          variant="gradient"
          size="sm"
          onClick={() => setModalOpen(true)}
        >
          <Plus size={14} />
          Create Post
        </Button>
      </div>

      <CommunityFeed
        items={items}
        loading={loading || checking}
        error={error}
        meId={meId}
      />

      {/* Mobile FAB */}
      <button
        onClick={() => setModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl flex items-center justify-center transition-all duration-200 active:scale-[0.93]"
        aria-label="Create post"
      >
        <Plus size={24} />
      </button>

      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setFetchTick((t) => t + 1)} // reactive: triggers useEffect re-run
      />
    </>
  );
}
