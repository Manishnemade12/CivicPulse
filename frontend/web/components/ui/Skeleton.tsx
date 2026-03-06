function cx(...parts: Array<string | false | null | undefined>) {
    return parts.filter(Boolean).join(" ");
}

export function Skeleton({
    className,
    rounded = "rounded-lg",
}: {
    className?: string;
    rounded?: string;
}) {
    return (
        <div
            className={cx("animate-shimmer", rounded, className)}
            aria-hidden="true"
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 space-y-4">
            <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10" rounded="rounded-full" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-40 w-full" rounded="rounded-xl" />
        </div>
    );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 bg-white p-5">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-5 w-2/5" />
                            <Skeleton className="h-3 w-3/5" />
                        </div>
                        <Skeleton className="h-8 w-20" rounded="rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}
