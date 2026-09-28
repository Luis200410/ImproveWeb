'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroSection, AnimatedV } from '@/components/ui/hero-section';
import CircularSplitRoll from '@/components/landing/circular-split-roll';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// 7 official ecosystem pillar colors matching I-M-P-R-O-V-E
const IMPROVE_LETTERS = [
  { letter: 'I', color: '#cc0000', name: 'Relationships' },
  { letter: 'M', color: '#6f1bd3', name: 'Mind' },
  { letter: 'P', color: '#ff02e8', name: 'Productivity' },
  { letter: 'R', color: '#2254f5', name: 'Work' },
  { letter: 'O', color: '#43b752', name: 'Body' },
  { letter: 'V', color: '#ff6900', name: 'Second Brain' },
  { letter: 'E', color: '#efb219', name: 'Money' },
];

/**
 * Smoothly interpolates an RGB/HEX color towards pure white (#FFFFFF)
 */
function interpolateToWhite(hexColor: string, t: number): string {
  const c = parseInt(hexColor.replace('#', ''), 16);
  const r1 = (c >> 16) & 255;
  const g1 = (c >> 8) & 255;
  const b1 = c & 255;

  const clampedT = Math.max(0, Math.min(1, t));
  const r = Math.round(r1 + (255 - r1) * clampedT);
  const g = Math.round(g1 + (255 - g1) * clampedT);
  const b = Math.round(b1 + (255 - b1) * clampedT);

  return `rgb(${r}, ${g}, ${b})`;
}

