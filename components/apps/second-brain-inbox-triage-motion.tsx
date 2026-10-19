'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Pencil,
  Plus,
  X,
  Check,
  CheckCircle2,
  Repeat2,
  Flag,
  Sparkles,
  Link2,
  AlignLeft,
  Mic,
  Camera,
  Paperclip,
  Keyboard,
  ListTodo,
  Folder,
  BarChart2,
  PlaySquare,
  BookOpen,
  SlidersHorizontal,
  CircleDashed,
  Calendar,
} from 'lucide-react'

const BEATS = [
  {
    id: 0,
    duration: 4200,
    bgWord: '5-WAY CAPTURE',
    label: '01 / UNIVERSAL INBOX CAPTURE MENU',
    caption: 'Capture anything into your Second Brain—Text, Voice, Links, Photos, or PDFs & Files.',
    camera: { scale: 1.05, x: 0, y: 4, rotateX: 4, rotateY: -3 },
  },
  {
    id: 1,
    duration: 4400,
    bgWord: 'VOICE & TYPE',
    label: '02 / FRICTIONLESS VOICE, TEXT & URL SPACE',
    caption: 'Talk it out or tap Type to write—AI listens, transcribes, and extracts links on the fly.',
    camera: { scale: 1.06, x: 0, y: 0, rotateX: 3, rotateY: 2 },
  },
  {
    id: 2,
    duration: 4800,
    bgWord: 'AI TRIAGE',
    label: '03 / AUTOMATIC AI CLASSIFICATION & TAGS',
    caption: 'As soon as you finish, AI classifies the item, assigns Project/Task/Date tags, and previews URLs & PDFs.',
    camera: { scale: 1.06, x: 0, y: -4, rotateX: 4, rotateY: -2 },
  },
  {
    id: 3,
    duration: 6400,
    bgWord: 'PHOTO TO TASK',
    label: '04 / PHOTO & PDF SYLLABUS → TASKS & CAPACITY FIT',
    caption:
      'Snap a photo or upload a PDF list—AI routes the Area & Project, extracts micro-tasks, checks your habit capacity ("needs 135 min, 564 min free before Nov 1"), and creates the task.',
    camera: { scale: 1.04, x: 0, y: -6, rotateX: 3, rotateY: 2 },
  },
] as const

const CAPTURE_MODALITIES = [
  { label: 'Text', bg: '#43B752', icon: AlignLeft, iconColor: '#43B752' },
  { label: 'Voice', bg: '#F28C18', icon: Mic, iconColor: '#F28C18' },
  { label: 'Links', bg: '#1E62F5', icon: Link2, iconColor: '#1E62F5' },
  { label: 'Photos', bg: '#E54D4D', icon: Camera, iconColor: '#E54D4D' },
  { label: 'File', bg: '#E5B818', icon: Paperclip, iconColor: '#E54D4D' },
]

const EXTRACTED_SYLLABUS_ITEMS = [
  { title: '3b - b + 6', dur: '10', checked: false, type: 'video' },
  { title: 'Vector algebra', dur: '10', checked: false, type: 'video' },
  { title: 'Machine Learning Motivation', dur: '20', checked: true, type: 'quiz' },
  { title: 'Check your knowledge', dur: '15', checked: true, type: 'read' },
  { title: 'Vectors and their properties', dur: '10', checked: true, type: 'video' },
  { title: 'Vector operations', dur: '10', checked: true, type: 'video' },
  { title: 'The dot product', dur: '10', checked: true, type: 'video' },
  { title: 'Multiplying a matrix by a vector', dur: '10', checked: true, type: 'video' },
  { title: 'Practice Quiz', dur: '20', checked: true, type: 'quiz' },
  { title: 'Practice Assignment', dur: '30', checked: true, type: 'assign' },
]

