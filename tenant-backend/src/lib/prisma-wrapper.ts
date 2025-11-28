import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const adapter = new PrismaPg(pool);

// Create base Prisma client
const basePrisma = new PrismaClient({
  adapter: adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

// Create a proxy to intercept account operations
const accountProxy = {
  create: async (args: any) => {
    // Map providerId to provider if present
    if (args?.data) {
      if (args.data.providerId && !args.data.provider) {
        args.data.provider = args.data.providerId;
        delete args.data.providerId;
      }
      // Ensure provider has a default value
      if (!args.data.provider) {
        args.data.provider = 'credential';
      }
    }
    return basePrisma.account.create(args);
  },
  upsert: async (args: any) => {
    // Map providerId to provider for upsert operations
    if (args?.create) {
      if (args.create.providerId && !args.create.provider) {
        args.create.provider = args.create.providerId;
        delete args.create.providerId;
      }
      if (!args.create.provider) {
        args.create.provider = 'credential';
      }
    }
    if (args?.update) {
      if (args.update.providerId && !args.update.provider) {
        args.update.provider = args.update.providerId;
        delete args.update.providerId;
      }
    }
    return basePrisma.account.upsert(args);
  },
};

// Wrap the prisma client to intercept account operations
export const prisma = new Proxy(basePrisma, {
  get(target, prop) {
    if (prop === 'account') {
      return new Proxy(target.account, {
        get(accountTarget: any, accountProp: any) {
          if (accountProp === 'create') {
            return accountProxy.create;
          }
          if (accountProp === 'upsert') {
            return accountProxy.upsert;
          }
          return accountTarget[accountProp];
        },
      });
    }
    return target[prop as keyof PrismaClient];
  },
}) as PrismaClient;

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

