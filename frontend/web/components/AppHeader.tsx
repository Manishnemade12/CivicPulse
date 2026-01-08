import Link from "next/link";

import { Container } from "./Container";

export function AppHeader() {
  return (
    <header
      style={{
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        padding: "12px 0",
      }}
    >
      <Container>
        <nav
          style={{
            display: "flex",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/" style={{ fontWeight: 700 }}>
              CivicPulse
            </Link>
            <Link href="/complaints">Complaints</Link>
            <Link href="/community">Community</Link>
            <Link href="/admin/complaints">Admin</Link>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link href="/auth/login">Login</Link>
            <Link href="/auth/register">Register</Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}
