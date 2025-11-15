import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="page-shell">
      <h1 className="page-title">404 Not Found</h1>
      <p>Sorry, but we couldn&apos;t find what you were looking for.</p>
      <p>
        Maybe try going <Link href="/">home</Link>?
      </p>
    </div>
  );
}
