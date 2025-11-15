#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import enquirer from "enquirer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface DraftFrontmatter {
  title: string;
  publishedAt?: string;
  summary?: string;
  tags?: string[];
}

const draftsDir = path.join(
  __dirname,
  "..",
  "src",
  "content",
  "blog",
  "drafts",
);
const publishedDir = path.join(__dirname, "..", "src", "content", "blog");

// Check if drafts directory exists
if (!fs.existsSync(draftsDir)) {
  console.log("No drafts directory found.");
  process.exit(0);
}

// Read all draft files
const draftFiles = fs
  .readdirSync(draftsDir)
  .filter((file) => file.endsWith(".mdx") && file !== ".gitkeep");

if (draftFiles.length === 0) {
  console.log("No draft files found.");
  process.exit(0);
}

// Parse all drafts and collect metadata
const drafts: Array<{
  filename: string;
  frontmatter: DraftFrontmatter;
  fullPath: string;
}> = [];

for (const filename of draftFiles) {
  const filepath = path.join(draftsDir, filename);
  const fileContents = fs.readFileSync(filepath, "utf-8");
  const { data } = matter(fileContents);

  drafts.push({
    filename,
    frontmatter: data as DraftFrontmatter,
    fullPath: filepath,
  });
}

// Display drafts and let user select which to publish
console.log(`\nFound ${drafts.length} draft(s):\n`);

const choices = drafts.map((draft) => ({
  name: draft.filename,
  message: `${draft.filename} — "${draft.frontmatter.title}"`,
  value: draft.filename,
}));

const { selected } = await enquirer.prompt<{ selected: string[] }>({
  type: "multiselect",
  name: "selected",
  message: "Select drafts to publish (space to select, enter to confirm):",
  choices,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate: (value: any) =>
    (value as string[]).length > 0
      ? true
      : "Select at least one draft to publish",
});

if (selected.length === 0) {
  console.log("\nNo drafts selected.");
  process.exit(0);
}

// Publish selected drafts
console.log(`\nPublishing ${selected.length} draft(s):\n`);

let published = 0;
let errors = 0;

for (const filename of selected) {
  const draft = drafts.find((d) => d.filename === filename);
  if (!draft) continue;

  const { frontmatter, fullPath } = draft;

  // Validate required fields
  if (!frontmatter.title) {
    console.error(`❌ ${filename}: Missing required field "title". Skipping.`);
    errors++;
    continue;
  }

  if (!frontmatter.summary) {
    console.error(
      `❌ ${filename}: Missing required field "summary". Skipping.`,
    );
    errors++;
    continue;
  }

  const targetPath = path.join(publishedDir, filename);

  // Check if file already exists in target
  if (fs.existsSync(targetPath)) {
    console.error(`❌ ${filename}: Already exists in blog/. Skipping.`);
    errors++;
    continue;
  }

  // Track temp file for cleanup on error
  let tempFilePath: string | null = null;

  try {
    // Read file and add publishedAt timestamp
    const fileContents = fs.readFileSync(fullPath, "utf-8");
    const parsed = matter(fileContents);

    const now = new Date().toISOString();

    // Build ordered frontmatter
    const orderedData: Record<string, unknown> = {
      title: parsed.data.title,
    };

    // If draft already has publishedAt, preserve it and add updatedAt
    // Otherwise, this is a first-time publish, so set publishedAt
    if (parsed.data.publishedAt) {
      orderedData.publishedAt = parsed.data.publishedAt;
      orderedData.updatedAt = now;
    } else {
      orderedData.publishedAt = now;
    }

    orderedData.summary = parsed.data.summary;

    if (parsed.data.tags) {
      orderedData.tags = parsed.data.tags;
    }

    // Add any other fields that might exist (except the ones we've already handled)
    for (const [key, value] of Object.entries(parsed.data)) {
      if (
        !["title", "publishedAt", "updatedAt", "summary", "tags"].includes(key)
      ) {
        orderedData[key] = value;
      }
    }

    // Atomically write to target using temp file + rename pattern
    const updatedContent = matter.stringify(parsed.content, orderedData);
    tempFilePath = `${targetPath}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFilePath, updatedContent, "utf-8");

    // Atomic rename - either succeeds completely or fails with no partial state
    fs.renameSync(tempFilePath, targetPath);
    tempFilePath = null; // Successfully renamed, no cleanup needed

    // Only remove draft after successful publish
    fs.unlinkSync(fullPath);

    if (orderedData.updatedAt) {
      console.log(`✅ ${filename} → blog/ (updated)`);
      console.log(
        `   Originally published: ${orderedData.publishedAt as string}`,
      );
      console.log(`   Updated at: ${orderedData.updatedAt as string}`);
    } else {
      console.log(`✅ ${filename} → blog/`);
      console.log(`   Published at: ${orderedData.publishedAt as string}`);
    }
    published++;
  } catch (error) {
    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupError) {
        // Log cleanup failure but don't mask the original error
        console.error(
          `   Warning: Failed to clean up temp file ${tempFilePath}`,
        );
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ ${filename}: Failed to publish - ${errorMessage}`);
    errors++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Published: ${published}`);
if (errors > 0) {
  console.log(`   Errors: ${errors}`);
}
console.log(`\n💡 Run 'pnpm dev' to see published posts.\n`);
