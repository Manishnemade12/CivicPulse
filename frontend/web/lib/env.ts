export function getApiBaseUrl(): string {
  // Server components can safely read non-public env vars.
  // For local dev, we fall back to the backend default.
  return process.env.API_BASE_URL ?? "http://localhost:8081";
}
