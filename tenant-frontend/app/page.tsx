// app/page.tsx
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
import Image from "next/image";
import { useTheme } from "next-themes";
import { AnimatedTitle } from "@/components/animated-title";
import React, { useEffect, useState } from "react";

export default function HomePage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // ONLY ONE useEffect — this is the official next-themes pattern
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const logoSrc = isDark
    ? "/images/tenant-dark.png"
    : "/images/tenant-light.png";

  if (!mounted) {
    return (
      <div className="min-h-screen bg-brand-vapor-gray dark:bg-[hsl(var(--background))]">
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="w-64 h-64 mx-auto mb-8 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
          <AnimatedTitle />
          <h2 className="text-2xl md:text-3xl font-medium text-brand-deep-steel dark:text-white mt-6">
            <span className="font-semibold text-brand-slate-glass dark:text-gray-400">
              Tenancy, Connectivity, and Collaboration.
            </span>
          </h2>
          <p className="text-lg text-brand-slate-glass dark:text-gray-400 mt-4 max-w-3xl mx-auto">
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
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#5D768B" />
              <stop offset="100%" stopColor="#2C3E50" />
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

      {/* Content — Scrolls Over Wave */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Hero */}
          <div className="text-center mb-20">
            <div className="flex justify-center">
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-10">
                <Image
                  src={logoSrc}
                  alt="Tenant Logo"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>

            <AnimatedTitle />
            <h2 className="text-2xl md:text-4xl font-medium text-brand-deep-steel dark:text-white mt-8 max-w-5xl mx-auto">
              <span className="font-bold text-brand-slate-glass dark:text-gray-300">
                Tenancy, Connectivity, and Collaboration.
              </span>
            </h2>
            <p className="text-lg md:text-xl text-brand-slate-glass dark:text-gray-400 mt-6 max-w-4xl mx-auto leading-relaxed">
              A modern, collaborative multi-tenant platform for team management
              and project outlines.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-24">
            {/* Your 3 cards */}
            <Card className="border-brand-fog-blue dark:border-gray-700 shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-brand-vapor-gray dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-brand-deep-steel dark:text-gray-300" />
                </div>
                <CardTitle className="text-brand-deep-steel dark:text-white text-xl">
                  Outline Management
                </CardTitle>
                <CardDescription className="text-brand-slate-glass dark:text-white ">
                  Create and manage project outlines with progress tracking and
                  team collaboration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-brand-slate-glass dark:text-white">
                  <li>• Real-time progress tracking</li>
                  <li>• Team collaboration features</li>
                  <li>• Status and review management</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-brand-fog-blue dark:border-gray-700 shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-brand-vapor-gray dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-brand-deep-steel dark:text-gray-300" />
                </div>
                <CardTitle className="text-brand-deep-steel dark:text-white text-xl">
                  Team Collaboration
                </CardTitle>
                <CardDescription className="text-brand-slate-glass  dark:text-white">
                  Invite team members, manage roles, and collaborate efficiently
                  across organizations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-brand-slate-glass  dark:text-white">
                  <li>• Role-based access control</li>
                  <li>• Team member management</li>
                  <li>• Organization switching</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-brand-fog-blue dark:border-gray-700 shadow-xl">
              <CardHeader>
                <div className="w-14 h-14 bg-brand-vapor-gray dark:bg-gray-800 rounded-xl flex items-center justify-center mb-4">
                  <svg
                    className="h-8 w-8 text-brand-deep-steel dark:text-gray-300"
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
                <CardTitle className="text-brand-deep-steel dark:text-white text-xl">
                  Multi-Tenant
                </CardTitle>
                <CardDescription className="text-brand-slate-glass  dark:text-white">
                  Work across multiple organizations with isolated data and
                  secure access controls
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-brand-slate-glass  dark:text-white">
                  <li>• Multiple organization support</li>
                  <li>• Data isolation and security</li>
                  <li>• Seamless organization switching</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center py-16">
            <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-3xl p-12 border border-brand-fog-blue dark:border-gray-700 max-w-3xl mx-auto shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-bold text-brand-deep-steel dark:text-white mb-6">
                Ready to get started?
              </h2>
              <p className="text-xl text-brand-slate-glass dark:text-gray-300 mb-10">
                Join your organization or create a new one to start
                collaborating with your team.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/auth/signin">
                  <Button
                    size="lg"
                    className="text-lg px-10 h-14 bg-brand-deep-steel hover:opacity-90 text-white"
                  >
                    Sign In to Workspace
                    <ArrowRight className="ml-3 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-lg px-10 h-14 border-2"
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
