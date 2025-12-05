// app/team/invite/page.tsx
"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, UserPlus, Shield, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { apiService } from "@/lib/api-service";
import { useOrganizationContext } from "@/hooks/use-session";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { useTheme } from "next-themes";
import { EmailSuggestions } from "@/components/auth/email-suggestions";

export default function InviteMemberPage() {
    const searchParams = useSearchParams();
    const orgId = searchParams.get("org");
    const { currentOrganization, currentMemberRole } = useOrganizationContext();
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";
    const bgColor = isDark ? "bg-[#141414]" : "bg-[#DEDEDE]";
    const textColor = isDark ? "text-white" : "text-gray-900";

    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<"MEMBER" | "REVIEWER">("MEMBER");

    const isOwner = currentMemberRole === "OWNER";

    if (!orgId || !isOwner) {
        return (
            <DashboardLayout>
                <div className="p-8 text-center">
                    <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                    <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
                    <p className="text-muted-foreground">Only organization owners can invite members</p>
                </div>
            </DashboardLayout>
        );
    }

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiService.organization.inviteMember(orgId, {
                email: email.trim(),
                role,
                organizationId: orgId,
            });

            if (res.success) {
                toast.success(`Invitation sent to ${email}!`);
                setEmail("");
            } else {
                toast.error(res.message || "Failed to send invitation");
            }
        } catch {
            toast.error("Failed to send invitation");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto">
                <Card className="border-0 shadow-2xl rounded-2xl overflow-hidden bg-card">
                    <CardHeader className="text-center space-y-4 pb-8 pt-10 bg-linear-to-b from-primary/5 to-transparent">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-linear-to-br from-white-500 to-white-600 flex items-center justify-center shadow-xl">
                            <UserPlus className="h-10 w-10 text-white" />
                        </div>
                        <div>
                            <CardTitle className="text-3xl font-bold">Invite Team Member</CardTitle>
                            <p className="text-muted-foreground mt-2 text-lg">
                                Send an invitation to join <strong>{currentOrganization?.name}</strong>
                            </p>
                        </div>
                    </CardHeader>

                    <CardContent className="px-10 pb-10">
                        <form onSubmit={handleInvite} className="space-y-8">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label className="text-base font-medium flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Input
                                        type="email"
                                        placeholder="colleague@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-14 text-lg"
                                        required
                                        disabled={isLoading}
                                    />
                                    <EmailSuggestions email={email} onEmailChange={setEmail} disabled={isLoading} />
                                </div>
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <Label className="text-base font-medium flex items-center gap-2">
                                    <Shield className="h-4 w-4" />
                                    Role
                                </Label>
                                <Select value={role} onValueChange={(v) => setRole(v as "MEMBER" | "REVIEWER")} disabled={isLoading}>
                                    <SelectTrigger className="h-14 text-lg">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className={`${bgColor} ${textColor} border border-white/20`}>
                                        <SelectItem value="MEMBER">Member - Can view and edit</SelectItem>
                                        <SelectItem value="REVIEWER">Reviewer - Can review and approve</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Info */}
                            <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex gap-4">
                                <Shield className="h-6 w-6 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium">Secure Invitation</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        A secure invite link will be sent to their email. They must sign in to accept.
                                    </p>
                                </div>
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                                disabled={isLoading || !email.trim()}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                        Sending Invitation...
                                    </>
                                ) : (
                                    <>
                                        Send Invitation
                                        <ArrowRight className="ml-3 h-6 w-6" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}