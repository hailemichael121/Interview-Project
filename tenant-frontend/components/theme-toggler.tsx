/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggler({ compact = false }: { compact?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "rounded-full bg-muted animate-pulse",
          compact ? "w-10 h-6" : "w-14 h-8"
        )}
      />
    );
  }

  const isDark =
    theme === "dark" || (theme === "system" && systemTheme === "dark");

  const toggleTheme = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "group relative rounded-full p-1 transition-all duration-500 overflow-hidden",
        compact ? "w-10 h-6" : "w-14 h-8",
        "bg-linear-to-r from-background to-card dark:from-background dark:to-card",
        "ring-2 ring-border dark:ring-border ring-offset-1 ring-offset-background",
        "hover:scale-100 hover:ring-1 hover:ring-primary/50",
        "shadow-lg hover:shadow-2xl shadow-black/5"
      )}
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      <div
        className={cn(
          "absolute inset-1 rounded-full transition-all duration-500 ease-in-out",
          "bg-linear-to-br",
          isDark
            ? "from-primary/70 via-primary to-primary/90 translate-x-full"
            :
            "from-secondary/70 via-secondary to-secondary/90 translate-x-0"
        )}
      />

      <div
        className={cn(
          "relative z-10 rounded-full transition-all duration-500 flex items-center justify-center",
          compact ? "w-4 h-4" : "w-6 h-6",
          "shadow-2xl",
          "bg-card dark:bg-background",
          "ring-4 ring-primary/50 dark:ring-primary/50",
          isDark ? "translate-x-full" : "translate-x-0"
        )}
      >
        <Sun
          className={cn(
            "absolute h-4 w-4 transition-all duration-500",
            "text-primary",
            isDark
              ? "rotate-180 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100"
          )}
        />
        <Moon
          className={cn(
            "absolute h-4 w-4 transition-all duration-500",
            "text-foreground",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-180 scale-0 opacity-0"
          )}
        />

        {isDark && compact && (
          <Sparkles className="absolute -top-1 -right-1 h-2 w-2 text-secondary animate-pulse" />
        )}
        {isDark && !compact && (
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-secondary animate-pulse" />
        )}
      </div>

      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full blur-xl transition-opacity duration-500",
          isDark ? "opacity-40" : "opacity-20",
          "bg-linear-to-r",
          isDark
            ? "from-primary/30 via-primary/30 to-primary/30"
            :
            "from-secondary/30 via-secondary/30 to-secondary/30"
        )}
      />
    </button>
  );
}
