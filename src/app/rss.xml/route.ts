import { getBlogFeedItems } from "@/lib/blog";
import { siteMetadata } from "@/lib/site-metadata";
import { marked } from "marked";

const CONTENT_TYPE = "application/rss+xml; charset=utf-8";

export const dynamic = "force-static";
export const revalidate = false;

/**
 * Allowlist of safe attribute names to prevent ReDoS attacks
 * Only these attributes are allowed when extracting values from MDX components
 */
const ALLOWED_ATTRIBUTES = new Set([
  "src",
  "alt",
  "caption",
  "id",
  "url",
  "type",
  "content",
] as const);

/**
 * Precompiled regex patterns for each allowed attribute
 * Each attribute maps to two patterns: one for quoted values, one for unquoted
 */
const ATTRIBUTE_PATTERNS = new Map<string, RegExp[]>(
  Array.from(ALLOWED_ATTRIBUTES).map((attr) => [
    attr,
    [
      // Match attribute with double quotes, single quotes
      // Handles multiline and basic escaped quotes
      new RegExp(`${attr}=["']([^"']*(?:\\\\.)*[^"']*)["']`, "s"),
      // Match unquoted attribute values
      new RegExp(`${attr}=([^\\s/>]+)`, "s"),
    ],
  ]),
);

/**
 * Extract attribute value from a component tag, handling various quote styles
 */
