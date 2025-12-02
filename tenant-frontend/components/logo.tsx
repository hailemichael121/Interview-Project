"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Logo({ className = "w-40 h-40" }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={`${className} relative flex items-center justify-center`}>
        <div className="w-full h-full rounded-3xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
      </div>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <Link href="/" className="block relative group">
        <div
          className={`
            absolute inset-0 rounded-3xl border-2
            ${isDark ? "border-white/40" : "border-gray-900/30"}
            shadow-2xl scale-110 -z-10
            transition-transform duration-500
            group-hover:scale-125
          `}
        />

        <Image
          src={isDark ? "/tenant-dark.png" : "/tenant-light.png"}
          alt="Tenant Logo"
          width={160}
          height={160}
          className="relative z-10 object-contain rounded-3xl bg-transparent"
          priority
          unoptimized
        />
      </Link>
    </div>
  );
}
