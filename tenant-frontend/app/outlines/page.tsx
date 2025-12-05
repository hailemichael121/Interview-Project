"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useOrganizationContext, useSession } from "@/hooks/use-session";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";
import { Outline, OrganizationMember } from "@/types/types";
import { OutlineTableCompact } from "@/components/outlines/outline-table-compact";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "next-themes";
import { CreateOutlineForm } from "@/components/outlines/create-outline-form";

type ScopeType = "all" | "assigned" | "my";
type StatusType = "all" | "IN_PROGRESS" | "COMPLETED" | "PENDING";

const TableSkeleton = () => (
  <div className="space-y-4">
    {/* Header Row Skeleton */}
    <div className="rounded-xl border bg-card/70 p-4 shadow-lg">
      <div className="space-y-3">
        {/* Adjusted for a cleaner, more realistic loading header */}
        <div className="grid w-full grid-cols-12 gap-4">
          <div className="col-span-1">
            <Skeleton className="h-5 w-5 rounded animate-glow-wave" />
          </div>
          <div className="col-span-3">
            <Skeleton className="h-5 w-3/4 rounded-md animate-glow-wave" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-5 w-full rounded-md animate-glow-wave" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-5 w-2/3 rounded-md animate-glow-wave" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-5 w-1/2 rounded-md animate-glow-wave" />
          </div>
          <div className="col-span-2">
            <Skeleton className="h-8 w-24 rounded-full animate-glow-wave" />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-5 w-full rounded-md animate-glow-wave" />
          </div>
        </div>
      </div>
    </div>

    {/* Data Row Skeletons */}
    {[...Array(6)].map((_, i) => (
      <div key={i} className="rounded-xl border bg-card/50 p-4 shadow-md transition-shadow hover:shadow-xl">
        <div className="space-y-3">
          <div className="grid w-full grid-cols-12 gap-4">
            <div className="col-span-1">
              {/* Checkbox Placeholder */}
              <Skeleton className="h-4 w-4 rounded-sm animate-glow-wave" style={{ animationDelay: `${i * 0.1}s` }} />
            </div>
            <div className="col-span-3">
              {/* Title Placeholder */}
              <Skeleton className="h-5 w-[80%] rounded-md animate-glow-wave" style={{ animationDelay: `${i * 0.1 + 0.05}s` }} />
            </div>
            <div className="col-span-2">
              {/* Creator/Assignee Placeholder */}
              <Skeleton className="h-5 w-[70%] rounded-md animate-glow-wave" style={{ animationDelay: `${i * 0.1 + 0.1}s` }} />
            </div>
            <div className="col-span-2">
              {/* Status/Date Placeholder */}
              <Skeleton className="h-5 w-[50%] rounded-md animate-glow-wave" style={{ animationDelay: `${i * 0.1 + 0.15}s` }} />
            </div>
            <div className="col-span-1">
              {/* Revisions Placeholder */}
              <Skeleton className="h-5 w-[30px] rounded-md animate-glow-wave" style={{ animationDelay: `${i * 0.1 + 0.2}s` }} />
            </div>
            <div className="col-span-2">
              {/* Actions/Button Placeholder */}
              <Skeleton className="h-8 w-full rounded-full animate-glow-wave" style={{ animationDelay: `${i * 0.1 + 0.25}s` }} />
            </div>
            <div className="col-span-1">
              {/* Menu Placeholder */}
              <Skeleton className="h-5 w-5 rounded-md animate-glow-wave" style={{ animationDelay: `${i * 0.1 + 0.3}s` }} />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);
export default function OutlinesPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";

  const {
    currentOrganizationId,
    currentMemberRole,
    hasOrganization,
    isLoading: orgLoading,
  } = useOrganizationContext();

  const [outlines, setOutlines] = useState<Outline[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [organizationMembers, setOrganizationMembers] = useState<OrganizationMember[]>([]);

  const [scopeFilter, setScopeFilter] = useState<ScopeType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusType>("all");

  const [stats, setStats] = useState({
    totalOutlines: 0,
    completedOutlines: 0,
    inProgressOutlines: 0,
    pendingOutlines: 0,
  });

  const fetchMembers = async () => {
    if (!currentOrganizationId) return;
    try {
      const res = await apiService.organization.listMembers(currentOrganizationId);
      if (res.success) setOrganizationMembers(res.data);
    } catch { }
  };

  const fetchStats = async () => {
    if (!currentOrganizationId) return;
    try {
      const res = await apiService.outline.getOrganizationOutlineStats(currentOrganizationId);
      if (res.success && res.data) {
        setStats({
          totalOutlines: res.data.totalOutlines || 0,
          completedOutlines: res.data.completedOutlines || 0,
          inProgressOutlines: res.data.inProgressOutlines || 0,
          pendingOutlines: res.data.pendingOutlines || 0,
        });
      }
    } catch { }
  };

  const fetchOutlines = useCallback(async () => {
    if (!currentOrganizationId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      let res;
      if (scopeFilter === "assigned") {
        res = await apiService.outline.getAssignedOutlines(currentOrganizationId);
      } else if (scopeFilter === "my") {
        res = await apiService.outline.getMyOutlines(currentOrganizationId);
      } else {
        res = await apiService.outline.listOutlines(currentOrganizationId);
      }

      if (res.success) {
        let data = res.data || [];
        if (statusFilter !== "all") {
          data = data.filter((o: Outline) => o.status === statusFilter);
        }
        setOutlines(data);
      } else {
        toast.error(res.message || "Failed to load outlines");
      }
    } catch {
      toast.error("Failed to load outlines");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentOrganizationId, scopeFilter, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOutlines();
    fetchStats();
    fetchMembers();
    toast.success("Refreshed");
  };

  useEffect(() => {
    if (currentOrganizationId) {
      fetchOutlines();
      fetchStats();
      fetchMembers();
    }
  }, [currentOrganizationId, scopeFilter, statusFilter]);

  const handleUpdateOutline = async (id: string, data: Partial<Outline>) => {
    try {
      const res = await apiService.outline.updateOutline(id, data, currentOrganizationId!);
      if (res.success) {
        toast.success("Updated");
        fetchOutlines();
        fetchStats();
      } else toast.error("Update failed");
    } catch {
      toast.error("Update failed");
    }
  };
  const { session } = useSession();
  const handleAssignReviewer = async (id: string, reviewerMemberId: string | null) => {
    try {
      const res = await apiService.outline.updateOutline(
        id,
        { reviewerMemberId },
        currentOrganizationId!
      );
      if (res.success) {
        toast.success("Reviewer assigned");
        fetchOutlines();
      } else toast.error("Failed");
    } catch {
      toast.error("Failed");
    }
  };

  const handleDeleteOutline = async (id: string) => {
    if (!window.confirm("Delete this outline?")) return;
    try {
      const res = await apiService.outline.deleteOutline(id, currentOrganizationId!);
      if (res.success) {
        toast.success("Deleted");
        fetchOutlines();
        fetchStats();
      } else toast.error("Delete failed");
    } catch {
      toast.error("Delete failed");
    }
  };

  if (!hasOrganization && !orgLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center space-y-4">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
            <p className="text-lg text-muted-foreground">Select an organization to view outlines</p>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (orgLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-12 text-center">
          <RefreshCw className="h-10 w-10 animate-spin mx-auto text-primary" />
          <p className="mt-6 text-muted-foreground">Loading organization...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgColor} ${isDark ? "text-white" : "text-gray-900"}`}>
        <div className="container mx-auto max-w-7xl px-6 py-10">

          <div className="mb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h1 className="text-5xl font-bold">Outlines</h1>
                <p className="text-xl opacity-80 mt-3">Manage and track all project outlines</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" size="lg" onClick={handleRefresh} disabled={refreshing}>
                  <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  size="lg"
                  className="font-semibold shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  <Plus className="h-6 w-6 mr-3" />
                  {showCreateForm ? "Hide Form" : "Create Outline"}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              {[
                { label: "Total", value: stats.totalOutlines, color: "text-white" },
                { label: "Completed", value: stats.completedOutlines, color: "text-green-400" },
                { label: "In Progress", value: stats.inProgressOutlines, color: "text-gray-400" },
                { label: "Pending", value: stats.pendingOutlines, color: "text-yellow-400" },
              ].map((stat) => (
                <div key={stat.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center shadow-xl">
                  <div className={`text-4xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-sm opacity-70 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {showCreateForm && currentOrganizationId && (
            <div className="mb-12 bg-card/80 backdrop-blur border rounded-2xl p-8 shadow-xl">
              <CreateOutlineForm
                organizationId={currentOrganizationId}
                organizationMembers={organizationMembers}
                onSuccess={() => {
                  setShowCreateForm(false);
                  fetchOutlines();
                  fetchStats();
                  toast.success("Outline created!");
                }}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}

          <div className="mb-12 grid md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-5 opacity-90">Filter by Scope</h3>
              <div className="flex flex-wrap  justify-between gap-3">
                {(["all", "assigned", "my"] as const).map((s) => (
                  <Button
                    key={s}
                    variant={scopeFilter === s ? "default" : "outline"}
                    size="lg"
                    onClick={() => setScopeFilter(s)}
                    className={`
                      font-medium transition-all duration-300
                      ${scopeFilter === s
                        ? "ring-4 ring-white/30 shadow-2xl scale-105 bg-primary text-primary-foreground"
                        : "hover:scale-105"
                      }
                    `}
                  >
                    {s === "all" ? "All Outlines" : s === "my" ? "My Outlines" : "Assigned to Me"}
                  </Button>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold mb-5 opacity-90">Filter by Status</h3>
              <div className="flex flex-wrap justify-evenly gap-2">
                {(["all", "IN_PROGRESS", "COMPLETED", "PENDING"] as const).map((s) => (
                  <Button
                    key={s}
                    variant={statusFilter === s ? "default" : "outline"}
                    onClick={() => setStatusFilter(s)}
                    className={`
                      font-medium transition-all duration-300 
                      ${statusFilter === s
                        ? "ring-2 ring-white/30 shadow-2xl scale-105 text-white"
                        : "hover:scale-105"
                      }
                      ${s === "IN_PROGRESS" && statusFilter === s && "bg-gray-600"}
                      ${s === "COMPLETED" && statusFilter === s && "bg-green-600"}
                      ${s === "PENDING" && statusFilter === s && "bg-yellow-600"}
                    `}
                  >
                    {s === "all" ? "All" : s.replace("_", " ")}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {isLoading && <TableSkeleton />}

          {!isLoading && outlines.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-white/30 bg-white/5 backdrop-blur p-20 text-center">
              <FileText className="h-20 w-20 text-white/50 mx-auto mb-8" />
              <h3 className="text-3xl font-bold mb-4">No outlines found</h3>
              <p className="text-xl opacity-70 max-w-md mx-auto mb-10">
                {scopeFilter === "all" && statusFilter === "all"
                  ? "Start by creating your first outline"
                  : "Try adjusting your filters"}
              </p>
              <Button size="lg" className="text-lg px-8 py-6" onClick={() => setShowCreateForm(true)}>
                <Plus className="h-6 w-6 mr-3" />
                Create Your First Outline
              </Button>
            </div>
          )}

          {!isLoading && outlines.length > 0 && (
            <div className="rounded-2xl border border-white/20 bg-white/5 backdrop-blur shadow-2xl overflow-hidden">
              <OutlineTableCompact
                data={outlines}
                onDelete={handleDeleteOutline}
                onUpdateOutline={handleUpdateOutline}
                onAssignReviewer={handleAssignReviewer}
                isLoading={false}
                currentUserRole={currentMemberRole || ""}
                currentUserId={session?.user?.id || ""} organizationMembers={organizationMembers}
                organizationId={currentOrganizationId || ""}
              />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}