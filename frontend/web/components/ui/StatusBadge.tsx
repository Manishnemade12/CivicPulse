import { Badge } from "./Badge";
import {
    ClockIcon,
    ArrowPathIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/20/solid";

const statusConfig: Record<
    string,
    {
        variant: "warning" | "info" | "success" | "danger" | "default";
        icon: React.FC<{ className?: string }>;
        label: string;
        pulse: boolean;
    }
> = {
    RAISED: {
        variant: "warning",
        icon: ClockIcon,
        label: "Raised",
        pulse: true,
    },
    IN_PROGRESS: {
        variant: "info",
        icon: ArrowPathIcon,
        label: "In Progress",
        pulse: true,
    },
    RESOLVED: {
        variant: "success",
        icon: CheckCircleIcon,
        label: "Resolved",
        pulse: false,
    },
};

export function StatusBadge({
    status,
    size = "md",
}: {
    status: string;
    size?: "sm" | "md";
}) {
    const config = statusConfig[status] ?? {
        variant: "default" as const,
        icon: ExclamationCircleIcon,
        label: status,
        pulse: false,
    };

    const Icon = config.icon;

    return (
        <Badge variant={config.variant} dot pulse={config.pulse}>
            <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
            <span>{config.label}</span>
        </Badge>
    );
}
