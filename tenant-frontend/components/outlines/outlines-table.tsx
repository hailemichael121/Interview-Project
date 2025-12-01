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
  IconCircleCheckFilled,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconLoader,
  IconPlus,
  IconUser,
} from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  RowData,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "../ui/chart";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from "@radix-ui/react-dialog";
import { DialogHeader, DialogFooter } from "../ui/dialog";
import { TrendingUp, X } from "lucide-react";

export const schema = z.object({
  id: z.number(),
  header: z.string(),
  type: z.string(),
  status: z.string(),
  target: z.string(),
  limit: z.string(),
  reviewer: z.string(),
});

// Create a separate component for the drag handle
function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="size-7 hover:bg-transparent text-muted-foreground hover:text-foreground"
    >
      <IconGripVertical className="size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

const columns: ColumnDef<z.infer<typeof schema>>[] = [
  {
    id: "drag",
    header: () => null,
    cell: ({ row }) => <DragHandle id={row.original.id} />,
    enableHiding: false,
    meta: {
      align: "center" as const,
      width: "60px",
    },
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
          className="translate-y-[2px]"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    meta: {
      align: "center" as const,
      width: "60px",
    },
  },
  {
    accessorKey: "header",
    header: "Header",
    cell: ({ row }) => {
      return <TableCellViewer item={row.original} />;
    },
    enableHiding: false,
    meta: {
      align: "left" as const,
      width: "250px",
    },
  },
  {
    accessorKey: "type",
    header: "Section Type",
    cell: ({ row }) => (
      <div className="w-32">
        <Badge variant="outline" className="px-1.5 text-muted-foreground">
          {row.original.type}
        </Badge>
      </div>
    ),
    meta: {
      align: "left" as const,
      width: "150px",
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex justify-start">
        <Badge
          variant="outline"
          className="px-1.5 gap-2"
          data-status={row.original.status}
        >
          {row.original.status === "Done" ? (
            <IconCircleCheckFilled className="size-4 fill-green-500 dark:fill-green-400" />
          ) : (
            <IconLoader className="size-4 animate-spin text-primary" />
          )}
          {row.original.status}
        </Badge>
      </div>
    ),
    meta: {
      align: "left" as const,
      width: "140px",
    },
  },
  {
    accessorKey: "target",
    header: () => <div className="w-full text-right">Target</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `Saving target for ${row.original.header}...`,
              success: "Target Saved",
              error: "Error saving target",
            });
          }}
        >
          <Label htmlFor={`${row.original.id}-target`} className="sr-only">
            Target
          </Label>
          <Input
            className="h-8 w-16 border bg-[hsl(var(--background))] text-right shadow-none hover:bg-muted focus-visible:ring-ring"
            defaultValue={row.original.target}
            id={`${row.original.id}-target`}
          />
        </form>
      </div>
    ),
    meta: {
      align: "right" as const,
      width: "100px",
    },
  },
  {
    accessorKey: "limit",
    header: () => <div className="w-full text-right">Limit</div>,
    cell: ({ row }) => (
      <div className="flex justify-end">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            toast.promise(new Promise((resolve) => setTimeout(resolve, 1000)), {
              loading: `Saving limit for ${row.original.header}...`,
              success: "Limit Saved",
              error: "Error saving limit",
            });
          }}
        >
          <Label htmlFor={`${row.original.id}-limit`} className="sr-only">
            Limit
          </Label>
          <Input
            className="h-8 w-16 border bg-[hsl(var(--background))] text-right shadow-none hover:bg-muted focus-visible:ring-ring"
            defaultValue={row.original.limit}
            id={`${row.original.id}-limit`}
          />
        </form>
      </div>
    ),
    meta: {
      align: "right" as const,
      width: "100px",
    },
  },
  {
    accessorKey: "reviewer",
    header: "Reviewer",
    cell: ({ row }) => {
      const isAssigned = row.original.reviewer !== "Assign reviewer";

      if (isAssigned) {
        return (
          <div className="flex items-center gap-2">
            <IconUser className="size-4 text-primary" />
            <span className="truncate">{row.original.reviewer}</span>
          </div>
        );
      }

      return (
        <div className="flex justify-start">
          <Label htmlFor={`${row.original.id}-reviewer`} className="sr-only">
            Reviewer
          </Label>
          <Select>
            <SelectTrigger
              className="w-38 data-[state=open]:ring-2 data-[state=open]:ring-ring"
              size="sm"
              id={`${row.original.id}-reviewer`}
            >
              <SelectValue placeholder="Assign reviewer" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
              <SelectItem value="Jamik Tashpulatov">
                Jamik Tashpulatov
              </SelectItem>
              <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    },
    meta: {
      align: "left" as const,
      width: "180px",
    },
  },
  {
    id: "actions",
    cell: () => (
      <div className="flex justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex size-8 data-[state=open]:bg-muted text-muted-foreground hover:text-foreground"
              size="icon"
            >
              <IconDotsVertical className="size-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem>Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="focus:bg-destructive focus:text-destructive-foreground">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
    meta: {
      align: "center" as const,
      width: "80px",
    },
  },
];

function DraggableRow({ row }: { row: Row<z.infer<typeof schema>> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      // Apply correct hover/selection styles for dark/light mode
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 transition-shadow hover:bg-[hsl(var(--muted)/0.5)]"
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
export function DataTable({ data: initialData }: { data: RowData[] }) {
  const [data, setData] = React.useState(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setData((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="border-b border-light-300 bg-[hsl(var(--card))]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            {/* Mobile Select */}
            <Select defaultValue="outline">
              <SelectTrigger className="w-full max-w-xs sm:hidden h-10 bg-[hsl(var(--card))] border-light-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[hsl(var(--card))] border-light-300">
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="past-performance">
                  Past Performance
                </SelectItem>
                <SelectItem value="key-personnel">Key Personnel</SelectItem>
                <SelectItem value="focus-documents">Focus Documents</SelectItem>
              </SelectContent>
            </Select>

            {/* Desktop Tabs */}
            <Tabs defaultValue="outline" className="hidden sm:block">
              <TabsList className="grid grid-cols-4 w-full max-w-2xl h-11 bg-[hsl(var(--muted)/0.4)] rounded-lg p-1">
                <TabsTrigger
                  value="outline"
                  className="rounded-md data-[state=active]:bg-[hsl(var(--background))] data-[state=active]:shadow-sm"
                >
                  Outline
                </TabsTrigger>
                <TabsTrigger
                  value="past-performance"
                  className="rounded-md data-[state=active]:bg-[hsl(var(--background))] data-[state=active]:shadow-sm"
                >
                  Past Performance{" "}
                  <Badge variant="secondary" className="ml-2">
                    3
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="key-personnel"
                  className="rounded-md data-[state=active]:bg-[hsl(var(--background))] data-[state=active]:shadow-sm"
                >
                  Key Personnel{" "}
                  <Badge variant="secondary" className="ml-2">
                    2
                  </Badge>
                </TabsTrigger>
                <TabsTrigger
                  value="focus-documents"
                  className="rounded-md data-[state=active]:bg-[hsl(var(--background))] data-[state=active]:shadow-sm"
                >
                  Focus Documents
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 gap-2 border-light-300"
                >
                  <IconLayoutColumns className="h-4 w-4" />
                  <span className="hidden sm:inline">Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-[hsl(var(--card))] border-light-300"
              >
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide?.() ?? false)
                  .map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button size="sm" className="h-10 gap-2">
              <IconPlus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Section</span>
              <span className="sm:hidden">Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-light-300 bg-[hsl(var(--card))] overflow-hidden mt-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[hsl(var(--muted)/0.4)] border-b border-light-300">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-11 align-middle"
                      style={{
                        textAlign:
                          header.column.columnDef.meta?.align || "left",
                        width: header.column.columnDef.meta?.width || "auto",
                      }}
                    >
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
              {table.getRowModel().rows.length ? (
                <SortableContext
                  items={data.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-[hsl(var(--muted-foreground))]"
                  >
                    No sections found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>
    </div>
  );
}
// Chart Data and Config remain unchanged
const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--primary)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

function TableCellViewer({ item }: { item: z.infer<typeof schema> }) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button
        variant="link"
        className="h-auto p-0 font-medium text-[hsl(var(--foreground))] hover:text-primary hover:no-underline"
        onClick={() => setOpen(true)}
      >
        {item.header}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* 1. THE ESSENTIAL FIX: Re-adding the DialogOverlay */}
        {/* This creates the dark backdrop with a high z-index (z-50) to obscure content underneath. */}
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />

        <DialogContent
          className="
            /* Centering and Z-Index (Z-50 is correct for content to be above the overlay) */
            fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]
            
            /* Sizing and Layout */
            w-[95vw] max-w-4xl max-h-[85vh]
            grid grid-rows-[auto_1fr_auto] /* Ensures header/footer are fixed and middle section scrolls */

            /* Appearance */
            border border-[hsl(var(--border))] rounded-lg
            bg-[hsl(var(--background))] /* Solid background ensures content is opaque */
            shadow-2xl
            overflow-hidden

            /* Animations */
            data-[state=open]:animate-in data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0
            data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95
            data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]
            data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]
          "
        >
          {/* <DialogContent
                            // Increased width for desktop screens: sm:max-w-[425px] -> sm:max-w-lg (512px)
                            className="sm:max-w-lg p-0 border-none rounded-xl shadow-2xl overflow-hidden 
                                       bg-[hsl(var(--background))]"
                          ></DialogContent> */}
          {/* Header */}
          <DialogHeader className="p-6 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
            <DialogTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
              {item.header}
            </DialogTitle>
            <DialogDescription className="text-base text-[hsl(var(--muted-foreground))]">
              Edit section details and view analytics
            </DialogDescription>
            <DialogClose className="absolute right-6 top-6 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="overflow-y-auto p-6 space-y-6">
            {/* ... Chart Section and Form Section Content ... */}
            <div className="bg-[hsl(var(--card))] p-6 rounded-lg border border-[hsl(var(--border))]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Progress Analytics</h3>
                <Badge variant="secondary" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending up by 5.2%
                </Badge>
              </div>
              <ChartContainer config={chartConfig} className="h-48 w-full">
                <AreaChart
                  data={chartData}
                  margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    dataKey="desktop"
                    type="monotone"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="mobile"
                    type="monotone"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
              <div className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
                Word count progression over the last 6 months
              </div>
            </div>

            <div className="bg-[hsl(var(--card))] p-6 rounded-lg border border-[hsl(var(--border))]">
              <h3 className="text-lg font-semibold mb-6">Section Details</h3>
              <form className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {/* ... Input and Select fields ... */}
                  <div className="space-y-2">
                    <Label htmlFor="header" className="text-sm font-medium">
                      Section Header
                    </Label>
                    <Input
                      id="header"
                      defaultValue={item.header}
                      className="h-10 bg-[hsl(var(--background))]"
                    />
                  </div>
                  {/* ... other form fields ... */}
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Section Type
                    </Label>
                    <Select defaultValue={item.type}>
                      <SelectTrigger id="type" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Executive Summary">
                          Executive Summary
                        </SelectItem>
                        <SelectItem value="Technical Approach">
                          Technical Approach
                        </SelectItem>
                        <SelectItem value="Narrative">Narrative</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Capabilities">
                          Capabilities
                        </SelectItem>
                        <SelectItem value="Focus Documents">
                          Focus Documents
                        </SelectItem>
                        <SelectItem value="Table of Contents">
                          Table of Contents
                        </SelectItem>
                        <SelectItem value="Cover Page">Cover Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Status
                    </Label>
                    <Select defaultValue={item.status}>
                      <SelectTrigger id="status" className="h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Done">Done</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Not Started">Not Started</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reviewer" className="text-sm font-medium">
                      Reviewer
                    </Label>
                    <Select defaultValue={item.reviewer}>
                      <SelectTrigger id="reviewer" className="h-10">
                        <SelectValue placeholder="Assign reviewer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                        <SelectItem value="Jamik Tashpulatov">
                          Jamik Tashpulatov
                        </SelectItem>
                        <SelectItem value="Emily Whalen">
                          Emily Whalen
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target" className="text-sm font-medium">
                      Target Word Count
                    </Label>
                    <Input
                      id="target"
                      type="number"
                      defaultValue={item.target}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit" className="text-sm font-medium">
                      Word Limit
                    </Label>
                    <Input
                      id="limit"
                      type="number"
                      defaultValue={item.limit}
                      className="h-10"
                    />
                  </div>
                </div>
                {/* Additional Notes Field */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Additional Notes
                  </Label>
                  <textarea
                    id="notes"
                    className="w-full min-h-20 p-3 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--background))] resize-vertical text-sm"
                    placeholder="Add any additional notes or comments..."
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <DialogFooter className="flex flex-row justify-end gap-3 p-6 border-t border-[hsl(var(--border))] bg-[hsl(var(--card))] shrink-0">
            <Button
              variant="outline"
              className="h-10 px-6"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="h-10 px-6"
              onClick={() => {
                toast.success(`"${item.header}" has been updated successfully`);
                setOpen(false);
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
