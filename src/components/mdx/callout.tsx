import { type ReactNode } from "react";

interface CalloutProps {
  children: ReactNode;
  type?: "info" | "warning" | "success" | "error";
}

export function Callout({ children, type = "info" }: CalloutProps) {
  return <div className={`blog-callout blog-callout--${type}`}>{children}</div>;
}
