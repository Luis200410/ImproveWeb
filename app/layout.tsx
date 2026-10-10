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
    default: "IMPROVE | Your Intentional Digital Companion",
    template: "%s | IMPROVE",
  },
  description:
    "Technology was meant to serve you, not distract you. IMPROVE is a digital companion that blocks the noise, builds your habits, and protects your time.",
  keywords: [
    "Intentional digital companion",
    "Habit execution engine",
    "Apple Intelligence productivity",
    "On-device AI companion",
    "Deep work system",
    "App blocking focus timer",
    "Anti-hustle productivity",
    "Goal alignment software",
    "Personal knowledge management",
    "Private productivity ecosystem",
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
    title: "IMPROVE — Your Intentional Digital Companion.",
    description:
      "Technology doing exactly what it was always meant to do: serve your intent. Block digital noise, build your habits, and execute your daily targets.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IMPROVE — Your Intentional Digital Companion",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IMPROVE — A Digital Companion.",
    description:
      "Define the goal. Block the noise. Execute the habit. Technology built to protect your time, not steal it.",
    images: ["/og-image.png"],
    creator: "@improveclub",
    site: "@improveclub",
  },
  alternates: {
    canonical: siteUrl,
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
  verification: {
    // Add your Google Search Console verification token here when available
    // google: "YOUR_GOOGLE_VERIFICATION_TOKEN",
  },
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "IMPROVE",
  alternateName: "IMPROVE — Your Intentional Digital Companion",
  url: siteUrl,
  logo: `${siteUrl}/og-image.png`,
  description:
    "IMPROVE is a premium digital companion designed for intent. We replace digital chaos with a quiet, private space for managing habits, work, health, and mind using completely local, on-device AI.",
  sameAs: [],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IMPROVE",
  url: siteUrl,
  description:
    "An intentional digital companion for your habits, work, health, and mind. Define the goal, block the noise, execute the habit.",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const jsonLdSoftwareApp = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "IMPROVE",
  operatingSystem: "Web",
  applicationCategory: "BusinessApplication",
  offers: [
    {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "USD",
      name: "Free Tier",
    },
    {
      "@type": "Offer",
      price: "40.00",
      priceCurrency: "USD",
      name: "Premium",
    },
  ],
  description:
    "A privacy-first digital companion that utilizes local AI to block distractions, build core habits, and drive purposeful execution. Technology meant to serve the user.",
  url: siteUrl,
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
