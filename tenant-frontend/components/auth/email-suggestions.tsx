// components/ui/email-suggestions.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Mail, X, ArrowRight } from "lucide-react";

const EMAIL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "protonmail.com",
  "aol.com",
  "zoho.com",
  "yandex.com",
  "mail.com",
  "gmx.com",
];

interface EmailSuggestionsProps {
  email: string;
  onEmailChange: (email: string) => void;
  disabled?: boolean;
}

export function EmailSuggestions({
  email,
  onEmailChange,
  disabled = false,
}: EmailSuggestionsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const borderColor = isDark ? "border-white/20" : "border-gray-900/20";
  const hoverBg = isDark ? "hover:bg-white/10" : "hover:bg-gray-900/10";
  const mutedText = isDark ? "text-gray-400" : "text-gray-600";

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate suggestions
  useEffect(() => {
    const value = email.trim();
    if (!value.includes("@") || value.endsWith("@")) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const atIndex = value.indexOf("@");
    const username = value.substring(0, atIndex);
    const domainPart = value.substring(atIndex + 1).toLowerCase();

    if (username && domainPart) {
      const matches = EMAIL_DOMAINS
        .filter(d => d.startsWith(domainPart))
        .slice(0, 6)
        .map(d => `${username}@${d}`);

      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [email]);

  // Click suggestion → update email + close immediately
  const selectSuggestion = (suggestion: string) => {
    onEmailChange(suggestion);
    setShowSuggestions(false); // This closes it instantly
  };

  if (!showSuggestions || suggestions.length === 0 || disabled) return null;

  return (
    <div
      ref={suggestionsRef}
      className={`absolute z-50 w-full mt-2 rounded-2xl border ${borderColor} ${bgColor} ${textColor} shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-xs font-semibold flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" />
          Did you mean...
        </span>
        <button
          onClick={() => setShowSuggestions(false)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Suggestions */}
      <div className="max-h-64 overflow-y-auto">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            type="button"
            onClick={() => selectSuggestion(suggestion)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${hoverBg} transition-all duration-200 group`}
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="h-4.5 w-4.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{suggestion}</p>
            </div>
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-1 transition-all text-primary" />
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 text-center border-t border-white/10 bg-white/5">
        <span className={`text-xs ${mutedText}`}>
          {suggestions.length} suggestion{suggestions.length > 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}