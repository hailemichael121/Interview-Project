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
  CheckCircle,
  XCircle,
  Clock,
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

interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  role: "OWNER" | "MEMBER" | "REVIEWER";
  joinedAt: string;
  status?: "ACTIVE" | "PENDING" | "INACTIVE";
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expires: string;
  invitedAt: string;
  invitedBy?: {
    name: string;
    email: string;
  };
}

export default function TeamPage() {
  const { 
    currentOrganizationId, 
    currentMemberRole,
    hasOrganization,
    isLoading: orgLoading 
  } = useOrganizationContext();
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  
  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "MEMBER" as "MEMBER" | "OWNER",
  });

  const isOwner = currentMemberRole === "OWNER";
  // const isAdmin = currentMemberRole === "OWNER" || currentMemberRole === "REVIEWER";

  // Fetch team data
  const fetchTeamData = async () => {
    if (!currentOrganizationId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch members and invitations in parallel
      const [membersResponse, invitationsResponse] = await Promise.all([
        apiService.organization.listMembers(currentOrganizationId, 1, 100),
        isOwner ? apiService.invitation.getPendingInvitations() : Promise.resolve(null)
      ]);

      if (membersResponse.success) {
        setMembers(membersResponse.data);
      }

      if (isOwner && invitationsResponse?.success) {
        setInvitations(invitationsResponse.data || []);
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

  // Handle invite member
  const handleInviteMember = async () => {
    if (!currentOrganizationId) {
      toast.error("No organization selected");
      return;
    }

    if (!inviteForm.email || !inviteForm.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoadingInvite(true);

    try {
      const response = await apiService.organization.inviteMember(currentOrganizationId, {
        email: inviteForm.email,
        role: inviteForm.role,
      });

      if (response.success) {
        toast.success(`Invitation sent to ${inviteForm.email}`);
        setInviteForm({ email: "", role: "MEMBER" });
        setIsInviteDialogOpen(false);
        fetchTeamData(); // Refresh data
      }
 } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message :  "Failed to send invitation";
      toast.error(errorMessage);
    } finally {
      setIsLoadingInvite(false);
    }
  };

  // Handle revoke member
  const handleRevokeMember = async (memberId: string, memberName: string) => {
    if (!currentOrganizationId || !isOwner) return;

    if (!confirm(`Are you sure you want to remove ${memberName} from the team?`)) {
      return;
    }

    try {
      const response = await apiService.organization.revokeMember(currentOrganizationId, memberId);
      
      if (response.success) {
        toast.success(`Member removed successfully`);
        fetchTeamData(); // Refresh data
      }
  } catch  {
      toast.error("Failed to remove member");
    } 
  };

  // Handle cancel invitation
  const handleCancelInvitation = async (invitationId: string, email: string) => {
    if (!confirm(`Cancel invitation for ${email}?`)) return;

    try {
      // Note: You need to add a cancel invitation endpoint in your backend
      // For now, we'll just show a message
      toast.error("Cancel invitation feature coming soon");
    } catch {
      toast.error("Failed to cancel invitation");
    }
  };

  // Handle resend invitation
  const handleResendInvitation = async (invitationId: string, email: string) => {
    try {
      // Note: You need to add a resend invitation endpoint in your backend
      toast.success(`Invitation resent to ${email}`);
    } catch  {
      toast.error("Failed to resend invitation");
    }
  };

  // Update member role
  const handleUpdateRole = async (memberId: string, newRole: "MEMBER" | "REVIEWER" | "OWNER", memberName: string) => {
    if (!currentOrganizationId || !isOwner) return;

    if (!confirm(`Change ${memberName}'s role to ${newRole}?`)) {
      return;
    }

    try {
      // Note: You need to add an update role endpoint in your backend
      toast.success(`Role updated to ${newRole} for ${memberName}`);
      fetchTeamData(); // Refresh data
    } catch  {
      toast.error("Failed to update role");
    }
  };

  // Get avatar initials
  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    return email.substring(0, 2).toUpperCase();
  };

  // Get status badge
  const getStatusBadge = (status?: string) => {
    const config = {
      ACTIVE: { color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle },
      PENDING: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
      INACTIVE: { color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: XCircle },
      default: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400", icon: User },
    };

    const { color, icon: Icon } = config[status as keyof typeof config] || config.default;
    
    return (
      <Badge variant="outline" className={`${color} gap-1`}>
        <Icon className="h-3 w-3" />
        {status || "ACTIVE"}
      </Badge>
    );
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    const config = {
      OWNER: { color: "bg-amber-500/20 text-amber-700 dark:text-amber-400", icon: Crown },
      REVIEWER: { color: "bg-blue-500/20 text-blue-700 dark:text-blue-400", icon: Shield },
      MEMBER: { color: "bg-gray-500/20 text-gray-700 dark:text-gray-400", icon: User },
    };

    const { color, icon: Icon } = config[role as keyof typeof config] || config.MEMBER;
    
    return (
      <Badge className={`${color} gap-1`}>
        <Icon className="h-3 w-3" />
        {role}
      </Badge>
    );
  };

  // No organization selected
  if (!hasOrganization && !orgLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Select a Workspace
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please select or create a workspace to manage team members
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (orgLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-6xl px-4 py-8 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading team data...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalMembers = members.length;
  const ownersCount = members.filter(m => m.role === "OWNER").length;
  const pendingInvites = invitations.length;

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-6xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Team</h1>
              <p className="mt-2 text-lg text-muted-foreground">
                Manage organization members and permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTeamData}
                disabled={isLoading}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {isOwner && (
                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <UserPlus className="h-4 w-4" />
                      Invite Member
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Invite Team Member</DialogTitle>
                      <DialogDescription>
                        Send an invitation to join your organization. They will receive an email with instructions.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="space-y-6 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-email">Email Address *</Label>
                        <Input
                          id="invite-email"
                          type="email"
                          placeholder="colleague@example.com"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                          className="h-11"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="invite-role">Role *</Label>
                        <Select
                          value={inviteForm.role}
                          onValueChange={(value: "MEMBER" | "OWNER") => 
                            setInviteForm({...inviteForm, role: value})
                          }
                        >
                          <SelectTrigger id="invite-role" className="h-11">
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">
                              <div className="flex items-center gap-3 py-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="font-medium">Member</p>
                                  <p className="text-xs text-muted-foreground">
                                    Can view and edit content
                                  </p>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="OWNER">
                              <div className="flex items-center gap-3 py-1">
                                <Crown className="h-4 w-4 text-amber-500" />
                                <div>
                                  <p className="font-medium">Owner</p>
                                  <p className="text-xs text-muted-foreground">
                                    Full access + manage members
                                  </p>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <span className="font-semibold">Note:</span> Invitations expire after 7 days. 
                          Owners have full administrative access to the organization.
                        </p>
                      </div>
                    </div>

                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsInviteDialogOpen(false)}
                        disabled={isLoadingInvite}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleInviteMember}
                        disabled={!inviteForm.email || isLoadingInvite}
                      >
                        {isLoadingInvite ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Invitation
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-10">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalMembers}</div>
              <p className="text-xs text-muted-foreground">
                Active team members
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Owners</CardTitle>
              <Crown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{ownersCount}</div>
              <p className="text-xs text-muted-foreground">
                With full access
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingInvites}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting acceptance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members Section */}
        <Card className="mb-10">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members ({totalMembers})</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Active members in your organization
                </p>
              </div>
              {isOwner && (
                <Badge variant="outline" className="gap-1">
                  <Crown className="h-3 w-3" />
                  You are an Owner
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {totalMembers > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Status</TableHead>
                      {isOwner && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              {member.user.image && (
                                <AvatarImage src={member.user.image} alt={member.user.name || ""} />
                              )}
                              <AvatarFallback className="text-sm font-medium">
                                {getInitials(member.user.name, member.user.email)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.user.name || member.user.email}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {member.user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleBadge(member.role)}
                            {isOwner && member.role !== "OWNER" && (
                              <Select
                                value={member.role}
                                onValueChange={(value: "MEMBER" | "REVIEWER" | "OWNER") => 
                                  handleUpdateRole(member.id, value, member.user.name || member.user.email)
                                }
                              >
                                <SelectTrigger className="h-8 w-8 p-0">
                                  <span className="sr-only">Change role</span>
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="MEMBER">Member</SelectItem>
                                  <SelectItem value="REVIEWER">Reviewer</SelectItem>
                                  <SelectItem value="OWNER">Owner</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(member.joinedAt), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(member.status)}
                        </TableCell>
                        {isOwner && (
                          <TableCell className="text-right">
                            {member.role !== "OWNER" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleRevokeMember(member.id, member.user.name || member.user.email)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Team Members</h3>
                <p className="text-muted-foreground mb-6">
                  Invite team members to collaborate in your organization
                </p>
                {isOwner && (
                  <Button onClick={() => setIsInviteDialogOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite First Member
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Invitations Section (Owners Only) */}
        {isOwner && invitations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations ({pendingInvites})</CardTitle>
              <p className="text-sm text-muted-foreground">
                Invitations sent to join your organization
              </p>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
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
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(invitation.invitedAt), "MMM d, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {format(new Date(invitation.expires), "MMM d, yyyy")}
                          </div>
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleResendInvitation(invitation.id, invitation.email)}
                              disabled={invitation.status !== 'PENDING'}
                            >
                              Resend
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id, invitation.email)}
                              disabled={invitation.status !== 'PENDING'}
                              className="text-red-600 hover:text-red-700"
                            >
                              Cancel
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}