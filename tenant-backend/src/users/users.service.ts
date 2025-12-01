import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../lib/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Get full profile for frontend consumption
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        banned: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        // Organization memberships
        members: {
          where: { deletedAt: null },
          select: {
            role: true,
            organization: { select: { id: true, name: true, slug: true } },
          },
        },
        // Reviewer profile & outlines
        reviewerProfile: {
          select: {
            id: true,
            outlines: {
              select: {
                id: true,
                header: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    // Fetch pending invitations
    const invitations = (
      await this.prisma.user.findUnique({ where: { id: userId } })
    )?.email
      ? await this.prisma.organizationInvite.findMany({
          where: {
            email: user.email,
            deletedAt: null,
            expires: { gt: new Date() },
          },
          select: {
            id: true,
            organizationId: true,
            role: true,
            expires: true,
          },
        })
      : [];

    return { success: true, data: { ...user, invitations } };
  }

  // Update user
  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser) throw new NotFoundException('User not found');

    const updateData: any = { ...updateUserDto, updatedAt: new Date() };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        banned: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: updatedUser };
  }

  // List users (with pagination)
  async findAll(page = 1, perPage = 10) {
    const skip = (page - 1) * perPage;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        skip,
        take: perPage,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tenantId: true,
          banned: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where: { deletedAt: null } }),
    ]);

    return { success: true, data, page, perPage, total };
  }

  // Soft delete
  async softDelete(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const deletedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    return { success: true, message: 'User soft-deleted', data: deletedUser };
  }

  // Get invitations only
  async getUserInvitations(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return [];

    return this.prisma.organizationInvite.findMany({
      where: {
        email: user.email,
        deletedAt: null,
        expires: { gt: new Date() },
      },
      select: { id: true, organizationId: true, role: true, expires: true },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        banned: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        tenantId: true,
        banned: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
