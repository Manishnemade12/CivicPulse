export function getApiBaseUrl(): string {
  const base = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error("Missing API base URL. Set API_BASE_URL (preferred) or NEXT_PUBLIC_API_BASE_URL.");
  }
  return base;
}
