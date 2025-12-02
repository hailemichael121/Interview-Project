"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { 
  Eye, 
  Edit, 
  Trash, 
  MoreVertical, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  FileText,
  ChevronRight,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Outline } from "@/lib/api-service";
import Link from "next/link";

interface OutlineTableProps {
  data: Outline[];
  onUpdate: (outlineId: string, data: any) => Promise<any>;
  onDelete: (outlineId: string) => Promise<void>;
  onStatusChange: (outlineId: string, newStatus: Outline["status"]) => Promise<void>;
  isLoading: boolean;
  currentUserRole: string;
  organizationId: string;
}

export function OutlineTable({
  data,
  onUpdate,
  onDelete,
  onStatusChange,
  isLoading,
  currentUserRole,
  organizationId,
}: OutlineTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState<Record<string, any>>({});
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  // Format section type for display
  const formatSectionType = (type: string) => {
    return type
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Handle status change
  const handleStatusChange = async (outlineId: string, newStatus: Outline["status"]) => {
    try {
      setUpdatingId(outlineId);
      await onStatusChange(outlineId, newStatus);
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
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
      } catch (error) {
        toast.error("Failed to delete outline");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const columns: ColumnDef<Outline>[] = [
    {
      accessorKey: "header",
      header: "Title",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.header}</div>
          <div className="text-xs text-muted-foreground mt-1">
            ID: {row.original.id.substring(0, 8)}...
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sectionType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">
          {formatSectionType(row.original.sectionType)}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const outline = row.original;
        const statusConfig = {
          PENDING: {
            icon: AlertCircle,
            color: "text-yellow-600 dark:text-yellow-400",
            bg: "bg-yellow-100 dark:bg-yellow-900/30",
            label: "Pending"
          },
          IN_PROGRESS: {
            icon: Clock,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-100 dark:bg-blue-900/30",
            label: "In Progress"
          },
          COMPLETED: {
            icon: CheckCircle,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-100 dark:bg-green-900/30",
            label: "Completed"
          },
        };

        const config = statusConfig[outline.status];
        const Icon = config.icon;

        return (
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
              {updatingId === outline.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className={`h-4 w-4 ${config.color}`} />
              )}
              <span className={`text-sm font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
            {(currentUserRole === "REVIEWER" || currentUserRole === "OWNER") && updatingId !== outline.id ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {outline.status !== "COMPLETED" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(outline.id, "COMPLETED")}
                      disabled={updatingId === outline.id}
                    >
                      Mark as Completed
                    </DropdownMenuItem>
                  )}
                  {outline.status !== "IN_PROGRESS" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(outline.id, "IN_PROGRESS")}
                      disabled={updatingId === outline.id}
                    >
                      Mark as In Progress
                    </DropdownMenuItem>
                  )}
                  {outline.status !== "PENDING" && (
                    <DropdownMenuItem
                      onClick={() => handleStatusChange(outline.id, "PENDING")}
                      disabled={updatingId === outline.id}
                    >
                      Mark as Pending
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "target",
      header: "Target",
      cell: ({ row }) => (
        <div className="text-right font-mono">{row.original.target.toLocaleString()} words</div>
      ),
    },
    {
      accessorKey: "limit",
      header: "Limit",
      cell: ({ row }) => (
        <div className="text-right font-mono">{row.original.limit.toLocaleString()} words</div>
      ),
    },
    {
      accessorKey: "reviewer",
      header: "Reviewer",
      cell: ({ row }) => {
        const reviewer = row.original.reviewer;
        return reviewer ? (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{reviewer.name}</span>
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
          {format(new Date(row.original.createdAt), "MMM d, yyyy")}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const outline = row.original;
        const canEdit = currentUserRole === "OWNER" || 
                       currentUserRole === "REVIEWER" ||
                       outline.createdBy?.user?.id === "current-user-id"; // You'll need to get current user ID

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

            {(currentUserRole === "OWNER" || outline.createdBy?.user?.id === "current-user-id") && (
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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading outlines...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No Outlines Found</h3>
        <p className="text-muted-foreground mb-6">
          Create your first outline to get started
        </p>
        <Link href="/outlines/create">
          <Button>
            <ChevronRight className="mr-2 h-4 w-4" />
            Create Outline
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}