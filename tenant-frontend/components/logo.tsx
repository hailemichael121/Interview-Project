"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";

export function Logo({ className = "w-40 h-40" }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  // Determine the correct image source based on the theme
  const src =
    resolvedTheme === "dark" ? "/tenant-dark.png" : "/tenant-light.png";
  const altText =
    resolvedTheme === "dark" ? "Tenant Logo Dark" : "Tenant Logo Light";

  return (
    <div className={`${className} flex items-center justify-center`}>
      <Link href="/" className="inline-block mb-12">
        <Image
          // Use a single Image tag and dynamically set the src
          src={src}
          alt={altText}
          width={160}
          height={160}
          // The styling remains, but the source is explicitly controlled by React state
          className="rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300"
        />
      </Link>
    </div>
  );
}