function extractAttribute(tag: string, attrName: string): string | undefined {
  // Look up precompiled patterns for this attribute
  const patterns = ATTRIBUTE_PATTERNS.get(attrName);

  if (!patterns) {
    throw new Error(
      `Unsafe attribute name "${attrName}". Only ${Array.from(ALLOWED_ATTRIBUTES).join(", ")} are allowed.`,
    );
  }

  for (const pattern of patterns) {
    const match = tag.match(pattern);
    if (match?.[1]) {
      // Unescape basic escaped quotes
      return match[1].replace(/\\(['"\\])/g, "$1");
    }
  }

  return undefined;
}

/**
 * Compile MDX content to static HTML for RSS feeds
 */
async function compilePostToHtml(
  mdxContent: string,
  slug: string,
): Promise<string> {
  try {
    // Helper to resolve image paths to absolute URLs
    const resolveImagePath = (src: string): string => {
      const trimmed = src.trim();
      const isAbsoluteUrl = /^https?:\/\//.test(trimmed);
      const isRootRelative = trimmed.startsWith("/");

      if (isAbsoluteUrl) {
        return trimmed;
      }

      if (isRootRelative) {
        return `${siteMetadata.siteUrl}${trimmed}`;
      }

      // Relative path - resolve to blog post folder
      return `${siteMetadata.siteUrl}/images/blog/${slug}/${trimmed}`;
    };

    // Convert custom MDX components to standard markdown before processing
    let processedContent = mdxContent;

    // Convert <Figure> to standard markdown image
    // Order-agnostic, multiline-aware
    processedContent = processedContent.replace(
      /<Figure\s+([^>]*?)\s*\/?>/gs,
      (match) => {
        try {
          const src = extractAttribute(match, "src");
          const alt = extractAttribute(match, "alt");
          const caption = extractAttribute(match, "caption");

          if (!src || !alt) {
            console.warn(`Invalid Figure component: ${match}`);
            return match; // Fallback: keep original if attributes missing
          }

          const absoluteSrc = resolveImagePath(src);
          if (caption) {
            return `![${alt}](${absoluteSrc})\n\n*${caption}*\n`;
          }
          return `![${alt}](${absoluteSrc})`;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error(`Error processing Figure component: ${errorMsg}`);
          return match; // Fallback: keep original on error
        }
      },
    );

    // Convert <Tweet> to a simple link
    // Order-agnostic, multiline-aware
    processedContent = processedContent.replace(
      /<Tweet\s+([^>]*?)\s*\/?>/gs,
      (match) => {
        try {
          const id = extractAttribute(match, "id");
          const url = extractAttribute(match, "url");

          // Validate that either id or url is present
          if (!id && !url) {
            console.warn(
              `Invalid Tweet component: missing both id and url - ${match}`,
            );
            return `\n\n📱 **Tweet:** *(Tweet unavailable - missing identifier)*\n\n`;
          }

          const tweetUrl = url ?? `https://twitter.com/i/status/${id}`;
          return `\n\n📱 **Tweet:** [View on X/Twitter](${tweetUrl})\n\n`;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error(`Error processing Tweet component: ${errorMsg}`);
          return `\n\n📱 **Tweet:** *(Tweet unavailable)*\n\n`;
        }
      },
    );

    // Convert <Callout> to blockquote
    // Multiline-aware, handles nested content
    processedContent = processedContent.replace(
      /<Callout\s+([^>]*?)>([\s\S]*?)<\/Callout>/gs,
      (match: string, attributes: string, content: string) => {
        try {
          const type = extractAttribute(attributes, "type");
          const emoji =
            type === "warning"
              ? "⚠️"
              : type === "error"
                ? "❌"
                : type === "success"
                  ? "✅"
                  : "ℹ️";
          return `\n\n> ${emoji} ${(content ?? "").trim()}\n\n`;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error(`Error processing Callout component: ${errorMsg}`);
          return match; // Fallback: keep original on error
        }
      },
    );

    // Convert <Credits> to italicized text
    // Multiline-aware, handles both content prop and children
    processedContent = processedContent.replace(
      /<Credits\s+([^>]*?)>([\s\S]*?)<\/Credits>/gs,
      (match: string, attributes: string, children: string) => {
        try {
          const content = extractAttribute(attributes, "content");
          const text = content ?? (children ?? "").trim();
          return `\n\n*${text}*\n\n`;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error(`Error processing Credits component: ${errorMsg}`);
          return match; // Fallback: keep original on error
        }
      },
    );

    // Convert <Comment> to bold text
    // Multiline-aware, handles both content prop and children
    processedContent = processedContent.replace(
      /<Comment\s+([^>]*?)>([\s\S]*?)<\/Comment>/gs,
      (match: string, attributes: string, children: string) => {
        try {
          const content = extractAttribute(attributes, "content");
          const text = content ?? (children ?? "").trim();
          return `\n\n**${text}**\n\n`;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.error(`Error processing Comment component: ${errorMsg}`);
          return match; // Fallback: keep original on error
        }
      },
    );

    // Convert markdown to HTML
    const html = await marked.parse(processedContent, {
      gfm: true,
      breaks: false,
    });

    return html;
  } catch (error) {
    // Log error with context for debugging
    const errorMsg = error instanceof Error ? error.message : String(error);
    const contentSnippet = mdxContent.slice(0, 200).replace(/\n/g, " ");
    console.error(
      `Failed to compile post to HTML for slug "${slug}": ${errorMsg}`,
      `\nContent preview: ${contentSnippet}...`,
    );

    // Return a safe fallback to prevent breaking the entire feed
    return `<p><em>Content temporarily unavailable due to processing error.</em></p>`;
  }
}

export async function GET(): Promise<Response> {
  const feedItems = getBlogFeedItems(siteMetadata.siteUrl);
  const lastBuildDate = determineLastBuildDate(feedItems);

  // Render items with full content
  const itemsXml = await Promise.all(feedItems.map(renderItem));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeForXml(siteMetadata.title)}</title>
    <link>${escapeForXml(siteMetadata.siteUrl)}</link>
    <description>${escapeForXml(siteMetadata.feedDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeForXml(siteMetadata.siteUrl)}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml.join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": CONTENT_TYPE,
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}

async function renderItem(
  item: ReturnType<typeof getBlogFeedItems>[number],
): Promise<string> {
  const publishedDate = formatRfc822(item.publishedAt);
  const escapedUrl = escapeForXml(item.url);

  const categories = (item.tags ?? [])
    .map((tag) => `<category>${escapeForXml(tag)}</category>`)
    .join("");

  const description = wrapInCdata(item.summary);

  // Compile MDX to HTML for full content
  const htmlContent = await compilePostToHtml(item.content, item.slug);
  const fullContent = wrapInCdata(htmlContent);

  return `<item>
      <title>${escapeForXml(item.title)}</title>
      <link>${escapedUrl}</link>
      <guid isPermaLink="true">${escapedUrl}</guid>
      <pubDate>${publishedDate}</pubDate>
      ${categories}
      <description>${description}</description>
      <content:encoded>${fullContent}</content:encoded>
    </item>`;
}

function determineLastBuildDate(
  items: ReturnType<typeof getBlogFeedItems>,
): string {
  if (items.length === 0) {
    return new Date().toUTCString();
  }

  const latest = items[0];
  if (!latest) {
    return new Date().toUTCString();
  }

  const lastUpdated = latest.updatedAt ?? latest.publishedAt;
  return formatRfc822(lastUpdated);
}

function formatRfc822(dateString: string): string {
  const timestamp = Date.parse(dateString);
  if (Number.isNaN(timestamp)) {
    return new Date().toUTCString();
  }

  return new Date(timestamp).toUTCString();
}

function escapeForXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapInCdata(value: string): string {
  const safeValue = value.replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safeValue}]]>`;
}
