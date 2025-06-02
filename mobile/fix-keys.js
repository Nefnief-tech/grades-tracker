#!/usr/bin/env node

// Quick fix script for React key prop warnings
// Run with: node fix-keys.js

const fs = require('fs');
const path = require('path');

const files = [
  './src/screens/HomeScreen-appwrite.js',
  './src/screens/SubjectsScreen-appwrite.js', 
  './src/screens/GradesScreen-appwrite.js',
  './src/screens/AnalyticsScreen-appwrite.js',
  './src/screens/GradePredictionScreen-appwrite.js',
  './src/screens/VocabularyScreen-appwrite.js'
];

function fixFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix subjects mapping
  if (content.includes('subjects.map((subject) => (') && !content.includes('key={subject.$id}')) {
    content = content.replace(
      /subjects\.map\(\(subject\) => \(\s*<List\.Item/g,
      'subjects.map((subject) => (\n              <List.Item\n                key={subject.$id}'
    );
    modified = true;
  }

  // Fix grades mapping  
  if (content.includes('grades.map((grade) => {') && !content.includes('key={grade.$id}')) {
    content = content.replace(
      /grades\.map\(\(grade\) => \{\s*const subject[\s\S]*?return \(\s*<List\.Item/g,
      match => match.replace('<List.Item', '<List.Item\n                key={grade.$id}')
    );
    modified = true;
  }

  // Fix recentGrades mapping
  if (content.includes('recentGrades.map((grade) => {') && !content.includes('key={grade.$id}')) {
    content = content.replace(
      /recentGrades\.map\(\(grade\) => \{\s*const subject[\s\S]*?return \(\s*<List\.Item/g,
      match => match.replace('<List.Item', '<List.Item\n                    key={grade.$id}')
    );
    modified = true;
  }

  // Fix predictions mapping
  if (content.includes('predictions.map((prediction) => (') && !content.includes('key={')) {
    content = content.replace(
      /predictions\.map\(\(prediction\) => \(/g,
      'predictions.map((prediction, index) => ('
    );
    content = content.replace(
      /predictions\.map\(\(prediction, index\) => \(\s*<Card/g,
      'predictions.map((prediction, index) => (\n            <Card key={index}'
    );
    modified = true;
  }

  // Fix vocabulary mapping
  if (content.includes('vocabularyItems.map((item) => (') && !content.includes('key={item.$id}')) {
    content = content.replace(
      /vocabularyItems\.map\(\(item\) => \(\s*<Card/g,
      'vocabularyItems.map((item) => (\n          <Card key={item.$id}'
    );
    modified = true;
  }

  // Fix subject stats mapping
  if (content.includes('subjectStats.map((subject) => (') && !content.includes('key={subject.')) {
    content = content.replace(
      /subjectStats\.map\(\(subject\) => \(\s*<View/g,
      'subjectStats.map((subject) => (\n              <View key={subject.id || subject.name}'
    );
    modified = true;
  }

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