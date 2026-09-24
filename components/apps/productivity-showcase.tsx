'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Target, 
  ArrowRight, 
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

import { ShieldMotionExhibit } from './exhibits/shield-motion-exhibit'
import { TimelineSnapExhibit } from './exhibits/timeline-snap-exhibit'
import { UltradianWaveExhibit } from './exhibits/ultradian-wave-exhibit'
import { FourBigsFlameExhibit } from './exhibits/four-bigs-flame-exhibit'
import CTAWithVerticalMarquee from '@/components/ui/cta-with-text-marquee'
import { CollectionSurfer } from '@/components/ui/collection-surfer'

interface PillarSection {
  number: string
  kicker: string
  title: string
  copy: string
  badge: string
  icon: any
  accentColor: string
  screenComponent: React.ComponentType
  tagline: string
  specs: { label: string; value: string }[]
}

const PILLARS: PillarSection[] = [
  {
    number: '01',
    kicker: 'ATTENTION SHIELD',
    title: 'WILLPOWER FAILS. SYSTEMS WIN.',
    copy: 'Every notification steals 20 minutes of deep focus. Improve locks distracting apps at the iOS system level the moment your focus timer begins. You do not need willpower. You just need a wall.',
    badge: 'Apple Family Controls',
    icon: ShieldCheck,
    accentColor: 'var(--indigo)',
    screenComponent: ShieldMotionExhibit,
    tagline: 'System-Level App Blocker Sheet',
    specs: [
      { label: 'Distractions', value: 'Zero Pings' },
      { label: 'Switch Cost', value: '23m Saved' },
      { label: 'Block Level', value: 'iOS System' }
    ]
  },
  {
    number: '02',
    kicker: 'TIMELINE HABITS',
    title: 'NOT ON YOUR CALENDAR? DOES NOT EXIST.',
    copy: 'To-do lists are wish lists. They sit in an app, get postponed, and create guilt. Improve drops your habits directly into Apple Calendar as real blocks of time. Your day has finite hours. Now your habits respect them.',
    badge: 'Apple Calendar Native',
    icon: Calendar,
    accentColor: 'var(--orange)',
    screenComponent: TimelineSnapExhibit,
    tagline: 'Habits Day Plan & EventKit',
    specs: [
      { label: 'Calendar', value: 'Apple EventKit' },
      { label: 'Routine Sync', value: '100% Auto' },
      { label: 'Sync Delay', value: '0.0s Live' }
    ]
  },
  {
    number: '03',
    kicker: 'BIOLOGICAL RHYTHM',
    title: 'YOUR BRAIN DOES NOT HAVE EIGHT HOURS.',
    copy: 'Human energy moves in 90-minute waves. Forcing focus when your mind is tired leads to burnout and slow work. Improve tracks your natural daily energy curve so you do your hardest work when your brain is sharpest.',
    badge: 'Ultradian Energy Curve',
    icon: Zap,
    accentColor: 'var(--green)',
    screenComponent: UltradianWaveExhibit,
    tagline: 'Main Focus Dashboard & Live Timer',
    specs: [
      { label: 'Focus Wave', value: '90 Minutes' },
      { label: 'Task Match', value: 'Peak Energy' },
      { label: 'Fatigue Cut', value: '-40% Burnout' }
    ]
  },
  {
    number: '04',
    kicker: 'GOAL EXECUTION',
    title: 'FOUR BIG GOALS. NOTHING ELSE.',
    copy: 'Big dreams die when they stay big. You pick four major goals for the year. Improve breaks them down into 15-minute daily micro-steps. Check off today’s tiny step, and the big outcome takes care of itself.',
    badge: 'Four Bigs Framework',
    icon: Target,
    accentColor: 'var(--purple)',
    screenComponent: FourBigsFlameExhibit,
    tagline: '2026 Four Bigs Annual Target Suite',
    specs: [
      { label: 'Yearly Focus', value: 'Max 4 Goals' },
      { label: 'Daily Step', value: '15-Min Action' },
      { label: 'Consistency', value: '94% On Track' }
    ]
  }
]

