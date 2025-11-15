import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// Force Node.js runtime for file system access
export const runtime = "nodejs";

/**
 * Middleware to handle legacy blog URLs with folder prefix
 * Redirects /blog/folder/slug to /blog/slug ONLY if the post exists in that folder
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Match pattern: /blog/folder/slug
  const legacyBlogRegex = /^\/blog\/([^/]+)\/([^/]+)\/?$/;
  const legacyBlogMatch = legacyBlogRegex.exec(pathname);

  if (legacyBlogMatch) {
    const requestedFolder = legacyBlogMatch[1];
    const slug = legacyBlogMatch[2];

    // TypeScript safety: ensure both capture groups exist
    if (!requestedFolder || !slug) {
      return NextResponse.next();
    }

    // Check if the post exists in the requested folder
    const postsDir = path.join(process.cwd(), "src/content/blog");
    const postPath = path.join(postsDir, requestedFolder, slug, "index.mdx");

    // If post doesn't exist in the requested folder, return 404
    if (!fs.existsSync(postPath)) {
      return NextResponse.rewrite(new URL("/404", request.url));
    }

    // Valid legacy URL - redirect to canonical /blog/slug
    const url = request.nextUrl.clone();
    url.pathname = `/blog/${slug}`;

    return NextResponse.redirect(url, 308); // 308 = Permanent Redirect
  }

  return NextResponse.next();
}
