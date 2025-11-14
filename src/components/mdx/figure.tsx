import Image from "next/image";

interface FigureProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export function Figure({
  src,
  alt,
  caption,
  width = 800,
  height = 600,
}: FigureProps) {
  return (
    <figure className="blog-figure">
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="blog-figure__image"
      />
      {caption && (
        <figcaption className="blog-figure__caption">{caption}</figcaption>
      )}
    </figure>
  );
}
