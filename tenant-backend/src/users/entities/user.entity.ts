export class User {
  id: string;
  email: string;
  name: string;
  role?: string;
  tenantId?: string;
  banned?: boolean;
  emailVerified?: boolean;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
