/* eslint-disable @typescript-eslint/no-empty-object-type */
// ==================== BASE RESPONSE TYPE ====================
export interface ApiResponse<T = unknown> {
  // Changed from 'any' to 'unknown'
  success: boolean;
  data: T;
  message?: string;
  page?: number;
  perPage?: number;
  total?: number;
}

// ==================== DASHBOARD SPECIFIC TYPES ====================
export interface DashboardStats {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  totalOutlines: number;
  completedOutlines: number;
  inProgressOutlines: number;
  pendingOutlines: number;
  completionRate: number;
}

export interface Member {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  role: string;
  joinedAt: string;
}

export interface Invitation {
  id: string;
  email: string;
  organization: Organization;
  role: string;
  status?: "PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED";
  expires: string;
  token?: string;
  invitedAt?: string;
}

// ==================== ORGANIZATION TYPES ====================
export interface Organization {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
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
  deletedAt?: string | null;
  user?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
}

export interface OrganizationDetails extends Organization {
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
}

// ==================== OUTLINE TYPES ====================
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
  reviewerMemberId: string | null;
  organizationId: string;
  createdByMemberId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  reviewerMember?: {
    id: string;
    role: string;
    joinedAt: string;
    user?: {
      id: string;
      name: string | null;
      email: string;
      image?: string | null;
    };
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

export interface OutlineStats {
  organizationId: string;
  organizationName: string;
  organizationSlug: string;
  totalOutlines: number;
  completedOutlines: number;
  inProgressOutlines: number;
  pendingOutlines: number;
  completionRate: number;
}

// ==================== USER TYPES ====================
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
  memberships?: Array<{
    memberId: string;
    role: string;
    joinedAt: string;
    organization: Organization;
  }>;
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

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  emailVerified: boolean;
  banned: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string | null;
}

export interface CurrentUserResponse {
  user: SessionUser;
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
}

export interface ApiInvitation {
  id: string;
  organization: Organization;
  role: string;
  expires: string;
  token: string;
  email?: string;
}

// ==================== RESPONSE WRAPPER TYPES ====================
export interface OrganizationListResponse extends ApiResponse<Organization[]> {
  page: number;
  perPage: number;
  total: number;
}

export interface MemberListResponse extends ApiResponse<OrganizationMember[]> {
  page: number;
  perPage: number;
  total: number;
}

export interface OutlineListResponse extends ApiResponse<Outline[]> {
  page: number;
  perPage: number;
  total: number;
}

export interface OutlineStatsResponse extends ApiResponse<OutlineStats> {}

export interface UserProfileResponse extends ApiResponse<UserProfile> {}

export interface InvitationListResponse extends ApiResponse<ApiInvitation[]> {}

export interface UserListResponse
  extends ApiResponse<Array<UserProfile & { organizationCount: number }>> {
  page: number;
  perPage: number;
  total: number;
}

export interface OrganizationSwitchResponse
  extends ApiResponse<{
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
  }> {}

// ==================== DTO TYPES ====================
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
  reviewerMemberId?: string | null;
  organizationId?: string;
}

export interface UpdateOutlineDto {
  header?: string;
  sectionType?: string;
  status?: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  target?: number;
  limit?: number;
  reviewerMemberId?: string | null;
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
  role: "MEMBER" | "OWNER" | "REVIEWER";
  organizationId: string;
}

export interface ApiSuccessResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export type UserWithOrgs = UserProfile & { organizationCount: number };
