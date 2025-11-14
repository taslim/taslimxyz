"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const isBlogPost = pathname?.startsWith("/blog/") && pathname !== "/blog";

  return (
    <footer className="w-full">
      <div className="site-container footer-container">
        {isBlogPost && (
          <p
            className="text-[var(--color-footer-text)] dark:text-[var(--color-dark-footer-text)]"
            style={{
              fontFamily: "var(--font-montserrat)",
              fontSize: "var(--footer-font-size)",
              marginBottom: "0.5rem",
            }}
          >
            <Link href="/disclaimer">Disclaimer</Link>
          </p>
        )}
        <p
          className="text-[var(--color-footer-text)] dark:text-[var(--color-dark-footer-text)]"
          style={{
            fontFamily: "var(--font-montserrat)",
            fontSize: "var(--footer-font-size)",
          }}
        >
          Made with ❤️ in San Francisco
        </p>
      </div>
    </footer>
  );
}
