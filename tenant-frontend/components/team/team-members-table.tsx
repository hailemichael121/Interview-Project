"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Crown, Shield, User, Trash, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OrganizationMember } from "@/types/types";
import { DataTable } from "@/components/ui/data-table";
import { createDateColumn } from "@/components/ui/table-columns";

interface TeamMembersTableProps {
  members: OrganizationMember[];
  onRevokeMember: (memberId: string, name: string) => Promise<void>;
  isLoading: boolean;
  isOwner: boolean;
  currentUserId?: string;
}

export function TeamMembersTable({
  members,
  onRevokeMember,
  isLoading,
  isOwner,
}: TeamMembersTableProps) {
  const [revokingId, setRevokingId] = React.useState<string | null>(null);

  const handleRevoke = async (memberId: string, name: string) => {
    if (confirm(`Remove ${name} from the team?`)) {
      try {
        setRevokingId(memberId);
        await onRevokeMember(memberId, name);
        toast.success("Member removed successfully");
      } catch {
        toast.error("Failed to remove member");
      } finally {
        setRevokingId(null);
      }
    }
  };

  // Format member name and email for display
  const getMemberDisplay = (member: OrganizationMember) => {
    const user = member.user;
    return {
      name: user?.name || user?.email || "Unknown Member",
      email: user?.email || "No email",
      avatar: user?.image,
      initials: user?.name
        ? user.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() || "??",
    };
  };

  // Role badge configuration
  const roleConfig: Record<string, { color: string; icon: React.ElementType }> = {
    OWNER: {
      color: "bg-amber-500/20 text-amber-700 dark:text-amber-400",
      icon: Crown,
    },
    REVIEWER: {
      color: "bg-gray-500/20 text-gray-700 dark:text-gray-400",
      icon: Shield,
    },
    MEMBER: {
      color: "bg-gray-500/20 text-gray-700 dark:text-gray-400",
      icon: User,
    },
  };

  const columns: ColumnDef<OrganizationMember>[] = [
    {
      accessorKey: "user",
      header: "Member",
      cell: ({ row }) => {
        const member = row.original;
        const display = getMemberDisplay(member);

        return (
          <div className="flex items-center gap-3">
            <Avatar>
              {display.avatar && <AvatarImage src={display.avatar} alt={display.name} />}
              <AvatarFallback>{display.initials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{display.name}</p>
              <p className="text-sm text-muted-foreground">{display.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.original.role;
        const config = roleConfig[role] || roleConfig.MEMBER;
        const Icon = config.icon;

        return (
          <Badge className={config.color}>
            <Icon className="h-3 w-3 mr-1" />
            {role}
          </Badge>
        );
      },
    },
    createDateColumn<OrganizationMember>("joinedAt", "Joined", {
      format: "MMM d, yyyy",
    }),
    ...(isOwner
      ? [
        {
          id: "actions",
          header: "Actions",
          cell: ({ row }) => {
            const member = row.original;
            const display = getMemberDisplay(member);

            // Don't show delete button for owners
            if (member.role === "OWNER") {
              return <span className="text-muted-foreground text-sm">Cannot remove owners</span>;
            }

            return (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => handleRevoke(member.id, display.name)}
                disabled={revokingId === member.id}
              >
                {revokingId === member.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash className="h-4 w-4" />
                )}
              </Button>
            );
          },
        } as ColumnDef<OrganizationMember>,
      ]
      : []),
  ];

  const emptyState = {
    icon: <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
    title: "No Team Members",
    description: "Invite members to join your organization",
  };

  return (
    <DataTable
      columns={columns}
      data={members}
      isLoading={isLoading}
      emptyState={emptyState}
    />
  );
}