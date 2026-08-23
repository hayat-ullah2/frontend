import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AnalyticsTracker from "@/components/site/AnalyticsTracker";
import CookieConsent from "@/components/site/CookieConsent";
import GoogleAnalyticsConsent from "@/components/site/GoogleAnalyticsConsent";
import GoogleTagManagerConsent from "@/components/site/GoogleTagManagerConsent";
import AdsScript from "@/components/site/monetize/AdsScript";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const gaId =
  process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_GA_ID : undefined;
const gtmId =
  process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_GTM_ID : undefined;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — AI Tools Reviews, Comparisons & Guides`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "AI tools",
    "best AI tools",
    "AI software",
    "AI tool reviews",
    "AI tool comparison",
    "AI writing tools",
    "AI coding tools",
    "AI productivity tools",
  ],
  alternates: {
    canonical: "/",
    types: {
      "application/rss+xml": `${SITE_URL}/feed.xml`,
    },
  },
  openGraph: {
    title: `${SITE_NAME} — AI Tools Reviews, Comparisons & Guides`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-US"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/*
          Direct <link> tag: child pages that override `metadata.alternates`
          would blow away the alternates.types entry, so we render it here to
          guarantee every page advertises the RSS feed.
        */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title={`${SITE_NAME} RSS Feed`}
          href={`${SITE_URL}/feed.xml`}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
        <AnalyticsTracker />
        <CookieConsent />
        <AdsScript />
        {gaId ? <GoogleAnalyticsConsent gaId={gaId} /> : null}
        {gtmId ? <GoogleTagManagerConsent gtmId={gtmId} /> : null}
      </body>
    </html>
  );
}
