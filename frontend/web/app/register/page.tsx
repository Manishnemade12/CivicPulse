"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Users, ArrowRight } from "lucide-react";

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const msg = (body as { error?: { message?: string } })?.error?.message || `Registration failed`;
        throw new Error(msg);
      }

      await res.json();
      toast.success("Account created!", { description: "Welcome to CivicPulse! Redirecting..." });

      const next = searchParams.get("next") || "/community";
      router.replace(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-indigo-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 rounded-full" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-white/5 rounded-full" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="h-7 w-7 text-white" />
              </div>
              <span className="text-2xl font-extrabold text-white tracking-tight">CivicPulse</span>
            </div>
            <h1 className="text-4xl font-black text-white leading-tight">
              Join the
              <br />
              <span className="text-purple-200">community.</span>
            </h1>
            <p className="mt-4 text-indigo-100 text-lg leading-relaxed max-w-md">
              Create your free account and start making a difference in your local community today.
            </p>

            <div className="mt-10 grid gap-3">
              {[
                "✓ Report issues anonymously",
                "✓ Track complaint status in real time",
                "✓ Engage with your community",
              ].map((text) => (
                <div key={text} className="text-sm text-indigo-100 font-medium">
                  {text}
                </div>
              ))}
            </div>
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-black text-sm">
              CP
            </div>
            <span className="text-xl font-extrabold text-slate-900">CivicPulse</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900">Create account</h2>
            <p className="mt-1 text-sm text-slate-500">Get started in under 30 seconds</p>

            <form onSubmit={onSubmit} className="mt-8 grid gap-5">
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-slate-700">Full name</span>
                <input
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </label>

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
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
              </label>

              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors" href="/login">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}
