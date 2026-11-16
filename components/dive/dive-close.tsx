'use client';

import React from 'react';
import { AppStoreBadges, DiveLogo, DiveWaves } from './dive-assets';

export function DiveClose() {
  return (
    <section className="relative pt-[120px] pb-[240px] bg-[#0A0A0D] text-white text-center overflow-hidden">
      <div className="relative z-[2] max-w-[1120px] mx-auto px-4 md:px-8 flex flex-col items-center">
        <DiveLogo className="w-16 h-16 rounded-[15px]" />
        <h2 className="text-[30px] md:text-[40px] font-light leading-[1.12] tracking-[-0.02em] m-0 mt-[26px]">
          Everything else waits at the surface.
        </h2>
        <p className="text-[17px] md:text-[19px] leading-[1.55] text-white/70 mt-4 mx-auto max-w-[460px] mb-0">
          Your first dive takes under two minutes to set up.
        </p>
        <div className="mt-[30px]">
          <AppStoreBadges />
        </div>
      </div>

      <DiveWaves
        tint="#FF02E8"
        className="absolute left-0 right-0 bottom-0 w-full h-[180px] z-[1]"
      />
    </section>
  );
}
