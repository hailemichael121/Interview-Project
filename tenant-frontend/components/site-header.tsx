// components/site-header.tsx
"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useOrg } from "@/lib/org-context";

export function SiteHeader() {
  const { currentOrg } = useOrg();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <div className="flex items-center gap-2 px-4">
        <h1 className="text-xl font-semibold">
          {currentOrg?.name || "Workspace"}
        </h1>
      </div>
      <div className="flex flex-1 items-center gap-2">
        <form className="w-full md:max-w-2xl">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search outlines, sections, or content..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>
    </header>
  );
}
