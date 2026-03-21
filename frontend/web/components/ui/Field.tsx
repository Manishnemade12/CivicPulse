import React from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const inputBase =
  "w-full rounded-xl border px-4 text-sm outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

const lightClasses = "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100";
const darkClasses = "bg-slate-900/40 backdrop-blur-md border-slate-800/80 text-white placeholder:text-slate-600 focus:border-indigo-500 shadow-2xl";

export function Input({
  className,
  variant = "light",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { variant?: "light" | "dark" }) {
  return (
    <input 
      className={cx(
        inputBase, 
        variant === "dark" ? darkClasses : lightClasses,
        "h-11", 
        className
      )} 
      {...props} 
    />
  );
}

export function Textarea({
  className,
  variant = "light",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { variant?: "light" | "dark" }) {
  return (
    <textarea
      className={cx(
        inputBase, 
        variant === "dark" ? darkClasses : lightClasses,
        "py-3 resize-none", 
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  variant = "light",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { 
  children: ReactNode;
  variant?: "light" | "dark";
}) {
  const isDark = variant === "dark";

  return (
    <select
      className={cx(
        inputBase,
        isDark ? darkClasses : lightClasses,
        "h-11 appearance-none bg-no-repeat pr-10",
        isDark 
          ? "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23475569%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[right_12px_center]"
          : "bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[right_12px_center]",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function FieldLabel({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        {hint ? (
          <span className="text-xs text-slate-400">{hint}</span>
        ) : null}
      </div>
      {children}
      {error ? (
        <span className="text-xs font-medium text-red-500">{error}</span>
      ) : null}
    </label>
  );
}
