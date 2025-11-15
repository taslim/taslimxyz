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

  const files = fs
    .readdirSync(postsDir)
    .filter((f) => f.endsWith(".mdx"))
    .filter((f) => {
      // Exclude files in the drafts subdirectory
      const filePath = path.join(postsDir, f);
      const stats = fs.statSync(filePath);
      return stats.isFile();
    });

  return files
    .map((filename) => {
      const filePath = path.join(postsDir, filename);
      const fileContents = fs.readFileSync(filePath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug: filename.replace(".mdx", ""),
        title: data.title as string,
        publishedAt: data.publishedAt as string,
        updatedAt: data.updatedAt as string | undefined,
        summary: data.summary as string,
        tags: (data.tags as string[]) || [],
      };
    })
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    );
}

/**
 * Get a single blog post with its content
 */
export function getPost(slug: string): BlogPostWithContent {
  const filePath = path.join(process.cwd(), "src/content/blog", `${slug}.mdx`);
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
