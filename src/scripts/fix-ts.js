const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../app/api/admin/crossref');

function fixFiles(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixFiles(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      content = content.replace(/import prisma from '@\/lib\/prisma';/g, "import { prisma } from '@/lib/prisma';");
      content = content.replace(/ && session\.user\.role !== 'EDITOR'/g, "");
      fs.writeFileSync(fullPath, content);
      console.log('Fixed', fullPath);
    }
  }
}

fixFiles(dir);
