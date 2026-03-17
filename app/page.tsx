'use client'

import Link from "next/link";
import { Bebas_Neue } from "@/lib/font-shim";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { EightSystemsAccordion } from "@/components/ui/interactive-image-accordion";
import { ImproveLogo } from "@/components/ui/improve-logo";
import Image from "next/image";

import { SystemConvergenceAnimation } from "@/components/ui/system-convergence-animation";
import { PotentialBridgeAnimation } from "@/components/ui/potential-bridge-animation";
import { PassiveDataAnimation } from "@/components/ui/passive-data-animation";
import { PracticalLabAnimation } from "@/components/ui/practical-lab-animation";
import { EvolutionCtaAnimation } from '@/components/ui/evolution-cta-animation';


const bebas = Bebas_Neue({ subsets: ["latin"] });

const improveWords = [
  { letter: "I", word: "Intentional", description: "Living" },
  { letter: "M", word: "Mastery", description: "Seeking" },
  { letter: "P", word: "Progress", description: "Tracking" },
  { letter: "R", word: "Refinement", description: "Continuous" },
  { letter: "O", word: "Optimization", description: "Personal" },
  { letter: "V", word: "Vision", description: "Driven" },
  { letter: "E", word: "Excellence", description: "Pursuing" },
];

export default function Home() {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');
  const [currentTime, setCurrentTime] = useState(0);
  const [hasScrolledToBridge, setHasScrolledToBridge] = useState(false);
  const [hasScrolledToSystems, setHasScrolledToSystems] = useState(false);
  const [hasScrolledToGathering, setHasScrolledToGathering] = useState(false);
  const [hasScrolledToLab, setHasScrolledToLab] = useState(false);
  const [hasScrolledToEvolution, setHasScrolledToEvolution] = useState(false);
  const bridgeRef = useRef<HTMLElement>(null);
  const systemsRef = useRef<HTMLDivElement>(null);
  const gatheringRef = useRef<HTMLDivElement>(null);
  const labRef = useRef<HTMLDivElement>(null);
  const evolutionRef = useRef<HTMLDivElement>(null);

  const scrollToBridge = () => {
    if (bridgeRef.current) {
      bridgeRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSystems = () => {
    if (systemsRef.current) {
      systemsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToGathering = () => {
    if (gatheringRef.current) {
      gatheringRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToLab = () => {
    if (labRef.current) {
      labRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToEvolution = () => {
    if (evolutionRef.current) {
      evolutionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };


  // Automated cinematic sequence: Orchestrating the entire landing page flow
  useEffect(() => {
    // 1. Scroll to Bridge at 30 seconds
    if (currentTime >= 30 && !hasScrolledToBridge) {
      setHasScrolledToBridge(true);
      scrollToBridge();
    }
    
    // 2. Scroll to 8 Systems at 36 seconds (when audio naming starts)
    if (currentTime >= 36 && !hasScrolledToSystems) {
      scrollToSystems();
      setHasScrolledToSystems(true);
    }

    // 3. Scroll to The Gathering at 52 seconds
    if (currentTime >= 52 && !hasScrolledToGathering) {
      scrollToGathering();
      setHasScrolledToGathering(true);
    }

    // 4. Scroll to Practical Lab at 58 seconds
    if (currentTime >= 58 && !hasScrolledToLab) {
      scrollToLab();
      setHasScrolledToLab(true);
    }

    // 5. Final CTA at 70 seconds (1:10)
    if (currentTime >= 70 && !hasScrolledToEvolution) {
      scrollToEvolution();
      setHasScrolledToEvolution(true);
    }
  }, [currentTime, hasScrolledToBridge, hasScrolledToSystems, hasScrolledToGathering, hasScrolledToLab, hasScrolledToEvolution]);

  // Asset URLs
  const currentMedia = {
    src: '/logo_final.png',
    background: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
    title: 'IMPROVE Integrity',
    date: 'EST. MMXXIV',
    scrollToExpand: 'SCROLL TO START'
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 1. Hero: System Convergence Animation */}
      <section className="w-full px-6 pt-12 md:pt-20 pb-0 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <SystemConvergenceAnimation 
            onComplete={scrollToBridge} 
            onTimeUpdate={setCurrentTime}
          />
        </div>
      </section>

      {/* 2. The Bridge Animation (Second 34 sequence) */}
      <section ref={bridgeRef} className="relative w-full px-6 pb-20 pt-20 min-h-screen flex items-center justify-center border-t border-white/5">
        <div className="max-w-4xl mx-auto w-full">
          <PotentialBridgeAnimation />
        </div>
      </section>

      {/* 3. The Eight Systems Preview (Moved Up) */}
      <section ref={systemsRef} className="py-32 px-6 relative border-t border-white/10 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="mt-8">
            <EightSystemsAccordion activeTime={currentTime} />
          </div>
        </div>
      </section>

      {/* 4. The Gathering (Passive Data Animation) */}
      <section ref={gatheringRef}>
        <PassiveDataAnimation activeTime={currentTime} />
      </section>

      {/* 5. Practical Lab (Dashboard Animation) */}
      <section ref={labRef} className="pb-32">
        <PracticalLabAnimation />
      </section>

      {/* 6. Evolution CTA (Final sequence) */}
      <section ref={evolutionRef}>
        <EvolutionCtaAnimation activeTime={currentTime} />
      </section>

    </div>
  );
}
