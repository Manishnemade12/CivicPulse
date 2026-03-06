"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
    Shield,
    FileText,
    BarChart3,
    ChevronRight,
    LogOut,
    ArrowLeft,
    Menu,
    X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

const adminNavItems = [
    { href: "/admin/complaints", label: "Complaints", icon: FileText },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [authOk, setAuthOk] = useState(false);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/me", { cache: "no-store" });
                if (!res.ok) return;
                const me = (await res.json()) as { role: string };
                if (!cancelled) setAuthOk(me.role === "ADMIN");
            } catch {
                // ignore
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm">
                        CP
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Loading admin…</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!authOk) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-900 p-6">
                <div className="text-center">
                    <div className="h-16 w-16 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <Shield className="h-8 w-8 text-red-400" />
                    </div>
                    <h1 className="text-xl font-bold text-white">Access Denied</h1>
                    <p className="mt-2 text-sm text-slate-400">Admin privileges required.</p>
                    <Link
                        href="/community"
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to app
                    </Link>
                </div>
            </div>
        );
    }

    const pageTitle = adminNavItems.find((item) => pathname.startsWith(item.href))?.label ?? "Dashboard";

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-xs">
                        CP
                    </div>
                    <span className="text-base font-bold">Admin</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 w-[260px] bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 flex flex-col",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* Logo */}
                    <div className="p-6 flex items-center gap-3 border-b border-slate-800/50">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-indigo-500/20">
                            CP
                        </div>
                        <div>
                            <div className="text-base font-extrabold tracking-tight">CivicPulse</div>
                            <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                                Admin Panel
                            </div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
                            Management
                        </div>
                        <div className="space-y-1">
                            {adminNavItems.map((item) => {
                                const isActive = pathname.startsWith(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group",
                                            isActive
                                                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
                                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "flex items-center justify-center h-8 w-8 rounded-lg transition-colors",
                                                isActive
                                                    ? "bg-indigo-500/20 text-indigo-400"
                                                    : "bg-slate-800 text-slate-500 group-hover:text-slate-300"
                                            )}
                                        >
                                            <Icon size={16} />
                                        </div>
                                        {item.label}
                                        {isActive && <ChevronRight size={14} className="ml-auto text-indigo-500" />}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-8">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-3">
                                Other
                            </div>
                            <Link
                                href="/community"
                                onClick={() => setMobileOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl transition-all"
                            >
                                <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-slate-800 text-slate-500">
                                    <ArrowLeft size={16} />
                                </div>
                                Back to App
                            </Link>
                        </div>
                    </nav>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                                A
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-semibold text-white truncate">Administrator</div>
                                <div className="text-xs text-slate-500">Admin role</div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Overlay */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                            onClick={() => setMobileOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Main */}
                <main className="flex-1 min-w-0">
                    {/* Desktop Header */}
                    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-slate-900/50 border-b border-slate-800/50 sticky top-0 z-20 backdrop-blur-sm">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500 font-medium">Admin</span>
                            <ChevronRight size={14} className="text-slate-600" />
                            <span className="font-semibold text-white">{pageTitle}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
                                <Shield size={12} className="inline mr-1" />
                                Admin
                            </span>
                        </div>
                    </header>

                    <div className="p-4 lg:p-8">
                        <div className="max-w-6xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
