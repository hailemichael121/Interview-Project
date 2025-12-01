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
import { authClient } from "@/lib/auth-client";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AnimatedTitle } from "@/components/animated-title";
import { useAuthTransition } from "@/components/auth-transition";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const { navigate, transitionClass } = useAuthTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Invalid credentials");
        return;
      }

      // Successful sign in
      toast.success("Welcome back!");

      // Get the session to verify
      const session = await authClient.getSession();

      if (session.data) {
        // Wait a moment for cookies to be set
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Fetch user context to check for organizations
        try {
          const api = (await import("@/lib/api-service")).apiService;
          const userData = await api.user.getCurrentUser();

          if (
            userData.success &&
            userData.data.context.organizationMemberships.length > 0
          ) {
            router.push("/dashboard");
          } else {
            router.push("/organization/create");
          }
        } catch (error) {
          console.error("Error fetching user context:", error);
          router.push("/dashboard");
        }
      } else {
        toast.error("Failed to create session");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
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
      <div className={`relative z-10 flex min-h-screen ${transitionClass}`}>
        {/* Left: Branding */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center px-12">
          <div className="text-center max-w-lg">
            <Logo className="w-32 h-32 mx-auto mb-8" />
            <AnimatedTitle text="Welcome Back" size="md" />
            <h2 className="mt-8 text-5xl font-bold text-white drop-shadow-lg">
              Your Workspace Awaits
            </h2>
            <p className="mt-6 text-xl text-white/90 drop-shadow">
              Pick up right where you left off.
            </p>
            <Button
              onClick={() => navigate("/auth/signup")}
              size="lg"
              variant="secondary"
              className="mt-12 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 hover:text-gray-900"
            >
              New here? Create Account <ArrowRight className="ml-2" />
            </Button>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-md animate-in slide-in-from-left-32 duration-700">
            <Card className="border-0 shadow-2xl backdrop-blur-xl">
              <CardHeader className="text-center pb-10">
                <CardTitle className="text-4xl font-bold text-muted-foreground">
                  Sign In
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Access your workspace instantly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 icon-muted" />
                      <Input
                        required
                        type="email"
                        placeholder="you@company.com"
                        className="pl-12 h-14 text-base input-default border-light-300 text-black-gray dark:text-milky-white placeholder:text-muted-foreground"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 icon-muted" />
                      <Input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-12 pr-14 h-14 text-base input-default border-light-300 text-black-gray dark:text-milky-white placeholder:text-muted-foreground"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 icon-muted hover-light-100"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isLoading}
                    className="relative w-full h-16 text-xl font-semibold text-white bg-blue-950 hover:bg-blue-900 disabled:opacity-70 transition-all duration-300 shadow-2xl hover:shadow-blue-600/40 overflow-hidden group rounded-2xl"
                  >
                    <span className="relative z-10">
                      {isLoading ? "Signing in..." : "Sign In"}
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 group-hover:translate-x-full transition-transform duration-1000" />
                  </Button>
                </form>

                <p className="text-center mt-8 text-gray-700 dark:text-gray-200">
                  Don&apos;t have an account?{" "}
                  <Button
                    variant="link"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    onClick={() => navigate("/auth/signup")}
                  >
                    Sign up
                  </Button>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
