#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import enquirer from "enquirer";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Interactive prompts
const answers = await enquirer.prompt<{
  title: string;
}>([
  {
    type: "input",
    name: "title",
    message: "Post title:",
    validate: (input: string) => (input.trim() ? true : "Title is required"),
  },
]);

const { title } = answers;

// Generate slug from title (kebab-case)
let slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-")
  .trim();

// Validate slug is not empty
if (!slug) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  slug = `untitled-${timestamp}`;
  console.warn(
    `⚠️  Title contains no alphanumeric characters. Using fallback slug: ${slug}`,
  );
}

// Check for duplicates in both drafts and published posts
const draftsDir = path.join(__dirname, "..", "src", "content", "drafts");
const publishedDir = path.join(__dirname, "..", "src", "content", "blog");

const draftDirPath = path.join(draftsDir, slug);

if (fs.existsSync(draftDirPath)) {
  console.error(`Error: Draft already exists: ${draftDirPath}`);
  process.exit(1);
}

// Check for duplicates across all year directories in published posts
if (fs.existsSync(publishedDir)) {
  const yearDirs = fs.readdirSync(publishedDir).filter((item) => {
    const itemPath = path.join(publishedDir, item);
    const stats = fs.statSync(itemPath);
    return stats.isDirectory() && /^\d{4}$/.test(item);
  });

  for (const year of yearDirs) {
    const publishedDirPath = path.join(publishedDir, year, slug);
    if (fs.existsSync(publishedDirPath)) {
      console.error(
        `Error: Published post already exists: ${publishedDirPath}`,
      );
      process.exit(1);
    }
  }
}

// Ensure drafts directory exists
if (!fs.existsSync(draftsDir)) {
  fs.mkdirSync(draftsDir, { recursive: true });
}

// Create the draft post directory
fs.mkdirSync(draftDirPath, { recursive: true });

// Build frontmatter object
const frontmatterData: {
  title: string;
  summary: string;
  image: string;
  tags: string[];
} = {
  title,
  summary: "",
  image: "",
  tags: [],
};

// Safely generate frontmatter with gray-matter
const content = matter.stringify("", frontmatterData);

// Write the draft file (index.mdx inside the directory)
const draftFilePath = path.join(draftDirPath, "index.mdx");
fs.writeFileSync(draftFilePath, content, "utf8");

console.log(`\n✅ Created draft: ${draftFilePath}`);
console.log(`\nNext steps:`);
console.log(`1. Edit the file and add your blog content`);
console.log(`2. Add images to the same directory if needed`);
console.log(`3. Run 'pnpm publish:drafts' when ready to publish`);
console.log(`4. Select the draft from the interactive list\n`);
