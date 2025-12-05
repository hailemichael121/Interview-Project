// app/dashboard/page.tsx - FINAL CLEAN & BEAUTIFUL
"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { useOrganizationContext } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { toast } from "sonner";
import {
  Building, Plus, Users, FileText, Target, TrendingUp, Mail,
  Shield, RefreshCw, UserPlus, Eye, Loader2,
  Settings
} from "lucide-react";
import {
  useOutlines, useOrganizationMembers, useOrganizationStats,
  usePendingInvitations
} from "@/hooks/use-api-optimized";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

function DashboardContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);

  const {
    currentOrganizationId,
    currentMemberRole,
    currentOrganization,
    organizationMemberships,
    isLoading: orgLoading,
    hasOrganization,
    switchOrganization,
  } = useOrganizationContext();

  const orgId = currentOrganizationId || undefined;
  const isOwner = currentMemberRole === "OWNER";

  const { data: stats } = useOrganizationStats(orgId);
  const statsData = stats || { totalOutlines: 0, completedOutlines: 0, inProgressOutlines: 0, pendingOutlines: 0, completionRate: 0 }; const { data: outlines = { data: [] } } = useOutlines(orgId, 1, 5);
  const { data: members = { data: [] } } = useOrganizationMembers(orgId, 1, 5);
  const { data: invitations = [] } = usePendingInvitations();

  const pendingInvites = invitations.filter(i => i.organization?.id === currentOrganizationId);

  const handleRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    toast.success("Dashboard refreshed");
    setRefreshing(false);
  };

  const handleSwitchOrg = async (id: string) => {
    setRefreshing(true);
    try {
      await switchOrganization(id);
      queryClient.invalidateQueries();
    } catch {
      toast.error("Failed to switch");
    } finally {
      setRefreshing(false);
    }
  };

  const isLoading = orgLoading;

  if (!hasOrganization && !orgLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <Building className="h-16 w-16 text-primary mb-6" />
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Workspace</h1>
        <p className="text-muted-foreground mb-8 max-w-md">
          Create or join an organization to start collaborating
        </p>
        <div className="flex gap-4">
          <Link href="/organization/create">
            <Button size="lg"><Plus className="mr-2 h-5 w-5" /> Create Workspace</Button>
          </Link>
          <Link href="/organization/join">
            <Button variant="outline" size="lg"><UserPlus className="mr-2 h-5 w-5" /> Join</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentOrganizationId && hasOrganization) {
    return (
      <div className="p-8 text-center">
        <Building className="h-16 w-16 text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-bold mb-4">Select a Workspace</h2>
        <div className="max-w-md mx-auto space-y-3">
          {organizationMemberships.map(m => (
            <Card key={m.organizationId} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Building className="h-10 w-10 text-muted-foreground" />
                  <div className="text-left">
                    <p className="font-semibold">{m.organization.name}</p>
                    <Badge variant="secondary">{m.role}</Badge>
                  </div>
                </div>
                <Button onClick={() => handleSwitchOrg(m.organizationId)}>
                  Select
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">Loading workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-3 mt-2">
            <p className="text-lg text-muted-foreground">
              {currentOrganization?.name}
            </p>
            <Badge variant={isOwner ? "default" : "secondary"}>
              {isOwner && <Shield className="h-3 w-3 mr-1" />}
              {currentMemberRole}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          {isOwner && (
            <Link href={`/team/invite?org=${currentOrganizationId}`}>
              <Button size="sm"><Mail className="h-4 w-4 mr-2" /> Invite</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" /> Outlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{statsData.totalOutlines}</div>
            <Progress value={statsData.completionRate} className="mt-3 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" /> Team
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{members.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4" /> Completion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {statsData.completionRate ? `${Math.round(statsData.completionRate)}%` : "0%"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" /> Pending Invites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingInvites.length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="organizations">Workspaces</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" /> Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/outlines"><Button variant="outline" className="w-full justify-start"><FileText className="mr-2 h-4 w-4" /> Manage Outlines</Button></Link>
                <Link href="/team"><Button variant="outline" className="w-full justify-start"><Users className="mr-2 h-4 w-4" /> View Team</Button></Link>
                {isOwner && <Link href={`/team/invite?org=${currentOrganizationId}`}><Button variant="outline" className="w-full justify-start border-2"><Mail className="mr-2 h-4 w-4" /> Invite Members</Button></Link>}
                <Link href="/settings"><Button variant="outline" className="w-full justify-start"><Settings className="mr-2 h-4 w-4" /> Settings</Button></Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                {members.data?.length ? (
                  <div className="space-y-3">
                    {members.data.slice(0, 5).map(m => (
                      <div key={m.id} className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={m.user?.image || ""} />
                          <AvatarFallback>{m.user?.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{m.user?.name || m.user?.email}</p>
                          <Badge variant="outline" className="text-xs">{m.role}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No members yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader><CardTitle>Recent Outlines</CardTitle></CardHeader>
            <CardContent>
              {outlines.data.length ? (
                <div className="space-y-4">
                  {outlines.data.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{o.header}</p>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <Badge variant="outline">{o.status}</Badge>
                          <span>{o.sectionType?.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                      <Link href={`/outlines/${o.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-12 text-muted-foreground">No outlines yet</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations">
          <Card>
            <CardHeader><CardTitle>Your Workspaces</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {organizationMemberships.map(m => (
                <div key={m.organizationId} className={`flex items-center justify-between p-4 rounded-lg border ${m.organizationId === currentOrganizationId ? "border-primary bg-primary/5" : ""}`}>
                  <div>
                    <p className="font-medium">{m.organization.name}</p>
                    <Badge variant="outline" className="mt-1">{m.role}</Badge>
                  </div>
                  {m.organizationId === currentOrganizationId ? (
                    <Badge>Current</Badge>
                  ) : (
                    <Button size="sm" onClick={() => handleSwitchOrg(m.organizationId)}>Switch</Button>
                  )}
                </div>
              ))}
              <div className="flex gap-3 pt-4">
                <Link href="/organization/create"><Button variant="outline" className="flex-1"><Plus className="mr-2 h-4 w-4" /> New</Button></Link>
                <Link href="/organization/join"><Button variant="outline" className="flex-1"><UserPlus className="mr-2 h-4 w-4" /> Join</Button></Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute requireAuth requireOrganization>
      <DashboardContent />
    </ProtectedRoute>
  );
}