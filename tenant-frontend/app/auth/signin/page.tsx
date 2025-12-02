// app/auth/signin/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AnimatedTitle } from "@/components/animated-title";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { Apple } from "lucide-react";
import { Github } from "lucide-react";
import authClient from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isLoading: authLoading } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log("Attempting sign in...");

      // Sign in
      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      console.log("Sign in result:", result);

      if (result.error) {
        toast.error(result.error.message || "Sign in failed");
        return;
      }

      // Wait a moment for cookies to propagate
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Debug: Check cookies and session
      console.log("Current cookies:", document.cookie);

      // Check session manually
      const sessionCheck = await authClient.getSession();
      console.log("Session after login:", sessionCheck);

      if (!sessionCheck?.data?.user) {
        toast.error("Session not created. Check console for details.");
        return;
      }

      toast.success("Signed in successfully!");

      // Force a hard redirect to ensure auth state is refreshed
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Sign in error:", error);
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    }
  };
  // Social sign-in handlers
  const handleGitHubSignIn = () => {
    toast.info("GitHub sign-in coming soon");
  };

  const handleGoogleSignIn = () => {
    toast.info("Google sign-in coming soon");
  };

  const handleAppleSignIn = () => {
    toast.info("Apple sign-in coming soon");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Full-Screen Wavy Background */}
      <div className="fixed inset-0 -z-10">
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1440 900"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wave-light" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2C3E50" />
              <stop offset="45%" stopColor="#5D768B" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
            <linearGradient id="wave-dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="50%" stopColor="#334155" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          <path
            fill="url(#wave-light)"
            className="dark:hidden"
            fillOpacity="0.9"
            d="M0,450L80,420C160,390,320,330,480,310C640,290,800,310,960,340C1120,370,1280,410,1360,430L1440,450L1440,900L0,900Z"
          />
          <path
            fill="url(#wave-dark)"
            className="hidden dark:block"
            fillOpacity="0.9"
            d="M0,450L80,420C160,390,320,330,480,310C640,290,800,310,960,340C1120,370,1280,410,1360,430L1440,450L1440,900L0,900Z"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left: Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-12">
          <div className="text-center max-w-md">
            <Logo className="w-32 h-32 mx-auto mb-8" />
            <AnimatedTitle text="Welcome Back" size="md" />
            <h2 className="mt-8 text-5xl font-bold text-white drop-shadow-lg">
              Continue Your Journey
            </h2>
            <p className="mt-6 text-xl text-white/90 drop-shadow">
              Access your organizations and collaborate with your team.
            </p>
            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="secondary"
                className="mt-12 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 hover:text-gray-900"
              >
                Need an account? Sign Up <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-md animate-in slide-in-from-right-32 duration-700">
            <Card className="border-0 shadow-2xl backdrop-blur-xl ">
              <CardHeader className="text-center pb-10">
                <CardTitle className="text-4xl font-bold text-muted-foreground">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Sign in to your workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Social Sign-in Buttons */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGitHubSignIn}
                    disabled={authLoading}
                    className="h-12"
                  >
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="h-12"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="sr-only">Google</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAppleSignIn}
                    disabled={authLoading}
                    className="h-12"
                  >
                    <Apple className="h-5 w-5" />
                    <span className="sr-only">Apple</span>
                  </Button>
                </div>

                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-900 text-gray-500">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        required
                        type="email"
                        placeholder="you@company.com"
                        className="pl-12 h-14 text-base border-gray-300 dark:border-gray-600"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        disabled={authLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-base font-semibold text-muted-foreground">
                        Password
                      </Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-12 pr-14 h-14 text-base border-gray-300 dark:border-gray-600"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={authLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 p-2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={authLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={authLoading}
                    className="relative w-full h-16 text-xl font-semibold text-white hover:bg-gray-900 disabled:opacity-70 transition-all duration-300 shadow-2xl hover:shadow-blue-600/40 overflow-hidden group rounded-2xl"
                  >
                    <span className="relative z-10">
                      {authLoading ? "Signing in..." : "Sign In"}
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    Don&apos;t have an account?{" "}
                    <Link
                      href="/auth/signup"
                      className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
