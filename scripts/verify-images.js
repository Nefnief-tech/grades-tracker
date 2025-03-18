// Run with: node scripts/verify-images.js

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");
const readFile = promisify(fs.readFile);
const readdir = promisify(fs.readdir);

const PUBLIC_DIR = path.join(__dirname, "../public");
const SRC_DIR = path.join(__dirname, "..");
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".svg", ".gif", ".webp"];

async function getAllFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true });

  for (const file of files) {
    if (
      file.isDirectory() &&
      !file.name.startsWith("node_modules") &&
      !file.name.startsWith(".next")
    ) {
      await getAllFiles(path.join(dir, file.name), fileList);
    } else if (
      file.name.endsWith(".tsx") ||
      file.name.endsWith(".ts") ||
      file.name.endsWith(".jsx") ||
      file.name.endsWith(".js") ||
      file.name.endsWith(".md")
    ) {
      fileList.push(path.join(dir, file.name));
    }
  }

  return fileList;
}

async function extractImagePaths(filePath) {
  const content = await readFile(filePath, "utf8");

  // Match src="/path/to/image.ext" patterns
  const srcRegex = /src=["']\/([^"']+\.(png|jpg|jpeg|svg|gif|webp))["']/g;
  const matches = [];
  let match;

  while ((match = srcRegex.exec(content)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

async function main() {
  // Get all source files
  const allFiles = await getAllFiles(SRC_DIR);

  // Extract image paths from all files
  const allImagePaths = [];
  for (const file of allFiles) {
    const imagePaths = await extractImagePaths(file);
    allImagePaths.push(...imagePaths);
  }

  // Deduplicate paths
  const uniqueImagePaths = [...new Set(allImagePaths)];

  console.log(`Found ${uniqueImagePaths.length} unique image references:`);

  // Check if images exist
  const missingImages = [];
  for (const imagePath of uniqueImagePaths) {
    const fullPath = path.join(PUBLIC_DIR, imagePath);
    if (!fs.existsSync(fullPath)) {
      missingImages.push(imagePath);
    }
  }

  if (missingImages.length === 0) {
    console.log("✅ All referenced images exist in the public directory!");
  } else {
    console.log(`❌ Missing ${missingImages.length} images:`);
    missingImages.forEach((img) => console.log(` - ${img}`));
  }
}

main().catch(console.error);
