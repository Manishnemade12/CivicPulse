"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import { LogoutButton } from "@/components/LogoutButton";

type NavItem = { href: string; label: string };

type MeResponse = { id: string; name: string; email: string; role: string };

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function isAuthRoute(pathname: string) {
  return (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register"
  );
}

function isAdminRoute(pathname: string) {
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (cancelled) return;
        if (!res.ok) {
          setAuthed(false);
          setMe(null);
          return;
        }
        const json = (await res.json()) as MeResponse;
        setAuthed(true);
        setMe(json);
      } catch {
        if (cancelled) return;
        setAuthed(false);
        setMe(null);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const navItems: NavItem[] = useMemo(() => {
    if (isAdminRoute(pathname)) {
      return [{ href: "/admin/complaints", label: "Complaints" }];
    }
    return [
      { href: "/community", label: "Community" },
      { href: "/community/new", label: "Create Post" },
      { href: "/complaints/new", label: "Raise Complaint" },
      { href: "/complaints/my", label: "My Complaints" },
      { href: "/profile", label: "Profile" },
    ];
  }, [pathname]);

  if (isAuthRoute(pathname)) return <>{children}</>;

  const adminMode = isAdminRoute(pathname);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 border-r border-black/10 p-4 md:block">
          <div className="text-sm font-semibold">
            <Link href={adminMode ? "/admin/complaints" : "/community"}>CivicPulse</Link>
          </div>

          <div className="mt-4 grid gap-1">
            {navItems.map((it) => {
              const active = pathname === it.href;
              return (
                <Link
                  key={it.href}
                  href={it.href}
                  className={cx(
                    "rounded-md px-3 py-2 text-sm",
                    active ? "bg-black/5 font-medium" : "hover:bg-black/5"
                  )}
                >
                  {it.label}
                </Link>
              );
            })}

            {adminMode ? (
              <Link href="/community" className="rounded-md px-3 py-2 text-sm hover:bg-black/5">
                Back to user app
              </Link>
            ) : (
              <Link href="/admin/complaints" className="rounded-md px-3 py-2 text-sm hover:bg-black/5">
                Admin
              </Link>
            )}
          </div>

          <div className="mt-6 border-t border-black/10 pt-4">
            {authChecked && authed ? (
              <div className="grid gap-3">
                {me ? (
                  <div className="text-xs opacity-70">
                    <div className="font-medium text-black">{me.name}</div>
                    <div>{me.email}</div>
                  </div>
                ) : null}
                <LogoutButton />
              </div>
            ) : (
              <div className="grid gap-2">
                <Link href="/login" className="text-sm underline">
                  Login
                </Link>
                <Link href="/register" className="text-sm underline">
                  Register
                </Link>
              </div>
            )}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="border-b border-black/10 p-4 md:hidden">
            <div className="flex items-center justify-between gap-3">
              <Link href={adminMode ? "/admin/complaints" : "/community"} className="text-sm font-semibold">
                CivicPulse
              </Link>
              {authChecked && authed ? (
                <div className="flex items-center gap-2">
                  <LogoutButton />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm underline">
                    Login
                  </Link>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {navItems.map((it) => (
                <Link key={it.href} href={it.href} className="rounded-md border border-black/10 px-3 py-1.5 text-xs">
                  {it.label}
                </Link>
              ))}
            </div>
          </header>

          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
