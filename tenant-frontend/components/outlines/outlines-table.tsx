"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Edit, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Outline } from "@/types/types";

// Import generic components
import { DataTable } from "@/components/ui/data-table";
import {
  createTextColumn,
  createStatusColumn,
  createBadgeColumn,
  createNumberColumn,
  createDateColumn,
  createUserColumn,
} from "@/components/ui/table-columns";
import { DEFAULT_STATUS_CONFIG } from "@/components/ui/status-badge";

interface OutlineTableProps {
  data: Outline[];
  onUpdate?: (outlineId: string, data: any) => Promise<any>;
  onDelete: (outlineId: string) => Promise<void>;
  onStatusChange: (
    outlineId: string,
    newStatus: Outline["status"]
  ) => Promise<void>;
  isLoading: boolean;
  currentUserRole: string;
  organizationId: string;
  currentUserId?: string;
}

export function OutlineTable({
  data,
  onDelete,
  onStatusChange,
  isLoading,
  currentUserRole,
  currentUserId,
}: OutlineTableProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // Format section type for display
  const formatSectionType = (type: string) => {
    return type
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Handle status change
  const handleStatusChange = async (
    outlineId: string,
    newStatus: Outline["status"]
  ) => {
    try {
      setUpdatingId(outlineId);
      await onStatusChange(outlineId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch  {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  // Handle delete with confirmation
  const handleDelete = async (outlineId: string, header: string) => {
    if (window.confirm(`Are you sure you want to delete "${header}"?`)) {
      try {
        setDeletingId(outlineId);
        await onDelete(outlineId);
        toast.success("Outline deleted successfully");
      } catch  {
        toast.error("Failed to delete outline");
      } finally {
        setDeletingId(null);
      }
    }
  };

  // Check if user can edit
  const canEditOutline = (outline: Outline) => {
    return (
      currentUserRole === "OWNER" ||
      currentUserRole === "REVIEWER" ||
      outline.createdBy?.user?.id === currentUserId
    );
  };

  // Check if user can delete
  const canDeleteOutline = (outline: Outline) => {
    return (
      currentUserRole === "OWNER" ||
      outline.createdBy?.user?.id === currentUserId
    );
  };

  // Check if user can change status
  const canChangeStatus = (outline: Outline) => {
    return (
      (currentUserRole === "REVIEWER" || currentUserRole === "OWNER") &&
      updatingId !== outline.id
    );
  };

  // Define columns using reusable column creators
  const columns: ColumnDef<Outline>[] = [
    createTextColumn<Outline>("header", "Title", {
      render: (value, row) => (
        <div>
          <div className="font-medium">{row.header}</div>
          <div className="text-xs text-muted-foreground mt-1">
            ID: {row.id.substring(0, 8)}...
          </div>
        </div>
      ),
    }),
    
    createBadgeColumn<Outline>("sectionType", "Type", {
      format: formatSectionType,
    }),
    
    createStatusColumn<Outline>("status", "Status", DEFAULT_STATUS_CONFIG, {
      showActions: true,
      onStatusChange: (id: string, status: string) => {
        // Type guard to ensure status is valid
        if (["PENDING", "IN_PROGRESS", "COMPLETED"].includes(status)) {
          handleStatusChange(id, status as Outline["status"]);
        }
      },
      updatingId,
      canChangeStatus: (row) => canChangeStatus(row),
    }),
    
    createNumberColumn<Outline>("target", "Target", {
      suffix: "words",
      align: "right",
    }),
    
    createNumberColumn<Outline>("limit", "Limit", {
      suffix: "words",
      align: "right",
    }),
    
    createUserColumn<Outline>("reviewer", "Reviewer", {
      nameKey: "name",
      fallbackText: "Unassigned",
    }),
    
    createDateColumn<Outline>("createdAt", "Created", {
      format: "MMM d, yyyy",
    }),
    
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const outline = row.original;
        const canEdit = canEditOutline(outline);
        const canDelete = canDeleteOutline(outline);

        // Define action items with proper types
        type ActionItem = 
          | { label: string; icon: React.ReactNode; href: string }
          | { label: string; icon: React.ReactNode; onClick: () => void; destructive: boolean; disabled: boolean };

        const actionItems: (ActionItem | false)[] = [
          {
            label: "View",
            icon: <Eye className="h-4 w-4" />,
            href: `/outlines/${outline.id}`,
          },
          canEdit ? {
            label: "Edit",
            icon: <Edit className="h-4 w-4" />,
            href: `/outlines/${outline.id}/edit`,
          } : false,
          canDelete ? {
            label: "Delete",
            icon: deletingId === outline.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash className="h-4 w-4" />
            ),
            onClick: () => handleDelete(outline.id, outline.header),
            destructive: true,
            disabled: deletingId === outline.id,
          } : false,
        ];

        const filteredItems = actionItems.filter((item): item is ActionItem => item !== false);

        return (
          <div className="flex items-center gap-2">
            {filteredItems.map((item, index) => {
              if ("href" in item) {
                return (
                  <Link key={index} href={item.href}>
                    <Button variant="ghost" size="sm">
                      {item.icon}
                    </Button>
                  </Link>
                );
              } else {
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={item.onClick}
                    disabled={item.disabled}
                    className={item.destructive ? "text-red-600 hover:text-red-700 hover:bg-red-50" : ""}
                  >
                    {item.icon}
                  </Button>
                );
              }
            })}
          </div>
        );
      },
    },
  ];

  // Empty state configuration
  const emptyState = {
    icon: <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
    title: "No Outlines Found",
    description: "Create your first outline to get started",
    action: {
      label: "Create Outline",
      href: "/outlines/create",
    },
  };

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      emptyState={emptyState}
    />
  );
}