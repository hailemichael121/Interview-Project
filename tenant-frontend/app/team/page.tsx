// app/team/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Users,
  UserPlus,
  Crown,
  Mail,
  Trash,
  User,
  Shield,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useOrganizationContext } from "@/hooks/use-session";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";
import { format } from "date-fns";
import type { OrganizationMember, ApiInvitation } from "@/lib/types";

interface TeamMember extends OrganizationMember {
  status?: "ACTIVE" | "PENDING" | "INACTIVE";
}

export default function TeamPage() {
  const {
    currentOrganizationId,
    currentMemberRole,
    hasOrganization,
    isLoading: orgLoading,
  } = useOrganizationContext();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<ApiInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "MEMBER" as "MEMBER" | "OWNER",
  });

  const isOwner = currentMemberRole === "OWNER";

  const fetchTeamData = async () => {
    if (!currentOrganizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const [membersRes, invitesRes] = await Promise.all([
        apiService.organization.listMembers(currentOrganizationId, 1, 100),
        isOwner
          ? apiService.invitation.getPendingInvitations()
          : Promise.resolve(null),
      ]);

      if (membersRes.success) {
        const safeMembers: TeamMember[] = membersRes.data.map((m) => ({
          ...m,
          user: m.user || {
            id: "",
            name: null,
            email: "unknown@deleted.com",
            image: null,
            createdAt: new Date().toISOString(),
          },
          status: "ACTIVE",
        }));
        setMembers(safeMembers);
      }

      if (isOwner && invitesRes?.success) {
        setInvitations(invitesRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching team data:", error);
      toast.error("Failed to load team data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [currentOrganizationId, isOwner]);

  const handleInviteMember = async () => {
    if (!currentOrganizationId) return;

    if (!inviteForm.email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }

    setIsLoadingInvite(true);
    try {
      const res = await apiService.organization.inviteMember(
        currentOrganizationId,
        {
          email: inviteForm.email,
          role: inviteForm.role,
        }
      );

      if (res.success) {
        toast.success(`Invitation sent to ${inviteForm.email}`);
        setInviteForm({ email: "", role: "MEMBER" });
        setIsInviteDialogOpen(false);
        fetchTeamData();
      }
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setIsLoadingInvite(false);
    }
  };

  const handleRevokeMember = async (memberId: string, name: string) => {
    if (!isOwner || !currentOrganizationId) return;
    if (!confirm(`Remove ${name} from the team?`)) return;

    try {
      const res = await apiService.organization.revokeMember(
        currentOrganizationId,
        memberId
      );
      if (res.success) {
        toast.success("Member removed");
        fetchTeamData();
      }
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const getInitials = (
    name: string | null | undefined,
    email: string | null | undefined
  ) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : email?.slice(0, 2).toUpperCase();

  const getRoleBadge = (role: string) => {
    const config: Record<string, { color: string; icon: React.ElementType }> = {
      OWNER: {
        color: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
        icon: Crown,
      },
      REVIEWER: {
        color: "bg-blue-500/20 text-blue-700 dark:text-blue-400",
        icon: Shield,
      },
      MEMBER: {
        color: "bg-gray-500/20 text-gray-700 dark:text-gray-400",
        icon: User,
      },
    };
    const { color, icon: Icon } = config[role] || config.MEMBER;
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {role}
      </Badge>
    );
  };

  // Loading states
  if (!hasOrganization && !orgLoading) {
    return (
      <DashboardLayout>
        <div className="container py-20 text-center">
          <Users className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">No Workspace Selected</h2>
          <p className="text-muted-foreground">
            Select or create an organization to manage team
          </p>
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

  const totalMembers = members.length;
  const ownersCount = members.filter((m) => m.role === "OWNER").length;

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold">Team</h1>
            <p className="text-lg text-muted-foreground mt-2">
              Manage members and invitations
            </p>
          </div>

          {isOwner && (
            <Dialog
              open={isInviteDialogOpen}
              onOpenChange={setIsInviteDialogOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite Member
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Member</DialogTitle>
                  <DialogDescription>
                    Send an invitation to join your organization
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) =>
                        setInviteForm({ ...inviteForm, email: e.target.value })
                      }
                      placeholder="colleague@example.com"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select
                      value={inviteForm.role}
                      onValueChange={(v: "MEMBER" | "OWNER") =>
                        setInviteForm({ ...inviteForm, role: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MEMBER">Member</SelectItem>
                        <SelectItem value="OWNER">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsInviteDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleInviteMember}
                    disabled={isLoadingInvite}
                  >
                    {isLoadingInvite ? "Sending..." : "Send Invite"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Owners</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ownersCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pending Invites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{invitations.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Team Members</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchTeamData}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  {isOwner && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={m.user?.image || ""} />
                          <AvatarFallback>
                            {getInitials(m.user?.name, m.user?.email)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">
                            {m.user?.name || m.user?.email}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {m.user?.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(m.role)}</TableCell>
                    <TableCell>
                      {format(new Date(m.joinedAt), "MMM d, yyyy")}
                    </TableCell>
                    {isOwner && m.role !== "OWNER" && (
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() =>
                            handleRevokeMember(
                              m.id,
                              m.user?.name || m.user?.email || "Unknown Member"
                            )
                          }
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Invitations */}
        {isOwner && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invitations.map((inv) => (
                    <TableRow key={inv.id}>
                      <TableCell>{inv.email || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{inv.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(inv.expires), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toast.success("Resend coming soon")}
                        >
                          Resend
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => toast.error("Cancel coming soon")}
                        >
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
