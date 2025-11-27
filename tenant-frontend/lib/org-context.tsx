// lib/org-context.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface Organization {
  id: string;
  name: string;
  role: "owner" | "member";
}

interface OrgContextType {
  currentOrg: Organization | null;
  setCurrentOrg: (org: Organization | null) => void;
  organizations: Organization[];
  isLoading: boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: React.ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load org from localStorage on mount
    const savedOrg = localStorage.getItem("currentOrg");
    if (savedOrg) {
      try {
        const parsedOrg = JSON.parse(savedOrg);
        // Use setTimeout to avoid setting state during render
        setTimeout(() => {
          setCurrentOrg(parsedOrg);
          setIsLoading(false);
        }, 0);
      } catch {
        localStorage.removeItem("currentOrg");
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleSetCurrentOrg = (org: Organization | null) => {
    setCurrentOrg(org);
    if (org) {
      localStorage.setItem("currentOrg", JSON.stringify(org));
    } else {
      localStorage.removeItem("currentOrg");
    }
  };

  return (
    <OrgContext.Provider
      value={{
        currentOrg,
        setCurrentOrg: handleSetCurrentOrg,
        organizations,
        isLoading,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
}
