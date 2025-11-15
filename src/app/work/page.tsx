import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Taslim has years of work experience spanning Strategy & Operations, Product Management, Product Marketing, and Sales.",
};

export default function WorkPage() {
  return (
    <div className="page-shell">
      <h1 className="page-title">Work</h1>

      <section className="section">
        <div className="stack">
          <h2 className="section-heading">
            Global Strategy &amp; Operations Manager
          </h2>
          <div className="body-copy">
            <p>
              <strong>Subscriptions Marketing</strong>
            </p>
            <p>
              I manage strategic planning and operational processes for
              marketing teams at Google, focusing on Subscriptions and Customer
              Growth. I work closely with product marketing and business
              development leaders to sustainably grow our complex subscriptions
              services. I do this by co-developing strategies, driving
              cross-functional collaboration, and building scalable processes to
              supercharge execution.
            </p>
            <p>
              Currently, I primarily look after Google One, Google Photos, and
              Fi Wireless.
            </p>
            <p>
              Previously, I have supported Android, TV, Auto, Chromebooks,
              Chrome Browser, Education, Enterprise, and Developer Marketing.
            </p>
          </div>
        </div>

        <div className="stack">
          <h2 className="section-heading">Prior Experience</h2>
          <div className="body-copy">
            <p>
              <strong>Product Management | Product Marketing | Sales</strong>
            </p>
            <p>
              I have a knack for helping people and businesses grow. This has
              been my life&apos;s work since I started out a career in digital
              marketing. I started with understanding the tenets of Performance
              Advertising and helping big brands in Nigeria leverage the web to
              grow.
            </p>
            <p>
              Then, I moved on to helping Google.org to run the Google Impact
              Challenge in Kenya, Nigeria and South Africa, which supported 36
              nonprofits with $6M in grant funding.
            </p>
            <p>
              I also drove research and product marketing efforts for Search,
              YouTube and Assistant in Sub-Saharan Africa where I supported
              product managers to launch relevant apps in the region.
            </p>
            <p>
              Most recently, I was the Product Manager for the Discover Feed on
              Chrome Browser, where I supported DAU growth by 40% in one year.
            </p>
            <p>
              I earned a bachelor&apos;s degree in Agricultural Economics from
              the Federal University of Technology, Akure.
            </p>
            <p>
              <Link
                href="https://linkedin.com/in/taslimokunola"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn more about my work
              </Link>
              <br />
              Reach out: hello@taslim.xyz
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
