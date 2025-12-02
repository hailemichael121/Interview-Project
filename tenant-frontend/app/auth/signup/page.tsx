// app/auth/signup/page.tsx - UPDATED
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
import authClient from "@/lib/auth-client";
import { Eye, EyeOff, Mail, Lock, Users, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { AnimatedTitle } from "@/components/animated-title";
import { useAuthTransition } from "@/components/auth-transition";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();
  const { navigate, transitionClass } = useAuthTransition();
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
      // Sign up with Better Auth
      const result = await authClient.signUp.email({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (result.error) {
        toast.error(result.error.message || "Registration failed. Please try again.");
        return;
      }

      // Show success message
      toast.success("Account created successfully! Please sign in.");

      // Redirect to sign in page
      setTimeout(() => {
        router.push("/auth/signin");
      }, 1500);

  } catch (error: unknown) {
      console.error("Sign up error:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create account. Please try again.";
      toast.error(errorMessage);
    }finally {
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
          <div className="text-center max-w-md">
            <Logo className="w-32 h-32 mx-auto mb-8" />
            <AnimatedTitle text="New Horizons" size="md" />
            <h2 className="mt-8 text-5xl font-bold text-white drop-shadow-lg">
              Start Your Journey
            </h2>
            <p className="mt-6 text-xl text-white/90 drop-shadow">
              Multi-tenant collaboration, built for modern teams.
            </p>
            <Link href="/auth/signin">
              <Button
                size="lg"
                variant="secondary"
                className="mt-12 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 hover:text-gray-900"
              >
                Already have an account? Sign In <ArrowRight className="ml-2" />
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
                  Create Account
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Start collaborating in seconds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-muted-foreground">
                      Full Name
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        required
                        placeholder="John Doe"
                        className="pl-12 h-14 text-base border-gray-300 dark:border-gray-600"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        disabled={isLoading}
                      />
                    </div>
                  </div>

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
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-semibold text-muted-foreground">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        required
                        type={showPassword ? "text" : "password"}
                        minLength={8}
                        placeholder="••••••••"
                        className="pl-12 pr-14 h-14 text-base border-gray-300 dark:border-gray-600"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 p-2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
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
                    disabled={isLoading}
                    className="w-full h-14 text-lg font-semibold"
                  >
                    {isLoading ? "Creating Account..." : "Create Account"}
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
                    By creating an account, you agree to our Terms of Service and Privacy Policy
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