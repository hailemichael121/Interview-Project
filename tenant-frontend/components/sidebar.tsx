"use client";

import * as React from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import authClient from "@/lib/auth-client";
import { toast } from "sonner";
import { useOrganizationContext, useSession } from "@/hooks/use-session";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Outlines", href: "/outlines", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const { data: session, isPending: authLoading } = authClient.useSession();

  const {
    currentOrganizationId,
    currentMemberRole,
    currentOrganization,
    organizationMemberships,
    isLoading: orgLoading,
    switchOrganization,
  } = useOrganizationContext();

  const { profile } = useSession();
  const [switching, setSwitching] = React.useState(false);

  const logoSrc = resolvedTheme === "dark" ? "/tenant-dark.png" : "/tenant-light.png";

  const handleSwitchOrg = async (orgId: string) => {
    if (orgId === currentOrganizationId || switching) return;

    setSwitching(true);
    try {
      await switchOrganization(orgId);
      toast.success("Switched organization");
    } catch {
      toast.error("Failed to switch");
    } finally {
      setSwitching(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      localStorage.removeItem("currentOrganizationId");
      toast.success("Signed out");
    } catch {
      toast.error("Sign out failed");
    }
  };

  React.useEffect(() => { }, [currentOrganizationId]);

  if (authLoading || orgLoading) {
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
      </div>
    );
  }

  if (!session?.user) return null;
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";

  return (
    <div className="flex h-full flex-col bg-background text-foreground">
      {currentOrganization ? (
        <div className="p-5 border-b border-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-accent"
                disabled={switching}
              >
                <div className="flex h-10 w-10 items-center justify-center bg-linear-to-br from-gray-500 to-white-600 text-white overflow-hidden rounded-lg border">
                  <Image
                    src={logoSrc}
                    alt="Logo"
                    width={160}
                    height={160}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 text-left">
                  <p className="truncate text-sm font-semibold">{currentOrganization.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{currentMemberRole || "Member"}</p>
                </div>
                {switching ? <Loader2 className="h-4 w-4 animate-spin" /> : <ChevronsUpDown className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="right" align="start" sideOffset={10} className={`w-72  ${bgColor}  ${isDark ? "text-white" : "text-gray-900"}`}
            >
              <DropdownMenuLabel>Your Organizations</DropdownMenuLabel>
              <div className="max-h-64 overflow-y-auto">
                {organizationMemberships.map((org) => {
                  const isActive = org.organizationId === currentOrganizationId;
                  return (
                    <DropdownMenuItem
                      key={org.organizationId}
                      onSelect={() => handleSwitchOrg(org.organizationId)}
                      className={cn("gap-3", isActive && "bg-accent")}
                    >
                      <Building className="h-4 w-4" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{org.organization.name}</p>
                        <p className="text-xs text-muted-foreground">{org.role}</p>
                      </div>
                      {isActive && <div className="h-2 w-2 rounded-full bg-primary" />}
                    </DropdownMenuItem>
                  );
                })}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => router.push("/organization/create")}>
                <Plus className="h-4 w-4 mr-2" /> Create Organization
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => router.push("/organization/join")}>
                <Users className="h-4 w-4 mr-2" /> Join Organization
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="p-5 border-b border-border text-center">
          <p className="text-sm font-medium mb-2">No Workspace</p>
          <p className="text-xs text-muted-foreground mb-4">Create or join one to start</p>
          <Button onClick={() => router.push("/organization/create")} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Create Workspace
          </Button>
        </div>
      )}

      {currentOrganization && (
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-md"
                    : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
                {isActive && <div className="ml-auto h-2 w-2 rounded-full bg-primary" />}
              </button>
            );
          })}
        </nav>
      )}

      <div className="border-t border-border p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg p-3 hover:bg-accent">
              <Avatar className="h-10 w-10">
                <AvatarImage src={session.user?.image || ""} />
                <AvatarFallback className="bg-linear-to-br from-gray-500 to-white-600 text-white font-medium">
                  {profile?.name?.[0] || "U"}                        </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">{profile?.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{profile?.email || session.user?.email}</p>
              </div>
              <ChevronsUpDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="center" className="w-72 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 border shadow-2xl">
            <DropdownMenuLabel>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user?.image || ""} />
                  <AvatarFallback className="bg-linear-to-br from-gray-500 to-white-600 text-white font-medium">
                    {profile?.name?.[0] || "U"}                        </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{profile?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email || session.user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className={`w-4  ${isDark ? " text-white" : "text-gray-900"}`} />
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <User className="h-4 w-4 mr-2" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => router.push("/settings")}>
              <Settings className="h-4 w-4 mr-2" /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleSignOut} className="text-destructive">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}