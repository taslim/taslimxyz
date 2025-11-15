import { isValidElement, type ReactNode } from "react";

export interface CommentProps {
  children?: ReactNode;
  content?: string;
}

/**
 * Parses a markdown link [text](url) from a plain string.
 */
function parseMarkdownLink(text: string): { text: string; url: string } | null {
  const linkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/;
  const linkMatch = linkRegex.exec(text.trim());

  if (!linkMatch?.[1] || !linkMatch[2]) {
    return null;
  }

  return {
    text: linkMatch[1],
    url: linkMatch[2],
  };
}

export function Comment({ children, content }: CommentProps) {
  // If explicit string content is provided, treat it as markdown
  if (typeof content === "string") {
    const parsedLink = parseMarkdownLink(content);

    const inner = parsedLink ? (
      <a href={parsedLink.url} target="_blank" rel="noopener noreferrer">
        {parsedLink.text}
      </a>
    ) : (
      content
    );

    return (
      <p className="blog-comment">
        <strong>{inner}</strong>
      </p>
    );
  }

  // Default MDX path: unwrap a single <p> wrapper if present
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
