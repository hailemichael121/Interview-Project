// app/outlines/page.tsx
"use client";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { DataTable } from "@/components/outlines/outlines-table";
import { useOrg } from "@/lib/org-context";

// Mock data
const mockData = [
  {
    id: 1,
    header: "Executive Summary",
    type: "Executive Summary",
    status: "In Progress",
    target: "1500",
    limit: "2000",
    reviewer: "Eddie Lake",
  },
  {
    id: 2,
    header: "Technical Approach",
    type: "Technical Approach",
    status: "Not Started",
    target: "3000",
    limit: "3500",
    reviewer: "Assign reviewer",
  },
  {
    id: 3,
    header: "Project Management",
    type: "Narrative",
    status: "Done",
    target: "2500",
    limit: "2500",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 4,
    header: "Quality Control",
    type: "Design",
    status: "In Progress",
    target: "1200",
    limit: "1500",
    reviewer: "Eddie Lake",
  },
  {
    id: 5,
    header: "Risk Management",
    type: "Narrative",
    status: "Not Started",
    target: "1800",
    limit: "2000",
    reviewer: "Assign reviewer",
  },
  {
    id: 6,
    header: "Table of Contents",
    type: "Table of Contents",
    status: "Done",
    target: "800",
    limit: "1000",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 7,
    header: "Key Personnel",
    type: "Capabilities",
    status: "In Progress",
    target: "2200",
    limit: "2500",
    reviewer: "Eddie Lake",
  },
  {
    id: 8,
    header: "Past Performance",
    type: "Focus Documents",
    status: "Not Started",
    target: "2800",
    limit: "3000",
    reviewer: "Assign reviewer",
  },
  {
    id: 9,
    header: "Cover Page",
    type: "Cover Page",
    status: "Done",
    target: "500",
    limit: "500",
    reviewer: "Jamik Tashpulatov",
  },
  {
    id: 10,
    header: "References",
    type: "Focus Documents",
    status: "In Progress",
    target: "1600",
    limit: "1800",
    reviewer: "Eddie Lake",
  },
];

export default function OutlinesPage() {
  const { currentOrg } = useOrg();

  if (!currentOrg) {
    return (
      <div className="flex h-screen items-center justify-center bg-[hsl(var(--background))]">
        <p className="text-lg text-[hsl(var(--muted-foreground)]">
          Please select an organization to view outlines
        </p>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">
            Outlines
          </h1>
          <p className="mt-3 text-lg text-[hsl(var(--muted-foreground))]">
            Manage and organize your project outlines with drag & drop
            functionality
          </p>
        </div>

        {/* Table Container - Perfectly Themed */}
        <div className="rounded-xl border border-light-300 bg-[hsl(var(--card))] shadow-sm overflow-hidden">
          <DataTable data={mockData} />
        </div>
      </div>
    </DashboardLayout>
  );
}
