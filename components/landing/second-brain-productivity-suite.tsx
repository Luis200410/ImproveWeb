'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Zap,
  Layers,
  Rocket,
  ListTodo,
  NotebookPen,
  BookOpenCheck,
  Inbox,
  Archive,
  Lock,
  Eye,
  Server,
  Cloud,
  FileDown,
  Mail,
  Shield,
  Clock,
  Calendar,
  Sparkles,
  Mic,
  CheckCircle2,
  Sliders,
  Smartphone,
  ChevronRight,
  RefreshCw,
  Cpu,
  BarChart3,
  Moon,
  Sun,
  ShieldAlert,
  ArrowRight,
  Share2,
  Check,
  Tag,
  Key,
  Target
} from 'lucide-react'

export type SuiteTab = 
  | 'overview' 
  | 'second-brain' 
  | 'productivity' 
  | 'interlock' 
  | 'data-ai' 
  | 'privacy' 
  | 'pricing'

interface SuiteProps {
  initialTab?: SuiteTab
  className?: string
}

export function SecondBrainProductivitySuite({ initialTab = 'overview', className = '' }: SuiteProps) {
  const [activeTab, setActiveTab] = useState<SuiteTab>(initialTab)

  const tabs: { id: SuiteTab; label: string; icon: any; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'second-brain', label: 'Second Brain', icon: Brain, badge: 'App 01' },
    { id: 'productivity', label: 'Productivity', icon: Zap, badge: 'App 02' },
    { id: 'interlock', label: 'How They Interlock', icon: RefreshCw },
    { id: 'data-ai', label: 'Data & AI', icon: Cpu },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'pricing', label: 'Pricing & Tiers', icon: Tag },
  ]

  return (
    <div className={`w-full bg-[#050505] border border-white/10 rounded-[2rem] md:rounded-[3rem] p-4 sm:p-8 md:p-12 text-white overflow-hidden relative shadow-2xl ${className}`}>
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar with Suite Specs */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono uppercase tracking-widest text-amber-400">
              Product Specification · iOS / iPadOS Suite
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono text-neutral-400">
              Two Apps · One Shared Brain
            </span>
          </div>
          <h2 className="type-large-title text-3xl sm:text-5xl text-[var(--label)] tracking-tight leading-none">
            Second Brain <span className="text-amber-400">×</span> Productivity
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-xl font-light mt-1">
            A complete, plain-language reference for everything these two companion apps do — on-device AI, private sync, and native calendar integration.
          </p>
        </div>

        {/* System Attributes Pill Stack */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono text-neutral-400 w-full md:w-auto">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/40 block text-[8px] uppercase">Suite</span>
            <span className="text-white font-bold">IMPROVE</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/40 block text-[8px] uppercase">Platform</span>
            <span className="text-white font-bold">iOS / iPadOS</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/40 block text-[8px] uppercase">AI Logic</span>
            <span className="text-emerald-400 font-bold">On-Device Only</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
            <span className="text-white/40 block text-[8px] uppercase">Data Store</span>
            <span className="text-indigo-400 font-bold">Device + iCloud</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation Pill Bar */}
      <div className="relative z-10 py-6 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 p-1.5 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl md:rounded-full w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 sm:px-5 py-2.5 rounded-xl md:rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] scale-100'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-neutral-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content Display */}
      <div className="relative z-10 mt-4 min-h-[500px]">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && <OverviewTabContent onNavigate={setActiveTab} />}
          {activeTab === 'second-brain' && <SecondBrainTabContent />}
          {activeTab === 'productivity' && <ProductivityTabContent />}
          {activeTab === 'interlock' && <InterlockTabContent />}
          {activeTab === 'data-ai' && <DataAiTabContent />}
          {activeTab === 'privacy' && <PrivacyTabContent />}
          {activeTab === 'pricing' && <PricingTabContent />}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB 1: OVERVIEW
   ═══════════════════════════════════════════════════════════════ */
