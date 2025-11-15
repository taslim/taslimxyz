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

/**
 * Get all blog posts with metadata
 * Returns posts sorted by date (newest first)
 */
export function getBlogPosts(): BlogPost[] {
  const postsDir = path.join(process.cwd(), "src/content/blog");

  // Check if directory exists
  if (!fs.existsSync(postsDir)) {
    return [];
  }

  const posts: BlogPost[] = [];

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
      const { data } = matter(fileContents);

      posts.push({
        slug,
        title: data.title as string,
        publishedAt: data.publishedAt as string,
        updatedAt: data.updatedAt as string | undefined,
        summary: data.summary as string,
        image: data.image as string | undefined,
        tags: (data.tags as string[]) || [],
      });
    }
  }

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
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

      return {
        slug,
        title: data.title as string,
        publishedAt: data.publishedAt as string,
        updatedAt: data.updatedAt as string | undefined,
        summary: data.summary as string,
        image: data.image as string | undefined,
        tags: (data.tags as string[]) || [],
        content,
      };
    }
  }

  return null;
}
