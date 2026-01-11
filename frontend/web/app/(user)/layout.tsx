"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
    Home,
    FileText,
    User,
    MessageSquare,
    Menu,
    X,
    LogOut,
    PlusCircle
} from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

type MeResponse = { id: string; name: string; email: string; role: string };

function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
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
                if (!res.ok) {
                    setAuthed(false);
                    setMe(null);
                    return;
                }
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

        return () => {
            cancelled = true;
        };
    }, []);

    const navItems = [
        { href: "/community", label: "Community", icon: Home },
        { href: "/complaints/my", label: "My Complaints", icon: FileText },
        { href: "/complaints/new", label: "Raise Complaint", icon: MessageSquare },
        { href: "/profile", label: "Profile", icon: User },
    ];

    if (!authChecked) {
        return <div className="flex min-h-screen items-center justify-center bg-gray-50 text-gray-500">Loading...</div>;
    }

    // Simple check - if we have logic for public pages inside (user), we might need to skip this. 
    // But usually /profile, /community, /complaints are protected. 
    // If user is not authed, they might see limited view or redirect. 
    // AppShell had public checks. We'll handle unauthed state gracefully or redirect in page.

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Mobile Header */}
            <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-50">
                <Link href="/community" className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    CivicPulse
                </Link>
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600">
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className="flex">
                {/* Sidebar */}
                <aside className={cn(
                    "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0 flex flex-col",
                    isMobileMenuOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"
                )}>
                    <div className="p-6 border-b border-gray-100 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg">CP</div>
                        <span className="text-xl font-bold tracking-tight text-gray-900">CivicPulse</span>
                    </div>

                    <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Menu</div>
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200",
                                        isActive
                                            ? "bg-indigo-50 text-indigo-700 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon size={18} className={isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        {authed && me ? (
                            <div className="mb-4 px-2">
                                <div className="text-sm font-medium text-gray-900">{me.name}</div>
                                <div className="text-xs text-gray-500 truncate">{me.email}</div>
                            </div>
                        ) : (
                            <div className="mb-4 px-2">
                                <Link href="/login" className="text-sm text-indigo-600 hover:underline">Log in</Link>
                            </div>
                        )}

                        {authed && (
                            <div className="pt-2">
                                <LogoutButton />
                            </div>
                        )}
                    </div>
                </aside>

                {/* Overlay for mobile */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-4 lg:p-8">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