function OverviewTabContent({ onNavigate }: { onNavigate: (tab: SuiteTab) => void }) {
  return (
    <motion.div
      key="tab-overview"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      {/* Hero Core Idea Section */}
      <div className="grid lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/10 rounded-2xl md:rounded-[2.5rem] p-6 sm:p-10">
        <div className="lg:col-span-7 space-y-4">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
            <span>00</span> · Core Architectural Concept
          </div>
          <h3 className="type-title text-3xl sm:text-4xl text-[var(--label)] tracking-tight font-bold">
            Two focused apps that share one brain.
          </h3>
          <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-light">
            <strong className="text-white font-semibold">Second Brain</strong> is where you capture, organize, and plan your work and life. <strong className="text-amber-400 font-semibold">Productivity</strong> is where you actually do it — with focus timers, habit routines, and Screen-Time app blocking.
          </p>
          <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed font-light">
            They are separate downloads on the App Store but built on a single shared foundation (SwiftData + Apple Calendar), so what you plan in one becomes the exact schedule you execute in the other.
          </p>

          <div className="pt-4 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('second-brain')}
              className="px-5 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>Explore Second Brain</span>
            </button>
            <button
              onClick={() => onNavigate('productivity')}
              className="px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Explore Productivity</span>
            </button>
          </div>
        </div>

        {/* Right Side: The Core Idea Principle Box */}
        <div className="lg:col-span-5 bg-black/60 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-amber-400">
            <Calendar className="w-4 h-4" /> The Unified Habit Schedule
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed font-light italic">
            &ldquo;Your habits are recurring blocks on your real Apple Calendar. Tasks don&apos;t get their own scattered events — they&apos;re assigned underneath a habit, and the on-device planner decides what to work on inside each block. Anything that doesn&apos;t fit lands back in your Inbox. One calendar, one plan, no duplicate systems.&rdquo;
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-neutral-400">
            <span>Calendar Source of Truth</span>
            <span className="text-emerald-400 font-bold">EventKit Native</span>
          </div>
        </div>
      </div>

      {/* Side-by-Side App Breakdown Cards */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* App One Card: Second Brain */}
        <div className="p-6 sm:p-8 rounded-2xl md:rounded-[2rem] bg-neutral-950 border border-indigo-500/20 hover:border-indigo-500/40 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <Brain className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-mono text-indigo-300">
                APP ONE · PLANNING
              </span>
            </div>
            <h4 className="type-headline text-2xl sm:text-3xl text-[var(--label)] tracking-tight font-bold">
              Second Brain
            </h4>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              A calm, organized home for everything on your mind — captured fast, sorted into life areas and projects, broken into doable steps, and scheduled onto your real calendar by an on-device planner.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-neutral-300 font-mono">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Capture &amp; Inbox
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Areas &amp; Projects
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Tasks &amp; Micro-steps
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Rich Notes &amp; Search
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> AI Day Planning
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> Native Calendar
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('second-brain')}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-indigo-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <span>View Full Second Brain Specs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* App Two Card: Productivity */}
        <div className="p-6 sm:p-8 rounded-2xl md:rounded-[2rem] bg-neutral-950 border border-amber-500/20 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Zap className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[10px] font-mono text-amber-300">
                APP TWO · EXECUTION
              </span>
            </div>
            <h4 className="type-headline text-2xl sm:text-3xl text-[var(--label)] tracking-tight font-bold">
              Productivity
            </h4>
            <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
              The execution side: yearly goals, daily habit routines on a real timeline, focus sessions with a timer, and a Screen-Time shield that blocks distracting apps automatically during your scheduled focus.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs text-neutral-300 font-mono">
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Focus Timer
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Habits &amp; Routines
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Yearly Four Bigs
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Screen Time Shield
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Flow &amp; Chronotype
              </div>
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Weekly Review Briefs
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('productivity')}
            className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-widest text-amber-300 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <span>View Full Productivity Specs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB 2: SECOND BRAIN
   ═══════════════════════════════════════════════════════════════ */
