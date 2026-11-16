'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DiveWaves } from './dive-assets';

const STATEMENT_WORDS =
  'You sit down to do what matters. You check your phone, and an hour is gone. Dive keeps you under.'.split(
    ' '
  );

const HIGHLIGHT_WORDS = new Set(['matters.', 'hour', 'Dive', 'under.']);

export function DiveStatement() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [litCount, setLitCount] = useState(0);
  const [waveProgress, setWaveProgress] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setLitCount(STATEMENT_WORDS.length);
      setWaveProgress(1);
      return;
    }

    const update = () => {
      const el = sectionRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height - vh;
      if (total <= 0) {
        setLitCount(STATEMENT_WORDS.length);
        setWaveProgress(1);
        return;
      }
      const p = Math.max(0, Math.min(1, -r.top / total));
      // Words light up across 0 -> 0.78, then waves rise in during the final scroll (0.75 -> 1.0)
      const wordP = Math.max(0, Math.min(1, p / 0.78));
      const waveP = Math.max(0, Math.min(1, (p - 0.75) / 0.25));
      setLitCount(Math.round(wordP * STATEMENT_WORDS.length));
      setWaveProgress(waveP);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-[300vh] motion-reduce:h-auto motion-reduce:py-[120px] bg-[#0A0A0D] text-white"
    >
      <div className="sticky top-0 h-[100dvh] motion-reduce:static motion-reduce:h-auto flex items-center justify-center overflow-hidden">
        <div className="relative z-[2] max-w-[1120px] mx-auto px-4 md:px-8">
          <p className="text-[clamp(28px,4.4vw,50px)] font-light leading-[1.22] tracking-[-0.02em] text-center max-w-[960px] mx-auto m-0">
            {STATEMENT_WORDS.map((word, idx) => {
              const isLit = idx < litCount;
              const isSpark = HIGHLIGHT_WORDS.has(word);
              return (
                <React.Fragment key={idx}>
                  <span
                    className="transition-[opacity,color] duration-200 motion-reduce:transition-none"
                    style={{
                      opacity: isLit ? 1 : 0.2,
                      color: isSpark && isLit ? '#FF02E8' : undefined,
                    }}
                  >
                    {word}
                  </span>
                  {idx < STATEMENT_WORDS.length - 1 ? ' ' : ''}
                </React.Fragment>
              );
            })}
          </p>
        </div>

        {/* Waves appear at the bottom during the final scroll of the statement */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[180px] md:h-[220px] z-[1] transition-opacity duration-300 motion-reduce:transition-none"
          style={{
            opacity: waveProgress * 0.92,
            transform: `translateY(${((1 - waveProgress) * 48).toFixed(1)}px)`,
          }}
        >
          <DiveWaves tint="#FF02E8" className="w-full h-full" />
          {/* Bottom shadow fade so the last wave melts into #0A0A0D instead of a hard edge */}
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[42%]"
            style={{
              background:
                'linear-gradient(to top, #0A0A0D 8%, rgba(10, 10, 13, 0.72) 48%, rgba(10, 10, 13, 0) 100%)',
            }}
          />
        </div>
      </div>
    </section>
  );
}
