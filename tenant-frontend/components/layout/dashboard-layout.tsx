// components/layout/dashboard-layout.tsx - FINAL PERFECT VERSION
"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  Menu,
  Search,
  Home,
  LogOut as LogOutIcon,
  Settings as SettingsIcon,
  User as UserIcon,
} from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import authClient from "@/lib/auth-client";
import { AppSidebar } from "../sidebar";
import { useTheme } from "next-themes";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";
  const textColor = isDark ? "text-white" : "text-gray-900";

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  useEffect(() => { }, []);

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth/signin");
  };

  const getInitials = () => {
    const name = session?.user?.name;
    if (!name) return session?.user?.email?.[0]?.toUpperCase() || "U";
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  };

  // Smart Breadcrumb Logic
  const segments = pathname.replace(/^\//, "").split("/").filter(Boolean);
  const hasQuery = searchParams.toString().length > 0;

  const buildBreadcrumb = () => {
    if (segments.length === 0 || (segments.length === 1 && segments[0] === "dashboard")) {
      return null;
    }

    const parentSegments = segments.slice(0, -1);
    const lastSegment = segments[segments.length - 1];
    const displayLast = lastSegment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const parentPath = parentSegments.length > 0 ? `/${parentSegments.join("/")}` : "/dashboard";

    return (
      <>
        <BreadcrumbSeparator />
        {parentSegments.length > 0 && (
          <BreadcrumbItem>
            <BreadcrumbLink
              onClick={(e) => {
                e.preventDefault();
                router.push(parentPath);
              }}
              className="capitalize"
            >
              {parentSegments.join(" / ")}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-2">
            {displayLast}
            {hasQuery && (
              <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                +params
              </span>
            )}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </>
    );
  };

  if (sessionLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <ProtectedRoute requireAuth requireOrganization={false}>
      <div className="flex h-screen bg-background">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-80 lg:border-r lg:border-border">
          <AppSidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-50 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <SheetContent side="left" className="w-80 p-0">
            <AppSidebar />
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
            <div className="flex h-16 items-center justify-between px-4 lg:px-8">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href="/dashboard"
                        onClick={(e) => {
                          e.preventDefault();
                          router.push("/dashboard");
                        }}
                        className="flex items-center gap-2"
                      >
                        <Home className="h-4 w-4" />
                        Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    {buildBreadcrumb()}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>

              {/* Search + User */}
              <div className="flex items-center gap-4">
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="w-64 pl-10 border-0 focus-visible:ring-1" />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-full p-0 h-10 w-10">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user?.image || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-gray-500 to-gray-700 text-white font-medium">
                          {getInitials()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className={`w-72 ${bgColor} ${textColor}`}>
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <p className="font-medium">{session.user?.name || "User"}</p>
                        <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => router.push("/settings")}>
                      <UserIcon className="mr-2 h-4 w-4" /> Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => router.push("/settings")}>
                      <SettingsIcon className="mr-2 h-4 w-4" /> Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={handleSignOut} className="text-red-600">
                      <LogOutIcon className="mr-2 h-4 w-4" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto bg-muted/20">
            <div className="container mx-auto max-w-7xl px-4 py-8 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}