import Link from "next/link";

export default function HomePage() {
  return (
    <div className="page-shell page-shell--home">
      {/* Main heading */}
      <h1 className="page-title page-title--home">
        Taslim Okunola
      </h1>

      {/* Subtitle */}
      <p className="page-subtitle">
        Global Strategy &amp; Operations Manager @ Google
      </p>

      {/* Primary links */}
      <div className="link-stack">
        <p>
          <Link href="/blog">Blog</Link>
        </p>
        <p>
          <a href="https://angle.africa" target="_blank" rel="noopener noreferrer">
            angle.africa →
          </a>
        </p>
      </div>

      {/* Divider */}
      <hr />

      {/* Secondary links */}
      <div className="link-stack">
        <p>
          <Link href="/interests">Interests</Link>
        </p>
        <p>
          <Link href="/work">Work</Link>
        </p>
      </div>

      {/* Divider */}
      <hr />

      {/* Tertiary links */}
      <div className="link-stack">
        <p>
          <Link href="/bio-headshot">Bio &amp; Headshot</Link>
        </p>
        <p>
          <Link href="/contact">Get in touch</Link>
        </p>
      </div>
    </div>
  );
}
