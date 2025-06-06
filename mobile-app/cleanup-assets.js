const fs = require('fs');
const path = require('path');

// Clean up any existing corrupted PNG files
const assetsDir = path.join(__dirname, 'assets');

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  const pngFiles = files.filter(f => f.endsWith('.png'));
  
  console.log('🧹 Cleaning up existing PNG files...');
  pngFiles.forEach(file => {
    const filePath = path.join(assetsDir, file);
    fs.unlinkSync(filePath);
    console.log(`   Removed ${file}`);
  });
  
  console.log('✅ Cleanup complete!');
} else {
  console.log('📁 No assets directory found, nothing to clean.');
}