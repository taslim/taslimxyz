import Image, { type StaticImageData } from "next/image";

export interface FigureProps {
  src: string | StaticImageData;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

/**
 * Parses markdown links [text](url) in a string and converts them to React elements
 */
function parseMarkdownLinks(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  
  // Regex to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }

    // Add the link
    const linkText = match[1];
    const linkUrl = match[2];
    parts.push(
      <a
        key={match.index}
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {linkText}
      </a>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export function Figure({ src, alt, caption, width, height }: FigureProps) {
  // If src is a StaticImageData (imported image), Next.js handles dimensions automatically.
  // If it's a string, we need explicit width/height (default to 800x600 for backwards compat).
  const isStaticImage = typeof src !== "string";

  return (
    <figure className="blog-figure">
      <Image
        src={src}
        alt={alt}
        width={isStaticImage ? undefined : (width ?? 800)}
        height={isStaticImage ? undefined : (height ?? 600)}
        className="blog-figure__image"
      />
      {caption && (
        <figcaption className="blog-figure__caption">
          {parseMarkdownLinks(caption)}
        </figcaption>
      )}
    </figure>
  );
}
