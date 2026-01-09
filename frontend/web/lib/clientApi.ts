type ApiError = {
  error?: {
    code?: string;
    message?: string;
    details?: string[];
  };
};

async function parseError(res: Response): Promise<string> {
  try {
    const json = (await res.json()) as ApiError;
    const msg = json?.error?.message;
    if (msg) return msg;
  } catch {
    // ignore
  }
  return `Request failed (HTTP ${res.status})`;
}

export async function clientGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}

export async function clientPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}

export async function clientPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
  return (await res.json()) as T;
}

export async function clientDelete(path: string): Promise<void> {
  const res = await fetch(path, {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(await parseError(res));
}
