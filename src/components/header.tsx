"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  
  // No header on homepage
  if (pathname === "/") {
    return null;
  }

  // Determine link destination based on current page
  const isPostPage = pathname.startsWith("/blog/") && pathname !== "/blog";
  const linkHref = isPostPage ? "/blog" : "/";

  return (
    <header className="site-header">
      <div className="site-container">
        <h2 className="site-title">
          <Link
            href={linkHref}
            className="no-underline transition-opacity hover:opacity-80"
          >
            TASLIM OKUNOLA
          </Link>
        </h2>
      </div>
    </header>
  );
}

