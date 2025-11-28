// components/layout/dashboard-layout.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { AppSidebar } from "@/components/sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { useOrg } from "@/lib/org-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentOrg, isLoading } = useOrg();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentOrg) {
      const noOrgPaths = ["/dashboard", "/organization"];
      const currentPath = window.location.pathname;
      if (!noOrgPaths.some((path) => currentPath.startsWith(path))) {
        router.push("/dashboard");
      }
    }
  }, [currentOrg, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen bg-[#fefefe] dark:bg-[#101111] text-gray-900 dark:text-white items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#fefefe] dark:bg-[#101111] text-gray-900 dark:text-white">
      <AppSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        organization={currentOrg || undefined}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-[#fefefe] dark:bg-[#101111] border-b border-gray-200 dark:border-gray-800 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden sm:block">
                <div className="flex items-center space-x-3">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {currentOrg?.name || "Workspace"}
                  </h1>
                </div>
              </div>
            </div>

            {/* Search */}
            <div className="flex-1 max-w-2xl mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search outlines, sections, or content..."
                  className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus:bg-white dark:focus:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* User avatar */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                <AvatarFallback className="bg-gradient-to-br from-gray-600 to-gray-400 dark:from-gray-400 dark:to-gray-600 text-white text-sm">
                  JD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6 bg-[#fefefe] dark:bg-[#101111]">
          <div className="max-w-7xl mx-auto w-full">
            <ProtectedRoute>{children}</ProtectedRoute>
          </div>
        </main>
      </div>
    </div>
  );
}