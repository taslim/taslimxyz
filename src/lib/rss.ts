import { Marked, type Token } from "marked";
import sanitizeHtml from "sanitize-html";
import { siteMetadata } from "@/lib/site-metadata";

/**
 * Escape regex metacharacters in a string
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Extract attribute value from a component tag, handling various quote styles
 */
function extractAttribute(tag: string, attrName: string): string | undefined {
  // Validate attrName to prevent ReDoS and regex injection
  // Only allow safe attribute name characters: letters, digits, hyphen, underscore, colon, dot
  const safeAttrNamePattern = /^[a-zA-Z0-9:_.-]+$/;
  if (!safeAttrNamePattern.test(attrName)) {
    throw new Error(
      `Invalid attribute name "${attrName}": must contain only letters, digits, colon, underscore, hyphen, or dot`,
    );
  }

  // Defense-in-depth: escape regex metacharacters before interpolating
  const escapedAttrName = escapeRegex(attrName);

  // Match attribute with double quotes, single quotes, or unquoted values
  // Uses alternation to avoid nested quantifiers and catastrophic backtracking
  const pattern = new RegExp(
    `${escapedAttrName}=(?:"([^"]*)"|'([^']*)'|([^\\s/>]+))`,
    "s",
  );

  const match = tag.match(pattern);
  if (match) {
    // Return the first non-undefined capture group
    const value = match[1] ?? match[2] ?? match[3];
    if (value !== undefined) {
      // Only unescape quotes if the value was quoted (groups 1 or 2)
      if (match[1] !== undefined || match[2] !== undefined) {
        return value.replace(/\\(['"\\])/g, "$1");
      }
      return value;
    }
  }

  return undefined;
}

/**
 * Resolve URLs to absolute paths.
 * - Absolute URLs (http/https) are left alone.
 * - Root-relative URLs (/) are prepended with siteUrl.
 * - Relative paths are resolved against the blog post's slug folder (for images) or simple relative (for links).
 */
function resolveUrl(url: string, slug: string, isImage = false): string {
  if (!url) return url;
  const trimmed = url.trim();
  if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("mailto:")) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${siteMetadata.siteUrl}${trimmed}`;
  }

  // For images that are relative, we assume they are in the blog assets folder
  if (isImage) {
    return `${siteMetadata.siteUrl}/images/blog/${slug}/${trimmed}`;
  }

  // For links that are relative, we assume they are relative to the blog post URL
  return `${siteMetadata.siteUrl}/blog/${slug}/${trimmed}`;
}

/**
 * Pre-process MDX content to replace custom components with Markdown/HTML
 */
function preProcessMdx(content: string, slug: string): string {
  let processed = content;

  // Resolve custom component URLs helper
  const resolveImg = (src: string) => resolveUrl(src, slug, true);

  // Convert <Figure> to standard markdown image or HTML figure
  processed = processed.replace(/<Figure\s+([^>]*?)\s*\/?>/gs, (match) => {
    try {
      const src = extractAttribute(match, "src");
      const alt = extractAttribute(match, "alt");
      const caption = extractAttribute(match, "caption");

      if (!src || !alt) {
        return match;
      }

      const absoluteSrc = resolveImg(src);
      if (caption) {
        // Use HTML for caption to ensure it stays together
        return `<figure><img src="${absoluteSrc}" alt="${alt}" /><figcaption>${caption}</figcaption></figure>`;
      }
      return `![${alt}](${absoluteSrc})`;
    } catch (e) {
      console.warn(`Failed to process Figure in ${slug}`, e);
      return match;
    }
  });

  // Convert <Tweet> to link
  processed = processed.replace(/<Tweet\s+([^>]*?)\s*\/?>/gs, (match) => {
    const id = extractAttribute(match, "id");
    const url = extractAttribute(match, "url");
    if (!id && !url) return match;
    const tweetUrl = url ?? `https://twitter.com/i/status/${id}`;
    return `\n\n> 📱 **Tweet:** [View on X/Twitter](${tweetUrl})\n\n`;
  });

  // Convert <Callout> to blockquote
  processed = processed.replace(
    /<Callout\s+([^>]*?)>([\s\S]*?)<\/Callout>/gs,
    (_match: string, attributes: string, content: string) => {
      const type = extractAttribute(attributes, "type");
      const emoji =
        type === "warning"
          ? "⚠️"
          : type === "error"
            ? "❌"
            : type === "success"
              ? "✅"
              : "ℹ️";
      const safeContent = typeof content === "string" ? content.trim() : "";
      return `\n\n> ${emoji} ${safeContent}\n\n`;
    },
  );

  // Convert <Credits> to italic
  processed = processed.replace(
    /<Credits(?:\s+([^>]*?))?>([\s\S]*?)<\/Credits>/gs,
    (_match: string, attributes: string | undefined, children: string) => {
      const attrs = attributes ?? "";
      const content = attrs ? extractAttribute(attrs, "content") : undefined;
      const childrenText = typeof children === "string" ? children.trim() : "";
      const text = content ?? childrenText;
      return `\n\n*${text}*\n\n`;
    },
  );

  // Convert <Comment> to bold
  processed = processed.replace(
    /<Comment(?:\s+([^>]*?))?>([\s\S]*?)<\/Comment>/gs,
    (_match: string, attributes: string | undefined, children: string) => {
      const attrs = attributes ?? "";
      const content = attrs ? extractAttribute(attrs, "content") : undefined;
      const childrenText = typeof children === "string" ? children.trim() : "";
      const text = content ?? childrenText;
      return `\n\n**${text}**\n\n`;
    },
  );

  return processed;
}

/**
 * Compile MDX content to static HTML for RSS feeds
 */
export async function compileMdxToRssHtml(
  mdxContent: string,
  slug: string,
): Promise<string> {
  try {
    // 1. Pre-process custom components into Markdown
    const processedContent = preProcessMdx(mdxContent, slug);

    // 2. Create a fresh marked instance (no global state mutation)
    const localMarked = new Marked({
      gfm: true,
      breaks: false,
    });

    // 3. Configure this instance only with walkTokens to resolve URLs
    // This handles standard markdown images ![]() and links []()
    localMarked.use({
      walkTokens(token: Token) {
        if (
          token.type === "image" &&
          "href" in token &&
          typeof token.href === "string"
        ) {
          token.href = resolveUrl(token.href, slug, true);
        }
        if (
          token.type === "link" &&
          "href" in token &&
          typeof token.href === "string"
        ) {
          token.href = resolveUrl(token.href, slug, false);
        }
      },
    });

    // 4. Parse Markdown to HTML using the local instance
    const html = await localMarked.parse(processedContent);

    // 5. Sanitize HTML
    return sanitizeHtml(html, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat([
        "img",
        "figure",
        "figcaption",
      ]),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ["src", "alt", "title", "width", "height"],
        a: ["href", "name", "title"],
      },
    });
  } catch (error) {
    console.error(`RSS compilation error for ${slug}:`, error);
    return `<p>Content unavailable.</p>`;
  }
}

export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function wrapCdata(value: string): string {
  const safeValue = value.replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safeValue}]]>`;
}
