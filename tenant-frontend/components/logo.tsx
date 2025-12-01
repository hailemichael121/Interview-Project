"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "w-40 h-40" }: { className?: string }) {
  const { resolvedTheme } = useTheme();

  const isDark = resolvedTheme === "dark";

  return (
    <div className={`${className} relative flex items-center justify-center`}>
      <Link href="/" className="block relative">
        {/* Outlined Border Ring (curved, elegant) */}
        <div
          className={`
            absolute inset-0 rounded-3xl 
            border-2
            ${
              isDark
                ? "border-white/40 shadow-white/20"
                : "border-gray-900/30 shadow-gray-900/10"
            }
            shadow-2xl 
            scale-110 
            -z-10
            transition-all duration-500
            group-hover:scale-125
          `}
        />

        {/* Actual Logo Image (must be transparent PNG!) */}
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
