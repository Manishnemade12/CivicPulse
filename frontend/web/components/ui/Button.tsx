import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Button({
  children,
  variant = "secondary",
  size = "md",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md border border-black/15 font-medium transition disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes = {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
  } as const;

  const variants = {
    primary: "bg-black text-white hover:bg-black/90",
    secondary: "bg-white text-black hover:bg-black/5",
    danger: "bg-white text-red-700 hover:bg-red-50",
    ghost: "border-transparent hover:bg-black/5",
  } as const;

  return (
    <button
      type={props.type ?? "button"}
      className={cx(base, sizes[size], variants[variant], className)}
      {...props}
    >
      {children}
    </button>
  );
}
