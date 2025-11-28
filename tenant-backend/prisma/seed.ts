import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create connection pool and adapter for seed
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter: adapter, // Add the adapter here
});

async function main() {
  console.log('Starting seed...');

  // Clear existing data (in reverse order of dependencies)
  try {
    await prisma.outline.deleteMany();
    await prisma.organizationMember.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.account.deleteMany();
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
  } catch {
    console.log('Note: Some tables may not exist yet, continuing...');
  }

  console.log('Creating users...');

  const john = await prisma.user.create({
    data: {
      email: 'john@acme.com',
      name: 'John Doe',
    },
  });

  const jane = await prisma.user.create({
    data: {
      email: 'jane@acme.com',
      name: 'Jane Smith',
    },
  });

  const alex = await prisma.user.create({
    data: {
      email: 'alex@techflow.com',
      name: 'Alex Rivera',
    },
  });

  console.log('Creating organizations...');

  const acme = await prisma.organization.create({
    data: { name: 'Acme Corp', slug: 'acme-corp' },
  });

  const techflow = await prisma.organization.create({
    data: { name: 'TechFlow', slug: 'techflow' },
  });

  console.log('Creating organization members...');

  await prisma.organizationMember.createMany({
    data: [
      { userId: john.id, organizationId: acme.id, role: 'owner' },
      { userId: jane.id, organizationId: acme.id, role: 'member' },
      { userId: alex.id, organizationId: techflow.id, role: 'owner' },
      { userId: john.id, organizationId: techflow.id, role: 'member' },
    ],
  });

  console.log('Creating outlines...');

  await prisma.outline.createMany({
    data: [
      {
        header: 'Executive Summary',
        sectionType: 'EXECUTIVE_SUMMARY',
        status: 'COMPLETED',
        target: 120,
        limit: 100,
        reviewer: 'ASSIM',
        organizationId: acme.id,
        userId: john.id,
      },
      {
        header: 'Technical Approach',
        sectionType: 'TECHNICAL_APPROACH',
        status: 'IN_PROGRESS',
        target: 200,
        limit: 180,
        reviewer: 'BINI',
        organizationId: acme.id,
        userId: jane.id,
      },
      {
        header: 'System Design',
        sectionType: 'DESIGN',
        status: 'PENDING',
        target: 150,
        limit: 0,
        reviewer: 'MAMI',
        organizationId: techflow.id,
        userId: alex.id,
      },
    ],
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
