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
} from "lucide-react";
import { toast } from "sonner";
import { AnimatedTitle } from "@/components/animated-title";
import { Logo } from "@/components/logo";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthActions } from "@/hooks/use-auth-actions";
import { Apple } from "lucide-react";
import { Github } from "lucide-react";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tenant-backend-cz23.onrender.com";

// Common email domains for suggestions
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

export default function SignInPage() {
  const router = useRouter();
  const { signIn, isLoading: authLoading } = useAuthActions();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Handle click outside to close suggestions
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

  // Generate email suggestions
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
      const suggestions = EMAIL_DOMAINS.filter((domain) =>
        domain.startsWith(partialDomain)
      )
        .map((domain) => `${username}@${domain}`)
        .slice(0, 5); // Limit to 5 suggestions

      setEmailSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setEmailSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.email]);

  // Clear all auth data before sign-in
  const clearAuthData = () => {
    if (typeof window === "undefined") return;

    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    // Clear all auth-related cookies
    const cookieNames = [
      "better-auth.session_token",
      "__Secure-better-auth.session_token",
    ];

    const pastDate = new Date(0).toUTCString();
    cookieNames.forEach((name) => {
      document.cookie = `${name}=; path=/; expires=${pastDate};`;
    });

    console.log("Cleared old auth data");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("Attempting sign in with:", {
        email: formData.email,
        passwordLength: formData.password.length,
      });

      // Clear old auth data first
      clearAuthData();

      // Use direct fetch to get full control
      const response = await fetch(`${backendUrl}/api/auth/sign-in/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: window.location.origin,
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      console.log("Response status:", response.status);

      // Get response headers
      const setCookieHeader = response.headers.get("set-cookie");
      console.log("Set-Cookie header:", setCookieHeader);

      // Check response content type
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error(
          `Server returned ${response.status}: ${text.substring(0, 100)}`
        );
      }

      const result = await response.json();
      console.log("Sign in result:", result);

      if (response.status !== 200 || result.error) {
        const errorMessage =
          result.error?.message || result.message || "Sign in failed";
        console.error("Sign in failed:", errorMessage);

        if (
          errorMessage.includes("Invalid email") ||
          errorMessage.includes("password")
        ) {
          toast.error(
            "Invalid email or password. Please check your credentials."
          );
        } else {
          toast.error(errorMessage);
        }
        setIsSubmitting(false);
        return;
      }

      // EXTRACT AND STORE THE FULL TOKEN FROM COOKIES
      let fullToken = null;

      if (setCookieHeader) {
        // Try to extract token from Set-Cookie header
        const cookieMatch = setCookieHeader.match(
          /better-auth\.session_token=([^;]+)/i
        );
        if (cookieMatch && cookieMatch[1]) {
          fullToken = decodeURIComponent(cookieMatch[1]);
          console.log("Extracted token from Set-Cookie:", fullToken);
        }
      }

      // If no cookie token, check if result has token
      if (!fullToken && result.token) {
        fullToken = result.token;
        console.log("Using token from response:", fullToken);
      }

      if (fullToken) {
        // Store in localStorage
        localStorage.setItem("auth_token", fullToken);
        localStorage.setItem(
          "auth_user",
          JSON.stringify(result.user || result)
        );

        // Also set cookie manually to ensure it's there
        const cookieValue = `${encodeURIComponent(
          fullToken
        )}; path=/; max-age=604800; SameSite=Lax; Secure`;
        document.cookie = `__Secure-better-auth.session_token=${cookieValue}`;
        document.cookie = `better-auth.session_token=${cookieValue}`;

        console.log("Token stored:", {
          localStorage:
            localStorage.getItem("auth_token")?.substring(0, 20) + "...",
          cookies: document.cookie,
        });
      } else {
        console.warn("No token found in response!");
      }

      // Wait a moment for cookies to propagate
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Test the session by making a simple API call
      try {
        console.log("Testing session with profile API...");

        // First try using fetch with credentials
        const profileResponse = await fetch(`${backendUrl}/users/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Origin: window.location.origin,
          },
          credentials: "include",
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          console.log("Profile API success:", profileData.success);
          toast.success("Signed in successfully!");

          // Redirect to dashboard after successful auth
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
        } else {
          console.error("Profile API failed:", profileResponse.status);
          toast.error("Session created but verification failed");
        }
      } catch (apiError) {
        console.error("Profile API error:", apiError);
        toast.success("Signed in! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 500);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      let errorMessage = "Sign in failed";

      if (error instanceof Error) {
        if (error.message.includes("401")) {
          errorMessage = "Invalid email or password";
        } else if (error.message.includes("network")) {
          errorMessage = "Network error. Please check your connection.";
        } else {
          errorMessage = error.message;
        }
      }

      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle email input change with suggestions
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, email: value });

    // Show suggestions if @ is present and domain is being typed
    if (value.includes("@") && !value.endsWith("@")) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setFormData({ ...formData, email: suggestion });
    setShowSuggestions(false);
    emailInputRef.current?.focus();
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
                    disabled={isSubmitting}
                    className="h-12"
                  >
                    <Github className="h-5 w-5" />
                    <span className="sr-only">GitHub</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                  <div className="space-y-2 relative">
                    <Label className="text-base font-semibold text-muted-foreground">
                      Email
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <Input
                        ref={emailInputRef}
                        required
                        type="email"
                        placeholder="you@company.com"
                        className="pl-12 h-14 text-base border-gray-300 dark:border-gray-600"
                        value={formData.email}
                        onChange={handleEmailChange}
                        onFocus={() => {
                          if (emailSuggestions.length > 0) {
                            setShowSuggestions(true);
                          }
                        }}
                        disabled={isSubmitting}
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

                    {/* Email Suggestions Dropdown */}
                    {showSuggestions && emailSuggestions.length > 0 && (
                      <div
                        ref={suggestionsRef}
                        className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
                      >
                        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                              Suggestions
                            </span>
                            <button
                              type="button"
                              onClick={() => setShowSuggestions(false)}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {emailSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                              onClick={() => handleSuggestionSelect(suggestion)}
                            >
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-gray-400" />
                                <span className="text-sm">{suggestion}</span>
                              </div>
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
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-12 pr-14 h-14 text-base border-gray-300 dark:border-gray-600"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
                        disabled={isSubmitting}
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
                    disabled={isSubmitting}
                    className="relative w-full h-16 text-xl font-semibold text-white hover:bg-gray-900 disabled:opacity-70 transition-all duration-300 shadow-2xl hover:shadow-blue-600/40 overflow-hidden group rounded-2xl"
                  >
                    <span className="relative z-10">
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        "Sign In"
                      )}
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
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
