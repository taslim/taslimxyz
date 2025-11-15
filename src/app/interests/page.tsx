import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Interests",
  description:
    "As a lifelong learner and a tech lover, Taslim has interests across a variety of fields - from space to artificial intelligence.",
};

export default function InterestsPage() {
  return (
    <div className="page-shell">
      <h1 className="page-title">Interests</h1>

      <section className="section">
        <div className="stack">
          <h2 className="section-heading">AI &amp; GPTs</h2>
          <div className="body-copy">
            <ul>
              <li>
                <a
                  href="https://nownow.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Side projects
                </a>{" "}
                vibe-coded with AI
              </li>
            </ul>
          </div>
        </div>

        <div className="stack">
          <h2 className="section-heading">Interesting Reads &amp; Podcasts</h2>
          <div className="body-copy">
            <ul>
              <li>
                <a
                  href="https://www.acquired.fm/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Acquired
                </a>{" "}
                by Ben Gilbert &amp; David Rosenthal
              </li>
              <li>
                <a
                  href="https://www.nytimes.com/column/hard-fork"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Hard Fork
                </a>{" "}
                by Casey Newton &amp; Kevin Roose
              </li>
              <li>
                <a
                  href="https://fs.blog/first-principles/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  First Principles: The Building Blocks of True Knowledge
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
