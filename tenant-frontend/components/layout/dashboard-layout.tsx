// components/layout/dashboard-layout.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useOrg } from "@/lib/org-context";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Search, Home, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbEllipsis,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { currentOrg, isLoading } = useOrg();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !currentOrg) {
      const allowed = ["/dashboard", "/organization"];
      if (!allowed.some((p) => pathname.startsWith(p))) {
        router.push("/dashboard");
      }
    }
  }, [currentOrg, isLoading, pathname, router]);

  const currentPageTitle = (() => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 1 && segments[0] === "dashboard")
      return currentOrg?.name || "Dashboard";
    const last = segments[segments.length - 1];
    return last ? last.charAt(0).toUpperCase() + last.slice(1) : "Dashboard";
  })();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-lg font-medium text-[hsl(var(--muted-foreground))]">
          Loading...
        </div>
      </div>
    );
  }

  return (
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

            {/* RIGHT: Search Icon + Avatar */}
            <div className="flex items-center gap-2">
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

              <Avatar className="h-9 w-9 border border-light-300">
                <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-800 dark:from-gray-400 dark:to-gray-600 text-white font-medium text-sm">
                  JD
                </AvatarFallback>
              </Avatar>
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
            <ProtectedRoute>{children}</ProtectedRoute>
          </div>
        </main>
      </div>
    </div>
  );
}
