import fs from 'fs';
import path from 'path';

const SRC_REACT = path.join(process.cwd(), 'src', 'react');
const SRC_APP = path.join(process.cwd(), 'src', 'app');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace react-router-dom Link with next/link
  content = content.replace(/import\s+\{([^}]*Link[^}]*)\}\s+from\s+['"]react-router-dom['"]/g, (match, p1) => {
    return `import Link from 'next/link';\n// TODO: Fix other imports from react-router-dom if any: ${p1.replace('Link', '')}`;
  });
  
  // Replace useNavigate with useRouter
  content = content.replace(/useNavigate/g, 'useRouter');
  content = content.replace(/import\s+\{([^}]*useRouter[^}]*)\}\s+from\s+['"]react-router-dom['"]/g, "import { useRouter } from 'next/navigation'");
  content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-router-dom['"]/g, (match, p1) => {
    if (p1.includes('useRouter')) {
       return match.replace('react-router-dom', 'next/navigation');
    }
    return match;
  });
  
  // Add 'use client' to pages
  if (content.includes('useState') || content.includes('useEffect') || content.includes('useRouter')) {
    if (!content.startsWith('"use client"') && !content.startsWith("'use client'")) {
      content = `"use client";\n` + content;
    }
  }

  return content;
}

const routes = {
  'Home.tsx': '',
  'Product.tsx': 'product',
  'Features.tsx': 'features',
  'Security.tsx': 'security',
  'Pricing.tsx': 'pricing',
  'About.tsx': 'about',
  'Login.tsx': 'login',
  'PrivacyPolicy.tsx': 'privacy-policy',
  'SuperAdminDashboard.tsx': 'super-admin/dashboard',
  'SocietyAdminDashboard.tsx': 'admin/dashboard',
  'UserManagement.tsx': 'admin/users',
  'BuildingManagement.tsx': 'admin/buildings',
  'AccountingManagement.tsx': 'admin/accounting',
  'AdminGuardManagement.tsx': 'admin/guards',
  'CommunityManagement.tsx': 'admin/community',
  'EventManagement.tsx': 'admin/events',
  'CommunicationsManagement.tsx': 'admin/communications'
};

ensureDir(SRC_APP);

for (const [file, route] of Object.entries(routes)) {
  const sourcePath = path.join(SRC_REACT, 'pages', file);
  if (fs.existsSync(sourcePath)) {
    const destDir = path.join(SRC_APP, route);
    ensureDir(destDir);
    const destPath = path.join(destDir, 'page.tsx');
    
    let content = processFile(sourcePath);
    fs.writeFileSync(destPath, content);
    console.log(`Moved ${file} to ${route}/page.tsx`);
  }
}
