/**
 * Script to fix the broken appwrite.ts file
 * Run this script with: node fix-appwrite.js
 */

const fs = require('fs');
const path = require('path');

console.log('Starting Appwrite fix script...');

// Define file paths
const broken = path.join(__dirname, 'lib', 'appwrite.ts');
const backup = path.join(__dirname, 'lib', 'appwrite.ts.backup');
const fixed = path.join(__dirname, 'lib', 'appwrite-simple.ts');

// Check if our fixed file exists
if (!fs.existsSync(fixed)) {
  console.error('Error: The fixed file (appwrite-simple.ts) does not exist.');
  console.log('Make sure you have created the fixed version first.');
  process.exit(1);
}

try {
  // First create a backup of the broken file
  console.log('Creating backup of the original file...');
  if (fs.existsSync(broken)) {
    fs.copyFileSync(broken, backup);
    console.log(`Backup created at ${backup}`);
  }

  // Copy the fixed file to replace the broken one
  console.log('Replacing broken file with fixed version...');
  fs.copyFileSync(fixed, broken);
  console.log('Fixed file has been copied successfully.');

  console.log('');
  console.log('✅ Appwrite fix completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Restart your development server');
  console.log('2. If you still encounter issues, you may need to restore additional functionality');
  console.log('   from your backed up file (appwrite.ts.backup) to the new file.');
  console.log('');
} catch (error) {
  console.error('Error during file operations:', error);
  console.log('');
  console.log('Manual fix instructions:');
  console.log('1. Rename lib/appwrite-simple.ts to lib/appwrite.ts');
  console.log('2. Restart your development server');
  process.exit(1);
}