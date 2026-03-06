"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Plus } from "lucide-react";

import { CommunityFeed } from "@/components/community/CommunityFeed";
import { CreatePostModal } from "@/components/community/CreatePostModal";
import { Button } from "@/components/ui/Button";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { FeedItem } from "@/lib/types";

export default function CommunityPage() {
  const { checking } = useRequireAuth();

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/community/feed", { cache: "no-store" });
      if (!res.ok) throw new Error(`Feed failed (HTTP ${res.status})`);
      setItems((await res.json()) as FeedItem[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load feed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void load();
  }, [checking]);

  return (
    <>
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4 mb-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community</h1>
          <p className="text-sm text-slate-500 mt-0.5">Share experiences and discuss local issues</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button
            variant="gradient"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={14} />
            Create Post
          </Button>
        </div>
      </div>

      <CommunityFeed
        items={items}
        loading={loading || checking}
        error={error}
        onRefresh={() => void load()}
      />

      {/* FAB for mobile */}
      <button
        onClick={() => setModalOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-200 active:scale-[0.93]"
      >
        <Plus size={24} />
      </button>

      <CreatePostModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => void load()}
      />
    </>
  );
}