function PillarCardRow({ pillar, idx }: { pillar: PillarSection; idx: number }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const isReversed = idx % 2 === 1
  const Exhibit = pillar.screenComponent

  // Track scroll through this card's viewport window
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  })

  // Cinematic 3D Camera Dive Transforms
  const rawScale = useTransform(scrollYProgress, [0, 0.45, 0.65, 1], [0.88, 1.06, 1.02, 0.92])
  const scale = useSpring(rawScale, { stiffness: 220, damping: 28 })

  const rawRotateX = useTransform(scrollYProgress, [0, 0.45, 0.8], [8, 0, -3])
  const rotateX = useSpring(rawRotateX, { stiffness: 220, damping: 28 })

  const rawRotateY = useTransform(scrollYProgress, [0, 0.45, 1], [isReversed ? -3 : 3, 0, isReversed ? 2 : -2])
  const rotateY = useSpring(rawRotateY, { stiffness: 220, damping: 28 })

  const opacity = useTransform(scrollYProgress, [0, 0.25, 0.85, 1], [0.4, 1, 1, 0.45])
  const textY = useTransform(scrollYProgress, [0, 0.45, 1], [40, 0, -25])

  return (
    <div 
      ref={containerRef}
      className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-16 xl:gap-20 items-center py-8 perspective-[1400px]"
    >
      {/* Text Column with smooth scroll depth */}
      <motion.div 
        style={{ y: textY }}
        className={`lg:col-span-5 xl:col-span-5 space-y-6 sm:space-y-8 ${isReversed ? 'lg:order-2' : 'lg:order-1'}`}
      >
        {/* Category Pill / Kicker */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-rounded text-sm sm:text-base font-bold text-[var(--label-3)]">
            {pillar.number}
          </span>
          <span className="text-[var(--separator)]">•</span>
          <span className="kicker text-xs sm:text-sm" style={{ color: pillar.accentColor }}>
            {pillar.kicker}
          </span>
          <span className="tag-chip text-[11px] sm:text-xs ml-auto">
            {pillar.badge}
          </span>
        </div>

        {/* Huge Title: Massive typography that commands attention */}
        <h3 className="title-huge text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-[var(--label)] leading-[0.90]">
          {pillar.title}
        </h3>

        {/* Medium Copy */}
        <p className="type-body text-base sm:text-lg lg:text-xl text-[var(--label-2)] leading-relaxed">
          {pillar.copy}
        </p>

        {/* Micro Metric Badges */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-2">
          {pillar.specs.map((spec, sIdx) => (
            <div key={sIdx} className="card-inset-ios p-3 sm:p-4 space-y-1">
              <span className="type-micro text-[10px] sm:text-xs text-[var(--label-3)] uppercase tracking-wider block">
                {spec.label}
              </span>
              <span className="font-rounded text-sm sm:text-base lg:text-lg font-bold text-[var(--label)] block">
                {spec.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 3D Portal Zoom Column with Large-Scale Motion Exhibit */}
      <div className={`lg:col-span-7 xl:col-span-7 w-full ${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
        <motion.div 
          style={{ 
            scale, 
            rotateX, 
            rotateY, 
            opacity,
            transformStyle: 'preserve-3d'
          }}
          className="w-full relative group"
        >
          {/* Dynamic ambient backlight halo */}
          <div 
            className="absolute -inset-4 rounded-3xl opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40 pointer-events-none"
            style={{ backgroundColor: pillar.accentColor }}
          />

          {/* Mount the High-Impact Isolated Component Motion Exhibit */}
          <Exhibit />
        </motion.div>
      </div>

    </div>
  )
}

export function ProductivityShowcase() {
  return (
    <div className="w-full bg-[var(--bg)] text-[var(--label)] border-t border-[var(--separator)]">
      {/* The 5 Layers of Habits CollectionSurfer 3D Experience */}
      <section className="w-full">
        <CollectionSurfer 
          headerKicker="HABIT EXECUTION FRAMEWORK" 
          headerTitle="THE 5 LAYERS OF HABITS"
        />
      </section>

      {/* Upper Science Pillars Section */}
      <section className="w-full py-20 sm:py-28 lg:py-36 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden border-t border-[var(--separator)]">
        <div className="w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto space-y-28 sm:space-y-36 lg:space-y-44">
          
          {/* Main Section Header */}
          <div className="text-center max-w-5xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF02E8]/15 border border-[#FF02E8]/40 shadow-lg shadow-[#FF02E8]/20">
              <Sparkles className="w-4 h-4 text-[#FF02E8]" />
              <span className="kicker text-[#FF02E8] text-xs sm:text-sm font-bold tracking-wide">THE SCIENCE OF REAL FOCUS</span>
            </div>
            
            <h2 className="title-huge text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-[var(--label)] leading-[0.92]">
              ENGINEERED FOR PEAK DEEP WORK
            </h2>
            
            <p className="type-body text-base sm:text-xl lg:text-2xl text-[var(--label-2)] max-w-3xl mx-auto leading-relaxed pt-2">
              No productivity hacks. No endless to-do lists. Just proven human neuroscience turned into simple software that protects your time.
            </p>
          </div>

          {/* The 4 Science Pillars with 3D Zoom Camera Dive & Component Exhibits */}
          <div className="space-y-24 sm:space-y-32 lg:space-y-40">
            {PILLARS.map((pillar, idx) => (
              <PillarCardRow 
                key={pillar.number} 
                pillar={pillar} 
                idx={idx} 
              />
            ))}
          </div>

        </div>
      </section>

      {/* Bottom Marquee CTA Section */}
      <section className="w-full border-t border-[var(--separator)]">
        <CTAWithVerticalMarquee />
      </section>
    </div>
  )
}
