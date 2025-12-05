
import { AlertCircle, Clock, CheckCircle, Loader2 } from "lucide-react";

export type StatusType = "PENDING" | "IN_PROGRESS" | "COMPLETED" | string;

interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  label: string;
}

interface StatusBadgeProps {
  status: StatusType;
  updating?: boolean;
  config: Record<string, StatusConfig>;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  updating = false,
  config,
  showIcon = true,
  size = "md"
}: StatusBadgeProps) {
  const statusConfig = config[status];
  if (!statusConfig) return null;

  const Icon = statusConfig.icon;
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base"
  };

  return (
    <div
      className={`flex items-center gap-2 rounded-full ${sizeClasses[size]} ${statusConfig.bg}`}
    >
      {showIcon && (
        updating ? (
          <Loader2 className={`h-4 w-4 animate-spin ${statusConfig.color}`} />
        ) : (
          <Icon className={`h-4 w-4 ${statusConfig.color}`} />
        )
      )}
      <span className={`font-medium ${statusConfig.color}`}>
        {statusConfig.label}
      </span>
    </div>
  );
}

// Default status configuration
export const DEFAULT_STATUS_CONFIG: Record<string, StatusConfig> = {
  PENDING: {
    icon: AlertCircle,
    color: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    label: "Pending",
  },
  IN_PROGRESS: {
    icon: Clock,
    color: "text-gray-600 dark:text-gray-400",
    bg: "bg-gray-100 dark:bg-gray-900/30",
    label: "In Progress",
  },
  COMPLETED: {
    icon: CheckCircle,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    label: "Completed",
  },
};