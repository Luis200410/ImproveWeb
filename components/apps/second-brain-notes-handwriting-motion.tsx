'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  PanelLeft,
  Grid3X3,
  Lasso,
  PenTool,
  FilePlus2,
  MoreHorizontal,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
  Link2,
  Plus,
  Undo2,
  Redo2,
  ListTodo,
  CheckCircle2,
  List,
  Code2,
  Highlighter,
} from 'lucide-react'

const HANDWRITING_FONT_STYLE: React.CSSProperties = {
  fontFamily: '"Gloria Hallelujah", "Caveat", "Noteworthy", "Bradley Hand", cursive',
  letterSpacing: '0.02em',
}

const BEATS = [
  {
    id: 0,
    duration: 3800,
    bgWord: 'FREEHAND INK',
    label: '01 / APPLE PENCIL GRAPH CANVAS',
    caption: 'Sketch equations, arrows, and color-coded callouts freely on an infinite dark grid canvas.',
    camera: { scale: 1.06, x: 0, y: 0, rotateX: 4, rotateY: -2 },
  },
  {
    id: 1,
    duration: 3800,
    bgWord: 'NOTE SYSTEM',
    label: '02 / NOTE INSPECTOR & ACTIONS',
    caption: 'Open the Note Inspector to link a task, summarize handwritten + typed notes, or attach sources.',
    camera: { scale: 1.14, x: 165, y: 15, rotateX: 4, rotateY: 7 },
  },
  {
    id: 2,
    duration: 4600,
    bgWord: 'LINKED NOTE',
    label: '03 / LINKED TASK, AI SUMMARY & MICROTASKS',
    caption: 'Once linked, your note displays the parent task progress, 3 AI takeaways, and all 9 Microtasks inline.',
    camera: { scale: 1.16, x: 175, y: -10, rotateX: 4, rotateY: 8 },
  },
  {
    id: 3,
    duration: 4000,
    bgWord: 'RESOURCES',
    label: '04 / 5 ATTACHED PROJECT RESOURCES',
    caption: 'Access all 5 project links, books, and study resources directly inside the Note sidebar.',
    camera: { scale: 1.2, x: 185, y: -85, rotateX: 5, rotateY: 8 },
  },
  {
    id: 4,
    duration: 4200,
    bgWord: 'LASSO INK',
    label: '05 / LASSO HANDWRITING SELECTION',
    caption: 'Select any handwritten paragraph with the Lasso tool to prepare it for instant text conversion.',
    camera: { scale: 1.14, x: -95, y: -5, rotateX: 4, rotateY: -5 },
  },
  {
    id: 5,
    duration: 4400,
    bgWord: 'INK TO TEXT',
    label: '06 / IN-PLACE MULTI-LINE TEXT CONVERSION',
    caption: 'Handwriting converts cleanly into multi-line typed text right in its original layout—never flattened to one line.',
    camera: { scale: 1.14, x: -95, y: -5, rotateX: 3, rotateY: -4 },
  },
  {
    id: 6,
    duration: 4800,
    bgWord: 'SLASH MENU',
    label: '07 / INSTANT "/" COMMAND & STYLE MENU',
    caption: 'Type "/" anywhere on the canvas to style headings (A1–A6, Body), colors, code, or insert a Bullet list.',
    camera: { scale: 1.16, x: -45, y: 10, rotateX: 4, rotateY: -3 },
  },
] as const

const RESOURCES_LIST = [
  'the exponential...',
  'The uniform Di...',
  'Book Continou...',
  'The Organic Ch...',
  'Probability Exp...',
]

const NOTE_MICROTASKS = [
  'Reading • 10 min',
  'Solving non-singular system of linear equations',
  'Solving singular system of linesr austians',
]

