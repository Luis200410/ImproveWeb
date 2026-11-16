'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Instagram,
  Youtube,
  Twitter,
  Music2,
  ExternalLink,
} from 'lucide-react';

export type DiveVoicePlatform = 'instagram' | 'tiktok' | 'youtube' | 'x' | 'other';

export interface DiveVoice {
  id: string;
  name: string;
  city: string | null;
  country_code: string | null;
  role: string | null;
  photo_url: string;
  link_url: string;
  platform: DiveVoicePlatform;
  quote: string | null;
  gifted: boolean;
  consent: boolean;
  published: boolean;
  sort_order: number;
  created_at: string;
}

function countryCodeToFlag(code?: string | null): string {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  const points = [...upper].map((ch) => 127397 + ch.charCodeAt(0));
  return String.fromCodePoint(...points);
}

function PlatformIcon({ platform }: { platform: DiveVoicePlatform }) {
  const cls = 'w-[18px] h-[18px] text-white/70';
  switch (platform) {
    case 'instagram':
      return <Instagram className={cls} strokeWidth={1.6} />;
    case 'youtube':
      return <Youtube className={cls} strokeWidth={1.6} />;
    case 'x':
      return <Twitter className={cls} strokeWidth={1.6} />;
    case 'tiktok':
      return <Music2 className={cls} strokeWidth={1.6} />;
    default:
      return <ExternalLink className={cls} strokeWidth={1.6} />;
  }
}

function VoiceCard({ voice }: { voice: DiveVoice }) {
  const flag = countryCodeToFlag(voice.country_code);
  const hasLocation = Boolean(flag || voice.city);

  return (
    <a
      href={voice.link_url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex-none w-[78vw] md:w-[280px] aspect-[4/5] md:h-[350px] rounded-[15px] overflow-hidden p-7 flex flex-col justify-end bg-white/[0.01] border-[0.75px] border-white/10 text-white no-underline snap-center transition-transform duration-[250ms] ease-out hover:scale-[1.03]"
    >
      {/* Photo */}
      <img
        src={voice.photo_url}
        alt={voice.name}
        className="absolute inset-0 w-full h-full object-cover scale-105"
      />

      {/* Bottom Blur Copy */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, #000 40%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 40%)',
        }}
      >
        <img
          src={voice.photo_url}
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-bottom scale-110 blur-[24px]"
        />
      </div>

      {/* Dark Wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, transparent 40%, rgba(10, 10, 13, 0.75) 100%)',
        }}
      />

      {/* Platform Icon Top-Right */}
      <div className="absolute top-5 right-5 z-[2]">
        <PlatformIcon platform={voice.platform} />
      </div>

      {/* Text (Left-aligned on top) */}
      <div className="relative z-[2] text-left flex flex-col items-start">
        <div
          className="font-medium text-[19px] leading-[1.2] bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(to bottom, #FFFFFF, rgba(255, 255, 255, 0.7))',
          }}
        >
          {voice.name}
        </div>

        {hasLocation && (
          <div className="my-[10px] inline-flex items-center gap-[6px] py-[5px] px-[10px] rounded-[10px] bg-white/[0.12] backdrop-blur-[10px] font-medium text-[15px] text-white/80 leading-none">
            {flag && <span>{flag}</span>}
            {voice.city && <span>{voice.city}</span>}
          </div>
        )}

        {voice.role && (
          <div className="font-medium text-[17px] leading-[1.3] text-white/50">
            {voice.role}
          </div>
        )}

        {voice.gifted && (
          <div className="text-[12px] text-white/45 leading-[1.3] mt-1">
            Got Dive for free
          </div>
        )}
      </div>
    </a>
  );
}

export function DiveVoices({ voices }: { voices: DiveVoice[] }) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const inViewRef = useRef(false);
  const pausedRef = useRef(false);
  const offsetRef = useRef(0);
  const boostRef = useRef(0);
  const lastScrollYRef = useRef(0);
  const lastScrollTimeRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => {
      setReducedMotion(mq.matches);
      if (mq.matches) setVisible(true);
    };
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    lastScrollYRef.current = window.scrollY;
    lastScrollTimeRef.current = performance.now();

    const onScroll = () => {
      const now = performance.now();
      const dy = Math.abs(window.scrollY - lastScrollYRef.current);
      const dt = Math.max(16, now - lastScrollTimeRef.current);
      const vel = (dy / dt) * 1000;
      boostRef.current = Math.max(boostRef.current, Math.min(vel * 0.3, 120));
      lastScrollYRef.current = window.scrollY;
      lastScrollTimeRef.current = now;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reducedMotion]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.08 }
    );
    observer.observe(section);

    if (reducedMotion) {
      return () => observer.disconnect();
    }

    let rafId = 0;
    let prevTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - prevTime) / 1000);
      prevTime = now;

      boostRef.current *= Math.exp(-dt / 0.25);
      if (boostRef.current < 0.2) boostRef.current = 0;

      if (inViewRef.current && !pausedRef.current) {
        const speed = 40 + boostRef.current;
        const track = trackRef.current;
        if (track) {
          const half = track.scrollWidth / 2;
          if (half > 0) {
            offsetRef.current -= speed * dt;
            if (offsetRef.current <= -half) offsetRef.current += half;
            track.style.transform = `translateX(${offsetRef.current.toFixed(2)}px)`;
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [reducedMotion]);

  if (!voices || voices.length < 3) {
    return null;
  }

  return (
    <section ref={sectionRef} className="py-[72px] md:py-[110px] bg-[#0A0A0D] text-white overflow-hidden">
      <div className="max-w-[1120px] mx-auto px-4 md:px-8 text-center mb-16">
        <h2
          className="font-medium tracking-[-0.02em] leading-[1.06] bg-clip-text text-transparent m-0"
          style={{
            fontSize: 'clamp(44px, 6vw, 72px)',
            backgroundImage: 'linear-gradient(to bottom, #FFFFFF, rgba(255, 255, 255, 0.7))',
          }}
        >
          From underneath.
        </h2>
        <p className="font-normal text-[20px] leading-[1.55] text-white/[0.66] max-w-[520px] mx-auto mt-5 m-0">
          Real people, real dives. Tap a card to hear it from them.
        </p>
      </div>

      {/* Mobile & Reduced Motion: swipeable scroll-snap row */}
      <div
        className={`${
          reducedMotion ? 'flex' : 'flex md:hidden'
        } gap-6 overflow-x-auto snap-x snap-mandatory px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
      >
        {voices.map((voice) => (
          <VoiceCard key={voice.id} voice={voice} />
        ))}
      </div>

      {/* Desktop & Tablet: rAF marquee moving LEFT with edge fade */}
      {!reducedMotion && (
        <div
          className="hidden md:block relative w-full overflow-hidden transition-[opacity,transform] duration-[600ms] ease-out"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
            WebkitMaskImage:
              'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
          }}
          onMouseEnter={() => {
            pausedRef.current = true;
          }}
          onMouseLeave={() => {
            pausedRef.current = false;
          }}
        >
          <div ref={trackRef} className="flex w-max gap-6 will-change-transform">
            {[...voices, ...voices].map((voice, idx) => (
              <VoiceCard key={`${voice.id}-${idx}`} voice={voice} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
