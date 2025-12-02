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
  Shield,
  Trash,
  User,
  Building,
  Loader2,
  Users,
  FileText,
} from "lucide-react";
import authClient from "@/lib/auth-client";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";

import type { UserProfile } from "@/types/types";

export default function SettingsPage() {
  const { data: user, isPending: authLoading } = authClient.useSession();
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({ name: "", email: "" });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    weeklyDigest: false,
    compactMode: false,
  });

  // Load profile
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setIsLoading(true);
        const res = await apiService.user.getProfile();
        if (res.success && res.data) {
          setProfileData(res.data);
          setFormData({ name: res.data.name || "", email: res.data.email });
        }
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [user]);

  // Save profile
  const handleSaveProfile = async () => {
    if (!profileData) return;

    try {
      setIsSaving(true);
      const response = await apiService.user.updateProfile({
        // Fixed: use undefined instead of null
        name: formData.name.trim() === "" ? undefined : formData.name,
      });

      if (response.success && response.data) {
        setProfileData(response.data);
        toast.success("Profile updated");
      }
    } catch (err) {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const togglePref = (key: keyof typeof preferences) => {
    setPreferences((p) => ({ ...p, [key]: !p[key] }));
    toast.success("Preference saved");
  };

  const getInitials = (name: string | null) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "U";

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  // Loading / no user
  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!user || !profileData) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
          Please sign in to view settings
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">
            Manage your account and preferences
          </p>
        </div>

        {/* Account Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>
              Member since {formatDate(profileData.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profileData.image || ""} />
                <AvatarFallback>{getInitials(profileData.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Badge variant="secondary">{profileData.role}</Badge>
                  <Badge
                    variant={profileData.emailVerified ? "default" : "outline"}
                  >
                    {profileData.emailVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>ID: {profileData.id.slice(0, 12)}...</p>
                  <p>Status: {profileData.banned ? "Banned" : "Active"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Edit */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} disabled />
              </div>
            </div>
            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Workspaces */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Workspaces ({profileData.memberships?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {profileData.memberships?.length ? (
              <div className="space-y-4">
                {profileData.memberships.map((m) => (
                  <div
                    key={m.memberId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-medium">{m.organization.name}</h3>
                        <Badge
                          variant={m.role === "OWNER" ? "default" : "secondary"}
                        >
                          {m.role}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {m.organization.slug} • Joined {formatDate(m.joinedAt)}
                      </p>
                      {m.organization._count && (
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {m.organization._count.members} members
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {m.organization._count.outlines} outlines
                          </span>
                        </div>
                      )}
                    </div>
                    {m.role === "OWNER" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          confirm(`Delete "${m.organization.name}"?`) &&
                          toast.error("Not implemented")
                        }
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No workspaces yet
              </p>
            )}
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Light / Dark mode
                </p>
              </div>
              <ThemeToggler />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Compact Mode</p>
                <p className="text-sm text-muted-foreground">Reduced spacing</p>
              </div>
              <Switch
                checked={preferences.compactMode}
                onCheckedChange={() => togglePref("compactMode")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Updates</p>
                <p className="text-sm text-muted-foreground">
                  Project activity alerts
                </p>
              </div>
              <Switch
                checked={preferences.emailNotifications}
                onCheckedChange={() => togglePref("emailNotifications")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => authClient.signOut()}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
