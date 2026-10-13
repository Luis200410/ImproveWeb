'use client';

import * as React from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HeroSection } from '@/components/ui/hero-section';
import CircularSplitRoll from '@/components/landing/circular-split-roll';
import { StorySection } from '@/components/landing/story-section';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Home() {
  const [introComplete, setIntroComplete] = React.useState(false);

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

  const handleHeroIntroComplete = React.useCallback(() => {
    setIntroComplete(true);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-white selection:text-black relative">
      {/* First Frame: Manifesto Typewriter into Final Hero Frame with IMPROVE title staying at the top */}
      <div className="relative w-full">
        <HeroSection onIntroComplete={handleHeroIntroComplete} />
      </div>

      {/* Frame 2: 3D App Ecosystem Roll (clean and unobstructed, no title in Frame 2) */}
      <section
        id="ecosystem"
        className={`w-full relative transition-opacity duration-700 ${
          introComplete ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <CircularSplitRoll />
      </section>

      {/* Frame 3: The Architecture / Blueprint (The Problem, The Ecosystem, The Sanctuary, The Investment) */}
      <section
        id="story"
        className={`w-full relative bg-transparent transition-opacity duration-700 ${
          introComplete ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <StorySection />
      </section>
    </div>
  );
}
