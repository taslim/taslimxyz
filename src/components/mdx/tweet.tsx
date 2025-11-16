"use client";

import { Tweet as ReactTweet } from "react-tweet";
import { useEffect, useRef, useState } from "react";

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
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determine the tweet ID
  let tweetId: string | null = null;

  if (url) {
    // If URL is provided, extract the ID from it
    tweetId = extractTweetId(url);
  } else if (id) {
    // If ID is provided directly, use it
    tweetId = id;
  }

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Use IntersectionObserver to detect when tweet is near viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, stop observing
            observer.disconnect();
          }
        });
      },
      {
        // Load when tweet is 400px away from viewport
        rootMargin: "400px",
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (!tweetId) {
    console.error("Tweet component requires either a valid url or id prop");
    return null;
  }

  return (
    <div ref={containerRef} className="not-prose my-6">
      {isVisible ? (
        <ReactTweet id={tweetId} />
      ) : (
        // Placeholder skeleton while tweet loads
        <div
          className="flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800"
          style={{ minHeight: "200px" }}
        >
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Loading tweet...
          </div>
        </div>
      )}
    </div>
  );
}
