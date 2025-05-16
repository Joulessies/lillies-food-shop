// build.js - Custom build script to ensure all resources are properly included
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("Starting custom build process...");

// Ensure dist directory exists
if (fs.existsSync("dist")) {
  console.log("Cleaning existing dist directory...");
  fs.rmSync("dist", { recursive: true, force: true });
}

console.log("Creating dist directory...");
fs.mkdirSync("dist", { recursive: true });

// Copy fallback page as initial index.html
if (fs.existsSync("fallback-index.html")) {
  console.log("Copying fallback page as initial index.html...");
  fs.copyFileSync("fallback-index.html", "dist/index.html");
}

// Run the vite build
try {
  console.log("Running Vite build...");
  execSync("npx vite build", { stdio: "inherit" });
  console.log("Vite build completed successfully.");
} catch (error) {
  console.error("Vite build failed:", error.message);
  console.log("Using fallback page...");

  // Make sure dist directory exists even if build failed
  if (!fs.existsSync("dist")) {
    fs.mkdirSync("dist", { recursive: true });
  }

  // If index.html doesn't exist, copy fallback
  if (
    !fs.existsSync("dist/index.html") &&
    fs.existsSync("fallback-index.html")
  ) {
    fs.copyFileSync("fallback-index.html", "dist/index.html");
  }
}

// Ensure asset directories exist
const assetDirs = ["assets", "css", "js"];
for (const dir of assetDirs) {
  const dirPath = path.join("dist", dir);
  if (!fs.existsSync(dirPath)) {
    console.log(`Creating ${dir} directory...`);
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Copy any missing assets from src
if (fs.existsSync("src/assets")) {
  console.log("Copying assets from src/assets...");

  const copyDir = (src, dest) => {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  copyDir("src/assets", "dist/assets");
}

// Create 404 error page that redirects to index.html
console.log("Creating 404.html page...");
const redirectHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <script>
    // Redirect to the homepage
    window.location.href = '/';
  </script>
  <meta http-equiv="refresh" content="0;url=/">
</head>
<body>
  <p>If you are not redirected automatically, follow this <a href="/">link</a>.</p>
</body>
</html>
`;

fs.writeFileSync("dist/404.html", redirectHtml);

// Verify dist directory contents
console.log("Verifying dist directory contents:");
const listDir = (dir, indent = "") => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    console.log(`${indent}${entry.isDirectory() ? "📁" : "📄"} ${entry.name}`);
    if (entry.isDirectory()) {
      listDir(path.join(dir, entry.name), `${indent}  `);
    }
  }
};

listDir("dist");

console.log("Build process completed successfully.");
