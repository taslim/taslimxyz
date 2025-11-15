import { isValidElement, type ReactNode } from "react";

export interface CommentProps {
  children?: ReactNode;
  content?: string;
}

/**
 * Validates that a URL uses a safe protocol to prevent XSS attacks.
 * Only allows http, https, and mailto protocols.
 */
function isSafeLink(url: string): boolean {
  try {
    const parsed = new URL(url, "https://taslim.xyz");
    const allowedProtocols = ["http:", "https:", "mailto:"];

    return allowedProtocols.includes(parsed.protocol);
  } catch {
    // Malformed URL
    return false;
  }
}

/**
 * Checks if a URL is external (starts with http:// or https://).
 * Internal links (relative paths, mailto:, etc.) will return false.
 */
function isExternalLink(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

/**
 * Parses a markdown link [text](url) from a plain string.
 */
function parseMarkdownLink(text: string): { text: string; url: string } | null {
  const linkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/;
  const match = linkRegex.exec(text.trim());

  if (!match) {
    return null;
  }

  const [, linkText, linkUrl] = match;

  if (!linkText || !linkUrl) {
    return null;
  }

  return {
    text: linkText,
    url: linkUrl,
  };
}

/**
 * Safely extracts string content from ReactNode.
 * Returns null if the content cannot be converted to a valid string.
 */
function extractStringContent(node: ReactNode): string | null {
  // Handle direct string
  if (typeof node === "string") {
    return node.trim();
  }

  // Handle number (convert to string)
  if (typeof node === "number") {
    return String(node);
  }

  // Handle null/undefined/boolean
  if (node == null || typeof node === "boolean") {
    return null;
  }

  // Handle arrays
  if (Array.isArray(node)) {
    // If single string child, use it
    if (node.length === 1 && typeof node[0] === "string") {
      return node[0].trim();
    }

    // Join string primitives
    const stringParts = node
      .filter((child) => typeof child === "string" || typeof child === "number")
      .map((child) => String(child));

    if (stringParts.length > 0) {
      return stringParts.join("").trim();
    }

    return null;
  }

  // Handle React elements
  if (isValidElement(node)) {
    // Try to extract string from element's children
    if (
      typeof node.props === "object" &&
      node.props !== null &&
      "children" in node.props
    ) {
      return extractStringContent(
        (node.props as { children: ReactNode }).children,
      );
    }
    return null;
  }

  // Objects and other types cannot be converted
  return null;
}

export function Comment({ children, content }: CommentProps) {
  // Try to extract string content from either content or children
  const stringContent = content ?? extractStringContent(children);

  // If we have valid string content, try to parse it as a markdown link
  if (stringContent) {
    const parsedLink = parseMarkdownLink(stringContent);

    const inner =
      parsedLink && isSafeLink(parsedLink.url) ? (
        <a
          href={parsedLink.url}
          {...(isExternalLink(parsedLink.url) && {
            target: "_blank",
            rel: "noopener noreferrer",
          })}
        >
          {parsedLink.text}
        </a>
      ) : (
        stringContent
      );

    return (
      <p className="blog-comment">
        <strong>{inner}</strong>
      </p>
    );
  }

  // Fallback: unwrap a single <p> wrapper if present and render as-is
  const effectiveChildren =
    isValidElement(children) &&
    children.type === "p" &&
    typeof children.props === "object" &&
    children.props !== null &&
    "children" in children.props
      ? (children.props as { children: ReactNode }).children
      : children;

  return (
    <p className="blog-comment">
      <strong>{effectiveChildren}</strong>
    </p>
  );
}
