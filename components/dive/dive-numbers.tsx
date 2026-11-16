'use client';

import React, { useEffect, useRef, useState } from 'react';

interface NumberItem {
  heading: string;
  value: string;
  label: string;
  footnote: string;
}

const ITEMS: NumberItem[] = [
  {
    heading: 'What it takes to start',
    value: '1 tap',
    label: 'no setup, no plan',
    footnote: "*Pick what you're diving into, tap Dive. No setup, no plan to fill in.",
  },
  {
    heading: 'Systems to keep up',
    value: '0 systems',
    label: 'nothing to maintain',
    footnote:
      '*No boards, no tags, no inbox to clean. Your last system died from upkeep. This one has none.',
  },
  {
    heading: 'What we learn about you',
    value: '0 bytes',
    label: 'Data Not Collected',
    footnote:
      "*Dive's App Store privacy label: Data Not Collected. Your dives never leave your devices.",
  },
];

export function DiveNumbers() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(mq.matches);
    updateMotion();
    mq.addEventListener('change', updateMotion);
    return () => mq.removeEventListener('change', updateMotion);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height - vh;
      if (total <= 0) return;

      const p = Math.max(0, Math.min(1, -r.top / total));
      const idx = Math.min(ITEMS.length - 1, Math.floor(p * ITEMS.length));
      setActiveIndex(idx);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <section id="privacy" className="bg-[#0A0A0D] text-white py-[88px]">
        <div className="max-w-[760px] mx-auto px-4 md:px-8 grid gap-20 text-center">
          {ITEMS.map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="font-normal text-[28px] md:text-[38px] text-white leading-[1.15] tracking-[-0.02em]">
                {item.heading}
              </div>
              <div
                className="font-light tabular-nums leading-[1] tracking-[-0.03em] mt-5 mb-2 bg-gradient-to-b from-[#FF02E8] to-[#FF02E8]/45 bg-clip-text text-transparent select-none"
                style={{ fontSize: 'clamp(56px, 9vw, 112px)' }}
              >
                {item.value}
              </div>
              <div className="font-normal text-[19px] md:text-[22px] text-white/55 leading-[1.3]">
                {item.label}
              </div>
              <p className="text-[13px] text-white/45 leading-[1.5] max-w-[440px] mt-10 m-0">
                {item.footnote}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="privacy"
      className="relative h-[300vh] bg-[#0A0A0D] text-white"
    >
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col items-center justify-center overflow-hidden px-4 md:px-8">
        <div className="relative w-full max-w-[820px] h-[420px] md:h-[480px] flex items-center justify-center">
          {ITEMS.map((item, idx) => {
            const isActive = idx === activeIndex;
            const translateY = isActive ? 0 : idx < activeIndex ? -16 : 16;

            return (
              <div
                key={idx}
                aria-hidden={!isActive}
                className="absolute inset-0 flex flex-col items-center justify-center text-center transition-[opacity,transform] duration-500 ease-out"
                style={{
                  opacity: isActive ? 1 : 0,
                  transform: `translateY(${translateY}px)`,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
              >
                <div className="font-normal text-[28px] md:text-[40px] text-white leading-[1.15] tracking-[-0.02em] max-w-[560px]">
                  {item.heading}
                </div>
                <div
                  className="font-light tabular-nums leading-[1] tracking-[-0.03em] mt-6 mb-2 bg-gradient-to-b from-[#FF02E8] to-[#FF02E8]/45 bg-clip-text text-transparent select-none"
                  style={{ fontSize: 'clamp(56px, 9vw, 112px)' }}
                >
                  {item.value}
                </div>
                <div className="font-normal text-[19px] md:text-[22px] text-white/55 leading-[1.3]">
                  {item.label}
                </div>
                <p className="text-[13px] text-white/45 leading-[1.5] max-w-[440px] mt-12 m-0">
                  {item.footnote}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
