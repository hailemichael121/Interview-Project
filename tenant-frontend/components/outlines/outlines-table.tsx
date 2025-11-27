// components/outlines/outlines-table.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { useOrg } from "@/lib/org-context";
import {
  getOutlines,
  createOutline,
  updateOutline,
  deleteOutline,
} from "@/lib/api";

interface Outline {
  id: string;
  header: string;
  sectionType: string;
  status: "Pending" | "In-Progress" | "Completed";
  target: number;
  limit: number;
  reviewer: "Assim" | "Bini" | "Mami";
}

const SECTION_TYPES = [
  "Table of Contents",
  "Executive Summary",
  "Technical Approach",
  "Design",
  "Capabilities",
  "Focus Document",
  "Narrative",
] as const;

const REVIEWERS = ["Assim", "Bini", "Mami"] as const;

export default function OutlinesTable() {
  const { currentOrg } = useOrg();
  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingOutline, setEditingOutline] = useState<Outline | null>(null);
  const [formData, setFormData] = useState({
    header: "",
    sectionType: "",
    status: "Pending",
    target: 0,
    limit: 0,
    reviewer: "Assim",
  });

  useEffect(() => {
    if (currentOrg) {
      loadOutlines();
    }
  }, [currentOrg]);

  const loadOutlines = async () => {
    if (!currentOrg) return;

    try {
      setIsLoading(true);
      const data = await getOutlines(currentOrg.id);
      setOutlines(data);
    } catch (error) {
      toast.error("Failed to load outlines");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;

    try {
      if (editingOutline) {
        await updateOutline(currentOrg.id, editingOutline.id, formData);
        toast.success("Outline updated successfully!");
      } else {
        await createOutline(currentOrg.id, formData);
        toast.success("Outline created successfully!");
      }

      setIsSheetOpen(false);
      resetForm();
      loadOutlines();
    } catch (error) {
      toast.error(`Failed to ${editingOutline ? "update" : "create"} outline`);
    }
  };

  const handleEdit = (outline: Outline) => {
    setEditingOutline(outline);
    setFormData({
      header: outline.header,
      sectionType: outline.sectionType,
      status: outline.status,
      target: outline.target,
      limit: outline.limit,
      reviewer: outline.reviewer,
    });
    setIsSheetOpen(true);
  };

  const handleDelete = async (outlineId: string) => {
    if (!currentOrg) return;

    if (!confirm("Are you sure you want to delete this outline?")) return;

    try {
      await deleteOutline(currentOrg.id, outlineId);
      toast.success("Outline deleted successfully!");
      loadOutlines();
    } catch (error) {
      toast.error("Failed to delete outline");
    }
  };

  const resetForm = () => {
    setEditingOutline(null);
    setFormData({
      header: "",
      sectionType: "",
      status: "Pending",
      target: 0,
      limit: 0,
      reviewer: "Assim",
    });
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default";
      case "In-Progress":
        return "secondary";
      case "Pending":
        return "outline";
      default:
        return "outline";
    }
  };

  if (!currentOrg) {
    return (
      <div className="text-center py-8">
        <p>Please select an organization to view outlines</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Outlines</h2>
        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) resetForm();
          }}
        >
          <SheetTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>
                {editingOutline ? "Edit Outline" : "Create New Outline"}
              </SheetTitle>
              <SheetDescription>
                {editingOutline
                  ? "Update the outline details"
                  : "Add a new outline section to your project"}
              </SheetDescription>
            </SheetHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div className="space-y-2">
                <label htmlFor="header" className="text-sm font-medium">
                  Header
                </label>
                <Input
                  id="header"
                  value={formData.header}
                  onChange={(e) =>
                    setFormData({ ...formData, header: e.target.value })
                  }
                  placeholder="Enter header name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="sectionType" className="text-sm font-medium">
                  Section Type
                </label>
                <Select
                  value={formData.sectionType}
                  onValueChange={(value) =>
                    setFormData({ ...formData, sectionType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section type" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">
                  Status
                </label>
                <Select
                  value={formData.status}
                  onValueChange={(
                    value: "Pending" | "In-Progress" | "Completed"
                  ) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="In-Progress">In-Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="target" className="text-sm font-medium">
                    Target
                  </label>
                  <Input
                    id="target"
                    type="number"
                    value={formData.target}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        target: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="limit" className="text-sm font-medium">
                    Limit
                  </label>
                  <Input
                    id="limit"
                    type="number"
                    value={formData.limit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        limit: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="reviewer" className="text-sm font-medium">
                  Reviewer
                </label>
                <Select
                  value={formData.reviewer}
                  onValueChange={(value: "Assim" | "Bini" | "Mami") =>
                    setFormData({ ...formData, reviewer: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REVIEWERS.map((reviewer) => (
                      <SelectItem key={reviewer} value={reviewer}>
                        {reviewer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                {editingOutline ? "Update Outline" : "Create Outline"}
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Header</TableHead>
              <TableHead>Section type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Limit</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : outlines.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No outlines found. Create your first outline!
                </TableCell>
              </TableRow>
            ) : (
              outlines.map((outline) => (
                <TableRow key={outline.id}>
                  <TableCell
                    className="font-medium cursor-pointer hover:text-blue-600"
                    onClick={() => handleEdit(outline)}
                  >
                    {outline.header}
                  </TableCell>
                  <TableCell>{outline.sectionType}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(outline.status)}>
                      {outline.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{outline.target}</TableCell>
                  <TableCell>{outline.limit}</TableCell>
                  <TableCell>{outline.reviewer}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(outline)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(outline.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
