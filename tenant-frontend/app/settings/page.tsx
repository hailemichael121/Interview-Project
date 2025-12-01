// app/settings/page.tsx
"use client";

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggler } from "@/components/theme-toggler";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import {
  Bell,
  Globe,
  Lock,
  Mail,
  Shield,
  Trash2,
  Download,
  User,
  Building,
} from "lucide-react";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-5xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">
            Settings
          </h1>
          <p className="mt-2 text-lg text-[hsl(var(--muted-foreground))]">
            Manage your workspace, preferences, and security.
          </p>
        </div>

        <div className="grid gap-8">
          {/* Workspace */}
          <Card className="border-light-300 bg-[hsl(var(--card))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Building className="h-5 w-5" />
                Workspace
              </CardTitle>
              <CardDescription>Acme Inc • Enterprise Plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Workspace Name</Label>
                  <Input defaultValue="Acme Inc" className="max-w-sm" />
                </div>
                <Badge variant="secondary">Owner</Badge>
              </div>
              <Separator />
              <div className="flex justify-end gap-3">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export Data
                </Button>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Workspace
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Profile */}
          <Card className="border-light-300 bg-[hsl(var(--card))]">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 border-2 border-light-300">
                  <AvatarFallback className="text-2xl font-semibold">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">Change Photo</Button>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    JPG, PNG or GIF. Max 2MB.
                  </p>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input defaultValue="john.doe@acme.com" type="email" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card className="border-light-300 bg-[hsl(var(--card))]">
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
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Select your preferred interface theme
                  </p>
                </div>
                <ThemeToggler />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Compact Mode</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Use smaller spacing for more content
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="border-light-300 bg-[hsl(var(--card))]">
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
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Receive updates about your projects
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Summary of activity every Monday
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card className="border-light-300 bg-[hsl(var(--card))]">
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
              <Button variant="outline" className="w-full justify-start">
                <Mail className="mr-3 h-4 w-4" />
                Enable Two-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
