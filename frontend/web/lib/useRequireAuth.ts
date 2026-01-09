"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type UseRequireAuthResult = {
  checking: boolean;
};

export function useRequireAuth(): UseRequireAuthResult {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setChecking(true);
      try {
        const res = await fetch("/api/me", { cache: "no-store" });
        if (cancelled) return;

        if (res.status === 401) {
          const next = pathname || "/";
          router.replace(`/login?next=${encodeURIComponent(next)}`);
          return;
        }

        // For non-401 failures, don't trap users in a redirect loop.
      } catch {
        // ignore (backend might be down); let page render its own errors
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  return { checking };
}
