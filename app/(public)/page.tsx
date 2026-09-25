'use client'

import CircularSplitRoll from '@/components/ui/circular-split-roll';
import { PassiveDataAnimation } from "@/components/ui/passive-data-animation";
import { PracticalLabAnimation } from "@/components/ui/practical-lab-animation";
import { TheSystemSection } from '@/components/landing/the-system-section';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 3D App Ecosystem Roll */}
      <section className="pt-20 pb-10 px-6 relative border-b border-white/10 overflow-hidden">
        <CircularSplitRoll />
      </section>

      {/* Passive Data Animation */}
      <section>
        <PassiveDataAnimation activeTime={0} />
      </section>

      {/* Practical Lab */}
      <section className="pb-32">
        <PracticalLabAnimation />
      </section>

      {/* The System section */}
      <TheSystemSection />
    </div>
  );
}
