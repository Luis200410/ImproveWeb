'use client';

import React from 'react';

export function DiveFounder() {
  return (
    <section className="pt-5 pb-[72px] md:pb-[110px] bg-[#0A0A0D] text-white">
      <div className="max-w-[640px] mx-auto px-4 md:px-8">
        <p className="text-[28px] font-light leading-[1.35] tracking-[-0.01em] m-0">
          &ldquo;I kept building systems to get ahead. Each one worked for a few weeks, then running it became a second job. Dive is what was left when I took the system away.&rdquo;
        </p>
        <div className="flex items-center gap-3 mt-7">
          <div className="w-10 h-10 rounded-full bg-white/[0.09] grid place-items-center text-[14px] font-medium">
            LC
          </div>
          <div>
            <div className="text-[15px] font-medium">Luis</div>
            <div className="text-[13px] leading-[1.5] text-white/42">
              Made Dive, and the rest of Improve
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
