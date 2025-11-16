const LOCATION_HEADER = "/rss.xml";

export const dynamic = "force-static";

export function GET(): Response {
  return new Response(null, {
    status: 308,
    headers: {
      Location: LOCATION_HEADER,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
