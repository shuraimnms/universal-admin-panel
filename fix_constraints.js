const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log('Fixing constraints...');
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE issues DROP CONSTRAINT IF EXISTS issues_volume_issue_number_key;');
    await prisma.$executeRawUnsafe('ALTER TABLE issues ADD CONSTRAINT issues_site_id_volume_issue_number_key UNIQUE (site_id, volume, issue_number);');
    console.log('Constraint updated successfully');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
