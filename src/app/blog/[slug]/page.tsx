import { compileMDX } from "next-mdx-remote/rsc";
import { getBlogPosts, getPost } from "@/lib/blog";
import { format } from "date-fns";
import {
  Figure,
  type FigureProps,
  Callout,
  Tweet,
  Credits,
} from "@/components/mdx";
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

  return {
    title: `${post.title}`,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.publishedAt,
      authors: ["Taslim Okunola"],
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
