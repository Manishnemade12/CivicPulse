import type { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

export function StatsCard({
    icon,
    label,
    value,
    trend,
    variant = "default",
    accentColor = "indigo",
    className,
}: {
    icon: ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    variant?: "default" | "glass";
    accentColor?: "indigo" | "amber" | "sky" | "emerald";
    className?: string;
}) {
    const isGlass = variant === "glass";

    const accentClasses = {
        indigo:  "bg-indigo-50/10 text-indigo-400 group-hover:bg-indigo-500/20 group-hover:shadow-[0_0_15px_rgba(99,102,241,0.3)]",
        amber:   "bg-amber-50/10 text-amber-400 group-hover:bg-amber-500/20 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]",
        sky:     "bg-sky-50/10 text-sky-400 group-hover:bg-sky-500/20 group-hover:shadow-[0_0_15px_rgba(14,165,233,0.3)]",
        emerald: "bg-emerald-50/10 text-emerald-400 group-hover:bg-emerald-500/20 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]",
    };

    return (
        <div
            className={cx(
                "flex items-center gap-4 rounded-2xl transition-all duration-300 group",
                isGlass
                    ? "glass-dark border-slate-800 p-5 shadow-2xl hover:border-slate-700 hover:-translate-y-1"
                    : "border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5",
                className
            )}
        >
            <div className={cx(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-all duration-300",
                isGlass ? accentClasses[accentColor] : "bg-indigo-50 text-indigo-600"
            )}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className={cx(
                    "text-2xl font-black tracking-tight leading-none",
                    isGlass ? "text-white" : "text-slate-900"
                )}>
                    {value}
                </div>
                <div className={cx(
                    "text-[10px] font-bold uppercase tracking-widest mt-1",
                    isGlass ? "text-slate-500" : "text-slate-500"
                )}>{label}</div>
            </div>
            {trend ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            ) : null}
        </div>
    );
}
