'use client';

import * as React from 'react';
import { HeroSection } from '@/components/ui/hero-section';
import CircularSplitRoll from '@/components/landing/circular-split-roll';

export default function Home() {
  const [introComplete, setIntroComplete] = React.useState(false);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* First Frame: Manifesto Typewriter into Final Hero Frame */}
      <HeroSection onIntroComplete={() => setIntroComplete(true)} />

      {/* 3D App Ecosystem Roll (reveals after intro finishes) */}
      <section
        id="ecosystem"
        className={`pt-12 pb-16 px-6 relative overflow-hidden transition-all duration-1000 ${
          introComplete ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-8"
        }`}
      >
        <CircularSplitRoll />
      </section>
    </div>
  );
}
