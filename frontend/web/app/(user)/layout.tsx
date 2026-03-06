"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, type ReactNode } from "react";
import {
    Home,
    FileText,
    MessageSquare,
    Menu,
    X,
    LogOut,
    PlusCircle,
    Bell,
    ChevronRight,
    User,
    Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoutButton } from "@/components/LogoutButton";
import type { MeResponse } from "@/lib/types";

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

// Profile is now accessed via avatar dropdown — removed from sidebar
const navItems = [
    { href: "/community", label: "Community", icon: Home },
    { href: "/complaints/my", label: "My Complaints", icon: FileText },
    { href: "/complaints/new", label: "Raise Complaint", icon: MessageSquare },
];

/* ─── Avatar dropdown menu ─── */
function AvatarMenu({ me, authed }: { me: MeResponse | null; authed: boolean }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    if (!authed || !me) return null;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((p) => !p)}
                className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm ring-2 ring-transparent hover:ring-indigo-300 transition-all duration-200 focus:outline-none focus:ring-indigo-400"
                aria-label="User menu"
            >
                {me.name.charAt(0).toUpperCase()}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-11 w-60 rounded-2xl bg-white shadow-xl border border-slate-200/80 overflow-hidden z-50"
                    >
                        {/* User info */}
                        <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                    {me.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <div className="text-sm font-bold text-slate-900 truncate">{me.name}</div>
                                    <div className="text-xs text-slate-500 truncate">{me.email}</div>
                                </div>
                            </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-2">
                            <Link
                                href="/profile"
                                onClick={() => setOpen(false)}
                                className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                <div className="h-7 w-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                    <User size={14} className="text-indigo-600" />
                                </div>
                                View Profile
                            </Link>
                            <button
                                disabled
                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-400 rounded-xl cursor-not-allowed"
                            >
                                <div className="h-7 w-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                    <Settings size={14} className="text-slate-400" />
                                </div>
                                Settings
                                <span className="ml-auto text-[10px] bg-slate-100 text-slate-400 rounded-md px-1.5 py-0.5 font-bold">Soon</span>
                            </button>
                        </div>

                        {/* Logout */}
                        <div className="px-2 pb-2 border-t border-slate-100 pt-2">
                            <div className="flex items-center gap-2 px-1 text-red-500" onClick={() => setOpen(false)}>
                                <LogOut size={14} className="shrink-0" />
                                <LogoutButton />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function UserLayout({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const [authed, setAuthed] = useState(false);
    const [me, setMe] = useState<MeResponse | null>(null);
    const [authChecked, setAuthChecked] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch("/api/me", { cache: "no-store" });
                if (cancelled) return;
                if (!res.ok) { setAuthed(false); setMe(null); return; }
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
        return () => { cancelled = true; };
    }, []);

    if (!authChecked) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm">CP</div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    const pageTitle =
        navItems.find((item) => pathname === item.href || pathname.startsWith(item.href + "/"))?.label
        ?? (pathname.startsWith("/profile") ? "Profile" : "Dashboard");

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <Link href="/community" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xs">CP</div>
                    <span className="text-lg font-extrabold tracking-tight text-slate-900">CivicPulse</span>
                </Link>
                <div className="flex items-center gap-2">
                    {/* Avatar in mobile header too */}
                    <AvatarMenu me={me} authed={authed} />
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-slate-500 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100"
                    >
                        {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-40 w-[272px] bg-white border-r border-slate-200/80 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 flex flex-col shadow-lg lg:shadow-none",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}>
                    {/* Logo */}
                    <div className="p-6 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md">CP</div>
                        <div>
                            <div className="text-lg font-extrabold tracking-tight text-slate-900">CivicPulse</div>
                            <div className="text-[10px] font-semibold text-indigo-500 uppercase tracking-wider">Community Platform</div>
                        </div>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 pb-4 overflow-y-auto">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Navigation</div>
                        <div className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 group",
                                            isActive ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <div className={cn(
                                            "flex items-center justify-center h-8 w-8 rounded-lg transition-colors",
                                            isActive ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700"
                                        )}>
                                            <Icon size={16} />
                                        </div>
                                        {item.label}
                                        {isActive && <ChevronRight size={14} className="ml-auto text-indigo-400" />}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Quick Action */}
                        <div className="mt-8">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-3">Quick Actions</div>
                            <Link
                                href="/complaints/new"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 px-3 py-3 text-sm font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200 active:scale-[0.97]"
                            >
                                <PlusCircle size={18} />
                                New Complaint
                            </Link>
                        </div>
                    </nav>

                    {/* Sidebar User Section — shows name/email, logout only (no Profile link) */}
                    <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                        {authed && me ? (
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                                    {me.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-semibold text-slate-900 truncate">{me.name}</div>
                                    <div className="text-xs text-slate-500 truncate">{me.email}</div>
                                </div>
                            </div>
                        ) : (
                            <Link href="/login" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                                Sign in →
                            </Link>
                        )}
                        {authed && (
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <LogOut size={14} className="shrink-0" />
                                <LogoutButton />
                            </div>
                        )}
                    </div>
                </aside>

                {/* Mobile overlay */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/30 z-30 lg:hidden backdrop-blur-sm"
                            onClick={() => setIsMobileMenuOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <main className="flex-1 min-w-0">
                    {/* Desktop Header — avatar opens dropdown */}
                    <header className="hidden lg:flex items-center justify-between px-8 py-4 bg-white border-b border-slate-200/80 sticky top-0 z-20">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400 font-medium">Dashboard</span>
                            <ChevronRight size={14} className="text-slate-300" />
                            <span className="font-semibold text-slate-700">{pageTitle}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-lg hover:bg-slate-50">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
                            </button>
                            {/* Avatar — click to open profile dropdown */}
                            <AvatarMenu me={me} authed={authed} />
                        </div>
                    </header>

                    <div className="p-4 lg:p-8">
                        <div className="max-w-5xl mx-auto">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
