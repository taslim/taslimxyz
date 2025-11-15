import Image, { type StaticImageData } from "next/image";

interface FigureProps {
  src: string | StaticImageData;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function Figure({ src, alt, caption, width, height }: FigureProps) {
  // If src is a StaticImageData (imported image), Next.js handles dimensions automatically
  // If src is a string, we need explicit width/height (default to 800x600 for backwards compat)
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
        <figcaption className="blog-figure__caption">{caption}</figcaption>
      )}
    </figure>
  );
}
