// app/team/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Users, Loader2, RefreshCw } from "lucide-react";
import { useOrganizationContext } from "@/hooks/use-session";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";
import { OrganizationMember, ApiInvitation } from "@/types/types";

// Import reusable components
import { TeamMembersTable } from "@/components/team/team-members-table";
import { InvitationsTable, TableInvitation } from "@/components/team/invitations-table";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { TeamStats } from "@/components/team/team-stats";

export default function TeamPage() {
  const {
    currentOrganizationId,
    currentMemberRole,
    hasOrganization,
    isLoading: orgLoading,
  } = useOrganizationContext();

  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invitations, setInvitations] = useState<TableInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isOwner = currentMemberRole === "OWNER";

  const fetchTeamData = useCallback(async (showToast = false) => {
    if (!currentOrganizationId) {
      setIsLoading(false);
      return;
    }

    try {
      if (showToast) {
        setRefreshing(true);
      }

      const [membersRes, invitesRes] = await Promise.all([
        apiService.organization.listMembers(currentOrganizationId, 1, 100),
        isOwner
          ? apiService.invitation.getPendingInvitations()
          : Promise.resolve({ success: true, data: [] as ApiInvitation[] }),
      ]);

      if (membersRes.success) {
        setMembers(membersRes.data || []);
      } else {
        toast.error("Failed to load team members");
      }

      if (invitesRes?.success) {
        // Transform ApiInvitation to TableInvitation
        const transformedInvitations: TableInvitation[] = (invitesRes.data || []).map((inv: ApiInvitation) => {
          // Extract properties from the invitation object
          const organizationId = inv.organization?.id || "";
          const email = inv.email || "";
          
          return {
            id: inv.id,
            email: email,
            role: inv.role,
            status: "PENDING", // Assuming pending since we're fetching pending invitations
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days from now
            createdAt: new Date().toISOString(), // Use current date since ApiInvitation doesn't have createdAt
            organizationId: organizationId,
            organization: inv.organization,
          };
        });
        setInvitations(transformedInvitations);
      }

      if (showToast) {
        toast.success("Team data refreshed");
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast.error("Failed to load team data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentOrganizationId, isOwner]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const handleInviteMember = async (email: string, role: "MEMBER" | "OWNER"): Promise<void> => {
    if (!currentOrganizationId) return;

    setIsInviting(true);
    try {
      const res = await apiService.organization.inviteMember(
        currentOrganizationId,
        { email, role }
      );

      if (res.success) {
        toast.success(`Invitation sent to ${email}`);
        fetchTeamData();
        setIsInviteDialogOpen(false);
      } else {
        toast.error(res.message || "Failed to send invitation");
      }
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeMember = async (memberId: string, name: string): Promise<void> => {
    if (!currentOrganizationId) return;

    try {
      const res = await apiService.organization.revokeMember(
        currentOrganizationId,
        memberId
      );

      if (res.success) {
        toast.success(`Member ${name} removed successfully`);
        fetchTeamData();
      } else {
        toast.error(res.message || "Failed to remove member");
      }
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleResendInvitation = async (): Promise<void> => {
    toast.loading("Resending invitation...");
    // TODO: Backend doesn't have resend endpoint yet
    setTimeout(() => {
      toast.error("Resend feature coming soon");
    }, 1000);
  };

  const handleCancelInvitation = async (): Promise<void> => {
    toast.loading("Cancelling invitation...");
    // TODO: Backend doesn't have cancel endpoint yet
    setTimeout(() => {
      toast.error("Cancel feature coming soon");
    }, 1000);
  };

  const handleRefresh = () => {
    fetchTeamData(true);
  };

  // Loading states
  if (!hasOrganization && !orgLoading) {
    return (
      <DashboardLayout>
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Workspace Selected</h2>
            <p className="text-muted-foreground">
              Select or create an organization to manage team
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (orgLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="container py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading team...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold">Team Management</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage organization members and invitations
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

            {isOwner && (
              <InviteMemberDialog
                isOpen={isInviteDialogOpen}
                onOpenChange={setIsInviteDialogOpen}
                onInvite={handleInviteMember}
                isLoading={isInviting}
                trigger={
                  <Button>
                    <Users className="mr-2 h-4 w-4" />
                    Invite Member
                  </Button>
                }
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <TeamStats members={members} invitations={invitations} />

        {/* Members Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members ({members.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <TeamMembersTable
              members={members}
              onRevokeMember={handleRevokeMember}
              isLoading={isLoading}
              isOwner={isOwner}
            />
          </CardContent>
        </Card>

        {/* Pending Invitations (Owner Only) */}
        {isOwner && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <InvitationsTable
                invitations={invitations}
                isLoading={isLoading}
                onResend={() => handleResendInvitation()}
                onCancel={() => handleCancelInvitation()}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}