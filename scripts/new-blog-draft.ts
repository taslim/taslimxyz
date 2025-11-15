#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import enquirer from "enquirer";

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
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-");

const filename = `${slug}.mdx`;

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

const draftPath = path.join(draftsDir, filename);
const publishedPath = path.join(publishedDir, filename);

if (fs.existsSync(draftPath)) {
  console.error(`Error: Draft already exists: ${draftPath}`);
  process.exit(1);
}

if (fs.existsSync(publishedPath)) {
  console.error(`Error: Published post already exists: ${publishedPath}`);
  process.exit(1);
}

// Ensure drafts directory exists
if (!fs.existsSync(draftsDir)) {
  fs.mkdirSync(draftsDir, { recursive: true });
}

// Parse tags
const tagsArray = tags
  .split(",")
  .map((tag) => tag.trim())
  .filter((tag) => tag.length > 0);

// Build frontmatter
const frontmatterLines = [`---`, `title: "${title}"`];

if (summary.trim()) {
  frontmatterLines.push(`summary: "${summary}"`);
}

if (tagsArray.length > 0) {
  frontmatterLines.push(
    `tags: [${tagsArray.map((tag) => `"${tag}"`).join(", ")}]`,
  );
} else {
  frontmatterLines.push(`tags: []`);
}

frontmatterLines.push(`---`, ``, ``);

const frontmatter = frontmatterLines.join("\n");

// Write the draft file
fs.writeFileSync(draftPath, frontmatter, "utf8");

console.log(`\n✅ Created draft: ${draftPath}`);
console.log(`\nNext steps:`);
console.log(`1. Edit the file and add your blog content`);
console.log(`2. Run 'pnpm publish:drafts' when ready to publish`);
console.log(`3. Select the draft from the interactive list\n`);