function SecondBrainTabContent() {
  const categories = [
    {
      title: 'Capture & the Inbox',
      icon: Inbox,
      badge: 'Frictionless Ingestion',
      items: [
        {
          name: 'Frictionless capture',
          desc: 'Get anything out of your head in one step — as typed text, a voice note, or a photo. Everything lands in a single Inbox so capturing never means deciding where something goes upfront.',
        },
        {
          name: 'Voice capture with on-device transcription',
          tag: 'On-device AI',
          desc: 'Record a thought and it is transcribed to text privately on the device — no audio leaves the phone. Pending recordings are transcribed in the background and back-filled if you capture while offline.',
        },
        {
          name: 'Smart triage',
          tag: 'On-device AI',
          desc: 'The app reads each captured item and suggests where it belongs — which project or area, a cleaned-up title, and a priority — and flags likely duplicates so your Inbox doesn\'t pile up with the same idea twice.',
        },
        {
          name: 'Assign to a habit',
          tag: 'New',
          desc: 'When the planner cannot fit a task under any habit, it is dropped into the Inbox with a note. From there you can assign it to one of your active habits in a tap, and its steps get scheduled into that habit\'s blocks.',
        },
      ],
    },
    {
      title: 'Areas, Projects & Tasks',
      icon: Layers,
      badge: 'Organization Structure',
      items: [
        {
          name: 'Life areas',
          desc: 'Organize everything under the big areas of your life (work & career, mind & learning, health, relationships, money, and more), each with its own color identity. Areas can be browsed, edited, and archived.',
        },
        {
          name: 'Projects with progress',
          desc: 'Each area holds projects; each project shows a live progress ring based on completed work, an activity date, and a status (active / archived). A project detail view gathers its tasks, notes, and resources in one place.',
        },
        {
          name: 'Tasks broken into steps',
          tag: 'On-device AI',
          desc: 'Every task can be split into small, estimated sub-steps (“micro-tasks”). The planner can generate these steps for a task, or reverse-engineer a whole project into a task list from just a title and the outcome you want.',
        },
        {
          name: 'Priority, status & estimates',
          desc: 'Tasks carry priority (high / medium / low), a status, and time estimates on their steps — the raw material the scheduler and the focus timer both use to pace your day.',
        },
      ],
    },
    {
      title: 'Notes, Resources & Search',
      icon: NotebookPen,
      badge: 'Knowledge Engine',
      items: [
        {
          name: 'Rich notes',
          desc: 'A proper rich-text note editor with formatting, typed note kinds, and detail views — for meeting notes, thinking, and reference material attached to the project it belongs to.',
        },
        {
          name: 'Resources & summaries',
          tag: 'On-device AI',
          desc: 'Keep links, documents, and reference items with each project. Longer material can be summarized on-device so you get the gist without re-reading everything.',
        },
        {
          name: 'Semantic search',
          tag: 'On-device AI',
          desc: 'Search understands meaning, not just exact words — an on-device text index finds related notes, tasks, and captures even when your query doesn\'t match the wording.',
        },
      ],
    },
    {
      title: 'Planning & the Calendar',
      icon: Calendar,
      badge: 'Temporal Scheduling',
      items: [
        {
          name: 'Plan My Day',
          tag: 'On-device AI',
          desc: 'An on-device planner looks at your tasks, their priorities and estimates, and your habit blocks, then proposes what to do and when — over a rolling horizon, not just today. You review and approve before anything is committed.',
        },
        {
          name: 'Today, grouped by habit',
          desc: 'Today shows your work grouped under the habit block it belongs to, each item showing its estimated length rather than a pile of identical start times, so the day reads as a realistic sequence.',
        },
        {
          name: 'Adaptive recovery',
          desc: 'Fall behind and the plan re-paces itself: unfinished steps are re-assigned to the next upcoming habit block that has room, so a slow morning doesn\'t wreck the rest of the day.',
        },
        {
          name: 'Native Apple Calendar as the source of truth',
          desc: 'Habits become real recurring events on your Apple Calendar (on the days and times you set), so your plan shows up everywhere Apple Calendar does. Tapping a habit block in Calendar deep-links back into the app.',
        },
        {
          name: 'Built-in calendar view',
          desc: 'A calendar surface inside Second Brain shows the same events and habit blocks, bridging each note or task to its scheduled time.',
        },
      ],
    },
    {
      title: 'Connections, Review & Housekeeping',
      icon: Share2,
      badge: 'Ecosystem & Longevity',
      items: [
        {
          name: 'Integrations framework',
          desc: 'A structure for connecting outside sources — task managers, note apps, email, calendars, and cloud storage — whose items flow into your Inbox for review and triage. Connectable services are shown by category.',
        },
        {
          name: 'Archive',
          desc: 'Completed and retired items move to an Archive rather than disappearing, keeping your active views clean while preserving history.',
        },
        {
          name: 'Re-entry flow',
          desc: 'Come back after a week away and a gentle re-entry flow helps you catch up instead of facing a wall of stale items.',
        },
        {
          name: 'Guided onboarding & coach marks',
          desc: 'A first-run walkthrough and in-context coach marks introduce the model (capture → organize → plan) without a manual.',
        },
      ],
    },
  ]

  return (
    <motion.div
      key="tab-second-brain"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-indigo-950/20 border border-indigo-500/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 uppercase tracking-widest">
            <Brain className="w-4 h-4" /> 01 · Second Brain Specification
          </div>
          <h3 className="type-title text-3xl sm:text-4xl text-[var(--label)] tracking-tight font-bold">
            Second Brain — Feature by Feature
          </h3>
          <p className="text-neutral-300 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
            Three tabs on iPhone (Second Brain home, Projects, and Inbox) expanding to a full adaptive sidebar layout on iPad and Mac with Home, Inbox, Search, Archive, Life Areas, and per-project detail.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-neutral-400 shrink-0">
          <span className="text-white block font-bold">iPhone / iPad / Mac</span>
          <span className="text-indigo-400">PARA+ Architecture</span>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-10">
        {categories.map((cat, idx) => {
          const Icon = cat.icon
          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="type-headline text-xl sm:text-2xl text-[var(--label)] tracking-tight font-bold">
                    {cat.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline">
                  {cat.badge}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {cat.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-neutral-950/80 border border-white/5 hover:border-indigo-500/30 transition-all space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {item.name}
                      </h5>
                      {item.tag && (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-mono shrink-0 uppercase tracking-wider ${
                          item.tag.includes('AI') 
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                        }`}>
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB 3: PRODUCTIVITY
   ═══════════════════════════════════════════════════════════════ */
function ProductivityTabContent() {
  const sections = [
    {
      title: 'Focus Sessions',
      icon: Clock,
      badge: 'Execution Chambers',
      items: [
        {
          name: 'Focus timer',
          desc: 'A dedicated work timer for a single task or a whole habit block. Timers are background-resilient — close the app, switch screens, or get interrupted and the session recovers rather than silently dying.',
        },
        {
          name: 'Whole-block focus',
          desc: 'Start a focus session for an entire habit and it cycles through every sub-step assigned under that habit, keeping the Screen-Time shield active for the full duration instead of one task at a time.',
        },
        {
          name: 'Timer + blocker that work together',
          desc: 'Because the app knows the exact task and estimated length, the timer and app-blocker coordinate: the shield runs for the right duration and blocks exactly the apps you chose for that specific habit.',
        },
        {
          name: 'Live step checklist',
          desc: 'During a focus session, the task\'s sub-steps are displayed and can be checked off live. Completing them writes straight back to Second Brain, so finishing work in one app updates the master plan in the other.',
        },
      ],
    },
    {
      title: 'Plan — Goals & Habits',
      icon: Target,
      badge: 'Identity & Routine',
      items: [
        {
          name: 'Yearly “Four Bigs” goals',
          desc: 'Set the handful of goals that actually matter for the year and track them with weekly status, so the high-level trajectory stays in view above the daily grind.',
        },
        {
          name: 'Habits with identity & consistency',
          desc: 'Each habit carries an identity statement (“I\'m the kind of person who…”), a rolling 30-day consistency score, active weekdays, and whether it is marked as non-negotiable.',
        },
        {
          name: 'Routine on a real timeline',
          desc: 'Build your routine on a live timeline, not a static list — a Day view for today and a 7-column Week view. Drag a habit to move its time, tap an empty slot to add one, and edits update live across all views.',
        },
        {
          name: 'Exact times & flexible length',
          desc: 'Give every habit a clock time and set its length with start/end pickers and a live total — from a few minutes to many hours, whatever the habit realistically requires.',
        },
        {
          name: 'Always on your calendar',
          desc: 'Every active habit is automatically a recurring block on your Apple Calendar — not an optional toggle. Change a time or day and the calendar blocks and notifications follow automatically.',
        },
      ],
    },
    {
      title: 'App Blocking — The Shield',
      icon: Shield,
      badge: 'Family Controls Enforced',
      items: [
        {
          name: 'Per-habit auto-blocking',
          tag: 'New',
          desc: 'Choose which apps a habit should block, and they\'re blocked automatically at that habit\'s scheduled time on its active days — no need to start anything manually. Blocking stays continuous across back-to-back habits.',
        },
        {
          name: 'Learns before it blocks',
          desc: 'The shield starts by quietly observing your app usage to understand your distraction triggers, then reveals a tailored blocking setup you confirm — so rules are based on real behavior, not guesses.',
        },
        {
          name: 'Energy-aware windows',
          desc: 'Beyond habits, the shield can enforce your high-focus “peak” windows and nudge (rather than hard-block) during low-energy windows, asking whether an app launch was truly intentional.',
        },
        {
          name: 'Breaks & escape handling',
          desc: 'Take a deliberate break and blocking pauses, then resumes on its own. Repeated attempts to open a blocked app are logged so you can inspect friction points during weekly reviews.',
        },
        {
          name: 'Cross-device continuity',
          desc: 'Shield settings and enforcement state sync across your Apple devices so distraction blocking behaves consistently wherever you are signed in.',
        },
      ],
    },
    {
      title: 'Insights & Review',
      icon: BarChart3,
      badge: 'Telemetry & Reflection',
      items: [
        {
          name: 'Flow & chronotype',
          tag: 'On-device AI',
          desc: 'The app builds a picture of when you focus best and lays out your day around those biological rhythms, with a weekly flow report summarizing how your energy actually went.',
        },
        {
          name: 'App usage analytics',
          desc: 'A clear view of where your screen time is going, drawn directly from the same on-device Screen-Time data the shield uses.',
        },
        {
          name: 'Weekly review & morning brief',
          tag: 'On-device AI',
          desc: 'A guided weekly review (pre-populated on-device from your week) plus short daily briefs and insights — reflection prompts and score summaries generated privately on your device.',
        },
        {
          name: 'Reminders that carry the work',
          desc: 'Habit reminders fire a few minutes before each block with quick Done / Skip actions, and step reminders name the next sub-task with Done / Next — unfinished steps roll into the next session.',
        },
      ],
    },
  ]

  return (
    <motion.div
      key="tab-productivity"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-2xl bg-amber-950/20 border border-amber-500/20">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
            <Zap className="w-4 h-4" /> 02 · Productivity Specification
          </div>
          <h3 className="type-title text-3xl sm:text-4xl text-[var(--label)] tracking-tight font-bold">
            Productivity — Feature by Feature
          </h3>
          <p className="text-neutral-300 text-xs sm:text-sm font-light max-w-2xl leading-relaxed">
            Five tabs: Dashboard, Focus, Plan (goals + habits), Insights (flow + usage + review), and Settings. This is the app that turns intentions into done work and defends the time you set aside for it.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-neutral-400 shrink-0">
          <span className="text-white block font-bold">5 Core App Tabs</span>
          <span className="text-amber-400">Screen Time Shield Engine</span>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="space-y-10">
        {sections.map((sec, idx) => {
          const Icon = sec.icon
          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h4 className="type-headline text-xl sm:text-2xl text-[var(--label)] tracking-tight font-bold">
                    {sec.title}
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline">
                  {sec.badge}
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {sec.items.map((item, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-xl bg-neutral-950/80 border border-white/5 hover:border-amber-500/30 transition-all space-y-2.5 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h5 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                        {item.name}
                      </h5>
                      {item.tag && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono shrink-0 uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed font-light">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB 4: HOW THEY INTERLOCK
   ═══════════════════════════════════════════════════════════════ */
function InterlockTabContent() {
  const mechanics = [
    {
      title: '1. Habits are the schedule',
      desc: 'Productivity owns habits; they become recurring calendar blocks on Apple Calendar; Second Brain plans tasks directly into those blocks.',
      icon: Calendar,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      title: '2. Tasks ride under habits',
      desc: 'The planner assigns each task\'s steps to a matching habit block instead of creating separate scattered calendar events. No match → returned to Inbox.',
      icon: ListTodo,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/20',
    },
    {
      title: '3. One-tap handoff',
      desc: 'From Second Brain\'s Today view you can launch a focus session in Productivity for a habit or task; the timer and the right app-blocking start automatically.',
      icon: Zap,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
    },
    {
      title: '4. Write-back is automatic',
      desc: 'Checking off steps in a focus session marks them complete everywhere in real-time, so the next day\'s plan already knows exactly what is finished.',
      icon: CheckCircle2,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/20',
    },
    {
      title: '5. Calendar is the bridge',
      desc: 'Tapping a habit block in the native Apple Calendar deep-links back into the app directly to that habit and its queued tasks.',
      icon: RefreshCw,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
    {
      title: '6. Companion, by design',
      desc: 'The combined powers — focus timer plus Screen-Time app-blocking triggered from your plan — live in Productivity via Apple Family Controls, while planning lives in Second Brain.',
      icon: Shield,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
    },
  ]

  return (
    <motion.div
      key="tab-interlock"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-10"
    >
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
          <span>03</span> · Synergistic Architecture
        </div>
        <h3 className="type-title text-3xl sm:text-4xl text-[var(--label)] tracking-tight font-bold">
          How the Two Apps Interlock
        </h3>
        <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-light max-w-3xl">
          The apps are worth more together than apart. Both apps read and write one shared, private data store (SwiftData) and one Apple Calendar. There is no export/import step and no manual syncing — a habit created in Productivity is immediately available for Second Brain to schedule tasks under.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mechanics.map((m, idx) => {
          const Icon = m.icon
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${m.border} ${m.bg} space-y-3 flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Icon className={`w-6 h-6 ${m.color}`} />
                  <span className="text-[10px] font-mono text-white/30">0{idx + 1}</span>
                </div>
                <h4 className="text-base font-bold text-white leading-snug">{m.title}</h4>
                <p className="text-xs text-neutral-300 leading-relaxed font-light">{m.desc}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-neutral-400">
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Each app is fully useful alone; installed together, planning and doing become one loop.</span>
        </div>
        <span className="text-amber-400 font-bold shrink-0">Zero Manual Sync Required</span>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB 5: DATA & AI
   ═══════════════════════════════════════════════════════════════ */
function DataAiTabContent() {
  const dataObjects = [
    { object: 'Area', desc: 'A life area (work, health, mind…) that groups projects', livesIn: 'Second Brain', tag: 'Private' },
    { object: 'Project', desc: 'A body of work with progress, status, tasks, notes, resources', livesIn: 'Second Brain', tag: 'Private' },
    { object: 'Task / MicroTask', desc: 'A task and its small estimated sub-steps', livesIn: 'Shared Foundation', tag: 'Shared' },
    { object: 'Note / Resource', desc: 'Rich notes and reference material attached to projects', livesIn: 'Second Brain', tag: 'Private' },
    { object: 'InboxItem', desc: 'A raw capture (text, voice, photo) awaiting triage', livesIn: 'Second Brain', tag: 'Private' },
    { object: 'Habit', desc: 'A recurring practice with time, days, length, identity, blocked apps', livesIn: 'Shared Foundation', tag: 'Shared' },
    { object: 'FourBigsGoal', desc: 'A yearly goal with weekly status', livesIn: 'Productivity', tag: 'Private' },
    { object: 'FocusSession', desc: 'A timed work session linked to a task or habit', livesIn: 'Productivity', tag: 'Private' },
    { object: 'FlowProfile', desc: 'Your learned focus-rhythm / chronotype profile', livesIn: 'Productivity', tag: 'Private' },
    { object: 'DailyPlan', desc: 'An approved plan of blocks for a day', livesIn: 'Productivity', tag: 'Private' },
    { object: 'Weekly / Daily review', desc: 'Reflections and scores over time', livesIn: 'Productivity', tag: 'Private' },
  ]

  return (
    <motion.div
      key="tab-data-ai"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
          <span>04</span> · Data Model &amp; On-Device Intelligence
        </div>
        <h3 className="type-title text-3xl sm:text-4xl text-[var(--label)] tracking-tight font-bold">
          Transparent Architecture — What We Store &amp; How AI Works
        </h3>
        <p className="text-neutral-300 text-sm leading-relaxed font-light max-w-3xl">
          The honest, verified version: every single AI feature runs on your Apple hardware. There is no cloud AI provider configured, no remote servers processing your notes, and no account/API key required.
        </p>
      </div>

      {/* AI Pillars */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-emerald-500/[0.03] border border-emerald-500/20 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">1. On-Device Heuristics</h4>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            Language detection, entity and keyword extraction, optical character recognition (OCR), and the semantic search index run via native Apple frameworks directly on the device.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-amber-500/[0.03] border border-amber-500/20 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">2. Apple Foundation Models</h4>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            Powered by Apple Intelligence on supported hardware for generating task steps, reverse-engineering projects, triage suggestions, resource summaries, reviews, briefs, and reflections.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-indigo-500/[0.03] border border-indigo-500/20 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Mic className="w-5 h-5" />
          </div>
          <h4 className="text-base font-bold text-white">3. Speech Transcription</h4>
          <p className="text-xs text-neutral-400 leading-relaxed font-light">
            Voice captures are transcribed on-device via Apple Speech frameworks; audio files stay strictly on the phone and are never transmitted to external APIs.
          </p>
        </div>
      </div>

      {/* Object Storage Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="type-headline text-xl sm:text-2xl text-[var(--label)] tracking-tight font-bold">
            Data Object Map
          </h4>
          <span className="text-xs font-mono text-neutral-400">SwiftData Local Store</span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-neutral-950">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-4 font-mono font-bold text-neutral-300 uppercase tracking-wider">Object</th>
                <th className="px-6 py-4 font-mono font-bold text-neutral-300 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 font-mono font-bold text-neutral-300 uppercase tracking-wider">Storage Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-light">
              {dataObjects.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-white">{row.object}</td>
                  <td className="px-6 py-3.5 text-neutral-300">{row.desc}</td>
                  <td className="px-6 py-3.5 font-mono">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      row.tag === 'Shared' 
                        ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300' 
                        : 'bg-white/5 border border-white/10 text-neutral-300'
                    }`}>
                      {row.livesIn}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB 6: PRIVACY
   ═══════════════════════════════════════════════════════════════ */
function PrivacyTabContent() {
  const permissions = [
    { perm: 'Sign in with Apple', purpose: 'Identity & cross-device sync. (Demo mode available without signing in).', app: 'Both Apps' },
    { perm: 'Calendar (EventKit)', purpose: 'Creating/updating habit blocks and reading existing schedule for day planning.', app: 'Both Apps' },
    { perm: 'Screen Time (Family Controls)', purpose: 'Observing app usage patterns and blocking distracting apps during focus/habit windows.', app: 'Productivity' },
    { perm: 'Notifications', purpose: 'Habit and step reminders with quick Done/Skip actions; break-end and review nudges.', app: 'Both Apps' },
    { perm: 'Microphone & Speech', purpose: 'Voice capture and on-device offline transcription.', app: 'Second Brain' },
    { perm: 'Photos', purpose: 'Attaching photos to Inbox captures; choosing profile avatar.', app: 'Second Brain' },
    { perm: 'Health (HealthKit)', purpose: 'Optional biometric signals that inform chronotype and flow energy curves.', app: 'Productivity' },
  ]

  return (
    <motion.div
      key="tab-privacy"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
          <Shield className="w-4 h-4" /> 05 · Privacy &amp; Permissions Fact Sheet
        </div>
        <h3 className="type-title text-3xl sm:text-4xl text-[var(--label)] tracking-tight font-bold">
          Where Your Data Lives &amp; Permissions We Request
        </h3>
        <p className="text-neutral-300 text-sm leading-relaxed font-light max-w-3xl">
          Source facts for your privacy policy and terms. Your content isn&apos;t uploaded to a first-party developer server for AI or storage. Intelligence runs strictly on-device; sync runs through Apple&apos;s private CloudKit.
        </p>
      </div>

      {/* 4 Pillars of Data Living */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">01 · On Your Device</span>
          <h4 className="text-sm font-bold text-white">Local SwiftData</h4>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            The primary store is on-device. Captures, projects, habits, notes, and sessions are stored locally first.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">02 · Your Private iCloud</span>
          <h4 className="text-sm font-bold text-white">Apple CloudKit Sync</h4>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            Data syncs across your personal devices via your private iCloud account governed by Apple&apos;s privacy model.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-rose-400 uppercase tracking-widest">03 · Zero Cloud AI</span>
          <h4 className="text-sm font-bold text-white">No Developer Servers</h4>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            No text, voice recordings, or calendar events are ever sent to remote server endpoints for LLM training.
          </p>
        </div>

        <div className="p-5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">04 · Integrations</span>
          <h4 className="text-sm font-bold text-white">100% Opt-In</h4>
          <p className="text-xs text-neutral-400 font-light leading-relaxed">
            Outside services (Notion, Jira, Mail) only connect when you explicitly choose to authorize them.
          </p>
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="space-y-4">
        <h4 className="type-headline text-xl sm:text-2xl text-[var(--label)] tracking-tight font-bold">
          Permissions Requested &amp; Reason for Access
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-neutral-950">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-4 font-mono font-bold text-neutral-300 uppercase tracking-wider">Permission</th>
                <th className="px-6 py-4 font-mono font-bold text-neutral-300 uppercase tracking-wider">Used For</th>
                <th className="px-6 py-4 font-mono font-bold text-neutral-300 uppercase tracking-wider">App Scope</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-light">
              {permissions.map((p, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-3.5 font-mono font-bold text-white">{p.perm}</td>
                  <td className="px-6 py-3.5 text-neutral-300 leading-relaxed">{p.purpose}</td>
                  <td className="px-6 py-3.5 font-mono">
                    <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-neutral-300">
                      {p.app}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   TAB 7: PRICING & TIERS
   ═══════════════════════════════════════════════════════════════ */
function PricingTabContent() {
  return (
    <motion.div
      key="tab-pricing"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
      className="space-y-12"
    >
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-white/10 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-400 uppercase tracking-widest">
          <Tag className="w-4 h-4" /> 06 · Suite Subscription Model
        </div>
        <h3 className="type-title text-3xl sm:text-4xl text-[var(--label)] tracking-tight font-bold">
          Subscribe Once. Unlock the Whole Improve Suite.
        </h3>
        <p className="text-neutral-300 text-sm leading-relaxed font-light max-w-3xl">
          How access is tiered across the Improve ecosystem. A subscription to any single Improve app unlocks the paid &ldquo;Performer&rdquo; tier across all sibling apps, so you never pay twice.
        </p>
      </div>

      {/* Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        {/* Free Tier */}
        <div className="p-6 sm:p-8 rounded-2xl bg-neutral-950 border border-white/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Core Access</span>
              <span className="px-2.5 py-1 rounded bg-white/5 text-[10px] font-mono text-white">Free Forever</span>
            </div>
            <h4 className="type-headline text-2xl sm:text-3xl text-[var(--label)] tracking-tight font-bold">
              Free Core Tier
            </h4>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              The fundamental capture, organize, and planning experience is completely usable without paying anything.
            </p>
            <ul className="space-y-2.5 pt-2 text-xs text-neutral-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Local-first note &amp; task capture
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Habit tracking &amp; Apple Calendar sync
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> Basic focus sessions &amp; timer
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" /> On-device speech transcription
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-white/5 text-[11px] font-mono text-neutral-400">
            No credit card or account creation required.
          </div>
        </div>

        {/* Paid Performer Tier */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-amber-500/10 via-black to-black border border-amber-500/30 space-y-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[9px] font-mono font-bold uppercase tracking-widest">
              Universal Family Pass
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-amber-400 uppercase tracking-widest">Full Suite Power</span>
              <span className="px-2.5 py-1 rounded bg-amber-500/20 text-[10px] font-mono text-amber-300">Performer Tier</span>
            </div>
            <h4 className="type-headline text-2xl sm:text-3xl text-[var(--label)] tracking-tight font-bold">
              The Performer Suite
            </h4>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Unlocks the complete ecosystem across Second Brain, Productivity, Body, Money, and all companion apps.
            </p>
            <ul className="space-y-2.5 pt-2 text-xs text-neutral-200">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>All Sibling Apps Unlocked:</strong> Single subscription covers entire suite
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>Screen-Time Shield:</strong> Continuous per-habit app blocking
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>On-Device AI Day Planner:</strong> Rolling horizon calendar auto-pacing
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>Deeper Integrations:</strong> Notion, Jira, Email triage sync
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-amber-400 shrink-0" /> <strong>StoreKit Managed:</strong> 100% managed securely by Apple
              </li>
            </ul>
          </div>
          <div className="pt-4 border-t border-amber-500/20 text-[11px] font-mono text-amber-400">
            One subscription · Instant access on iPhone, iPad &amp; Mac.
          </div>
        </div>
      </div>
    </motion.div>
  )
}
