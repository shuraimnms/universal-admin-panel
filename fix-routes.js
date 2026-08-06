const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('route.ts') || file.endsWith('route.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const routes = walk('src/app/api');
routes.forEach(route => {
  let content = fs.readFileSync(route, 'utf8');
  if (!content.includes('force-dynamic')) {
    content = "export const dynamic = 'force-dynamic';\n" + content;
    fs.writeFileSync(route, content, 'utf8');
    console.log(`Updated ${route}`);
  }
});
