'use client';

import React from 'react';

export function DivePrivacy() {
  return (
    <section id="privacy" className="py-[72px] md:py-[110px] bg-[#0A0A0D] text-white">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-[40px] md:gap-[64px] items-start">
        {/* Left: Privacy by design */}
        <div>
          <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[18px]">
            Private by design
          </div>
          <h2 className="text-[30px] md:text-[40px] font-light leading-[1.12] tracking-[-0.02em] m-0">
            Quiet about you, too.
          </h2>
          <p className="text-[17px] md:text-[19px] leading-[1.55] text-white/66 mt-[18px] m-0">
            No account, no servers, no tracking. Your dives stay on your devices and in your own iCloud.
          </p>

          <div className="grid gap-4 mt-8">
            <div className="bg-white/[0.055] border-[0.75px] border-white/12 rounded-[15px] backdrop-blur-[20px] p-7 flex gap-5 items-start">
              <div className="w-11 h-11 rounded-[12px] bg-white/[0.09] grid place-items-center flex-none">
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-none stroke-white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z" />
                  <path d="M9 12l2 2 4-4" />
                </svg>
              </div>
              <div>
                <div className="text-[22px] font-normal">Data Not Collected</div>
                <p className="text-[16px] leading-[1.6] text-white/66 mt-[6px] m-0">
                  That&apos;s Dive&apos;s privacy label on the App Store. We don&apos;t receive your dives, your quiet list or what you write.
                </p>
              </div>
            </div>

            <div className="bg-white/[0.055] border-[0.75px] border-white/12 rounded-[15px] backdrop-blur-[20px] p-7 flex gap-5 items-start">
              <div className="w-11 h-11 rounded-[12px] bg-white/[0.09] grid place-items-center flex-none">
                <svg viewBox="0 0 24 24" className="w-[22px] h-[22px] fill-none stroke-white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
                  <path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z" />
                </svg>
              </div>
              <div>
                <div className="text-[22px] font-normal">The Coach runs on your device</div>
                <p className="text-[16px] leading-[1.6] text-white/66 mt-[6px] m-0">
                  Ask it to size your next step when you&apos;re stuck. It uses Apple Intelligence on your iPhone, iPad or Mac, so nothing leaves it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: What it's built on */}
        <div>
          <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[18px] mt-[6px]">
            What it&apos;s built on
          </div>
          <div className="grid gap-[26px]">
            <div className="border-l-2 border-white/12 pl-4">
              <p className="text-[16px] leading-[1.6] text-white/66 m-0">
                Flow tends to come with a clear goal, quick feedback, a challenge that fits your skill, and no interruptions. A dive is built to set up exactly those.
              </p>
              <p className="text-[13px] leading-[1.5] text-white/42 mt-[6px] m-0">
                Mihaly Csikszentmihalyi, <i>Flow</i> (1990)
              </p>
            </div>

            <div className="border-l-2 border-white/12 pl-4">
              <p className="text-[16px] leading-[1.6] text-white/66 m-0">
                Making a specific plan for an unfinished goal stopped it from intruding on people&apos;s thoughts. That&apos;s the pick-up line: park the work, and let it go.
              </p>
              <p className="text-[13px] leading-[1.5] text-white/42 mt-[6px] m-0">
                Masicampo &amp; Baumeister, Journal of Personality and Social Psychology (2011)
              </p>
            </div>

            <div className="border-l-2 border-white/12 pl-4">
              <p className="text-[16px] leading-[1.6] text-white/42 m-0">
                No app can make flow happen. Dive sets up the conditions and stays out of the way. The rest is you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
