"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggler } from "@/components/theme-toggler";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="py-8 bg-[#101111] dark:bg-[#101111] min-h-screen">
        <Card className="bg-white dark:bg-[#101111] border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              Minimal settings page. Toggle theme or update preferences here.
            </p>

            <div className="flex items-center space-x-4">
              <ThemeToggler compact />
              <Button 
                variant="secondary" 
                className="bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white border-gray-300 dark:border-gray-600"
              >
                Save preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}