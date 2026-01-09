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
    <header className="border-b border-black/10 py-3">
      <Container>
        <nav className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/" className="font-semibold">
              CivicPulse
            </Link>
            <Link href="/profile">Profile</Link>
            <Link href="/complaints/new">Raise Complaint</Link>
            <Link href="/complaints/my">My Complaints</Link>
            <Link href="/community">Community</Link>
            <Link href="/admin/complaints">Admin</Link>
          </div>

          <div className="flex items-center gap-3">
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
