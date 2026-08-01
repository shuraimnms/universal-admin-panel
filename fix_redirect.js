const fs = require('fs');
const path = require('path');

const files = [
  'src/app/dashboard/author/page.tsx',
  'src/app/dashboard/reviewer/page.tsx',
  'src/app/dashboard/student/page.tsx'
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Replace redirect import
    content = content.replace("import { redirect } from 'next/navigation';", "");
    
    // Ensure useRouter is imported
    if (!content.includes("import { useRouter")) {
      content = content.replace("import { useSearchParams } from 'next/navigation';", "import { useRouter, useSearchParams } from 'next/navigation';");
    } else if (content.includes("useSearchParams") && !content.includes("useRouter")) {
      content = content.replace("useSearchParams", "useRouter, useSearchParams");
    }

    // Add router = useRouter() if missing
    if (!content.includes("const router = useRouter();")) {
      content = content.replace("const searchParams = useSearchParams();", "const router = useRouter();\n  const searchParams = useSearchParams();");
      // If searchParams isn't there, just put it after useAuth
      if (!content.includes("const searchParams")) {
         content = content.replace("const { user", "const router = useRouter();\n  const { user");
      }
    }

    // Replace redirect() with router.push()
    content = content.replace(/redirect\('\/dashboard'\);/g, "router.push('/dashboard');");
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed ${file}`);
  }
});
