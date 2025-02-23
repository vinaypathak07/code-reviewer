// scripts/check-unused-images.mjs
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname equivalent in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SRC_DIR = "src";
const IMAGES_DIR = path.join(SRC_DIR, "images");
const VALID_EXTENSIONS = [".js", ".jsx", ".scss", ".css"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];

/**
 * Get all image files from the images directory
 * @param {string} dir - The directory to scan for images
 * @returns {Set<string>} - Set of image file paths
 */
function getImageFiles(dir) {
  const images = new Set();

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (IMAGE_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
        images.add(fullPath);
      }
    }
  }

  traverse(dir);
  return images;
}

/**
 * Get all code files from the source directory, excluding the images directory
 * @param {string} dir - The directory to scan
 * @param {string} excludeDir - The directory to exclude (images)
 * @returns {string[]} - List of code file paths
 */
function getCodeFiles(dir, excludeDir) {
  const codeFiles = [];

  function traverse(currentDir) {
    const files = fs.readdirSync(currentDir);

    for (const file of files) {
      const fullPath = path.join(currentDir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory() && fullPath !== excludeDir) {
        traverse(fullPath);
      } else if (VALID_EXTENSIONS.includes(path.extname(file).toLowerCase())) {
        codeFiles.push(fullPath);
      }
    }
  }

  traverse(dir);
  return codeFiles;
}

/**
 * Check if an image is referenced in the code files
 * @param {string} imagePath - The image file path
 * @param {string[]} codeFiles - List of code files to scan
 * @returns {boolean} - True if the image is referenced, otherwise false
 */
function isImageReferenced(imagePath, codeFiles) {
  const imageName = path.basename(imagePath);

  for (const codeFile of codeFiles) {
    const content = fs.readFileSync(codeFile, "utf-8");
    if (content.includes(imageName)) {
      return true;
    }
  }

  return false;
}

/**
 * Main function to check for unused images
 */
async function main() {
  try {
    console.log("🔍 Scanning for unused images...");

    // Get all images and code files
    const images = getImageFiles(IMAGES_DIR);
    const codeFiles = getCodeFiles(SRC_DIR, IMAGES_DIR);

    // Find unused images
    const unusedImages = new Set();

    for (const imagePath of images) {
      if (!isImageReferenced(imagePath, codeFiles)) {
        unusedImages.add(imagePath);
      }
    }

    // Report results
    if (unusedImages.size > 0) {
      console.log("\n❌ Unused images found:");
      for (const imagePath of unusedImages) {
        console.log(`📁 ${imagePath}`);
      }
      process.exit(1);
    } else {
      console.log("✅ All images are being used in the codebase.");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
