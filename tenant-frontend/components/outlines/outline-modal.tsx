// app/components/outlines/outline-modal.tsx
"use client";

import * as React from "react";
import { Outline, OrganizationMember } from "@/types/types";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
    Calendar,
    FileText,
    User,
    CheckCircle,
    Clock,
    Edit,
    Eye,
    X,
    BarChart3,
    Save,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const formatSectionType = (type: string) =>
    type.toLowerCase().replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

interface OutlineModalProps {
    outline: Outline | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode?: "view" | "edit";
    onSave?: (data: Partial<Outline>) => Promise<void>;
    onDelete?: (outlineId: string) => Promise<void>;
    currentUserRole?: string;
    organizationMembers?: OrganizationMember[];
}

export function OutlineModal({
    outline,
    open,
    onOpenChange,
    mode = "view",
    onSave,
    onDelete,
    currentUserRole,
    organizationMembers = [],
}: OutlineModalProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [isEditing, setIsEditing] = React.useState(mode === "edit");
    const [formData, setFormData] = React.useState<Partial<Outline>>({});

    React.useEffect(() => {
        if (outline) {
            setFormData({
                header: outline.header,
                sectionType: outline.sectionType,
                status: outline.status,
                target: outline.target,
                limit: outline.limit,
                // Use reviewerMemberId from the data
                reviewerMemberId: (outline as any).reviewerMemberId || outline.reviewerMember?.id || null,
            });
            setIsEditing(mode === "edit");
        }
    }, [outline, mode]);

    if (!outline) return null;

    const statusConfig = {
        PENDING: { icon: <Clock className="size-4" />, label: "Pending", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
        IN_PROGRESS: { icon: <Clock className="size-4" />, label: "In Progress", class: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
        COMPLETED: { icon: <CheckCircle className="size-4" />, label: "Completed", class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
    }[outline.status];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onSave) return;
        try {
            await onSave(formData);
            toast.success("Outline updated");
            setIsEditing(false);
        } catch {
            toast.error("Failed to update");
        }
    };

    const handleDelete = async () => {
        if (!onDelete || !window.confirm(`Delete "${outline.header}"?`)) return;
        try {
            await onDelete(outline.id);
            toast.success("Deleted");
            onOpenChange(false);
        } catch {
            toast.error("Failed to delete");
        }
    };

    const canEdit = ["OWNER", "REVIEWER"].includes(currentUserRole || "") || outline.createdBy?.user?.id === "currentUserId";

    // Get reviewer name from either reviewerMember or reviewer
    const getReviewerName = () => {
        if (outline.reviewerMember?.user?.name) {
            return outline.reviewerMember.user.name;
        }
        if ((outline as any).reviewer?.name) {
            return (outline as any).reviewer.name;
        }
        return "Not assigned";
    };

    // Get reviewer email
    const getReviewerEmail = () => {
        if (outline.reviewerMember?.user?.email) {
            return outline.reviewerMember.user.email;
        }
        if ((outline as any).reviewer?.email) {
            return (outline as any).reviewer.email;
        }
        return "";
    };

    // Shared select style
    const selectTriggerClass = isDark
        ? "bg-white/10 border-white/20 text-white placeholder:text-white/50"
        : "bg-white border-gray-300 text-gray-900";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl p-0 border-0 overflow-hidden bg-transparent">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md" aria-hidden="true" />

                {/* Modal Card */}
                <div
                    className={`relative z-10 mx-auto w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden ${isDark ? "bg-[#141414] text-white" : "bg-[#DEDEDE] text-gray-900"
                        }`}
                >
                    <div className="p-6 space-y-8">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <DialogTitle className="text-2xl font-bold">
                                    {isEditing ? "Edit Outline" : "Outline Details"}
                                </DialogTitle>
                                <DialogDescription className={isDark ? "text-gray-400" : "text-gray-600"}>
                                    {formatSectionType(outline.sectionType)} • Created {formatDistanceToNow(new Date(outline.createdAt), { addSuffix: true })}
                                </DialogDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full">
                                <X className="size-5" />
                            </Button>
                        </div>

                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview"><Eye className="w-4 h-4 mr-2" />Overview</TabsTrigger>
                                <TabsTrigger value="details"><FileText className="w-4 h-4 mr-2" />Details</TabsTrigger>
                                <TabsTrigger value="activity"><BarChart3 className="w-4 h-4 mr-2" />Activity</TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleSubmit} className="mt-8 space-y-8">
                                <TabsContent value="overview" className="space-y-8">
                                    {/* Header */}
                                    <div className="space-y-2">
                                        <Label>Header</Label>
                                        {isEditing ? (
                                            <Input
                                                value={formData.header || ""}
                                                onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                                                className={selectTriggerClass}
                                            />
                                        ) : (
                                            <p className="text-xl font-medium">{outline.header}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-8">
                                        {/* Section Type */}
                                        <div className="space-y-2">
                                            <Label>Section Type</Label>
                                            {isEditing ? (
                                                <Select
                                                    value={formData.sectionType}
                                                    onValueChange={(v: Outline["sectionType"]) => setFormData({ ...formData, sectionType: v })}
                                                >
                                                    <SelectTrigger className={selectTriggerClass}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className={isDark ? "bg-[#141414] text-white" : "bg-[#DEDEDE] text-gray-900"}>
                                                        <SelectItem value="EXECUTIVE_SUMMARY">Executive Summary</SelectItem>
                                                        <SelectItem value="TECHNICAL_APPROACH">Technical Approach</SelectItem>
                                                        <SelectItem value="DESIGN">Design</SelectItem>
                                                        <SelectItem value="CAPABILITIES">Capabilities</SelectItem>
                                                        <SelectItem value="FOCUS_DOCUMENT">Focus Document</SelectItem>
                                                        <SelectItem value="NARRATIVE">Narrative</SelectItem>
                                                        <SelectItem value="TABLE_OF_CONTENTS">Table of Contents</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <p>{formatSectionType(outline.sectionType)}</p>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            {isEditing ? (
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(v: Outline["status"]) => setFormData({ ...formData, status: v })}
                                                >
                                                    <SelectTrigger className={selectTriggerClass}>
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className={isDark ? "bg-[#141414] text-white" : "bg-[#DEDEDE] text-gray-900"}>
                                                        <SelectItem value="PENDING">Pending</SelectItem>
                                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Badge className={statusConfig.class}>
                                                    {statusConfig.icon} <span className="ml-1">{statusConfig.label}</span>
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Target & Limit */}
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label>Target Word Count</Label>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={formData.target || ""}
                                                    onChange={(e) => setFormData({ ...formData, target: +e.target.value || 0 })}
                                                    className={selectTriggerClass}
                                                />
                                            ) : (
                                                <p className="text-2xl font-bold">{outline.target} <span className="text-sm opacity-70">words</span></p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Word Limit</Label>
                                            {isEditing ? (
                                                <Input
                                                    type="number"
                                                    value={formData.limit || ""}
                                                    onChange={(e) => setFormData({ ...formData, limit: +e.target.value || 0 })}
                                                    className={selectTriggerClass}
                                                />
                                            ) : (
                                                <p className="text-2xl font-bold">{outline.limit} <span className="text-sm opacity-70">max</span></p>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Details Tab */}
                                <TabsContent value="details" className="space-y-8">
                                    <div className="grid grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <div>
                                                <Label className="text-sm opacity-70">Created By</Label>
                                                <div className="mt-2 flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                        <User className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{outline.createdBy?.user?.name || "Unknown"}</p>
                                                        <p className="text-sm opacity-70">{outline.createdBy?.user?.email}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div>
                                                <Label className="text-sm opacity-70">Created Date</Label>
                                                <p className="mt-2 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {new Date(outline.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm opacity-70">Reviewer</Label>
                                                {isEditing ? (
                                                    <Select
                                                        value={formData.reviewerMemberId || "unassigned"}
                                                        onValueChange={(v) => setFormData({
                                                            ...formData,
                                                            reviewerMemberId: v === "unassigned" ? null : v
                                                        })}
                                                    >
                                                        <SelectTrigger className={selectTriggerClass}>
                                                            <SelectValue placeholder="Assign reviewer" />
                                                        </SelectTrigger>
                                                        <SelectContent className={isDark ? "bg-[#141414] text-white" : "bg-[#DEDEDE] text-gray-900"}>
                                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                                            {organizationMembers.map((member) => (
                                                                <SelectItem key={member.id} value={member.id}>
                                                                    {member.user?.name || member.user?.email}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <div className="mt-2 flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{getReviewerName()}</p>
                                                            {getReviewerEmail() && (
                                                                <p className="text-sm opacity-70">{getReviewerEmail()}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <Label className="text-sm opacity-70">Last Updated</Label>
                                                <p className="mt-2 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDistanceToNow(new Date(outline.updatedAt), { addSuffix: true })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Activity Tab */}
                                <TabsContent value="activity" className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Outline created</p>
                                                <p className="text-sm opacity-70">{formatDistanceToNow(new Date(outline.createdAt), { addSuffix: true })}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center shrink-0">
                                                <Edit className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="font-medium">Last updated</p>
                                                <p className="text-sm opacity-70">{formatDistanceToNow(new Date(outline.updatedAt), { addSuffix: true })}</p>
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-8 border-t border-white/10">
                                    <div>
                                        {canEdit && onDelete && (
                                            <Button variant="destructive" onClick={handleDelete}>
                                                Delete Outline
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex gap-3">
                                        {canEdit && !isEditing && (
                                            <Button variant="outline" onClick={() => setIsEditing(true)}>
                                                <Edit className="w-4 h-4 mr-2" /> Edit
                                            </Button>
                                        )}
                                        {isEditing && (
                                            <>
                                                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                                                <Button type="submit">
                                                    <Save className="w-4 h-4 mr-2" /> Save Changes
                                                </Button>
                                            </>
                                        )}
                                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                                            Close
                                        </Button>
                                    </div>
                                </div>
                            </form>
                        </Tabs>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}