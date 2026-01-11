"use client";

import { useEffect, useState, useCallback } from "react";
import { CommunityFeed, FeedItem } from "@/components/community/CommunityFeed";
import { Container } from "@/components/Container";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { Button } from "@/components/ui/Button";

export default function CommunityPage() {
  const { checking } = useRequireAuth();
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching community feed...");
      const res = await fetch("/api/community/feed", { cache: "no-store" });
      console.log("Feed response status:", res.status);

      if (res.ok) {
        const json = await res.json();
        console.log("Feed data received:", json.length, "items");
        setFeed(json as FeedItem[]);
      } else {
        const text = await res.text();
        console.error("Feed fetch failed:", text);
        setError(`Failed to load feed (HTTP ${res.status})`);
      }
    } catch (e) {
      console.error("Failed to fetch community feed", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checking) {
      void fetchFeed();
    }
  }, [checking, fetchFeed]);

  if (checking) {
    return (
      <Container>
        <div className="py-12 text-center">
          <p className="text-gray-500 italic flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            Verifying session...
          </p>
        </div>
      </Container>
    );
  }

  if (loading && feed.length === 0) {
    return (
      <Container>
        <div className="py-12 text-center">
          <p className="text-gray-500 italic flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
            Loading global community feed...
          </p>
        </div>
      </Container>
    );
  }

  return (
    <div>
      {error && (
        <Container>
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <Button size="sm" variant="danger" onClick={() => void fetchFeed()}>Retry</Button>
          </div>
        </Container>
      )}

      {!loading && feed.length > 0 && (
        <div className="flex justify-end px-4 mb-2">
          <Button size="sm" variant="ghost" onClick={() => void fetchFeed()} className="text-xs text-gray-500">
            Refresh Feed
          </Button>
        </div>
      )}

      <CommunityFeed initialFeed={feed} />
    </div>
  );
}
