import { getBlogFeedItems } from "@/lib/blog";
import { siteMetadata } from "@/lib/site-metadata";
import { compileMdxToRssHtml, escapeXml, wrapCdata } from "@/lib/rss";

const CONTENT_TYPE = "text/xml; charset=utf-8";

export const dynamic = "force-static";
export const revalidate = false;

export async function GET(): Promise<Response> {
  const feedItems = getBlogFeedItems(siteMetadata.siteUrl);
  const lastBuildDate = determineLastBuildDate(feedItems);

  // Render items with full content
  const itemsXml = await Promise.all(feedItems.map(renderItem));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteMetadata.title)}</title>
    <link>${escapeXml(siteMetadata.siteUrl)}</link>
    <description>${escapeXml(siteMetadata.feedDescription)}</description>
    <language>en-us</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(siteMetadata.siteUrl)}/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${escapeXml(siteMetadata.siteUrl)}/og-image.jpg</url>
      <title>${escapeXml(siteMetadata.title)}</title>
      <link>${escapeXml(siteMetadata.siteUrl)}</link>
    </image>
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
  const escapedUrl = escapeXml(item.url);

  const categories = (item.tags ?? [])
    .map((tag) => `<category>${escapeXml(tag)}</category>`)
    .join("");

  const description = wrapCdata(item.summary);

  // Compile MDX to HTML for full content
  const htmlContent = await compileMdxToRssHtml(item.content, item.slug);
  const fullContent = wrapCdata(htmlContent);

  return `<item>
      <title>${escapeXml(item.title)}</title>
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
