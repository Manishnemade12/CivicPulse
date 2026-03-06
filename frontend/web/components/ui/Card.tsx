import type { ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({
  children,
  className,
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200",
        hover && "hover:shadow-md hover:border-slate-300/80 hover:-translate-y-0.5",
        className
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
  accent = false,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className={cx("text-lg font-bold leading-6", accent ? "gradient-text" : "text-slate-900")}>
          {title}
        </div>
        {subtitle ? (
          <div className="mt-1 text-sm text-slate-500">{subtitle}</div>
        ) : null}
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
