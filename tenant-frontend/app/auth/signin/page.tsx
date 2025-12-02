// app/auth/signin/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
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
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ChevronDown,
  X,
  Github,
  Apple,
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedTitle } from "@/components/animated-title";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthActionsSimple } from "@/hooks/use-auth-actions";
import { PublicRoute } from "@/components/protected-route";

const EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com",
  "aol.com",
  "zoho.com",
  "yandex.com",
  "mail.com",
  "gmx.com",
];

function SignInContent() {
  const router = useRouter();
  const { signIn, isLoading: authLoading } = useAuthActionsSimple();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const email = formData.email.trim();
    if (!email.includes("@") || email.endsWith("@")) {
      setEmailSuggestions([]);
      return;
    }

    const atIndex = email.indexOf("@");
    const username = email.substring(0, atIndex);
    const partialDomain = email.substring(atIndex + 1).toLowerCase();

    if (username && partialDomain) {
      const suggestions = EMAIL_DOMAINS.filter((d) =>
        d.startsWith(partialDomain)
      )
        .map((d) => `${username}@${d}`)
        .slice(0, 5);

      setEmailSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setEmailSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.email]);

  // Simplified signin handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(formData.email.trim(), formData.password);
      toast.success("Signed in successfully!");

      // Redirect to dashboard after successful signin
      // The ProtectedRoute will handle redirecting to the stored URL or dashboard
      const redirectTo =
        sessionStorage.getItem("redirectAfterAuth") || "/dashboard";
      sessionStorage.removeItem("redirectAfterAuth");
      router.replace(redirectTo);
    } catch (error: unknown) {
      console.error("Sign in error:", error);
      if (error instanceof Error) {
        toast.error(error.message || "Sign in failed. Please try again.");
      } else {
        toast.error("Sign in failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, email: e.target.value });
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setFormData({ ...formData, email: suggestion });
    setShowSuggestions(false);
    emailInputRef.current?.focus();
  };

  const handleSocialSignIn = () => {
    toast.info("Social sign-in coming soon");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
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

      <div className="relative z-10 flex min-h-screen">
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
                className="mt-12 bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30"
              >
                Need an account? Sign Up <ArrowRight className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center py-12 px-6">
          <div className="w-full max-w-md animate-in slide-in-from-right-32 duration-700">
            <Card className="border-0 shadow-2xl backdrop-blur-xl">
              <CardHeader className="text-center pb-10">
                <CardTitle className="text-4xl font-bold text-muted-foreground">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  Sign in to your workspace
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <Button
                    variant="outline"
                    onClick={handleSocialSignIn}
                    disabled={isSubmitting}
                    className="h-16 rounded-2xl shadow-2xl hover:shadow-blue-600/40 group overflow-hidden"
                  >
                    <Github className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSocialSignIn}
                    disabled={isSubmitting}
                    className="h-16 rounded-2xl shadow-2xl hover:shadow-blue-600/40 group overflow-hidden"
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
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSocialSignIn}
                    disabled={isSubmitting}
                    className="h-16 rounded-2xl shadow-2xl hover:shadow-blue-600/40 group overflow-hidden"
                  >
                    <Apple className="h-5 w-5" />
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
                  <div className="space-y-2 relative">
                    <Label className="text-base font-semibold text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        ref={emailInputRef}
                        type="email"
                        placeholder="you@company.com"
                        className="pl-12 h-14 text-base"
                        value={formData.email}
                        onChange={handleEmailChange}
                        onFocus={() =>
                          emailSuggestions.length > 0 &&
                          setShowSuggestions(true)
                        }
                        disabled={isSubmitting}
                        required
                      />
                      {showSuggestions && (
                        <button
                          type="button"
                          className="absolute right-3 top-3.5"
                          onClick={() => setShowSuggestions(false)}
                        >
                          <ChevronDown className="h-5 w-5 text-gray-400 rotate-180" />
                        </button>
                      )}
                    </div>

                    {showSuggestions && emailSuggestions.length > 0 && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-2 rounded-xl shadow-xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-gray-200 dark:border-gray-800"
                      >
                        <div className="p-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
                          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                            Email suggestions
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowSuggestions(false)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {emailSuggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              type="button"
                              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-100 dark:border-gray-800 last:border-0"
                              onClick={() => handleSuggestionSelect(suggestion)}
                            >
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span className="text-sm font-medium">
                                {suggestion}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
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
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-12 pr-14 h-14 text-base"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={isSubmitting}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-2 p-2 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting}
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
                    disabled={isSubmitting || authLoading}
                    className="w-full h-16 text-xl font-semibold rounded-2xl shadow-2xl hover:shadow-blue-600/40 group overflow-hidden"
                  >
                    <span className="relative z-10">
                      {authLoading || isSubmitting
                        ? "Signing in..."
                        : "Sign In"}
                    </span>
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <PublicRoute>
      <SignInContent />
    </PublicRoute>
  );
}
