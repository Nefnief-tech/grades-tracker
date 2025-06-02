const fs = require('fs');
const path = require('path');

// Files to fix
const screenFiles = [
  './src/screens/HomeScreen-appwrite.js',
  './src/screens/SubjectsScreen-appwrite.js',
  './src/screens/GradesScreen-appwrite.js',
  './src/screens/AnalyticsScreen-appwrite.js',
  './src/screens/GradePredictionScreen-appwrite.js',
  './src/screens/VocabularyScreen-appwrite.js'
];

function addKeysToFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Pattern 1: List.Item without key
  content = content.replace(
    /(<List\.Item\s+(?![^>]*key=)[^>]*)/g,
    '$1\n                key={item.$id || index}'
  );
  
  // Pattern 2: Card without key
  content = content.replace(
    /(<Card\s+(?![^>]*key=)[^>]*style)/g,
    '$1 key={item.$id || index} style'
  );
  
  // Pattern 3: View without key in maps
  content = content.replace(
    /(\s+<View\s+(?![^>]*key=)[^>]*style=\{styles\.statItem\})/g,
    '$1 key={subject.id || subject.name || index}'
  );

  // Add keys to common mapping patterns
  const mappingPatterns = [
    {
      // subjects.map pattern
      search: /(subjects\.map\(\(subject\)\s*=>\s*\{[^}]*return\s*\(\s*<List\.Item)/g,
      replace: '$1\n                key={subject.$id}'
    },
    {
      // grades.map pattern  
      search: /(grades\.map\(\(grade\)\s*=>\s*\{[^}]*return\s*\(\s*<List\.Item)/g,
      replace: '$1\n                key={grade.$id}'
    },
    {
      // recentGrades.map pattern
      search: /(recentGrades\.map\(\(grade\)\s*=>\s*\{[^}]*return\s*\(\s*<List\.Item)/g,
      replace: '$1\n                    key={grade.$id}'
    },
    {
      // vocabularyItems.map pattern
      search: /(vocabularyItems\.map\(\(item\)\s*=>\s*\(\s*<Card)/g,
      replace: '$1 key={item.$id}'
    },
    {
      // predictions.map pattern - add index parameter
      search: /predictions\.map\(\(prediction\)\s*=>/g,
      replace: 'predictions.map((prediction, index) =>'
    },
    {
      // predictions Card pattern
      search: /(predictions\.map\(\(prediction,\s*index\)\s*=>\s*\(\s*<Card)/g,
      replace: '$1 key={index}'
    }
  ];

  mappingPatterns.forEach(pattern => {
    content = content.replace(pattern.search, pattern.replace);
  });

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed keys in: ${path.basename(filePath)}`);
    return true;
  } else {
    console.log(`ℹ️  No key issues found in: ${path.basename(filePath)}`);
    return false;
  }
}

console.log('🔧 Adding React keys to list items...\n');

let totalFixed = 0;
screenFiles.forEach(file => {
  if (addKeysToFile(file)) {
    totalFixed++;
  }
});

console.log(`\n✨ Fixed ${totalFixed} files!`);
console.log('🎯 React key warnings should now be resolved.');

// Also fix the demo mode message
console.log('\n📝 Note: Currently running in DEMO MODE');
console.log('To enable Appwrite: Update PROJECT_ID in src/services/appwrite-complete.js');
console.log('Replace "YOUR_ACTUAL_PROJECT_ID" with your real Appwrite Project ID');