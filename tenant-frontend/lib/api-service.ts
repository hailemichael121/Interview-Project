// lib/api-service.ts - FIXED VERSION
import authClient from "./auth-client";

import {
  ApiResponse,
  Organization,
  OrganizationMember,
  OrganizationDetails,
  Outline,
  OutlineStats,
  UserProfile,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateOutlineDto,
  UpdateOutlineDto,
  UpdateUserDto,
  InviteMemberDto,
  CurrentUserResponse,
  OrganizationListResponse,
  MemberListResponse,
  OutlineListResponse,
  OutlineStatsResponse,
  UserProfileResponse,
  InvitationListResponse,
  UserListResponse,
  OrganizationSwitchResponse,
  ApiInvitation,
  ApiSuccessResponse,
} from "../types/types";

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  organizationId?: string
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    Origin: window.location.origin,
    ...(options.headers as Record<string, string>),
  };

  if (organizationId) {
    headers["X-Organization-Id"] = organizationId;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}

export const authApi = {
  signUp: async (data: { name: string; email: string; password: string }) =>
    authClient.signUp.email(data),

  signIn: async (data: { email: string; password: string }) =>
    authClient.signIn.email(data),

  getSession: async () => authClient.getSession(),

  signOut: async () => authClient.signOut(),

  updateUser: async (data: { name?: string; image?: string }) =>
    authClient.updateUser(data),
};

export const userApi = {
  getProfile: async (): Promise<UserProfileResponse> =>
    apiFetch<UserProfile>("/users/profile", { method: "GET" }),

  getCurrentUser: async (): Promise<ApiResponse<CurrentUserResponse>> =>
    apiFetch<CurrentUserResponse>("/users/me", { method: "GET" }),

  updateProfile: async (data: UpdateUserDto): Promise<UserProfileResponse> =>
    apiFetch<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getUserById: async (userId: string): Promise<UserProfileResponse> =>
    apiFetch<UserProfile>(`/users/${userId}`, { method: "GET" }),

  listUsers: async (page = 1, perPage = 10): Promise<UserListResponse> => {
    const res = await apiFetch<
      Array<UserProfile & { organizationCount: number }>
    >(`/users?page=${page}&perPage=${perPage}`, { method: "GET" });
    return {
      ...res,
      page: res.page ?? page,
      perPage: res.perPage ?? perPage,
      total: res.total ?? 0,
    };
  },

  searchUsers: async (
    query: string,
    page = 1,
    perPage = 10
  ): Promise<UserListResponse> => {
    const res = await apiFetch<
      Array<UserProfile & { organizationCount: number }>
    >(
      `/users/search/${encodeURIComponent(
        query
      )}?page=${page}&perPage=${perPage}`,
      { method: "GET" }
    );
    return {
      ...res,
      page: res.page ?? page,
      perPage: res.perPage ?? perPage,
      total: res.total ?? 0,
    };
  },

  getUserOrganizations: async (userId: string, page = 1, perPage = 10) =>
    apiFetch<OrganizationListResponse>(
      `/users/${userId}/organizations?page=${page}&perPage=${perPage}`,
      { method: "GET" }
    ),

  deleteUser: async (userId: string) =>
    apiFetch<ApiSuccessResponse>(`/users/${userId}`, { method: "DELETE" }),
};

export const invitationApi = {
  getPendingInvitations: async (): Promise<InvitationListResponse> =>
    apiFetch<ApiInvitation[]>("/users/invitations", { method: "GET" }),

  acceptInvitation: async (invitationId: string) => {
    const session = await authClient.getSession();
    if (!session?.data?.user?.email) throw new Error("No session found");

    return apiFetch<ApiSuccessResponse>(
      `/users/invitations/${invitationId}/accept`,
      {
        method: "POST",
        body: JSON.stringify({ email: session.data.user.email }),
      }
    );
  },

  declineInvitation: async (invitationId: string) => {
    const session = await authClient.getSession();
    if (!session?.data?.user?.email) throw new Error("No session found");

    return apiFetch<ApiSuccessResponse>(
      `/users/invitations/${invitationId}/decline`,
      {
        method: "POST",
        body: JSON.stringify({ email: session.data.user.email }),
      }
    );
  },
};

