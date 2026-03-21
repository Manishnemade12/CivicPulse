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
    LayoutDashboard,
    Settings,
    Users
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

const adminNavItems = [
    { href: "/admin/complaints", label: "Manage Reports", icon: FileText },
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
            <div className="flex min-h-screen items-center justify-center bg-slate-950">
                <div className="relative flex flex-col items-center gap-6">
                    <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full" />
                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-2xl shadow-2xl shadow-indigo-500/40 relative z-10">
                        CP
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 relative z-10 font-bold uppercase tracking-widest text-[10px]">
                        <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Initializing Admin Terminal…
                    </div>
                </div>
            </div>
        );
    }

    if (!authOk) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
                <div className="max-w-md w-full glass-dark border-red-500/20 p-10 text-center rounded-[2.5rem] shadow-2xl">
                    <div className="h-20 w-20 rounded-3xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <Shield className="h-10 w-10 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)]" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Restricted Access</h1>
                    <p className="mt-3 text-slate-400 font-medium">Your account lacks the administrative clearances required for this sector.</p>
                    <Link
                        href="/community"
                        className="mt-8 inline-flex h-12 items-center gap-2 px-6 rounded-2xl bg-slate-800 text-sm font-bold text-white hover:bg-slate-700 transition-all active:scale-95"
                    >
                        <ArrowLeft size={16} />
                        Exit to Public Feed
                    </Link>
                </div>
            </div>
        );
    }

    const activeItem = adminNavItems.find((item) => pathname.startsWith(item.href));
    const pageTitle = activeItem?.label ?? "Overview";

    return (
        <div className="min-h-screen bg-[#020617] text-white font-sans selection:bg-indigo-500/30">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-indigo-500/20">
                        CP
                    </div>
                    <span className="text-lg font-black tracking-tight">Admin</span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2.5 text-slate-400 hover:text-white transition-all rounded-xl hover:bg-white/5 active:scale-90"
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className="flex relative">
                {/* Sidebar */}
                <aside
                    className={cn(
                        "fixed inset-y-0 left-0 z-40 w-[280px] bg-slate-900/40 backdrop-blur-2xl border-r border-slate-800/50 transform transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 flex flex-col",
                        mobileOpen ? "translate-x-0" : "-translate-x-full"
                    )}
                >
                    {/* Logo Section */}
                    <div className="p-8 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-[0_10px_20px_rgba(99,102,241,0.3)] border border-white/10">
                            CP
                        </div>
                        <div className="min-w-0">
                            <div className="text-xl font-black tracking-tighter text-white">CivicPulse</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Live Admin</div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar space-y-8">
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4 px-4">Core Management</div>
                            <div className="space-y-1.5">
                                {adminNavItems.map((item) => {
                                    const isActive = pathname.startsWith(item.href);
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                "flex items-center gap-4 px-4 py-3 text-sm font-bold rounded-2xl transition-all duration-300 group relative",
                                                isActive
                                                    ? "text-white bg-indigo-500/10 border border-indigo-500/20 shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
                                                    : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center justify-center h-9 w-9 rounded-xl transition-all duration-300 shadow-sm",
                                                    isActive
                                                        ? "bg-indigo-500 text-white shadow-indigo-500/30"
                                                        : "bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300"
                                                )}
                                            >
                                                <Icon size={18} />
                                            </div>
                                            {item.label}
                                            {isActive && (
                                                <motion.div 
                                                  layoutId="active-nav"
                                                  className="absolute left-[-1rem] w-1.5 h-6 bg-indigo-500 rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                                
                                <button
                                    disabled
                                    className="w-full flex items-center gap-4 px-4 py-3 text-sm font-bold text-slate-700/50 cursor-not-allowed group"
                                >
                                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900/50 text-slate-800">
                                        <Users size={18} />
                                    </div>
                                    User Directory
                                    <span className="ml-auto text-[8px] font-black bg-slate-800/50 text-slate-600 px-1.5 py-0.5 rounded uppercase tracking-tighter">Locked</span>
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] mb-4 px-4">System</div>
                            <div className="space-y-1.5">
                                <Link
                                    href="/community"
                                    onClick={() => setMobileOpen(false)}
                                    className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all group"
                                >
                                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                                        <ArrowLeft size={18} />
                                    </div>
                                    Exit to Public Site
                                </Link>
                                <Link
                                    href="#"
                                    className="flex items-center gap-4 px-4 py-3 text-sm font-bold text-slate-700/50 cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900/50 text-slate-800">
                                        <Settings size={18} />
                                    </div>
                                    Configurations
                                </Link>
                            </div>
                        </div>
                    </nav>

                    {/* Footer / User Profile */}
                    <div className="p-6 border-t border-slate-800/50 bg-slate-950/30">
                        <div className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-xl group-hover:scale-105 transition-transform duration-300">
                                A
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-black text-white truncate">Administrator</div>
                                <div className="text-[10px] font-black text-indigo-400/70 uppercase tracking-widest mt-0.5">Terminal Master</div>
                            </div>
                            <LogOut size={16} className="text-slate-600 group-hover:text-red-400 transition-colors" />
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
                            className="fixed inset-0 bg-slate-950/80 z-30 lg:hidden backdrop-blur-md"
                            onClick={() => setMobileOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Main Content Area */}
                <main className="flex-1 min-w-0 max-h-screen overflow-y-auto custom-scrollbar relative">
                    {/* Desktop Toolbar */}
                    <header className="hidden lg:flex items-center justify-between px-10 py-5 bg-slate-950/20 backdrop-blur-xl border-b border-indigo-500/5 sticky top-0 z-20">
                        <div className="flex items-center gap-3 py-1">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-400 text-xs font-black uppercase tracking-widest">
                                <LayoutDashboard size={14} />
                                System
                            </div>
                            <ChevronRight size={16} className="text-slate-700" />
                            <span className="font-extrabold text-white tracking-tight">{pageTitle}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 text-slate-500">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Server: AWS-US-EAST-1</span>
                            </div>
                            <div className="h-6 w-px bg-slate-800" />
                            <button className="h-10 px-4 rounded-xl bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all active:scale-95">
                                Deployment Logs
                            </button>
                        </div>
                    </header>

                    <div className="p-6 lg:p-10">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
