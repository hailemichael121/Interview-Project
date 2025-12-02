// app/organization/join/page.tsx
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Users, Mail, Key, Loader2, ArrowRight, Shield } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import authClient from "@/lib/auth-client";

function JoinOrganizationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = authClient.useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [inviteToken, setInviteToken] = useState(
    searchParams.get("token") || ""
  );
  const [email, setEmail] = useState(session?.user?.email || "");

  const handleJoinOrganization = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      toast.error("Please sign in to join an organization");
      router.push("/auth/signin");
      return;
    }

    if (!inviteToken.trim()) {
      toast.error("Please enter an invite token");
      return;
    }

    setIsLoading(true);

    try {
      // Accept invitation using your backend API
      const result = await apiService.organization.acceptInvite(
        inviteToken.trim()
      );

      if (!result.success) {
        throw new Error(result.message || "Failed to join organization");
      }

      toast.success("Successfully joined the organization!");

      // Refresh the page to update organization context
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error: unknown) {
      console.error("Organization creation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create organization";

      // Handle specific error cases
      if (errorMessage?.includes("already exists")) {
        toast.error(
          "An organization with this name or slug already exists. Please choose a different name."
        );
      } else if (errorMessage?.includes("slug")) {
        toast.error(
          "The URL slug is already taken. Please try a different organization name."
        );
      } else {
        toast.error(
          errorMessage || "Failed to create organization. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-2xl border-gray-200 dark:border-gray-700">
        <CardHeader className="space-y-3 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-linear-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">
            Join Workspace
          </CardTitle>
          <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
            Enter your invite token to join a workspace
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleJoinOrganization} className="space-y-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  Your Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 text-base border-gray-300 dark:border-gray-600"
                  disabled={true} // Email comes from auth session
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Invitations are sent to this email address
                </p>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="inviteToken"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Invite Token *
                </Label>
                <Input
                  id="inviteToken"
                  type="text"
                  placeholder="Enter the invite token..."
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  required
                  className="h-12 text-base border-gray-300 dark:border-gray-600 font-mono"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  This is provided in your invitation email
                </p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">
                    Secure Invitation
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                    Invitations are encrypted and can only be used by the
                    intended recipient.
                  </p>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 bg-green-600 hover:bg-green-700"
              disabled={isLoading || !inviteToken.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Joining Workspace...
                </>
              ) : (
                <>
                  Join Workspace
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>

            <div className="text-center space-y-4 pt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don&apos;t have an invite?{" "}
                <Button
                  type="button"
                  variant="link"
                  className="p-0 h-auto font-semibold text-primary"
                  onClick={() => router.push("/organization/create")}
                  disabled={isLoading}
                >
                  Create your own workspace
                </Button>
              </p>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Need help? Contact the workspace owner or administrator for a
                  new invitation.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinOrganizationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading invitation...
            </p>
          </div>
        </div>
      }
    >
      <JoinOrganizationContent />
    </Suspense>
  );
}
