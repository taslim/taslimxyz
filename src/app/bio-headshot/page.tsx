import Link from "next/link";

export default function BioHeadshotPage() {
  return (
    <div className="page-shell">
      <h1 className="page-title">Bio &amp; Headshot</h1>

      <section className="section">
        <div className="stack">
          <h2 className="section-heading">Bio</h2>
          <div className="body-copy">
            <p>
              <strong>Taslim OKUNOLA</strong>
              <br />
              <strong>Global Strategy &amp; Operations Manager, Google</strong>
            </p>
            <p>
              Taslim looks after strategy and operations for Subscriptions (Google One &amp; Photos),
              and New Platforms (Google TV &amp; Auto) Marketing at Google. In this capacity, he leads
              strategy deep dives to help marketing leaders sustainably grow Google's complex platforms
              and ecosystems, and help them to run a tight ship by managing ongoing business operations
              needs. Prior to this role, he was a Product Manager on the Chrome Browser team where he
              built content products for the browser. Before that, he drove research and product marketing
              efforts for Search, YouTube and Assistant in Sub-Saharan Africa. He has also worked with
              Google.org to run the Google Impact Challenge in Kenya, Nigeria and South Africa, which
              supported 36 nonprofits with $6M in grant funding.
            </p>
            <p>
              He earned a bachelor's degree in Agricultural Economics from the Federal University of Technology, Akure.
            </p>
          </div>
        </div>

        <div className="stack">
          <h2 className="section-heading">Headshot</h2>
          <div className="body-copy">
            <p>
              <Link href="https://drive.google.com/file/d/1FwK5JalJVUSbqwn7Tt8eMmnwqoauE9LB/view?usp=sharing" target="_blank" rel="noopener noreferrer">
                Download here
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

