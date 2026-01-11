"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { useRequireAuth } from "@/lib/useRequireAuth";
import { CommunityFeed, FeedItem } from "@/components/community/CommunityFeed";

type MeResponse = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function ProfilePage() {
  const { checking } = useRequireAuth();

  const [me, setMe] = useState<MeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/me", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load profile (HTTP ${res.status})`);
      const data = (await res.json()) as MeResponse;
      setMe(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function loadFeed() {
    try {
      const res = await fetch("/api/community/feed", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        setFeed(json as FeedItem[]);
      }
    } catch (e) {
      console.error("Failed to load community feed", e);
    }
  }

  useEffect(() => {
    if (checking) return;
    void loadProfile();
    void loadFeed();
  }, [checking]);

  if (checking) {
    return (
      <Container>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="mt-2 text-sm opacity-70">Checking session…</p>
      </Container>
    );
  }

  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Button onClick={() => void loadProfile()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-red-700">{error}</p>}

      <Card className="mt-6">
        <CardHeader title="Account" />
        {me ? (
          <div className="mt-3 grid gap-1 text-sm">
            <div><span className="opacity-70">Name:</span> {me.name}</div>
            <div><span className="opacity-70">Email:</span> {me.email}</div>
            <div><span className="opacity-70">Role:</span> {me.role}</div>
            <div><span className="opacity-70">User ID:</span> {me.id}</div>
          </div>
        ) : (
          <p className="mt-3 text-sm opacity-70">Click Refresh to load profile.</p>
        )}
      </Card>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Community Feed</h2>
        <CommunityFeed initialFeed={feed} />
      </div>
    </Container>
  );
}
