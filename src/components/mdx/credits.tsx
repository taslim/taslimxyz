import type { ReactNode } from "react";

export interface CreditsProps {
  children?: ReactNode;
  content?: string;
}

export function Credits({ children, content }: CreditsProps) {
  return <div className="blog-credits">{content ?? children}</div>;
}
