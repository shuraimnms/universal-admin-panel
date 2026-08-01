const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@va-ra.co';
  try {
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log('Successfully updated user:', updatedUser.email, 'to role:', updatedUser.role);
  } catch (error) {
    console.error('Failed to update user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
