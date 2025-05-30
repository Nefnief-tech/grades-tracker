// Simple script to fix the route.ts file by replacing it with route-fixed.ts
const fs = require('fs');
const path = require('path');

// Path to the files
const routeDir = path.join(__dirname, 'app', 'api', 'vocabulary', 'extract');
const brokenFilePath = path.join(routeDir, 'route.ts');
const fixedFilePath = path.join(routeDir, 'route-fixed.ts');

// Make backup of original file
const backupFilePath = path.join(routeDir, 'route.ts.backup');
try {
  if (fs.existsSync(brokenFilePath)) {
    fs.copyFileSync(brokenFilePath, backupFilePath);
    console.log('✅ Created backup of original route.ts');
  } else {
    console.log('⚠️ Original route.ts not found');
  }
} catch (err) {
  console.error('❌ Error creating backup:', err);
}

// Replace broken file with fixed one
try {
  if (fs.existsSync(fixedFilePath)) {
    const fixedContent = fs.readFileSync(fixedFilePath, 'utf8');
    fs.writeFileSync(brokenFilePath, fixedContent);
    console.log('✅ Successfully replaced route.ts with fixed version');
  } else {
    console.error('❌ Fixed file not found');
  }
} catch (err) {
  console.error('❌ Error replacing file:', err);
}

console.log('Done. You can now restart your Next.js server.');