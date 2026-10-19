'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flag,
  ChevronDown,
  Check,
  Pause,
  Play,
  Sparkles,
} from 'lucide-react'

const BEATS = [
  {
    id: 0,
    duration: 4000,
    bgWord: 'LIVE BRIDGE',
    label: '01 / LIVE HABIT ↔ SECOND BRAIN CONNECTION',
    caption:
      'Start a "Study programming codeacademy" Focus session in Productivity—your linked Second Brain project loads automatically.',
    camera: { scale: 1.03, x: 10, y: 0, rotateX: 4, rotateY: -3 },
  },
  {
    id: 1,
    duration: 4200,
    bgWord: 'DEEP FOCUS',
    label: '02 / COUNTDOWN TIMER & FOCUS PILLARS IGNITE',
    caption:
      'As the 118:36 timer runs, the dual vertical focus pillars and habit target bar ("80 min focused to done") track every minute.',
    camera: { scale: 1.07, x: 45, y: -5, rotateX: 3, rotateY: 4 },
  },
  {
    id: 2,
    duration: 4200,
    bgWord: 'TASK DRAWER',
    label: '03 / LINKED PROJECT & MICROTASK EXECUTION',
    caption:
      'On the right, "Mathematics for machine..." displays "Week 2 · Solving systems of linear equations: Elimination" (Oct 20 · Mid).',
    camera: { scale: 1.07, x: -45, y: -5, rotateX: 4, rotateY: -4 },
  },
  {
    id: 3,
    duration: 4600,
    bgWord: '33% PROGRESS',
    label: '04 / CHECKING OFF "READING · 10 MIN" IN FOCUS MODE',
    caption:
      'Complete "Reading · 10 min" right inside the Focus timer—the project badge reactively jumps to 33% without switching apps.',
    camera: { scale: 1.08, x: -35, y: -10, rotateX: 3, rotateY: -3 },
  },
  {
    id: 4,
    duration: 4800,
    bgWord: 'REACTIVE SYNC',
    label: '05 / MULTI-STEP MICROTASK & HABIT BAR PROGRESSION',
    caption:
      'Each completed micro-task reactively advances the Second Brain project (33% → 67% → 100%) and fills the 80-min habit quota.',
    camera: { scale: 1.05, x: 0, y: -8, rotateX: 4, rotateY: 2 },
  },
  {
    id: 5,
    duration: 4400,
    bgWord: 'UNIFIED FLOW',
    label: '06 / ONE SESSION, TWO APPS UPDATED INSTANTLY',
    caption:
      'When you tap End or finish your block, your Productivity Habit streak and Second Brain Project tree are both 100% up to date.',
    camera: { scale: 1.02, x: 0, y: 0, rotateX: 2, rotateY: 0 },
  },
] as const

interface FocusMicrotask {
  id: string
  title: string
  minutes: number
  shortMin: string
}

const FOCUS_MICROTASKS: FocusMicrotask[] = [
  { id: 'm1', title: 'Reading · 10 min', minutes: 10, shortMin: '10m' },
  { id: 'm2', title: 'Quiz: Solving systems of linear equations · 30 min', minutes: 30, shortMin: '30m' },
  { id: 'm3', title: 'System of equations as a matrix · 40 min', minutes: 40, shortMin: '40m' },
]

function BooksBadgeIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <rect x="3.5" y="4" width="3.8" height="16" rx="1" fill="currentColor" />
      <rect x="9" y="6" width="3.8" height="14" rx="1" fill="currentColor" />
      <rect
        x="15.2"
        y="4.5"
        width="3.8"
        height="15.5"
        rx="1"
        transform="rotate(-12 15.2 4.5)"
        fill="currentColor"
      />
    </svg>
  )
}

