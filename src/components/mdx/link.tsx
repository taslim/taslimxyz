import type { AnchorHTMLAttributes } from "react";

export function Link(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { href, children, ...rest } = props;

  if (!href) {
    return <a {...props}>{children}</a>;
  }

  // Check if link is external (starts with http:// or https://)
  const isExternal = /^https?:\/\//.test(href);

  if (isExternal) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
      </a>
    );
  }

  // Internal links (including anchors and relative paths)
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
