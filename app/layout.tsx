import type { Metadata } from "next";
import { Bebas_Neue, Ballet } from "@/lib/font-shim";
import "./globals.css";
import { Toaster } from '@/components/general/sonner'
import 'sileo/styles.css'

const bebas = Bebas_Neue({
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const ballet = Ballet({
  variable: "--font-ballet",
  display: "swap",
});

const siteUrl = "https://improve-club.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "IMPROVE | Focus & App-Blocking Software for iPhone, iPad & Mac",
    template: "%s | IMPROVE",
  },
  description:
    "Focus and app-blocking software for iPhone, iPad, and Mac. Quiet distracting apps, count up your real work, and never lose a streak. Private by design.",
  keywords: [
    "Dive by Improve",
    "Improve Club",
    "app blocker for iPhone",
    "focus app for iPhone and Mac",
    "Screen Time app blocker",
    "focus timer without streaks",
    "deep work timer",
    "private focus app",
    "on-device Apple Intelligence",
    "iOS productivity app",
  ],
  authors: [{ name: "IMPROVE", url: siteUrl }],
  creator: "IMPROVE",
  publisher: "IMPROVE",
  category: "Productivity",
  applicationName: "IMPROVE",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "IMPROVE",
    title: "IMPROVE — Focus & App-Blocking Software for iPhone, iPad & Mac",
    description:
      "Quiet distracting apps, count up your real work, and never lose a streak. Makers of Dive for iPhone, iPad, and Mac.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IMPROVE — Focus & App-Blocking Software",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IMPROVE — Focus & App-Blocking Software for iPhone, iPad & Mac",
    description:
      "Quiet distracting apps, count up your real work, and never lose a streak. Private by design.",
    images: ["/og-image.png"],
    creator: "@improveclub",
    site: "@improveclub",
  },
  icons: {
    icon: [
      { url: "/icon.png?v=2", type: "image/png", sizes: "32x32" },
      { url: "/icon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.ico?v=2", sizes: "any" },
    ],
    shortcut: "/icon.png?v=2",
    apple: "/apple-icon.png?v=2",
  },
  verification: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION
    ? { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION }
    : undefined,
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IMPROVE",
  alternateName: "Improve Club",
  url: siteUrl,
  logo: `${siteUrl}/og-image.png`,
  description:
    "Focus and app-blocking software for iPhone, iPad, and Mac. Makers of Dive — quiet distracting apps, count up your real work, and keep your data on your device.",
  sameAs: [],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IMPROVE",
  alternateName: "Improve Club",
  url: siteUrl,
  description:
    "Focus and app-blocking software for iPhone, iPad, and Mac. Quiet distracting apps, count up your real work, and never lose a streak.",
};

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Dive by Improve",
  operatingSystem: "iOS, iPadOS, macOS",
  applicationCategory: "ProductivityApplication",
  offers: [
    {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
      name: "Free",
    },
    {
      "@type": "Offer",
      price: "6.99",
      priceCurrency: "USD",
      name: "Dive",
    },
    {
      "@type": "Offer",
      price: "29.99",
      priceCurrency: "USD",
      name: "Improve",
    },
  ],
  description:
    "Focus and Screen Time app blocker for iPhone, iPad, and Mac. Sit down, dive in, do the real work — no streaks, no accounts, Data Not Collected.",
  url: `${siteUrl}/dive`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png?v=2" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon.svg?v=2" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.ico?v=2" />
        <link rel="apple-touch-icon" href="/apple-icon.png?v=2" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSoftwareApp) }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased bg-[var(--bg)] text-[var(--label)] selection:bg-[var(--indigo)] selection:text-white">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
