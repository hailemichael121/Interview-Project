import { Request } from 'express';
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
  role?: string;
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
  session?: {
    user: {
      id: string;
      email: string;
      name?: string;
      role?: string;
      tenantId?: string;
      banned?: boolean;
      emailVerified?: boolean;
      image?: string;
      createdAt: Date;
      updatedAt: Date;
    };
  };
  user?: ExtendedUser;
  organizationContext?: OrganizationContext | null;
}
