type HealthResponse = {
  status?: string;
};

type VersionResponse = {
  name?: string;
  version?: string;
};

async function getHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch("/actuator/health", { cache: "no-store" });
    if (!res.ok) return { status: `HTTP ${res.status}` };
    return (await res.json()) as HealthResponse;
  } catch {
    return { status: "backend not reachable" };
  }
}

async function getVersion(): Promise<VersionResponse> {
  try {
    const res = await fetch("/api/version", { cache: "no-store" });
    if (!res.ok) return { version: `HTTP ${res.status}` };
    return (await res.json()) as VersionResponse;
  } catch {
    return { version: "backend not reachable" };
  }
}

export default async function Home() {
  const [health, version] = await Promise.all([getHealth(), getVersion()]);

  return (
    <main>
      <h1 style={{ marginBottom: 8 }}>CivicPulse</h1>
      <p style={{ marginTop: 0 }}>Frontend is running.</p>
      <p>
        Backend health: <strong>{health.status ?? "unknown"}</strong>
      </p>
      <p>
        Backend version:{" "}
        <strong>
          {version.name ? `${version.name} ` : ""}
          {version.version ?? "unknown"}
        </strong>
      </p>
    </main>
  );
}
