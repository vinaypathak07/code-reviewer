// scripts/check-cdn-usage.js
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CDN_BASE_URL = "https://image-cdn.xyz.in";

// Regular expressions for different patterns
const PATTERNS = {
  imgTag: /<img[^>]+src=["']([^"']+)["']/g,
  backgroundUrl: /background(?:-image)?\s*:\s*url\(['"]?([^'")\s]+)['"]?\)/g,
  stringLiterals: /['"`][^'"`]*\.(jpg|jpeg|png|gif|svg|webp)['"`]/gi,
};

// Get changed files in the PR
function getChangedFiles() {
  try {
    // If running in GitHub Actions (PR)
    if (process.env.GITHUB_EVENT_PATH) {
      const eventPath = process.env.GITHUB_EVENT_PATH;
      const eventData = JSON.parse(fs.readFileSync(eventPath, "utf8"));

      // Get the base and head SHAs
      const baseSha = eventData.pull_request.base.sha;
      const headSha = eventData.pull_request.head.sha;

      // Get changed files using git diff
      const diffCommand = `git diff --name-only ${baseSha}...${headSha}`;
      const changedFiles = execSync(diffCommand, { encoding: "utf8" })
        .trim()
        .split("\n")
        .filter((file) => file.startsWith("src/"));

      return changedFiles;
    }

    // If running locally (get staged files)
    const diffCommand = "git diff --cached --name-only";
    return execSync(diffCommand, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter((file) => file.startsWith("src/"));
  } catch (error) {
    console.error("Error getting changed files:", error);
    return [];
  }
}

function checkFileForCDNUsage(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const fileExtension = path.extname(filePath);
  const violations = [];

  // Check for image src attributes in HTML/JSX files
  if ([".html", ".jsx", ".tsx", ".vue"].includes(fileExtension)) {
    let match;
    while ((match = PATTERNS.imgTag.exec(content)) !== null) {
      const src = match[1];
      if (!src.includes(CDN_BASE_URL) && !src.startsWith("data:")) {
        violations.push({
          type: "img-src",
          line: getLineNumber(content, match[0]),
          value: src,
        });
      }
    }
  }

  // Check for background-image URLs in CSS/SCSS files
  if ([".css", ".scss"].includes(fileExtension)) {
    let match;
    while ((match = PATTERNS.backgroundUrl.exec(content)) !== null) {
      const url = match[1];
      if (!url.includes(CDN_BASE_URL) && !url.startsWith("data:")) {
        violations.push({
          type: "background-url",
          line: getLineNumber(content, match[0]),
          value: url,
        });
      }
    }
  }

  // Check for string literals containing image paths in JS/TS files
  if ([".js", ".jsx", ".ts", ".tsx"].includes(fileExtension)) {
    let match;
    while ((match = PATTERNS.stringLiterals.exec(content)) !== null) {
      const url = match[0].slice(1, -1); // Remove quotes
      if (!url.includes(CDN_BASE_URL) && !url.startsWith("data:")) {
        violations.push({
          type: "string-literal",
          line: getLineNumber(content, match[0]),
          value: url,
        });
      }
    }
  }

  return violations;
}

function getLineNumber(content, searchString) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(searchString)) {
      return i + 1;
    }
  }
  return -1;
}

function printResults(results) {
  if (results.length === 0) {
    console.log("✅ No CDN violations found!");
    return true;
  }

  console.log("🔍 Found non-CDN image usage in the following files:\n");

  results.forEach(({ file, violations }) => {
    console.log(`📁 ${file}`);
    violations.forEach((violation) => {
      console.log(`  Line ${violation.line}: ${violation.type}`);
      console.log(`  Value: ${violation.value}\n`);
    });
  });

  const totalViolations = results.reduce(
    (sum, { violations }) => sum + violations.length,
    0,
  );
  console.log(`Total violations found: ${totalViolations}`);
  return false;
}

// Main execution
try {
  const changedFiles = getChangedFiles();
  console.log("Checking files:", changedFiles);

  const results = changedFiles
    .filter((file) => fs.existsSync(file)) // Ensure file exists
    .map((file) => ({
      file,
      violations: checkFileForCDNUsage(file),
    }))
    .filter((result) => result.violations.length > 0);

  const passed = printResults(results);
  process.exit(passed ? 0 : 1);
} catch (error) {
  console.error("Error while checking CDN usage:", error);
  process.exit(1);
}
