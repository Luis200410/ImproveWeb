'use client'

import CircularSplitRoll from '@/components/landing/circular-split-roll';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 3D App Ecosystem Roll */}
      <section className="pt-20 pb-10 px-6 relative overflow-hidden">
        <CircularSplitRoll />
      </section>
    </div>
  );
}
