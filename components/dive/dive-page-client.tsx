'use client';

import React from 'react';
import { useDiveLiveTimer } from './dive-assets';
import { DiveHero } from './dive-hero';
import { DiveStatement } from './dive-statement';
import { DiveScenes } from './dive-scenes';
import { DiveAreas } from './dive-areas';
import { DiveProgressGoals } from './dive-progress-goals';
import { DiveEveryScreen } from './dive-every-screen';
import { DiveNumbers } from './dive-numbers';
import { DivePricing } from './dive-pricing';
import { DiveFaq } from './dive-faq';
import { DiveClose } from './dive-close';

export function DivePageClient() {
  const liveTime = useDiveLiveTimer();

  return (
    <div
      className="bg-[#0A0A0D] text-white font-['Inter',-apple-system,Helvetica,sans-serif] font-normal antialiased overflow-x-clip"
      style={{ scrollBehavior: 'smooth' }}
    >
      <DiveHero liveTime={liveTime} />
      <DiveStatement />
      <DiveScenes />
      <DiveAreas />
      <DiveProgressGoals />
      <DiveEveryScreen liveTime={liveTime} />
      <DiveNumbers />
      <DivePricing />
      <DiveFaq />
      <DiveClose />
    </div>
  );
}
