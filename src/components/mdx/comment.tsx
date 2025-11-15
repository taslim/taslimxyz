export interface CommentProps {
  children: React.ReactNode;
}

/**
 * Parses a markdown link [text](url) from children
 */
function parseMarkdownLink(children: React.ReactNode): {
  text: string;
  url: string;
} | null {
  // Convert children to string
  const childString = String(children);

  // Match markdown link pattern: [text](url)
  const linkMatch = childString.match(/^\[([^\]]+)\]\(([^)]+)\)$/);

  if (linkMatch && linkMatch[1] && linkMatch[2]) {
    return {
      text: linkMatch[1],
      url: linkMatch[2],
    };
  }

  return null;
}

export function Comment({ children }: CommentProps) {
  const parsedLink = parseMarkdownLink(children);

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

  // Fallback: render children as-is
  return (
    <p className="blog-comment">
      <strong>{children}</strong>
    </p>
  );
}

