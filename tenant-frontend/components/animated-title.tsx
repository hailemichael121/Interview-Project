"use client";

import React, { useEffect, useState } from "react";

interface AnimatedTitleProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isOverWave?: boolean;
  resolvedTheme?: string;
}

export function AnimatedTitle({
  text = "Tenant Activity",
  className = "",
  size = "lg",
  isOverWave = false,
  resolvedTheme = "light",
}: AnimatedTitleProps) {
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  const sizeClasses = {
    sm: "text-4xl sm:text-5xl",
    md: "text-5xl sm:text-6xl md:text-7xl",
    lg: "text-6xl sm:text-7xl md:text-8xl",
    xl: "text-7xl sm:text-8xl md:text-9xl",
  };

  // Get text color based on theme and wave position
  const getTextColor = () => {
    const isDark = resolvedTheme === "dark";

    if (isDark) {
      // In dark mode, always use white text
      return "text-white";
    }

    // In light mode, change color based on wave position
    return isOverWave ? "text-gray-900" : "text-white";
  };

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 80);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);
    return () => clearInterval(interval);
  }, [index, text]);

  const textColor = getTextColor();

  return (
    <div key={text} className="flex justify-center overflow-visible">
      <style jsx global>{`
        @keyframes blink-underscore {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0;
          }
        }
      `}</style>

      <h1
        className={`
          font-bold tracking-tight whitespace-nowrap
          drop-shadow-lg transition-colors duration-300
          ${textColor}
          ${sizeClasses[size]}
          ${className}
        `}
      >
        <span className="inline-block">{displayText}</span>

        <span
          aria-hidden="true"
          className={`inline-block ml-1 align-bottom font-bold ${textColor}`}
          style={{
            fontSize: "1.1em",
            lineHeight: "1",
            opacity: showCursor && index >= text.length ? 1 : 0,
            animation: "blink-underscore 1s steps(1) infinite",
          }}
        >
          _
        </span>
      </h1>

      <span className="sr-only">{text}</span>
    </div>
  );
}
