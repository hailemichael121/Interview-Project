// components/team/invitations-table.tsx
"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Mail, XCircle, RefreshCw } from "lucide-react";
 import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { createTextColumn, createDateColumn, createBadgeColumn } from "@/components/ui/table-columns";

// Define a type for invitations in the table
export interface TableInvitation {
  id: string;
  email: string;
  role: string;
  status: string;
  expires: string;
  createdAt: string;
  organizationId: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
}

interface InvitationsTableProps {
  invitations: TableInvitation[];
  isLoading: boolean;
  onResend?: (invitationId: string, email: string) => Promise<void>;
  onCancel?: (invitationId: string, invitation: TableInvitation) => Promise<void>;
}

export function InvitationsTable({
  invitations,
  isLoading,
  onResend,
  onCancel,
}: InvitationsTableProps) {
  const [resendingId, setResendingId] = React.useState<string | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  const handleResend = async (invitationId: string, email: string) => {
    if (onResend) {
      try {
        setResendingId(invitationId);
        await onResend(invitationId, email);
      } catch {
        // Error handled by parent
      } finally {
        setResendingId(null);
      }
    }
  };

  const handleCancel = async (invitationId: string, invitation: TableInvitation) => {
    if (onCancel) {
      try {
        setCancellingId(invitationId);
        await onCancel(invitationId, invitation);
      } catch {
        // Error handled by parent
      } finally {
        setCancellingId(null);
      }
    }
  };

  const columns: ColumnDef<TableInvitation>[] = [
    createTextColumn<TableInvitation>("email", "Email"),
    createBadgeColumn<TableInvitation>("role", "Role", { variant: "outline" }),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "PENDING"
                ? "outline"
                : status === "ACCEPTED"
                ? "default"
                : "destructive"
            }
          >
            {status}
          </Badge>
        );
      },
    },
    createDateColumn<TableInvitation>("expires", "Expires", {
      format: "MMM d, yyyy",
    }),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const invitation = row.original;
        const isPending = invitation.status === "PENDING";

        return (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (isPending && onResend) {
                  handleResend(invitation.id, invitation.email);
                }
              }}
              disabled={!isPending || resendingId === invitation.id}
            >
              {resendingId === invitation.id ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => {
                if (isPending && onCancel) {
                  handleCancel(invitation.id, invitation);
                }
              }}
              disabled={!isPending || cancellingId === invitation.id}
            >
              {cancellingId === invitation.id ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  const emptyState = {
    icon: <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />,
    title: "No Pending Invitations",
    description: "Invite members to join your organization",
  };

  return (
    <DataTable
      columns={columns}
      data={invitations}
      isLoading={isLoading}
      emptyState={emptyState}
    />
  );
}