export default function Home() {
  const [introPhase, setIntroPhase] = React.useState<'manifesto' | 'final'>('manifesto');
  const [introComplete, setIntroComplete] = React.useState(false);
  const [vComplete, setVComplete] = React.useState(false);

  const heroRef = React.useRef<HTMLDivElement>(null);
  const slotRef = React.useRef<HTMLDivElement>(null);
  const ecosystemRef = React.useRef<HTMLElement>(null);
  const titleContainerRef = React.useRef<HTMLDivElement>(null);

  // Instantly position title in the exact hero slot when final frame appears (before scrolling unlocks)
  React.useEffect(() => {
    if (typeof window === 'undefined' || introPhase !== 'final') return;

    const positionTitleInSlot = () => {
      const slotEl = slotRef.current;
      const titleEl = titleContainerRef.current;
      if (!slotEl || !titleEl) return;
      const rect = slotEl.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      if (top > 0 && window.scrollY === 0) {
        titleEl.style.top = `${top}px`;
        // Explicitly guarantee all letters are 100% in their vibrant brand colors in Frame 1
        const letterSpans = titleEl.querySelectorAll<HTMLElement>('.improve-letter-char');
        letterSpans.forEach((span, i) => {
          span.style.color = IMPROVE_LETTERS[i]?.color || '#FFFFFF';
          span.style.textShadow = 'none';
          span.style.transform = 'scale(1)';
        });
      }
    };

    positionTitleInSlot();
    const t1 = setTimeout(positionTitleInSlot, 40);
    const t2 = setTimeout(positionTitleInSlot, 160);

    window.addEventListener('resize', positionTitleInSlot);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', positionTitleInSlot);
    };
  }, [introPhase]);

  // Block page scrolling completely until the hero intro is finished
  React.useEffect(() => {
    if (!introComplete) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      window.scrollTo(0, 0);
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';

      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          ScrollTrigger.refresh();
        }
      }, 350);
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [introComplete]);

  // When first frame animation ends (V finishes falling), unlock scrolling while KEEPING rainbow colors
  const handleVComplete = React.useCallback(() => {
    setVComplete(true);
    setIntroComplete(true);
  }, []);

  const handleHeroIntroComplete = React.useCallback(() => {
    setIntroComplete(true);
  }, []);

  // High-performance direct DOM handler for app roll letter illumination in Frame 2
  const handleActiveChange = React.useCallback((idx: number, isRolling: boolean) => {
    const titleEl = titleContainerRef.current;
    if (!titleEl) return;

    // Do NOT touch letters if not rolling in Frame 2 (prevents whitening letters during Frame 1 or on mount)
    if (!isRolling) return;

    const letterSpans = titleEl.querySelectorAll<HTMLElement>('.improve-letter-char');
    if (!letterSpans || letterSpans.length === 0) return;

    letterSpans.forEach((span, i) => {
      const baseColor = IMPROVE_LETTERS[i]?.color || '#FFFFFF';
      if (i === idx) {
        // Active app's letter lights up in vibrant brand color with glow and scale!
        span.style.color = baseColor;
        span.style.textShadow = `0 0 35px ${baseColor}bb, 0 0 70px ${baseColor}66`;
        span.style.transform = 'scale(1.10) translateY(-2px)';
      } else {
        // Inactive letters stay solid crisp white with 100% opacity in Frame 2
        span.style.color = '#FFFFFF';
        span.style.textShadow = '0 0 16px rgba(255, 255, 255, 0.2)';
        span.style.transform = 'scale(1)';
      }
    });
  }, []);

  // GSAP ScrollTrigger: Controls title transition from hero to Frame 2 and exit
  React.useEffect(() => {
    if (typeof window === 'undefined' || !introComplete) return;

    const heroEl = heroRef.current;
    const titleEl = titleContainerRef.current;
    const ecoEl = ecosystemRef.current;
    const slotEl = slotRef.current;

    if (!heroEl || !titleEl) return;

    const letterSpans = titleEl.querySelectorAll<HTMLElement>('.improve-letter-char');

    // Calculate initial top position matching the hero slot
    const getHeroSlotTop = () => {
      if (slotEl) {
        const rect = slotEl.getBoundingClientRect();
        return rect.top + window.scrollY;
      }
      return window.innerHeight * 0.42;
    };

    const initialTop = getHeroSlotTop();
    const dockedTop = 84; // top-20 below fixed navbar

    // Set initial position
    titleEl.style.top = `${initialTop}px`;
    titleEl.style.transform = 'scale(1)';

    // ScrollTrigger 1: Smoothly scrolls the title from hero down into Frame 2 docked position (84px).
    // - On scroll down: smoothly transitions letters from rainbow colors to white, docking at 84px.
    // - On scroll up: smoothly transitions letters BACK from white to their original vibrant rainbow colors!
    const stHero = ScrollTrigger.create({
      trigger: heroEl,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        const p = self.progress;

        // Position & Scale with a solid buffer zone:
        // Fully docks at 84px by p = 0.65.
        // Between p = 0.65 and 1.0, title is firmly locked at dockedTop (84px) and scale(0.84).
        const dockP = Math.min(1, Math.max(0, p / 0.65));
        const currentTop = initialTop + (dockedTop - initialTop) * dockP;
        const currentScale = 1.0 - 0.16 * dockP;
        titleEl.style.top = `${currentTop}px`;
        titleEl.style.transform = `scale(${currentScale})`;

        // Color transition on scroll down / scroll up:
        // When dockP <= 0.05 (in Frame 1): 100% brand rainbow colors!
        // As dockP increases (scrolling down): smoothly interpolates to pure white!
        // When dockP >= 0.60: 100% pure white!
        // When scrolling back up: smoothly takes rainbow colors again!
        if (letterSpans && letterSpans.length > 0 && dockP < 1) {
          letterSpans.forEach((span, i) => {
            const baseColor = IMPROVE_LETTERS[i]?.color || '#FFFFFF';
            if (dockP <= 0.05) {
              span.style.color = baseColor;
              span.style.textShadow = 'none';
              span.style.transform = 'scale(1)';
            } else if (dockP >= 0.60) {
              span.style.color = '#FFFFFF';
              span.style.textShadow = '0 0 16px rgba(255, 255, 255, 0.2)';
              span.style.transform = 'scale(1)';
            } else {
              const blendP = (dockP - 0.05) / 0.55;
              span.style.color = interpolateToWhite(baseColor, blendP);
              span.style.textShadow = `0 0 ${16 * blendP}px rgba(255, 255, 255, ${0.2 * blendP})`;
              span.style.transform = 'scale(1)';
            }
          });
        }
      },
    });

    // ScrollTrigger 2: Scroll off title when leaving ecosystem into the footer
    let stExit: ScrollTrigger | null = null;
    if (ecoEl) {
      stExit = ScrollTrigger.create({
        trigger: ecoEl,
        start: 'bottom bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          if (self.progress > 0) {
            titleEl.style.transform = `translateY(${-self.progress * 140}px) scale(0.84)`;
            titleEl.style.opacity = `${Math.max(0, 1 - self.progress * 1.5)}`;
          }
        },
      });
    }

    const onResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      stHero.kill();
      stExit?.kill();
    };
  }, [introComplete]);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-white selection:text-black relative">
      {/* THE ONE AND ONLY UNIFIED IMPROVE TITLE (never duplicate) */}
      <div
        ref={titleContainerRef}
        id="unified-improve-title"
        className="fixed left-0 right-0 z-30 text-center pointer-events-none select-none px-4 will-change-[top,transform]"
        style={{
          opacity: introPhase === 'final' ? 1 : 0,
          visibility: introPhase === 'final' ? 'visible' : 'hidden',
          transition: introPhase === 'final' ? 'opacity 0.6s ease' : 'none',
        }}
      >
        <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight leading-none inline-flex items-center justify-center selection:bg-white selection:text-black">
          {IMPROVE_LETTERS.map((item, idx) => (
            <span
              key={idx}
              className="improve-letter-char inline-block transition-transform duration-300"
              style={{
                color: item.color,
                opacity: 1,
              }}
            >
              {item.letter === 'V' && introPhase === 'final' && !vComplete ? (
                <AnimatedV
                  color={item.color}
                  glow={false}
                  onComplete={handleVComplete}
                />
              ) : (
                item.letter
              )}
            </span>
          ))}
        </h1>
      </div>

      {/* First Frame: Manifesto Typewriter into Final Hero Frame */}
      <div ref={heroRef} className="relative w-full">
        <HeroSection
          onPhaseChange={(phase) => {
            setIntroPhase(phase);
          }}
          onIntroComplete={handleHeroIntroComplete}
          renderTitleSlot={
            <div
              id="hero-title-slot"
              ref={slotRef}
              className="h-20 sm:h-28 md:h-36 mb-6 sm:mb-8 w-full flex items-center justify-center pointer-events-none select-none"
              aria-hidden="true"
            />
          }
        />
      </div>

      {/* 3D App Ecosystem Roll (reveals once intro finishes) */}
      <section
        id="ecosystem"
        ref={ecosystemRef}
        className={`w-full relative transition-opacity duration-700 ${
          introComplete ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <CircularSplitRoll onActiveChange={handleActiveChange} />
      </section>
    </div>
  );
}
