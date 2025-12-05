/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { toast } from "sonner";
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
import { Card } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { useTheme } from "next-themes";
import { OrganizationMember } from "@/types/types";
import apiService from "@/lib/api-service";

interface CreateOutlineFormProps {
    organizationId: string;
    organizationMembers: OrganizationMember[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function CreateOutlineForm({
    organizationId,
    organizationMembers,
    onSuccess,
    onCancel,
}: CreateOutlineFormProps) {
    const { resolvedTheme } = useTheme();
    const isDark = resolvedTheme === "dark";

    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        header: "",
        sectionType: "EXECUTIVE_SUMMARY" as const,
        target: 1000,
        limit: 1200,
        reviewerMemberId: undefined as string | undefined,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.header.trim()) {
            toast.error("Header is required");
            return;
        }

        setIsLoading(true);
        try {
            const res = await apiService.outline.createOutline(
                {
                    header: formData.header,
                    sectionType: formData.sectionType,
                    target: formData.target,
                    limit: formData.limit,
                    reviewerMemberId: formData.reviewerMemberId || null,
                },
                organizationId
            );

            if (res.success) {
                toast.success("Outline created successfully!");
                onSuccess?.();
            } else {
                toast.error(res.message || "Failed to create outline");
            }
        } catch (err: any) {
            toast.error(err.message || "Failed to create outline");
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = isDark
        ? "bg-white/10 border-white/20 text-white placeholder:text-white/50 focus-visible:ring-white/30"
        : "bg-white/90 border-gray-300 text-gray-900 placeholder:text-gray-500";

    const selectClass = isDark
        ? "bg-white/10 border-white/20 text-white data-[placeholder]:text-white/50"
        : "bg-white border-gray-300 text-gray-900 data-[placeholder]:text-gray-500";

    return (
        <Card className={`border-0 shadow-2xl rounded-2xl overflow-hidden ${isDark ? "bg-white/10" : "bg-white/95"} backdrop-blur-md`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
                <h2 className="text-2xl font-bold">Create New Outline</h2>
                {onCancel && (
                    <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full hover:bg-white/10">
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-7">
                <div className="space-y-2">
                    <Label className="text-base font-medium">Outline Header *</Label>
                    <Input
                        placeholder="e.g., Executive Summary"
                        value={formData.header}
                        onChange={(e) => setFormData({ ...formData, header: e.target.value })}
                        className={inputClass}
                        required
                        autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-base font-medium">Section Type</Label>
                    <Select
                        value={formData.sectionType}
                        onValueChange={(v) => setFormData({ ...formData, sectionType: v as any })}
                    >
                        <SelectTrigger className={selectClass}>
                            <SelectValue placeholder="Choose a section type" />
                        </SelectTrigger>
                        <SelectContent className={`${isDark ? "bg-[#141414] text-white" : "bg-[#DEDEDE] text-gray-900"
                            }`}>                            <SelectItem value="EXECUTIVE_SUMMARY">Executive Summary</SelectItem>
                            <SelectItem value="TECHNICAL_APPROACH">Technical Approach</SelectItem>
                            <SelectItem value="DESIGN">Design</SelectItem>
                            <SelectItem value="CAPABILITIES">Capabilities</SelectItem>
                            <SelectItem value="FOCUS_DOCUMENT">Focus Document</SelectItem>
                            <SelectItem value="NARRATIVE">Narrative</SelectItem>
                            <SelectItem value="TABLE_OF_CONTENTS">Table of Contents</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label className="text-base font-medium">Target Word Count</Label>
                        <Input
                            type="number"
                            value={formData.target}
                            onChange={(e) => setFormData({ ...formData, target: Number(e.target.value) || 0 })}
                            className={inputClass}
                            min="1"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-base font-medium">Word Limit</Label>
                        <Input
                            type="number"
                            value={formData.limit}
                            onChange={(e) => setFormData({ ...formData, limit: Number(e.target.value) || 0 })}
                            className={inputClass}
                            min="1"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-base font-medium">Assign Reviewer (Optional)</Label>
                    <Select
                        value={formData.reviewerMemberId || "unassigned"}
                        onValueChange={(v) => setFormData({ ...formData, reviewerMemberId: v === "unassigned" ? undefined : v })}
                    >
                        <SelectTrigger className={selectClass}>
                            <SelectValue placeholder="No reviewer assigned" />
                        </SelectTrigger>
                        <SelectContent className={`${isDark ? "bg-[#141414] text-white" : "bg-[#DEDEDE] text-gray-900"
                            }`}>                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {organizationMembers
                                .filter(m => m.role === "REVIEWER" || m.role === "OWNER" || m.role === "MEMBER").map((member) => (
                                    <SelectItem key={member.id} value={member.id}>
                                        {member.user?.name || member.user?.email}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex gap-4 pt-6">
                    <Button type="button" variant="outline" size="lg" onClick={onCancel} disabled={isLoading} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={isLoading} className="flex-1 font-semibold shadow-lg hover:shadow-xl transition-all">
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Outline"
                        )}
                    </Button>
                </div>
            </form>
        </Card>
    );
}