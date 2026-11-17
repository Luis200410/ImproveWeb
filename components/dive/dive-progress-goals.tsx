'use client';

import React from 'react';
import Image from 'next/image';

function WaveBullet() {
  return (
    <svg
      viewBox="0 0 24 12"
      className="flex-none w-[18px] h-[10px] mt-[7px]"
      fill="none"
      stroke="#FF02E8"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M1 6q5.5-5 11 0t11 0" />
    </svg>
  );
}

export function DiveProgressGoals() {
  return (
    <section className="py-[72px] md:py-[110px] bg-[#0A0A0D] text-white overflow-x-clip">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 grid grid-cols-1 min-[700px]:grid-cols-2 gap-[40px] md:gap-[64px] items-center">
        {/* Right Copy on desktop */}
        <div className="min-[700px]:order-2">
          <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[18px]">
            Nothing to keep up
          </div>
          <h2 className="text-[30px] md:text-[40px] font-light leading-[1.12] tracking-[-0.02em] m-0">
            Proud, not pressured.
          </h2>
          <p className="text-[17px] md:text-[19px] leading-[1.55] text-white/66 mt-[18px] m-0">
            Dive counts the minutes you actually spent in the work. That&apos;s the whole record. Nothing to fill in, nothing to fall behind on.
          </p>

          <ul className="list-none p-0 m-0 mt-7 grid gap-[14px]">
            <li className="flex gap-3 text-[16px] leading-[1.5] text-white/66">
              <WaveBullet />
              <span>
                <span className="font-medium text-white">No streaks, no missed days.</span> A day without a dive stays blank. Any dive can start any day.
              </span>
            </li>
            <li className="flex gap-3 text-[16px] leading-[1.5] text-white/66">
              <WaveBullet />
              <span>
                <span className="font-medium text-white">A calm way back.</span> Away for a while? One card: &ldquo;Welcome back. One small dive?&rdquo; No backlog.
              </span>
            </li>
            <li className="flex gap-3 text-[16px] leading-[1.5] text-white/66">
              <WaveBullet />
              <span>
                <span className="font-medium text-white">One goal a quarter, if you want one.</span> Pick the dives that move it. It shows deep minutes and what moved, never a percentage.
              </span>
            </li>
          </ul>
        </div>

        {/* Left Phone Mockup on desktop */}
        <div className="min-[700px]:order-1 flex items-center justify-center isolate">
          <div className="relative flex items-center justify-center w-[80vw] min-[700px]:w-full max-w-[380px] min-[700px]:max-w-[480px]">
            {/* Subtle magenta ambient glow behind phone */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-6 rounded-full opacity-20 blur-[90px] -z-10"
              style={{ backgroundColor: '#FF02E8' }}
            />
            <div className="w-full">
              {/* Mobile (<700px): upright iPhone mockup */}
              <Image
                src="/dive/goals-iphone-mobile.png"
                width={699}
                height={1443}
                priority={false}
                sizes="80vw"
                alt="Dive's Goals screen on iPhone: a quarterly goal with its deep minutes and what moved."
                className="block min-[700px]:hidden w-full h-auto"
              />
              {/* Desktop (>=700px): diagonal 3D iPhone mockup */}
              <Image
                src="/dive/goals-iphone-desk.png"
                width={1528}
                height={1519}
                priority={false}
                sizes="(max-width: 700px) 80vw, 480px"
                alt="Dive's Goals screen on iPhone: a quarterly goal with its deep minutes and what moved."
                className="hidden min-[700px]:block w-full h-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
