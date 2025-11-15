import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
  return (
    <div className="page-shell page-shell--home">
      <h1 className="page-title page-title--home">404</h1>
      <p className="page-subtitle">This page doesn&apos;t exist</p>
      <p>
        <Link href="/">← Back to home</Link>
      </p>
    </div>
  );
}
