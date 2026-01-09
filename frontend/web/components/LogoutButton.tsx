"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    } finally {
      router.replace("/login");
      setLoading(false);
    }
  }

  return (
    <button type="button" onClick={onLogout} disabled={loading}>
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
