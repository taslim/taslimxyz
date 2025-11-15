import type { ReactNode } from "react";

export interface CreditsProps {
  children: ReactNode;
}

export function Credits({ children }: CreditsProps) {
  return <div className="blog-credits">{children}</div>;
}
