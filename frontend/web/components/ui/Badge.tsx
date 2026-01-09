import type { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning";
  className?: string;
}) {
  const base = "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium";
  const tones = {
    neutral: "border-black/15 bg-black/5 text-black",
    success: "border-black/15 bg-black/5 text-black",
    warning: "border-black/15 bg-black/5 text-black",
  } as const;

  return <span className={cx(base, tones[tone], className)}>{children}</span>;
}
