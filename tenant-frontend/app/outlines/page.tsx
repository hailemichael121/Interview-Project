// app/outlines/page.tsx (update)
import OutlinesTable from "@/components/outlines/outlines-table";

export default function OutlinesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Outlines
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your project outlines and track progress
          </p>
        </div>
      </div>

      <OutlinesTable />
    </div>
  );
}
