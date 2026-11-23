'use client';

import React, { useEffect, useRef, useState } from 'react';
import { DIVE_APP_STORE_URL, DIVE_IS_TESTFLIGHT } from './constants';

export function DiveLogo({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 1024 1024"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <rect width="1024" height="1024" fill="#0A0A0D" />
      <path
        d="M0 450 C 170 410 340 490 512 450 S 854 490 1024 450 L 1024 1024 L 0 1024 Z"
        fill="#FF02E8"
        fillOpacity="0.85"
      />
      <path
        d="M0 560 C 170 520 340 600 512 560 S 854 600 1024 560 L 1024 1024 L 0 1024 Z"
        fill="#A0068F"
      />
      <path
        d="M0 720 C 170 680 340 760 512 720 S 854 760 1024 720 L 1024 1024 L 0 1024 Z"
        fill="#3A0636"
      />
    </svg>
  );
}

const IMPROVE_BARS: [number, number, number, string][] = [
  [314, 218, 707, '#CC0000'],
  [378, 395, 570, '#6F1BD3'],
  [442, 395, 847, '#FF02E8'],
  [505, 315, 491, '#2254F5'],
  [569, 349, 524, '#43B752'],
  [633, 395, 648, '#FF6900'],
  [697, 283, 491, '#EFB219'],
];

export function ImproveMark({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="300 200 470 670"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {IMPROVE_BARS.map(([x, y, b, c], i) => (
        <rect key={i} x={x} y={y} width="54" height={b - y} fill={c} />
      ))}
    </svg>
  );
}

export function WaveStackIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M3 8q4.5-3 9 0t9 0M3 13q4.5-3 9 0t9 0M3 18q4.5-3 9 0t9 0" />
    </svg>
  );
}

export function PenIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20l4-1 10-10-3-3L5 16z" />
      <path d="M14 7l3 3" />
    </svg>
  );
}

export function BookIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z" />
      <path d="M12 6v14" />
    </svg>
  );
}

function mixHex(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = ((n >> 16) * k) | 0;
  const g = (((n >> 8) & 255) * k) | 0;
  const b = ((n & 255) * k) | 0;
  return `rgb(${r},${g},${b})`;
}

export function DiveWaves({
  tint = '#FF02E8',
  soft = false,
  className = '',
  style,
}: {
  tint?: string;
  soft?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const t0 = performance.now();
    let rafId = 0;

    const cols: [string, number][] = [
      [tint, soft ? 0.35 : 0.85],
      [mixHex(tint, 0.63), soft ? 0.5 : 1],
      [mixHex(tint, 0.23), 1],
    ];
    const tops = [0.1, 0.36, 0.64];
    const speeds = [0.08, 0.06, 0.045];

    const draw = (now: number) => {
      const t = reduce ? 0 : (now - t0) / 1000;
      const W = svg.clientWidth;
      const H = svg.clientHeight;
      if (W > 0 && H > 0) {
        svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
        const amp = Math.min(12, H * 0.05);
        const paths = cols.map(([c, o], b) => {
          const y = H * tops[b];
          const sp = speeds[b];
          const ph = b * 1.7;
          let d = `M0 ${H} L0 ${y}`;
          for (let x = 0; x <= W; x += 8) {
            const py = y + amp * Math.sin((x / W) * Math.PI * 2 + t * sp * Math.PI * 2 + ph);
            d += ` L${x} ${py.toFixed(1)}`;
          }
          return `<path d="${d} L${W} ${H} Z" fill="${c}" fill-opacity="${o}"/>`;
        });
        svg.innerHTML = paths.join('');
      }
      if (!reduce) {
        rafId = requestAnimationFrame(draw);
      }
    };

    rafId = requestAnimationFrame(draw);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [tint, soft]);

  return (
    <svg
      ref={svgRef}
      className={`pointer-events-none block ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

export function useDiveLiveTimer(initialSeconds = 47 * 60 + 12): string {
  const [secs, setSecs] = useState(initialSeconds);

  useEffect(() => {
    const id = setInterval(() => {
      setSecs((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const mins = Math.floor(secs / 60);
  const rem = String(secs % 60).padStart(2, '0');
  return `${mins}:${rem}`;
}

export function AppStoreBadges({ className = '' }: { className?: string }) {
  if (DIVE_IS_TESTFLIGHT) {
    return (
      <div className={`flex flex-wrap justify-center items-center gap-3 ${className}`}>
        <a
          href={DIVE_APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          title="Join Dive on TestFlight"
          className="inline-flex items-center gap-2.5 py-[12px] px-[22px] rounded-[12px] bg-[#FF02E8] text-black font-medium text-[15px] no-underline shadow-[0_8px_28px_rgba(255,2,232,0.28)] transition-transform hover:brightness-105 active:scale-[0.97]"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-[18px] h-[18px]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Join TestFlight Beta</span>
          <span className="text-[12px] font-normal text-black/70 border-l border-black/20 pl-2.5">
            iPhone · iPad · Mac
          </span>
        </a>
      </div>
    );
  }

  return (
    <div className={`flex flex-wrap justify-center items-center gap-3 ${className}`}>
      <a
        href={DIVE_APP_STORE_URL}
        title="Dive's App Store page"
        className="inline-block transition-transform active:scale-[0.97]"
      >
        <img
          src="/images/dive/app-store-badge.svg"
          alt="Download on the App Store"
          className="h-[46px] sm:h-[50px] w-auto block"
        />
      </a>

      <a
        href={DIVE_APP_STORE_URL}
        title="Dive's Mac App Store page"
        className="inline-block transition-transform active:scale-[0.97]"
      >
        <img
          src="/images/dive/mac-app-store-badge.svg"
          alt="Download on the Mac App Store"
          className="h-[46px] sm:h-[50px] w-auto block"
        />
      </a>
    </div>
  );
}
