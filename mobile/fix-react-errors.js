const fs = require('fs');
const path = require('path');

// Fix multiple React/JavaScript errors in screen files
const screenFiles = [
  './src/screens/HomeScreen-appwrite.js',
  './src/screens/SubjectsScreen-appwrite.js',
  './src/screens/GradesScreen-appwrite.js',
  './src/screens/AnalyticsScreen-appwrite.js',
  './src/screens/GradePredictionScreen-appwrite.js',
  './src/screens/VocabularyScreen-appwrite.js'
];

function fixCommonErrors(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix 1: Ensure all text is wrapped in <Text> components
  // Look for patterns like: ) : ( followed by raw text
  const rawTextPattern = /\)\s*:\s*\(\s*([A-Za-z][^<>]*?)\s*\)/g;
  if (rawTextPattern.test(content)) {
    content = content.replace(rawTextPattern, ') : (\n            <Text>$1</Text>\n          )');
    modified = true;
  }

  // Fix 2: Add null checks for object properties
  content = content.replace(/(\w+)\.subject\./g, '$1.subject?.');
  content = content.replace(/(\w+)\.grade\./g, '$1.grade?.');
  content = content.replace(/(\w+)\.score\.toFixed/g, '($1.score || 0).toFixed');
  content = content.replace(/(\w+)\.average\.toFixed/g, '($1.average || 0).toFixed');

  // Fix 3: Add keys to mapped elements without them
  const mapPatterns = [
    {
      search: /(\w+\.map\(\([^)]+\)\s*=>\s*\(\s*<\w+)(\s+(?!key=)[^>]*>)/g,
      replace: '$1 key={item.$id || index}$2'
    }
  ];

  mapPatterns.forEach(pattern => {
    if (pattern.search.test(content)) {
      content = content.replace(pattern.search, pattern.replace);
      modified = true;
    }
  });

  // Fix 4: Ensure Text components are imported
  if (!content.includes("import { View, Text,") && content.includes("<Text>")) {
    content = content.replace(
      /import { View,/,
      'import { View, Text,'
    );
    modified = true;
  }

  // Fix 5: Add fallbacks for undefined values
  content = content.replace(/description=\{`([^`]*)\$\{([^}]+)\}([^`]*)`\}/g, 
    'description={`$1${$2 || \'N/A\'}$3`}');

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed errors in: ${path.basename(filePath)}`);
    return true;
  } else {
    console.log(`ℹ️  No issues found in: ${path.basename(filePath)}`);
    return false;
  }
}

console.log('🔧 Fixing React errors in screen files...\n');

let totalFixed = 0;
screenFiles.forEach(file => {
  if (fixCommonErrors(file)) {
    totalFixed++;
  }
});

console.log(`\n✨ Fixed ${totalFixed} files!`);
console.log('\n📋 Additional Manual Fixes Needed:');
console.log('1. Downgrade Appwrite SDK: npm install appwrite@13.0.2');
console.log('2. Check collection schema for correct attribute names');
console.log('3. Ensure all object property accesses have null checks');

console.log('\n🎯 After fixes, the following errors should be resolved:');
console.log('- Text component warnings');
console.log('- Reference errors for undefined properties');
console.log('- Missing key prop warnings');