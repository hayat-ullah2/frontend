import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nexblog.example.com"),
  title: {
    default: "NexBlog — Premium multi-niche blog",
    template: "%s · NexBlog",
  },
  description:
    "NexBlog is a modern, multi-niche publication covering technology, AI, programming, business, finance, lifestyle and more.",
  keywords: [
    "blog",
    "technology",
    "AI",
    "programming",
    "cybersecurity",
    "business",
    "finance",
    "lifestyle",
  ],
  openGraph: {
    title: "NexBlog — Premium multi-niche blog",
    description:
      "Modern, multi-niche publication covering tech, AI, business, finance, and more.",
    url: "https://nexblog.example.com",
    siteName: "NexBlog",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NexBlog",
    description: "Premium multi-niche blog platform.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
