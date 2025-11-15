#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const projectRoot = path.join(__dirname, "..");
const contentRoot = path.join(projectRoot, "src", "content", "blog");
const publicRoot = path.join(projectRoot, "public", "images", "blog");

const IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".avif",
  ".svg",
]);

if (!fs.existsSync(contentRoot)) {
  console.log("No blog content directory found.");
  process.exit(0);
}

// Ensure base public/images/blog directory exists
if (!fs.existsSync(publicRoot)) {
  fs.mkdirSync(publicRoot, { recursive: true });
}

const entries = fs.readdirSync(contentRoot);

for (const entry of entries) {
  const entryPath = path.join(contentRoot, entry);
  const stats = fs.statSync(entryPath);

  // Only mirror post directories (exclude drafts and non-directories)
  if (!stats.isDirectory() || entry === "drafts") {
    continue;
  }

  const slug = entry;
  const postDir = entryPath;
  const publicDir = path.join(publicRoot, slug);

  // Remove any existing files for this slug in public to keep in sync
  if (fs.existsSync(publicDir)) {
    fs.rmSync(publicDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicDir, { recursive: true });

  const files = fs.readdirSync(postDir);

  for (const file of files) {
    const srcPath = path.join(postDir, file);
    const fileStats = fs.statSync(srcPath);

    if (!fileStats.isFile()) {
      continue;
    }

    const ext = path.extname(file).toLowerCase();

    if (!IMAGE_EXTENSIONS.has(ext)) {
      continue;
    }

    const destPath = path.join(publicDir, file);
    fs.copyFileSync(srcPath, destPath);
  }

  console.log(`Synced images for blog post: ${slug}`);
}

console.log("\n✅ Blog images synchronized to public/images/blog/");
