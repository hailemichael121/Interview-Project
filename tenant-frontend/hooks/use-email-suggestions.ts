import { useState, useEffect, useRef } from "react";

export function useEmailSuggestions(email: string) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  return {
    suggestions,
    showSuggestions,
    setShowSuggestions,
    suggestionsRef,
  };
}