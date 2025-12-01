// lib/api-service.ts
import { authClient } from "./auth-client";

// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

// ==================== TYPES ====================
export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  role?: string;
  joinedAt?: string;
  memberId?: string;
  _count?: {
    members: number;
    outlines: number;
  };
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: "OWNER" | "REVIEWER" | "MEMBER" | "USER";
  joinedAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
}

export interface Outline {
  id: string;
  header: string;
  sectionType:
    | "TABLE_OF_CONTENTS"
    | "EXECUTIVE_SUMMARY"
    | "TECHNICAL_APPROACH"
    | "DESIGN"
    | "CAPABILITIES"
    | "FOCUS_DOCUMENT"
    | "NARRATIVE";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  target: number;
  limit: number;
  reviewerId: string | null;
  organizationId: string;
  createdByMemberId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  reviewer?: {
    id: string;
    name: string;
    userId?: string | null;
  };
  createdBy?: {
    id: string;
    user: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  organization?: Organization;
}

export interface TeamMember {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  avatar?: string;
  userId?: string;
  joinedAt?: string;
}

export interface Reviewer {
  id: string;
  name: string;
  userId: string | null;
  outlines?: Outline[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
  tenantId: string | null;
  banned: boolean;
  emailVerified: boolean;
  image: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  members?: Array<{
    id: string;
    role: string;
    joinedAt: string;
    organization: Organization;
  }>;
  reviewerProfile?: {
    id: string;
    outlines: Outline[];
  };
  invitations?: Array<{
    id: string;
    organization: Organization;
    role: string;
    expires: string;
    invitedAt: string;
  }>;
  stats?: {
    totalOrganizations: number;
    pendingInvitations: number;
    assignedOutlines: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  page?: number;
  perPage?: number;
  total?: number;
}

export interface CreateOrganizationDto {
  name: string;
  slug?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  slug?: string;
}

export interface CreateOutlineDto {
  header: string;
  sectionType:
    | "TABLE_OF_CONTENTS"
    | "EXECUTIVE_SUMMARY"
    | "TECHNICAL_APPROACH"
    | "DESIGN"
    | "CAPABILITIES"
    | "FOCUS_DOCUMENT"
    | "NARRATIVE";
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  target?: number;
  limit?: number;
  reviewerId?: string | null;
  organizationId?: string;
}

export interface UpdateOutlineDto {
  header?: string;
  sectionType?: string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  target?: number;
  limit?: number;
  reviewerId?: string | null;
}

export interface UpdateUserDto {
  name?: string;
  role?: string;
  tenantId?: string;
  image?: string;
  emailVerified?: boolean;
}

export interface InviteMemberDto {
  email: string;
  role: "MEMBER" | "OWNER";
}

// Helper function for API calls with auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
  organizationId?: string
): Promise<ApiResponse<T>> {
  // Get session to ensure we have valid auth
  const session = await authClient.getSession();

  if (!session) {
    throw new Error("No active session. Please sign in.");
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  // Add organization context if provided
  if (organizationId) {
    headers["X-Organization-Id"] = organizationId;
  }

  // Note: Cookies are automatically sent with credentials: 'include'
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: "include", // Essential for cross-origin cookies
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API Error: ${response.status}`;

    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorJson.error || errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

// ==================== AUTH API ====================
export const authApi = {
  // Sign up with email/password
  signUp: async (data: { name: string; email: string; password: string }) => {
    const response = await authClient.signUp.email(data);
    return response;
  },

  // Sign in with email/password
  signIn: async (data: { email: string; password: string }) => {
    const response = await authClient.signIn.email(data);
    return response;
  },

  // Get current session
  getSession: async () => {
    const session = await authClient.getSession();
    return session;
  },

  // Sign out
  signOut: async () => {
    const response = await authClient.signOut();
    return response;
  },

  // Update user (via Better Auth)
  updateUser: async (data: { name?: string; image?: string }) => {
    const response = await authClient.updateUser(data);
    return response;
  },
};

// ==================== USER API ====================
export const userApi = {
  // Get current user profile with details
  getProfile: async () => {
    return apiFetch<UserProfile>("/users/profile", {
      method: "GET",
    });
  },

  // Update user profile
  updateProfile: async (data: UpdateUserDto) => {
    return apiFetch<UserProfile>("/users/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Get current user with context (includes memberships)
  getCurrentUser: async () => {
    return apiFetch<{
      user: UserProfile;
      context: {
        currentOrganizationId: string | null;
        currentMemberRole: string | null;
        organizationMemberships: Array<{
          organizationId: string;
          organization: Organization;
          role: string;
          memberId: string;
          joinedAt: string;
        }>;
      };
    }>("/users/me", {
      method: "GET",
    });
  },

  // Get user by ID (admin only)
  getUserById: async (userId: string) => {
    return apiFetch<UserProfile>(`/users/${userId}`, {
      method: "GET",
    });
  },

  // List all users with pagination (admin only)
  listUsers: async (page = 1, perPage = 10) => {
    return apiFetch<{
      data: Array<UserProfile & { organizationCount: number }>;
      page: number;
      perPage: number;
      total: number;
    }>(`/users?page=${page}&perPage=${perPage}`, { method: "GET" });
  },

  // Search users by email or name (admin only)
  searchUsers: async (query: string, page = 1, perPage = 10) => {
    return apiFetch<{
      data: Array<UserProfile & { organizationCount: number }>;
      page: number;
      perPage: number;
      total: number;
      message: string;
    }>(
      `/users/search/${encodeURIComponent(
        query
      )}?page=${page}&perPage=${perPage}`,
      { method: "GET" }
    );
  },

  // Get user's organizations
  getUserOrganizations: async (userId: string, page = 1, perPage = 10) => {
    return apiFetch<{
      data: Array<{
        memberId: string;
        role: string;
        joinedAt: string;
        organization: Organization;
      }>;
      page: number;
      perPage: number;
      total: number;
      message: string;
    }>(`/users/${userId}/organizations?page=${page}&perPage=${perPage}`, {
      method: "GET",
    });
  },

  // Soft delete user (admin only)
  deleteUser: async (userId: string) => {
    return apiFetch<{
      message: string;
      data: {
        id: string;
        email: string;
        name: string | null;
        role: string;
        deletedAt: string;
      };
    }>(`/users/${userId}`, {
      method: "DELETE",
    });
  },
};

// ==================== INVITATION API ====================
export const invitationApi = {
  // Get pending invitations for current user
  getPendingInvitations: async () => {
    return apiFetch<{
      data: Array<{
        id: string;
        organization: Organization;
        role: string;
        expires: string;
        token: string;
      }>;
      message: string;
    }>("/users/invitations", {
      method: "GET",
    });
  },

  // Accept an invitation
  acceptInvitation: async (invitationId: string, email: string) => {
    return apiFetch<{
      data: {
        organization: Organization;
        membership: {
          id: string;
          role: string;
          joinedAt: string;
        };
      };
      message: string;
    }>(`/users/invitations/${invitationId}/accept`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Decline an invitation
  declineInvitation: async (invitationId: string, email: string) => {
    return apiFetch<{ message: string }>(
      `/users/invitations/${invitationId}/decline`,
      {
        method: "POST",
        body: JSON.stringify({ email }),
      }
    );
  },
};

// ==================== ORGANIZATION API ====================
export const organizationApi = {
  // Create new organization
  createOrganization: async (data: CreateOrganizationDto) => {
    return apiFetch<{
      data: {
        id: string;
        name: string;
        slug: string;
        createdAt: string;
        members: Array<{
          id: string;
          userId: string;
          role: string;
          user: {
            id: string;
            email: string;
            name: string | null;
          };
        }>;
      };
      message: string;
    }>("/api/organization/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // List user's organizations
  listUserOrganizations: async (page = 1, perPage = 10) => {
    return apiFetch<{
      data: Array<Organization>;
      page: number;
      perPage: number;
      total: number;
      message: string;
    }>(`/api/organization?page=${page}&perPage=${perPage}`, { method: "GET" });
  },

  // Get organization details
  getOrganizationDetails: async (organizationId: string) => {
    return apiFetch<{
      data: Organization & {
        members: Array<{
          id: string;
          role: string;
          joinedAt: string;
          user: {
            id: string;
            email: string;
            name: string | null;
            image: string | null;
          };
        }>;
        _count: {
          outlines: number;
          members: number;
        };
      };
      message: string;
    }>(
      `/api/organization/${organizationId}`,
      { method: "GET" },
      organizationId
    );
  },

  // Update organization (owners only)
  updateOrganization: async (
    organizationId: string,
    data: UpdateOrganizationDto
  ) => {
    return apiFetch<Organization>(
      `/api/organization/${organizationId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      organizationId
    );
  },

  // Switch organization context
  switchOrganization: async (organizationId: string) => {
    return apiFetch<{
      data: {
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
      };
      message: string;
    }>(`/api/organization/${organizationId}/switch`, { method: "POST" });
  },

  // List organization members
  listMembers: async (organizationId: string, page = 1, perPage = 10) => {
    return apiFetch<{
      data: Array<OrganizationMember>;
      page: number;
      perPage: number;
      total: number;
      message: string;
    }>(
      `/api/organization/${organizationId}/members?page=${page}&perPage=${perPage}`,
      { method: "GET" },
      organizationId
    );
  },

  // Invite member to organization (owners only)
  inviteMember: async (organizationId: string, data: InviteMemberDto) => {
    return apiFetch<{
      data: {
        id: string;
        organizationId: string;
        email: string;
        role: string;
        token: string;
        expires: string;
        organizationSlug: string;
        organizationName: string;
      };
      message: string;
    }>(
      `/api/organization/${organizationId}/invite`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      organizationId
    );
  },

  // Accept invitation via token
  acceptInvite: async (token: string, email: string) => {
    return apiFetch<{
      data: {
        organization: {
          id: string;
          name: string;
          slug: string;
        };
        member: {
          id: string;
          role: string;
          joinedAt: string;
        };
      };
      message: string;
    }>(`/api/organization/accept-invite/${token}`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  // Revoke member access (owners only)
  revokeMember: async (organizationId: string, targetMemberId: string) => {
    return apiFetch<{ message: string }>(
      `/api/organization/${organizationId}/revoke`,
      {
        method: "POST",
        body: JSON.stringify({ targetMemberId }),
      },
      organizationId
    );
  },
};

// ==================== OUTLINE API ====================
export const outlineApi = {
  // Create outline (requires organization context)
  createOutline: async (data: CreateOutlineDto, organizationId?: string) => {
    return apiFetch<Outline>(
      "/api/outlines",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      organizationId || data.organizationId
    );
  },

  // List all outlines for current organization
  listOutlines: async (page = 1, perPage = 10, organizationId?: string) => {
    return apiFetch<{
      data: Outline[];
      page: number;
      perPage: number;
      total: number;
      message: string;
    }>(
      `/api/outlines?page=${page}&perPage=${perPage}`,
      { method: "GET" },
      organizationId
    );
  },

  // Get single outline
  getOutline: async (outlineId: string, organizationId?: string) => {
    return apiFetch<Outline>(
      `/api/outlines/${outlineId}`,
      { method: "GET" },
      organizationId
    );
  },

  // Update outline
  updateOutline: async (
    outlineId: string,
    data: UpdateOutlineDto,
    organizationId?: string
  ) => {
    return apiFetch<Outline>(
      `/api/outlines/${outlineId}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      organizationId
    );
  },

  // Delete outline (soft delete)
  deleteOutline: async (outlineId: string, organizationId?: string) => {
    return apiFetch<Outline>(
      `/api/outlines/${outlineId}`,
      { method: "DELETE" },
      organizationId
    );
  },

  // Get organization statistics
  getOrganizationStats: async (organizationId?: string) => {
    return apiFetch<{
      data: {
        organizationId: string;
        organizationName: string;
        organizationSlug: string;
        totalOutlines: number;
        completedOutlines: number;
        inProgressOutlines: number;
        pendingOutlines: number;
        completionRate: number;
      };
      message: string;
    }>("/api/outlines/organization/stats", { method: "GET" }, organizationId);
  },

  // Get outlines assigned to current user as reviewer
  getAssignedOutlines: async (
    page = 1,
    perPage = 10,
    organizationId?: string
  ) => {
    return apiFetch<{
      data: Outline[];
      page: number;
      perPage: number;
      total: number;
      message: string;
    }>(
      `/api/outlines/reviewer/assigned?page=${page}&perPage=${perPage}`,
      { method: "GET" },
      organizationId
    );
  },

  // Get outlines created by current user
  getMyOutlines: async (page = 1, perPage = 10, organizationId?: string) => {
    return apiFetch<{
      data: Outline[];
      page: number;
      perPage: number;
      total: number;
      message: string;
    }>(
      `/api/outlines/creator/my-outlines?page=${page}&perPage=${perPage}`,
      { method: "GET" },
      organizationId
    );
  },
};

// ==================== HEALTH CHECK ====================
export const healthApi = {
  // Check if backend is running
  checkHealth: async () => {
    try {
      const response = await fetch(`${API_BASE}/`, {
        method: "GET",
        credentials: "include",
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  // Get auth session via backend
  getAuthSession: async () => {
    try {
      const response = await fetch(`${API_BASE}/api/auth/session`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        return response.json();
      }
      return null;
    } catch {
      return null;
    }
  },
};

// ==================== COMPREHENSIVE API SERVICE ====================
export const apiService = {
  auth: authApi,
  user: userApi,
  invitation: invitationApi,
  organization: organizationApi,
  outline: outlineApi,
  health: healthApi,
};

// Export everything
export default apiService;
