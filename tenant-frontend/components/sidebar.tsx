// components/sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Building2,
  X,
  Plus,
  LogOut,
  User,
  ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

// Define the organization type
interface Organization {
  id: string;
  name: string;
  role: "owner" | "member";
  plan: string;
}

interface SidebarProps {
  organization?: Organization; 
  open?: boolean;
  onClose?: () => void;
}

// Mock organizations data (This should ideally come from a data source)
const organizations: Organization[] = [
  {
    id: "1",
    name: "Acme Inc",
    role: "owner",
    plan: "Enterprise"
  },
  {
    id: "2", 
    name: "Startup XYZ",
    role: "member",
    plan: "Startup"
  },
  {
    id: "3",
    name: "Tech Solutions",
    role: "owner",
    plan: "Free"
  },
];

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Outlines", href: "/outlines", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar({ organization: initialOrganization, open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [selectedOrg, setSelectedOrg] = React.useState<Organization>(
    initialOrganization || organizations[0] 
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white dark:bg-[#101111] border-r border-gray-200 dark:border-gray-800 transform transition-all duration-300 ease-in-out lg:transform-none flex flex-col shadow-xl lg:shadow-none",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with Org Switcher */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-3 transition-all duration-200 w-full group">
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                  <Building2 className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                    {selectedOrg?.name || "Workspace"}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">
                    {selectedOrg?.role} • {selectedOrg?.plan}
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="right"
              align="start"
              sideOffset={10}
              className="w-72 bg-white dark:bg-[#101111] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1"
            >
              <DropdownMenuLabel className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-2">
                Organizations
              </DropdownMenuLabel>
              <div className="max-h-60 overflow-y-auto">
                {organizations.map((org) => (
                  <DropdownMenuItem 
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors",
                      selectedOrg?.id === org.id 
                        ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300" 
                        : "text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                    )}
                  >
                    <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center border border-gray-200 dark:border-gray-700">
                      <Building2 className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{org.name}</p>
                      <p className={cn(
                        "text-xs capitalize", 
                        selectedOrg?.id === org.id ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                      )}>
                        {org.role} • {org.plan}
                      </p>
                    </div>
                    {selectedOrg?.id === org.id && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <Plus className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Create New Organization</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Join Organization</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden shrink-0 h-9 w-9 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation - Increased overall padding to p-5 and increased space-y-2 */}
        <nav className="flex-1 p-5 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  // Increased vertical padding to py-3 and horizontal to px-4 for more internal space
                  "group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                  "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                  "hover:bg-gray-50 dark:hover:bg-gray-800",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-l-2 border-blue-500"
                    : "border-l-2 border-transparent"
                )}
                onClick={() => onClose?.()}
              >
                <item.icon 
                  className={cn(
                    "h-5 w-5 shrink-0 transition-colors mr-3",
                    isActive 
                      ? "text-blue-500" 
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  )} 
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-blue-500 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section - Increased padding to p-5 */}
        <div className="p-5 border-t border-gray-200 dark:border-gray-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Increased p-3 padding for the user button for more space */}
              <button className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg p-3 transition-all duration-200 w-full group">
                <Avatar className="h-8 w-8 border border-gray-200 dark:border-gray-700">
                  <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">
                    JD
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    John Doe
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    john@example.com
                  </p>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-gray-500 dark:text-gray-400 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              side="right"
              align="start"
              sideOffset={10}
              className="w-56 bg-white dark:bg-[#101111] border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-1"
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-3 py-2 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg border border-gray-200 dark:border-gray-700">
                    <AvatarFallback className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium">JD</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">John Doe</span>
                    <span className="truncate text-xs text-gray-500 dark:text-gray-400">john@example.com</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-1" />
              {/* Adjusted padding in dropdown items to p-2 for slightly more space */}
              <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                <Settings className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-sm">Account Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-1" />
              <DropdownMenuItem className="flex items-center gap-3 p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span className="font-medium text-sm">Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}