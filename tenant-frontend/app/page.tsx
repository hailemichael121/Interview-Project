"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Users, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatedTitle } from "@/components/animated-title";
import { useEffect, useState, useRef } from "react";
import { Logo } from "@/components/logo";

export default function HomePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOverWave, setIsOverWave] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!textRef.current || !waveRef.current) return;

      const textRect = textRef.current.getBoundingClientRect();
      const waveRect = waveRef.current.getBoundingClientRect();

      // Calculate if text is overlapping with the wave's lighter sections
      const isOverlapping = textRect.bottom > waveRect.top + 100;

      setIsOverWave(isOverlapping);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Get text colors based on theme and wave position
  const getTextColors = () => {
    const isDark = resolvedTheme === "dark";

    if (isDark) {
      // In dark mode, always use white text for best visibility
      return {
        title: "text-white",
        subtitle: "text-white",
        description: "text-white",
      };
    }

    // In light mode, change color based on wave position
    if (isOverWave) {
      return {
        title: "text-gray-900",
        subtitle: "text-gray-950",
        description: "text-gray-800",
      };
    }

    // Default for light mode when not over wave
    return {
      title: "text-white",
      subtitle: "text-white",
      description: "text-white",
    };
  };

  const textColors = getTextColors();

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-64 h-64 mx-auto mb-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
          <AnimatedTitle />
          <h2 className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-100 mt-6">
            <span className="font-semibold text-gray-600 dark:text-gray-300">
              Tenancy, Connectivity, and Collaboration.
            </span>
          </h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-4 max-w-3xl mx-auto">
            A modern, collaborative multi-tenant platform for team management
            and project outlines.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full-Screen Fixed Wave Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <svg
          ref={waveRef}
          className="absolute bottom-0 left-0 w-full h-[120vh]"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="wave-light" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2C3E50" />
              <stop offset="30%" stopColor="#5D768B" />
              <stop offset="70%" stopColor="#94A3B8" />
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
            d="M0,400L48,380C96,360,192,320,288,310C384,300,480,320,576,350C672,380,768,420,864,440C960,460,1056,460,1152,440C1248,420,1344,380,1392,360L1440,340L1440,800L0,800Z"
          />
          <path
            fill="url(#wave-dark)"
            className="hidden dark:block"
            fillOpacity="0.9"
            d="M0,400L48,380C96,360,192,320,288,310C384,300,480,320,576,350C672,380,768,420,864,440C960,460,1056,460,1152,440C1248,420,1344,380,1392,360L1440,340L1440,800L0,800Z"
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen isolation">
        <div className="container mx-auto px-4 py-16">
          <div ref={textRef} className="text-center mb-20 pt-8">
            <div className="flex justify-center">
              <Logo className="w-40 h-40 mb-8" />
            </div>

            <AnimatedTitle
              isOverWave={isOverWave}
              resolvedTheme={resolvedTheme}
            />

            {/* Dynamic text color based on theme and wave overlap */}
            <h2
              className={`text-2xl md:text-4xl font-medium mt-8 max-w-5xl mx-auto transition-colors duration-300 ${textColors.title}`}
            >
              <span
                className={`font-bold drop-shadow-lg ${textColors.subtitle}`}
              >
                Tenancy, Connectivity, and Collaboration.
              </span>
            </h2>

            <p
              className={`text-lg md:text-xl mt-6 max-w-4xl mx-auto leading-relaxed font-medium drop-shadow-md transition-colors duration-300 ${textColors.description}`}
            >
              A modern, collaborative multi-tenant platform for team management
              and project outlines.
            </p>
          </div>

          {/* Rest of your content remains the same */}
          <div className="grid md:grid-cols-3 gap-8 mb-24 mt-12">
            <Card className="border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-700 dark:text-gray-200" />
                </div>
                <CardTitle className="text-gray-800 dark:text-white text-xl">
                  Outline Management
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Create and manage project outlines with progress tracking and
                  team collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Real-time progress tracking</li>
                  <li>• Team collaboration features</li>
                  <li>• Status and review management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-gray-700 dark:text-gray-200" />
                </div>
                <CardTitle className="text-gray-800 dark:text-white text-xl">
                  Team Collaboration
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Invite team members, manage roles, and collaborate efficiently
                  across organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Role-based access control</li>
                  <li>• Team member management</li>
                  <li>• Organization switching</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 shadow-xl bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-gray-700 dark:text-gray-200"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 10H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2v8Z" />
                    <path d="M10 10H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2v8Z" />
                    <path d="M10 18H8a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2v8Z" />
                    <path d="M10 22H8a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2v8Z" />
                    <path d="M14 10h-2V2h2a2 2 0 0 1 2 2v6Z" />
                    <path d="M14 18h-2v-8h2a2 2 0 0 1 2 2v6Z" />
                    <path d="M14 22h-2v-4h2a2 2 0 0 1 2 2v2Z" />
                    <path d="M18 10h-2V2h2a2 2 0 0 1 2 2v6Z" />
                    <path d="M18 18h-2v-8h2a2 2 0 0 1 2 2v6Z" />
                    <path d="M18 22h-2v-4h2a2 2 0 0 1 2 2v2Z" />
                  </svg>
                </div>
                <CardTitle className="text-gray-800 dark:text-white text-xl">
                  Multi-Tenant
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Work across multiple organizations with isolated data and
                  secure access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li>• Multiple organization support</li>
                  <li>• Data isolation and security</li>
                  <li>• Seamless organization switching</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center py-16">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl p-12 border-2 border-gray-300 dark:border-gray-600 max-w-3xl mx-auto shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-50 mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-gray-800 dark:text-gray-200 mb-10 font-medium">
                Join your organization or create a new one to start
                collaborating with your team.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth/signin">
                  <Button
                    size="lg"
                    className="text-lg px-10 h-14 rounded-2xl bg-blue-950 hover:bg-blue-900 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Sign In to Workspace
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-10 h-14 border-2 border-gray-400 dark:border-gray-500 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-500 dark:hover:border-gray-400 transition-all duration-300 font-semibold"
                  >
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
