import { apiGet } from "../lib/api";

type HealthResponse = {
  status?: string;
};

async function getHealth(): Promise<HealthResponse> {
  try {
    return await apiGet<HealthResponse>("/actuator/health");
  } catch {
    return { status: "backend not reachable" };
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main>
      <h1 style={{ marginBottom: 8 }}>CivicPulse</h1>
      <p style={{ marginTop: 0 }}>Frontend is running.</p>
      <p>
        Backend health: <strong>{health.status ?? "unknown"}</strong>
      </p>
    </main>
  );
}