export const organizationApi = {
  createOrganization: async (data: CreateOrganizationDto) =>
    apiFetch<{
      organization: {
        id: string;
        name: string;
        slug: string;
      };
      membership: {
        id: string;
        role: string;
        joinedAt: string;
      };
    }>("/api/organization/create", {
      method: "POST",
      body: JSON.stringify(data),
    }).then(
      (res) =>
        ({
          success: res.success,
          data: res.data,
          message: res.message,
        } as OrganizationSwitchResponse)
    ),

  listUserOrganizations: async (
    page = 1,
    perPage = 10
  ): Promise<OrganizationListResponse> => {
    const res = await apiFetch<Organization[]>(
      `/api/organization?page=${page}&perPage=${perPage}`,
      { method: "GET" }
    );
    return {
      ...res,
      page: res.page ?? page,
      perPage: res.perPage ?? perPage,
      total: res.total ?? 0,
    };
  },

  getOrganizationDetails: async (organizationId: string) =>
    apiFetch<OrganizationDetails>(
      `/api/organization/${organizationId}`,
      { method: "GET" },
      organizationId
    ),

  updateOrganization: async (
    organizationId: string,
    data: UpdateOrganizationDto
  ) =>
    apiFetch<Organization>(
      `/api/organization/${organizationId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      organizationId
    ),

  switchOrganization: async (
    organizationId: string
  ): Promise<OrganizationSwitchResponse> =>
    apiFetch<{
      organization: {
        id: string;
        name: string;
        slug: string;
      };
      membership: {
        id: string;
        role: string;
        joinedAt: string;
      };
    }>(
      `/api/organization/${organizationId}/switch`,
      { method: "POST" },
      organizationId
    ).then(
      (res) =>
        ({
          success: res.success,
          data: res.data,
          message: res.message,
        } as OrganizationSwitchResponse)
    ),
  listMembers: async (
    organizationId: string,
    page = 1,
    perPage = 10
  ): Promise<MemberListResponse> => {
    const res = await apiFetch<OrganizationMember[]>(
      `/api/organization/${organizationId}/members?page=${page}&perPage=${perPage}`,
      { method: "GET" },
      organizationId
    );
    return {
      ...res,
      page: res.page ?? page,
      perPage: res.perPage ?? perPage,
      total: res.total ?? 0,
    };
  },

  inviteMember: async (organizationId: string, data: InviteMemberDto) =>
    apiFetch<ApiSuccessResponse>(
      `/api/organization/${organizationId}/invite`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      organizationId
    ),

  acceptInvite: async (token: string) => {
    const session = await authClient.getSession();
    if (!session?.data?.user?.email) throw new Error("No session found");

    return apiFetch<ApiSuccessResponse>(
      `/api/organization/accept-invite/${token}`,
      {
        method: "POST",
        body: JSON.stringify({ email: session.data.user.email }),
      }
    );
  },

  revokeMember: async (organizationId: string, targetMemberId: string) =>
    apiFetch<ApiSuccessResponse>(
      `/api/organization/${organizationId}/revoke`,
      {
        method: "POST",
        body: JSON.stringify({ targetMemberId }),
      },
      organizationId
    ),
};

export const outlineApi = {
  createOutline: async (
    data: CreateOutlineDto,
    organizationId?: string
  ): Promise<ApiResponse<Outline>> => {
    const finalOrgId = organizationId || data.organizationId;
    if (!finalOrgId) throw new Error("Organization context is required");

    return apiFetch<Outline>(
      "/api/outlines",
      {
        method: "POST",
        body: JSON.stringify({ ...data, organizationId: finalOrgId }),
      },
      finalOrgId
    );
  },

  listOutlines: async (
    organizationId: string,
    page = 1,
    perPage = 10
  ): Promise<OutlineListResponse> => {
    if (!organizationId) throw new Error("Organization context is required");

    const res = await apiFetch<Outline[]>(
      `/api/outlines?page=${page}&perPage=${perPage}`,
      { method: "GET" },
      organizationId
    );
    return {
      ...res,
      page: res.page ?? page,
      perPage: res.perPage ?? perPage,
      total: res.total ?? 0,
    };
  },

  getOutline: async (
    outlineId: string,
    organizationId: string
  ): Promise<ApiResponse<Outline>> => {
    if (!organizationId) throw new Error("Organization context is required");
    return apiFetch<Outline>(
      `/api/outlines/${outlineId}`,
      { method: "GET" },
      organizationId
    );
  },

  updateOutline: async (
    outlineId: string,
    data: UpdateOutlineDto,
    organizationId: string
  ): Promise<ApiResponse<Outline>> => {
    if (!organizationId) throw new Error("Organization context is required");
    return apiFetch<Outline>(
      `/api/outlines/${outlineId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      organizationId
    );
  },

  deleteOutline: async (
    outlineId: string,
    organizationId: string
  ): Promise<ApiResponse<Outline>> => {
    if (!organizationId) throw new Error("Organization context is required");
    return apiFetch<Outline>(
      `/api/outlines/${outlineId}`,
      { method: "DELETE" },
      organizationId
    );
  },

  getOrganizationStats: async (
    organizationId: string
  ): Promise<OutlineStatsResponse> => {
    if (!organizationId) throw new Error("Organization context is required");
    return apiFetch<OutlineStats>(
      "/api/outlines/organization/stats",
      { method: "GET" },
      organizationId
    );
  },

  getAssignedOutlines: async (
    organizationId: string,
    page = 1,
    perPage = 10
  ): Promise<OutlineListResponse> => {
    if (!organizationId) throw new Error("Organization context is required");

    const res = await apiFetch<Outline[]>(
      `/api/outlines/reviewer/assigned?page=${page}&perPage=${perPage}`,
      { method: "GET" },
      organizationId
    );
    return {
      ...res,
      page: res.page ?? page,
      perPage: res.perPage ?? perPage,
      total: res.total ?? 0,
    };
  },

  getMyOutlines: async (
    organizationId: string,
    page = 1,
    perPage = 10
  ): Promise<OutlineListResponse> => {
    if (!organizationId) throw new Error("Organization context is required");

    const res = await apiFetch<Outline[]>(
      `/api/outlines/creator/my-outlines?page=${page}&perPage=${perPage}`,
      { method: "GET" },
      organizationId
    );
    return {
      ...res,
      page: res.page ?? page,
      perPage: res.perPage ?? perPage,
      total: res.total ?? 0,
    };
  },
};

export const apiService = {
  auth: authApi,
  user: userApi,
  invitation: invitationApi,
  organization: organizationApi,
  outline: outlineApi,
};

export default apiService;
