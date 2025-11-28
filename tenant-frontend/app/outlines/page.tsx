// app/outlines/page.tsx
import OutlinesTable from "@/components/outlines/outlines-table";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function OutlinesPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 bg-[#101111] min-h-screen p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Outlines
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your project outlines and track progress
            </p>
          </div>
        </div>

        <OutlinesTable />
      </div>
    </DashboardLayout>
  );
}