// lib/api-service.ts
/**
 *   API service
 * Handles all authenticated requests to the backend with proper session management,
 * organization context via X-Organization-Id header, and consistent error handling.
 *
 * Uses Better-Auth client for session management and cookie-based auth token passing.
 */

import authClient from "./auth-client";

// Backend API base URL (configurable via env or fallback to Render deployment)
const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://tenant-backend-cz23.onrender.com";

// Import all shared types
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
} from "../types/types";

/**
 * Generic authenticated fetch wrapper
 * Automatically injects session cookie and organization context header
 */
// lib/api-service.ts - UPDATED apiFetch function
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  organizationId?: string
): Promise<ApiResponse<T>> {
  let authToken = null;

  if (typeof window !== "undefined") {
    authToken = localStorage.getItem("auth_token");

    if (!authToken) {
      const sessionToken = document.cookie
        .split("; ")
        .find(
          (row) =>
            row.startsWith("better-auth.session_token=") ||
            row.startsWith("__Secure-better-auth.session_token=")
        )
        ?.split("=")[1];
      authToken = sessionToken;
    }
  }

  if (!authToken) {
    throw new Error("No active session. Please sign in.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Origin: window.location.origin,
    ...(options.headers as Record<string, string>),
  };

  if (organizationId) {
    headers["X-Organization-Id"] = organizationId;
  }

  headers["Authorization"] = `Bearer ${authToken}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      const text = await response.text();
      errorMessage = text || errorMessage;
    }

    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }

    throw new Error(errorMessage);
  }

  return response.json();
}
// ==================== AUTH API ====================
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

// ==================== USER API ====================
export const userApi = {
  /** Get current authenticated user's profile */
  getProfile: async (): Promise<UserProfileResponse> =>
    apiFetch<UserProfile>("/users/profile", { method: "GET" }),

  /** Get current user with organization context */
  getCurrentUser: async (): Promise<ApiResponse<CurrentUserResponse>> =>
    apiFetch<CurrentUserResponse>("/users/me", { method: "GET" }),

  /** Update current user's profile */
  updateProfile: async (data: UpdateUserDto): Promise<UserProfileResponse> =>
    apiFetch<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Admin: Get user by ID */
  getUserById: async (userId: string): Promise<UserProfileResponse> =>
    apiFetch<UserProfile>(`/users/${userId}`, { method: "GET" }),

  /** Admin: List all users (paginated) */
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

  /** Admin: Search users by name/email */
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

  /** Admin: Get organizations a user belongs to */
  getUserOrganizations: async (userId: string, page = 1, perPage = 10) =>
    apiFetch<any>(
      `/users/${userId}/organizations?page=${page}&perPage=${perPage}`,
      {
        method: "GET",
      }
    ),

  /** Admin: Soft delete a user */
  deleteUser: async (userId: string) =>
    apiFetch<any>(`/users/${userId}`, { method: "DELETE" }),
};

// ==================== INVITATION API ====================
export const invitationApi = {
  /** Get all pending invitations for current user */
  getPendingInvitations: async (): Promise<InvitationListResponse> =>
    apiFetch<ApiInvitation[]>("/users/invitations", { method: "GET" }),

  /** Accept invitation by ID (user-facing endpoint) */
  acceptInvitation: async (invitationId: string) => {
    const session = await authClient.getSession();
    if (!session?.data?.user?.email) throw new Error("No session found");

    return apiFetch<any>(`/users/invitations/${invitationId}/accept`, {
      method: "POST",
      body: JSON.stringify({ email: session.data.user.email }),
    });
  },

  /** Decline invitation by ID */
  declineInvitation: async (invitationId: string) => {
    const session = await authClient.getSession();
    if (!session?.data?.user?.email) throw new Error("No session found");

    return apiFetch<{ message: string }>(
      `/users/invitations/${invitationId}/decline`,
      {
        method: "POST",
        body: JSON.stringify({ email: session.data.user.email }),
      }
    );
  },
};

// ==================== ORGANIZATION API ====================
export const organizationApi = {
  /** Create a new organization */
  createOrganization: async (data: CreateOrganizationDto) =>
    apiFetch<any>("/api/organization/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** List organizations current user is member of */
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

  /** Get full organization details (including members) */
  getOrganizationDetails: async (organizationId: string) =>
    apiFetch<OrganizationDetails>(
      `/api/organization/${organizationId}`,
      {
        method: "GET",
      },
      organizationId
    ),

  /** Update organization name/slug (owner only) */
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

  /** Switch active organization context */
  switchOrganization: async (
    organizationId: string
  ): Promise<OrganizationSwitchResponse> =>
    apiFetch<any>(
      `/api/organization/${organizationId}/switch`,
      {
        method: "POST",
      },
      organizationId
    ),

  /** List members in organization */
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

  /** Invite a new member (owner only) */
  inviteMember: async (organizationId: string, data: InviteMemberDto) =>
    apiFetch<any>(
      `/api/organization/${organizationId}/invite`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      organizationId
    ),

  /** Accept invite via magic token link */
  acceptInvite: async (token: string) => {
    const session = await authClient.getSession();
    if (!session?.data?.user?.email) throw new Error("No session found");

    return apiFetch<any>(`/api/organization/accept-invite/${token}`, {
      method: "POST",
      body: JSON.stringify({ email: session.data.user.email }),
    });
  },

  /** Remove/revoke a member (owner only) */
  revokeMember: async (organizationId: string, targetMemberId: string) =>
    apiFetch<{ message: string }>(
      `/api/organization/${organizationId}/revoke`,
      {
        method: "POST",
        body: JSON.stringify({ targetMemberId }),
      },
      organizationId
    ),
};

// ==================== OUTLINE API ====================
export const outlineApi = {
  /** Create new outline in organization */
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

  /** List outlines in current organization */
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

  /** Get single outline by ID */
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

  /** Update outline */
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

  /** Soft delete outline */
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

  /** Get organization-level outline statistics */
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

  /** Get outlines assigned to current user as reviewer */
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

  /** Get outlines created by current user */
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

// ==================== COMPOSITE API SERVICE ====================
export const apiService = {
  auth: authApi,
  user: userApi,
  invitation: invitationApi,
  organization: organizationApi,
  outline: outlineApi,
};

// Default export
export default apiService;
