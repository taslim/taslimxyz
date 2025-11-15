export interface CommentProps {
  children?: React.ReactNode;
  content?: string;
}

/**
 * Parses a markdown link [text](url) from children
 */
function parseMarkdownLink(children: React.ReactNode): {
  text: string;
  url: string;
} | null {
  // Only parse if children is a string
  if (typeof children !== "string") {
    return null;
  }

  // Match markdown link pattern: [text](url)
  const linkRegex = /^\[([^\]]+)\]\(([^)]+)\)$/;
  const linkMatch = linkRegex.exec(children);

  if (linkMatch?.[1] && linkMatch?.[2]) {
    return {
      text: linkMatch[1],
      url: linkMatch[2],
    };
  }

  return null;
}

export function Comment({ children, content }: CommentProps) {
  const text = content ?? children;
  const parsedLink = parseMarkdownLink(text);

  if (parsedLink) {
    return (
      <p className="blog-comment">
        <strong>
          <a href={parsedLink.url} target="_blank" rel="noopener noreferrer">
            {parsedLink.text}
          </a>
        </strong>
      </p>
    );
  }

  // Fallback: render text as-is
  return (
    <p className="blog-comment">
      <strong>{text}</strong>
    </p>
  );
}
