// components/sidebar.tsx - UPDATED
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Building,
  Plus,
  LogOut,
  User,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { apiService } from "@/lib/api-service";
import authClient from "@/lib/auth-client";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Outlines", href: "/outlines", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: session, isPending: authLoading } = authClient.useSession();
  const { resolvedTheme } = useTheme();

  const [organizations, setOrganizations] = React.useState<any[]>([]);
  const [currentOrg, setCurrentOrg] = React.useState<any | null>(null);
  const [profile, setProfile] = React.useState<any | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [switching, setSwitching] = React.useState(false);

  const logoSrc =
    resolvedTheme === "dark" ? "/tenant-dark.png" : "/tenant-light.png";

  // Load organizations & profile
  React.useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);

        const [orgRes, profileRes] = await Promise.all([
          apiService.organization.listUserOrganizations().catch(() => ({
            success: false,
            data: [],
          })),
          apiService.user.getProfile().catch(() => ({
            success: false,
            data: null,
          })),
        ]);

        if (orgRes.success && orgRes.data && orgRes.data.length > 0) {
          const orgs = orgRes.data;
          setOrganizations(orgs);

          // Find current org
          const current = orgs[0];
          setCurrentOrg(current);
        } else {
          // No organizations found
          setOrganizations([]);
          setCurrentOrg(null);
        }

        if (profileRes.success && profileRes.data) {
          setProfile(profileRes.data);
        } else {
          // Use session data as fallback
          setProfile({
            name: session.user?.name,
            email: session.user?.email,
            image: session.user?.image,
          });
        }
      } catch (error) {
        console.error("Failed to load sidebar data:", error);
        setOrganizations([]);
        setCurrentOrg(null);
        setProfile({
          name: session.user?.name,
          email: session.user?.email,
          image: session.user?.image,
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [session?.user]);

  // Switch organization
  const handleSwitchOrg = async (org: any) => {
    if (org.id === currentOrg?.id || switching) return;

    try {
      setSwitching(true);
      const res = await apiService.organization.switchOrganization(org.id);

      if (res.success) {
        setCurrentOrg(org);
        toast.success(`Switched to ${org.name}`);
        window.location.reload();
      }
    } catch {
      toast.error("Failed to switch organization");
    } finally {
      setSwitching(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="flex h-full flex-col bg-background">
        <div className="p-5 border-b border-border">
          <div className="h-12 bg-muted rounded-lg animate-pulse" />
        </div>
        <nav className="flex-1 space-y-2 p-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-11 bg-muted rounded-lg animate-pulse" />
          ))}
        </nav>
        <div className="border-t border-border p-4">
          <div className="h-14 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {/* Organization Switcher - Only show if there are organizations */}
      {currentOrg ? (
        <div className="p-5 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-accent"
                disabled={switching}
              >
                <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border">
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={160}
                    height={160}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="truncate text-sm font-semibold">
                    {currentOrg.name}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {currentOrg.role || "Member"}
                  </p>
                </div>
                {switching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="right"
              align="start"
              sideOffset={10}
              className="w-72 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border shadow-lg"
            >
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Your Organizations
              </DropdownMenuLabel>
              <div className="max-h-64 overflow-y-auto">
                {organizations.map((org) => {
                  const isActive = org.id === currentOrg.id;
                  return (
                    <DropdownMenuItem
                      key={org.id}
                      onSelect={() => handleSwitchOrg(org)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                        isActive && "bg-accent"
                      )}
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded border bg-accent/10">
                        <Building className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium truncate">
                          {org.name}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {org.role || "Member"}
                        </p>
                      </div>
                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-foreground/60" />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/organization/create"
                  className="flex items-center gap-3"
                >
                  <Plus className="h-4 w-4" />
                  Create Organization
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/organization/join"
                  className="flex items-center gap-3"
                >
                  <Users className="h-4 w-4" />
                  Join Organization
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        // Show create organization prompt if no orgs
        <div className="p-5 border-b border-border">
          <div className="text-center">
            <p className="text-sm font-medium mb-2">No Workspace</p>
            <p className="text-xs text-muted-foreground mb-4">
              Create or join a workspace to get started
            </p>
            <Link href="/organization/create">
              <Button
                size="sm"
                className="w-full border-2 border-dashed hover:border-primary hover:bg-foreground cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <div className="h-2 w-2 rounded-full bg-foreground/70" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Menu */}
      <div className="border-t border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-lg p-3 hover:bg-accent"
            >
              <Avatar className="h-9 w-9">
                <AvatarImage src={profile?.image || ""} />
                <AvatarFallback>
                  {profile?.name
                    ? profile.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">
                  {profile?.name || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {profile?.email || session.user?.email}
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="start"
            className="w-64 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border shadow-lg"
          >
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.image || ""} />
                  <AvatarFallback>{profile?.name?.[0] || "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">
                    {profile?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {profile?.email || session.user?.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-3">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex items-center gap-3">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={handleSignOut}
              className="flex items-center gap-3 text-destructive focus:text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
