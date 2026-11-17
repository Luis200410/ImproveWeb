import type { Metadata } from 'next';
import { DivePageClient } from '@/components/dive/dive-page-client';

const diveUrl = 'https://improve-club.com/dive';

export const metadata: Metadata = {
  title: 'Dive by Improve — Focus & App Blocker for iPhone, iPad & Mac',
  description:
    'Below the noise. Quiet distracting apps with Screen Time, count up your real work, and never lose a streak. Free to start, no account, Data Not Collected.',
  keywords: [
    'Dive by Improve',
    'Dive app',
    'app blocker for iPhone',
    'focus app for Mac',
    'Screen Time app blocker',
    'focus timer without streaks',
    'deep work timer',
    'private focus app',
  ],
  alternates: {
    canonical: diveUrl,
  },
  openGraph: {
    type: 'website',
    url: diveUrl,
    title: 'Dive by Improve — Focus & App Blocker for iPhone, iPad & Mac',
    description:
      'Quiet distracting apps, count up your real work, and never lose a streak. Free to start, no account, Data Not Collected.',
    images: [
      {
        url: '/images/dive/dive-hero-poster.png',
        width: 1280,
        height: 720,
        alt: 'Dive by Improve — Below the noise.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dive by Improve — Focus & App Blocker for iPhone, iPad & Mac',
    description:
      'Below the noise. Your phone lives at the surface. Your real work happens underneath.',
    images: ['/images/dive/dive-hero-poster.png'],
  },
};

export default function DivePage() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap"
        rel="stylesheet"
      />
      <DivePageClient />
    </>
  );
}
