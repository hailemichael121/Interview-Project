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
import { Building2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { createOrganization } from "@/lib/api";
import { useOrg } from "@/lib/org-context";
import { authClient } from "@/lib/auth-client";

export default function CreateOrganizationPage() {
  const router = useRouter();
  const { setCurrentOrg } = useOrg();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const session = await authClient.getSession();
      if (!session.data?.session) {
        toast.error("Please sign in to create an organization");
        router.push("/auth/signin");
        return;
      }

      const organization = await createOrganization({ name: formData.name });

      setCurrentOrg({
        id: organization.id,
        name: organization.name,
        role: "owner",
      });

      toast.success("Organization created successfully!");
      router.push("/outlines");
    } catch (error) {
      toast.error("Failed to create organization");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-gray-900 to-gray-700 rounded-lg flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Create Organization
          </CardTitle>
          <CardDescription className="text-center">
            Create a new workspace for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Acme Inc"
                value={formData.name}
                onChange={(e) => setFormData({ name: e.target.value })}
                required
                minLength={2}
                maxLength={100}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Organization"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
