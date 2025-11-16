import "@/styles/globals.css";

import { Suspense } from "react";
import { type Metadata } from "next";
import {
  Geist,
  Merriweather,
  Open_Sans,
  Poppins,
  Lato,
  Montserrat,
} from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GoogleAnalytics } from "@next/third-parties/google";
import { analytics } from "@/lib/analytics";
import { AnalyticsClient } from "@/components/analytics-client";
import { WebVitalsReporter } from "@/components/web-vitals-reporter";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.siteUrl),
  title: {
    default: `${siteMetadata.title} - Product | Strategy | Marketing`,
    template: `%s - ${siteMetadata.title}`,
  },
  description: siteMetadata.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteMetadata.siteUrl,
    siteName: `${siteMetadata.title} - Product | Strategy | Marketing`,
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: siteMetadata.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@taslimxyz",
    creator: "@taslimxyz",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  alternates: {
    types: {
      "application/rss+xml": `${siteMetadata.siteUrl}/rss.xml`,
    },
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const merriweather = Merriweather({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-merriweather-family",
});

const openSans = Open_Sans({
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-open-sans-family",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-poppins-family",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-lato-family",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-montserrat-family",
});

const gaMeasurementId = analytics.measurementId;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${merriweather.variable} ${openSans.variable} ${poppins.variable} ${lato.variable} ${montserrat.variable}`}
      suppressHydrationWarning
    >
      <body>
        <ThemeProvider>
          <Header />
          <main>
            <div className="site-container">
              <div className="page-container">{children}</div>
            </div>
          </main>
          <Footer />
        </ThemeProvider>
        {gaMeasurementId ? (
          <>
            <Suspense fallback={null}>
              <AnalyticsClient />
            </Suspense>
            <WebVitalsReporter />
            <GoogleAnalytics gaId={gaMeasurementId} />
          </>
        ) : null}
      </body>
    </html>
  );
}