export function SecondBrainProductivityBridgeMotion() {
  const [beatIndex, setBeatIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState<string[]>(['m1'])
  const [drawerOpen, setDrawerOpen] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(36)
  const [timerMinutes, setTimerMinutes] = useState(118)
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateViewport = () => {
      const w = window.innerWidth
      if (w < 640) setViewport('mobile')
      else if (w < 1024) setViewport('tablet')
      else setViewport('desktop')
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const currentBeat = BEATS[beatIndex]

  const responsiveCamera =
    viewport === 'mobile'
      ? { scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 }
      : viewport === 'tablet'
      ? {
          scale: Math.min(currentBeat.camera.scale, 1.03),
          x: currentBeat.camera.x * 0.35,
          y: currentBeat.camera.y * 0.5,
          rotateX: currentBeat.camera.rotateX * 0.6,
          rotateY: currentBeat.camera.rotateY * 0.6,
        }
      : currentBeat.camera

  // Advance narrative beats automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      setBeatIndex((prev) => (prev + 1) % BEATS.length)
    }, currentBeat.duration)
    return () => clearTimeout(timer)
  }, [beatIndex, currentBeat.duration])

  // Live 1-second countdown ticker so the timer feels genuinely alive
  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev > 0) return prev - 1
        setTimerMinutes((m) => (m > 100 ? m - 1 : 118))
        return 59
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [isPaused])

  // Synchronize multi-step state with narrative beats while preserving reactive interactivity
  useEffect(() => {
    if (beatIndex === 0) {
      setCompletedIds([])
      setDrawerOpen(true)
      setTimerMinutes(119)
      setTimerSeconds(12)
      setIsPaused(false)
    } else if (beatIndex === 1) {
      setCompletedIds([])
      setDrawerOpen(true)
      setTimerMinutes(118)
      setTimerSeconds(48)
    } else if (beatIndex === 2) {
      setCompletedIds([])
      setDrawerOpen(true)
      setTimerMinutes(118)
      setTimerSeconds(39)
    } else if (beatIndex === 3) {
      // Exact screenshot state: 118:36, Reading · 10 min checked, 33% badge
      setCompletedIds(['m1'])
      setDrawerOpen(true)
      setTimerMinutes(118)
      setTimerSeconds(36)
    } else if (beatIndex === 4) {
      // Multi-step reactive cascade: m1 -> m1+m2 (67%) -> m1+m2+m3 (100%)
      setCompletedIds(['m1'])
      const t1 = setTimeout(() => setCompletedIds(['m1', 'm2']), 1100)
      const t2 = setTimeout(() => setCompletedIds(['m1', 'm2', 'm3']), 2600)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    } else if (beatIndex === 5) {
      setCompletedIds(['m1', 'm2', 'm3'])
      setDrawerOpen(true)
    }
  }, [beatIndex])

  // Reactive derived metrics
  const completedCount = completedIds.length
  const projectPercent =
    completedCount === 0
      ? 0
      : completedCount === 1
      ? 33
      : completedCount === 2
      ? 67
      : 100

  // In Beat 3 (the exact screenshot state), show "0 / 80 min focused to done · 4:50 PM" or reactive minutes in Beats 4-5
  const focusedMinutes =
    beatIndex <= 3 && completedCount <= 1
      ? 0
      : FOCUS_MICROTASKS.filter((m) => completedIds.includes(m.id)).reduce(
          (acc, item) => acc + item.minutes,
          0
        )

  const sliderProgressPercent =
    beatIndex <= 3 && completedCount <= 1
      ? 2
      : Math.min(100, Math.max(8, Math.round((focusedMinutes / 80) * 100)))

  const pillarFillPercent =
    completedCount === 0
      ? 14
      : completedCount === 1
      ? 36
      : completedCount === 2
      ? 68
      : 100

  const toggleMicrotask = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <section className="py-10 sm:py-12 px-3 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 px-1">
          <div>
            <p className="kicker text-[#FF6900] mb-1.5 sm:mb-2">
              CROSS-APP EXECUTION ENGINE
            </p>
            <h3 className="type-title text-2xl sm:text-5xl font-bold uppercase tracking-tight text-white">
              Live Connection to Productivity Focus
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-white/45">
            {currentBeat.label}
          </p>
        </div>

        {/* Separate Global .access-glass Container */}
        <div
          className="access-glass relative min-h-[620px] sm:min-h-[700px] flex flex-col items-center justify-center overflow-hidden select-none px-2.5 py-6 sm:px-8 sm:py-10"
          style={{ perspective: '1600px' }}
        >
          {/* Ambient warm copper glow */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              background:
                'radial-gradient(circle at 38% 45%, rgba(238, 107, 18, 0.14), transparent 68%)',
            }}
          />

          {/* GIANT KINETIC TYPOGRAPHY BEHIND THE UI */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentBeat.bgWord}
                initial={{ opacity: 0, scale: 0.88, y: 24, filter: 'blur(12px)' }}
                animate={{ opacity: 0.06, scale: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 1.08, y: -24, filter: 'blur(12px)' }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="font-display text-[4rem] sm:text-[10rem] md:text-[13.5rem] uppercase tracking-[-0.04em] text-white whitespace-nowrap leading-none"
              >
                {currentBeat.bgWord}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* 3D CAMERA RIG */}
          <motion.div
            animate={responsiveCamera}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative z-10 w-full max-w-[960px] pb-12 sm:pb-10"
          >
            {/* Landscape iPad / Desktop Focus Studio Frame (No left link dock & no bottom nav bar) */}
            <div
              className="rounded-[26px] sm:rounded-[32px] border border-white/[0.12] overflow-hidden shadow-[0_32px_95px_rgba(0,0,0,0.92)] relative p-4 sm:p-7 md:p-8"
              style={{
                background:
                  'radial-gradient(circle at 29% 38%, rgba(128, 56, 10, 0.34), rgba(18, 9, 4, 0.96) 54%, #030304 100%)',
              }}
            >
              {/* Main Grid: Left Focus Timer + Right Second Brain Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* =========================================================
                    LEFT SIDE: HABIT FOCUS TIMER & DUAL PILLARS (6 cols on lg)
                ========================================================= */}
                <div className="lg:col-span-6 flex flex-col items-center">
                  {/* Top Habit Header Pill: Orange Books Icon + "Study programming codeacademy" */}
                  <div className="flex items-center gap-2.5 sm:gap-3 mb-2 sm:mb-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-[12px] sm:rounded-[14px] bg-[#EE6B12] flex items-center justify-center text-white shadow-[0_0_28px_rgba(238,107,18,0.55)]">
                      <BooksBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <h4 className="text-[15px] sm:text-[19px] font-bold text-white tracking-tight">
                      Study programming codeacademy
                    </h4>
                  </div>

                  {/* Giant Tabular Countdown Clock: 118:36 */}
                  <div className="text-[3.6rem] sm:text-[5.5rem] md:text-[6.2rem] font-bold text-white tracking-tight leading-none tabular-nums my-1 sm:my-2">
                    {timerMinutes}:{timerSeconds.toString().padStart(2, '0')}
                  </div>

                  {/* Progress Slider Line with Orange Dot */}
                  <div className="w-full max-w-[430px] mt-3 sm:mt-4">
                    <div className="relative h-1.5 rounded-full bg-[#3A291E] flex items-center">
                      <motion.div
                        animate={{ width: `${sliderProgressPercent}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="h-full rounded-full bg-[#FF6900]"
                      />
                      <motion.div
                        animate={{ left: `calc(${sliderProgressPercent}% - 6px)` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="w-3 h-3 rounded-full bg-[#FF6900] shadow-[0_0_12px_#FF6900] absolute"
                      />
                    </div>

                    {/* Flag + "0 / 80 min focused to done · 4:50 PM" */}
                    <div className="flex items-center justify-center gap-1.5 mt-2.5 text-[11.5px] sm:text-[13.5px]">
                      <Flag className="w-3.5 h-3.5 text-white/90" />
                      <span className="font-semibold text-white/95 tabular-nums">
                        {focusedMinutes} / 80 min focused to done
                      </span>
                      <span className="text-[#8E8E93] font-medium">· 4:50 PM</span>
                    </div>
                  </div>

                  {/* Two Tall Vertical Focus Pillars (Exact Screenshot Geometry) */}
                  <div className="flex items-end justify-center gap-7 sm:gap-11 mt-5 sm:mt-7 h-[150px] sm:h-[220px]">
                    {[0, 1].map((pillarIdx) => (
                      <div
                        key={pillarIdx}
                        className="w-11 sm:w-14 h-full border border-[#8C4514] bg-black/25 relative overflow-hidden flex items-end"
                      >
                        <motion.div
                          animate={{ height: `${pillarFillPercent}%` }}
                          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                          className="w-full"
                          style={{
                            background:
                              'linear-gradient(180deg, rgba(255, 105, 0, 0.38) 0%, rgba(140, 56, 10, 0.18) 100%)',
                            boxShadow: 'inset 0 2px 12px rgba(255, 122, 26, 0.35)',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* =========================================================
                    RIGHT SIDE: CONNECTED SECOND BRAIN PROJECT & MICROTASKS (6 cols on lg)
                ========================================================= */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-5 sm:space-y-6">
                  {/* Connected Second Brain Outer Card */}
                  <motion.div
                    animate={
                      beatIndex >= 2 && beatIndex <= 4
                        ? {
                            borderColor: 'rgba(255, 105, 0, 0.32)',
                            boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85)',
                          }
                        : {}
                    }
                    className="rounded-[24px] sm:rounded-[28px] bg-[#08080A]/95 border border-white/[0.08] p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 shadow-2xl"
                  >
                    {/* Top Project Header: Books Icon + "Mathematics for machine..." + Reactive "33%" Pill */}
                    <div className="flex items-center justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[13px] sm:rounded-[15px] bg-[#EA6A12] flex items-center justify-center text-white shrink-0 shadow-[0_4px_18px_rgba(234,106,18,0.4)]">
                          <BooksBadgeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <h5 className="text-[15.5px] sm:text-[18px] font-bold text-white truncate">
                          Mathematics for machine...
                        </h5>
                      </div>

                      {/* Reactive Completion Percentage Pill (0% -> 33% -> 67% -> 100%) */}
                      <motion.div
                        key={projectPercent}
                        initial={{ scale: 0.88, opacity: 0.7 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        className={`px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-[12px] text-[13.5px] sm:text-[15px] font-bold shrink-0 tabular-nums ${
                          projectPercent === 100
                            ? 'bg-[#132E1B] text-[#34C759]'
                            : 'bg-[#2C1808] text-[#FF7A1A]'
                        }`}
                      >
                        {projectPercent}%
                      </motion.div>
                    </div>

                    {/* Inner Task & Micro-Tasks Card */}
                    <div className="rounded-[18px] sm:rounded-[22px] bg-[#0D0D10] border border-white/[0.07] overflow-hidden">
                      {/* Parent Task Header */}
                      <div className="p-3.5 sm:p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-[14.5px] sm:text-[16.5px] font-medium text-white leading-snug">
                            Week 2 · Solving systems of linear equations: Elimination
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              setCompletedIds(
                                completedCount === FOCUS_MICROTASKS.length
                                  ? []
                                  : FOCUS_MICROTASKS.map((m) => m.id)
                              )
                            }
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                              projectPercent === 100
                                ? 'bg-[#34C759] border-2 border-[#34C759] text-white'
                                : 'border-2 border-[#FF6900]'
                            }`}
                          >
                            {projectPercent === 100 && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </button>
                        </div>

                        {/* Task Meta Row: Oct 20 | Mid | Expand Chevron */}
                        <div className="flex items-center justify-between pt-0.5">
                          <span className="px-2.5 sm:px-3 py-1 rounded-[10px] border border-[#8E4714] bg-[#1A1008] text-[11.5px] sm:text-[12.5px] text-[#A1A1AA] font-medium flex items-center gap-1.5">
                            <Flag className="w-3 h-3 text-[#A1A1AA]" />
                            Oct 20
                          </span>

                          <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-[9px] bg-[#E5A018] text-[11.5px] sm:text-[12.5px] font-bold text-white">
                            Mid
                          </span>

                          <button
                            type="button"
                            onClick={() => setDrawerOpen((prev) => !prev)}
                            className="p-1 text-[#FF6900] hover:opacity-80 transition-transform"
                          >
                            <ChevronDown
                              className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${
                                drawerOpen ? 'rotate-0' : '-rotate-90'
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Divider + Reactive Micro-Tasks List */}
                      <AnimatePresence initial={false}>
                        {drawerOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28 }}
                            className="border-t border-white/[0.06] px-3.5 sm:px-4 py-2.5 sm:py-3 space-y-2.5"
                          >
                            {(beatIndex <= 3
                              ? FOCUS_MICROTASKS.slice(0, 1)
                              : FOCUS_MICROTASKS
                            ).map((item) => {
                              const isDone = completedIds.includes(item.id)
                              return (
                                <motion.div
                                  key={item.id}
                                  layout
                                  onClick={() => toggleMicrotask(item.id)}
                                  className="flex items-center justify-between gap-3 cursor-pointer group py-0.5"
                                >
                                  <span
                                    className={`text-[13.5px] sm:text-[15px] transition-all truncate ${
                                      isDone
                                        ? 'line-through text-[#6E6E73]'
                                        : 'text-white/90 group-hover:text-white'
                                    }`}
                                  >
                                    {item.title}
                                  </span>

                                  <div className="flex items-center gap-2.5 shrink-0">
                                    <span className="text-[11.5px] sm:text-[12.5px] text-[#6E6E73] font-medium tabular-nums">
                                      {item.shortMin}
                                    </span>
                                    <motion.div
                                      animate={
                                        isDone
                                          ? { scale: [0.85, 1.12, 1], backgroundColor: '#34C759' }
                                          : { scale: 1, backgroundColor: 'rgba(255,255,255,0)' }
                                      }
                                      transition={{ duration: 0.25 }}
                                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                        isDone
                                          ? 'bg-[#34C759] text-white shadow-[0_0_14px_rgba(52,199,89,0.45)]'
                                          : 'border-2 border-white/25 text-transparent group-hover:border-[#FF6900]'
                                      }`}
                                    >
                                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                                    </motion.div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Subtle Reactive Sync Status Banner during Beats 4 & 5 */}
                    <AnimatePresence>
                      {beatIndex >= 4 && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="rounded-[14px] bg-[#132618]/80 border border-[#30D158]/30 px-3 py-2 flex items-center justify-between text-[11px] sm:text-[12px] text-[#34C759]"
                        >
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Sparkles className="w-3.5 h-3.5 shrink-0" />
                            <span>
                              Synced to Second Brain · {completedCount}/3 microtasks complete
                            </span>
                          </div>
                          <span className="font-mono font-bold">{projectPercent}%</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Circular Pause & Red "End" Controls Row */}
                  <div className="flex items-center justify-between px-4 sm:px-6">
                    <button
                      type="button"
                      onClick={() => setIsPaused((prev) => !prev)}
                      className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#2C2520] hover:bg-[#382F29] border border-white/[0.06] flex items-center justify-center text-white transition-transform active:scale-95 shadow-lg"
                    >
                      {isPaused ? (
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-0.5" />
                      ) : (
                        <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-white" />
                      )}
                    </button>

                    <motion.button
                      type="button"
                      animate={
                        beatIndex === 5
                          ? {
                              scale: [1, 1.08, 1],
                              boxShadow: '0 0 28px rgba(255, 69, 58, 0.55)',
                            }
                          : {}
                      }
                      onClick={() => setBeatIndex(0)}
                      className="w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-[#FF453A] hover:bg-[#FF584E] flex items-center justify-center text-[13.5px] sm:text-[15px] font-bold text-white transition-transform active:scale-95 shadow-[0_8px_24px_rgba(255,69,58,0.35)]"
                    >
                      End
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* BOTTOM CAPTION OVERLAY */}
          <div className="pointer-events-none absolute bottom-4 sm:bottom-5 inset-x-0 flex justify-center px-4 sm:px-6 z-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBeat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="rounded-2xl sm:rounded-full bg-black/75 backdrop-blur-md border border-white/12 px-4 sm:px-5 py-2 sm:py-2.5 text-center shadow-lg max-w-[95%]"
              >
                <p className="text-[11px] sm:text-sm text-white/90 font-medium tracking-wide leading-snug">
                  {currentBeat.caption}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
