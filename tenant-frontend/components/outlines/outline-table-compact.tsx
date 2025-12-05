// app/components/outlines/outline-table-compact.tsx
"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircle2,
  Circle,
  Columns,
  MoreVertical,
  GripVertical,
  Loader2,
  Eye,
  Edit,
  Trash,
  FileText,
  Clock,
  CheckCircle,
  User,
  Calendar,
  Save,
  X,
} from "lucide-react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
} from "@/components/ui/tabs";
import { Outline, OrganizationMember } from "@/types/types";
import { OutlineModal } from "./outline-modal";
import { EditTooltip } from "../ui/tooltip";
import { useTheme } from "next-themes";

interface OutlineTableCompactProps {
  data: Outline[];
  onDelete: (outlineId: string) => Promise<void>;
  onStatusChange?: (outlineId: string, newStatus: Outline["status"]) => Promise<void>;
  onUpdateOutline: (outlineId: string, updateData: Partial<Outline>) => Promise<Outline | void>;
  onAssignReviewer?: (outlineId: string, reviewerId: string | null) => Promise<void>;
  isLoading: boolean;
  currentUserRole: string;
  currentUserId?: string;
  organizationMembers?: OrganizationMember[];
  organizationId: string;
}

export function OutlineTableCompact({
  data: initialData,
  onDelete,

  onUpdateOutline,
  onAssignReviewer,
  isLoading,
  currentUserRole,
  currentUserId,
  organizationMembers = [],
}: OutlineTableCompactProps) {
  const [data, setData] = React.useState(() => initialData);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [assigningReviewerId, setAssigningReviewerId] = React.useState<string | null>(null);

  // Inline editing states
  const [editingCell, setEditingCell] = React.useState<{
    rowId: string;
    columnId: string;
    value: any;
  } | null>(null);
  const [editingValue, setEditingValue] = React.useState<string>("");
  const [isSaving, setIsSaving] = React.useState(false);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedOutline, setSelectedOutline] = React.useState<Outline | null>(null);
  const [modalMode, setModalMode] = React.useState<"view" | "edit">("view");

  React.useEffect(() => {
    setData(initialData);
  }, [initialData]);

  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => data?.map(({ id }) => id) || [],
    [data]
  );

  const formatSectionType = (type: string) => {
    return type
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const handleDelete = async (outlineId: string, header: string) => {
    if (window.confirm(`Are you sure you want to delete "${header}"?`)) {
      try {
        setDeletingId(outlineId);
        await onDelete(outlineId);
        toast.success("Outline deleted successfully");
      } catch {
        toast.error("Failed to delete outline");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleReviewerAssignment = async (outlineId: string, reviewerId: string | null) => {
    if (!onAssignReviewer) return;

    setAssigningReviewerId(outlineId);
    try {
      await onAssignReviewer(outlineId, reviewerId);
    } finally {
      setAssigningReviewerId(null);
    }
  };

  // Handle inline editing
  const startEditing = (rowId: string, columnId: string, value: any) => {
    setEditingCell({ rowId, columnId, value });
    setEditingValue(value.toString());
  };

  const cancelEditing = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  const saveEditing = async () => {
    if (!editingCell || !onUpdateOutline) return;

    const { rowId, columnId } = editingCell;
    const outline = data.find(o => o.id === rowId);
    if (!outline) return;

    setIsSaving(true);
    try {
      let updateData: Partial<Outline> = {};

      if (columnId === "target") {
        updateData = { target: parseInt(editingValue) || 0 };
      } else if (columnId === "limit") {
        updateData = { limit: parseInt(editingValue) || 0 };
      } else if (columnId === "status") {
        updateData = { status: editingValue as any };
      }

      await onUpdateOutline(rowId, updateData);
      setEditingCell(null);
      setEditingValue("");
    } catch (error) {
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCellDoubleClick = (rowId: string, columnId: string, value: any) => {
    if (["target", "limit", "status"].includes(columnId)) {
      startEditing(rowId, columnId, value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEditing();
    } else if (e.key === "Escape") {
      cancelEditing();
    }
  };

  const openViewModal = (outline: Outline) => {
    setSelectedOutline(outline);
    setModalMode("view");
    setModalOpen(true);
  };

  const openEditModal = (outline: Outline) => {
    setSelectedOutline(outline);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleSaveOutline = async (updateData: Partial<Outline>) => {
    if (!selectedOutline || !onUpdateOutline) return;

    try {
      await onUpdateOutline(selectedOutline.id, updateData);
    } catch (error) {
      throw error;
    }
  };

  const canEditOutline = (outline: Outline) => {
    return (
      currentUserRole === "OWNER" ||
      currentUserRole === "REVIEWER" ||
      outline.createdBy?.user?.id === currentUserId
    );
  };

  const canDeleteOutline = (outline: Outline) => {
    return (
      currentUserRole === "OWNER" ||
      outline.createdBy?.user?.id === currentUserId
    );
  };

  // const getReviewers = () => {
  //   return organizationMembers.filter(member =>
  //     member.role === "REVIEWER" || member.role === "OWNER"
  //   );
  // };

  // const reviewers = getReviewers();

  const columns: ColumnDef<Outline>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
      enableHiding: false,
    },
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "header",
      header: "Header",
      cell: ({ row }) => {
        const outline = row.original;
        return (
          <Button
            variant="link"
            className="w-fit px-0 text-left text-foreground hover:text-primary"
            onClick={() => openViewModal(outline)}
          >
            {outline.header}
          </Button>
        );
      },
      enableHiding: false,
    },
    {
      accessorKey: "sectionType",
      header: "Section Type",
      cell: ({ row }) => {
        const outline = row.original;
        return (
          <div className="w-32">
            <Badge variant="outline" className="text-muted-foreground px-1.5">
              {formatSectionType(outline.sectionType)}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: () => <div className="w-full text-right">Status</div>,
      cell: ({ row }) => {
        const outline = row.original;
        const isEditing = editingCell?.rowId === outline.id && editingCell?.columnId === "status";

        const statusConfig = {
          PENDING: {
            icon: <Circle className="size-3 fill-yellow-500 text-yellow-500" />,
            label: "Pending",
            className: "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-900 dark:bg-yellow-900/30",
          },
          IN_PROGRESS: {
            icon: <Clock className="size-3 fill-gray-500 text-gray-500" />,
            label: "In Progress",
            className: "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-900 dark:bg-gray-900/30",
          },
          COMPLETED: {
            icon: <CheckCircle2 className="size-3 fill-green-500 text-green-500" />,
            label: "Completed",
            className: "border-green-200 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-900/30",
          },
        };

        const config = statusConfig[outline.status];

        if (isEditing) {
          return (
            <div className="flex items-center gap-1">
              <Select
                value={editingValue}
                onValueChange={setEditingValue}
                disabled={isSaving}
              >
                <SelectTrigger
                  className="h-8 w-32 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:ring-2 data-[state=open]:ring-ring"
                >                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent
                  className="border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 min-w-48"
                >                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="icon"
                variant="ghost"
                onClick={saveEditing}
                disabled={isSaving}
                className="h-8 w-8"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={cancelEditing}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        return (
          <div
            className="w-full text-right cursor-pointer"
            onDoubleClick={() => handleCellDoubleClick(outline.id, "status", outline.status)}
          >
            <EditTooltip>
              <Badge variant="outline" className={`px-1.5 gap-1 ${config.className}`}>
                {config.icon}
                {config.label}
              </Badge>
            </EditTooltip>
          </div>
        );
      },
    },
    {
      accessorKey: "target",
      header: () => <div className="w-full text-right">Target</div>,
      cell: ({ row }) => {
        const outline = row.original;
        const isEditing = editingCell?.rowId === outline.id && editingCell?.columnId === "target";

        if (isEditing) {
          return (
            <div className="flex items-center justify-end gap-1">
              <Input
                className="h-8 w-20 text-right"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={handleKeyPress}
                type="number"
                disabled={isSaving}
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={saveEditing}
                disabled={isSaving}
                className="h-8 w-8"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={cancelEditing}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        return (
          <div
            className="w-full text-right cursor-pointer"
            onDoubleClick={() => handleCellDoubleClick(outline.id, "target", outline.target)}
          >
            <EditTooltip>
              <div className="h-8 flex items-center justify-end px-2 hover:bg-accent rounded">
                {outline.target}
              </div>
            </EditTooltip>
          </div>
        );
      },
    },
    {
      accessorKey: "limit",
      header: () => <div className="w-full text-right">Limit</div>,
      cell: ({ row }) => {
        const outline = row.original;
        const isEditing = editingCell?.rowId === outline.id && editingCell?.columnId === "limit";

        if (isEditing) {
          return (
            <div className="flex items-center justify-end gap-1">
              <Input
                className="h-8 w-20 text-right"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={handleKeyPress}
                type="number"
                disabled={isSaving}
                autoFocus
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={saveEditing}
                disabled={isSaving}
                className="h-8 w-8"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={cancelEditing}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        return (
          <div
            className="w-full text-right cursor-pointer"
            onDoubleClick={() => handleCellDoubleClick(outline.id, "limit", outline.limit)}
          >
            <EditTooltip>
              <div className="h-8 flex items-center justify-end px-2 hover:bg-accent rounded">
                {outline.limit}
              </div>
            </EditTooltip>
          </div>
        );
      },
    },
    {
      accessorKey: "reviewer",
      header: () => <div className="w-full text-center">Reviewer</div>,
      cell: ({ row }) => {
        const outline = row.original;
        const isAssigned = outline.reviewerMember && outline.reviewerMember.user?.name;
        const isLoading = assigningReviewerId === outline.id;

        if (isAssigned) {
          return (
            <div className="flex items-center justify-center gap-2 cursor-pointer hover:bg-accent rounded p-1">
              <User className="size-3 text-muted-foreground" />
              <span className="text-sm">{outline.reviewerMember?.user?.name}</span>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center">
            <Select
              disabled={isLoading || organizationMembers.length === 0}
              onValueChange={(value) => {
                if (value === "unassigned") {
                  handleReviewerAssignment(outline.id, null);
                } else {
                  handleReviewerAssignment(outline.id, value);
                }
              }}
            >
              <SelectTrigger
                className="h-8 w-full min-w-32 justify-between border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=open]:ring-2 data-[state=open]:ring-ring"
              >
                {isLoading ? (
                  <Loader2 className="size-3 animate-spin" />
                ) : (
                  <SelectValue placeholder="Assign reviewer" />
                )}
              </SelectTrigger>
              <SelectContent
                className="border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 min-w-48"

              >                <SelectItem value="unassigned">Unassigned</SelectItem>
                {organizationMembers.map((member) => (
                  <SelectItem
                    key={member.id}
                    value={member.id}
                    className="flex items-center gap-2"
                  >
                    <div className="flex items-center gap-2">
                      {member.user?.image ? (
                        <img
                          src={member.user.image}
                          alt={member.user.name || ""}
                          className="size-4 rounded-full"
                        />
                      ) : (
                        <User className="size-4" />
                      )}
                      <span>{member.user?.name || member.user?.email}</span>
                      {member.role === "OWNER" && (
                        <Badge variant="secondary" className="text-xs">
                          Owner
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        const outline = row.original;
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="size-3" />
            {new Date(outline.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const outline = row.original;
        const canEdit = canEditOutline(outline);
        const canDelete = canDeleteOutline(outline);

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                size="icon"
              >
                <MoreVertical />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-72 border bg-background/95 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50"
            >              <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => openViewModal(outline)}
            >
                <Eye className="mr-2 size-4" />
                View
              </DropdownMenuItem>

              {canEdit && (
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => openEditModal(outline)}
                >
                  <Edit className="mr-2 size-4" />
                  Edit
                </DropdownMenuItem>
              )}

              <DropdownMenuItem>
                <FileText className="mr-2 size-4" />
                Make a copy
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {canDelete && (
                <DropdownMenuItem
                  variant="destructive"
                  className="cursor-pointer text-red-600"
                  onClick={() => handleDelete(outline.id, outline.header)}
                  disabled={deletingId === outline.id}
                >
                  {deletingId === outline.id ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Trash className="mr-2 size-4" />
                  )}
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: (row) => row.id,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  function DragHandle({ id }: { id: string }) {
    const { attributes, listeners } = useSortable({
      id,
    });

    return (
      <Button
        {...attributes}
        {...listeners}
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:bg-transparent"
      >
        <GripVertical className="size-3 text-muted-foreground" />
        <span className="sr-only">Drag to reorder</span>
      </Button>
    );
  }

  function DraggableRow({ row }: { row: Row<Outline> }) {
    const { transform, transition, setNodeRef, isDragging } = useSortable({
      id: row.original.id,
    });

    return (
      <TableRow
        data-state={row.getIsSelected() && "selected"}
        data-dragging={isDragging}
        ref={setNodeRef}
        className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
        style={{
          transform: CSS.Transform.toString(transform),
          transition: transition,
        }}
      >
        {row.getVisibleCells().map((cell) => (
          <TableCell key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        ))}
      </TableRow>
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
        <div className="flex items-center justify-between p-4 lg:px-6">
          <div className="hidden md:flex">

          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Columns />
                  <span className="hidden lg:inline">Customize Columns</span>
                  <span className="lg:hidden">Columns</span>
                  <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className={`w-52 ${isDark ? "bg-[#141414] text-white" : "bg-[#DEDEDE] text-gray-900"
                  }`}              >                {table
                    .getAllColumns()
                    .filter(
                      (column) =>
                        typeof column.accessorFn !== "undefined" && column.getCanHide()
                    )
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) => column.toggleVisibility(!!value)}
                        >
                          {column.id}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
              </DropdownMenuContent>
            </DropdownMenu>
            <div>
              {/* <Link href="/outlines/create">
              <Button variant="outline" size="sm">
                <Plus />
                <span className="hidden lg:inline">Add Section</span>
              </Button>
            </Link> */}
            </div>

          </div>
        </div>

        <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
          <div className="overflow-hidden rounded-lg border">
            <DndContext
              collisionDetection={closestCenter}
              modifiers={[restrictToVerticalAxis]}
              onDragEnd={handleDragEnd}
              sensors={sensors}
              id={sortableId}
            >
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-muted">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody className="**:data-[slot=table-cell]:first:w-8">
                  {table.getRowModel().rows?.length ? (
                    <SortableContext items={dataIds} strategy={verticalListSortingStrategy}>
                      {table.getRowModel().rows.map((row) => (
                        <DraggableRow key={row.id} row={row} />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        {isLoading ? (
                          <div className="flex items-center justify-center gap-2">
                            <Loader2 className="size-4 animate-spin" />
                            Loading outlines...
                          </div>
                        ) : (
                          "No outlines found."
                        )}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>
          </div>

          <div className="flex items-center justify-between p-4">
            <div className="text-muted-foreground hidden flex-1 text-sm lg:flex">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} row(s) selected.
            </div>
            <div className="flex w-full items-center gap-8 lg:w-fit">
              <div className="hidden items-center gap-2 lg:flex">
                <Label htmlFor="rows-per-page" className="text-sm font-medium">
                  Rows per page
                </Label>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onValueChange={(value) => {
                    table.setPageSize(Number(value));
                  }}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-8 w-20 border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:ring-2 data-[state=open]:ring-ring"
                    id="rows-per-page"
                  >                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                  </SelectTrigger>
                  <SelectContent
                    className="border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50  "
                    side="top"
                    align="end"
                  >                    {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`}>
                      {pageSize}
                    </SelectItem>
                  ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex w-fit items-center justify-center text-sm font-medium">
                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
              </div>
              <div className="ml-auto flex items-center gap-2 lg:ml-0">
                <Button
                  variant="outline"
                  className="hidden size-8 p-0 lg:flex"
                  onClick={() => table.setPageIndex(0)}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to first page</span>
                  <ChevronLeftIcon />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Go to previous page</span>
                  <ChevronLeft />
                </Button>
                <Button
                  variant="outline"
                  className="size-8"
                  size="icon"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to next page</span>
                  <ChevronRight />
                </Button>
                <Button
                  variant="outline"
                  className="hidden size-8 lg:flex"
                  size="icon"
                  onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  disabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Go to last page</span>
                  <ChevronRightIcon />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Other tabs content remains the same... */}
        <TabsContent value="in-progress" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Clock className="mx-auto size-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">In Progress Outlines</h3>
                <p className="mt-2 text-muted-foreground">
                  {data.filter(o => o.status === "IN_PROGRESS").length} outlines currently in progress
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <CheckCircle className="mx-auto size-12 text-green-500" />
                <h3 className="mt-4 text-lg font-semibold">Completed Outlines</h3>
                <p className="mt-2 text-muted-foreground">
                  {data.filter(o => o.status === "COMPLETED").length} outlines completed
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="flex flex-col px-4 lg:px-6">
          <div className="aspect-video w-full flex-1 rounded-lg border border-dashed">
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <Circle className="mx-auto size-12 text-yellow-500" />
                <h3 className="mt-4 text-lg font-semibold">Pending Outlines</h3>
                <p className="mt-2 text-muted-foreground">
                  {data.filter(o => o.status === "PENDING").length} outlines pending review
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {selectedOutline && (
        <OutlineModal
          outline={selectedOutline}
          open={modalOpen}
          onOpenChange={setModalOpen}
          mode={modalMode}
          onSave={handleSaveOutline}
          onDelete={onDelete}
          currentUserRole={currentUserRole}
          organizationMembers={organizationMembers}
        />
      )}
    </>
  );
}