import { headers } from "next/headers";
import { redirect } from "next/navigation";

function getOriginFromHeaders(h: Headers): string | null {
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (!host) return null;
  return `${proto}://${host}`;
}

export async function requireServerAuth(nextPath: string): Promise<void> {
  const h = await headers();
  const origin = getOriginFromHeaders(h);
  if (!origin) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const cookie = h.get("cookie") ?? "";
  const res = await fetch(`${origin}/api/me`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  });
  if (res.status === 401) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
}
