import { Request } from 'express';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { Role } from '@prisma/client';

export interface OrganizationMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: Role;
  organization: any;
  joinedAt: Date;
  deletedAt?: Date | null;
}

export interface OrganizationContext {
  organizationId: string;
  organization: any;
  memberId: string;
  memberRole: Role;
  membership: OrganizationMembership;
}

export interface ExtendedUser {
  id: string;
  email: string;
  name?: string;
  role?: string; // string only, not string[]
  tenantId?: string;
  banned?: boolean;
  emailVerified?: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  memberships: OrganizationMembership[];
  defaultMembership: OrganizationMembership | null;
}

export interface RequestWithAuth extends Request {
  session?: UserSession;
  user?: ExtendedUser;
  organizationContext?: OrganizationContext | null;
}

// REMOVE THIS DUPLICATE EXPORT SECTION:
// export type {
//   RequestWithAuth,
//   ExtendedUser,
//   OrganizationContext,
//   OrganizationMembership,
// };
