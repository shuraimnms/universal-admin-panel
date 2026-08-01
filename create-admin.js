const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@va-ra.co';
  const password = 'Admin@123456';
  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'ADMIN',
      isVerified: true,
      isBanned: false,
      passwordHash: hash,
    },
    create: {
      email,
      firstName: 'Super',
      lastName: 'Admin',
      passwordHash: hash,
      role: 'ADMIN',
      isVerified: true,
      isBanned: false,
      institution: 'IJARCM',
    },
  });

  console.log('');
  console.log('✅ SUCCESS: Admin user is ready!');
  console.log('─────────────────────────────');
  console.log('Email   :', user.email);
  console.log('Role    :', user.role);
  console.log('Verified:', user.isVerified);
  console.log('Password: Admin@123456');
  console.log('─────────────────────────────');
  console.log('Login at: http://localhost:3003/auth/login');
  console.log('');

  await prisma.$disconnect();
}

main().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
