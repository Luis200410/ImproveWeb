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
    default: "IMPROVE — The School of Excellence | Productivity & Self-Improvement System",
    template: "%s | IMPROVE — The School of Excellence",
  },
  description:
    "IMPROVE is the all-in-one self-improvement operating system for ambitious people. Master your body, wealth, work, productivity, relationships, mind, and legacy with 8 powerful life systems.",
  keywords: [
    "improve",
    "self improvement",
    "self-improvement app",
    "productivity system",
    "personal development",
    "habit tracker",
    "life operating system",
    "excellence",
    "goal tracking",
    "second brain",
    "body fitness tracker",
    "money management",
    "time management",
    "mind improvement",
    "personal growth",
    "performance system",
    "improve life",
    "improve yourself",
    "improve productivity",
    "improve habits",
    "improve mindset",
    "improve finances",
    "improve body",
    "improve relationships",
    "IMPROVE app",
    "school of excellence",
    "Improve Club",
    "improve club",
    "improve-club.com",
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
    siteName: "IMPROVE — The School of Excellence",
    title: "IMPROVE — The All-In-One Self-Improvement System",
    description:
      "Eight powerful life systems in one platform. Track habits, manage finances, build your second brain, master productivity, and pursue excellence across every dimension of life.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IMPROVE — The School of Excellence",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IMPROVE — The School of Excellence",
    description:
      "Eight powerful life systems to master your body, wealth, work, productivity, relationships, mind, and legacy.",
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
  alternateName: "IMPROVE — The School of Excellence",
  url: siteUrl,
  logo: `${siteUrl}/og-image.png`,
  description:
    "IMPROVE is the all-in-one self-improvement operating system for ambitious people. Master your body, wealth, work, productivity, relationships, mind, and legacy.",
  sameAs: [],
};

const jsonLdWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "IMPROVE",
  url: siteUrl,
  description:
    "Eight powerful life systems in one platform. Track habits, manage finances, build your second brain, master productivity, and pursue excellence across every dimension of life.",
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
  applicationCategory: "LifestyleApplication",
  offers: {
    "@type": "Offer",
    price: "10.00",
    priceCurrency: "USD",
  },
  description:
    "IMPROVE is the all-in-one self-improvement operating system. Eight systems covering body, money, work, productivity, relationships, mind, legacy, and knowledge — all in one beautiful platform.",
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
