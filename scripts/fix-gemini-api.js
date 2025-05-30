#!/usr/bin/env node

/**
 * Fix script for the Gemini API error
 * This script finds and removes the responseStyle parameter from API requests
 */

const fs = require('fs');
const path = require('path');

// Files to check and fix
const filesToCheck = [
  path.join(__dirname, '..', 'lib', 'gemini-api.ts'),
  path.join(__dirname, '..', 'lib', 'gemini-api-fixed.ts'),
  path.join(__dirname, '..', 'lib', 'gemini-service-enhanced.ts'),
  // Add more files if needed
];

// Regular expression to find responseStyle in generationConfig
const responseStyleRegex = /(\s*)responseStyle:\s*["'][A-Z_]+["'],?/g;

console.log('🔍 Checking for responseStyle parameter in Gemini API requests...');

let fixedFiles = 0;

filesToCheck.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`Checking ${path.basename(filePath)}...`);
    
    // Read file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if responseStyle is present
    if (responseStyleRegex.test(content)) {
      console.log(`  Found responseStyle parameter in ${path.basename(filePath)}`);
      
      // Create backup
      const backupPath = `${filePath}.bak`;
      fs.writeFileSync(backupPath, content);
      console.log(`  Created backup at ${path.basename(backupPath)}`);
      
      // Remove responseStyle parameter
      const newContent = content.replace(responseStyleRegex, '');
      
      // Write fixed content
      fs.writeFileSync(filePath, newContent);
      console.log(`  ✅ Fixed ${path.basename(filePath)}`);
      
      fixedFiles++;
    } else {
      console.log(`  ✓ No responseStyle parameter found in ${path.basename(filePath)}`);
    }
  } else {
    console.log(`⏭️  Skipping ${path.basename(filePath)} (file not found)`);
  }
});

if (fixedFiles > 0) {
  console.log(`\n✅ Fixed ${fixedFiles} file(s).`);
  console.log('The Gemini API should now work correctly.');
} else {
  console.log('\n✓ No files needed fixing.');
}

console.log('\nIf you still encounter issues, please check:');
console.log('1. That you\'re using the correct API key');
console.log('2. That you have access to the Gemini API models');
console.log('3. For other API configuration issues in your request');