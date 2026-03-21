import { Badge } from "./Badge";
import {
    Clock,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

const statusConfig: Record<
    string,
    {
        variant: "warning" | "info" | "success" | "danger" | "default";
        icon: any;
        label: string;
        pulse: boolean;
    }
> = {
    RAISED: {
        variant: "warning",
        icon: Clock,
        label: "Raised",
        pulse: true,
    },
    IN_PROGRESS: {
        variant: "info",
        icon: RefreshCw,
        label: "In Progress",
        pulse: true,
    },
    RESOLVED: {
        variant: "success",
        icon: CheckCircle2,
        label: "Resolved",
        pulse: false,
    },
};

export function StatusBadge({
    status,
    size = "md",
    mode = "light",
}: {
    status: string;
    size?: "sm" | "md";
    mode?: "light" | "glass";
}) {
    const config = statusConfig[status] ?? {
        variant: "default" as const,
        icon: AlertCircle,
        label: status,
        pulse: false,
    };

    const Icon = config.icon;

    return (
        <Badge variant={config.variant} mode={mode} dot pulse={config.pulse}>
            <Icon size={size === "sm" ? 12 : 14} />
            <span>{config.label}</span>
        </Badge>
    );
}
