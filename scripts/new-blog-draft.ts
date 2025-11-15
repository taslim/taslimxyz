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
  summary: string;
  tags: string;
}>([
  {
    type: "input",
    name: "title",
    message: "Post title:",
    validate: (input: string) => (input.trim() ? true : "Title is required"),
  },
  {
    type: "input",
    name: "summary",
    message: "Summary (optional):",
    initial: "",
  },
  {
    type: "input",
    name: "tags",
    message: "Tags (comma-separated, optional):",
    initial: "",
  },
]);

const { title, summary, tags } = answers;

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
const draftsDir = path.join(
  __dirname,
  "..",
  "src",
  "content",
  "blog",
  "drafts",
);
const publishedDir = path.join(__dirname, "..", "src", "content", "blog");

const draftDirPath = path.join(draftsDir, slug);
const publishedDirPath = path.join(publishedDir, slug);

if (fs.existsSync(draftDirPath)) {
  console.error(`Error: Draft already exists: ${draftDirPath}`);
  process.exit(1);
}

if (fs.existsSync(publishedDirPath)) {
  console.error(`Error: Published post already exists: ${publishedDirPath}`);
  process.exit(1);
}

// Ensure drafts directory exists
if (!fs.existsSync(draftsDir)) {
  fs.mkdirSync(draftsDir, { recursive: true });
}

// Create the draft post directory
fs.mkdirSync(draftDirPath, { recursive: true });

// Parse tags
const tagsArray = tags
  .split(",")
  .map((tag) => tag.trim())
  .filter((tag) => tag.length > 0);

// Build frontmatter object
const frontmatterData: {
  title: string;
  summary?: string;
  tags: string[];
} = {
  title,
  tags: tagsArray,
};

if (summary.trim()) {
  frontmatterData.summary = summary;
}

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
