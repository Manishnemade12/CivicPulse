import Link from "next/link";
import { headers } from "next/headers";

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

export default async function CommunityPage() {
  const feed = await getFeed();

  return (
    <main>
      <h1>Community</h1>
      <p>
        <Link href="/community/new">Create post</Link>
      </p>

      {feed.length === 0 ? <p>No posts yet.</p> : null}

      <ul style={{ paddingLeft: 18 }}>
        {feed.map((p) => (
          <li key={p.id} style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 700 }}>
              <Link href={`/community/${p.id}`}>{p.title ?? "(untitled)"}</Link>
            </div>
            <div style={{ opacity: 0.8, fontSize: 14 }}>
              {p.type} · {new Date(p.createdAt).toLocaleString()}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
