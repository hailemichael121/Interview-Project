// components/team/invite-member-dialog.tsx
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { UserPlus, Loader2, Mail, Shield } from "lucide-react";
import { EmailSuggestions } from "@/components/auth/email-suggestions";

interface InviteMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: "MEMBER" | "REVIEWER", organizationId: string) => Promise<void>;
  organizationId: string;
  isLoading: boolean;
  trigger?: React.ReactNode;
}

export function InviteMemberDialog({
  isOpen,
  onOpenChange,
  onInvite,
  organizationId,
  isLoading,
  trigger,
}: InviteMemberDialogProps) {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"MEMBER" | "REVIEWER">("MEMBER");

  const handleSubmit = async () => {
    if (!email.includes("@")) return;
    await onInvite(email.trim(), role, organizationId); // ← Now passes all 3 args
    if (!isLoading) {
      setEmail("");
      setRole("MEMBER");
      onOpenChange(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setEmail("");
      setRole("MEMBER");
    }
    onOpenChange(open);
  };
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";
  const textColor = isDark ? "text-white" : "text-gray-900";
  const borderColor = isDark ? "border-gray-800" : "border-gray-300";
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className={`sm:max-w-md ${bgColor} ${textColor} ${borderColor} `}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <div className="relative">
              <Input
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 text-base"
                disabled={isLoading}
              />
              <EmailSuggestions
                email={email}
                onEmailChange={setEmail}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Role
            </Label>
            <Select value={role} onValueChange={(v) => setRole(v as "MEMBER" | "REVIEWER")} disabled={isLoading}>
              <SelectTrigger className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEMBER">Member - Can view and edit</SelectItem>
                <SelectItem value="REVIEWER">Reviewer - Can review and approve</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium">Secure & Private</p>
              <p className="text-muted-foreground">
                A secure link will be sent. They must sign in to accept.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:justify-between">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !email.includes("@")}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Send Invitation
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function useTheme(): { resolvedTheme: any; } {
  throw new Error("Function not implemented.");
}
