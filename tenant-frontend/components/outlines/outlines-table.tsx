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
      <div className="text-center py-8 text-white">
        <p>Please select an organization to view outlines</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Outlines</h2>
        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open);
            if (!open) resetForm();
          }}
        >
          <SheetTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-2xl bg-[#101111] border-l border-gray-800">
            <div className="bg-[#101111] h-full overflow-y-auto">
              <SheetHeader className="text-left bg-[#101111]">
                <SheetTitle className="text-2xl text-white">
                  {editingOutline ? "Edit Outline" : "Create New Outline"}
                </SheetTitle>
                <SheetDescription className="text-base text-gray-400">
                  {editingOutline
                    ? "Update the outline details"
                    : "Add a new outline section to your project"}
                </SheetDescription>
              </SheetHeader>

              <form onSubmit={handleSubmit} className="space-y-6 mt-8 mx-6 bg-[#101111]">
                <div className="space-y-3 max-w-md w-full">
                  <label htmlFor="header" className="text-sm font-medium block text-white">
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
                    className="text-left bg-gray-900 border-gray-700 text-white placeholder-gray-500 focus:border-blue-500 focus:bg-gray-800"
                  />
                </div>

                <div className="space-y-3 max-w-md w-full">
                  <label htmlFor="sectionType" className="text-sm font-medium block text-white">
                    Section Type
                  </label>
                  <Select
                    value={formData.sectionType}
                    onValueChange={(value) =>
                      setFormData({ ...formData, sectionType: value })
                    }
                  >
                    <SelectTrigger className="text-left bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800">
                    <SelectValue placeholder="Select section type" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {SECTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 max-w-md w-full">
                  <label htmlFor="status" className="text-sm font-medium block text-white">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(
                      value: "Pending" | "In-Progress" | "Completed"
                    ) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="text-left bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      <SelectItem value="Pending" className="text-white hover:bg-gray-800 focus:bg-gray-800">Pending</SelectItem>
                      <SelectItem value="In-Progress" className="text-white hover:bg-gray-800 focus:bg-gray-800">In-Progress</SelectItem>
                      <SelectItem value="Completed" className="text-white hover:bg-gray-800 focus:bg-gray-800">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-md w-full">
                  <div className="space-y-3">
                    <label htmlFor="target" className="text-sm font-medium block text-white">
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
                      className="text-center bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800"
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="limit" className="text-sm font-medium block text-white">
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
                      className="text-center bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800"
                    />
                  </div>
                </div>

                <div className="space-y-3 max-w-md w-full">
                  <label htmlFor="reviewer" className="text-sm font-medium block text-white">
                    Reviewer
                  </label>
                  <Select
                    value={formData.reviewer}
                    onValueChange={(value: "Assim" | "Bini" | "Mami") =>
                      setFormData({ ...formData, reviewer: value })
                    }
                  >
                    <SelectTrigger className="text-center bg-gray-900 border-gray-700 text-white focus:border-blue-500 focus:bg-gray-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700 text-white">
                      {REVIEWERS.map((reviewer) => (
                        <SelectItem key={reviewer} value={reviewer} className="text-white hover:bg-gray-800 focus:bg-gray-800">
                          {reviewer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="max-w-md w-full pt-4">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {editingOutline ? "Update Outline" : "Create Outline"}
                  </Button>
                </div>
              </form>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="border border-gray-800 rounded-lg bg-[#101111]">
        <Table>
          <TableHeader>
            <TableRow className="border-gray-800 hover:bg-transparent">
              <TableHead className="text-gray-300 font-semibold">Header</TableHead>
              <TableHead className="text-gray-300 font-semibold">Section type</TableHead>
              <TableHead className="text-gray-300 font-semibold">Status</TableHead>
              <TableHead className="text-gray-300 font-semibold">Target</TableHead>
              <TableHead className="text-gray-300 font-semibold">Limit</TableHead>
              <TableHead className="text-gray-300 font-semibold">Reviewer</TableHead>
              <TableHead className="text-gray-300 font-semibold w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow className="border-gray-800 hover:bg-gray-900">
                <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                  Loading...
                </TableCell>
              </TableRow>
            ) : outlines.length === 0 ? (
              <TableRow className="border-gray-800 hover:bg-gray-900">
                <TableCell colSpan={7} className="text-center py-4 text-gray-400">
                  No outlines found. Create your first outline!
                </TableCell>
              </TableRow>
            ) : (
              outlines.map((outline) => (
                <TableRow key={outline.id} className="border-gray-800 hover:bg-gray-900">
                  <TableCell
                    className="font-medium cursor-pointer text-white hover:text-blue-400"
                    onClick={() => handleEdit(outline)}
                  >
                    {outline.header}
                  </TableCell>
                  <TableCell className="text-gray-300">{outline.sectionType}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(outline.status)} className={
                      outline.status === 'Completed' 
                        ? 'bg-green-900 text-green-100 border-green-700' 
                        : outline.status === 'In-Progress'
                        ? 'bg-blue-900 text-blue-100 border-blue-700'
                        : 'bg-gray-800 text-gray-300 border-gray-600'
                    }>
                      {outline.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-300">{outline.target}</TableCell>
                  <TableCell className="text-gray-300">{outline.limit}</TableCell>
                  <TableCell className="text-gray-300">{outline.reviewer}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(outline)}
                        className="text-gray-400 hover:text-white hover:bg-gray-800"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(outline.id)}
                        className="text-gray-400 hover:text-red-400 hover:bg-gray-800"
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