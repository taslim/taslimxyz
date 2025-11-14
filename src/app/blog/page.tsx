import Link from "next/link";
import { getBlogPosts } from "@/lib/blog";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on product, strategy, marketing, and building with AI.",
};

export default function BlogPage() {
  const posts = getBlogPosts();

  return (
    <div className="page-shell">
      <div className="blog-listing">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="blog-post-link"
          >
            <h3 className="blog-post-title">{post.title}</h3>
          </Link>
        ))}
      </div>
    </div>
  );
}
