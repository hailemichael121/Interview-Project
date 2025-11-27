"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggler() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-14 h-8 rounded-full bg-muted animate-pulse" />;
  }

  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative w-14 h-8 rounded-full p-1 transition-all duration-500 overflow-hidden", // Added overflow-hidden to contain movement
        "bg-gradient-to-r from-background to-card dark:from-background dark:to-card",
        "ring-2 ring-border dark:ring-border ring-offset-1 ring-offset-background",
        "hover:scale-100 hover:ring-1 hover:ring-primary/50",
        "shadow-lg hover:shadow-2xl shadow-black/5"
      )}
      aria-label="Toggle theme"
    >
      {/* Sliding Background Blob - Now uses brand colors and is contained */}
      <div
        className={cn(
          "absolute inset-1 rounded-full transition-all duration-500 ease-in-out",
          "bg-gradient-to-br",
          // Dark Mode Blob: Primary/Foreground
          isDark
            ? "from-primary/70 via-primary to-primary/90 translate-x-full" // Corrected translate to x-full
            : // Light Mode Blob: Secondary/Muted
              "from-secondary/70 via-secondary to-secondary/90 translate-x-0"
        )}
      />

      {/* Floating Orb (the actual toggle) - Now correctly constrained */}
      <div
        className={cn(
          "relative z-10 w-6 h-6 rounded-full transition-all duration-500",
          "shadow-2xl flex items-center justify-center",
          "bg-card dark:bg-background",
          "ring-4 ring-primary/50 dark:ring-primary/50",
          isDark ? "translate-x-full" : "translate-x-0" // Corrected translate to x-full
        )}
      >
        {/* Sun Icon: Visible in Light Mode, hidden in Dark */}
        <Sun
          className={cn(
            "absolute h-4 w-4 transition-all duration-500",
            "text-primary", // Light mode icon color: Deep Steel
            isDark
              ? "rotate-180 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        {/* Moon Icon: Visible in Dark Mode, hidden in Light */}
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-500",
            "text-foreground", // Dark mode icon color: Brighter text
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-180 scale-0 opacity-0"
          )}
        />

        {/* Tiny sparkle on dark mode */}
        {isDark && (
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-secondary animate-pulse" />
        )}
      </div>

      {/* Subtle glow */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full blur-xl transition-opacity duration-500",
          isDark ? "opacity-40" : "opacity-20",
          "bg-gradient-to-r",
          // Dark Mode Glow
          isDark
            ? "from-primary/30 via-primary/30 to-primary/30"
            : // Light Mode Glow
              "from-secondary/30 via-secondary/30 to-secondary/30"
        )}
      />
    </button>
  );
}
