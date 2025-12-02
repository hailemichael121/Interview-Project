// app/dashboard/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useOrganizationContext } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Building, 
  Plus, 
  Users, 
  FileText, 
  BarChart, 
  Clock, 
  Loader2, 
  Mail,
  Shield,
  Target,
  TrendingUp,
  Bell,
  RefreshCw,
  UserPlus,
  Eye,
  XCircle,
  CheckSquare
} from "lucide-react";
import Link from "next/link";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
// In app/dashboard/page.tsx, update the imports:
import { 
  DashboardStats, 
  Member, 
  Invitation, 
  Outline, 
  OutlineListResponse,
} from "@/lib/types";

type ActivityOutline = {
  id: string;
  header: string;
  status: string;
  sectionType: string;
  reviewer?: {
    name: string;
  };
  createdAt: string;
};
export default function DashboardPage() {
  const { 
    currentOrganizationId, 
    currentMemberRole, 
    organizationMemberships,
    hasOrganization,
    isLoading: orgLoading 
  } = useOrganizationContext();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<ActivityOutline[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const currentOrganization = organizationMemberships.find(
    membership => membership.organizationId === currentOrganizationId
  );

  const isOwner = currentMemberRole === "OWNER";

  const fetchDashboardData = useCallback(async () => {
    if (!currentOrganizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setRefreshing(true);
      
      const [
        statsResponse,
        outlinesResponse,
        membersResponse,
        invitationsResponse
      ] = await Promise.all([
        apiService.outline.getOrganizationStats(currentOrganizationId),
        apiService.outline.listOutlines(currentOrganizationId, 1, 5),
        apiService.organization.listMembers(currentOrganizationId, 1, 100),
        isOwner ? apiService.invitation.getPendingInvitations() : Promise.resolve({ success: false, data: [] })
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (outlinesResponse.success) {
        const responseData = outlinesResponse.data as OutlineListResponse;
        const outlinesData = 'data' in responseData ? responseData.data : responseData;
        const activityOutlines: ActivityOutline[] = outlinesData.map((outline: Outline) => ({
          id: outline.id,
          header: outline.header || "",
          status: outline.status || "DRAFT",
          sectionType: outline.sectionType || "",
          reviewer: outline.reviewer,
          createdAt: outline.createdAt || new Date().toISOString()
        }));
        setRecentActivity(activityOutlines);
      }

      if (membersResponse.success) {
        const membersData = membersResponse.data;
        const transformedMembers: Member[] = membersData.map((member: any) => ({
          id: member.id,
          user: member.user || {
            id: member.userId || member.id,
            name: null,
            email: "",
            image: null
          },
          role: member.role,
          joinedAt: member.joinedAt
        }));
        setMembers(transformedMembers);
      }

      if (isOwner && invitationsResponse?.success) {
        const invitationsData = invitationsResponse.data || [];
        const transformedInvitations: Invitation[] = invitationsData.map((inv: any) => ({
          id: inv.id,
          email: inv.email || "",
          organization: inv.organization,
          role: inv.role,
          status: (inv.status || 'PENDING') as 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED',
          expires: inv.expires,
          token: inv.token || "",
          invitedAt: inv.invitedAt || ""
        }));
        setInvitations(transformedInvitations);
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to load dashboard data";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [currentOrganizationId, isOwner]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); 

  const handleRefresh = () => {
    fetchDashboardData();
    toast.success("Dashboard refreshed");
  };

  const handleResendInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Resend invitation to ${email}?`)) return;
    
    try {
      toast.loading("Resending invitation...");
      // Note: You'll need to add a resend endpoint in your backend
      toast.error("Resend feature coming soon");
    } catch (error) {
      toast.error("Failed to resend invitation");
    }
  };

  const handleRevokeInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Revoke invitation for ${email}?`)) return;
    
    try {
      toast.loading("Revoking invitation...");
      // Note: You'll need to add a revoke endpoint in your backend
      toast.error("Revoke feature coming soon");
    } catch (error) {
      toast.error("Failed to revoke invitation");
    }
  };

  // No organization selected
  if (!hasOrganization && !orgLoading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-linear-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <Building className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Welcome to Workspace!
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
            Start collaborating with your team by creating or joining an organization
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/organization/create">
              <Button className="gap-2 px-8 py-6 text-base">
                <Plus className="h-5 w-5" />
                Create New Workspace
              </Button>
            </Link>
            <Link href="/organization/join">
              <Button variant="outline" className="gap-2 px-8 py-6 text-base">
                <UserPlus className="h-5 w-5" />
                Join Existing Workspace
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orgLoading || isLoading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className="text-muted-foreground">Loading workspace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-muted-foreground">
              Welcome to {currentOrganization?.organization.name || "your"} workspace
            </p>
            {currentMemberRole && (
              <Badge variant={isOwner ? "default" : "secondary"} className="gap-1">
                {isOwner && <Shield className="h-3 w-3" />}
                {currentMemberRole}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
          {isOwner && (
            <Link href="/team/invite">
              <Button size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Invite Members
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Quick Stats Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" />
              Workspace Summary
            </CardTitle>
            {currentOrganization && (
              <Badge variant="outline" className="text-xs">
                {currentOrganization.organization.slug}
              </Badge>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Organizations</span>
                <span className="font-semibold">{organizationMemberships.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Team Members</span>
                <span className="font-semibold">{members.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Your Role</span>
                <Badge variant={isOwner ? "default" : "secondary"}>{currentMemberRole}</Badge>
              </div>
              {isOwner && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending Invites</span>
                  <span className="font-semibold">{invitations.length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Outline Statistics */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outlines</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOutlines || 0}</div>
            <div className="mt-2">
              <Progress value={stats?.completionRate || 0} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats?.completedOutlines || 0} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.inProgressOutlines || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingOutlines || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          {isOwner && <TabsTrigger value="invitations">Invitations</TabsTrigger>}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Quick Actions */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks for your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/outlines">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <FileText className="h-4 w-4" />
                    Manage Outlines
                  </Button>
                </Link>
                <Link href="/team">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Users className="h-4 w-4" />
                    Manage Team ({members.length})
                  </Button>
                </Link>
                {isOwner && (
                  <Link href="/team/invite">
                    <Button variant="outline" className="w-full justify-start gap-2">
                      <Mail className="h-4 w-4" />
                      Invite Members
                    </Button>
                  </Link>
                )}
                <Link href="/settings">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Shield className="h-4 w-4" />
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Recent Members */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Team Members ({members.length})
                </CardTitle>
                <CardDescription>Recent additions to your workspace</CardDescription>
              </CardHeader>
              <CardContent>
                {members.length > 0 ? (
                  <div className="space-y-3">
                    {members.slice(0, 5).map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            {member.user.image && (
                              <AvatarImage src={member.user.image} alt={member.user.name || ""} />
                            )}
                            <AvatarFallback>
                              {member.user.name?.charAt(0) || member.user.email.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {member.user.name || member.user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant={member.role === "OWNER" ? "default" : "secondary"}>
                                {member.role}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Joined: {new Date(member.joinedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {members.length > 5 && (
                      <div className="text-center">
                        <Link href="/team">
                          <Button variant="ghost" size="sm">
                            View All Members
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No team members yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest outlines and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.map((outline) => (
                    <div key={outline.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold">{outline.header}</h4>
                          <Badge variant={
                            outline.status === 'COMPLETED' 
                              ? 'default'
                              : outline.status === 'IN_PROGRESS'
                              ? 'secondary'
                              : 'outline'
                          }>
                            {outline.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {outline.sectionType.replace(/_/g, ' ')}
                          </span>
                          {outline.reviewer && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {outline.reviewer.name}
                            </span>
                          )}
                          <span>Created: {new Date(outline.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/outlines/${outline.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                  <div className="text-center">
                    <Link href="/outlines">
                      <Button>
                        <Eye className="mr-2 h-4 w-4" />
                        View All Outlines
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Activity Yet</h3>
                  <p className="text-muted-foreground mb-6">Create your first outline to get started</p>
                  <Link href="/outlines/create">
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Outline
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invitations Tab (Owner Only) */}
        {isOwner && (
          <TabsContent value="invitations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Pending Invitations ({invitations.length})
                </CardTitle>
                <CardDescription>Invitations sent to join this workspace</CardDescription>
              </CardHeader>
              <CardContent>
                {invitations.length > 0 ? (
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Expires</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {invitations.map((invitation) => (
                          <TableRow key={invitation.id}>
                            <TableCell className="font-medium">{invitation.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{invitation.role}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                                invitation.status === 'PENDING' ? 'outline' :
                                invitation.status === 'ACCEPTED' ? 'default' :
                                'destructive'
                              }>
                                {invitation.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(invitation.expires).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                                  disabled={invitation.status !== 'PENDING'}
                                >
                                  <Mail className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRevokeInvitation(invitation.id, invitation.email)}
                                  disabled={invitation.status !== 'PENDING'}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Pending Invitations</h3>
                    <p className="text-muted-foreground mb-6">
                      Invite team members to collaborate in your workspace
                    </p>
                    <Link href="/team/invite">
                      <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Invite Members
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Progress Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm font-bold">{stats?.completionRate ? Math.round(stats.completionRate) : 0}%</span>
                </div>
                <Progress value={stats?.completionRate || 0} className="h-2" />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-primary/5 rounded-lg">
                  <div className="text-2xl font-bold text-primary">{stats?.completedOutlines || 0}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center p-3 bg-secondary/5 rounded-lg">
                  <div className="text-2xl font-bold text-secondary">{stats?.inProgressOutlines || 0}</div>
                  <div className="text-sm text-muted-foreground">In Progress</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5" />
              Your Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organizationMemberships.map((membership) => (
                <div
                  key={membership.organizationId}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    membership.organizationId === currentOrganizationId
                      ? "bg-primary/5 border-primary/20"
                      : ""
                  }`}
                >
                  <div>
                    <p className="font-medium">{membership.organization.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={membership.role === "OWNER" ? "default" : "secondary"} >
                        {membership.role}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {membership.organization.slug}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}