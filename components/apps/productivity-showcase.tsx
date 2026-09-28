'use client'

import React from 'react'
import CTAWithVerticalMarquee from '@/components/general/cta-with-text-marquee'
import { CollectionSurfer } from '@/components/general/collection-surfer'
import Timeline from '@/components/general/timeline'

export function ProductivityShowcase() {
  return (
    <div className="w-full bg-transparent text-[var(--label)] border-t border-[var(--separator)]">
      {/* 1. Goal Execution Framework CollectionSurfer 3D Experience */}
      <section className="w-full">
        <CollectionSurfer 
          headerKicker="GOAL EXECUTION FRAMEWORK" 
          headerTitle="Define the goal."
          headerDescription="Your 4 Yearly Targets live in your Second Brain. IMPROVE automatically reverse-engineers those Macro Goals into Actionable Tasks, embedding those specific tasks directly inside the Daily Habits required to achieve them."
        />
      </section>

      {/* 2. Timeline GSAP Section with Pinned Title Header */}
      <Timeline 
        sectionTitle="Block The Noise"
      />

      {/* Bottom Marquee CTA Section */}
      <section className="w-full border-t border-[var(--separator)]">
        <CTAWithVerticalMarquee />
      </section>
    </div>
  )
}
