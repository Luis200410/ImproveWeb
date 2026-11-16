'use client';

import React from 'react';

const WEEK_DATA: ([number, number] | null)[] = [
  [60, 40],
  [0, 0],
  [90, 30],
  [45, 50],
  [0, 0],
  [85, 0],
  null,
];

const QUARTER_BARS = [40, 55, 30, 70, 62, 48, 80, 66, 0, 0, 0, 0, 0];

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
    <section className="py-[72px] md:py-[110px] bg-[#0A0A0D] text-white">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-2 gap-[40px] md:gap-[64px] items-center">
        {/* Left Copy */}
        <div>
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

        {/* Right Glass Cards */}
        <div className="grid gap-4">
          {/* Card 1: Weekly */}
          <div className="bg-white/[0.055] border-[0.75px] border-white/12 rounded-[15px] backdrop-blur-[20px] p-[22px]">
            <div className="text-[13px] leading-[1.5] text-white/42">Deep this week</div>
            <div className="text-[44px] font-light tabular-nums tracking-[-0.02em]">
              6 h 40 min
            </div>
            <div className="flex items-end gap-[10px] h-[110px] mt-4">
              {WEEK_DATA.map((d, i) => {
                if (!d) return <div key={i} className="flex-1 h-full" />;
                if (!d[0] && !d[1]) {
                  return (
                    <div key={i} className="flex-1 flex flex-col justify-end h-full">
                      <i className="block h-0 border-b-[0.75px] border-white/12" />
                    </div>
                  );
                }
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end gap-[2px] h-full">
                    <i
                      className="block rounded-[3px] bg-[#2254F5]"
                      style={{ height: `${d[1] * 0.7}px` }}
                    />
                    <i
                      className="block rounded-[3px] bg-[#6F1BD3]"
                      style={{ height: `${d[0] * 0.7}px` }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex gap-[10px] mt-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, idx) => (
                <span key={idx} className="flex-1 text-center text-[11px] text-white/42">
                  {day}
                </span>
              ))}
            </div>
          </div>

          {/* Card 2: Q4 Goal */}
          <div className="bg-white/[0.055] border-[0.75px] border-white/12 rounded-[15px] backdrop-blur-[20px] p-[22px]">
            <div className="text-[13px] leading-[1.5] text-white/42">Q4 goal</div>
            <div className="text-[18px] font-medium mt-1">Finish the thesis draft</div>
            <div className="text-[44px] font-light tabular-nums tracking-[-0.02em] mt-[6px]">
              1,240<span className="text-[15px] text-white/42"> deep min</span>
            </div>

            <div className="flex items-end gap-[5px] h-[64px] mt-[18px] mb-[6px]">
              {QUARTER_BARS.map((v, i) =>
                i < 8 ? (
                  <i
                    key={i}
                    className="flex-1 rounded-[3px] bg-[#FF02E8] opacity-85 block"
                    style={{ height: `${v}%` }}
                  />
                ) : (
                  <i
                    key={i}
                    className="flex-1 border-b-[0.75px] border-white/12 block"
                  />
                )
              )}
            </div>

            <div className="flex justify-between items-center py-[10px] border-t-[0.75px] border-white/12 text-[14px]">
              <span>
                <span className="inline-block w-2 h-2 rounded-[3px] mr-2 bg-[#6F1BD3]" />
                Writing
              </span>
              <span className="tabular-nums text-white/66">820 min</span>
            </div>
            <div className="flex justify-between items-center py-[10px] border-t-[0.75px] border-white/12 text-[14px]">
              <span>
                <span className="inline-block w-2 h-2 rounded-[3px] mr-2 bg-[#2254F5]" />
                Study
              </span>
              <span className="tabular-nums text-white/66">420 min</span>
            </div>

            <div className="text-[13px] leading-[1.5] text-white/42 mt-3">What moved</div>
            <div className="rounded-[12px] shadow-[inset_0_0_0_0.75px_rgba(255,105,0,0.55)] py-1 px-3 mt-[10px]">
              <div className="flex justify-between items-center py-[10px] text-[14px]">
                <span>Lit review done</span>
                <span className="text-[13px] text-white/42">Nov 12</span>
              </div>
              <div className="flex justify-between items-center py-[10px] border-t-[0.75px] border-white/12 text-[14px]">
                <span>Chapter 2 outline</span>
                <span className="text-[13px] text-white/42">Nov 3</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
