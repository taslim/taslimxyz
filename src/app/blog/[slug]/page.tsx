import { compileMDX } from "next-mdx-remote/rsc";
import { getBlogPosts, getPost } from "@/lib/blog";
import { format } from "date-fns";
import {
  Figure,
  type FigureProps,
  Callout,
  Tweet,
  Credits,
  Link,
  Comment,
} from "@/components/mdx";
import { remarkMdxFigurePriority } from "@/lib/remark-mdx-figure-priority";
import rehypePrettyCode from "rehype-pretty-code";
import { type Metadata } from "next";
import { type Element } from "hast";
import { notFound } from "next/navigation";

// Generate static params for all blog posts
export async function generateStaticParams() {
  const posts = getBlogPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

// Resolve image path for blog post
function resolveImagePath(src: string, slug: string): string {
  const trimmed = src.trim();
  const isRootRelative = trimmed.startsWith("/");

  // If it's already root-relative, use it as-is
  if (isRootRelative) {
    return trimmed;
  }

  // Otherwise, resolve relative path to blog post folder
  return `/images/blog/${slug}/${trimmed}`;
}

// Extract first image from MDX content
function extractFirstImage(content: string, slug: string): string | null {
  // Match <Figure src="..." or <Figure\n  src="..."
  const figureRegex = /<Figure[^>]*\ssrc=["']([^"']+)["']/i;
  const match = figureRegex.exec(content);

  if (!match?.[1]) {
    return null;
  }

  return resolveImagePath(match[1], slug);
}

// Generate metadata for each blog post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  // Determine OG image with priority:
  // 1. Frontmatter image (manual override)
  // 2. First Figure in content (auto-detected)
  // 3. Default blog OG image (fallback)
  const ogImage = post.image
    ? resolveImagePath(post.image, slug)
    : (extractFirstImage(post.content, slug) ?? "/og-blog.png");

  return {
    title: `${post.title}`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Taslim Okunola"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);

  if (!post) {
    notFound();
  }

  const FigureWithBasePath = (props: FigureProps) => {
    const { src } = props;

    if (typeof src !== "string") {
      return <Figure {...props} />;
    }

    const trimmed = src.trim();
    const isAbsoluteUrl = /^https?:\/\//.test(trimmed);
    const isRootRelative = trimmed.startsWith("/");

    if (isAbsoluteUrl || isRootRelative) {
      return <Figure {...props} src={src} />;
    }

    const basePath = `/images/blog/${slug}`;
    const normalizedBase = basePath.endsWith("/")
      ? basePath.slice(0, -1)
      : basePath;
    const resolvedSrc = `${normalizedBase}/${trimmed}`;

    return <Figure {...props} src={resolvedSrc} />;
  };

  // Compile MDX content with syntax highlighting
  const { content } = await compileMDX({
    source: post.content,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [remarkMdxFigurePriority],
        rehypePlugins: [
          [
            rehypePrettyCode,
            {
              theme: {
                light: "github-light-high-contrast",
                dark: "github-dark-default",
              },
              keepBackground: false,
              defaultLang: "plaintext",
              onVisitLine(node: Element) {
                if (node.children.length === 0) {
                  node.children = [{ type: "text", value: " " }];
                }
              },
            },
          ],
        ],
      },
    },
    components: {
      Figure: FigureWithBasePath,
      Callout,
      Tweet,
      Credits,
      Comment,
      a: Link,
    },
  });

  // Format the date - parse components to avoid timezone issues
  const [year, month, day] = post.publishedAt.split("-").map(Number) as [
    number,
    number,
    number,
  ];
  const formattedDate = format(new Date(year, month - 1, day), "MMMM d, yyyy");

  return (
    <div className="page-shell">
      <article>
        <header className="blog-post-header">
          <h1 className="page-title">{post.title}</h1>
          <time className="blog-post-meta" dateTime={post.publishedAt}>
            {formattedDate}
          </time>
        </header>
        <div className="blog-content">{content}</div>
      </article>
    </div>
  );
}
