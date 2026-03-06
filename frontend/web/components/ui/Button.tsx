import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost" | "gradient";
type Size = "sm" | "md" | "lg" | "icon";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  loading = false,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] cursor-pointer select-none";

  const sizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-5 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10 p-0",
  } as const;

  const variants = {
    primary:
      "bg-indigo-600 text-white border border-indigo-600 hover:bg-indigo-700 hover:border-indigo-700 shadow-sm hover:shadow-md",
    secondary:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    danger:
      "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300",
    ghost:
      "bg-transparent text-slate-600 border border-transparent hover:bg-slate-100 hover:text-slate-900",
    gradient:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg",
  } as const;

  return (
    <button
      type={props.type ?? "button"}
      className={cx(base, sizes[size], variants[variant], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  );
}
