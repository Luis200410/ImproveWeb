import type { Metadata } from "next";
import { Bebas_Neue, Ballet } from "@/lib/font-shim";
import "./globals.css";
import { TimerProvider } from '@/contexts/timer-context'
import { GlobalTimerIndicator } from '@/components/global-timer-indicator'
import { PomodoroProvider } from '@/components/productivity/pomodoro/pomodoro-context'
import { ActiveSessionSidebar, MinimizedSessionWidget } from '@/components/productivity/pomodoro/active-session-sidebar'
import { Toaster } from 'sileo'
import 'sileo/styles.css'
import { HabitReminderProvider } from '@/components/habit-reminder-provider'
import { Navigation } from '@/components/navigation'

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
    default: "The Ultimate All-in-One Life Operating System | IMPROVE — Complete Integrity",
    template: "%s | IMPROVE — Complete Integrity",
  },
  description:
    "Looking for the best Second Brain or Life Operating System? IMPROVE is the all-in-one productivity framework for mastering your Body, Money, Work, and Mind.",
  keywords: [
    "All-in-one Life Operating System",
    "Second Brain Software",
    "Personal Productivity System",
    "IMPROVE",
    "complete integrity",
    "self improvement system",
    "productivity framework",
    "habit tracker system",
    "life optimization",
    "excellence",
    "goal tracking",
    "body optimization system",
    "money wealth system",
    "professional work mastery",
    "mind clarity tools",
    "personal growth framework",
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
    siteName: "IMPROVE — Complete Integrity",
    title: "IMPROVE — All-in-One Life Operating System",
    description:
      "Looking for the best Second Brain or Life Operating System? The all-in-one productivity framework for mastering your Body, Money, Work, and Mind.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IMPROVE — Complete Integrity",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IMPROVE — All-in-One Life Operating System",
    description:
      "The ultimate technical framework for Complete Integrity. Master every dimension of your life.",
    images: ["/og-image.png"],
    creator: "@improveclub",
    site: "@improveclub",
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
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
  alternateName: "IMPROVE — Complete Integrity",
  url: siteUrl,
  logo: `${siteUrl}/og-image.png`,
  description:
    "IMPROVE is the ultimate all-in-one Life Operating System. Master your body, wealth, work, productivity, relationships, mind, and legacy within a single Framework.",
  sameAs: [],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IMPROVE",
  url: siteUrl,
  description:
    "The all-in-one Life Operating System and Second Brain Software for Complete Integrity.",
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
  offers: {
    "@type": "Offer",
    price: "10.00",
    priceCurrency: "USD",
  },
  description:
    "The ultimate all-in-one Life Operating System. Eight Systems covering body, money, work, productivity, relationships, mind, legacy, and knowledge.",
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
      <body suppressHydrationWarning className={`${bebas.variable} ${ballet.variable} font-bebas antialiased bg-black text-white selection:bg-white selection:text-black`}>
        <PomodoroProvider>
          <TimerProvider>
            <Navigation />
            <main className="pt-25">
              {children}
            </main>
            <GlobalTimerIndicator />
            <ActiveSessionSidebar />
            <MinimizedSessionWidget />
            <HabitReminderProvider />
            <Toaster />
          </TimerProvider>
        </PomodoroProvider>
      </body>
    </html>
  );
}
