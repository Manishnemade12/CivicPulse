type HealthResponse = {
  status?: string;
};

async function getHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch("http://localhost:8081/actuator/health", {
      cache: "no-store",
    });

    if (!res.ok) {
      return { status: `HTTP ${res.status}` };
    }

    return (await res.json()) as HealthResponse;
  } catch {
    return { status: "backend not reachable" };
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>CivicPulse</h1>
      <p style={{ marginTop: 0 }}>Frontend is running.</p>
      <p>
        Backend health: <strong>{health.status ?? "unknown"}</strong>
      </p>
    </main>
  );
}
