"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
    LayoutDashboard,
    Files,
    ExternalLink,
    Menu,
    X,
    LogOut,
    ShieldCheck,
    Users
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

type MeResponse = { id: string; name: string; email: string; role: string };

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export default function AdminLayout({ children }: { children: ReactNode }) {
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
                if (!res.ok) {
                    setAuthed(false);
                    setMe(null);
                    return;
                }
                const json = (await res.json()) as MeResponse;
                if (json.role !== "ADMIN" && json.role !== "admin") {
                    // Basic role check - ideally middleware handles this too
                    // But for UI feedback let's keep it
                }
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

        return () => {
            cancelled = true;
        };
    }, []);

    const navItems = [
        { href: "/admin/complaints", label: "Complaints", icon: Files },
        // Add more admin routes here as needed
    ];

    if (!authChecked) {
        return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">Loading Admin Portal...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-zinc-900 text-white sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-400" />
                    <span className="font-bold">CivicPulse Admin</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-300">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-zinc-900 text-gray-300 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 flex flex-col",
                    isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                )}>
                    <div className="p-6 border-b border-zinc-800 flex items-center gap-2">
                        <ShieldCheck className="text-emerald-500 h-8 w-8" />
                        <div>
                            <div className="text-white font-bold tracking-tight">CivicPulse</div>
                            <div className="text-xs text-emerald-500 font-medium uppercase tracking-widest">Admin Portal</div>
                        </div>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">Management</div>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                                        isActive
                                            ? "bg-zinc-800 text-white shadow-sm border-l-4 border-emerald-500"
                                            : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                                    )}
                                >
                                    <Icon size={18} className={isActive ? "text-emerald-400" : "text-zinc-500 group-hover:text-zinc-300"} />
                                    {item.label}
                                </Link>
                            );
                        })}

                        <div className="mt-8 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4 px-2">System</div>
                        <Link
                            href="/community"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-all duration-200"
                        >
                            <ExternalLink size={18} />
                            Back to User App
                        </Link>
                    </nav>

                    <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
                        {authed && me ? (
                            <div className="mb-4 px-2">
                                <div className="text-sm font-medium text-white">{me.name}</div>
                                <div className="text-xs text-zinc-500 truncate">{me.email}</div>
                            </div>
                        ) : null}

                        <div className="pt-2">
                            <LogoutButton />
                        </div>
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-gray-100">
                    <header className="bg-white border-b border-gray-200 h-16 flex items-center px-8 shadow-sm justify-between lg:flex hidden">
                        <h1 className="text-lg font-semibold text-gray-800">Dashboard</h1>
                        <div className="text-sm text-gray-500">Welcome back, Admin</div>
                    </header>
                    <div className="p-4 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
