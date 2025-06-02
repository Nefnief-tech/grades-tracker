const fs = require('fs');
const path = require('path');

// Fix corrupted syntax in screen files
const files = [
  './src/screens/HomeScreen-appwrite.js',
  './src/screens/SubjectsScreen-appwrite.js',
  './src/screens/GradesScreen-appwrite.js',
  './src/screens/AnalyticsScreen-appwrite.js',
  './src/screens/GradePredictionScreen-appwrite.js',
  './src/screens/VocabularyScreen-appwrite.js'
];

function fixSyntax(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let fixed = false;

  // Fix the corrupted syntax: style={style key={item.$id || index} styles.something}
  const corrupted = /style=\{style key=\{[^}]*\} styles\.([^}]+)\}/g;
  if (corrupted.test(content)) {
    content = content.replace(corrupted, 'style={styles.$1}');
    fixed = true;
  }

  // Also fix variations
  const variations = [
    /style=\{style key=\{[^}]*\} ([^}]+)\}/g,
    /style=\{[^}]*key=\{[^}]*\}[^}]*styles\.([^}]+)\}/g
  ];

  variations.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, (match, group1) => {
        if (group1.startsWith('styles.')) {
          return `style={${group1}}`;
        } else {
          return `style={styles.${group1}}`;
        }
      });
      fixed = true;
    }
  });

  if (fixed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed syntax in: ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ️  No syntax issues in: ${path.basename(filePath)}`);
  }
}

console.log('🔧 Fixing corrupted JSX syntax...\n');

files.forEach(fixSyntax);

console.log('\n✨ Syntax should now be fixed!');
console.log('🚀 Try running the app again.');