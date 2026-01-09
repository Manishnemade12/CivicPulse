import Link from "next/link";
import { headers } from "next/headers";

import { Container } from "@/components/Container";
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
    <main>
      <Container>
        <h1>Community</h1>

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <Link href="/community/new">Create post</Link>
        </div>

        {feed.length === 0 ? <p>No posts yet.</p> : null}

        <ul style={{ listStyle: "none", paddingLeft: 0, marginTop: 16 }}>
          {feed.map((p) => (
            <li
              key={p.id}
              style={{
                marginBottom: 14,
                padding: 12,
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 10,
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                <Link href={`/community/${p.id}`}>{p.title ?? "(untitled)"}</Link>
              </div>

              <div style={{ opacity: 0.75, fontSize: 13, marginTop: 4 }}>
                {p.type} · {new Date(p.createdAt).toLocaleString()}
                {p.mediaUrls && p.mediaUrls.length > 0 ? ` · media: ${p.mediaUrls.length}` : ""}
              </div>

              <div style={{ marginTop: 8, opacity: 0.9 }}>{excerpt(p.content)}</div>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
