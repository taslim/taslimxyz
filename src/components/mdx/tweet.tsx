import { Tweet as ReactTweet } from "react-tweet";

interface TweetProps {
  id?: string;
  url?: string;
}

/**
 * Extracts tweet ID from a Twitter/X URL
 */
function extractTweetId(url: string): string | null {
  // Match Twitter/X URLs: https://twitter.com/username/status/123456789
  // or https://x.com/username/status/123456789
  const tweetRegex = /(?:twitter\.com|x\.com)\/[^/]+\/status\/(\d+)/;
  const match = tweetRegex.exec(url);
  return match?.[1] ?? null;
}

export function Tweet({ id, url }: TweetProps) {
  // Determine the tweet ID
  let tweetId: string | null = null;

  if (url) {
    // If URL is provided, extract the ID from it
    tweetId = extractTweetId(url);
  } else if (id) {
    // If ID is provided directly, use it
    tweetId = id;
  }

  if (!tweetId) {
    console.error("Tweet component requires either a valid url or id prop");
    return null;
  }

  return (
    <div className="not-prose my-6">
      <ReactTweet id={tweetId} />
    </div>
  );
}
