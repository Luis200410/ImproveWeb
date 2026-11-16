import type { Metadata } from 'next';
import { DivePageClient } from '@/components/dive/dive-page-client';

export const metadata: Metadata = {
  title: 'Dive by Improve',
  description:
    'Below the noise. Your phone lives at the surface. Your real work happens underneath.',
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
