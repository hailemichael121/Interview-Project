import { OutlinesTable } from "@/components/outlines/outlines-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function OutlinesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Outlines</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your project outlines and track progress
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      <OutlinesTable />
    </div>
  );
}