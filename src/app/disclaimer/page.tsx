import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Important disclaimers and disclosures for Taslim's personal website.",
};

export default function DisclaimerPage() {
  return (
    <div className="page-shell">
      <h1 className="page-title">Disclaimer</h1>

      <section className="section">
        <div className="body-copy">
          <p>
            Views expressed in &quot;posts&quot; (including any form of media)
            are those of Taslim Okunola or the individual quoted therein and are
            not the views of Taslim&apos;s current or previous employers or
            their respective affiliates.
          </p>

          <p>
            Views expressed in the &quot;comments&quot; are those of the authors
            and do not represent Taslim&apos;s views or opinions.
          </p>

          <p>
            Taslim is currently employed full-time at Google. The contents of
            this website do not in any way represent Google&apos;s views on any
            subject matter therein.
          </p>

          <p>
            The contents in here — and available on any associated distribution
            platforms and any public Taslim Okunola online social media
            accounts, platforms, and sites (collectively, “content distribution
            outlets”) — should not be construed as or relied upon in any manner
            as investment, legal, tax, or other advice. You should consult your
            own advisers as to legal, business, tax, and other related matters
            concerning any investment.
          </p>

          <p>
            Any projections, estimates, forecasts, targets, prospects, and/or
            opinions expressed in these materials are subject to change without
            notice and may differ from or be contrary to opinions expressed by
            others. Any charts provided here are for informational purposes only
            and should not be relied upon when making any investment decision.
          </p>
        </div>
      </section>
    </div>
  );
}
