"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";
import { ChevronLeft, Eye, EyeOff, Lock, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import authClient from "@/lib/auth-client";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resolvedTheme } = useTheme();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const borderColor = isDark ? "border-gray-800" : "border-gray-300";
  const subtleBg = isDark ? "bg-gray-900/50" : "bg-white/50";
  const cardBg = isDark ? "bg-gray-700" : "bg-white/80";
  const errorBg = isDark ? "bg-red-900/30" : "bg-red-100";

  const checkPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[a-z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    checkPasswordStrength(value);
  };

  // If no token, show error message
  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${bgColor}`}>
        <div className={`absolute inset-0 ${isDark ? "bg-grid-slate-900" : "bg-grid-slate-100"} mask-linear-to-0 dark:mask-linear-to-0-dark`} />
        <Card className={`w-full max-w-md backdrop-blur-sm ${cardBg} ${borderColor} border-opacity-50 shadow-2xl`}>
          <CardHeader className="space-y-3 text-center">
            <div className={`mx-auto w-16 h-16 rounded-full ${errorBg} flex items-center justify-center mb-4`}>
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className={`text-2xl font-bold ${textColor}`}>
              Invalid Reset Link
            </CardTitle>
            <CardDescription className={isDark ? "text-gray-400" : "text-gray-600"}>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`p-4 ${errorBg} backdrop-blur-sm rounded-lg border ${isDark ? "border-red-800/50" : "border-red-200/50"}`}>
              <p className={isDark ? "text-red-300" : "text-red-700"}>
                Please request a new password reset link from the sign in page.
              </p>
            </div>
            <div className="space-y-3">
              <Button asChild className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg shadow-red-500/25 dark:shadow-red-900/25 transition-all duration-300">
                <Link href="/auth/forgot-password">Request New Reset Link</Link>
              </Button>
              <Button asChild variant="outline" className={`w-full ${borderColor} ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"} transition-all duration-300`}>
                <Link href="/auth/signin">Back to Sign In</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      toast.error("Please enter a new password");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (passwordStrength < 3) {
      toast.error("Please choose a stronger password");
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await authClient.resetPassword({
        newPassword: password,
        token: token,
      });

      if (error) {
        throw new Error(error.message || "Failed to reset password");
      }

      toast.success("Password reset successfully! Redirecting to sign in...", {
        icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      });

      // Redirect to sign in after successful reset
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (error: unknown) {
      console.error("❌ Password reset error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reset password";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const strengthColors = [
    { color: "bg-red-500", text: "Very Weak" },
    { color: "bg-orange-500", text: "Weak" },
    { color: "bg-yellow-500", text: "Fair" },
    { color: "bg-blue-500", text: "Good" },
    { color: "bg-green-500", text: "Strong" },
  ];

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${bgColor}`}>
      {/* Background Elements */}
      <div className={`absolute inset-0 ${isDark ? "bg-grid-slate-900" : "bg-grid-slate-100"} mask-linear-to-0 dark:mask-linear-to-0-dark`} />

      {/* Animated blobs */}
      {isDark ? (
        <>
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-gray-800 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-gray-700 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </>
      ) : (
        <>
          <div className="absolute top-1/4 -left-20 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob" />
          <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000" />
        </>
      )}

      <Card className={`w-full max-w-md backdrop-blur-sm ${cardBg} ${borderColor} border-opacity-50 shadow-2xl relative z-10`}>
        <CardHeader className="space-y-4 pb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/auth/signin"
              className={`p-2 ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-100"} rounded-lg transition-all duration-300 group shrink-0`}
            >
              <ChevronLeft className={`h-5 w-5 ${isDark ? "text-gray-400 group-hover:text-white" : "text-gray-600 group-hover:text-gray-900"} transition-colors`} />
            </Link>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 flex items-center justify-center shadow-lg">
                <Lock className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className={`text-2xl font-bold ${isDark ? "bg-gradient-to-r from-white via-gray-200 to-gray-300" : "bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700"} bg-clip-text text-transparent`}>
                  Set New Password
                </CardTitle>
                <CardDescription className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Create a strong, secure password for your account
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="password" className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  New Password
                  <span className={`ml-2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                    (Min. 8 characters)
                  </span>
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"} group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors`} />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 pr-10 h-11 ${subtleBg} ${borderColor} focus:border-gray-600 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20 transition-all duration-300`}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"} transition-colors`}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className={isDark ? "text-gray-400" : "text-gray-600"}>
                        Password strength:
                      </span>
                      <span className={`font-medium ${passwordStrength === 5 ? 'text-green-600 dark:text-green-400' :
                        passwordStrength >= 3 ? 'text-blue-600 dark:text-blue-400' :
                          passwordStrength >= 2 ? 'text-yellow-600 dark:text-yellow-400' :
                            'text-red-600 dark:text-red-400'
                        }`}>
                        {strengthColors[passwordStrength - 1]?.text || "Very Weak"}
                      </span>
                    </div>
                    <div className={`h-2 ${isDark ? "bg-gray-800" : "bg-gray-200"} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full transition-all duration-500 ease-out ${strengthColors[passwordStrength - 1]?.color || (isDark ? 'bg-gray-700' : 'bg-gray-400')
                          }`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                    <div className={`grid grid-cols-2 gap-2 text-xs ${isDark ? "text-gray-400" : "text-gray-600"} mt-2`}>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')
                          }`} />
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')
                          }`} />
                        <span>Uppercase</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')
                          }`} />
                        <span>Number</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : (isDark ? 'bg-gray-700' : 'bg-gray-300')
                          }`} />
                        <span>Special char</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                  Confirm New Password
                </Label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"} group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors`} />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className={`pl-10 h-11 ${subtleBg} ${borderColor} focus:border-gray-600 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20 transition-all duration-300`}
                    required
                  />
                  {confirmPassword && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {password === confirmPassword ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-sm text-red-600 dark:text-red-400 animate-pulse">
                    Passwords do not match
                  </p>
                )}
                {confirmPassword && password === confirmPassword && password.length >= 8 && (
                  <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Passwords match
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading || password !== confirmPassword || passwordStrength < 3}
              className="w-full h-11 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg shadow-gray-500/25 dark:shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-500/40 dark:hover:shadow-gray-900/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting Password...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Reset Password
                </span>
              )}
            </Button>

            <div className={`pt-4 border-t ${isDark ? "border-gray-800" : "border-gray-200"}`}>
              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className={`text-sm ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} hover:underline inline-flex items-center gap-1 transition-colors`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back to Sign In
                </Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Add CSS for blob animation and masks */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .mask-linear-to-0 {
          mask-image: linear-gradient(0deg, white, rgba(255, 255, 255, 0.6));
        }
        .dark\\:mask-linear-to-0-dark {
          mask-image: linear-gradient(0deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.5));
        }
      `}</style>
    </div>
  );
}

// Wrapper component for Suspense boundary
export default function ResetPasswordPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";

  return (
    <Suspense
      fallback={
        <div className={`min-h-screen flex items-center justify-center relative ${bgColor}`}>
          <div className={`absolute inset-0 ${isDark ? "bg-grid-slate-900" : "bg-grid-slate-100"} mask-linear-to-0 dark:mask-linear-to-0-dark`} />
          <div className="relative z-10 text-center">
            <div className="relative">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200 dark:border-gray-800 border-t-gray-600 dark:border-t-gray-400 animate-spin"></div>
              <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-transparent border-t-gray-500 dark:border-t-gray-300 animate-spin" style={{ animationDelay: '-0.5s' }}></div>
            </div>
            <p className={`mt-6 font-medium animate-pulse ${isDark ? "text-gray-400" : "text-gray-600"}`}>
              Loading reset form...
            </p>
          </div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}