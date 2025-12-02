import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { User } from "lucide-react";
import { format } from "date-fns";
import { StatusBadge, DEFAULT_STATUS_CONFIG } from "./status-badge";
import { ActionDropdown } from "./action-dropdown";

// Text Column
export function createTextColumn<T>(
  accessorKey: keyof T,
  header: string,
  options?: {
    render?: (value: any, row: T) => React.ReactNode;
    className?: string;
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const value = row.original[accessorKey];
      if (options?.render) {
        return options.render(value, row.original);
      }
      return <div className={options?.className}>{String(value)}</div>;
    },
  };
}

// Status Column
export function createStatusColumn<T>(
  accessorKey: keyof T,
  header: string = "Status",
  config = DEFAULT_STATUS_CONFIG,
  options?: {
    showActions?: boolean;
    onStatusChange?: (id: string, status: string) => Promise<void> | void;
    updatingId?: string | null;
    canChangeStatus?: (row: T) => boolean;
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const status = row.original[accessorKey] as string;
      const rowData = row.original as Record<string, unknown>;
      
      return (
        <div className="flex items-center gap-2">
          <StatusBadge
            status={status}
            updating={options?.updatingId === rowData.id}
            config={config}
            size="md"
          />
          
          {options?.showActions && options?.onStatusChange && options?.canChangeStatus?.(row.original) && (
            <ActionDropdown
              items={Object.keys(config)
                .filter(key => key !== status)
                .map(key => ({
                  label: `Mark as ${config[key].label}`,
                  onClick: () => options.onStatusChange?.(String(rowData.id), key),
                  disabled: options.updatingId === rowData.id,
                }))}
              size="sm"
            />
          )}
        </div>
      );
    },
  };
}

// Badge Column
export function createBadgeColumn<T>(
  accessorKey: keyof T,
  header: string,
  options?: {
    format?: (value: string) => string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const value = row.original[accessorKey];
      const formattedValue = options?.format 
        ? options.format(String(value))
        : String(value).toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      
      return (
        <Badge variant={options?.variant || "outline"} className="capitalize">
          {formattedValue}
        </Badge>
      );
    },
  };
}

// Number Column with formatting
export function createNumberColumn<T>(
  accessorKey: keyof T,
  header: string,
  options?: {
    format?: (value: number) => string;
    suffix?: string;
    align?: "left" | "center" | "right";
    className?: string;
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const value = row.original[accessorKey] as number;
      const formattedValue = options?.format 
        ? options.format(value)
        : value.toLocaleString();
      
      const alignClass = options?.align === "right" ? "text-right" :
                        options?.align === "center" ? "text-center" : "text-left";
      
      return (
        <div className={`font-mono ${alignClass} ${options?.className || ""}`}>
          {formattedValue}{options?.suffix ? ` ${options.suffix}` : ""}
        </div>
      );
    },
  };
}

// Date Column
export function createDateColumn<T>(
  accessorKey: keyof T,
  header: string = "Date",
  options?: {
    format?: string;
    className?: string;
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const value = row.original[accessorKey];
      if (!value) return <span className="text-muted-foreground">-</span>;
      
      const date = new Date(value as string | number | Date);
      const formattedDate = format(date, options?.format || "MMM d, yyyy");
      
      return (
        <div className={`text-sm text-muted-foreground ${options?.className || ""}`}>
          {formattedDate}
        </div>
      );
    },
  };
}

// User Column
export function createUserColumn<T>(
  accessorKey: keyof T,
  header: string = "User",
  options?: {
    nameKey?: string;
    emailKey?: string;
    fallbackText?: string;
  }
): ColumnDef<T> {
  return {
    accessorKey: accessorKey as string,
    header,
    cell: ({ row }) => {
      const user = row.original[accessorKey] as Record<string, unknown>;
      
      if (!user) {
        return (
          <span className="text-muted-foreground italic">
            {options?.fallbackText || "Unassigned"}
          </span>
        );
      }
      
      const name = user[options?.nameKey || "name"] as string || user.name as string;
      const email = user[options?.emailKey || "email"] as string || user.email as string;
      
      return (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{name}</span>
            {email && (
              <span className="text-xs text-muted-foreground">{email}</span>
            )}
          </div>
        </div>
      );
    },
  };
}