import type { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

export function StatsCard({
    icon,
    label,
    value,
    trend,
    className,
}: {
    icon: ReactNode;
    label: string;
    value: string | number;
    trend?: string;
    className?: string;
}) {
    return (
        <div
            className={cx(
                "flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                className
            )}
        >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-2xl font-extrabold tracking-tight text-slate-900">
                    {value}
                </div>
                <div className="text-sm text-slate-500 font-medium">{label}</div>
            </div>
            {trend ? (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {trend}
                </span>
            ) : null}
        </div>
    );
}
