"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, FileText, MessageSquare, RefreshCw } from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/Button";
import { StatsCard } from "@/components/ui/StatsCard";
import { CommunityFeed } from "@/components/community/CommunityFeed";
import { useRequireAuth } from "@/lib/useRequireAuth";
import type { MeResponse, FeedItem } from "@/lib/types";

export default function ProfilePage() {
  const { checking } = useRequireAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [myPosts, setMyPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [meRes, postsRes] = await Promise.all([
        fetch("/api/me", { cache: "no-store" }),
        fetch("/api/community/me/posts", { cache: "no-store" }), // Fixed: user's own posts only
      ]);

      if (!meRes.ok) throw new Error("Failed to load profile");
      const meData = (await meRes.json()) as MeResponse;
      setMe(meData);

      if (postsRes.ok) {
        setMyPosts((await postsRes.json()) as FeedItem[]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!checking) void load();
  }, [checking]);

  function formatMemberSince(iso?: string): string {
    if (!iso) return "—";
    try {
      return format(new Date(iso), "MMM yyyy");
    } catch {
      return "—";
    }
  }

  if (checking || loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 p-8 h-48 animate-shimmer" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-100 p-4 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Hero Card */}
      {me && (
        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-8 relative overflow-hidden shadow-lg">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex items-center gap-5 flex-wrap">
            <div className="h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {me.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">{me.name}</h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-indigo-100 text-sm">
                  <Mail size={14} />
                  {me.email}
                </div>
                <div className="flex items-center gap-1.5 text-indigo-100 text-sm">
                  <Shield size={14} />
                  {me.role}
                </div>
              </div>
            </div>
            <div className="ml-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void load()}
                className="bg-white/20 border-white/30 text-white hover:bg-white/30"
              >
                <RefreshCw size={14} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stats — now showing real data */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatsCard
          icon={<FileText className="h-5 w-5" />}
          label="Your Posts"
          value={myPosts.length}
        />
        <StatsCard
          icon={<MessageSquare className="h-5 w-5" />}
          label="Community"
          value="Active"
        />
        <StatsCard
          icon={<Calendar className="h-5 w-5" />}
          label="Member Since"
          value={formatMemberSince(me?.createdAt)}
        />
      </div>

      {/* Your Posts Feed */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4">Your Posts</h2>
        {myPosts.length === 0 && !loading ? (
          <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50">
            <FileText className="h-8 w-8 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 font-medium">You haven&apos;t posted yet</p>
            <p className="text-xs text-slate-400 mt-1">Share something with the community!</p>
          </div>
        ) : (
          <CommunityFeed items={myPosts} loading={false} error={null} onRefresh={() => void load()} />
        )}
      </div>
    </motion.div>
  );
}
