// Script to add dynamic export to all API routes
const fs = require('fs');
const path = require('path');

const apiRoutes = [
  'auth/login/route.ts',
  'auth/logout/route.ts',
  'auth/signup/route.ts',
  'content/route.ts',
  'content/seed/route.ts',
  'gamification/check-achievements/route.ts',
  'gamification/progress/route.ts',
  'health/route.ts',
  'learning/attention/route.ts',
  'learning/complete/route.ts',
  'learning/content/route.ts',
  'learning/report/route.ts',
  'quiz/adaptive/route.ts',
  'realtime/data/route.ts',
  'realtime/predict/route.ts',
  'realtime/summary/route.ts',
  'test-db/route.ts',
  'user/adhd-score/route.ts',
  'user/preferences/route.ts',
  'user/profile/route.ts'
];

const dynamicExport = "export const dynamic = 'force-dynamic';\n\n";

apiRoutes.forEach(route => {
  const filePath = path.join(__dirname, '..', 'app', 'api', route);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if dynamic export already exists
    if (!content.includes("export const dynamic")) {
      // Add after imports
      content = dynamicExport + content;
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${route}`);
    } else {
      console.log(`⚠️  Already has dynamic export: ${route}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${route}:`, error.message);
  }
});

console.log('\n✨ All API routes updated!');
