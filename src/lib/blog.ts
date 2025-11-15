import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface BlogPost {
  slug: string;
  title: string;
  publishedAt: string;
  updatedAt?: string;
  summary: string;
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

  const items = fs.readdirSync(postsDir).filter((item) => {
    const itemPath = path.join(postsDir, item);
    const stats = fs.statSync(itemPath);
    // Only include directories, exclude 'drafts' directory
    return stats.isDirectory() && item !== "drafts";
  });

  const posts: BlogPost[] = [];

  for (const slug of items) {
    const mdxPath = path.join(postsDir, slug, "index.mdx");

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
      tags: (data.tags as string[]) || [],
    });
  }

  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/**
 * Get a single blog post with its content
 */
export function getPost(slug: string): BlogPostWithContent {
  const filePath = path.join(
    process.cwd(),
    "src/content/blog",
    slug,
    "index.mdx",
  );
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title as string,
    publishedAt: data.publishedAt as string,
    updatedAt: data.updatedAt as string | undefined,
    summary: data.summary as string,
    tags: (data.tags as string[]) || [],
    content,
  };
}
