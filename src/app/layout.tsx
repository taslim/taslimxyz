import "@/styles/globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://www.taslim.xyz"),
  title: {
    default: "Taslim Okunola - Product | Strategy | Marketing",
    template: "%s - Taslim Okunola",
  },
  description:
    "Taslim Okunola is a Strategy and Operations Manager at Google. He helps product leaders answer big business questions.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://taslim.xyz",
    siteName: "Taslim Okunola - Product | Strategy | Marketing",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Taslim Okunola",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@taslimxyz",
    creator: "@taslimxyz",
  },
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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

const isAnalyticsEnabled = analytics.isEnabled();
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
        {isAnalyticsEnabled ? (
          <>
            <AnalyticsClient />
            <WebVitalsReporter />
          </>
        ) : null}
      </body>
      {isAnalyticsEnabled && gaMeasurementId ? (
        <GoogleAnalytics gaId={gaMeasurementId} />
      ) : null}
    </html>
  );
}
