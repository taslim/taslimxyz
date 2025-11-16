import { getBlogFeedItems } from "@/lib/blog";
import { siteMetadata } from "@/lib/site-metadata";

const CONTENT_TYPE = "application/rss+xml; charset=utf-8";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(): Promise<Response> {
  const feedItems = getBlogFeedItems(siteMetadata.siteUrl);
  const lastBuildDate = determineLastBuildDate(feedItems);

  const itemsXml = feedItems.map(renderItem).join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeForXml(siteMetadata.title)}</title>
    <link>${escapeForXml(siteMetadata.siteUrl)}</link>
    <description>${escapeForXml(siteMetadata.feedDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeForXml(siteMetadata.siteUrl)}/rss.xml" rel="self" type="application/rss+xml" />
    ${itemsXml}
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

function renderItem(item: ReturnType<typeof getBlogFeedItems>[number]): string {
  const publishedDate = formatRfc822(item.publishedAt);
  const escapedUrl = escapeForXml(item.url);

  const categories = (item.tags ?? [])
    .map((tag) => `<category>${escapeForXml(tag)}</category>`)
    .join("");

  const description = wrapInCdata(item.summary);

  return `<item>
      <title>${escapeForXml(item.title)}</title>
      <link>${escapedUrl}</link>
      <guid isPermaLink="true">${escapedUrl}</guid>
      <pubDate>${publishedDate}</pubDate>
      ${categories}
      <description>${description}</description>
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
