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
import { FileText, Users, ArrowRight, LayoutGrid } from "lucide-react";
import { useTheme } from "next-themes";
import { AnimatedTitle } from "@/components/animated-title";
import { useEffect, useState, useRef } from "react";
import { Logo } from "@/components/logo";
import { GradientBackground } from "@/components/auth/gradient-background";

export default function HomePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOverWave, setIsOverWave] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!textRef.current || !waveRef.current) return;
      const textRect = textRef.current.getBoundingClientRect();
      const waveRect = waveRef.current.getBoundingClientRect();
      const isOverlapping = textRect.bottom > waveRect.top + 100;
      setIsOverWave(isOverlapping);
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const getTextColors = () => {
    const isDark = resolvedTheme === "dark";
    if (isDark) {
      return {
        title: "text-white",
        subtitle: "text-white",
        description: "text-white",
      };
    }
    return isOverWave
      ? {
        title: "text-gray-900",
        subtitle: "text-gray-950",
        description: "text-gray-800",
      }
      : {
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
      <GradientBackground />

      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div ref={textRef} className="text-center mb-20 pt-8">
            <div className="flex justify-center">
              <Logo className="w-40 h-40 mb-8" />
            </div>

            <AnimatedTitle
              isOverWave={isOverWave}
              resolvedTheme={resolvedTheme}
            />

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

          <div className="grid md:grid-cols-3 gap-8 mb-24 mt-12">
            {[
              {
                icon: <FileText className="h-8 w-8" />,
                title: "Outline Management",
                desc: "Create and manage project outlines with progress tracking and team collaboration",
                features: [
                  "Real-time progress tracking",
                  "Team collaboration features",
                  "Status and review management",
                ],
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Team Collaboration",
                desc: "Invite team members, manage roles, and collaborate efficiently across organizations",
                features: [
                  "Role-based access control",
                  "Team member management",
                  "Organization switching",
                ],
              },
              {
                icon: <LayoutGrid className="h-8 w-8" />,
                title: "Multi-Tenant",
                desc: "Work across multiple organizations with isolated data and secure access controls",
                features: [
                  "Multiple organization support",
                  "Data isolation and security",
                  "Seamless organization switching",
                ],
              },
            ].map((item, i) => (
              <Card
                key={i}
                className="border border-gray-200/70 dark:border-gray-700/70 
                  bg-white/40 dark:bg-gray-800/30 
                  backdrop-blur-xl rounded-2xl overflow-hidden"
              >
                <CardHeader className="pb-6">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5
                      bg-linear-to-br from-gray-100 to-gray-200 
                      dark:from-gray-700 dark:to-gray-800 
                      ring-4 ring-white/60 dark:ring-gray-900/40"
                  >
                    <div className="text-gray-900 dark:text-gray-100">
                      {item.icon}
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-muted-foreground mt-4">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
                    {item.desc}
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 text-muted-foreground">
                    {item.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <span className="text-gray-600 dark:text-gray-400 font-bold">
                          •
                        </span>
                        <span className="text-sm md:text-base">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center py-16">
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl p-12 border-2 border-gray-300 dark:border-gray-600 max-w-3xl mx-auto">
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
                    className="text-lg px-10 h-14 rounded-2xl bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 font-semibold"
                  >
                    Sign In to Workspace
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-10 h-14 rounded-2xl border-2 border-gray-400 dark:border-gray-600 
                      text-gray-900 dark:text-gray-100 font-semibold"
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
