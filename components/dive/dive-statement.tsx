'use client';

import React, { useEffect, useRef, useState } from 'react';

const STATEMENT_WORDS =
  'You sit down to do what matters. You check your phone, and an hour is gone. Dive keeps you under.'.split(
    ' '
  );

export function DiveStatement() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [litCount, setLitCount] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setLitCount(STATEMENT_WORDS.length);
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
        return;
      }
      const p = Math.max(0, Math.min(1, -r.top / total));
      setLitCount(Math.round(p * STATEMENT_WORDS.length));
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
              const isDive = word === 'Dive';
              return (
                <React.Fragment key={idx}>
                  <span
                    className="transition-[opacity,color] duration-200 motion-reduce:transition-none"
                    style={{
                      opacity: isLit ? 1 : 0.2,
                      color: isDive && isLit ? '#FF02E8' : '#FFFFFF',
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
      </div>
    </section>
  );
}
