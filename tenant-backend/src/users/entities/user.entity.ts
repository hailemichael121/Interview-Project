// src/users/entities/user.entity.ts

import { Role } from '../enums/role.enum';

export class User {
  id: string;
  email: string;
  name?: string;
  role?: Role;
  tenantId?: string;
  banned?: boolean;
  emailVerified?: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;

  // Relations (optional, for type safety)
  members?: Array<{
    id: string;
    role: Role;
    organizationId: string;
    joinedAt: Date;
  }>;

  reviewerProfile?: {
    id: string;
    name: string;
  };
}