export function SecondBrainInboxTriageMotion() {
  const [beatIndex, setBeatIndex] = useState(0)
  const [captureTypedText, setCaptureTypedText] = useState('')
  const [createPressed, setCreatePressed] = useState(false)
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
          x: 0,
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

  // Sub-animations inside Beat 1 (Voice/Type capture) and Beat 3 (Create task press)
  useEffect(() => {
    if (beatIndex === 1) {
      setCaptureTypedText('')
      const t1 = setTimeout(
        () =>
          setCaptureTypedText(
            'Save Standard Normal Distribution PDF for Statistics task by Oct 16 https://math.arizona.edu/~rsims/ma464/standardnormaltable.pdf'
          ),
        1100
      )
      return () => clearTimeout(t1)
    }

    if (beatIndex === 3) {
      setCreatePressed(false)
      const t1 = setTimeout(() => setCreatePressed(true), 4600)
      return () => clearTimeout(t1)
    } else {
      setCreatePressed(false)
    }
  }, [beatIndex])

  return (
    <section className="py-10 sm:py-12 px-3 sm:px-6 relative overflow-hidden">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 px-1">
          <div>
            <p className="kicker text-[#FF6900] mb-1.5 sm:mb-2">
              MULTI-MODAL CAPTURE & AUTONOMOUS AI TRIAGE
            </p>
            <h3 className="type-title text-2xl sm:text-5xl font-bold uppercase tracking-tight text-white">
              Universal Inbox & Photo/PDF to Tasks
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-white/45">
            {currentBeat.label}
          </p>
        </div>

        {/* Separate Global .access-glass Container */}
        <div
          className="access-glass relative min-h-[650px] sm:min-h-[820px] flex flex-col items-center justify-center overflow-hidden select-none px-3 py-6 sm:px-8 sm:py-10"
          style={{ perspective: '1500px' }}
        >
          {/* Ambient radial glow */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
            style={{
              background:
                'radial-gradient(circle at 50% 45%, rgba(255, 105, 0, 0.1), transparent 68%)',
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
                className="font-display text-[4.2rem] sm:text-[10rem] md:text-[13.5rem] uppercase tracking-[-0.04em] text-white whitespace-nowrap leading-none"
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
            className="relative z-10 w-full max-w-[440px] pb-12 sm:pb-10"
          >
            {/* iOS App Frame Card (No bottom navigation bar so content fits cleanly) */}
            <div className="rounded-[28px] sm:rounded-[34px] bg-[#050507] border border-white/[0.12] overflow-hidden shadow-[0_32px_90px_rgba(0,0,0,0.85)] relative flex flex-col">
              <AnimatePresence mode="wait">
                {/* ===============================================================
                    BEAT 1: VOICE, TEXT & URL CAPTURE SPACE (Screenshot 5)
                =============================================================== */}
                {beatIndex === 1 ? (
                  <motion.div
                    key="capture-space"
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.32 }}
                    className="flex-1 flex flex-col justify-between p-4 sm:p-6 min-h-[530px] sm:min-h-[580px] relative"
                    style={{
                      background:
                        'radial-gradient(circle at 50% 82%, rgba(255, 105, 0, 0.24), rgba(20, 11, 4, 0.96) 62%, #090604 100%)',
                    }}
                  >
                    {/* Top Bar: CAPTURE + Type button */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60">
                        CAPTURE
                      </span>
                      <div className="px-3 sm:px-3.5 py-1.5 rounded-[12px] bg-[#2B2118] border border-white/10 flex items-center gap-2 text-[12.5px] sm:text-[13px] font-semibold text-white">
                        <Keyboard className="w-4 h-4 text-white/80" />
                        <span>Type</span>
                      </div>
                    </div>

                    {/* Center Prompt / Live Transcription + URL Input */}
                    <div className="my-auto py-6 sm:py-8 text-center px-1 sm:px-2">
                      <AnimatePresence mode="wait">
                        {!captureTypedText ? (
                          <motion.p
                            key="prompt-placeholder"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            className="text-[18px] sm:text-[20px] font-semibold text-white/45 tracking-tight"
                          >
                            Talk it out, or tap Type to write...
                          </motion.p>
                        ) : (
                          <motion.div
                            key="prompt-typed"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-2.5 sm:space-y-3 text-left rounded-[20px] sm:rounded-[22px] bg-black/35 border border-[#FF6900]/35 p-3.5 sm:p-4"
                          >
                            <p className="text-[14px] sm:text-[15px] font-medium text-white leading-relaxed">
                              Save{' '}
                              <span className="text-[#FF6900] font-semibold">
                                Standard Normal Distribution PDF
                              </span>{' '}
                              for{' '}
                              <span className="underline decoration-[#FF6900]">Statistics</span>{' '}
                              task by <span className="text-[#FF6900]">Oct 16</span>
                            </p>
                            <div className="rounded-[12px] bg-white/[0.06] px-3 py-2 text-[11px] sm:text-[11.5px] font-mono text-[#60A5FA] truncate">
                              https://math.arizona.edu/~rsims/ma464/standardnormaltable.pdf
                            </div>
                            <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-[#FF6900] font-semibold">
                              <Sparkles className="w-3.5 h-3.5 shrink-0" />
                              <span>AI auto-detecting Project, Task & Deadline tags...</span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bottom Waveform + Glowing Orange Record/Stop + Cancel/Confirm */}
                    <div className="space-y-5 sm:space-y-6 pb-2">
                      {/* Dotted Orange Waveform */}
                      <div className="flex items-center justify-center gap-1">
                        {Array.from({ length: 28 }).map((_, i) => {
                          const isTall = i >= 21
                          return (
                            <motion.span
                              key={i}
                              animate={
                                isTall
                                  ? { height: [6, 14, 8, 16, 6] }
                                  : { height: [3, 4, 3] }
                              }
                              transition={{
                                duration: 0.9,
                                repeat: Infinity,
                                delay: i * 0.03,
                              }}
                              className="w-1 rounded-full bg-[#FF6900]"
                              style={{ height: isTall ? 10 : 3 }}
                            />
                          )
                        })}
                      </div>

                      {/* Center Orange Stop Button */}
                      <div className="flex justify-center">
                        <motion.div
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#FF6900] flex items-center justify-center shadow-[0_0_45px_rgba(255,105,0,0.65)]"
                        >
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-[5px] bg-white" />
                        </motion.div>
                      </div>

                      {/* Bottom Row: X | 0:04 | Check */}
                      <div className="flex items-center justify-between px-2">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E04848] flex items-center justify-center text-white">
                          <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                        </div>
                        <span className="text-[15px] sm:text-[16px] font-bold text-white tracking-wider">
                          {captureTypedText ? '0:04' : '0:00'}
                        </span>
                        <motion.div
                          animate={
                            captureTypedText
                              ? {
                                  scale: [1, 1.14, 1],
                                  boxShadow: '0 0 28px rgba(50,199,89,0.7)',
                                }
                              : { scale: 1 }
                          }
                          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#32C759] flex items-center justify-center text-white"
                        >
                          <Check className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.8]" />
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* ===============================================================
                      BEATS 0, 2, 3: MAIN INBOX & TRIAGE VIEW (No Bottom Nav Bar)
                  =============================================================== */
                  <motion.div
                    key="inbox-main"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col p-3.5 sm:p-5 relative"
                  >
                    {/* Top Header Row: Left Pencil | Right +/X & LR Avatar */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[13px] bg-[#FF6900] flex items-center justify-center text-white shadow-[0_4px_16px_rgba(255,105,0,0.4)]">
                        <Pencil className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                      </div>

                      <h4 className="text-[18px] sm:text-[20px] font-bold text-white tracking-tight">
                        Inbox
                      </h4>

                      <div className="flex items-center gap-2">
                        <div
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[13px] flex items-center justify-center text-white transition-colors ${
                            beatIndex === 0
                              ? 'bg-[#A34800] border border-[#FF9838]'
                              : 'bg-[#FF6900]'
                          }`}
                        >
                          {beatIndex === 0 ? (
                            <X className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                          ) : (
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                          )}
                        </div>
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#E57818] border-2 border-white flex items-center justify-center text-[12px] sm:text-[13px] font-bold text-white">
                          LR
                        </div>
                      </div>
                    </div>

                    {/* "✓ Triage 7/8" Row */}
                    <div className="flex items-center gap-2 mb-2.5 px-1">
                      <CheckCircle2 className="w-4 h-4 text-[#FF6900]" />
                      <span className="text-[14px] sm:text-[15.5px] font-bold text-white">
                        Triage
                      </span>
                      <span className="w-5 h-5 rounded-full bg-[#FF6900] text-white text-[11px] font-bold flex items-center justify-center">
                        {beatIndex >= 3 ? '8' : '7'}
                      </span>
                    </div>

                    {/* =========================================================
                        FLOATING 5-WAY CAPTURE MENU (Screenshot 4 — Beat 0)
                    ========================================================= */}
                    <AnimatePresence>
                      {beatIndex === 0 && (
                        <motion.div
                          key="capture-menu-popover"
                          initial={{ opacity: 0, scale: 0.92, y: -12 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.94, y: -10 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute top-[56px] sm:top-[62px] right-3 sm:right-4 z-30 w-[calc(100%-24px)] max-w-[275px] sm:w-[290px] sm:max-w-none rounded-[24px] sm:rounded-[26px] bg-[#0B0B0E]/95 backdrop-blur-2xl border border-white/15 p-2.5 sm:p-3 space-y-2 shadow-[0_30px_80px_rgba(0,0,0,0.92)]"
                        >
                          {CAPTURE_MODALITIES.map((item) => {
                            const Icon = item.icon
                            return (
                              <div
                                key={item.label}
                                style={{ backgroundColor: item.bg }}
                                className="rounded-[16px] sm:rounded-[18px] p-2 sm:p-2.5 flex items-center gap-3 text-white shadow-md"
                              >
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[11px] sm:rounded-[12px] bg-white flex items-center justify-center shrink-0">
                                  <Icon
                                    className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]"
                                    style={{ color: item.iconColor }}
                                  />
                                </div>
                                <span className="text-[15.5px] sm:text-[17px] font-bold tracking-tight">
                                  {item.label}
                                </span>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* =========================================================
                        TRIAGE CARDS CONTENT
                    ========================================================= */}
                    <AnimatePresence mode="wait">
                      {beatIndex <= 2 ? (
                        /* SCREENSHOT 1: URL & PDF AUTO-TAGGED TRIAGE CARDS */
                        <motion.div
                          key="triage-url-cards"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="space-y-3"
                        >
                          {/* Card 1: Share videos on YouTube */}
                          <div className="rounded-[22px] sm:rounded-[24px] bg-[#161618] border border-white/[0.08] p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <h5 className="text-[18px] sm:text-[21px] font-bold text-white leading-tight">
                                Share videos
                                <br />
                                on YouTube
                              </h5>
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[13px] bg-[#48C758] flex items-center justify-center text-white shrink-0">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.8]" />
                              </div>
                            </div>

                            {/* AI Tags Row */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className="px-2.5 sm:px-3 py-1 rounded-[10px] border border-[#FF6900] text-[11px] sm:text-[12px] font-semibold text-white flex items-center gap-1">
                                <Repeat2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF6900]" />
                                Project
                              </span>
                              <span className="px-2.5 sm:px-3 py-1 rounded-[10px] border border-[#FF6900] text-[11px] sm:text-[12px] font-semibold text-white flex items-center gap-1">
                                <Repeat2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF6900]" />
                                Task
                              </span>
                              <span className="px-2.5 sm:px-3 py-1 rounded-[10px] bg-[#FF6900] text-[11px] sm:text-[12px] font-bold text-white flex items-center gap-1">
                                <Flag className="w-3 h-3 fill-white" />
                                Oct 16
                              </span>
                            </div>

                            <p className="text-[11px] sm:text-[12px] text-[#8E8E93] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
                              <span>Communicate with friends and family</span>
                            </p>

                            {/* Attached URL Card */}
                            <div className="rounded-[16px] sm:rounded-[18px] bg-[#101012] border border-white/[0.06] p-2.5 sm:p-3 flex items-center gap-3">
                              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] sm:rounded-[13px] bg-[#1E50E2] flex items-center justify-center text-white shrink-0">
                                <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13px] sm:text-[14px] font-bold text-white">
                                  youtu.be
                                </p>
                                <p className="text-[10.5px] sm:text-[11px] text-[#8E8E93] truncate">
                                  https://youtu.be/kzVsSplYKpM?si=E_O0wE-6NQ-J13oH
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Card 2: Standard Normal Distribution Table */}
                          <motion.div
                            animate={
                              beatIndex === 2
                                ? {
                                    borderColor: 'rgba(255, 105, 0, 0.55)',
                                    boxShadow: '0 16px 40px rgba(255, 105, 0, 0.16)',
                                  }
                                : {}
                            }
                            className="rounded-[22px] sm:rounded-[24px] bg-[#161618] border border-white/[0.08] p-3.5 sm:p-4 space-y-2.5 sm:space-y-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <h5 className="text-[18px] sm:text-[20px] font-bold text-white leading-tight">
                                Standard Normal
                                <br />
                                Distribution Table
                              </h5>
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-[13px] bg-[#48C758] flex items-center justify-center text-white shrink-0">
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.8]" />
                              </div>
                            </div>

                            {/* AI Auto-Assigned Tags */}
                            <div className="flex flex-wrap items-center justify-between gap-1.5">
                              <span className="px-2.5 sm:px-3 py-1 rounded-[10px] bg-[#FF6900] text-[11px] sm:text-[12px] font-bold text-white flex items-center gap-1 shadow-[0_0_16px_rgba(255,105,0,0.4)]">
                                <Repeat2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                Statistics
                              </span>
                              <span className="px-2.5 sm:px-3 py-1 rounded-[10px] border border-[#FF6900] text-[11px] sm:text-[12px] font-semibold text-white flex items-center gap-1">
                                <Repeat2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF6900]" />
                                Task
                              </span>
                              <span className="px-2.5 sm:px-3 py-1 rounded-[10px] bg-[#FF6900] text-[11px] sm:text-[12px] font-bold text-white flex items-center gap-1">
                                <Flag className="w-3 h-3 fill-white" />
                                Oct 16
                              </span>
                            </div>

                            <p className="text-[11px] sm:text-[12px] text-[#8E8E93] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-[#8E8E93] shrink-0" />
                              <span>The table is a standard statistics reference material.</span>
                            </p>

                            {/* Attached PDF Link Card */}
                            <div className="rounded-[16px] sm:rounded-[18px] bg-[#101012] border border-white/[0.06] p-2.5 sm:p-3 flex items-center gap-3">
                              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-[12px] sm:rounded-[13px] bg-[#1E50E2] flex items-center justify-center text-white shrink-0">
                                <Link2 className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-[13px] sm:text-[14px] font-bold text-white">
                                  math.arizona.edu
                                </p>
                                <p className="text-[10.5px] sm:text-[11px] text-[#8E8E93] truncate">
                                  https://math.arizona.edu/~rsims/ma464/standardnormaltable.pdf
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      ) : (
                        /* =====================================================================
                           UNIFIED BEAT 04 (Screenshots 2 & 3 Combined in One Single Card):
                           "Week 2 · Solving systems of linear equations" -> "Turn into tasks"
                           + Where routing + Extracted microtasks + Deadline Nov 1 + Capacity Fit
                           + Create task button
                        ===================================================================== */
                        <motion.div
                          key="triage-unified-photo-to-task"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="rounded-[22px] sm:rounded-[24px] bg-[#161618] border border-white/[0.09] p-3 sm:p-4 space-y-2 sm:space-y-2.5"
                        >
                          {/* Top Title & Green Check */}
                          <div className="flex items-start justify-between gap-3">
                            <h5 className="text-[16px] sm:text-[18px] font-bold text-white leading-tight">
                              Week 2 · Solving systems of linear equations
                            </h5>
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-[11px] sm:rounded-[12px] bg-[#48C758] flex items-center justify-center text-white shrink-0">
                              <Check className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[2.8]" />
                            </div>
                          </div>

                          {/* AI Tags Row */}
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <span className="px-2.5 py-0.5 sm:py-1 rounded-[9px] bg-[#FF6900] text-[10.5px] sm:text-[11.5px] font-bold text-white flex items-center gap-1">
                              <Repeat2 className="w-3 h-3" />
                              Mathemati...
                            </span>
                            <span className="px-2.5 py-0.5 sm:py-1 rounded-[9px] bg-[#FF6900] text-[10.5px] sm:text-[11.5px] font-bold text-white flex items-center gap-1">
                              <Repeat2 className="w-3 h-3" />
                              New task
                            </span>
                            <span className="px-2.5 py-0.5 sm:py-1 rounded-[9px] border border-[#FF6900] text-[10.5px] sm:text-[11.5px] font-semibold text-white flex items-center gap-1">
                              <Flag className="w-3 h-3" />
                              Due
                            </span>
                          </div>

                          {/* AI Explanation */}
                          <p className="text-[10.5px] sm:text-[11px] text-[#8E8E93] flex items-start gap-1.5 leading-snug">
                            <Sparkles className="w-3 h-3 text-[#8E8E93] shrink-0 mt-0.5" />
                            <span>
                              The capture is a structured learning resource with specific tasks,
                              clearly tied to a Second Brain project fo...
                            </span>
                          </p>

                          {/* Turn into tasks header */}
                          <div className="flex items-center justify-between pt-0.5">
                            <div className="flex items-center gap-1.5">
                              <ListTodo className="w-4 h-4 text-[#FF6900]" />
                              <span className="text-[12.5px] sm:text-[13.5px] font-bold text-white">
                                Turn into tasks
                              </span>
                            </div>
                            <span className="text-[11px] sm:text-[12px] text-[#8E8E93]">
                              Cancel
                            </span>
                          </div>

                          {/* Where Box */}
                          <div className="rounded-[14px] bg-[#1C1C1E] border border-white/[0.06] p-2 sm:p-2.5 flex items-center justify-between gap-2">
                            <span className="text-[10.5px] sm:text-[11px] font-semibold text-[#8E8E93] shrink-0">
                              Where
                            </span>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="px-2 sm:px-2.5 py-1 rounded-[9px] bg-[#FF6900] text-[10.5px] sm:text-[11.5px] font-bold text-white flex items-center gap-1 shrink-0">
                                <BarChart2 className="w-3 h-3" />
                                Second Brain
                              </span>
                              <span className="px-2 sm:px-2.5 py-1 rounded-[9px] bg-[#FF6900] text-[10.5px] sm:text-[11.5px] font-bold text-white flex items-center gap-1 truncate">
                                <Folder className="w-3 h-3 shrink-0" />
                                <span className="truncate">Mathematics for...</span>
                              </span>
                            </div>
                          </div>

                          {/* Extracted Syllabus & Microtasks Sub-Card + Deadline + Capacity Check */}
                          <div className="rounded-[16px] bg-[#1C1C1E] border border-white/[0.06] p-2.5 sm:p-3 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[12.5px] sm:text-[13.5px] font-bold text-white leading-snug">
                                  Week 3 · Vectors and Linear Transformations
                                </p>
                                <p className="text-[10px] sm:text-[10.5px] text-[#8E8E93]">
                                  9 of 12 as microtasks
                                </p>
                              </div>
                              <span className="text-[11px] sm:text-[11.5px] font-semibold text-[#8E8E93] shrink-0">
                                135 min
                              </span>
                            </div>

                            {/* Unified Microtasks List (Unchecked + Checked from Screenshots 2 & 3) */}
                            <div className="space-y-1 pt-0.5">
                              {EXTRACTED_SYLLABUS_ITEMS.map((item) => (
                                <div
                                  key={item.title}
                                  className="flex items-center justify-between gap-2 text-[10.5px] sm:text-[11.5px]"
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div
                                      className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center shrink-0 ${
                                        item.checked
                                          ? 'bg-[#FF6900] text-white'
                                          : 'border border-white/20'
                                      }`}
                                    >
                                      {item.checked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    {item.type === 'read' ? (
                                      <BookOpen className="w-3 h-3 text-[#8E8E93] shrink-0" />
                                    ) : item.type === 'quiz' ? (
                                      <SlidersHorizontal className="w-3 h-3 text-[#8E8E93] shrink-0" />
                                    ) : item.type === 'assign' ? (
                                      <CircleDashed className="w-3 h-3 text-[#8E8E93] shrink-0" />
                                    ) : (
                                      <PlaySquare className="w-3 h-3 text-[#8E8E93] shrink-0" />
                                    )}
                                    <span
                                      className={`truncate ${
                                        item.checked
                                          ? 'text-white font-medium'
                                          : 'text-white/35'
                                      }`}
                                    >
                                      {item.title}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <span className="px-1.5 py-0.5 rounded-[6px] bg-[#262629] text-[10px] sm:text-[10.5px] font-semibold text-white/85">
                                      {item.dur}
                                    </span>
                                    <span className="text-[9.5px] text-[#8E8E93]">min</span>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Deadline Selector + Green Habit Capacity Fit */}
                            <div className="pt-2 border-t border-white/[0.07] space-y-1.5">
                              <div className="flex items-center justify-between text-[11px] sm:text-[11.5px]">
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <Flag className="w-3 h-3" />
                                  Deadline · Nov 1
                                </span>
                                <span className="text-[#EBEBF5]">Clear</span>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className="px-2 py-0.5 rounded-full border border-[#FF6900] text-[10px] sm:text-[10.5px] font-semibold text-white whitespace-nowrap">
                                  This Sunday
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-[#FF6900] text-[10px] sm:text-[10.5px] font-bold text-white whitespace-nowrap">
                                  Next week
                                </span>
                                <span className="px-2 py-0.5 rounded-full border border-[#FF6900] text-[10px] sm:text-[10.5px] font-semibold text-white whitespace-nowrap">
                                  In 2 weeks
                                </span>
                                <span className="p-1 rounded-full border border-[#FF6900] text-white">
                                  <Calendar className="w-3 h-3" />
                                </span>
                              </div>

                              <div className="flex items-start gap-1.5 pt-0.5 text-[10.5px] sm:text-[11px] font-medium text-[#34C759] leading-snug">
                                <CheckCircle2 className="w-3.5 h-3.5 fill-[#34C759] text-black shrink-0 mt-0.5" />
                                <span>
                                  Fits in Study programming codeacademy: needs 135 min, 564 min
                                  free before Nov 1.
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Solid Orange "Create task" Button inside the same unified view */}
                          <motion.div
                            animate={
                              createPressed
                                ? { scale: 0.96, backgroundColor: '#34C759' }
                                : { scale: 1, backgroundColor: '#FF6900' }
                            }
                            className="w-full py-2 sm:py-2.5 rounded-[14px] bg-[#FF6900] text-center text-[13.5px] sm:text-[14.5px] font-bold text-white shadow-[0_10px_28px_rgba(255,105,0,0.4)]"
                          >
                            {createPressed ? '✓ Task Created in Second Brain' : 'Create task'}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
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
