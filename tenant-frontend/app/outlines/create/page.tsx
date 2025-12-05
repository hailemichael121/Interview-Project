"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrganizationContext } from "@/hooks/use-session";
import { apiService } from "@/lib/api-service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function CreateOutlinePage() {
  const router = useRouter();
  const { currentOrganizationId } = useOrganizationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    header: "",
    sectionType: "EXECUTIVE_SUMMARY" as const,
    target: 0,
    limit: 0,
    reviewerId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOrganizationId) {
      toast.error("Please select an organization");
      return;
    }

    if (!formData.header.trim()) {
      toast.error("Header is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.outline.createOutline(
        {
          ...formData,
          organizationId: currentOrganizationId,
        },
        currentOrganizationId
      );

      if (response.success) {
        toast.success("Outline created successfully!");
        router.push("/outlines");
      }
    } catch (error: unknown) {
      console.error("Organization creation error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create organization";

      if (errorMessage?.includes("already exists")) {
        toast.error("An organization with this name or slug already exists. Please choose a different name.");
      } else if (errorMessage?.includes("slug")) {
        toast.error("The URL slug is already taken. Please try a different organization name.");
      } else {
        toast.error(errorMessage || "Failed to create organization. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentOrganizationId) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please select an organization to create outlines</p>
            <Link href="/dashboard">
              <Button variant="outline" className="mt-4">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <Link href="/outlines">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Outlines
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create New Outline</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="header">Outline Header *</Label>
                <Input
                  id="header"
                  placeholder="e.g., Executive Summary, Technical Approach"
                  value={formData.header}
                  onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sectionType">Section Type *</Label>
                <Select
                  value={formData.sectionType}
                  onValueChange={(value: any) => setFormData({ ...formData, sectionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EXECUTIVE_SUMMARY">Executive Summary</SelectItem>
                    <SelectItem value="TECHNICAL_APPROACH">Technical Approach</SelectItem>
                    <SelectItem value="DESIGN">Design</SelectItem>
                    <SelectItem value="CAPABILITIES">Capabilities</SelectItem>
                    <SelectItem value="FOCUS_DOCUMENT">Focus Document</SelectItem>
                    <SelectItem value="NARRATIVE">Narrative</SelectItem>
                    <SelectItem value="TABLE_OF_CONTENTS">Table of Contents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target">Target Word Count</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="1500"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="limit">Word Limit</Label>
                  <Input
                    id="limit"
                    type="number"
                    placeholder="2000"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reviewerId">Reviewer (Optional)</Label>
                <Select
                  value={formData.reviewerId}
                  onValueChange={(value) => setFormData({ ...formData, reviewerId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    <SelectItem value="reviewer-1">John Doe</SelectItem>
                    <SelectItem value="reviewer-2">Jane Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/outlines")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Outline
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}