/** Hand-drawn SVG horizontal arrow */
function SketchArrowRight({ className = 'w-10 sm:w-12 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 24" fill="none" className={className}>
      <path
        d="M3 13 C 18 11, 36 12, 52 11 M44 5 C 48 8, 53 10, 56 11 C 52 13, 47 16, 44 18"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Hand-drawn SVG upward arrow */
function SketchArrowUp({ className = 'w-6 h-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 48" fill="none" className={className}>
      <path
        d="M14 44 C 13 30, 15 18, 13 6 M7 15 C 10 10, 12 6, 13 4 C 15 7, 18 11, 20 15"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SecondBrainNotesHandwritingMotion() {
  const [beatIndex, setBeatIndex] = useState(0)
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
      ? { scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 }
      : viewport === 'tablet'
      ? {
          scale: Math.min(currentBeat.camera.scale, 1.08),
          x: currentBeat.camera.x * 0.45,
          y: currentBeat.camera.y * 0.45,
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

  const showSidebar = beatIndex >= 1
  const isSidebarFocusedOnMobile = beatIndex >= 1 && beatIndex <= 3
  const isPopulatedSidebar = beatIndex >= 2
  const showResourcesFocus = beatIndex === 3
  const isCanvasSecondSection = beatIndex >= 4
  const isLassoActive = beatIndex === 4
  const isConvertedText = beatIndex >= 5
  const showSlashMenu = beatIndex === 6

  return (
    <section className="py-10 sm:py-12 px-3 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 px-1">
          <div>
            <p className="kicker text-[#FF6900] mb-1.5 sm:mb-2">
              HYBRID INK, AI SUMMARY & SLASH COMMANDS
            </p>
            <h3 className="type-title text-2xl sm:text-5xl font-bold uppercase tracking-tight text-white">
              Handwriting OCR & Smart Note System
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-white/45">
            {currentBeat.label}
          </p>
        </div>

        {/* Separate Global .access-glass Container */}
        <div
          className="access-glass relative min-h-[620px] sm:min-h-[750px] flex flex-col items-center justify-center overflow-hidden select-none px-3 py-6 sm:px-8 sm:py-10"
          style={{ perspective: '1500px' }}
        >
          {/* Ambient radial glow */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(255, 105, 0, 0.09), transparent 68%)',
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
                className="font-display text-[4.5rem] sm:text-[10rem] md:text-[14rem] uppercase tracking-[-0.04em] text-white whitespace-nowrap leading-none"
              >
                {currentBeat.bgWord}
              </motion.span>
            </AnimatePresence>
          </div>

          {/* 3D CAMERA RIG */}
          <motion.div
            animate={responsiveCamera}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative z-10 w-full max-w-[1040px] pb-12 sm:pb-10"
          >
            <div className="rounded-[22px] sm:rounded-[26px] bg-[#070709] border border-white/[0.1] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.8)] grid grid-cols-12 min-h-[510px] sm:min-h-[560px]">
              {/* =================================================================
                  LEFT NOTE INSPECTOR SIDEBAR
                  - On Mobile (<768px): Full-width (col-span-12) during Beats 1, 2, 3
                  - On iPad/Desktop (>=768px): Side-by-side (md:col-span-5 lg:col-span-4)
              ================================================================= */}
              <AnimatePresence initial={false}>
                {showSidebar && (
                  <motion.div
                    key="note-sidebar"
                    initial={{ opacity: 0, x: -24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className={`${
                      isSidebarFocusedOnMobile
                        ? 'col-span-12 md:col-span-5 lg:col-span-4 flex'
                        : 'hidden md:flex md:col-span-5 lg:col-span-4'
                    } bg-[#0B0B0D] md:border-r border-white/[0.08] p-4 flex-col gap-3`}
                  >
                    {/* Top NOTE Header */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#8E8E93]">
                        NOTE
                      </span>
                      <PanelLeft className="w-4 h-4 text-[#FF6900]" />
                    </div>

                    {/* Note Title */}
                    <h4 className="text-[16px] sm:text-[17px] font-bold text-white leading-snug tracking-tight">
                      Solving systems of linear equations: Elimination
                    </h4>

                    {/* TOP CARD: Empty "No task linked" (Beat 1) vs Populated Linked Task Card (Beat 2+) */}
                    <AnimatePresence mode="wait">
                      {!isPopulatedSidebar ? (
                        <motion.div
                          key="task-unlinked"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="rounded-[18px] bg-[#141416] border border-white/[0.06] p-3.5 text-center flex flex-col items-center"
                        >
                          <div className="w-9 h-9 rounded-[11px] bg-[#1F1F22] flex items-center justify-center text-[#3B82F6] mb-2">
                            <ListTodo className="w-4 h-4" />
                          </div>
                          <p className="text-[13px] font-bold text-white">No task linked</p>
                          <p className="text-[10.5px] text-[#8E8E93] leading-relaxed mt-1 max-w-[230px]">
                            Link this note to a task (⌘K or the &ldquo;/&rdquo; menu) to see and add
                            its microtasks here.
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="task-linked"
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="rounded-[18px] bg-[#161618] border border-white/[0.08] p-3.5 space-y-2"
                        >
                          <p className="text-[13px] font-bold text-white leading-snug">
                            Week 2 · Solving systems of linear equations: Elimination
                          </p>
                          <div className="flex items-center justify-between text-[10.5px] gap-2">
                            <span className="text-[#8E8E93] truncate">
                              Mathematics for machine learning c...
                            </span>
                            <span className="font-bold text-[#EBEBF5] shrink-0">To Do</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                            <div className="w-1/4 h-full rounded-full bg-[#FF6900]" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* ✦ Summary Section */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-[#FF6900]" />
                          <span className="text-[12.5px] font-bold text-white">Summary</span>
                        </div>
                        {isPopulatedSidebar && (
                          <div className="w-6 h-6 rounded-[8px] bg-[#2C1808] flex items-center justify-center text-[#FF6900]">
                            <RefreshCw className="w-3 h-3" />
                          </div>
                        )}
                      </div>

                      <AnimatePresence mode="wait">
                        {!isPopulatedSidebar ? (
                          <motion.div
                            key="summary-empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="rounded-[18px] bg-[#161618] border border-white/[0.06] p-3 space-y-2.5"
                          >
                            <p className="text-[11px] text-[#8E8E93] leading-relaxed">
                              The key points of everything in this note — typed, handwritten and
                              spoken.
                            </p>
                            <div className="w-full py-2 rounded-[11px] bg-[#FF6900] flex items-center justify-center gap-1.5 text-[12.5px] font-bold text-white shadow-[0_0_20px_rgba(255,105,0,0.45)]">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Summarize</span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="summary-populated"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="rounded-[18px] bg-[#161618] border border-white/[0.07] p-3 space-y-1.5"
                          >
                            {[
                              'Solve a system of linear equations by elimination.',
                              'Add or subtract equations to eliminate one variable, then solve for the remaining variable.',
                              'Substitute back to find the other variable.',
                            ].map((point, i) => (
                              <div key={point} className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-[#FF6900] text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {i + 1}
                                </span>
                                <p className="text-[10.5px] text-[#EBEBF5] leading-snug">{point}</p>
                              </div>
                            ))}
                            <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[9px] text-[#8E8E93]">
                              <div className="flex items-center gap-2.5">
                                <span className="flex items-center gap-1">
                                  <span className="w-2.5 h-1.5 rounded-xs bg-[#FF6900]/60 inline-block" />
                                  Essential
                                </span>
                                <span className="flex items-center gap-1">
                                  <span className="w-2.5 h-0.5 bg-[#FF6900] inline-block" />
                                  Key
                                </span>
                              </div>
                              <span>8 minutes ago</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* BOTTOM SIDEBAR SECTION: Sources 0 | Microtasks 9 | Resources 5 */}
                    <AnimatePresence mode="wait">
                      {!isPopulatedSidebar ? (
                        <motion.div
                          key="sources-empty"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-[#FF6900]" />
                            <span className="text-[12.5px] font-bold text-white">Sources</span>
                            <span className="px-1.5 py-0.2 rounded-full bg-[#FF6900] text-white text-[10px] font-bold">
                              0
                            </span>
                          </div>
                          <div className="rounded-[18px] bg-[#141416] border border-white/[0.06] p-3 text-center">
                            <p className="text-[11.5px] font-bold text-white">No sources yet</p>
                            <p className="text-[10px] text-[#8E8E93] mt-0.5">
                              Attach links, files or media from this note&apos;s project.
                            </p>
                          </div>
                        </motion.div>
                      ) : showResourcesFocus ? (
                        <motion.div
                          key="resources-populated"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5 text-[#FF6900]" />
                              <span className="text-[12.5px] font-bold text-white">Resources</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-[#FF6900] text-white text-[10px] font-bold">
                                5
                              </span>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-[#FF6900]" />
                          </div>
                          <div className="rounded-[18px] bg-[#161618] border border-[#FF6900]/45 p-2.5 grid grid-cols-2 gap-2 shadow-[0_12px_30px_rgba(255,105,0,0.18)]">
                            {RESOURCES_LIST.map((res) => (
                              <div key={res} className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-[9px] bg-[#FF6900] flex items-center justify-center text-white shrink-0">
                                  <Link2 className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[10.5px] font-medium text-[#EBEBF5] truncate">
                                  {res}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      ) : (
                        <motion.div
                          key="microtasks-populated"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6900]" />
                              <span className="text-[12.5px] font-bold text-white">Microtasks</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-[#FF6900] text-white text-[10px] font-bold">
                                9
                              </span>
                            </div>
                            <Plus className="w-3.5 h-3.5 text-[#FF6900]" />
                          </div>
                          <div className="rounded-[18px] bg-[#141416] border border-white/[0.07] divide-y divide-white/[0.06] overflow-hidden">
                            {NOTE_MICROTASKS.map((task) => (
                              <div
                                key={task}
                                className="px-3 py-2 flex items-center justify-between gap-2"
                              >
                                <span className="text-[11px] font-medium text-[#EBEBF5] leading-snug">
                                  {task}
                                </span>
                                <div className="w-4 h-4 rounded-full border-2 border-[#FF6900] shrink-0" />
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* =================================================================
                  RIGHT HANDWRITING GRAPH-GRID CANVAS
                  - On Mobile (<768px): Full-width (col-span-12) on Beats 0, 4, 5, 6
                  - On iPad/Desktop (>=768px): Side-by-side (md:col-span-7 lg:col-span-8)
              ================================================================= */}
              <div
                className={`${
                  !showSidebar
                    ? 'col-span-12 flex'
                    : isSidebarFocusedOnMobile
                    ? 'hidden md:flex md:col-span-7 lg:col-span-8'
                    : 'col-span-12 md:col-span-7 lg:col-span-8 flex'
                } relative flex-col justify-between p-3.5 sm:p-5 overflow-hidden`}
                style={{
                  backgroundColor: '#050507',
                  backgroundImage:
                    'linear-gradient(to right, rgba(255,255,255,0.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.055) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              >
                {/* Top Canvas Toolbar */}
                <div className="flex items-center justify-between gap-2 z-20">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#FF6900] text-white flex items-center justify-center">
                      <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#FF6900] text-white flex items-center justify-center">
                      <PanelLeft className="w-4 h-4 stroke-[2.2]" />
                    </div>
                  </div>

                  {/* Right Canvas Mode Buttons (Grid, Lasso, Markup Pen, Add Text, More) */}
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#1C1C1E] border border-white/10 text-[#FF6900] flex items-center justify-center">
                      <Grid3X3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div
                      className={`px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#1C1C1E] border flex items-center justify-center transition-colors ${
                        isLassoActive
                          ? 'border-[#FF6900] text-[#FF6900] shadow-[0_0_14px_rgba(255,105,0,0.45)]'
                          : 'border-white/10 text-white/85'
                      }`}
                    >
                      <Lasso className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div
                      className={`px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#1C1C1E] border flex items-center justify-center transition-colors ${
                        !isLassoActive && !isConvertedText
                          ? 'border-[#FF6900] text-[#FF6900]'
                          : 'border-white/10 text-white/85'
                      }`}
                    >
                      <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#1C1C1E] border border-white/10 text-white/85 flex items-center justify-center">
                      <FilePlus2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div className="px-2.5 sm:px-3 py-1.5 rounded-[10px] bg-[#FF6900] text-white flex items-center justify-center">
                      <MoreHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                  </div>
                </div>

                {/* ===============================================================
                    CANVAS BODY WITH REAL HANDWRITING FONT & SKETCHED SVG PATHS
                =============================================================== */}
                <div className="relative flex-1 my-3">
                  <AnimatePresence mode="wait">
                    {!isCanvasSecondSection ? (
                      /* SCENE A: HANDWRITTEN LINEAR SYSTEM EQUATIONS */
                      <motion.div
                        key="canvas-equations"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="relative w-full h-full min-h-[360px] sm:min-h-[395px] text-white"
                        style={HANDWRITING_FONT_STYLE}
                      >
                        {/* Top Equations */}
                        <div className="space-y-2 sm:space-y-2.5 text-[15.5px] sm:text-[21px] pt-1 pl-1 sm:pl-3">
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 -rotate-[0.6deg]">
                            <span>5a + b = 17</span>
                            <SketchArrowRight />
                            <span>a + 0.2b = 3.4</span>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 rotate-[0.4deg]">
                            <span>9a - 3b = 6</span>
                            <SketchArrowRight />
                            <span>a - 0.75b = 1.5</span>
                          </div>
                          <div className="pl-8 sm:pl-32 text-[14px] sm:text-[17px] text-white/95 -rotate-[0.8deg]">
                            substract eq 1 from eq 2
                          </div>
                        </div>

                        {/* Top-Right Solved System */}
                        <div className="hidden lg:block absolute top-1 right-4 text-[18px] space-y-1 rotate-[1deg]">
                          <p>a = 3</p>
                          <p>b = 2</p>
                          <div className="pt-1 flex flex-col items-center text-[15px] leading-tight">
                            <SketchArrowUp className="w-6 h-10" />
                            <p>solved</p>
                            <p>system</p>
                          </div>
                        </div>

                        {/* Middle Section: System Arrow + 0a - 0.95b = -1.9 */}
                        <div className="mt-3 sm:mt-4 pl-1 sm:pl-3 grid grid-cols-12 gap-2 sm:gap-3 items-start">
                          <div className="col-span-6 sm:col-span-5 space-y-1 text-[13.5px] sm:text-[16px]">
                            <div className="pl-3 sm:pl-7 flex flex-col items-start -rotate-[1.2deg]">
                              <SketchArrowUp className="w-4 h-7 sm:w-5 sm:h-9" />
                              <p>system</p>
                            </div>
                            <div className="pl-10 sm:pl-20 flex items-center gap-1 -rotate-[2deg]">
                              <span>How?</span>
                              <svg viewBox="0 0 44 32" fill="none" className="w-7 h-5 sm:w-9 sm:h-7">
                                <path
                                  d="M4 28 C 16 20, 26 12, 38 5 M29 4 C 33 4, 37 4, 40 4 C 39 7, 38 11, 37 14"
                                  stroke="white"
                                  strokeWidth="2.1"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                            <div className="pt-0.5 leading-snug text-white/95 -rotate-[0.7deg]">
                              <p>Proposal: eliminate &ldquo;a&rdquo;</p>
                              <p className="pl-4 sm:pl-10">from 2nd</p>
                              <p className="pl-4 sm:pl-10">equation.</p>
                            </div>
                          </div>

                          <div className="col-span-6 sm:col-span-7 space-y-1.5 sm:space-y-2 text-[15.5px] sm:text-[21px] pt-2 -rotate-[0.5deg]">
                            <p>0a - 0.95b = -1.9</p>
                            <p className="pl-2 sm:pl-7">-0.95b = -1.9</p>
                            <p className="pl-8 sm:pl-20">b = 2</p>
                          </div>
                        </div>

                        {/* Bottom Organic Hand-Sketched Red Loop "Elimination Method" */}
                        <div className="mt-3 pl-8 sm:pl-24 flex items-center gap-3">
                          <div className="relative px-7 py-3 sm:px-8 sm:py-3.5 -rotate-[1.5deg]">
                            <svg
                              viewBox="0 0 210 92"
                              fill="none"
                              className="pointer-events-none absolute inset-0 w-full h-full"
                            >
                              <path
                                d="M108 8 C 46 6, 10 24, 12 50 C 14 76, 62 86, 118 84 C 172 82, 202 64, 198 40 C 194 18, 152 10, 96 12"
                                stroke="#E11D48"
                                strokeWidth="3"
                                strokeLinecap="round"
                              />
                            </svg>
                            <p className="text-[16px] sm:text-[18px] leading-tight">Elimination</p>
                            <p className="text-[16px] sm:text-[18px] leading-tight pl-1">Method</p>
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      /* SCENE B: LASSO SELECTION (Beat 4) -> MULTI-LINE TYPED TEXT (Beat 5) -> "/" MENU (Beat 6) */
                      <motion.div
                        key="canvas-lasso-ocr"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.35 }}
                        className="relative w-full h-full min-h-[360px] sm:min-h-[395px] text-white"
                        style={HANDWRITING_FONT_STYLE}
                      >
                        {/* Top Hand-Sketched Red Polygon "addition substraction method" */}
                        <div className="pl-4 sm:pl-20 pt-0.5 flex flex-wrap items-start gap-2">
                          <span className="text-[14.5px] sm:text-[16.5px] text-white/95 -rotate-[1deg]">
                            or sometimes ↳
                          </span>
                          <div className="relative px-5 py-2 sm:px-6 sm:py-2.5 text-[14.5px] sm:text-[16.5px] leading-snug -rotate-[0.8deg]">
                            <svg
                              viewBox="0 0 210 96"
                              fill="none"
                              className="pointer-events-none absolute inset-0 w-full h-full"
                            >
                              <path
                                d="M12 16 L 128 14 L 130 34 L 198 42 L 194 74 L 138 72 L 132 88 C 82 92, 34 88, 14 78 Z"
                                stroke="#E11D48"
                                strokeWidth="2.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            <p>addition</p>
                            <p>substraction</p>
                            <p className="pl-3">method</p>
                          </div>
                        </div>

                        {/* Middle Row: Left Lassoed Block / Multi-Line Converted Text + Right Handwritten Note */}
                        <div className="mt-3 grid grid-cols-12 gap-3 items-center px-1">
                          {/* LEFT BLOCK: Lassoed Handwriting (Beat 4) -> Multi-Line Typed Text (Beat 5 & 6) */}
                          <div className="col-span-12 sm:col-span-6 relative">
                            <AnimatePresence mode="wait">
                              {!isConvertedText ? (
                                /* Beat 4: Screenshot 5 — Handwritten block inside organic orange dashed lasso */
                                <motion.div
                                  key="handwritten-lasso"
                                  initial={{ opacity: 0, scale: 0.97 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 1.03, filter: 'blur(6px)' }}
                                  transition={{ duration: 0.35 }}
                                  style={HANDWRITING_FONT_STYLE}
                                  className="relative rounded-[24px] border-2 border-dashed border-[#FF6900] bg-[#FF6900]/[0.12] px-3.5 py-3 sm:px-4 sm:py-3.5 text-[14px] sm:text-[15.5px] leading-[1.45] text-white shadow-[0_0_30px_rgba(255,105,0,0.2)] -rotate-[0.6deg]"
                                >
                                  <p>substracting the equation</p>
                                  <p>from the other cancels</p>
                                  <p>out one of them so</p>
                                  <p>you can easily solved</p>
                                  <p>one of them.</p>
                                </motion.div>
                              ) : (
                                /* Beat 5 & 6: Screenshot 4 — Multi-line typed text matching the exact block geometry! */
                                <motion.div
                                  key="converted-multiline-text"
                                  initial={{ opacity: 0, scale: 0.95, filter: 'blur(6px)' }}
                                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                  exit={{ opacity: 0 }}
                                  transition={{ duration: 0.4 }}
                                  style={{ fontFamily: 'var(--font-ios), system-ui, sans-serif' }}
                                  className="relative rounded-[20px] border border-[#FF6900]/65 bg-[#141418]/90 px-3.5 py-3 sm:px-4 sm:py-3.5 text-[14px] sm:text-[15.5px] font-medium leading-[1.5] text-white shadow-[0_14px_35px_rgba(255,105,0,0.22)]"
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[10px] font-mono uppercase tracking-[0.16em] text-[#FF6900] flex items-center gap-1">
                                      <Sparkles className="w-3 h-3" />
                                      Converted to Text
                                    </span>
                                  </div>
                                  <p>
                                    <span className="underline decoration-[#E11D48] decoration-wavy">
                                      substrading
                                    </span>{' '}
                                    the equation
                                  </p>
                                  <p>from the other cancels</p>
                                  <p>out one of them so</p>
                                  <p>you can easily solve</p>
                                  <p>one of them.</p>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* RIGHT HANDWRITTEN ANNOTATION */}
                          <div
                            style={HANDWRITING_FONT_STYLE}
                            className="hidden sm:flex sm:col-span-6 items-center gap-2.5 text-[15px] leading-snug -rotate-[0.8deg]"
                          >
                            <SketchArrowRight className="w-11 h-5 shrink-0" />
                            <div>
                              <p>that&apos;s why</p>
                              <p>we substract</p>
                              <p>after we</p>
                              <p>divide</p>
                              <p>by coefficients</p>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Handwritten Question */}
                        <div
                          style={HANDWRITING_FONT_STYLE}
                          className="mt-3 sm:mt-4 pl-2 sm:pl-3 space-y-1 sm:space-y-1.5 -rotate-[0.6deg]"
                        >
                          <p className="text-[17px] sm:text-[21px] font-bold tracking-wide">
                            What if coefficient is = 0 ?
                          </p>
                          <p className="text-[13.5px] sm:text-[16px] text-white/95 pl-2 sm:pl-3">
                            its easier cause it is already eliminated @
                          </p>
                        </div>

                        {/* ===========================================================
                            FLOATING SLASH "/" MENU POPOVER (New Screenshot 2 — Beat 6)
                        =========================================================== */}
                        <AnimatePresence>
                          {showSlashMenu && (
                            <motion.div
                              key="slash-menu-popover"
                              initial={{ opacity: 0, y: 14, scale: 0.93 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 10, scale: 0.95 }}
                              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                              style={{ fontFamily: 'var(--font-ios), system-ui, sans-serif' }}
                              className="absolute top-3 left-1/2 -translate-x-1/2 sm:top-6 sm:left-3 sm:translate-x-0 z-30 w-[calc(100%-8px)] max-w-[305px] sm:w-[315px] rounded-[22px] bg-[#0B0B0E]/95 backdrop-blur-2xl border border-white/15 p-3 sm:p-3.5 shadow-[0_28px_70px_rgba(0,0,0,0.92)] space-y-2"
                            >
                              {/* Row 1: A1, A2, A3, A4 */}
                              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                {[
                                  { label: 'A1', size: 'text-[16px] sm:text-[17px] font-bold' },
                                  { label: 'A2', size: 'text-[14px] sm:text-[15px] font-bold' },
                                  { label: 'A3', size: 'text-[13px] sm:text-[14px] font-semibold' },
                                  { label: 'A4', size: 'text-[12.5px] sm:text-[13px] font-semibold' },
                                ].map((h) => (
                                  <div
                                    key={h.label}
                                    className={`py-1.5 sm:py-2 rounded-[11px] bg-[#1C1C1E] text-white flex items-center justify-center ${h.size}`}
                                  >
                                    {h.label}
                                  </div>
                                ))}
                              </div>

                              {/* Row 2: A5, A6, Body (Solid Orange) */}
                              <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                                <div className="py-1.5 sm:py-2 rounded-[11px] bg-[#1C1C1E] text-white text-[12px] font-semibold flex items-center justify-center">
                                  A5
                                </div>
                                <div className="py-1.5 sm:py-2 rounded-[11px] bg-[#1C1C1E] text-white text-[11.5px] font-semibold flex items-center justify-center">
                                  A6
                                </div>
                                <div className="col-span-1 py-1.5 sm:py-2 rounded-[11px] bg-[#FF6900] text-white text-[12px] font-bold flex items-center justify-center shadow-[0_0_16px_rgba(255,105,0,0.45)]">
                                  Body
                                </div>
                              </div>

                              {/* Row 3: B, I, U, S, </>, Highlighter */}
                              <div className="grid grid-cols-6 gap-1.5">
                                <div className="py-1.5 rounded-[10px] bg-[#1C1C1E] text-white text-[13px] font-bold flex items-center justify-center">
                                  B
                                </div>
                                <div className="py-1.5 rounded-[10px] bg-[#1C1C1E] text-white text-[13px] italic font-serif flex items-center justify-center">
                                  I
                                </div>
                                <div className="py-1.5 rounded-[10px] bg-[#1C1C1E] text-white text-[13px] underline flex items-center justify-center">
                                  U
                                </div>
                                <div className="py-1.5 rounded-[10px] bg-[#1C1C1E] text-white text-[13px] line-through flex items-center justify-center">
                                  S
                                </div>
                                <div className="py-1.5 rounded-[10px] bg-[#1C1C1E] text-white flex items-center justify-center">
                                  <Code2 className="w-3.5 h-3.5" />
                                </div>
                                <div className="py-1.5 rounded-[10px] bg-[#1C1C1E] text-white flex items-center justify-center">
                                  <Highlighter className="w-3.5 h-3.5" />
                                </div>
                              </div>

                              {/* Row 4: 8 Color Dots */}
                              <div className="flex items-center justify-between px-1 py-1">
                                {[
                                  '#FFFFFF',
                                  '#FF6900',
                                  '#FACC15',
                                  '#4ADE80',
                                  '#3B82F6',
                                  '#A855F7',
                                  '#F87171',
                                  '#9CA3AF',
                                ].map((color) => (
                                  <span
                                    key={color}
                                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>

                              {/* Row 5: Highlighted Orange "Bullet list" Command */}
                              <div className="rounded-[13px] bg-[#FF6900] px-3 py-2 sm:py-2.5 flex items-center justify-between text-white shadow-[0_8px_24px_rgba(255,105,0,0.4)]">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-[8px] bg-white text-[#FF6900] flex items-center justify-center">
                                    <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                                  </div>
                                  <span className="text-[13px] sm:text-[13.5px] font-bold">
                                    Bullet list
                                  </span>
                                </div>
                                <span className="text-[10.5px] sm:text-[11px] font-mono text-white/85">
                                  – · ⇧⌘8
                                </span>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ===============================================================
                    BOTTOM CANVAS DOCK: APPLE PENCIL PALETTE OR TEXT FORMATTING BAR
                =============================================================== */}
                <div className="relative z-20 flex justify-center">
                  <AnimatePresence mode="wait">
                    {isConvertedText ? (
                      <motion.div
                        key="text-format-bar"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="w-full rounded-[14px] bg-[#1C1C1E]/95 backdrop-blur-xl border border-white/12 px-3.5 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between text-white"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 text-white/80 min-w-0">
                          <Undo2 className="w-4 h-4 shrink-0" />
                          <Redo2 className="w-4 h-4 text-white/40 shrink-0" />
                          <span className="text-[11px] sm:text-[12px] text-[#8E8E93] font-sans truncate">
                            {showSlashMenu ? 'Slash "/" menu open' : 'Multi-line text block'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3.5 sm:gap-5 text-[14px] sm:text-[16px] font-sans shrink-0">
                          <span className="font-bold">B</span>
                          <span className="italic font-serif">I</span>
                          <span className="underline">U</span>
                          <span className="font-medium">Aa</span>
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="pencil-dock"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="rounded-full bg-[#1C1C1E]/90 backdrop-blur-xl border border-white/12 px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 sm:gap-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.75)] max-w-full"
                      >
                        {/* Undo / Redo */}
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white/75">
                            <Undo2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </div>
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#2C2C2E] flex items-center justify-center text-white/40">
                            <Redo2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          </div>
                        </div>

                        {/* Stylized Pen / Highlighter / Eraser / Ruler Icons */}
                        <div className="flex items-end gap-1.5 sm:gap-2.5 px-1 sm:px-2 h-7 sm:h-8 shrink-0">
                          <div className="w-2 sm:w-2.5 h-6 sm:h-7 rounded-t-full bg-white border-b-2 border-[#FF6900]" />
                          <div className="w-2 sm:w-2.5 h-5 sm:h-6 rounded-t-full bg-zinc-400" />
                          <div className="w-2.5 sm:w-3 h-5 sm:h-6 rounded-t-sm bg-yellow-400" />
                          <div className="w-2.5 sm:w-3 h-5 sm:h-6 rounded-t-sm bg-pink-400" />
                          <div className="w-2 sm:w-2.5 h-5 sm:h-6 rounded-t-full bg-orange-400" />
                        </div>

                        {/* Color Swatches */}
                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white ring-2 ring-white/40" />
                          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#2563EB]" />
                          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#22C55E]" />
                          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#EAB308]" />
                          <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#EF4444]" />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
