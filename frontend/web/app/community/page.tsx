import Link from "next/link";
import { headers } from "next/headers";

import { Container } from "@/components/Container";
import { Card, CardHeader } from "@/components/ui/Card";
import { requireServerAuth } from "@/lib/serverAuth";

type FeedItem = {
  id: string;
  type: string;
  title: string | null;
  content: string;
  mediaUrls?: string[];
  createdAt: string;
};

async function getFeed(): Promise<FeedItem[]> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return [];

  const url = `${proto}://${host}/api/community/feed`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  return (await res.json()) as FeedItem[];
}

function excerpt(text: string, max = 140): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

export default async function CommunityPage() {
  await requireServerAuth("/community");
  const feed = await getFeed();

  return (
    <Container>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Community</h1>
        <Link
          href="/community/new"
          className="inline-flex h-10 items-center justify-center rounded-md border border-black/15 bg-black px-4 text-sm font-medium text-white hover:bg-black/90"
        >
          Create post
        </Link>
      </div>

      {feed.length === 0 ? <p className="mt-4 text-sm opacity-70">No posts yet.</p> : null}

      <div className="mt-4 grid gap-3">
        {feed.map((p) => (
          <Card key={p.id} className="p-0">
            <div className="p-4">
              <CardHeader
                title={<Link className="underline" href={`/community/${p.id}`}>{p.title ?? "(untitled)"}</Link>}
                subtitle={
                  <>
                    {p.type} · {new Date(p.createdAt).toLocaleString()}
                    {p.mediaUrls && p.mediaUrls.length > 0 ? ` · media: ${p.mediaUrls.length}` : ""}
                  </>
                }
              />
              <p className="mt-3 text-sm opacity-90">{excerpt(p.content)}</p>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
