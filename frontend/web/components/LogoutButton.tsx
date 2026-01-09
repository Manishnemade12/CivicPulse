"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";

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
    <Button type="button" onClick={onLogout} disabled={loading} variant="secondary" size="sm">
      {loading ? "Logging out…" : "Logout"}
    </Button>
  );
}
