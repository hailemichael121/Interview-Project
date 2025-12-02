// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggler } from "@/components/theme-toggler";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Bell,
  Globe,
  Lock,
  Mail,
  Shield,
  Trash,
  Download,
  User,
  Building,
  Loader2,
  Users,
  FileText,
} from "lucide-react";
import { useAuth } from "@/hooks/use-session";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";

interface UserProfileData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tenantId: string | null;
  banned: boolean;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  memberships?: Array<{
    memberId: string;
    role: string;
    joinedAt: string;
    organization: {
      id: string;
      name: string;
      slug: string;
      createdAt: string;
      updatedAt: string;
      _count: {
        members: number;
        outlines: number;
      };
    };
  }>;
  stats?: {
    totalOrganizations: number;
    pendingInvitations: number;
    assignedOutlines: number;
  };
}

export default function SettingsPage() {
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyDigest: false,
    compactMode: false,
  });

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const response = await apiService.user.getProfile();
        
        if (response.success && response.data) {
          setProfileData(response.data);
          setFormData({
            name: response.data.name || "",
            email: response.data.email,
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async () => {
    if (!profileData) return;

    try {
      setIsSaving(true);
      const updateData = {
        name: formData.name,
        email: formData.email,
      };

      const response = await apiService.user.updateProfile(updateData);
      
      if (response.success) {
        setProfileData(response.data);
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle preference changes
  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    toast.success("Preference updated");
  };

  // Handle workspace deletion
  const handleDeleteWorkspace = async (orgId: string, orgName: string) => {
    if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      // You would need to add a delete organization endpoint
      toast.error("Organization deletion not implemented yet");
    } catch (error) {
      console.error("Error deleting organization:", error);
      toast.error("Failed to delete organization");
    }
  };

  // Get initials for avatar
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-5xl px-4 py-8 lg:px-8">
          <div className="flex items-center justify-center h-96">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !profileData) {
    return (
      <DashboardLayout>
        <div className="container mx-auto max-w-5xl px-4 py-8 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground">No user data found</h2>
            <p className="mt-2 text-muted-foreground">Please sign in to view settings</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-foreground">Settings</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Manage your workspace, preferences, and security.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Account Overview */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-5 w-5" />
                Account Overview
              </CardTitle>
              <CardDescription>
                Member since {formatDate(profileData.createdAt)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24 border-2">
                  {profileData.image ? (
                    <AvatarImage src={profileData.image} alt={profileData.name || "User"} />
                  ) : null}
                  <AvatarFallback className="text-2xl font-semibold">
                    {getInitials(profileData.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge variant={profileData.role === "OWNER" || profileData.role === "ADMIN" ? "default" : "secondary"}>
                      {profileData.role}
                    </Badge>
                    <Badge variant={profileData.emailVerified ? "default" : "outline"}>
                      {profileData.emailVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">User ID</p>
                      <p className="font-mono text-sm">{profileData.id.substring(0, 16)}...</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                      <p className="text-sm">{profileData.banned ? "Banned" : "Active"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                  {!profileData.emailVerified && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Email not verified
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  onClick={handleProfileUpdate} 
                  disabled={isSaving}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Workspaces */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="h-5 w-5" />
                Workspaces ({profileData.memberships?.length || 0})
              </CardTitle>
              <CardDescription>
                Organizations you&apos;re a member of
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {profileData.memberships && profileData.memberships.length > 0 ? (
                <div className="space-y-4">
                  {profileData.memberships.map((membership) => (
                    <div key={membership.organization.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{membership.organization.name}</h3>
                            <Badge variant={membership.role === "OWNER" ? "default" : "secondary"}>
                              {membership.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Slug: {membership.organization.slug} • Created: {formatDate(membership.organization.createdAt)}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {membership.organization._count.members} member(s)
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-4 w-4" />
                              {membership.organization._count.outlines} outline(s)
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWorkspace(membership.organization.id, membership.organization.name)}
                          disabled={membership.role !== "OWNER"}
                          title={membership.role !== "OWNER" ? "Only owners can delete organizations" : "Delete organization"}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">You&apos;re not a member of any organizations yet</p>
                  <Button variant="outline" className="mt-4">
                    <Building className="mr-2 h-4 w-4" />
                    Create Organization
                  </Button>
                </div>
              )}
              <Separator />
              <div className="text-sm text-muted-foreground">
                <p>Total organizations: {profileData.stats?.totalOrganizations || 0}</p>
                <p>Pending invitations: {profileData.stats?.pendingInvitations || 0}</p>
                <p>Assigned outlines: {profileData.stats?.assignedOutlines || 0}</p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred interface theme
                  </p>
                </div>
                <ThemeToggler />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Use smaller spacing for more content
                  </p>
                </div>
                <Switch
                  checked={preferences.compactMode}
                  onCheckedChange={(checked) => handlePreferenceChange("compactMode", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive updates about your projects
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">
                    Summary of activity every Monday
                  </p>
                </div>
                <Switch
                  checked={preferences.weeklyDigest}
                  onCheckedChange={(checked) => handlePreferenceChange("weeklyDigest", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lock className="h-5 w-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="mr-3 h-4 w-4" />
                Change Password
              </Button>
              {!profileData.emailVerified && (
                <Button variant="outline" className="w-full justify-start">
                  <Mail className="mr-3 h-4 w-4" />
                  Verify Email Address
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-3 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
              <Separator />
              <Button 
                variant="destructive" 
                className="w-full justify-start"
                onClick={() => {
                  if (confirm("Are you sure you want to sign out?")) {
                    signOut();
                  }
                }}
              >
                <Lock className="mr-3 h-4 w-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border border-red-200 dark:border-red-900/30">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">
                Danger Zone
              </CardTitle>
              <CardDescription>
                Irreversible actions that will permanently delete data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    if (confirm("Are you absolutely sure? This will permanently delete your account and all associated data.")) {
                      toast.error("Account deletion not implemented yet");
                    }
                  }}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-muted-foreground">
                    Download all your data in JSON format
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // You would implement data export here
                    toast.success("Data export feature coming soon");
                  }}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}