'use client';

import React from 'react';
import { AppStoreBadges } from './dive-assets';

export function DiveEveryScreen({ liveTime: _liveTime }: { liveTime?: string }) {
  return (
    <section className="py-[72px] md:py-[110px] bg-[#0A0A0D] text-white border-t-[0.75px] border-b-[0.75px] border-white/12">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-[680px] mx-auto">
          <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[18px]">
            Wherever you work
          </div>
          <h2 className="text-[30px] md:text-[40px] font-light leading-[1.12] tracking-[-0.02em] m-0">
            One dive, on every screen.
          </h2>
          <p className="text-[17px] md:text-[19px] leading-[1.55] text-white/66 mt-[18px] m-0">
            Start on your Mac, glance at your iPhone: it&apos;s the same dive, counting up in both places. Surface on one, and you surface on all.
          </p>
        </div>

        <AppStoreBadges className="mt-7" />

        {/* Multi-Device Render (Mac, iPad, iPhone) */}
        <div className="relative max-w-[920px] mx-auto mt-12 md:mt-16 flex justify-center overflow-visible">
          <div
            className="pointer-events-none absolute inset-x-12 top-8 bottom-4 rounded-full opacity-20 blur-[110px]"
            style={{ backgroundColor: '#FF02E8' }}
          />
          <img
            src="/images/dive/dive-every-screen.png"
            alt="Dive running in sync across Mac, iPad, and iPhone"
            className="relative z-[1] w-full h-auto object-contain translate-x-[2.2%] drop-shadow-[0_30px_80px_rgba(0,0,0,0.6)]"
          />
        </div>
      </div>
    </section>
  );
}
