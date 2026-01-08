const STORAGE_KEY = "cp_anon_hash";

function randomString(length: number): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function getOrCreateAnonymousUserHash(): string {
  if (typeof window === "undefined") {
    // This should only be used in client components.
    return "";
  }

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing && existing.length >= 10) return existing;

  const created = `${randomString(32)}${Date.now().toString(36)}`;
  window.localStorage.setItem(STORAGE_KEY, created);
  return created;
}
