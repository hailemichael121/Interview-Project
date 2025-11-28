"use client";

import { useTheme } from "next-themes";

export function Logo({ className = "w-40 h-40" }: { className?: string }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  
  return (
    <div className={`${className} flex items-center justify-center`}>
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl">
        <span className="text-white font-bold text-3xl">T</span>
      </div>
    </div>
  );
}


