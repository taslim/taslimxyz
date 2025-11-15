import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Get in touch",
  description:
    "Connect with Taslim on Twitter, Threads, and LinkedIn. You can also send an email.",
};

export default function ContactPage() {
  return (
    <div className="page-shell">
      <h1 className="page-title">Get in touch</h1>

      <div className="link-stack">
        <p>
          <a
            href="https://twitter.com/taslimokunola"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
        </p>
        <p>
          <a
            href="https://threads.net/taslimokunola"
            target="_blank"
            rel="noopener noreferrer"
          >
            Threads
          </a>
        </p>
        <p>
          <a
            href="https://linkedin.com/in/taslimokunola"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </p>
        <p>Email: hello@taslim.xyz</p>
      </div>
    </div>
  );
}
