import { isValidElement, type ReactNode } from "react";

export interface CommentProps {
  children?: ReactNode;
  content?: string;
}

const MAX_NODE_TRAVERSAL_DEPTH = 20;

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
function extractStringContent(node: ReactNode, depth = 0): string | null {
  if (depth >= MAX_NODE_TRAVERSAL_DEPTH) {
    return null;
  }

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
        depth + 1,
      );
    }
    return null;
  }

  // Objects and other types cannot be converted
  return null;
}

/**
 * Extracts link data (text and URL) from ReactNode.
 * Handles both markdown strings and React link elements.
 */
function extractLinkData(
  node: ReactNode,
  depth = 0,
): { text: string; url: string } | null {
  if (depth >= MAX_NODE_TRAVERSAL_DEPTH) {
    return null;
  }

  // Try React element first (Link or <a> tag)
  if (isValidElement(node)) {
    const props = node.props as Record<string, unknown>;

    // Check if it's a link element with href
    if (typeof props.href === "string" && props.href) {
      const text = extractStringContent(props.children as ReactNode, depth + 1);
      if (text) {
        return { text, url: props.href };
      }
    }

    // If it's a wrapper element (like <p>), try to extract from children
    if (props.children) {
      return extractLinkData(props.children as ReactNode, depth + 1);
    }
  }

  // Try extracting from array of children
  if (Array.isArray(node)) {
    const childrenArray = node as ReactNode[];
    // Look for a single link element in the array
    for (const child of childrenArray) {
      if (isValidElement(child)) {
        const props = child.props as Record<string, unknown>;
        if (typeof props.href === "string" && props.href) {
          const text = extractStringContent(
            props.children as ReactNode,
            depth + 1,
          );
          if (text) {
            return { text, url: props.href };
          }
        }
      }
    }

    // If no link element found, try to parse as markdown string
    const stringContent = extractStringContent(node, depth + 1);
    if (stringContent) {
      return parseMarkdownLink(stringContent);
    }
  }

  // Try markdown string format
  const stringContent = extractStringContent(node, depth + 1);
  if (stringContent) {
    return parseMarkdownLink(stringContent);
  }

  return null;
}

export function Comment({ children, content }: CommentProps) {
  // First, try to extract link data from content prop if provided
  let linkData: { text: string; url: string } | null = null;

  if (content) {
    linkData = parseMarkdownLink(content);
  } else {
    // Extract from children (handles both React elements and markdown strings)
    linkData = extractLinkData(children);
  }

  // If we found valid link data, render it as a link
  if (linkData && isSafeLink(linkData.url)) {
    return (
      <p className="blog-comment">
        <strong>
          <a
            href={linkData.url}
            {...(isExternalLink(linkData.url) && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
          >
            {linkData.text}
          </a>
        </strong>
      </p>
    );
  }

  // Fallback: render as plain text or with existing content
  const stringContent = content ?? extractStringContent(children);

  if (stringContent) {
    return (
      <p className="blog-comment">
        <strong>{stringContent}</strong>
      </p>
    );
  }

  // Final fallback: unwrap a single <p> wrapper if present and render as-is
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
