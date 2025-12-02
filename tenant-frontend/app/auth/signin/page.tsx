"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuthActionsSimple } from "@/hooks/use-auth-actions";
import { PublicRoute } from "@/components/protected-route";
import { AuthLayout } from "@/components/auth/auth-layout"; 
import { DividerWithText } from "@/components/auth/divider-with-text";
import { FormInput } from "@/components/auth/form-input";
import { EmailSuggestions } from "@/components/auth/email-suggestions";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialButtons } from "@/components/auth/social-buttons";
import authClient from "@/lib/auth-client";

function SignInContent() {
  const router = useRouter();
  const { signIn, isLoading: authLoading } = useAuthActionsSimple();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!formData.email || !formData.password) {
    toast.error("Please fill in all fields");
    return;
  }

  setIsSubmitting(true);
  try {
    // Direct call - signIn doesn't return error in the response
    await signIn(formData.email.trim(), formData.password);
    
    toast.success("Signed in successfully!");
    
    // Wait a moment for cookies to be set
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verify session is actually set
    const session = await authClient.getSession();
    if (!session?.data?.user) {
      throw new Error("Session not set properly");
    }

    const redirectTo = sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
    sessionStorage.removeItem("redirectAfterAuth");
    
    // Use replace instead of push to avoid back button issues
    router.replace(redirectTo);
    
  } catch (error: unknown) {
    console.error("Sign in error:", error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Sign in failed. Please try again.";
    
    toast.error(errorMessage);
    
    // If it's a cookie/session issue, suggest clearing cookies
    if (errorMessage.includes("cookie") || errorMessage.includes("session")) {
      toast.error("Please try clearing your browser cookies and try again.");
    }
  } finally {
    setIsSubmitting(false);
  }
};
  const handleSocialSignIn = () => {
    toast.info("Social sign-in coming soon");
  };

  const branding = {
    title: "Welcome Back",
    heading: "Continue Your Journey",
    description: "Access your organizations and collaborate with your team.",
    buttonText: "Need an account? Sign Up",
    buttonLink: "/auth/signup"
  };

  return (
    <AuthLayout
      branding={branding}
      formTitle="Welcome Back"
      formDescription="Sign in to your workspace"
    >
      <AuthCard
        title="Welcome Back"
        description="Sign in to your workspace"
      >
        <SocialButtons
          onGitHubClick={handleSocialSignIn}
          onGoogleClick={handleSocialSignIn}
          onAppleClick={handleSocialSignIn}
          disabled={isSubmitting}
        />

        <DividerWithText text="Or continue with email" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <FormInput
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitting}
              required
              icon={<Mail />}
            />
            <EmailSuggestions
              email={formData.email}
              onEmailChange={(email) => setFormData({ ...formData, email })}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-base font-semibold text-muted-foreground">
                Password
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <FormInput
              label=""
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isSubmitting}
              required
              icon={<Lock />}
              endAdornment={
                <button
                  type="button"
                  className="p-2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              }
            />
          </div>

          <Button
            type="submit"
            size="lg"
            disabled={isSubmitting || authLoading}
            className=" relative w-full h-16 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-blue-600/40 group overflow-hidden"
          >
            <span className="relative z-10">
              {authLoading || isSubmitting ? "Signing in..." : "Sign In"}
            </span>
                    <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />

          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <PublicRoute>
      <SignInContent />
    </PublicRoute>
  );
}