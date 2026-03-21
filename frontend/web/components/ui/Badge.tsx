import type { ReactNode } from "react";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger" | "info";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-slate-100 text-slate-700 border-slate-200",
  primary: "bg-indigo-50 text-indigo-700 border-indigo-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-sky-50 text-sky-700 border-sky-200",
};

export function Badge({
  children,
  variant = "default",
  mode = "light",
  dot = false,
  pulse = false,
  className,
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  mode?: "light" | "glass";
  dot?: boolean;
  pulse?: boolean;
  className?: string;
}) {
  const isGlass = mode === "glass";

  const glassVariants: Record<BadgeVariant, string> = {
    default: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    primary: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]",
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]",
    danger:  "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]",
    info:    "bg-sky-500/10 text-sky-400 border-sky-500/20 shadow-[0_0_10px_rgba(14,165,233,0.1)]",
  };

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
        isGlass ? glassVariants[variant] : variants[variant],
        className
      )}
    >
      {dot ? (
        <span className="relative flex h-2 w-2">
          {pulse ? (
            <span
              className={cx(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                variant === "success" && "bg-emerald-400",
                variant === "warning" && "bg-amber-400",
                variant === "danger" && "bg-red-400",
                variant === "info" && "bg-sky-400",
                variant === "primary" && "bg-indigo-400",
                variant === "default" && "bg-slate-400"
              )}
            />
          ) : null}
          <span
            className={cx(
              "relative inline-flex h-2 w-2 rounded-full",
              variant === "success" && "bg-emerald-500",
              variant === "warning" && "bg-amber-500",
              variant === "danger" && "bg-red-500",
              variant === "info" && "bg-sky-500",
              variant === "primary" && "bg-indigo-500",
              variant === "default" && "bg-slate-500"
            )}
          />
        </span>
      ) : null}
      {children}
    </span>
  );
}
