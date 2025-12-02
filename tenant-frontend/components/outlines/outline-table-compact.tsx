"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Eye,
  Edit,
  Trash,
  Loader2,
  FileText,
 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
 import Link from "next/link";
import { Outline } from "@/types/types";
import { DataTable } from "@/components/ui/data-table";

interface OutlineTableSimpleProps {
  data: Outline[];
  onDelete: (outlineId: string) => Promise<void>;
  onStatusChange: (
    outlineId: string,
    newStatus: Outline["status"]
  ) => Promise<void>;
  isLoading: boolean;
  currentUserRole: string;
  currentUserId?: string;
}

export function OutlineTableSimple({
  data,
  onDelete,
  onStatusChange,
  isLoading,
  currentUserRole,
  currentUserId,
}: OutlineTableSimpleProps) {
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

  // Define columns
  const columns: ColumnDef<Outline>[] = [
    {
      accessorKey: "header",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.header}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatSectionType(row.original.sectionType)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const outline = row.original;
        const statusConfig = {
          PENDING: {
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-100 dark:bg-yellow-900/30",
            label: "Pending",
          },
          IN_PROGRESS: {
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30",
            label: "In Progress",
          },
          COMPLETED: {
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30",
            label: "Completed",
          },
        };

        const config = statusConfig[outline.status];
        
        return (
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}
          >
            {updatingId === outline.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            <span className={`text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "target",
      header: "Target",
      cell: ({ row }) => (
        <div className="text-right font-mono">
          {row.original.target.toLocaleString()} words
        </div>
      ),
    },
    {
      accessorKey: "reviewer",
      header: "Reviewer",
      cell: ({ row }) => {
        const reviewer = row.original.reviewer;
        return reviewer ? (
          <div className="flex items-center gap-2">
            <span className="text-sm">{reviewer.name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground italic">Unassigned</span>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const outline = row.original;
        const canEdit = canEditOutline(outline);
        const canDelete = canDeleteOutline(outline);

        return (
          <div className="flex items-center gap-2">
            <Link href={`/outlines/${outline.id}`}>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </Link>

            {canEdit && (
              <Link href={`/outlines/${outline.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            )}

            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(outline.id, outline.header)}
                disabled={deletingId === outline.id}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                {deletingId === outline.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  // Empty state configuration
  const emptyState = {
    icon: <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
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