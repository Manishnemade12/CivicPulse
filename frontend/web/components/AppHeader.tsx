"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Container } from "./Container";
import { LogoutButton } from "./LogoutButton";

export function AppHeader() {
  const pathname = usePathname();

  const [authed, setAuthed] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (cancelled) return;
        setAuthed(res.ok);
      } catch {
        if (cancelled) return;
        setAuthed(false);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // First interface should be login/register only
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

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
            <Link href="/complaints/new">Raise Complaint</Link>
            <Link href="/complaints/my">My Complaints</Link>
            <Link href="/community">Community</Link>
            <Link href="/admin/complaints">Admin</Link>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            {authChecked && authed ? (
              <LogoutButton />
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/register">Register</Link>
              </>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
