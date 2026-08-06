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
  
  // Remove all occurrences of "export const dynamic = 'force-dynamic';"
  const regex = /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"];?\r?\n?/g;
  content = content.replace(regex, '');
  
  // Also remove "export const dynamic = "force-dynamic"" (no semicolon)
  const regex2 = /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]\r?\n?/g;
  content = content.replace(regex2, '');

  // Add it exactly once at the top
  content = "export const dynamic = 'force-dynamic';\n" + content.trimStart();
  
  fs.writeFileSync(route, content, 'utf8');
  console.log(`Cleaned ${route}`);
});
