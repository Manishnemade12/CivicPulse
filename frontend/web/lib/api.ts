import { getApiBaseUrl } from "./env";

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const res = await fetch(`${baseUrl}${normalizedPath}`, {
    ...init,
    // Default to dynamic data during dev; callers can override.
    cache: init?.cache ?? "no-store",
  });

  if (!res.ok) {
    throw new Error(`API GET ${normalizedPath} failed (HTTP ${res.status})`);
  }

  return (await res.json()) as T;
}
