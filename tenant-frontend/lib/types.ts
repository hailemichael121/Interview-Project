// lib/types.ts

// Base types matching your API responses
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
  status: 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED';
  expires: string;
  token?: string;
  invitedAt?: string;
}

export interface TeamMember {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    createdAt: string;
  };
  role: "OWNER" | "MEMBER" | "REVIEWER";
  joinedAt: string;
  status?: "ACTIVE" | "PENDING" | "INACTIVE";
}

export interface UserProfileData {
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
    organization: {
      id: string;
      name: string;
      slug: string;
      createdAt: string;
      updatedAt: string;
      _count: {
        members: number;
        outlines: number;
      };
    };
  }>;
  stats?: {
    totalOrganizations: number;
    pendingInvitations: number;
    assignedOutlines: number;
  };
}

// Types from api-service.ts for reference and reusability
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
    user?: {
      id: string;
      name: string | null;
      email: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  page?: number;
  perPage?: number;
  total?: number;
}

export interface OutlineListResponse {
  data: Outline[];
  page: number;
  perPage: number;
  total: number;
  message: string;
}

export interface MemberListResponse {
  data: OrganizationMember[];
  page: number;
  perPage: number;
  total: number;
  message: string;
}

export interface InvitationListResponse {
  data: Array<{
    id: string;
    organization: Organization;
    role: string;
    expires: string;
    token: string;
  }>;
  message: string;
}

// Create DTO types for consistency
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