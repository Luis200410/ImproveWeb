'use client'

import React from 'react'
import { ProblemsStoryShowcase } from '@/components/apps/problems-story-showcase'
import Timeline from '@/components/general/timeline'

export function ProductivityShowcase() {
  return (
    <div className="w-full bg-transparent text-[var(--label)] border-t border-[var(--separator)]">
      {/* 1. The Problems: Left Text + Right Instagram Stories Phone Showcase */}
      <section className="w-full">
        <ProblemsStoryShowcase />
      </section>

      {/* 2. Timeline GSAP Section with Pinned Title Header */}
      <Timeline 
        sectionTitle="Block The Noise"
      />
    </div>
  )
}
