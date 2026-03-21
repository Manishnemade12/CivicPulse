import type { ReactNode } from "react";
import { Button } from "./Button";

function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    onAction,
    className,
}: {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: string;
    onAction?: () => void;
    className?: string;
}) {
    return (
        <div className={cx("flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in", className)}>
            {icon ? (
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
                    {icon}
                </div>
            ) : null}
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {description ? (
                <p className="mt-2 max-w-sm text-sm text-slate-500 leading-relaxed">
                    {description}
                </p>
            ) : null}
            {action && onAction ? (
                <div className="mt-5">
                    <Button variant="primary" onClick={onAction}>
                        {action}
                    </Button>
                </div>
            ) : null}
        </div>
    );
}
