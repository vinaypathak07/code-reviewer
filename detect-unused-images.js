/**
 * We want to check all images in the project and see if they are used in the project.
 * // we need to traverse the src folder
 * // we need to get all the images from src/images
 * // we need to check .jsx, .js, .scss, .css files
 */

const fs = require("fs");
const path = require("path");

// Configuration
const SRC_DIR = "src";
const IMAGES_DIR = path.join(SRC_DIR, "images");
const VALID_EXTENSIONS = [".js", ".jsx", ".scss", ".css"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];

// Get all image files from the images directory
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

// Get all code files from src directory
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

// Check if an image is referenced in the code
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

// Main function
function main() {
  try {
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
      console.log("\nUnused images found:");
      for (const imagePath of unusedImages) {
        console.log(imagePath);
      }
      process.exit(1);
    } else {
      console.log("All images are being used in the codebase.");
      process.exit(0);
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
