'use client'

import React, { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Target, 
  ArrowRight, 
  Sparkles,
  Lock,
  Flame,
  CheckCircle2,
  Clock
} from 'lucide-react'
import Link from 'next/link'

import CTAWithVerticalMarquee from '@/components/general/cta-with-text-marquee'
import { CollectionSurfer } from '@/components/general/collection-surfer'
import Timeline from '@/components/general/timeline'

// --- Inline Pillar Visual Cards ---
function ShieldMotionCard() {
  return (
    <div className="w-full rounded-3xl bg-[#0D0D12] border border-white/10 p-6 shadow-2xl relative overflow-hidden text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--indigo)]/20 border border-[var(--indigo)]/40 flex items-center justify-center text-[var(--indigo)]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Attention Shield Active</h4>
            <p className="text-xs text-white/50">iOS System-Level App Blocker</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--indigo)]/20 text-[var(--indigo)] border border-[var(--indigo)]/30">
          Enforced
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Instagram', status: 'Blocked' },
          { name: 'TikTok', status: 'Blocked' },
          { name: 'YouTube', status: 'Blocked' },
          { name: 'X / Twitter', status: 'Blocked' },
        ].map((app, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs font-medium text-white/80">{app.name}</span>
            <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
              {app.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TimelineSnapCard() {
  return (
    <div className="w-full rounded-3xl bg-[#0D0D12] border border-white/10 p-6 shadow-2xl relative overflow-hidden text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--orange)]/20 border border-[var(--orange)]/40 flex items-center justify-center text-[var(--orange)]">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Apple Calendar Sync</h4>
            <p className="text-xs text-white/50">Habits locked into real hours</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--orange)]/20 text-[var(--orange)] border border-[var(--orange)]/30">
          Live EventKit
        </span>
      </div>

      <div className="space-y-2.5">
        {[
          { time: '08:00 AM', title: 'Deep Programming Session', color: 'bg-[var(--indigo)]' },
          { time: '10:30 AM', title: 'Ultradian Energy Break', color: 'bg-[var(--green)]' },
          { time: '02:00 PM', title: 'High-Impact Writing', color: 'bg-[var(--orange)]' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
            <span className="text-xs font-mono text-white/50 w-20">{item.time}</span>
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-xs font-medium text-white truncate">{item.title}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UltradianWaveCard() {
  return (
    <div className="w-full rounded-3xl bg-[#0D0D12] border border-white/10 p-6 shadow-2xl relative overflow-hidden text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--green)]/20 border border-[var(--green)]/40 flex items-center justify-center text-[var(--green)]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Ultradian Energy Curve</h4>
            <p className="text-xs text-white/50">90-Minute Peak Performance Wave</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--green)]/20 text-[var(--green)] border border-[var(--green)]/30">
          94% Sharpness
        </span>
      </div>

      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-white/40 uppercase tracking-widest block font-bold">Current Cycle</span>
          <span className="text-lg font-bold text-white">Peak Focus Wave #2</span>
        </div>
        <div className="text-right">
          <span className="font-mono text-2xl font-black text-[var(--green)]">01:25:40</span>
        </div>
      </div>
    </div>
  )
}

function FourBigsFlameCard() {
  return (
    <div className="w-full rounded-3xl bg-[#0D0D12] border border-white/10 p-6 shadow-2xl relative overflow-hidden text-white">
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--purple)]/20 border border-[var(--purple)]/40 flex items-center justify-center text-[var(--purple)]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Four Bigs Framework</h4>
            <p className="text-xs text-white/50">Annual Targets into 15m Micro-steps</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[var(--purple)]/20 text-[var(--purple)] border border-[var(--purple)]/30">
          2026 Goals
        </span>
      </div>

      <div className="space-y-3">
        {[
          { goal: 'Relationships & Family', pct: 85, color: 'bg-rose-500' },
          { goal: 'Health & Vitality', pct: 90, color: 'bg-emerald-500' },
          { goal: 'Career & Systems', pct: 78, color: 'bg-indigo-500' },
          { goal: 'Wealth & Assets', pct: 92, color: 'bg-amber-500' },
        ].map((g, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-white/80">{g.goal}</span>
              <span className="text-white/50">{g.pct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
              <div className={`h-full ${g.color} rounded-full`} style={{ width: `${g.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

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
    screenComponent: ShieldMotionCard,
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
    screenComponent: TimelineSnapCard,
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
    screenComponent: UltradianWaveCard,
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
    screenComponent: FourBigsFlameCard,
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
      {/* 1. The 5 Layers of Habits CollectionSurfer 3D Experience */}
      <section className="w-full">
        <CollectionSurfer 
          headerKicker="HABIT EXECUTION FRAMEWORK" 
          headerTitle="THE 5 LAYERS OF HABITS"
        />
      </section>

      {/* 2. Timeline GSAP Section with Pinned Title Header */}
      <Timeline 
        sectionTitle="ENGINEERED FOR PEAK DEEP WORK"
        title="PRODUCT ROADMAP"
        periodLabel="2020 - 2026 ROADMAP"
        activeColor="#FF02E8"
        backgroundColor="var(--bg)"
        textColor="var(--label)"
        mutedTextColor="var(--label-2)"
      />

      {/* 3. Upper Science Pillars Section */}
      <section className="w-full py-20 sm:py-28 lg:py-36 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 overflow-hidden border-t border-[var(--separator)]">
        <div className="w-full max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto space-y-28 sm:space-y-36 lg:space-y-44">
          
          {/* Main Section Header */}
          <div className="text-center max-w-5xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF02E8]/15 border border-[#FF02E8]/40 shadow-lg shadow-[#FF02E8]/20">
              <Sparkles className="w-4 h-4 text-[#FF02E8]" />
              <span className="kicker text-[#FF02E8] text-xs sm:text-sm font-bold tracking-wide">THE SCIENCE OF REAL FOCUS</span>
            </div>
            
            <h2 className="title-huge text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-[var(--label)] leading-[0.92]">
              FOUR PILLARS OF HIGH PERFORMANCE
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
