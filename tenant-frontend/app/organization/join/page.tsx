"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Key, Mail, Shield, ArrowRight, Users } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import authClient from "@/lib/auth-client";

import Link from "next/link";
import DashboardLayout from "@/components/layout/dashboard-layout";

function JoinOrganizationContent() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error("Please enter your invite token");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiService.organization.acceptInvite(token.trim());
      if (res.success) {
        toast.success("Welcome! You've joined the workspace");
        router.push("/dashboard");
      } else {
        toast.error(res.message || "Invalid or expired invitation");
      }
    } catch {
      toast.error("Failed to join workspace. Please check your token.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-card/95 backdrop-blur">
        <CardHeader className="text-center space-y-4 pb-8 pt-10">
          <div className="mx-auto w-20 h-20 rounded-2xl bg-linear-to-br from-gray-500 to-gray-600 flex items-center justify-center shadow-xl">
            <Users className="h-10 w-10 text-white" />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold">Join a Workspace</CardTitle>
            <p className="text-muted-foreground mt-2 text-lg">
              Enter the invite token sent to your email
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Your Email
              </Label>
              <div className="p-4 bg-muted/50 rounded-lg border text-sm font-medium">
                {session?.user?.email || "Not signed in"}
              </div>
              <p className="text-xs text-muted-foreground">
                The invitation must be sent to this email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="token" className="text-base flex items-center gap-2">
                <Key className="h-4 w-4" />
                Invite Token
              </Label>
              <Input
                id="token"
                placeholder="Paste your token here..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="h-14 text-lg font-mono tracking-wider"
                disabled={isLoading}
                required
              />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex gap-4">
              <Shield className="h-6 w-6 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Secure & Private</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Invite tokens are encrypted and can only be used once by the intended recipient.
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              disabled={isLoading || !token.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Joining Workspace...
                </>
              ) : (
                <>
                  Join Workspace
                  <ArrowRight className="ml-3 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an invite?{" "}
              <Link href="/organization/create" className="font-medium text-primary hover:underline">
                Create your own workspace
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function JoinOrganizationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-lg text-muted-foreground">Loading invitation page...</p>
          </div>
        </div>
      }
    >
      <DashboardLayout>
        <JoinOrganizationContent />
      </DashboardLayout>
    </Suspense>
  );
}