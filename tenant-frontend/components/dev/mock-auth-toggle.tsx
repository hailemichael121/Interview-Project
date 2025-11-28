"use client";

import { useEffect, useState } from "react";
import { setUseMockAuth } from "@/lib/auth-client";

export default function MockAuthToggle() {
  // Don't render anything until mounted to avoid SSR/client DOM mismatch.
  const [state, setState] = useState<{ mounted: boolean; enabled: boolean }>(() => ({ mounted: false, enabled: false }));

  useEffect(() => {
    const v = localStorage.getItem("use-mock-auth");
    const enabledVal = v === null ? true : v === "true";
    // single setState call to avoid multiple synchronous state updates
    setState({ mounted: true, enabled: enabledVal });
  }, []);

  if (!state.mounted) return null;

  function toggle() {
    const next = !state.enabled;
    setState((s) => ({ ...s, enabled: next }));
    setUseMockAuth(next);
    // reload so other modules pick up the change (simple & reliable)
    window.location.reload();
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={toggle}
        title="Toggle mock auth (dev only)"
        className={`px-3 py-1 rounded-md text-sm font-medium ${state.enabled ? "bg-green-600 text-white" : "bg-gray-700 text-white"}`}
      >
        {state.enabled ? "MockAuth: ON" : "MockAuth: OFF"}
      </button>
    </div>
  );
}
