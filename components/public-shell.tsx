'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { DiveNav } from '@/components/dive/dive-nav';
import { DiveFooter } from '@/components/dive/dive-footer';

export function PublicShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDive = pathname === '/dive' || pathname?.startsWith('/dive/');

  return (
    <div
      suppressHydrationWarning
      className={`min-h-screen ${
        isDive ? 'bg-[#0A0A0D]' : 'bg-black'
      } text-[var(--label)] flex flex-col justify-between relative selection:bg-white/20`}
    >
      <DiveNav />
      <main className={isDive ? 'flex-grow relative z-10' : 'pt-24 flex-grow relative z-10'}>
        {children}
      </main>
      <DiveFooter />
    </div>
  );
}
