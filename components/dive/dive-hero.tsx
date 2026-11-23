'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AppStoreBadges } from './dive-assets';

export function DiveHero({ liveTime = '47:12' }: { liveTime?: string }) {
  const heroRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [scrollScale, setScrollScale] = useState(1);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => setReducedMotion(mq.matches);
    updateMotion();
    mq.addEventListener('change', updateMotion);
    return () => mq.removeEventListener('change', updateMotion);
  }, []);

  // Safari-safe muted inline autoplay + pause off-screen
  useEffect(() => {
    const hero = heroRef.current;
    const video = videoRef.current;
    if (!hero || !video || reducedMotion) return;

    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');

    const tryPlay = () => {
      video.muted = true;
      video.play().catch(() => {});
    };

    tryPlay();

    // Fallback for iOS Low Power Mode until first user interaction
    const onFirstInteract = () => {
      tryPlay();
    };
    window.addEventListener('touchstart', onFirstInteract, { once: true, passive: true });
    window.addEventListener('pointerdown', onFirstInteract, { once: true, passive: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(hero);
    return () => {
      observer.disconnect();
      window.removeEventListener('touchstart', onFirstInteract);
      window.removeEventListener('pointerdown', onFirstInteract);
    };
  }, [reducedMotion]);

  // Subtle scroll zoom on the hero video
  useEffect(() => {
    if (reducedMotion) {
      setScrollScale(1);
      return;
    }

    const onScroll = () => {
      const hero = heroRef.current;
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const progress = Math.max(0, Math.min(1, -rect.top / rect.height));
      setScrollScale(1 + progress * 0.08);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [reducedMotion]);

  return (
    <header
      ref={heroRef}
      id="top"
      className="relative h-[760px] md:h-[min(100vh,880px)] w-full bg-[#0A0A0D] text-white text-center overflow-hidden"
    >
      <style>{`
        .dive-hero-video::-webkit-media-controls,
        .dive-hero-video::-webkit-media-controls-panel,
        .dive-hero-video::-webkit-media-controls-play-button,
        .dive-hero-video::-webkit-media-controls-start-playback-button,
        .dive-hero-video::-webkit-media-controls-overlay-play-button {
          display: none !important;
          opacity: 0 !important;
          -webkit-appearance: none !important;
          pointer-events: none !important;
        }
      `}</style>
      {/* 1. Text block pinned to the TOP of the hero, compact */}
      <div className="relative z-[3] pt-[100px] md:pt-[120px] px-4 md:px-8 max-w-[920px] mx-auto">
        <p className="text-[11px] md:text-[12px] uppercase tracking-[0.14em] text-white/50 mb-2.5 m-0">
          Focus &amp; App Blocker for iPhone, iPad &amp; Mac
        </p>
        <h1 className="font-light tracking-[-0.02em] text-[36px] md:text-[clamp(38px,5vw,56px)] leading-[1.06] m-0 mx-auto mb-3">
          Below the noise.
        </h1>
        <p className="text-[16px] md:text-[18px] leading-[1.5] text-white/75 max-w-[540px] mx-auto m-0">
          Your phone lives at the surface. Your real work happens underneath.
        </p>

        <AppStoreBadges className="mt-5" />
      </div>

      {/* 2. Video positioned in the open space below the badges (top: 18%, height: 82%) */}
      <div
        className="pointer-events-none absolute top-[18%] inset-x-0 h-[82%] z-[1] overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent 8%, #000 30%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 8%, #000 30%)',
        }}
      >
        <div
          className="w-full h-full will-change-transform"
          style={{
            transform: `scale(${scrollScale.toFixed(4)})`,
            transformOrigin: '50% 60%',
          }}
        >
          {reducedMotion ? (
            <img
              src="/images/dive/dive-hero-poster.png"
              alt="Diver underwater"
              className="w-full h-full object-cover object-[50%_60%] block"
            />
          ) : (
            <video
              ref={videoRef}
              src="/videos/dive-hero.mp4"
              poster="/images/dive/dive-hero-poster.png"
              autoPlay
              loop
              muted
              playsInline
              controls={false}
              disablePictureInPicture
              disableRemotePlayback
              preload="auto"
              className="dive-hero-video w-full h-full object-cover object-[50%_60%] block"
            />
          )}
        </div>

        {/* Dark vignette + smooth bottom fade into #0A0A0D */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 50% 55%, transparent 32%, rgba(10, 10, 13, 0.78) 100%), linear-gradient(to bottom, transparent 62%, #0A0A0D 100%)',
          }}
        />
      </div>

      {/* 3. Live Dive Clock centered at bottom (~44px from bottom edge) */}
      <div className="absolute bottom-[44px] left-1/2 -translate-x-1/2 z-[3] flex items-center gap-3.5 whitespace-nowrap">
        <div className="flex flex-col items-center">
          <span className="font-light text-[30px] leading-none text-white tabular-nums tracking-[-0.02em]">
            {liveTime}
          </span>
          <span className="block w-full h-[1.5px] bg-[#FF02E8] mt-1" aria-hidden="true" />
        </div>
        <span className="text-[13px] font-normal text-white/55">
          Writing · still in
        </span>
      </div>
    </header>
  );
}
