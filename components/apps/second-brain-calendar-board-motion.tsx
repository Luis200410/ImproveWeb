'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  MoreVertical,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Columns3,
  ListFilter,
  ClipboardList,
  CheckCircle2,
  Ban,
  Hourglass,
  Check,
  PanelLeft,
  Repeat2,
  Sparkles,
} from 'lucide-react'

const BEATS = [
  {
    id: 0,
    duration: 3800,
    bgWord: 'MICROTASKS',
    label: '01 / TO-DO MICROTASK QUEUE',
    caption: 'Every AI-generated micro-task sits in your To-Do queue with duration estimates and day tags.',
    camera: { scale: 1.12, x: 180, y: 10, rotateX: 4, rotateY: 8 },
  },
  {
    id: 1,
    duration: 4000,
    bgWord: 'TELEMETRY',
    label: '02 / EASY LOOKERS',
    caption: 'Instant counters track Total Microtasks (1st), Complete (2nd), Incomplete (3rd), and Overdue (4th).',
    camera: { scale: 1.16, x: -40, y: 155, rotateX: 6, rotateY: -3 },
  },
  {
    id: 2,
    duration: 4000,
    bgWord: 'ACTIONERS',
    label: '03 / BOARD ACTIONERS',
    caption: 'Switch column grids, jump to Today, Filter calendar events in-place, or add a + New micro-task.',
    camera: { scale: 1.32, x: -210, y: 120, rotateX: 5, rotateY: -6 },
  },
  {
    id: 3,
    duration: 3800,
    bgWord: '1-DAY VIEW',
    label: '04 / DYNAMIC DAY FILTER (1 DAY)',
    caption: 'Choose from Auto, 1 day, 3 days, 5 days, or Week to focus solely on today’s 30m execution block.',
    camera: { scale: 1.08, x: -50, y: 15, rotateX: 4, rotateY: -2 },
  },
  {
    id: 4,
    duration: 3800,
    bgWord: '3-DAY BOARD',
    label: '05 / 3-DAY MULTI-COLUMN HORIZON',
    caption: 'Expand to 3 days to see Monday’s 45m load alongside upcoming Tuesday and Wednesday slots.',
    camera: { scale: 1.04, x: -60, y: 0, rotateX: 4, rotateY: -3 },
  },
  {
    id: 5,
    duration: 4000,
    bgWord: '7-DAY WEEK',
    label: '06 / FULL 7-DAY HABIT HORIZON',
    caption: 'Scale all the way to 7 days—automatically highlighting days where your Productivity habit runs.',
    camera: { scale: 1.02, x: -70, y: -5, rotateX: 5, rotateY: 0 },
  },
  {
    id: 6,
    duration: 4600,
    bgWord: 'DRAG & DROP',
    label: '07 / TACTILE DAY DROP (HABIT-AWARE)',
    caption: 'Drag any micro-task into a day column—highlighting the active drop column with the green + badge.',
    camera: { scale: 1.1, x: -85, y: -10, rotateX: 4, rotateY: -3 },
  },
  {
    id: 7,
    duration: 5000,
    bgWord: 'AI RE-PLAN',
    label: '08 / AUTOMATIC AI INCOMPLETE ROLLOVER',
    caption: 'Unfinished micro-tasks are automatically moved by AI to your next scheduled Productivity habit day.',
    camera: { scale: 1.08, x: -75, y: -5, rotateX: 3, rotateY: -2 },
  },
] as const

const TODO_MICROTASKS = [
  { id: 'm1', title: 'Reading • 10 min', dayBadge: '1 day' },
  { id: 'm2', title: 'Solving non-singular system of linear equations', dayBadge: '1 day' },
  { id: 'm3', title: 'Solving singular system of linesr austians', dayBadge: '1 day' },
  { id: 'm4', title: 'Solving system of equations with more variables', dayBadge: null },
  { id: 'm5', title: 'Interactive Tool: Graphical Representation of Linear Systems with 3 variables', dayBadge: null },
  { id: 'm6', title: 'Matrix row-reduction', dayBadge: null },
  { id: 'm7', title: 'Row operations that preserve singularity', dayBadge: null },
  { id: 'm8', title: 'Solving systems of linear equations: Elimination', dayBadge: null },
  { id: 'm9', title: 'Practice Quiz', dayBadge: null },
]

