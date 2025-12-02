// app/outlines/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { OutlineTable } from "@/components/outlines/outlines-table";
import { useOrganizationContext } from "@/hooks/use-session";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";
import { Outline } from "@/types/types";

export default function OutlinesPage() {
  const {
    currentOrganizationId,
    currentMemberRole,
    hasOrganization,
    isLoading: orgLoading,
  } = useOrganizationContext();

  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch outlines from API
  const fetchOutlines = useCallback(async () => {
    if (!currentOrganizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      const response = await apiService.outline.listOutlines(
        currentOrganizationId,
        page,
        10
      );

      if (response.success) {
        setOutlines(response.data);
        setTotalPages(
          Math.ceil((response.total || 0) / (response.perPage || 10))
        );
      } else {
        toast.error(response.message || "Failed to fetch outlines");
      }
    } catch (error: any) {
      console.error("Error fetching outlines:", error);
      toast.error(error.message || "Failed to load outlines");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentOrganizationId, page]);

  // Update outline
  const handleUpdateOutline = async (outlineId: string, updateData: any) => {
    if (!currentOrganizationId) {
      toast.error("No organization selected");
      return;
    }

    try {
      const response = await apiService.outline.updateOutline(
        outlineId,
        updateData,
        currentOrganizationId
      );

      if (response.success) {
        // Update local state
        setOutlines((prev) =>
          prev.map((outline) =>
            outline.id === outlineId ? { ...outline, ...updateData } : outline
          )
        );
        toast.success("Outline updated successfully");
        return response.data;
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create outline";
      toast.error(errorMessage);
    }
  };

  // Delete outline
  const handleDeleteOutline = async (outlineId: string) => {
    if (!currentOrganizationId) {
      toast.error("No organization selected");
      return;
    }

    try {
      const response = await apiService.outline.deleteOutline(
        outlineId,
        currentOrganizationId
      );

      if (response.success) {
        // Remove from local state
        setOutlines((prev) =>
          prev.filter((outline) => outline.id !== outlineId)
        );
        toast.success("Outline deleted successfully");
      } else {
        throw new Error(response.message || "Delete failed");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create outline";
      toast.error(errorMessage);
    }
  };

  // Handle status update
  const handleStatusUpdate = async (
    outlineId: string,
    newStatus: Outline["status"]
  ) => {
    try {
      await handleUpdateOutline(outlineId, { status: newStatus });
    } catch {
      // Error already handled in handleUpdateOutline
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOutlines();
  }, [fetchOutlines]);

  // Refresh handler
  const handleRefresh = () => {
    fetchOutlines();
    toast.success("Outlines refreshed");
  };

  // No organization selected
  if (!hasOrganization && !orgLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-[hsl(var(--muted-foreground))]">
              Please select an organization to view outlines
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="mt-4">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (orgLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-[hsl(var(--muted-foreground))]">
                Loading outlines...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">
                Outlines
              </h1>
              <p className="mt-3 text-lg text-[hsl(var(--muted-foreground))]">
                Manage and organize your project outlines
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
                className="gap-2"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Link href="/outlines/create">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Outline
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[hsl(var(--card))] border border-light-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-[hsl(var(--foreground))]">
                {outlines.length}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Total Outlines
              </div>
            </div>
            <div className="bg-[hsl(var(--card))] border border-light-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {outlines.filter((o) => o.status === "COMPLETED").length}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Completed
              </div>
            </div>
            <div className="bg-[hsl(var(--card))] border border-light-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {outlines.filter((o) => o.status === "IN_PROGRESS").length}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                In Progress
              </div>
            </div>
            <div className="bg-[hsl(var(--card))] border border-light-300 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {outlines.filter((o) => o.status === "PENDING").length}
              </div>
              <div className="text-sm text-[hsl(var(--muted-foreground))]">
                Pending
              </div>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="rounded-xl border border-light-300 bg-[hsl(var(--card))] shadow-sm overflow-hidden">
          <OutlineTable
            data={outlines}
            onUpdate={handleUpdateOutline}
            onDelete={handleDeleteOutline}
            onStatusChange={handleStatusUpdate}
            isLoading={isLoading}
            currentUserRole={currentMemberRole || ""}
            organizationId={currentOrganizationId || ""}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8">
            <div className="text-sm text-[hsl(var(--muted-foreground))]">
              Showing {outlines.length} outlines
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-[hsl(var(--muted-foreground))] px-4">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
