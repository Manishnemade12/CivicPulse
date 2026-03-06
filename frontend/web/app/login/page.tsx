"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight } from "lucide-react";

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Invalid email or password`);
      }

      await res.json();
      toast.success("Welcome back!", { description: "Redirecting to your dashboard..." });

      const next = searchParams.get("next") || "/community";
      router.replace(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <ShieldCheck className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">CivicPulse</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight">
              Welcome back,
              <br />
              <span className="text-indigo-200">change maker.</span>
            </h1>
            <p className="mt-4 text-indigo-100 text-lg leading-relaxed max-w-md">
              Sign in to track your complaints, engage with your community, and make your voice heard.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 bg-slate-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm">
              CP
            </div>
            <span className="text-xl font-extrabold text-slate-900">CivicPulse</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900">Sign in</h2>
            <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>

            <form onSubmit={onSubmit} className="mt-8 grid gap-5">
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-slate-700">Email</span>
                <input
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </label>

              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-slate-700">Password</span>
                <input
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" href="/register">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
