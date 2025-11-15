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

const draftsDir = path.join(__dirname, "..", "src", "content", "drafts");
const publishedDir = path.join(__dirname, "..", "src", "content", "blog");

// Check if drafts directory exists
if (!fs.existsSync(draftsDir)) {
  console.log("No drafts directory found.");
  process.exit(0);
}

// Read all draft directories (exclude files like README.md and sample-post.example)
const draftDirs = fs.readdirSync(draftsDir).filter((item) => {
  const itemPath = path.join(draftsDir, item);
  const stats = fs.statSync(itemPath);
  return stats.isDirectory();
});

if (draftDirs.length === 0) {
  console.log("No draft directories found.");
  process.exit(0);
}

// Parse all drafts and collect metadata
const drafts: Array<{
  slug: string;
  frontmatter: DraftFrontmatter;
  dirPath: string;
  mdxPath: string;
}> = [];

for (const slug of draftDirs) {
  const dirPath = path.join(draftsDir, slug);
  const mdxPath = path.join(dirPath, "index.mdx");

  // Check if index.mdx exists
  if (!fs.existsSync(mdxPath)) {
    console.warn(`⚠️  Skipping ${slug}: missing index.mdx`);
    continue;
  }

  const fileContents = fs.readFileSync(mdxPath, "utf-8");
  const { data } = matter(fileContents);

  drafts.push({
    slug,
    frontmatter: data as DraftFrontmatter,
    dirPath,
    mdxPath,
  });
}

// Display drafts and let user select which to publish
console.log(`\nFound ${drafts.length} draft(s):\n`);

const choices = drafts.map((draft) => ({
  name: draft.slug,
  message: `${draft.slug} — "${draft.frontmatter.title}"`,
  value: draft.slug,
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

for (const slug of selected) {
  const draft = drafts.find((d) => d.slug === slug);
  if (!draft) continue;

  const { frontmatter, dirPath, mdxPath } = draft;

  // Validate required fields
  if (!frontmatter.title) {
    console.error(`❌ ${slug}: Missing required field "title". Skipping.`);
    errors++;
    continue;
  }

  if (!frontmatter.summary) {
    console.error(`❌ ${slug}: Missing required field "summary". Skipping.`);
    errors++;
    continue;
  }

  // Determine the year from publishedAt or use current year
  const publishYear = frontmatter.publishedAt
    ? new Date(frontmatter.publishedAt).getFullYear().toString()
    : new Date().getFullYear().toString();

  const yearDir = path.join(publishedDir, publishYear);

  // Ensure year directory exists
  if (!fs.existsSync(yearDir)) {
    fs.mkdirSync(yearDir, { recursive: true });
  }

  const targetDirPath = path.join(yearDir, slug);

  // Check if directory already exists in target
  if (fs.existsSync(targetDirPath)) {
    console.error(`❌ ${slug}: Already exists in blog/. Skipping.`);
    errors++;
    continue;
  }

  // Track temp directory for cleanup on error
  let tempDirPath: string | null = null;

  try {
    // Read MDX file and add publishedAt timestamp
    const fileContents = fs.readFileSync(mdxPath, "utf-8");
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

    // Create a temp directory and copy all files
    tempDirPath = `${targetDirPath}.tmp.${Date.now()}`;
    fs.mkdirSync(tempDirPath, { recursive: true });

    // Copy all files from draft directory to temp directory
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
      const srcPath = path.join(dirPath, file);
      const destPath = path.join(tempDirPath, file);

      // For index.mdx, write the updated content with new frontmatter
      if (file === "index.mdx") {
        const updatedContent = matter.stringify(parsed.content, orderedData);
        fs.writeFileSync(destPath, updatedContent, "utf-8");
      } else {
        // Copy other files (images, etc.) as-is
        fs.copyFileSync(srcPath, destPath);
      }
    }

    // Atomic rename - either succeeds completely or fails with no partial state
    fs.renameSync(tempDirPath, targetDirPath);
    tempDirPath = null; // Successfully renamed, no cleanup needed

    // Only remove draft directory after successful publish
    fs.rmSync(dirPath, { recursive: true, force: true });

    if (orderedData.updatedAt) {
      console.log(`✅ ${slug} → blog/ (updated)`);
      console.log(
        `   Originally published: ${orderedData.publishedAt as string}`,
      );
      console.log(`   Updated at: ${orderedData.updatedAt as string}`);
    } else {
      console.log(`✅ ${slug} → blog/`);
      console.log(`   Published at: ${orderedData.publishedAt as string}`);
    }
    published++;
  } catch (error) {
    // Clean up temp directory if it exists
    if (tempDirPath && fs.existsSync(tempDirPath)) {
      try {
        fs.rmSync(tempDirPath, { recursive: true, force: true });
      } catch (cleanupError) {
        // Log cleanup failure but don't mask the original error
        const cleanupMessage =
          cleanupError instanceof Error
            ? cleanupError.message
            : "Unknown error";
        console.error(
          `   Warning: Failed to clean up temp directory ${tempDirPath}: ${cleanupMessage}`,
        );
      }
    }

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ ${slug}: Failed to publish - ${errorMessage}`);
    errors++;
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Published: ${published}`);
if (errors > 0) {
  console.log(`   Errors: ${errors}`);
}
console.log(`\n💡 Run 'pnpm dev' to see published posts.\n`);
