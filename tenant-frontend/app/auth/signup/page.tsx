"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Users, Eye, EyeOff } from "lucide-react";
import authClient from "@/lib/auth-client";
import { useAuthTransition } from "@/components/auth-transition";
import { AuthLayout } from "@/components/auth/auth-layout";
import { DividerWithText } from "@/components/auth/divider-with-text";
import { FormInput } from "@/components/auth/form-input";
import { EmailSuggestions } from "@/components/auth/email-suggestions";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialButtons } from "@/components/auth/social-buttons";

export default function SignUpPage() {
  const router = useRouter();
  const { transitionClass } = useAuthTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        toast.error(
          result.error.message || "Registration failed. Please try again."
        );
        return;
      }

      toast.success("Account created successfully! Please sign in.");
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1500);
    } catch (error: unknown) {
      console.error("Sign up error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create account. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialSignUp = (provider: string) => {
    toast.info(`${provider} sign-up coming soon`);
  };

  const branding = {
    title: "New Horizons",
    heading: "Start Your Journey",
    description: "Multi-tenant collaboration, built for modern teams.",
    buttonText: "Already have an account? Sign In",
    buttonLink: "/auth/signin",
  };

  return (
    <AuthLayout
      branding={branding}
      formTitle="Create Account"
      formDescription="Start collaborating in seconds"
      transitionClass={transitionClass}
    >
      <AuthCard
        title="Create Account"
        description="Start collaborating in seconds"
      >
        <SocialButtons
          onGitHubClick={() => handleSocialSignUp("GitHub")}
          onGoogleClick={() => handleSocialSignUp("Google")}
          onAppleClick={() => handleSocialSignUp("Apple")}
          disabled={isLoading}
        />

        <DividerWithText text="Or continue with email" />

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={isLoading}
            required
            icon={<Users />}
          />

          <div className="space-y-2 relative">
            <FormInput
              label="Email"
              type="email"
              placeholder="you@company.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              disabled={isLoading}
              required
              icon={<Mail />}
            />
            <EmailSuggestions
              email={formData.email}
              onEmailChange={(email) => setFormData({ ...formData, email })}
              disabled={isLoading}
            />
          </div>

          <FormInput
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            disabled={isLoading}
            required
            minLength={8}
            icon={<Lock />}
            endAdornment={
              <button
                type="button"
                className="p-2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            }
          />

          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="relative w-full h-16 text-xl font-semibold  hover:text-amber-50 hover:bg-gray-900 disabled:opacity-70 transition-all duration-300 shadow-2xl hover:shadow-blue-600/40 overflow-hidden group rounded-2xl"
          >
            <span className="relative z-10">
              {isLoading ? "Creating Account..." : "Create Account"}
            </span>
            <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{" "}
            <Link
              href="/auth/signin"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              Sign in
            </Link>
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </p>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
