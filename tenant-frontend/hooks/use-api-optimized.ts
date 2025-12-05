// hooks/use-api-optimized.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiService } from "@/lib/api-service";
import { CreateOutlineDto } from "@/types/types";

export const queryKeys = {
  profile: ["profile"],
  outlines: (orgId?: string) => ["outlines", orgId],
  organizationMembers: (orgId?: string) => ["organization-members", orgId],
  organizationStats: (orgId?: string) => ["organization-stats", orgId],
  invitations: ["invitations"],
};

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: async () => {
      const res = await apiService.user.getProfile();
      if (!res.success)
        throw new Error(res.message || "Failed to fetch profile");
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useOutlines(
  orgId?: string,
  page: number = 1,
  perPage: number = 10
) {
  return useQuery({
    queryKey: [...queryKeys.outlines(orgId), page, perPage],
    queryFn: async () => {
      if (!orgId) throw new Error("Organization ID is required");
      const res = await apiService.outline.listOutlines(orgId, page, perPage);
      if (!res.success)
        throw new Error(res.message || "Failed to fetch outlines");
      return {
        data: res.data,
        total: res.total || 0,
        page: res.page || page,
        perPage: res.perPage || perPage,
      };
    },
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });
}

export function useOrganizationMembers(
  orgId?: string,
  page: number = 1,
  perPage: number = 10
) {
  return useQuery({
    queryKey: [...queryKeys.organizationMembers(orgId), page, perPage],
    queryFn: async () => {
      if (!orgId) throw new Error("Organization ID is required");
      const res = await apiService.organization.listMembers(
        orgId,
        page,
        perPage
      );
      if (!res.success)
        throw new Error(res.message || "Failed to fetch members");
      return {
        data: res.data,
        total: res.total || 0,
        page: res.page || page,
        perPage: res.perPage || perPage,
      };
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });
}

export function useOrganizationStats(orgId?: string) {
  return useQuery({
    queryKey: queryKeys.organizationStats(orgId),
    queryFn: async () => {
      if (!orgId) throw new Error("Organization ID is required");
      const res = await apiService.outline.getOrganizationOutlineStats(orgId);
      if (!res.success) throw new Error(res.message || "Failed to fetch stats");
      return res.data;
    },
    enabled: !!orgId,
    staleTime: 30 * 1000,
  });
}

export function usePendingInvitations() {
  return useQuery({
    queryKey: queryKeys.invitations,
    queryFn: async () => {
      const res = await apiService.invitation.getPendingInvitations();
      if (!res.success)
        throw new Error(res.message || "Failed to fetch invitations");
      return res.data;
    },
    staleTime: 60 * 1000,
  });
}

export function useCreateOutline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      header: string;
      sectionType: string;
      organizationId?: string;
      target?: number;
      limit?: number;
    }) => {
      const createData: CreateOutlineDto = {
        header: data.header,
        sectionType: data.sectionType as CreateOutlineDto["sectionType"],
        organizationId: data.organizationId,
        target: data.target,
        limit: data.limit,
      };

      const res = await apiService.outline.createOutline(
        createData,
        data.organizationId
      );
      if (!res.success)
        throw new Error(res.message || "Failed to create outline");
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.outlines(variables.organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizationStats(variables.organizationId),
      });
    },
  });
}

export function useUpdateOutline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      outlineId,
      data,
      organizationId,
    }: {
      outlineId: string;
      data: Partial<{
        header?: string;
        sectionType?: string;
        status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
        target?: number;
        limit?: number;
        reviewerId?: string | null;
      }>;
      organizationId?: string;
    }) => {
      if (!organizationId) {
        throw new Error("Organization ID is required to update outline");
      }

      const res = await apiService.outline.updateOutline(
        outlineId,
        data,
        organizationId
      );
      if (!res.success)
        throw new Error(res.message || "Failed to update outline");
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.outlines(variables.organizationId),
      });
    },
  });
}

export function useDeleteOutline() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      outlineId,
      organizationId,
    }: {
      outlineId: string;
      organizationId?: string;
    }) => {
      if (!organizationId) {
        throw new Error("Organization ID is required to delete outline");
      }

      const res = await apiService.outline.deleteOutline(
        outlineId,
        organizationId
      );
      if (!res.success)
        throw new Error(res.message || "Failed to delete outline");
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.outlines(variables.organizationId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.organizationStats(variables.organizationId),
      });
    },
  });
}
