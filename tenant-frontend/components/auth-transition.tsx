"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function useAuthTransition() {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);

  const navigate = (path: string) => {
    setIsExiting(true);
    setTimeout(() => router.push(path), 400);
  };

  const transitionClass = isExiting
    ? "opacity-0 translate-y-8"
    : "opacity-100 translate-y-0";

  return {
    navigate,
    transitionClass: `transition-all duration-500 ease-out ${transitionClass}`,
  };
}
