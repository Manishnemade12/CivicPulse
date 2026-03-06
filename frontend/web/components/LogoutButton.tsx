"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
      toast.success("Logged out successfully");
    } finally {
      router.replace("/login");
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <LogOut size={16} />
      )}
      {loading ? "Logging out…" : "Sign out"}
    </button>
  );
}
