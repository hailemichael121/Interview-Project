"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, ArrowRight, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";

import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";

function CreateOrganizationContent() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
  });

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .substring(0, 50);

    setFormData({ name, slug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.organization.createOrganization({
        name: formData.name.trim(),
        slug: formData.slug || undefined,
      });

      if (res.success) {
        toast.success("Workspace created successfully!");
        router.push("/dashboard");
      } else {
        throw new Error(res.message || "Failed to create workspace");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to create workspace";
      if (msg.includes("slug")) {
        toast.error("This URL is already taken. Try a different name.");
      } else if (msg.includes("exists")) {
        toast.error("A workspace with this name already exists.");
      } else {
        toast.error(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-4 pb-8 pt-10 bg-linear-to-b from-primary/5 to-transparent">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-linear-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-xl">
            <Building className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Create New Workspace</CardTitle>
            <p className="text-muted-foreground mt-2 text-lg">
              Start collaborating with your team
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="text-base font-medium">Workspace Name *</Label>
              <Input
                placeholder="Acme Inc, Design Team, etc."
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="h-14 text-lg"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                This will be your team’s home
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">URL Slug</Label>
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  your-workspace.com/
                </span>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })}
                  placeholder="acme-inc"
                  className="h-14 text-lg font-mono"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Auto-generated from name · can be edited
              </p>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex gap-4">
              <Shield className="h-6 w-6 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="font-medium">You&apos;ll be the Owner</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Full admin access · invite team members · manage settings
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  Creating Workspace...
                </>
              ) : (
                <>
                  Create Workspace
                  <ArrowRight className="ml-3 h-6 w-6" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Already have a workspace?{" "}
              <Link href="/organization/join" className="font-medium text-primary hover:underline">
                Join with an invite
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CreateOrganizationPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto">
            <div className="h-96 bg-muted/20 rounded-2xl animate-pulse"></div>
          </div>
        }
      >
        <CreateOrganizationContent />
      </Suspense>
    </DashboardLayout>
  );
}