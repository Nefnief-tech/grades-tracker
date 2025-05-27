const fs = require('fs');
const path = require('path');

console.log('🚀 Creating assets for Vocabulary Extractor...');

// Create assets directory
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
  console.log('✅ Created assets directory');
}

// Base64 of a tiny valid PNG (1x1 blue pixel)
const validPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI/hRWkOQAAAABJRU5ErkJggg==';

// Create PNG files
const pngFiles = ['icon.png', 'adaptive-icon.png', 'splash.png', 'favicon.png'];

pngFiles.forEach(filename => {
  const filepath = path.join(assetsDir, filename);
  const buffer = Buffer.from(validPngBase64, 'base64');
  fs.writeFileSync(filepath, buffer);
  console.log(`✅ Created ${filename}`);
});

console.log('\n🎉 All assets created successfully!');
console.log('📱 Your app should now work with Expo Go!');
console.log('\nNext steps:');
console.log('1. Run: npm start');
console.log('2. Install Expo Go on your phone');
console.log('3. Scan QR code to load your vocabulary extractor!');

// Verify assets exist
console.log('\n📁 Assets created:');
fs.readdirSync(assetsDir).forEach(file => {
  const stats = fs.statSync(path.join(assetsDir, file));
  console.log(`   ${file} (${stats.size} bytes)`);
});