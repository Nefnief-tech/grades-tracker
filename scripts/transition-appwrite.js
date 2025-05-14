// This script helps you transition from the broken appwrite.ts to the fixed version
// Run with: node scripts/transition-appwrite.js

const fs = require('fs');
const path = require('path');

console.log('Starting Appwrite client transition script...');

// File paths
const sourceFile = path.join(__dirname, '..', 'lib', 'appwrite-fixed.ts');
const targetFile = path.join(__dirname, '..', 'lib', 'appwrite.ts');
const backupFile = path.join(__dirname, '..', 'lib', 'appwrite.ts.bak');

// Step 1: Check if fixed file exists
if (!fs.existsSync(sourceFile)) {
  console.error('Error: appwrite-fixed.ts not found!');
  console.log('Make sure you have created the fixed version first.');
  process.exit(1);
}

// Step 2: Create backup of original file
try {
  console.log('Creating backup of original appwrite.ts file...');
  if (fs.existsSync(targetFile)) {
    fs.copyFileSync(targetFile, backupFile);
    console.log(`Backup created at ${backupFile}`);
  } else {
    console.log('No existing appwrite.ts file found, skipping backup');
  }
} catch (error) {
  console.error('Error creating backup:', error);
  process.exit(1);
}

// Step 3: Copy fixed file to replace the original
try {
  console.log('Replacing appwrite.ts with fixed version...');
  fs.copyFileSync(sourceFile, targetFile);
  console.log('Successfully replaced appwrite.ts with fixed version');
} catch (error) {
  console.error('Error replacing file:', error);
  console.log('Attempting to restore from backup...');
  
  if (fs.existsSync(backupFile)) {
    try {
      fs.copyFileSync(backupFile, targetFile);
      console.log('Restored original file from backup');
    } catch (restoreError) {
      console.error('Failed to restore from backup:', restoreError);
    }
  }
  
  process.exit(1);
}

console.log('\nAppwrite client transition completed successfully!');
console.log('Your application should now work with the fixed Appwrite client.');
console.log('\nNext steps:');
console.log('1. Restart your development server');
console.log('2. Test the connection with the debug tools');
console.log('3. If issues persist, visit the /repair route in your application');