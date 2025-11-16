import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  summary: string;
  image?: string;
  tags?: string[];
}

export interface BlogPostWithContent extends BlogPost {
  content: string;
}

export interface BlogFeedItem extends BlogPost {
  url: string;
  content: string;
}

/**
 * Validates required blog post front-matter fields
 * Returns the validated data or null if validation fails
 */
function validateBlogPostData(
  slug: string,
  data: matter.GrayMatterFile<string>["data"],
): { title: string; publishedAt: string; summary: string } | null {
  // Validate required fields
  if (!data.title || typeof data.title !== "string") {
    console.error(`[Blog] Missing or invalid 'title' for slug: ${slug}`);
    return null;
  }
  if (!data.publishedAt || typeof data.publishedAt !== "string") {
    console.error(`[Blog] Missing or invalid 'publishedAt' for slug: ${slug}`);
    return null;
  }
  if (!data.summary || typeof data.summary !== "string") {
    console.error(`[Blog] Missing or invalid 'summary' for slug: ${slug}`);
    return null;
  }

  return {
    title: data.title,
    publishedAt: data.publishedAt,
    summary: data.summary,
  };
}

/**
 * Generic helper to process all blog posts with a custom mapper function
 * Handles directory traversal, file reading, and sorting
 */
function processBlogPosts<T extends { publishedAt: string }>(
  mapper: (slug: string, parsed: matter.GrayMatterFile<string>) => T | null,
): T[] {
  const postsDir = path.join(process.cwd(), "src/content/blog");

  // Check if directory exists
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  const posts: (T | null)[] = [];

  // Read year directories (e.g., 2024, 2025)
  const yearDirs = fs.readdirSync(postsDir).filter((item) => {
    const itemPath = path.join(postsDir, item);
    const stats = fs.statSync(itemPath);
    // Only include directories that look like years (4 digits)
    return stats.isDirectory() && /^\d{4}$/.test(item);
  });

  // Read posts from each year directory
  for (const year of yearDirs) {
    const yearPath = path.join(postsDir, year);
    const slugs = fs.readdirSync(yearPath).filter((item) => {
      const itemPath = path.join(yearPath, item);
      const stats = fs.statSync(itemPath);
      return stats.isDirectory();
    });

    for (const slug of slugs) {
      const mdxPath = path.join(yearPath, slug, "index.mdx");

      // Skip if index.mdx doesn't exist
      if (!fs.existsSync(mdxPath)) {
        continue;
      }

      const fileContents = fs.readFileSync(mdxPath, "utf8");
      const parsed = matter(fileContents);

      posts.push(mapper(slug, parsed));
    }
  }

  // Filter out null entries and sort by date
  const validPosts = posts.filter((post): post is T => post !== null);

  return validPosts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/**
 * Get all blog posts with metadata
 * Returns posts sorted by date (newest first)
 */
export function getBlogPosts(): BlogPost[] {
  return processBlogPosts((slug, { data }) => {
    const validated = validateBlogPostData(slug, data);
    if (!validated) return null;

    return {
      slug,
      ...validated,
      updatedAt: data.updatedAt as string | undefined,
      image: data.image as string | undefined,
      tags: Array.isArray(data.tags) ? data.tags : [],
    };
  });
}

/**
 * Get blog posts formatted for feed generation with absolute URLs and content
 */
export function getBlogFeedItems(baseUrl: string): BlogFeedItem[] {
  return processBlogPosts((slug, { data, content }) => {
    const validated = validateBlogPostData(slug, data);
    if (!validated) return null;

    const url = new URL(`/blog/${slug}`, baseUrl);

    return {
      slug,
      ...validated,
      updatedAt: data.updatedAt as string | undefined,
      image: data.image as string | undefined,
      tags: Array.isArray(data.tags) ? data.tags : [],
      url: url.href,
      content,
    };
  });
}

/**
 * Get a single blog post with its content
 * Returns null if the post is not found
 */
export function getPost(slug: string): BlogPostWithContent | null {
  const postsDir = path.join(process.cwd(), "src/content/blog");

  // Check if blog directory exists
  if (!fs.existsSync(postsDir)) {
    return null;
  }

  // Search for the post across all year directories
  const yearDirs = fs.readdirSync(postsDir).filter((item) => {
    const itemPath = path.join(postsDir, item);
    const stats = fs.statSync(itemPath);
    return stats.isDirectory() && /^\d{4}$/.test(item);
  });

  for (const year of yearDirs) {
    const filePath = path.join(postsDir, year, slug, "index.mdx");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data, content } = matter(fileContents);

      const validated = validateBlogPostData(slug, data);
      if (!validated) return null;

      return {
        slug,
        ...validated,
        updatedAt: data.updatedAt as string | undefined,
        image: data.image as string | undefined,
        tags: Array.isArray(data.tags) ? data.tags : [],
        content,
      };
    }
  }

  return null;
}
