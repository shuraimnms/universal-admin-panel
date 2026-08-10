import { PrismaClient } from '@prisma/client';

// Force use of IPv4-compatible pooler in production to bypass Vercel IPv6 outbound limitation
if (process.env.NODE_ENV === 'production' || !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres.kkecypefhdwioqejjvof:admin%40va-ra12@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true";
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;