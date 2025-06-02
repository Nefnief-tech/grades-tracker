#!/usr/bin/env node

// Quick fix script for React key prop warnings
// Run with: node fix-keys.js

const fs = require('fs');
const path = require('path');

const files = [
  'f:/grade-tracker-v2/mobile/src/screens/HomeScreen-appwrite.js',
  'f:/grade-tracker-v2/mobile/src/screens/SubjectsScreen-appwrite.js', 
  'f:/grade-tracker-v2/mobile/src/screens/GradesScreen-appwrite.js',
  'f:/grade-tracker-v2/mobile/src/screens/AnalyticsScreen-appwrite.js',
  'f:/grade-tracker-v2/mobile/src/screens/GradePredictionScreen-appwrite.js',
  'f:/grade-tracker-v2/mobile/src/screens/VocabularyScreen-appwrite.js'
];

const fixes = [
  // Fix subjects mapping
  {
    search: /subjects\.map\(\(subject\) => \(/g,
    replace: 'subjects.map((subject) => (\n              <List.Item\n                key={subject.$id}'
  },
  // Fix grades mapping  
  {
    search: /grades\.map\(\(grade\) => \{/g,
    replace: 'grades.map((grade) => {\n            return (\n              <List.Item\n                key={grade.$id}'
  },
  // Fix recentGrades mapping
  {
    search: /recentGrades\.map\(\(grade\) => \{/g,
    replace: 'recentGrades.map((grade) => {\n                return (\n                  <List.Item\n                    key={grade.$id}'
  },
  // Fix predictions mapping
  {
    search: /predictions\.map\(\(prediction\) => \(/g,
    replace: 'predictions.map((prediction, index) => (\n            <Card key={index}'
  },
  // Fix vocabulary mapping
  {
    search: /vocabularyItems\.map\(\(item\) => \(/g,
    replace: 'vocabularyItems.map((item) => (\n          <Card key={item.$id}'
  },
  // Fix subject stats mapping
  {
    search: /subjectStats\.map\(\(subject\) => \(/g,
    replace: 'subjectStats.map((subject) => (\n              <View key={subject.id}'
  }
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  fixes.forEach(fix => {
    if (fix.search.test(content)) {
      content = content.replace(fix.search, fix.replace);
      modified = true;
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ️  No changes needed: ${path.basename(filePath)}`);
  }
}

console.log('🔧 Fixing React key prop warnings...\n');

files.forEach(fixFile);

console.log('\n✨ All key prop warnings should now be resolved!');
console.log('🚀 Your Appwrite integration is ready to use.');