import { useState, useEffect, useRef } from "react";
import { Mail, ChevronDown, X, ArrowRight } from "lucide-react";

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
  disabled = false 
}: EmailSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle click outside of suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Generate email suggestions
  useEffect(() => {
    const emailValue = email.trim();
    if (!emailValue.includes("@") || emailValue.endsWith("@")) {
      setSuggestions([]);
      return;
    }

    const atIndex = emailValue.indexOf("@");
    const username = emailValue.substring(0, atIndex);
    const partialDomain = emailValue.substring(atIndex + 1).toLowerCase();

    if (username && partialDomain) {
      const newSuggestions = EMAIL_DOMAINS.filter((d) =>
        d.startsWith(partialDomain)
      )
        .map((d) => `${username}@${d}`)
        .slice(0, 5);

      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [email]);

  const handleSuggestionSelect = (suggestion: string) => {
    onEmailChange(suggestion);
    setShowSuggestions(false);
  };

  return (
    <>
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 rounded-xl shadow-2xl bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl border border-gray-200/80 dark:border-gray-700/80 overflow-hidden"
        >
          <div className="p-3 border-b border-gray-100/50 dark:border-gray-800/50 flex justify-between items-center bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-gray-800/50 dark:to-gray-800/30">
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              Email suggestions
            </span>
            <button
              type="button"
              onClick={() => setShowSuggestions(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
            >
              <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100/50 dark:divide-gray-800/50">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
                type="button"
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 block truncate">
                    {suggestion}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 block">
                    Click to select
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
          <div className="p-2 text-center border-t border-gray-100/50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/50">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} available
            </span>
          </div>
        </div>
      )}
    </>
  );
}