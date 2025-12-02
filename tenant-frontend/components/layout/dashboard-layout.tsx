// components/layout/dashboard-layout.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useOrg } from "@/lib/org-context";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Search, Home, X } from "lucide-react";
// Import icons with proper casing
import {
  LogOut as LogOutIcon,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, useOrganizationContext } from "@/hooks/use-session";
import authClient  from "@/lib/auth-client";

interface OrganizationMembership {
  organizationId: string;
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  role: string;
  memberId: string;
  joinedAt: string;
}
interface DashboardLayoutProps {
  children: React.ReactNode;
  organization?: {
    id: string;
    name: string;
    role: "owner" | "member" | "reviewer";
  };
  memberships?: Array<{
    organizationId: string;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
    role: string;
    memberId: string;
    joinedAt: string;
  }>;
  isLoading?: boolean;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { currentOrg, setCurrentOrg } = useOrg();
  const { data: session, isLoading: sessionLoading } = useSession();
  const {
    currentOrganizationId,
    organizationMemberships,
    isLoading: contextLoading,
  } = useOrganizationContext();
  const router = useRouter();
  const pathname = usePathname();

  // Initialize organization context from session
  useEffect(() => {
    if (!contextLoading && organizationMemberships.length > 0) {
      // If we have a current organization from session but not in context, set it
      if (currentOrganizationId && !currentOrg) {
        const currentMembership = organizationMemberships.find(
          (m: OrganizationMembership) =>
            m.organizationId === currentOrganizationId
        );

        if (currentMembership) {
          setCurrentOrg({
            id: currentMembership.organizationId,
            name: currentMembership.organization.name,
            role: currentMembership.role.toLowerCase() as "owner" | "member",
            plan: "free", // Default plan
          });
        }
      }

      // If no current org but we have memberships, set the first one
      if (!currentOrg && organizationMemberships.length > 0) {
        const firstMembership = organizationMemberships[0];
        setCurrentOrg({
          id: firstMembership.organizationId,
          name: firstMembership.organization.name,
          role: firstMembership.role.toLowerCase() as "owner" | "member",
          plan: "free",
        });
      }
    }
  }, [
    contextLoading,
    organizationMemberships,
    currentOrganizationId,
    currentOrg,
    setCurrentOrg,
  ]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      setCurrentOrg(null);
      router.push("/auth/signin");
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Handle user initials
  const getUserInitials = () => {
    if (!session?.user?.name) {
      return session?.user?.email?.charAt(0).toUpperCase() || "U";
    }

    const names = session.user.name.split(" ");
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (
      names[0].charAt(0) + names[names.length - 1].charAt(0)
    ).toUpperCase();
  };
  const isLoading = sessionLoading || contextLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-lg font-medium text-[hsl(var(--muted-foreground))]">
          Loading...
        </div>
      </div>
    );
  }

  // If no session, the ProtectedRoute will handle redirect
  if (!session) {
    return null;
  }

  const currentPageTitle = (() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1 && segments[0] === "dashboard")
      return currentOrg?.name || "Dashboard";
    const last = segments[segments.length - 1];
    return last ? last.charAt(0).toUpperCase() + last.slice(1) : "Dashboard";
  })();

  return (
    <ProtectedRoute requireAuth={true} requireOrganization={false}>
      <div className="flex h-screen bg-[hsl(var(--background))]">
        {/* Desktop Sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block lg:w-80 lg:border-r lg:border-light-300 lg:bg-[hsl(var(--background))]">
          <AppSidebar organization={currentOrg ?? undefined} />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed left-4 top-4 z-50 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <AppSidebar organization={currentOrg ?? undefined} />
          </SheetContent>
        </Sheet>

        {/* Main Layout */}
        <div className="flex flex-1 flex-col overflow-hidden lg:pl-80">
          {/* Header */}
          <header className="sticky top-0 z-40 border-b border-light-300 bg-[hsl(var(--background))/0.95] backdrop-blur">
            <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
              {/* LEFT: Menu Button (mobile only) */}
              <div className="lg:hidden">
                {/* This space is intentionally empty - menu button is fixed outside */}
              </div>

              {/* CENTER: Page Title (mobile) or Breadcrumb (desktop) */}
              <div className="flex-1 flex items-center justify-center md:justify-start">
                {/* Mobile: Centered Title */}
                <h1 className="md:hidden text-lg font-semibold truncate px-8">
                  {currentPageTitle}
                </h1>

                {/* Desktop: Breadcrumb */}
                <div className="hidden md:block flex-1 min-w-0">
                  <Breadcrumb>
                    <BreadcrumbList className="flex-nowrap overflow-x-auto scrollbar-hide text-sm">
                      <BreadcrumbItem>
                        <BreadcrumbLink href="/dashboard">
                          <Home className="h-4 w-4" />
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbPage className="font-medium">
                          {currentPageTitle}
                        </BreadcrumbPage>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
              </div>

              {/* RIGHT: Search Icon + User Menu */}
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="relative"
                >
                  {searchOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Search className="h-5 w-5" />
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-9 w-9 rounded-full p-0"
                    >
                      <Avatar className="h-9 w-9 border border-light-300">
                        <AvatarImage
                          src={session.user?.image || undefined}
                          alt={session.user?.name || "User"}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600 text-white font-medium text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {session.user?.name || "User"}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className="text-red-600"
                    >
                      <LogOutIcon className="mr-2 h-4 w-4" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Full Search Bar */}
            {searchOpen && (
              <div className="px-4 pb-4 border-b border-light-300">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                  <Input
                    autoFocus
                    placeholder="Search anything..."
                    className="pl-10 bg-[hsl(var(--input))] border border-light-300"
                    onBlur={() => setSearchOpen(false)}
                  />
                </div>
              </div>
            )}
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
