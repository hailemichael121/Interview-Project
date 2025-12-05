"use client";

import { useState } from "react";
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
import {
  ChevronLeft,
  Mail,
  CheckCircle2,
  Shield,
  Clock,
  AlertCircle,
  Send
} from "lucide-react";
import authClient from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const { resolvedTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const borderColor = isDark ? "border-gray-800" : "border-gray-300";
  const subtleBg = isDark ? "bg-gray-900/50" : "bg-white/50";
  const cardBg = isDark ? "bg-gray-700" : "bg-white/80";
  const successBg = isDark ? "bg-green-900/30" : "bg-green-100";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
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
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      toast.success("Reset link sent successfully!", {
        description: "Check your inbox for instructions",
        icon: <Send className="h-5 w-5 text-green-500" />,
      });

      console.log("✅ Reset email requested successfully:", data);
    } catch (error: unknown) {
      console.error("❌ Reset request error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to send reset email";
      toast.error("Failed to send reset link", {
        description: errorMessage,
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) {
      toast.info(`Please wait ${countdown} seconds before requesting again`);
      return;
    }

    await handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden ${bgColor}`}>
      <div className={`absolute inset-0 ${isDark ? "bg-grid-slate-900" : "bg-grid-slate-100"} mask-linear-to-0 dark:mask-linear-to-0-dark`} />

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
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 flex items-center justify-center shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className={`text-2xl font-bold ${isDark ? "bg-linear-to-r from-white via-gray-200 to-gray-300" : "bg-linear-to-r from-gray-900 via-gray-800 to-gray-700"} bg-clip-text text-transparent`}>
                  Reset Password
                </CardTitle>
                <CardDescription className={isDark ? "text-gray-400" : "text-gray-600"}>
                  {emailSent ? "Check your email for instructions" : "Secure your account access"}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {emailSent ? (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className={`mx-auto w-20 h-20 rounded-full ${successBg} flex items-center justify-center`}>
                  <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
                <div className="space-y-2">
                  <h3 className={`text-lg font-semibold ${textColor}`}>
                    Reset Link Sent!
                  </h3>
                  <p className={`text-sm leading-relaxed ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                    We&apos;ve sent a password reset link to{" "}
                    <span className={`font-medium ${textColor} ${isDark ? "bg-gray-800/50" : "bg-gray-100"} px-2 py-1 rounded`}>
                      {email}
                    </span>
                  </p>
                </div>
              </div>

              <div className={`space-y-4 rounded-xl border ${isDark ? "border-gray-800/50" : "border-gray-200/50"} ${isDark ? "bg-gray-800/20" : "bg-gray-50/50"} p-4`}>
                <div className="flex items-start gap-3">
                  <Mail className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-600"} mt-0.5`} />
                  <div className="space-y-1">
                    <h4 className={`font-medium ${textColor}`}>
                      What&apos;s next?
                    </h4>
                    <ul className={`space-y-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                      <li className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-gray-500" : "bg-gray-400"} mt-1.5`} />
                        Check your inbox for our email
                      </li>
                      <li className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-gray-500" : "bg-gray-400"} mt-1.5`} />
                        Click the secure reset link
                      </li>
                      <li className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isDark ? "bg-gray-500" : "bg-gray-400"} mt-1.5`} />
                        Create your new password
                      </li>
                    </ul>
                  </div>
                </div>

                <div className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-500" : "text-gray-400"} pt-2 border-t ${isDark ? "border-gray-800/30" : "border-gray-200/30"}`}>
                  <Clock className="h-4 w-4" />
                  <span>Link expires in 1 hour • {countdown > 0 ? `Resend available in ${countdown}s` : 'Ready to resend'}</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  onClick={handleResendEmail}
                  disabled={countdown > 0 || isLoading}
                  className="w-full bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg shadow-gray-500/25 dark:shadow-gray-900/25 transition-all duration-300"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Email'}
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className={`flex-1 ${borderColor} ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"} transition-all duration-300`}
                    onClick={() => setEmailSent(false)}
                  >
                    Use Different Email
                  </Button>
                  <Button
                    asChild
                    variant="ghost"
                    className={`flex-1 ${isDark ? "hover:bg-gray-800/50" : "hover:bg-gray-100"} transition-colors`}
                  >
                    <Link href="/auth/signin" className="flex items-center gap-2">
                      <ChevronLeft className="h-4 w-4" />
                      Back to Sign In
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className={`h-4 w-4 ${isDark ? "text-gray-400" : "text-gray-500"} group-focus-within:text-gray-600 dark:group-focus-within:text-gray-300 transition-colors`} />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className={`pl-10 h-11 ${subtleBg} ${borderColor} focus:border-gray-600 dark:focus:border-gray-400 focus:ring-2 focus:ring-gray-500/20 dark:focus:ring-gray-400/20 transition-all duration-300`}
                      required
                    />
                  </div>
                  <p className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"} pt-1`}>
                    Enter your account email to receive a secure reset link
                  </p>
                </div>

                <div className={`rounded-lg border ${isDark ? "border-gray-800" : "border-gray-200"} ${isDark ? "bg-gray-800/30" : "bg-gray-50/50"} p-4`}>
                  <div className="flex items-start gap-3">
                    <Shield className={`h-5 w-5 ${isDark ? "text-gray-400" : "text-gray-600"} mt-0.5`} />
                    <div className="space-y-1">
                      <p className={`text-sm font-medium ${textColor}`}>
                        Security Note
                      </p>
                      <p className={`text-xs ${isDark ? "text-gray-400" : "text-gray-600"}`}>
                        The reset link will be valid for 1 hour. Never share your password reset links with anyone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-lg shadow-gray-500/25 dark:shadow-gray-900/25 hover:shadow-xl hover:shadow-gray-500/40 dark:hover:shadow-gray-900/40 transition-all duration-300"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Sending Reset Link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
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
                    Remember your password? Sign in
                  </Link>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

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