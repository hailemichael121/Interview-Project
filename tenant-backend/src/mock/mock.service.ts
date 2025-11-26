import { Injectable } from '@nestjs/common';

@Injectable()
export class MockService {
  private prisma;

  constructor() {
    const { PrismaClient } = require('@prisma/client');
    this.prisma = new PrismaClient();
  }

  async seedMockData() {
    try {
      // Check if mock data already exists
      const existingUsers = await this.prisma.user.count();
      if (existingUsers > 0) {
        console.log('Mock data already exists, skipping seed...');
        return;
      }

      // Create mock users
      const user1 = await this.prisma.user.create({
        data: {
          email: 'john.doe@example.com',
          name: 'John Doe',
          image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        },
      });

      const user2 = await this.prisma.user.create({
        data: {
          email: 'jane.smith@example.com',
          name: 'Jane Smith',
          image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        },
      });

      // Create mock organizations
      const org1 = await this.prisma.organization.create({
        data: {
          name: 'Acme Inc',
          slug: 'acme-inc',
        },
      });

      const org2 = await this.prisma.organization.create({
        data: {
          name: 'Tech Startup',
          slug: 'tech-startup',
        },
      });

      // Add users to organizations
      await this.prisma.organizationMember.create({
        data: {
          userId: user1.id,
          organizationId: org1.id,
          role: 'owner',
        },
      });

      await this.prisma.organizationMember.create({
        data: {
          userId: user2.id,
          organizationId: org1.id,
          role: 'member',
        },
      });

      await this.prisma.organizationMember.create({
        data: {
          userId: user1.id,
          organizationId: org2.id,
          role: 'owner',
        },
      });

      // Create mock outlines
      await this.prisma.outline.createMany({
        data: [
          {
            header: 'Executive Summary',
            sectionType: 'EXECUTIVE_SUMMARY',
            status: 'COMPLETED',
            target: 100,
            limit: 95,
            reviewer: 'ASSIM',
            organizationId: org1.id,
            userId: user1.id,
          },
          {
            header: 'Technical Approach',
            sectionType: 'TECHNICAL_APPROACH',
            status: 'IN_PROGRESS',
            target: 150,
            limit: 80,
            reviewer: 'BINI',
            organizationId: org1.id,
            userId: user1.id,
          },
          {
            header: 'Project Design',
            sectionType: 'DESIGN',
            status: 'PENDING',
            target: 200,
            limit: 0,
            reviewer: 'MAMI',
            organizationId: org1.id,
            userId: user2.id,
          },
          {
            header: 'Cover Page',
            sectionType: 'EXECUTIVE_SUMMARY',
            status: 'IN_PROGRESS',
            target: 18,
            limit: 12,
            reviewer: 'ASSIM',
            organizationId: org2.id,
            userId: user1.id,
          },
        ],
      });

      console.log('Mock data seeded successfully!');
    } catch (error) {
      console.error('Error seeding mock data:', error);
    }
  }
}