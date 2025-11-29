// components/sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Building2,
  Plus,
  LogOut,
  User,
  ChevronsUpDown,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface Organization {
  id: string;
  name: string;
  role: string;
  plan: string;
}

interface SidebarProps {
  organization?: Organization;
  open?: boolean;
  onClose?: () => void;
}

const organizations: Organization[] = [
  { id: "1", name: "Acme Inc", role: "owner", plan: "Enterprise" },
  { id: "2", name: "Startup XYZ", role: "member", plan: "Startup" },
  { id: "3", name: "Tech Solutions", role: "owner", plan: "Free" },
];

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Outlines", href: "/outlines", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({
  organization: initialOrganization,
}: SidebarProps) {
  const pathname = usePathname();
  const [selectedOrg, setSelectedOrg] = React.useState<Organization>(
    initialOrganization || organizations[0]
  );
  const { resolvedTheme } = useTheme();

  const logoSrc =
    resolvedTheme === "dark" ? "/tenant-dark.png" : "/tenant-light.png";

  return (
    <div className="flex h-full flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Organization Switcher Header */}
      <div className="flex items-center justify-between p-5 border-b border-light-300">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-light-100 dark:hover:bg-[hsl(var(--hover-700))]"
            >
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-light-300">
                <Image
                  src={logoSrc}
                  alt="Logo"
                  width={160}
                  height={160}
                  className="rounded-lg object-cover transition-transform hover:scale-105"
                />
              </div>
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-semibold">
                  {selectedOrg.name}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
                  {selectedOrg.role} • {selectedOrg.plan}
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="right"
            align="start"
            sideOffset={10}
            className="w-72"
          >
            <DropdownMenuLabel className="text-xs font-medium text-[hsl(var(--muted-foreground))]">
              Organizations
            </DropdownMenuLabel>
            <div className="max-h-64 overflow-y-auto">
              {organizations.map((org) => {
                const isSelected = selectedOrg.id === org.id;
                return (
                  <DropdownMenuItem
                    key={org.id}
                    onSelect={() => setSelectedOrg(org)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2.5",
                      isSelected
                        ? "bg-light-200 dark:bg-[hsl(0_0%_25%)]"
                        : "hover:bg-light-100 dark:hover:bg-[hsl(var(--hover-700))]"
                    )}
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded border border-light-300 bg-light-100 dark:bg-[hsl(0_0%_20%)]">
                      <Building2 className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium truncate">{org.name}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] capitalize">
                        {org.role} • {org.plan}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="h-2 w-2 rounded-full bg-[hsl(var(--foreground)/0.6)]" />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3">
              <Plus className="h-4 w-4" />
              Create New Organization
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3">
              <Users className="h-4 w-4" />
              Join Organization
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                "hover:bg-light-100 dark:hover:bg-[hsl(var(--hover-700))]",
                isActive
                  ? "bg-light-200 text-[hsl(var(--foreground))] dark:bg-[hsl(0_0%_25%)]"
                  : "text-[hsl(var(--muted-foreground))]"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0",
                  isActive
                    ? "text-[hsl(var(--foreground))]"
                    : "text-[hsl(var(--muted-foreground))]"
                )}
              />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--foreground)/0.7)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-light-300 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 rounded-lg p-3 hover:bg-light-100 dark:hover:bg-[hsl(var(--hover-700))]"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-light-100 dark:bg-[hsl(0_0%_25%)] text-sm font-medium">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">John Doe</p>
                <p className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                  john@example.com
                </p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="right" align="start" className="w-64">
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 px-2 py-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    john@example.com
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3">
              <User className="h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-3">
              <Settings className="h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-3 text-red-600 dark:text-red-400">
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
