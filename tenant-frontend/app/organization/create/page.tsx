// app/organization/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { useAuth } from "@/hooks/use-session";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { user, context } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "",
    slug: ""
  });

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 50);
    
    setFormData({ name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Please sign in to create an organization");
      router.push("/auth/signin");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Organization name is required");
      return;
    }

    setIsLoading(true);

    try {
      // Use your backend API service
      const result = await apiService.organization.createOrganization({
        name: formData.name.trim(),
        slug: formData.slug || undefined // Optional slug
      });

      if (!result.success) {
        throw new Error(result.message || "Failed to create organization");
      }

      toast.success("Organization created successfully!");
      
      // Redirect to dashboard
      router.push("/dashboard");
      
  } catch (error: unknown) {
  console.error("Organization creation error:", error);
  const errorMessage = error instanceof Error ? error.message : "Failed to create organization";
  
  // Handle specific error cases
  if (errorMessage.includes("already exists")) {
    toast.error("An organization with this name or slug already exists. Please choose a different name.");
  } else if (errorMessage.includes("slug")) {
    toast.error("The URL slug is already taken. Please try a different organization name.");
  } else {
    toast.error(errorMessage || "Failed to create organization. Please try again.");
  }
}finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Workspace
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Start collaborating with your team in a new workspace
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Workspace Name *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Acme Inc, Marketing Team"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  minLength={2}
                  maxLength={100}
                  className="h-12 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This will be displayed to your team members
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  URL Slug
                </Label>
                <Input
                  id="slug"
                  type="text"
                  placeholder={formData.slug || "auto-generated-slug"}
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="h-12 text-base border-gray-300 dark:border-gray-600 focus:border-primary dark:focus:border-primary font-mono"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Used in URLs: your-workspace.workspace.com/
                  <span className="font-semibold">{formData.slug || "auto-generated-slug"}</span>
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-semibold">Note:</span> As the creator, you&apos;ll be the <span className="font-bold">Owner</span> of this workspace with full administrative privileges.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Workspace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="text-center pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have a workspace?{" "}
                <Button 
                  type="button" 
                  variant="link" 
                  className="p-0 h-auto font-semibold text-primary"
                  onClick={() => router.push("/dashboard")}
                  disabled={isLoading}
                >
                  Go to Dashboard
                </Button>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}