export function SecondBrainCalendarBoardMotion() {
  const [beatIndex, setBeatIndex] = useState(0)
  const [activeLookerIdx, setActiveLookerIdx] = useState<number | null>(null)
  const [activeActionerIdx, setActiveActionerIdx] = useState<number | null>(null)
  const [selectedColumnMode, setSelectedColumnMode] = useState<'Auto' | '1 day' | '3 days' | '5 days' | 'Week'>('1 day')
  const [dropPhase, setDropPhase] = useState<'hover-mon' | 'landed-mon'>('hover-mon')
  const [aiMovePhase, setAiMovePhase] = useState<'detect' | 'moving' | 'landed'>('detect')
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')

  useEffect(() => {
    const updateViewport = () => {
      const w = window.innerWidth
      if (w < 768) setViewport('mobile')
      else if (w < 1024) setViewport('tablet')
      else setViewport('desktop')
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const currentBeat = BEATS[beatIndex]

  // Responsive camera rig so mobile & iPad never pan off-screen
  const responsiveCamera =
    viewport === 'mobile'
      ? {
          scale: 1,
          x: 0,
          y: 0,
          rotateX: 0,
          rotateY: 0,
        }
      : viewport === 'tablet'
      ? {
          scale: Math.min(currentBeat.camera.scale, 1.08),
          x: currentBeat.camera.x * 0.45,
          y: currentBeat.camera.y * 0.5,
          rotateX: currentBeat.camera.rotateX * 0.6,
          rotateY: currentBeat.camera.rotateY * 0.6,
        }
      : currentBeat.camera

  const [typedSubtitle, setTypedSubtitle] = useState('')

  useEffect(() => {
    const fullText = currentBeat.caption
    setTypedSubtitle('')
    let i = 0
    const interval = setInterval(() => {
      i += 1
      setTypedSubtitle(fullText.slice(0, i))
      if (i >= fullText.length) {
        clearInterval(interval)
      }
    }, 28)
    return () => clearInterval(interval)
  }, [beatIndex, currentBeat.caption])

  // Advance narrative beats automatically — unhurried pace for clear reading
  useEffect(() => {
    const timer = setTimeout(() => {
      setBeatIndex((prev) => (prev + 1) % BEATS.length)
    }, currentBeat.duration + 900)
    return () => clearTimeout(timer)
  }, [beatIndex, currentBeat.duration])

  // Sub-animations inside each beat
  useEffect(() => {
    if (beatIndex === 0) {
      setActiveLookerIdx(null)
      setActiveActionerIdx(null)
      setSelectedColumnMode('1 day')
    }

    if (beatIndex === 1) {
      setActiveLookerIdx(0)
      const t1 = setTimeout(() => setActiveLookerIdx(1), 1000)
      const t2 = setTimeout(() => setActiveLookerIdx(2), 2000)
      const t3 = setTimeout(() => setActiveLookerIdx(3), 3000)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    } else {
      setActiveLookerIdx(null)
    }

    if (beatIndex === 2) {
      setActiveActionerIdx(0)
      const t1 = setTimeout(() => setActiveActionerIdx(1), 1000)
      const t2 = setTimeout(() => setActiveActionerIdx(2), 2000)
      const t3 = setTimeout(() => setActiveActionerIdx(3), 3000)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
        clearTimeout(t3)
      }
    } else {
      setActiveActionerIdx(null)
    }

    if (beatIndex === 3) {
      setSelectedColumnMode('1 day')
      const t1 = setTimeout(() => setSelectedColumnMode('3 days'), 2600)
      return () => clearTimeout(t1)
    }

    if (beatIndex === 4) {
      setSelectedColumnMode('3 days')
    }

    if (beatIndex === 5) {
      setSelectedColumnMode('5 days')
      const t1 = setTimeout(() => setSelectedColumnMode('Week'), 1500)
      return () => clearTimeout(t1)
    }

    if (beatIndex === 6) {
      setDropPhase('hover-mon')
      const t1 = setTimeout(() => setDropPhase('landed-mon'), 3000)
      return () => clearTimeout(t1)
    }

    if (beatIndex === 7) {
      setAiMovePhase('detect')
      const t1 = setTimeout(() => setAiMovePhase('moving'), 1100)
      const t2 = setTimeout(() => setAiMovePhase('landed'), 3300)
      return () => {
        clearTimeout(t1)
        clearTimeout(t2)
      }
    }
  }, [beatIndex])

  const completeCount = beatIndex === 7 && aiMovePhase === 'landed' ? 1 : 0
  const incompleteCount = 9 - completeCount

  const lookerCards = [
    {
      value: 9,
      label: 'Total Microtasks',
      icon: ClipboardList,
    },
    {
      value: completeCount,
      label: 'Complete Tasks',
      icon: CheckCircle2,
    },
    {
      value: incompleteCount,
      label: 'Incomplete Tasks',
      icon: Ban,
    },
    {
      value: 0,
      label: 'Overdue Tasks',
      icon: Hourglass,
    },
  ]

  return (
    <section className="py-6 sm:py-10 px-3 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header Outside Container — Dynamic Beat Title */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 px-1">
          <div>
            <p className="kicker text-[#FF6900] mb-1">ADAPTIVE DAY BOARD & HABIT SYNC</p>
            <div className="min-h-[32px] sm:min-h-[48px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={`outside-title-${currentBeat.id}`}
                  initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 8, filter: 'blur(6px)' }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.06em] text-white leading-none text-left"
                >
                  {currentBeat.bgWord}
                </motion.h3>
              </AnimatePresence>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-white/45">
            {currentBeat.label}
          </p>
        </div>

        {/* Separate Global .access-glass Container (Fits in one frame) */}
        <div
          className="access-glass relative min-h-[540px] sm:min-h-[640px] flex flex-col justify-between overflow-hidden select-none px-3 py-4 sm:px-6 sm:py-6"
          style={{ perspective: '1500px' }}
        >
          {/* Ambient radial glow */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(255, 105, 0, 0.09), transparent 68%)',
            }}
          />

          {/* MAIN STAGE: 3D UI CARD STAGE (ALWAYS PRESENT) */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center py-1">
            {/* 3D CAMERA RIG */}
            <motion.div
              animate={responsiveCamera}
              transition={{
                duration: 0.9,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ transformStyle: 'preserve-3d' }}
              className="relative z-10 w-full max-w-[1040px] flex flex-col gap-3 sm:gap-3.5"
            >
            {/* =====================================================================
                TOP ROW: 4 EASY LOOKERS (2x2 on cellphone/tablet, 4-col on desktop)
            ===================================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              {lookerCards.map((item, idx) => {
                const Icon = item.icon
                const isHighlighted = activeLookerIdx === idx
                const isAiPulse = beatIndex === 7 && aiMovePhase === 'landed' && (idx === 1 || idx === 2)

                return (
                  <motion.div
                    key={item.label}
                    animate={{
                      scale: isHighlighted || isAiPulse ? 1.03 : 1,
                      borderColor:
                        isHighlighted || isAiPulse
                          ? 'rgba(255, 105, 0, 0.7)'
                          : 'rgba(255, 255, 255, 0.08)',
                    }}
                    className="rounded-[16px] sm:rounded-[18px] bg-[#161618] border border-white/[0.08] px-3 py-2.5 sm:px-4 sm:py-3.5 flex items-center justify-between shadow-[0_12px_30px_rgba(0,0,0,0.45)] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                      <motion.span
                        key={item.value}
                        initial={{ scale: 1.25, color: '#FF6900' }}
                        animate={{
                          scale: 1,
                          color: isAiPulse ? '#FF6900' : '#FFFFFF',
                        }}
                        className="text-lg sm:text-2xl font-bold tracking-tight shrink-0"
                      >
                        {item.value}
                      </motion.span>
                      <span className="text-[11px] sm:text-[13px] font-medium text-[#8E8E93] truncate">
                        {item.label}
                      </span>
                    </div>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[9px] sm:rounded-[10px] bg-[#242426] flex items-center justify-center text-[#8E8E93] shrink-0 ml-1.5">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* =====================================================================
                WORKSPACE SPLIT:
                - On Mobile (<768px): Shows To-Do Panel full-width on Beat 0,
                  and Calendar Day Board full-width on Beats 1–7 so nothing is cramped.
                - On iPad & Desktop (>=768px): Side-by-side 12-col split.
            ===================================================================== */}
            <div className="grid grid-cols-12 gap-3.5 items-stretch min-h-[430px] sm:min-h-[485px]">
              {/* LEFT PANEL: TO-DO MICROTASKS (Screenshot 1) */}
              <motion.div
                animate={{
                  opacity: beatIndex === 0 ? 1 : 0.92,
                  borderColor:
                    beatIndex === 0 ? 'rgba(255, 105, 0, 0.45)' : 'rgba(255, 255, 255, 0.09)',
                }}
                className={`${
                  beatIndex === 0 ? 'col-span-12 md:col-span-4 flex' : 'hidden md:flex md:col-span-4'
                } rounded-[22px] sm:rounded-[24px] bg-[#141416] border border-white/[0.09] p-3.5 sm:p-4 flex-col justify-between relative shadow-[0_24px_60px_rgba(0,0,0,0.65)]`}
              >
                <div>
                  {/* To-Do Header */}
                  <div className="flex items-center justify-between mb-3.5">
                    <h4 className="text-[19px] sm:text-[20px] font-bold text-white tracking-tight">
                      To-Do
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FF6900] flex items-center justify-center text-white shadow-[0_0_16px_rgba(255,105,0,0.45)]">
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      </div>
                      <div className="w-8 h-8 rounded-full bg-[#242426] flex items-center justify-center text-[#8E8E93]">
                        <MoreVertical className="w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* MICROTASKS Section Subheader */}
                  <div className="flex items-center justify-between px-1 mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[#FF6900] text-[10px]">▼</span>
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#EBEBF5]">
                        MICROTASKS
                      </span>
                    </div>
                    <span className="text-[12px] font-semibold text-[#8E8E93]">9</span>
                  </div>

                  {/* Microtasks List Container */}
                  <div className="rounded-[18px] bg-[#1C1C1E] border border-white/[0.07] divide-y divide-white/[0.06] overflow-hidden">
                    {TODO_MICROTASKS.slice(0, 7).map((task, idx) => {
                      const isDone = idx === 0 && beatIndex === 7 && aiMovePhase === 'landed'
                      return (
                        <div
                          key={task.id}
                          className="px-3.5 py-2.5 flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0">
                            <p
                              className={`text-[12.5px] font-medium leading-snug truncate ${
                                isDone ? 'line-through text-white/40' : 'text-[#F2F2F7]'
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.dayBadge && (
                              <div className="flex items-center gap-1.5 mt-1 text-[#FF6900]">
                                <Calendar className="w-3 h-3" />
                                <span className="text-[11px] font-semibold">{task.dayBadge}</span>
                              </div>
                            )}
                          </div>

                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isDone
                                ? 'bg-[#FF6900] border-[#FF6900]'
                                : 'border-[#FF6900] bg-transparent'
                            }`}
                          >
                            {isDone && <Check className="w-3 h-3 text-white stroke-[3]" />}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Bottom-Left Sidebar Toggle Pill from Screenshot 1 */}
                <div className="pt-2.5 flex items-center justify-between">
                  <div className="w-9 h-8 rounded-[10px] bg-[#1C1C1E] border border-white/10 flex items-center justify-center text-white/80">
                    <PanelLeft className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] text-[#8E8E93]">9 items in backlog</span>
                </div>
              </motion.div>

              {/* RIGHT PANEL: CALENDAR DAY BOARD (Screenshots 2, 3, 4, 6) */}
              <div
                className={`${
                  beatIndex === 0 ? 'hidden md:flex md:col-span-8' : 'col-span-12 md:col-span-8 flex'
                } rounded-[22px] sm:rounded-[24px] bg-[#121214] border border-white/[0.09] flex-col relative overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.65)]`}
              >
                {/* Calendar Top Bar + Actioners (Screenshot 4) */}
                <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-2.5">
                  {/* Month Title + Prev/Next */}
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h4 className="text-[17px] sm:text-[20px] font-bold text-white tracking-tight">
                      October 2026
                    </h4>
                    <div className="flex items-center rounded-[10px] bg-[#1C1C1E] border border-white/[0.07] px-1.5 py-1 gap-1 sm:gap-1.5 text-white/80">
                      <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>

                  {/* 4 ACTIONERS: Columns | Today | Filter | + New */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 relative">
                    {/* 1. Columns Actioner */}
                    <motion.div
                      animate={{
                        scale: activeActionerIdx === 0 || beatIndex === 3 ? 1.06 : 1,
                        borderColor:
                          activeActionerIdx === 0 || beatIndex === 3
                            ? '#FF6900'
                            : 'rgba(255, 255, 255, 0.1)',
                      }}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[10px] sm:rounded-[11px] bg-[#1C1C1E] border border-white/10 flex items-center gap-1.5 text-[11.5px] sm:text-[13px] font-medium text-[#EBEBF5]"
                    >
                      <span>Columns</span>
                      <Columns3 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8E8E93]" />
                    </motion.div>

                    {/* 2. Today Actioner */}
                    <motion.div
                      animate={{
                        scale: activeActionerIdx === 1 ? 1.06 : 1,
                        borderColor:
                          activeActionerIdx === 1 ? '#FF6900' : 'rgba(255, 255, 255, 0.1)',
                      }}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[10px] sm:rounded-[11px] bg-[#1C1C1E] border border-white/10 flex items-center gap-1.5 text-[11.5px] sm:text-[13px] font-medium text-[#EBEBF5]"
                    >
                      <span>Today</span>
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8E8E93]" />
                    </motion.div>

                    {/* 3. Filter Actioner */}
                    <motion.div
                      animate={{
                        scale: activeActionerIdx === 2 ? 1.06 : 1,
                        borderColor:
                          activeActionerIdx === 2 ? '#FF6900' : 'rgba(255, 255, 255, 0.1)',
                      }}
                      className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-[10px] sm:rounded-[11px] bg-[#1C1C1E] border border-white/10 flex items-center gap-1.5 text-[11.5px] sm:text-[13px] font-medium text-[#EBEBF5]"
                    >
                      <span>Filter</span>
                      <ListFilter className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8E8E93]" />
                    </motion.div>

                    {/* 4. + New Actioner */}
                    <motion.div
                      animate={{
                        scale: activeActionerIdx === 3 ? 1.08 : 1,
                      }}
                      className="px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-[10px] sm:rounded-[11px] bg-[#FF6900] flex items-center gap-1 text-[11.5px] sm:text-[13px] font-bold text-white shadow-[0_0_20px_rgba(255,105,0,0.45)]"
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                      <span>New</span>
                    </motion.div>
                  </div>
                </div>

                {/* COLUMNS DROPDOWN POPOVER (Screenshot 2 — anchored in same scene on Beat 3) */}
                <AnimatePresence>
                  {beatIndex === 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.28 }}
                      className="absolute top-[56px] left-1/2 -translate-x-1/2 sm:left-[38%] sm:translate-x-0 z-30 w-[200px] sm:w-[210px] rounded-[22px] bg-[#18181A]/95 backdrop-blur-xl border border-white/15 p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
                    >
                      {(['Auto', '1 day', '3 days', '5 days', 'Week'] as const).map((option) => {
                        const isSelected = selectedColumnMode === option
                        return (
                          <div
                            key={option}
                            className={`px-3.5 py-2 rounded-[12px] flex items-center gap-2.5 text-[13.5px] sm:text-[14px] font-medium transition-colors ${
                              isSelected ? 'bg-white/[0.08] text-white' : 'text-[#EBEBF5]/80'
                            }`}
                          >
                            <span className="w-4 flex items-center justify-center">
                              {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
                            </span>
                            <span>{option}</span>
                          </div>
                        )
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ===============================================================
                    DYNAMIC BOARD COLUMNS AREA
                =============================================================== */}
                <div className="flex-1 p-3 sm:p-4 relative flex flex-col">
                  <AnimatePresence mode="wait">
                    {/* 1-DAY VIEW (Screenshot 2 — Beats 0..3) */}
                    {beatIndex <= 3 && (
                      <motion.div
                        key="view-1day"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        className="flex-1 flex flex-col"
                      >
                        <div className="flex items-baseline justify-between mb-3 px-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-[12px] font-bold uppercase tracking-wider text-[#FF6900]">
                              MON
                            </span>
                            <span className="text-[20px] sm:text-[22px] font-bold text-[#FF6900]">
                              19
                            </span>
                          </div>
                          <span className="text-[12px] font-medium text-[#8E8E93]">30m</span>
                        </div>

                        <div className="space-y-2.5">
                          {[
                            { title: 'Reading • 10 min', dur: '15m' },
                            { title: 'Solving non-singular system of linear equations', dur: '15m' },
                          ].map((card) => (
                            <div
                              key={card.title}
                              className="rounded-[16px] bg-[#1C1C1E] border border-white/[0.08] px-3.5 sm:px-4 py-3 flex items-center justify-between gap-2"
                            >
                              <div className="flex items-stretch gap-3 min-w-0">
                                <div className="w-1 rounded-full bg-[#FF6900] shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-[13px] sm:text-[14px] font-semibold text-white leading-snug">
                                    {card.title}
                                  </p>
                                  <div className="flex items-center gap-1.5 mt-1 text-[#8E8E93]">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[11px]">{card.dur}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="w-5 h-5 rounded-full border-2 border-[#FF6900] shrink-0" />
                            </div>
                          ))}

                          <div className="rounded-[14px] border border-dashed border-[#FF6900]/40 py-2.5 flex items-center justify-center gap-1.5 text-[#FF6900] text-[13px] font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 3-DAY VIEW (Screenshot 3 — Beat 4) */}
                    {beatIndex === 4 && (
                      <motion.div
                        key="view-3day"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        className="flex-1 grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.07] gap-3 sm:gap-0"
                      >
                        {/* MON 19 */}
                        <div className="sm:pr-3.5 flex flex-col">
                          <div className="flex items-baseline justify-between mb-2.5 sm:mb-3">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[12px] font-bold uppercase text-[#FF6900]">
                                MON
                              </span>
                              <span className="text-[20px] sm:text-[22px] font-bold text-[#FF6900]">
                                19
                              </span>
                            </div>
                            <span className="text-[12px] font-medium text-[#8E8E93]">45m</span>
                          </div>
                          <div className="space-y-2">
                            {[
                              'Reading • 10 min',
                              'Solving non-singular system of linear equations',
                              'Solving singular system of linesr austians',
                            ].map((t) => (
                              <div
                                key={t}
                                className="rounded-[15px] bg-[#1C1C1E] border border-white/[0.08] p-2.5 sm:p-3 flex items-center justify-between gap-2"
                              >
                                <div className="flex items-stretch gap-2.5 min-w-0">
                                  <div className="w-1 rounded-full bg-[#FF6900] shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-[12.5px] sm:text-[13px] font-semibold text-white leading-snug">
                                      {t}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-[#8E8E93]">
                                      <Clock className="w-3 h-3" />
                                      <span className="text-[11px]">15m</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#FF6900] shrink-0" />
                              </div>
                            ))}
                            <div className="rounded-[14px] border border-dashed border-[#FF6900]/45 py-2 flex items-center justify-center gap-1.5 text-[#FF6900] text-[12.5px] font-semibold">
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </div>
                          </div>
                        </div>

                        {/* TUE 20 */}
                        <div className="pt-2.5 sm:pt-0 sm:px-3.5 flex flex-col">
                          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[12px] font-bold uppercase text-[#8E8E93]">
                                TUE
                              </span>
                              <span className="text-[20px] sm:text-[22px] font-bold text-white">
                                20
                              </span>
                            </div>
                          </div>
                          <div className="rounded-[14px] border border-dashed border-[#FF6900]/45 py-2 flex items-center justify-center gap-1.5 text-[#FF6900] text-[12.5px] font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </div>
                        </div>

                        {/* WED 21 */}
                        <div className="pt-2.5 sm:pt-0 sm:pl-3.5 flex flex-col">
                          <div className="flex items-baseline justify-between mb-2 sm:mb-3">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[12px] font-bold uppercase text-[#8E8E93]">
                                WED
                              </span>
                              <span className="text-[20px] sm:text-[22px] font-bold text-white">
                                21
                              </span>
                            </div>
                          </div>
                          <div className="rounded-[14px] border border-dashed border-[#FF6900]/45 py-2 flex items-center justify-center gap-1.5 text-[#FF6900] text-[12.5px] font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* 7-DAY WEEK HORIZON VIEW (Beat 5 — 2-col/4-col on mobile, 7-col on sm+) */}
                    {beatIndex === 5 && (
                      <motion.div
                        key="view-7day"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.32 }}
                        className="flex-1 grid grid-cols-2 sm:grid-cols-7 gap-2 sm:gap-0 sm:divide-x divide-white/[0.07]"
                      >
                        {[
                          { day: 'MON', num: '19', active: true, habit: true, load: '30m', tasks: ['Reading • 10m', 'Non-singular'] },
                          { day: 'TUE', num: '20', active: false, habit: true, load: '15m', tasks: ['Singular sys.'] },
                          { day: 'WED', num: '21', active: false, habit: false, load: '0m', tasks: [] },
                          { day: 'THU', num: '22', active: false, habit: true, load: '15m', tasks: ['More vars'] },
                          { day: 'FRI', num: '23', active: false, habit: true, load: '15m', tasks: ['Matrix row'] },
                          { day: 'SAT', num: '24', active: false, habit: false, load: '0m', tasks: [] },
                          { day: 'SUN', num: '25', active: false, habit: false, load: '0m', tasks: [] },
                        ].map((col, idx) => (
                          <div
                            key={col.num}
                            className={`${
                              idx >= 4 ? 'hidden sm:flex' : 'flex'
                            } p-2 sm:px-2 rounded-[12px] sm:rounded-none bg-white/[0.02] sm:bg-transparent flex-col justify-between`}
                          >
                            <div>
                              <div className="flex items-baseline justify-between mb-2">
                                <span
                                  className={`text-[10px] font-bold ${
                                    col.active ? 'text-[#FF6900]' : 'text-[#8E8E93]'
                                  }`}
                                >
                                  {col.day} {col.num}
                                </span>
                                <span className="text-[10px] text-[#8E8E93]">{col.load}</span>
                              </div>

                              {/* Productivity Habit Schedule Indicator */}
                              {col.habit && (
                                <div className="mb-2 px-1.5 py-1 rounded-[7px] bg-[#FF6900]/15 border border-[#FF6900]/35 flex items-center gap-1 text-[9px] font-bold text-[#FF6900]">
                                  <Repeat2 className="w-2.5 h-2.5 shrink-0" />
                                  <span className="truncate">Habit Day</span>
                                </div>
                              )}

                              <div className="space-y-1.5 mb-2">
                                {col.tasks.map((t) => (
                                  <div
                                    key={t}
                                    className="rounded-[10px] bg-[#1C1C1E] border border-white/[0.08] p-2 flex items-start gap-1.5"
                                  >
                                    <div className="w-0.5 h-6 rounded-full bg-[#FF6900] shrink-0 mt-0.5" />
                                    <span className="text-[10.5px] font-medium text-white leading-tight">
                                      {t}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-[10px] border border-dashed border-[#FF6900]/35 py-1.5 text-center text-[10px] font-semibold text-[#FF6900]">
                              + Add
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* ===============================================================
                        SCREENSHOT 6 VIEW: DRAG DROP & AI AUTO-MOVE (Beats 6 & 7)
                        - On Mobile (<640px): Focused 2-column (MON 19 | TUE 20) so the
                          warm brown highlight and floating green '+' pill are huge & clear!
                        - On Tablet/Desktop (>=640px): Full 4-column (SUN 18 | MON 19 | TUE 20 | WED 21)
                    =============================================================== */}
                    {(beatIndex === 6 || beatIndex === 7) && (
                      <motion.div
                        key="view-drag-and-ai"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                        className="flex-1 grid grid-cols-2 sm:grid-cols-4 divide-x divide-white/[0.07] relative -m-3 sm:-m-4 p-0"
                      >
                        {/* COL 1: SUN 18 (Hidden on narrow mobile so MON 19 & TUE 20 get full room) */}
                        <div className="hidden sm:flex p-3.5 flex-col">
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-[12px] font-bold uppercase text-[#8E8E93]">
                              SUN
                            </span>
                            <span className="text-[22px] font-bold text-white">18</span>
                          </div>
                          <div className="rounded-[14px] border border-dashed border-[#FF6900]/45 py-2.5 flex items-center justify-center gap-1.5 text-[#FF6900] text-[13px] font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </div>
                        </div>

                        {/* COL 2: MON 19 (Highlighted in warm brown #2C1D13 during Beat 6) */}
                        <motion.div
                          animate={{
                            backgroundColor:
                              beatIndex === 6
                                ? 'rgba(62, 37, 19, 0.78)'
                                : 'rgba(18, 18, 20, 0)',
                          }}
                          transition={{ duration: 0.35 }}
                          className="p-3 sm:p-3.5 flex flex-col relative"
                        >
                          <div className="flex items-baseline justify-between mb-3">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[11px] sm:text-[12px] font-bold uppercase text-[#FF6900]">
                                MON
                              </span>
                              <span className="text-[20px] sm:text-[22px] font-bold text-[#FF6900]">
                                19
                              </span>
                            </div>
                            <span className="text-[11px] sm:text-[12px] font-medium text-[#8E8E93]">
                              {beatIndex === 7 && aiMovePhase === 'landed' ? '15m' : '30m'}
                            </span>
                          </div>

                          {/* Card 1 inside MON 19 */}
                          <div className="rounded-[16px] sm:rounded-[18px] bg-[#251E19] border border-white/[0.1] p-2.5 sm:p-3 mb-2.5">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-stretch gap-2">
                                <div className="w-1 rounded-full bg-[#FF6900] shrink-0" />
                                <div>
                                  <p className="text-[13px] sm:text-[14px] font-bold text-white leading-tight">
                                    Rea
                                    <br />
                                    ding
                                    <br />• 1...
                                  </p>
                                  <div className="flex items-center gap-1 mt-1.5 text-[#8E8E93]">
                                    <Clock className="w-3 h-3" />
                                    <span className="text-[11px]">15m</span>
                                  </div>
                                </div>
                              </div>
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                  beatIndex === 7 && aiMovePhase === 'landed'
                                    ? 'bg-[#FF6900] border-[#FF6900]'
                                    : 'border-[#FF6900]'
                                }`}
                              >
                                {beatIndex === 7 && aiMovePhase === 'landed' && (
                                  <Check className="w-3 h-3 text-white stroke-[3]" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Incomplete task on MON 19 before AI moves it to TUE 20 on Beat 7 */}
                          {beatIndex === 7 && aiMovePhase === 'detect' && (
                            <motion.div
                              initial={{ opacity: 0, y: 6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-[14px] sm:rounded-[16px] bg-[#1C1C1E] border border-[#FF6900]/60 p-2 sm:p-2.5 mb-2.5 flex items-center justify-between gap-1.5"
                            >
                              <div className="flex items-stretch gap-1.5 min-w-0">
                                <div className="w-1 rounded-full bg-[#FF6900] shrink-0" />
                                <p className="text-[11px] sm:text-[12px] font-semibold text-white truncate">
                                  Solving non-singular...
                                </p>
                              </div>
                              <span className="text-[8.5px] sm:text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#FF6900]/20 text-[#FF6900] shrink-0">
                                Due
                              </span>
                            </motion.div>
                          )}

                          <div className="rounded-[14px] border border-dashed border-[#FF6900]/45 py-2 sm:py-2.5 flex items-center justify-center gap-1.5 text-[#FF6900] text-[12px] sm:text-[13px] font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </div>
                        </motion.div>

                        {/* COL 3: TUE 20 (Highlighted in warm brown #2C1D13 during Beat 7 when AI moves incomplete task!) */}
                        <motion.div
                          animate={{
                            backgroundColor:
                              beatIndex === 7 && (aiMovePhase === 'moving' || aiMovePhase === 'landed')
                                ? 'rgba(62, 37, 19, 0.78)'
                                : 'rgba(18, 18, 20, 0)',
                          }}
                          transition={{ duration: 0.35 }}
                          className="p-3 sm:p-3.5 flex flex-col relative"
                        >
                          <div className="flex items-baseline justify-between mb-3">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-[11px] sm:text-[12px] font-bold uppercase text-[#8E8E93]">
                                TUE
                              </span>
                              <span className="text-[20px] sm:text-[22px] font-bold text-white">
                                20
                              </span>
                            </div>
                            {beatIndex === 7 && aiMovePhase === 'landed' && (
                              <span className="text-[11px] sm:text-[12px] font-medium text-[#FF6900]">
                                15m
                              </span>
                            )}
                          </div>

                          {/* Habit Schedule badge on TUE 20 */}
                          <div className="mb-2.5 px-2 sm:px-2.5 py-1 rounded-[10px] bg-[#FF6900]/15 border border-[#FF6900]/35 flex items-center gap-1.5 text-[9.5px] sm:text-[10px] font-semibold text-[#FF6900]">
                            <Repeat2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">Habit Schedule</span>
                          </div>

                          {/* Landed AI-rescheduled incomplete task on Beat 7 */}
                          {beatIndex === 7 && aiMovePhase === 'landed' && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.92, y: 12 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              className="rounded-[16px] sm:rounded-[18px] bg-[#251E19] border border-[#FF6900]/65 p-2.5 sm:p-3 mb-2.5 shadow-[0_14px_30px_rgba(255,105,0,0.22)]"
                            >
                              <div className="flex items-center gap-1 text-[9px] sm:text-[9.5px] font-bold uppercase tracking-wider text-[#FF6900] mb-1">
                                <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                <span className="truncate">AI Moved Incomplete</span>
                              </div>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-stretch gap-2 min-w-0">
                                  <div className="w-1 rounded-full bg-[#FF6900] shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-[12px] sm:text-[13px] font-bold text-white leading-snug">
                                      Solving non-singular system
                                    </p>
                                    <div className="flex items-center gap-1 mt-1 text-[#8E8E93]">
                                      <Clock className="w-3 h-3" />
                                      <span className="text-[11px]">15m</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-[#FF6900] shrink-0" />
                              </div>
                            </motion.div>
                          )}

                          <div className="rounded-[14px] border border-dashed border-[#FF6900]/45 py-2 sm:py-2.5 flex items-center justify-center gap-1.5 text-[#FF6900] text-[12px] sm:text-[13px] font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </div>
                        </motion.div>

                        {/* COL 4: WED 21 (Hidden on narrow mobile) */}
                        <div className="hidden sm:flex p-3.5 flex-col">
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="text-[12px] font-bold uppercase text-[#8E8E93]">
                              WED
                            </span>
                            <span className="text-[22px] font-bold text-white">21</span>
                          </div>
                          <div className="rounded-[14px] border border-dashed border-[#FF6900]/45 py-2.5 flex items-center justify-center gap-1.5 text-[#FF6900] text-[13px] font-semibold">
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </div>
                        </div>

                        {/* ===========================================================
                            FLOATING DRAG / AI-MOVE PILL WITH GREEN '+' BADGE (Screenshot 6)
                            Responsive coordinates for mobile vs tablet/desktop!
                        =========================================================== */}
                        <AnimatePresence>
                          {(beatIndex === 6 || (beatIndex === 7 && aiMovePhase === 'moving')) && (
                            <motion.div
                              key={beatIndex === 6 ? 'pill-drag' : 'pill-ai-move'}
                              initial={
                                viewport === 'mobile'
                                  ? { opacity: 0, x: 16, y: 215, scale: 0.92 }
                                  : beatIndex === 6
                                  ? { opacity: 0, x: 55, y: 245, scale: 0.92 }
                                  : { opacity: 0, x: 175, y: 220, scale: 0.94 }
                              }
                              animate={
                                viewport === 'mobile'
                                  ? beatIndex === 6
                                    ? {
                                        opacity: 1,
                                        x: dropPhase === 'hover-mon' ? 18 : 34,
                                        y: dropPhase === 'hover-mon' ? 210 : 195,
                                        scale: 1,
                                      }
                                    : {
                                        opacity: 1,
                                        x: 110,
                                        y: 205,
                                        scale: 1,
                                      }
                                  : beatIndex === 6
                                  ? {
                                      opacity: 1,
                                      x: dropPhase === 'hover-mon' ? 115 : 155,
                                      y: dropPhase === 'hover-mon' ? 235 : 210,
                                      scale: 1.04,
                                    }
                                  : {
                                      opacity: 1,
                                      x: 325,
                                      y: 215,
                                      scale: 1.05,
                                    }
                              }
                              exit={{ opacity: 0, scale: 0.9 }}
                              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                              className="pointer-events-none absolute z-30 rounded-[14px] bg-[#1E1916]/95 backdrop-blur-md border border-[#FF6900]/80 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center gap-2.5 sm:gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                            >
                              {/* Orange circle on left */}
                              <div className="w-4 h-4 rounded-full border-2 border-[#FF6900] shrink-0" />

                              {/* Task Title */}
                              <span className="text-[12.5px] sm:text-[14px] font-semibold text-[#EBEBF5] whitespace-nowrap">
                                {beatIndex === 6
                                  ? 'Reading • 10 min'
                                  : 'Solving non-singular • 15m'}
                              </span>

                              {/* Top-Right Green '+' Circle Badge with White Ring */}
                              <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#38C958] border-2 border-white flex items-center justify-center shadow-[0_4px_12px_rgba(56,201,88,0.5)]">
                                <Plus className="w-3.5 h-3.5 text-white stroke-[3]" />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            </motion.div>
          </div>

          {/* BOTTOM SUBTITLE — TYPEWRITER TEXT WHILE CARD IS SHOWING */}
          <div className="relative z-30 w-full flex justify-center pt-3 pb-1 min-h-[36px] items-center pointer-events-none">
            <p className="text-xs sm:text-base md:text-lg text-white/90 font-medium tracking-wide text-center max-w-2xl leading-snug">
              {typedSubtitle}
              <span className="inline-block w-[2px] h-[1em] bg-[#FF6900] ml-1 align-middle animate-pulse" />
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
