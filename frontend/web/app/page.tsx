"use client";

import Link from "next/link";
import { ShieldCheck, MessageSquare, BarChart3, ArrowRight, Users, Zap, Globe } from "lucide-react";
import { motion } from "framer-motion";

import type { Variants } from "framer-motion";

const fade: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const features = [
  {
    icon: ShieldCheck,
    title: "Anonymous Reporting",
    description: "Submit complaints safely without revealing your identity. Your privacy is our top priority.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: MessageSquare,
    title: "Community Hub",
    description: "Share experiences, discuss local issues, and build awareness with fellow citizens.",
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    icon: BarChart3,
    title: "Real-time Tracking",
    description: "Track your complaint status from Raised to Resolved — full transparency guaranteed.",
    gradient: "from-amber-500 to-orange-600",
  },
];

const stats = [
  { value: "100%", label: "Anonymous", icon: ShieldCheck },
  { value: "24/7", label: "Available", icon: Zap },
  { value: "Open", label: "Community", icon: Users },
  { value: "Live", label: "Tracking", icon: Globe },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">
              CP
            </div>
            <span className="text-xl font-extrabold tracking-tight text-slate-900">CivicPulse</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.97]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-3xl animate-float" />
          <div className="absolute top-60 -left-40 w-[400px] h-[400px] rounded-full bg-purple-200/30 blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-emerald-200/30 blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={0}
            className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full px-4 py-1.5 text-sm font-semibold mb-8"
          >
            <Zap className="h-4 w-4" />
            Your voice matters
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={1}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1]"
          >
            Shape your city,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              stay anonymous
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={2}
            className="mt-6 text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
          >
            Report local issues anonymously, track resolutions in real time, and engage
            with your community — all on one powerful platform.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fade}
            custom={3}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.97] group"
            >
              Get started free
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-slate-700 font-bold px-8 py-4 rounded-2xl text-base border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm transition-all duration-200"
            >
              Sign in
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Strip */}
      <section className="py-16 px-6 border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fade}
                custom={i}
                className="text-center"
              >
                <stat.icon className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-500 font-medium mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-slate-50/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fade}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Everything you need
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              A complete platform for civic engagement — from anonymous reporting to community building.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fade}
                custom={i + 1}
                className="group bg-white rounded-2xl border border-slate-200/80 p-7 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gradient-to-br ${feature.gradient} text-white shadow-md mb-5`}
                >
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fade}
          custom={0}
          className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-12 sm:p-16 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to make a difference?
            </h2>
            <p className="mt-4 text-indigo-100 text-lg max-w-xl mx-auto">
              Join thousands of citizens using CivicPulse to improve their communities.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-4 rounded-2xl text-base hover:bg-indigo-50 shadow-lg transition-all duration-200 active:scale-[0.97] group"
            >
              Create free account
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs">
              CP
            </div>
            <span className="text-sm font-bold text-slate-900">CivicPulse</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} CivicPulse. Built for the people.
          </p>
        </div>
      </footer>
    </div>
  );
}
