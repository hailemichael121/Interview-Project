"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
 

interface DashboardLayoutProps {
  children: React.ReactNode;
  organization?: {
    id: string;
    name: string;
    role: "owner" | "member";
  };
}

export function DashboardLayout({ children, organization }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50/40 dark:bg-gray-900">
      <Sidebar 
        open={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        organization={organization}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          organization={organization}
        />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}