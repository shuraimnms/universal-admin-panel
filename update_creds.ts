import { PrismaClient } from '@prisma/client';
import CryptoJS from 'crypto-js';

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.CROSSREF_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || 'fallback-encryption-key-12345';

function encrypt(text: string): string {
  if (!text) return text;
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

async function run() {
  const settings = await prisma.crossrefSettings.findFirst();
  if (settings) {
    await prisma.crossrefSettings.update({
      where: { id: settings.id },
      data: {
        crossrefUser: 'admin@va-ra.co',
        crossrefPass: encrypt('Russian_0055000'),
        environment: 'PRODUCTION' // MUST BE UPPERCASE for crossref-worker check!
      }
    });
    console.log('Updated credentials');
  }

  // Reset the deposit to test again
  await prisma.crossrefDeposit.updateMany({
    data: {
      status: 'WAITING',
      retryCount: 0
    }
  });
  console.log('Reset deposits to WAITING');
}

run().catch(console.error).finally(() => prisma.$disconnect());
