'use client';

import React from 'react';
import { DIVE_APP_STORE_URL, DIVE_IS_TESTFLIGHT } from './constants';
import { DiveLogo, ImproveMark } from './dive-assets';

function PlanBullet({ spark = false }: { spark?: boolean }) {
  return (
    <span
      className={`absolute left-0 top-[9px] w-2 h-[1.5px] ${spark ? 'bg-[#FF02E8]' : 'bg-white/42'}`}
      aria-hidden="true"
    />
  );
}

export function DivePricing() {
  return (
    <section
      id="pricing"
      className="py-[72px] md:py-[110px] bg-[#0A0A0D] text-white border-t-[0.75px] border-b-[0.75px] border-white/12"
    >
      <div className="max-w-[1120px] mx-auto px-4 md:px-8">
        <div className="text-center max-w-[680px] mx-auto">
          <div className="inline-flex items-center py-[6px] px-[12px] rounded-[10px] bg-white/[0.09] border-[0.75px] border-white/12 text-[13px] font-medium text-white/66 mb-[18px]">
            Pricing
          </div>
          <h2 className="text-[30px] md:text-[40px] font-light leading-[1.12] tracking-[-0.02em] m-0">
            Start free, or go deeper.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mt-14 items-stretch">
          {/* Free */}
          <div className="bg-white/[0.055] border-[0.75px] border-white/12 rounded-[15px] backdrop-blur-[20px] p-[26px] flex flex-col">
            <div className="flex items-center gap-[10px] text-[17px] font-medium">Free</div>
            <div className="text-[40px] font-light mt-[18px] mb-[2px] tracking-[-0.02em]">$0</div>
            <ul className="list-none p-0 my-[22px] mb-[26px] grid gap-[10px] text-[14.5px] text-white/66 leading-[1.45]">
              <li className="pl-[18px] relative">
                <PlanBullet />A few dives with your quiet list
              </li>
              <li className="pl-[18px] relative">
                <PlanBullet />Surface, depth and pick-up lines
              </li>
              <li className="pl-[18px] relative">
                <PlanBullet />Your week in deep minutes
              </li>
            </ul>
            <a
              href={DIVE_APP_STORE_URL}
              target={DIVE_IS_TESTFLIGHT ? '_blank' : undefined}
              rel={DIVE_IS_TESTFLIGHT ? 'noopener noreferrer' : undefined}
              title={DIVE_IS_TESTFLIGHT ? 'Join Dive on TestFlight' : "Dive's App Store page"}
              className="mt-auto inline-flex items-center justify-center gap-[10px] py-[14px] px-[22px] rounded-[10px] font-medium text-[16px] text-white border-[0.75px] border-white/12 shadow-[inset_0_0_0_0.75px_rgba(255,255,255,0.12)] no-underline transition-transform active:scale-[0.97]"
            >
              Start free
            </a>
          </div>

          {/* Dive (Featured) */}
          <div
            className="border-[0.75px] border-white/15 rounded-[15px] backdrop-blur-[24px] p-[26px] flex flex-col shadow-[inset_0_0_0_1px_rgba(255,2,232,0.55)]"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              backgroundImage:
                'radial-gradient(circle at top left, rgba(255, 2, 232, 0.28), transparent 320px), linear-gradient(135deg, rgba(255, 2, 232, 0.20), rgba(255, 2, 232, 0.04))',
            }}
          >
            <div className="flex items-center gap-[10px] text-[17px] font-medium">
              <DiveLogo className="w-[26px] h-[26px] rounded-[7px]" />
              Dive
            </div>
            {DIVE_IS_TESTFLIGHT ? (
              <>
                <div className="text-[32px] sm:text-[36px] font-light mt-[18px] mb-[2px] tracking-[-0.02em] leading-[1.12]">
                  Free while testing
                </div>
                <div className="text-[13px] text-white/42">
                  <span className="line-through">$6.99</span> per month after beta
                </div>
              </>
            ) : (
              <>
                <div className="text-[40px] font-light tabular-nums mt-[18px] mb-[2px] tracking-[-0.02em]">
                  $6.99
                </div>
                <div className="text-[13px] text-white/42">per month</div>
              </>
            )}
            <ul className="list-none p-0 my-[22px] mb-[26px] grid gap-[10px] text-[14.5px] text-white/66 leading-[1.45]">
              <li className="pl-[18px] relative">
                <PlanBullet spark />Unlimited dives and routines
              </li>
              <li className="pl-[18px] relative">
                <PlanBullet spark />Goals, and pick-ups from Second Brain
              </li>
              <li className="pl-[18px] relative">
                <PlanBullet spark />iPhone, iPad and Mac in sync
              </li>
              <li className="pl-[18px] relative">
                <PlanBullet spark />Widgets and the on-device Coach
              </li>
            </ul>
            <a
              href={DIVE_APP_STORE_URL}
              target={DIVE_IS_TESTFLIGHT ? '_blank' : undefined}
              rel={DIVE_IS_TESTFLIGHT ? 'noopener noreferrer' : undefined}
              title={DIVE_IS_TESTFLIGHT ? 'Join Dive on TestFlight' : "Dive's App Store page"}
              className="mt-auto inline-flex items-center justify-center gap-[10px] py-[14px] px-[22px] rounded-[10px] font-medium text-[16px] bg-[#FF02E8] text-black no-underline transition-transform active:scale-[0.97]"
            >
              {DIVE_IS_TESTFLIGHT ? 'Join TestFlight' : 'Get Dive'}
            </a>
          </div>

          {/* Improve */}
          <div className="bg-white/[0.055] border-[0.75px] border-white/12 rounded-[15px] backdrop-blur-[20px] p-[26px] flex flex-col">
            <div className="flex items-center gap-[10px] text-[17px] font-medium">
              <span className="w-[26px] h-[26px] grid place-items-center">
                <ImproveMark className="w-4 h-[22px]" />
              </span>
              Improve
            </div>
            <div className="text-[40px] font-light tabular-nums mt-[18px] mb-[2px] tracking-[-0.02em]">
              $29.99
            </div>
            <div className="text-[13px] text-white/42">per month</div>
            <ul className="list-none p-0 my-[22px] mb-[26px] grid gap-[10px] text-[14.5px] text-white/66 leading-[1.45]">
              <li className="pl-[18px] relative">
                <PlanBullet />Every Improve app, all unlocked
              </li>
              <li className="pl-[18px] relative">
                <PlanBullet />Dive, Second Brain, Mind, Body, Money, Relationships and Work
              </li>
              <li className="pl-[18px] relative">
                <PlanBullet />One subscription across all of them
              </li>
            </ul>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="mt-auto inline-flex items-center justify-center gap-[10px] py-[14px] px-[22px] rounded-[10px] font-medium text-[16px] text-white/50 border-[0.75px] border-white/12 bg-transparent opacity-50 cursor-not-allowed"
            >
              When available
            </button>
          </div>
        </div>

        <p className="text-[13px] leading-[1.5] text-white/42 text-center mt-6 m-0">
          Prices in US dollars. Subscriptions renew monthly through the App Store until you cancel in your Apple account settings.
        </p>
      </div>
    </section>
  );
}
