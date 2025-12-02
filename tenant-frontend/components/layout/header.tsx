"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Search, Menu, Plus, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  onMenuClick: () => void;
  organization?: {
    id: string;
    name: string;
    role: "owner" | "member";
  };
}

export function Header({ onMenuClick, organization }: HeaderProps) {
  return (
    <header className="bg-milky-white dark:bg-dark-gray border-b border-light-300 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="hidden sm:block">
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-black-gray dark:text-milky-white">
                Outlines
              </h1>
              {organization && (
                <Badge variant="secondary" className="capitalize">
                  {organization.role}
                </Badge>
              )}
            </div>
            <p className="text-sm icon-muted">
              {organization?.name || "Select Organization"}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex-1 max-w-2xl mx-4">
          <div className="flex items-center space-x-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 icon-muted" />
              <Input
                placeholder="Search outlines, sections, or content..."
                className="pl-10 input-default border-0 focus-ring-visible"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          <Button variant="default" size="sm" className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>

          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-950"></span>
          </Button>

          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-linear-to-br from-gray-900 to-gray-700 text-white text-sm">
                JD
              </AvatarFallback>
            </Avatar>

            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}
