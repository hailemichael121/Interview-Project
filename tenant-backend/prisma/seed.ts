import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create Prisma client with adapter (same as your PrismaService)
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  try {
    console.log('Clearing existing data...');
    await prisma.outline.deleteMany();
    await prisma.invitationLog.deleteMany();
    await prisma.organizationInvite.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.reviewer.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.verificationToken.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log('Note: Some tables may be empty, continuing...');
  }

  console.log('Creating test users...');

  // Create Test User (Owner) - now includes role and tenantId
  const testUserOwner = await prisma.user.create({
    data: {
      email: 'testy@example.com',
      name: 'Test User',
      role: 'OWNER',
      tenantId: 'tenant-owner',
      banned: false,
      emailVerified: true,
    },
  });

  // Create Test User (Member) - now includes role and tenantId
  const testUserMember = await prisma.user.create({
    data: {
      email: 'test@example.com',
      name: 'Testy User',
      role: 'MEMBER',
      tenantId: 'tenant-member',
      banned: false,
      emailVerified: true,
    },
  });

  console.log('Creating organizations...');

  // Create organization for Test User (Owner)
  const testOrg = await prisma.organization.create({
    data: {
      name: 'Test Organization',
      slug: 'test-org',
    },
  });

  console.log('Creating organization members...');

  // Add Test User as OWNER of the organization
  const ownerMember = await prisma.organizationMember.create({
    data: {
      userId: testUserOwner.id,
      organizationId: testOrg.id,
      role: 'OWNER',
    },
  });

  // Add Test User as MEMBER of the organization
  const memberMember = await prisma.organizationMember.create({
    data: {
      userId: testUserMember.id,
      organizationId: testOrg.id,
      role: 'MEMBER',
    },
  });

  console.log('Creating invitation for member...');

  // Create an invitation for the member user (for demonstration)
  const invitationToken = 'invite-' + Date.now();
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.organizationInvite.create({
    data: {
      organizationId: testOrg.id,
      email: 'another-user@example.com', // Different email for demo
      role: 'MEMBER',
      token: invitationToken,
      expires: expires,
      invitedById: ownerMember.id,
    },
  });

  // Create invitation log
  await prisma.invitationLog.create({
    data: {
      inviteToken: invitationToken,
      invitedEmail: 'another-user@example.com',
      organizationId: testOrg.id,
      inviterMemberId: ownerMember.id,
      status: 'PENDING',
    },
  });

  console.log('Creating sample outlines...');

  // Create some sample outlines for the organization
  await prisma.outline.createMany({
    data: [
      {
        header: 'Project Executive Summary',
        sectionType: 'EXECUTIVE_SUMMARY',
        status: 'COMPLETED',
        target: 120,
        limit: 100,
        organizationId: testOrg.id,
        createdByMemberId: ownerMember.id,
      },
      {
        header: 'Technical Implementation Plan',
        sectionType: 'TECHNICAL_APPROACH',
        status: 'IN_PROGRESS',
        target: 200,
        limit: 180,
        organizationId: testOrg.id,
        createdByMemberId: ownerMember.id,
      },
      {
        header: 'System Architecture Design',
        sectionType: 'DESIGN',
        status: 'PENDING',
        target: 150,
        limit: 0,
        organizationId: testOrg.id,
        createdByMemberId: ownerMember.id,
      },
    ],
  });

  console.log('Seed completed successfully!');
  console.log('==============================');
  console.log('Test Users Created:');
  console.log(`- Owner: ${testUserOwner.email} (${testUserOwner.name})`);
  console.log(`  User ID: ${testUserOwner.id}`);
  console.log(`  Role: ${testUserOwner.role || 'user'}`);
  console.log(`  Tenant ID: ${testUserOwner.tenantId || 'none'}`);
  console.log(`- Member: ${testUserMember.email} (${testUserMember.name})`);
  console.log(`  User ID: ${testUserMember.id}`);
  console.log(`  Role: ${testUserMember.role || 'user'}`);
  console.log(`  Tenant ID: ${testUserMember.tenantId || 'none'}`);
  console.log(`Organization: ${testOrg.name} (${testOrg.slug})`);
  console.log(`Organization ID: ${testOrg.id}`);
  console.log(`Invitation Token: ${invitationToken}`);
  console.log('==============================');
  console.log(
    'IMPORTANT: These users can sign up but cannot sign in with email/password',
  );
  console.log(
    'because they were created directly in the database without authentication setup.',
  );
  console.log(
    'Use the sign-up endpoint to create users that can actually log in.',
  );
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
