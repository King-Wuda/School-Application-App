import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { ShortlistProvider } from "@/components/shortlist/ShortlistProvider";
import { Analytics } from "@/components/analytics/Analytics";
import { FeedbackButton } from "@/components/feedback/FeedbackButton";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const viewport: Viewport = {
  themeColor: "#F9F7F4",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SchoolFinder SA — Find the right school for your child",
    template: "%s | SchoolFinder SA",
  },
  description:
    "Free school search for South African parents. Compare fees, grades, distance and how to apply for every Western Cape school — public, independent and special needs.",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: siteUrl,
    siteName: "SchoolFinder SA",
    title: "SchoolFinder SA — Find & Compare Schools in South Africa",
    description:
      "Search, compare and shortlist every school and university in South Africa.",
  },
  twitter: {
    card: "summary_large_image",
    title: "SchoolFinder SA",
    description: "Find and compare schools in South Africa.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
      <body className="min-h-screen flex flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-navy focus:px-3 focus:py-2 focus:text-cream"
        >
          Skip to content
        </a>
        <Analytics />
        <ShortlistProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <FeedbackButton />
        </ShortlistProvider>
      </body>
    </html>
  );
}
