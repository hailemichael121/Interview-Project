"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Mail } from "lucide-react";
import authClient from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      // 🔄 Use your frontend URL for the reset page
      const frontendUrl = window.location.origin;
      const resetPageUrl = `${frontendUrl}/auth/reset-password`;

      const { data, error } = await authClient.requestPasswordReset({
        email: email.trim(),
        redirectTo: resetPageUrl,
      });

      if (error) {
        throw new Error(error.message || "Failed to send reset email");
      }

      setEmailSent(true);
      toast.success("Password reset link sent! Check your email.");
      console.log("✅ Reset email requested successfully:", data);
    } catch (error: unknown) {
      console.error("❌ Reset request error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center space-x-2">
            <Link
              href="/auth/signin"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <div>
              <CardTitle className="text-2xl">Reset Password</CardTitle>
              <CardDescription>
                {emailSent
                  ? "Check your email for the reset link"
                  : "Enter your email to receive a reset link"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {emailSent ? (
            <div className="space-y-4 text-center">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-green-700 dark:text-green-300">
                  A password reset link has been sent to{" "}
                  <strong>{email}</strong>. Please check your email and click
                  the link to reset your password.
                </p>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                The link will expire in 1 hour.
              </p>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Send another email
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link href="/auth/signin">Back to Sign In</Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Enter the email address associated with your account
                </p>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center pt-4">
                <Link
                  href="/auth/signin"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Remember your password? Sign in
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
