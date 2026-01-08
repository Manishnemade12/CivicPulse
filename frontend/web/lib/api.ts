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

export async function apiPost<T>(
  path: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const res = await fetch(`${baseUrl}${normalizedPath}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: JSON.stringify(body),
    ...init,
    cache: init?.cache ?? "no-store",
  });

  if (!res.ok) {
    throw new Error(`API POST ${normalizedPath} failed (HTTP ${res.status})`);
  }

  return (await res.json()) as T;
}

export async function apiDelete<T>(path: string, init?: RequestInit): Promise<T> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const res = await fetch(`${baseUrl}${normalizedPath}`, {
    method: "DELETE",
    ...init,
    cache: init?.cache ?? "no-store",
  });

  if (!res.ok) {
    throw new Error(`API DELETE ${normalizedPath} failed (HTTP ${res.status})`);
  }

  // Some DELETE endpoints may return empty; be defensive.
  const text = await res.text();
  return (text ? (JSON.parse(text) as T) : (undefined as T));
}
