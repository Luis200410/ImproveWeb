'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Apple, 
  ArrowRight, 
  CheckCircle2, 
  Play, 
  Pause, 
  ShieldAlert, 
  Lock, 
  Clock, 
  BellRing, 
  Zap, 
  Smartphone, 
  Laptop, 
  Sparkles, 
  RotateCcw, 
  Mic, 
  ShieldCheck, 
  EyeOff, 
  Check, 
  Flame, 
  Calendar,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'

export function ProductivityOverhaul() {
  const [email, setEmail] = useState('')
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [activeStoryIndex, setActiveStoryIndex] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const updatesRef = useRef<HTMLDivElement>(null)

  // 20-second simulated day demo runner
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isVideoPlaying) {
      interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 20) {
            setIsVideoPlaying(false)
            return 0
          }
          return Math.round((prev + 0.1) * 10) / 10
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isVideoPlaying])

  const scrollToUpdates = () => {
    updatesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && email.includes('@')) {
      setEmailSubmitted(true)
    }
  }

  return (
    <div className="w-full bg-transparent text-white selection:bg-[#FF02E8] selection:text-white">
      
      {/* =========================================================================
          1. HERO SECTION (PRODUCTIVITY BEHIND YOU)
         ========================================================================= */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center text-center px-6 pt-16 pb-24 overflow-hidden">
        {/* Massive Ambient "PRODUCTIVITY" Background Typography */}
        <div 
          aria-hidden="true" 
          className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
        >
          <span className="text-[17vw] sm:text-[18vw] font-black uppercase text-white/[0.035] tracking-tighter leading-none whitespace-nowrap blur-[1px]">
            PRODUCTIVITY
          </span>
        </div>

        {/* Radial Magenta Ambient Flare */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] sm:w-[850px] h-[450px] bg-gradient-to-b from-[#FF02E8]/20 via-[#FF02E8]/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          {/* Eyebrow Pill */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md mb-8 shadow-sm"
          >
            <div className="w-2 h-2 rounded-full bg-[#FF02E8] animate-pulse" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/90">
              SUITE 03 • SCREEN-TIME & HABIT ALARM
            </span>
          </motion.div>

          {/* Main Hero Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl xs:text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-black tracking-tight leading-[1.08] uppercase max-w-4xl mb-6"
          >
            Your phone stops distracting you the moment your habit starts.
          </motion.h1>

          {/* Subhead */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-2xl text-zinc-300 font-normal max-w-2xl leading-relaxed mb-10"
          >
            Plan your day. The alarm breaks through. Distractions stay locked until the work is done.
          </motion.p>

          {/* Action CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center gap-4"
          >
            <a 
              href="#download" 
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-white text-black font-extrabold text-base hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_35px_rgba(255,2,232,0.35)] cursor-pointer"
            >
              <Apple className="w-5 h-5 fill-current" />
              <span>Download for iPhone</span>
            </a>

            <button 
              type="button"
              onClick={scrollToUpdates}
              className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <span>Not ready yet? Get updates</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FF02E8]" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* =========================================================================
          2. THE PROBLEM (THE LOOP: LAPTOP + PHONE)
         ========================================================================= */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black/40">
        <div className="max-w-5xl mx-auto">
          {/* Section Kicker */}
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF02E8] uppercase">
              02 // THE LOOP
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2 text-white">
              Your loop: laptop + phone
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-lg mx-auto">
              How the most ambitious days quietly evaporate before lunch.
            </p>
          </div>

          {/* Side-by-side Duality: Laptop vs Phone Trap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-16">
            {/* Left: The Intentional Desk */}
            <div className="relative rounded-3xl p-8 sm:p-10 bg-white/[0.02] border border-white/10 backdrop-blur-xl flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Laptop className="w-6 h-6 text-zinc-300" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">
                  THE INTENTION
                </span>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">You sit down to work.</h3>
                <p className="text-base text-zinc-400 leading-relaxed">
                  You know exactly what to do. The tabs are open, the coffee is fresh, and you set out to build momentum.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-2 text-xs font-mono text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>09:00 AM • Goal: 2 Hours Deep Work</span>
              </div>
            </div>

            {/* Right: The Phone Distraction Rabbit Hole */}
            <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-br from-rose-950/20 via-black to-black border border-rose-500/30 backdrop-blur-xl flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-rose-400" />
                </div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-rose-400 font-bold">
                  THE HIJACK
                </span>
              </div>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white">Your phone has other plans.</h3>
                <p className="text-base text-zinc-300 leading-relaxed">
                  One vibration. You unlock to check a text. 45 minutes later you&apos;re deep into reels, replying to cold emails, or watching strangers argue online.
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-rose-500/20 flex items-center gap-2 text-xs font-mono text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>09:47 AM • Habit Broken • Momentum Lost</span>
              </div>
            </div>
          </div>

          {/* The 4 Hard Truths Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                num: "01",
                text: "You sit down to work. Your phone has other plans.",
                sub: "The device in your pocket is engineered by thousands of engineers to defeat your willpower."
              },
              {
                num: "02",
                text: "You plan the morning, then lose it to one notification.",
                sub: "It only takes 2 seconds of distraction to cost you 23 minutes of deep cognitive recovery."
              },
              {
                num: "03",
                text: "Your habits live in a list you never open.",
                sub: "To-do lists and habit apps rely on you remembering to check them when you're already distracted."
              },
              {
                num: "04",
                text: "You know exactly what to do. You just never start on time.",
                sub: "Starting is the only real barrier. Once the clock is ticking and apps are blocked, you fly."
              }
            ].map((item, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-mono text-[#FF02E8] font-bold block mb-2">{item.num}</span>
                  <p className="text-lg font-bold text-white mb-2 leading-snug">
                    {item.text}
                  </p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. HOW IT WORKS: BUILT FOR YOUR REAL DAY
         ========================================================================= */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF02E8] uppercase">
              03 // HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2 text-white">
              Built for your real day
            </h2>
            <p className="text-lg text-zinc-300 font-medium mt-3">
              One app for every block of your day.
            </p>
          </div>

          {/* 5 Real-Day Scenario Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Studying */}
            <div className="rounded-3xl p-7 bg-white/[0.02] border border-white/10 hover:border-[#FF02E8]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-[#FF02E8]/10 text-[#FF02E8] border border-[#FF02E8]/20">
                    Studying
                  </span>
                  <Lock className="w-4 h-4 text-[#FF02E8]" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  “Two hours of studying means two hours. Instagram can wait.”
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  When you schedule study time, social apps shut down completely. No bypass buttons, no 5-minute extensions. You lock in and learn.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>Hard Shield</span>
                <span className="text-zinc-300">Instagram / TikTok Locked</span>
              </div>
            </div>

            {/* 2. Deep work */}
            <div className="rounded-3xl p-7 bg-white/[0.02] border border-white/10 hover:border-[#2254f5]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-[#2254f5]/10 text-[#2254f5] border border-[#2254f5]/20">
                    Deep Work
                  </span>
                  <Laptop className="w-4 h-4 text-[#2254f5]" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  “Your laptop stays on the work. So does your phone.”
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  No phantom checking. The phone screen turns into a dedicated focus countdown so you stay in state for the entire sprint.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>90-min Sprint</span>
                <span className="text-zinc-300">Live Focus Timer</span>
              </div>
            </div>

            {/* 3. Workout */}
            <div className="rounded-3xl p-7 bg-white/[0.02] border border-white/10 hover:border-[#43b752]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-[#43b752]/10 text-[#43b752] border border-[#43b752]/20">
                    Workout
                  </span>
                  <Flame className="w-4 h-4 text-[#43b752]" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  “The alarm goes off, you go. No scrolling in the locker room.”
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Full-screen breakthrough alarm rings when gym time hits. Put down the phone, finish your sets, and leave without wasting 30 minutes on a bench.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>Full-Screen Alarm</span>
                <span className="text-zinc-300">Zero Locker Scrolling</span>
              </div>
            </div>

            {/* 4. Morning routine */}
            <div className="rounded-3xl p-7 bg-white/[0.02] border border-white/10 hover:border-[#efb219]/40 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-[#efb219]/10 text-[#efb219] border border-[#efb219]/20">
                    Morning Routine
                  </span>
                  <Clock className="w-4 h-4 text-[#efb219]" />
                </div>
                <h4 className="text-xl font-bold text-white mb-3">
                  “Wake up to a plan, not a feed.”
                </h4>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  First 60 minutes of your morning are guarded. The moment your eyes open, your timeline is front and center—not a dopamine feed.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span>Dawn Reset</span>
                <span className="text-zinc-300">Clean Dopamine Slate</span>
              </div>
            </div>

            {/* 5. When life happens (Spans 2 cols on md/lg) */}
            <div className="rounded-3xl p-7 bg-gradient-to-r from-purple-950/20 via-white/[0.02] to-white/[0.02] border border-purple-500/30 hover:border-purple-400/50 transition-all flex flex-col justify-between md:col-span-2 group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                    When Life Happens
                  </span>
                  <RotateCcw className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="text-2xl font-bold text-white mb-3">
                  “Meeting ran late? Re-pace your whole day in one tap.”
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                  Real life isn&apos;t rigid. When a traffic jam or delayed meeting pushes your schedule, one tap shifts your remaining blocks intelligently. You never feel behind, and your habits remain protected.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-purple-300 font-mono">
                <span>Adaptive Reschedule Engine</span>
                <span className="text-white font-semibold">1-Tap Day Balance</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          4. DEMO VIDEO (WATCH A DAY RUN ITSELF - 20 SECONDS)
         ========================================================================= */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black/60">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-xs font-mono font-bold tracking-widest text-[#FF02E8] uppercase">
            04 // DEMO VIDEO
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2 text-white mb-4">
            Watch a day run itself.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 mb-10">
            See 24 hours of intentional habit protection in 20 seconds.
          </p>

          {/* Interactive Cinematic Demo Stage */}
          <div className="relative rounded-3xl bg-zinc-950 border border-white/15 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] aspect-[16/9] flex flex-col justify-between p-6 sm:p-8">
            {/* Background animated day cycle */}
            <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 pointer-events-none" />

            {/* Glowing Aura inside screen */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-all duration-700"
              style={{
                backgroundColor: videoProgress < 6 
                  ? '#efb21920' 
                  : videoProgress < 14 
                    ? '#ff02e825' 
                    : '#2254f520'
              }}
            />

            {/* Top Bar of Video */}
            <div className="relative z-10 flex items-center justify-between text-xs font-mono text-zinc-400">
              <span className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isVideoPlaying ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`} />
                <span>{isVideoPlaying ? 'LIVE DAY SIMULATION' : 'READY TO PLAY'}</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                0:{Math.floor(videoProgress).toString().padStart(2, '0')} / 0:20
              </span>
            </div>

            {/* Center Content: Dynamic State of the Day */}
            <div className="relative z-10 flex flex-col items-center justify-center py-6">
              {!isVideoPlaying && videoProgress === 0 ? (
                <button
                  type="button"
                  onClick={() => setIsVideoPlaying(true)}
                  className="group flex flex-col items-center gap-3 cursor-pointer"
                >
                  <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center shadow-[0_0_40px_rgba(255,2,232,0.6)] group-hover:scale-110 active:scale-95 transition-all">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                  <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/80 group-hover:text-white">
                    Play 20-Second Preview
                  </span>
                </button>
              ) : (
                <div className="flex flex-col items-center text-center max-w-md animate-fade-in">
                  {videoProgress < 6 && (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center mb-3">
                        <Clock className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono uppercase text-amber-400 font-bold mb-1">07:00 AM • Morning Reset</span>
                      <h4 className="text-xl sm:text-2xl font-black text-white">Full-Screen Alarm Fires</h4>
                      <p className="text-xs text-zinc-400 mt-1">Social feeds stay shielded while your water and workout plan load.</p>
                    </>
                  )}
                  {videoProgress >= 6 && videoProgress < 14 && (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-[#FF02E8]/20 border border-[#FF02E8]/40 text-[#FF02E8] flex items-center justify-center mb-3">
                        <Lock className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono uppercase text-[#FF02E8] font-bold mb-1">10:00 AM • Deep Code Sprint</span>
                      <h4 className="text-xl sm:text-2xl font-black text-white">Phone Locked to Focus Timer</h4>
                      <p className="text-xs text-zinc-400 mt-1">Distracting apps simply won&apos;t open. Laptop and mind in deep sync.</p>
                    </>
                  )}
                  {videoProgress >= 14 && (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-[#2254f5]/20 border border-[#2254f5]/40 text-[#2254f5] flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-mono uppercase text-[#2254f5] font-bold mb-1">08:00 PM • Evening Victory</span>
                      <h4 className="text-xl sm:text-2xl font-black text-white">100% Habit Consistency</h4>
                      <p className="text-xs text-zinc-400 mt-1">All habits logged. No regrets, no lost hours on a screen.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Progress Bar & Toggle */}
            <div className="relative z-10 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer"
              >
                {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
              </button>
              
              {/* Scrub Line */}
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-[#FF02E8] to-[#5E5CE6] transition-all duration-100"
                  style={{ width: `${(videoProgress / 20) * 100}%` }}
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  setVideoProgress(0)
                  setIsVideoPlaying(true)
                }}
                className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          5. HOW TO SET IT UP (INSTAGRAM / STORIES STYLE)
         ========================================================================= */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-transparent">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-mono font-bold tracking-widest text-[#FF02E8] uppercase">
            05 // ONBOARDING
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2 text-white">
            Set it up in 60 seconds.
          </h2>
          <p className="text-base sm:text-lg text-zinc-400 mt-3 mb-16">
            Instagram-simple setup. Zero clutter, zero friction.
          </p>

          {/* 3 Story Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Step 1 */}
            <div className="relative rounded-3xl p-6 bg-white/[0.025] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between overflow-hidden group">
              {/* Story top indicator */}
              <div className="flex items-center gap-1.5 mb-6">
                <div className="h-1 flex-1 rounded-full bg-[#FF02E8]" />
                <div className="h-1 flex-1 rounded-full bg-white/15" />
                <div className="h-1 flex-1 rounded-full bg-white/15" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase text-[#FF02E8] font-bold block mb-2">Step 01</span>
                <h3 className="text-2xl font-bold text-white mb-2">Create a habit.</h3>
                <p className="text-zinc-400 text-sm mb-6">Name it, pick a time.</p>
              </div>

              {/* Mini UI mockup */}
              <div className="rounded-2xl p-4 bg-black/60 border border-white/10 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Habit</span>
                  <span className="text-white font-bold">Deep Work Sprint</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Time</span>
                  <span className="text-[#FF02E8] font-bold">09:00 AM — 11:00 AM</span>
                </div>
                <div className="flex justify-between items-center text-zinc-400">
                  <span>Alarm</span>
                  <span className="text-emerald-400 font-bold">Full-Screen Loud</span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-3xl p-6 bg-white/[0.025] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between overflow-hidden group">
              {/* Story top indicator */}
              <div className="flex items-center gap-1.5 mb-6">
                <div className="h-1 flex-1 rounded-full bg-white/40" />
                <div className="h-1 flex-1 rounded-full bg-[#FF02E8]" />
                <div className="h-1 flex-1 rounded-full bg-white/15" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase text-[#FF02E8] font-bold block mb-2">Step 02</span>
                <h3 className="text-2xl font-bold text-white mb-2">Choose what to block.</h3>
                <p className="text-zinc-400 text-sm mb-6">The apps that steal your time.</p>
              </div>

              {/* Mini UI mockup */}
              <div className="rounded-2xl p-4 bg-black/60 border border-white/10 space-y-2.5 font-mono text-xs">
                {['Instagram', 'TikTok', 'X / Twitter'].map((app, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-zinc-300">{app}</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                      BLOCKED
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-3xl p-6 bg-white/[0.025] border border-white/10 hover:border-white/25 transition-all flex flex-col justify-between overflow-hidden group">
              {/* Story top indicator */}
              <div className="flex items-center gap-1.5 mb-6">
                <div className="h-1 flex-1 rounded-full bg-white/40" />
                <div className="h-1 flex-1 rounded-full bg-white/40" />
                <div className="h-1 flex-1 rounded-full bg-[#FF02E8]" />
              </div>

              <div>
                <span className="text-xs font-mono uppercase text-[#FF02E8] font-bold block mb-2">Step 03</span>
                <h3 className="text-2xl font-bold text-white mb-2">Live your day.</h3>
                <p className="text-zinc-400 text-sm mb-6">The alarm starts it, the block protects it.</p>
              </div>

              {/* Mini UI mockup */}
              <div className="rounded-2xl p-4 bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex flex-col items-center text-center justify-center py-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
                <span className="font-bold">Habit Protected</span>
                <span className="text-[10px] text-zinc-400 mt-1">No Willpower Required</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          6. SCREENSHOTS & OUTCOME CAPTIONS
         ========================================================================= */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF02E8] uppercase">
              06 // REAL OUTCOMES
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2 text-white">
              Every detail engineered to protect your time
            </h2>
          </div>

          {/* 6 Outcome Cards with Device Mockups */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* 1. Day timeline */}
            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">Day Timeline</span>
                <h4 className="text-xl font-bold text-white">“See your whole day at a glance.”</h4>
              </div>
              <div className="rounded-2xl bg-black border border-white/10 p-4 aspect-[4/5] flex flex-col justify-between font-mono text-xs">
                <div className="text-[10px] text-zinc-500 pb-2 border-b border-white/5 flex justify-between">
                  <span>TODAY</span>
                  <span className="text-[#FF02E8]">6 HABITS</span>
                </div>
                <div className="space-y-3 py-2">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Morning Reading</div>
                      <div className="text-[10px] text-zinc-400">07:00 AM • 30 mins</div>
                    </div>
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FF02E8]/10 border border-[#FF02E8]/30 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Deep Work Sprint</div>
                      <div className="text-[10px] text-[#FF02E8]">09:00 AM • Active Now</div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#FF02E8] animate-ping" />
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between opacity-50">
                    <div>
                      <div className="text-white font-bold">Gym Workout</div>
                      <div className="text-[10px] text-zinc-400">05:30 PM • 60 mins</div>
                    </div>
                    <Clock className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
                <div className="text-[9px] text-zinc-600 text-center">Live Synchronized Timeline</div>
              </div>
            </div>

            {/* 2. Full-screen alarm */}
            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">Full-Screen Alarm</span>
                <h4 className="text-xl font-bold text-white">“Impossible to ignore. On purpose.”</h4>
              </div>
              <div className="rounded-2xl bg-gradient-to-b from-rose-950/60 to-black border border-rose-500/30 p-4 aspect-[4/5] flex flex-col items-center justify-between text-center font-mono">
                <div className="pt-4">
                  <BellRing className="w-10 h-10 text-rose-400 animate-bounce mx-auto mb-2" />
                  <span className="text-[10px] uppercase tracking-widest text-rose-400 font-bold">HARD BREAKTHROUGH ALARM</span>
                </div>
                <div className="my-auto">
                  <div className="text-3xl font-black text-white tracking-tight">09:00 AM</div>
                  <div className="text-sm font-bold text-rose-200 mt-1">START CODING SPRINT</div>
                  <div className="text-[10px] text-zinc-400 mt-2">Bypasses mute • Screen-Time Lock Engaged</div>
                </div>
                <div className="w-full py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider">
                  Slide To Begin Habit
                </div>
              </div>
            </div>

            {/* 3. Focus timer */}
            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">Focus Timer</span>
                <h4 className="text-xl font-bold text-white">“Know exactly how much is left.”</h4>
              </div>
              <div className="rounded-2xl bg-black border border-white/10 p-4 aspect-[4/5] flex flex-col items-center justify-center text-center font-mono relative overflow-hidden">
                <div className="w-36 h-36 rounded-full border-4 border-[#FF02E8] border-t-transparent animate-spin flex items-center justify-center p-2 mb-4">
                  <div className="w-full h-full rounded-full border border-white/10 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-white">41:20</span>
                    <span className="text-[9px] text-zinc-400 uppercase">REMAINING</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-white">Deep Work Block 01</span>
                <span className="text-[10px] text-[#FF02E8] mt-1 font-semibold">Distractions Locked</span>
              </div>
            </div>

            {/* 4. Blocked app */}
            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">Blocked App</span>
                <h4 className="text-xl font-bold text-white">“The apps that distract you just… don’t open.”</h4>
              </div>
              <div className="rounded-2xl bg-black border border-white/10 p-4 aspect-[4/5] flex flex-col items-center justify-center text-center font-mono relative">
                <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/15 flex items-center justify-center mb-3">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h5 className="text-base font-bold text-white mb-1">App Shield Active</h5>
                <p className="text-[11px] text-zinc-400 max-w-[200px] leading-relaxed mb-4">
                  This app is locked until your 09:00 AM Deep Work habit finishes.
                </p>
                <div className="text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-zinc-400">
                  No Bypass Available
                </div>
              </div>
            </div>

            {/* 5. Dashboard */}
            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">Dashboard</span>
                <h4 className="text-xl font-bold text-white">“See if you actually showed up.”</h4>
              </div>
              <div className="rounded-2xl bg-black border border-white/10 p-4 aspect-[4/5] flex flex-col justify-between font-mono text-xs">
                <div className="flex justify-between items-center text-zinc-400 text-[10px]">
                  <span>WEEKLY SCORE</span>
                  <span className="text-emerald-400 font-bold">TOP 5%</span>
                </div>
                <div className="my-auto text-center">
                  <div className="text-4xl font-black text-white">96%</div>
                  <div className="text-xs text-zinc-400 mt-1">Habits Executed</div>
                  <div className="flex justify-center gap-1.5 mt-4">
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <span className="text-[8px] text-zinc-500">{day}</span>
                        <div className={`w-4 h-6 rounded ${i < 5 ? 'bg-[#FF02E8]' : 'bg-white/10'}`} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-[9px] text-zinc-500 text-center">14-Day Perfect Streak</div>
              </div>
            </div>

            {/* 6. Siri */}
            <div className="rounded-3xl p-6 bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between">
              <div className="mb-6">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-1">Siri Shortcuts</span>
                <h4 className="text-xl font-bold text-white">“‘Hey Siri, start my workout.’”</h4>
              </div>
              <div className="rounded-2xl bg-gradient-to-b from-purple-950/40 via-black to-black border border-purple-500/30 p-4 aspect-[4/5] flex flex-col items-center justify-center text-center font-mono">
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-pink-500 p-[2px] mb-3 animate-pulse">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="text-sm font-bold text-white mb-1">“Hey Siri, start my workout.”</div>
                <p className="text-[11px] text-zinc-400 max-w-[200px] leading-relaxed mt-2">
                  Workout habit triggered. Locker room scroll shield locked. Focus music playing.
                </p>
                <div className="mt-4 text-[10px] text-purple-300 font-bold">100% Hands-Free</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          7. PRIVACY
         ========================================================================= */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-transparent">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            07 // SOVEREIGN PRIVACY
          </span>
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-2 text-white mb-6">
            Your day stays yours.
          </h2>
          <p className="text-lg sm:text-xl text-zinc-300 leading-relaxed max-w-2xl mx-auto mb-12">
            Everything lives on your iPhone. The AI runs on your device. No account, no sign-up, and we collect nothing. Not even your email, unless you give it to us.
          </p>

          {/* Privacy Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">01 / LOCAL AI</span>
              <h5 className="text-sm font-bold text-white mb-1">Runs On-Device</h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Apple Neural Engine powers adaptive day re-pacing right inside your phone hardware.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">02 / ZERO DATA</span>
              <h5 className="text-sm font-bold text-white mb-1">No Account Required</h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Download and start immediately. No passwords, no logins, no cloud surveillance databases.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
              <span className="text-xs font-mono text-emerald-400 font-bold block mb-1">03 / APPLE SCREEN TIME</span>
              <h5 className="text-sm font-bold text-white mb-1">Sovereign Shield API</h5>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Native FamilyControls and DeviceActivity frameworks block distractions safely and locally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          8. WHY I BUILT THIS (FOUNDER NOTE)
         ========================================================================= */}
      <section className="relative py-24 px-6 border-t border-white/10 bg-black/60">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono font-bold tracking-widest text-[#FF02E8] uppercase">
              08 // FOUNDER STORY
            </span>
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight mt-2 text-white">
              Why I built this
            </h2>
          </div>

          <div className="relative rounded-3xl p-8 sm:p-12 bg-white/[0.02] border border-white/10 backdrop-blur-xl">
            {/* Founder Portrait Frame */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-tr from-zinc-800 to-zinc-950 border border-white/20 flex-shrink-0 shadow-xl flex items-center justify-center">
                {/* Fallback elegant monogram portrait */}
                <div className="flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-black text-white tracking-wider">LC</span>
                  <span className="text-[9px] font-mono uppercase text-zinc-500 mt-0.5">Luis • Founder</span>
                </div>
              </div>
              <div className="text-center sm:text-left">
                <h4 className="text-xl font-bold text-white">Luis Castañeda</h4>
                <p className="text-xs font-mono text-[#FF02E8] uppercase tracking-wider mt-0.5">Founder, Improve</p>
                <p className="text-xs text-zinc-400 mt-2">
                  Building a sovereign software architecture that protects human attention.
                </p>
              </div>
            </div>

            {/* Letter Content */}
            <div className="space-y-5 text-base sm:text-lg text-zinc-300 leading-relaxed font-normal">
              <p>
                I was losing my days to noise.
              </p>
              <p>
                Hours gone to my phone. Things I promised myself, never done. Moments with people I love, missed while I was somewhere else on a screen.
              </p>
              <p>
                And the worst part: I started getting frustrated with the people around me for interrupting work I wasn’t even doing. The problem was never them. It was me, with no system.
              </p>
              <p className="text-white font-medium">
                So I built one. Productivity is the app I needed: it plans my day, starts it for me, and protects the time that matters, so I can be fully in my work and fully with my people.
              </p>
              <div className="pt-4 border-t border-white/10">
                <span className="font-bold text-white tracking-wide">— Luis, founder of Improve</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          12. FINAL CTA
         ========================================================================= */}
      <section id="download" ref={updatesRef} className="relative py-28 px-6 border-t border-white/10 bg-gradient-to-b from-transparent via-[#FF02E8]/5 to-transparent text-center overflow-hidden">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FF02E8]/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <span className="text-xs font-mono font-bold tracking-widest text-[#FF02E8] uppercase mb-4">
            TAKE YOUR DAY BACK
          </span>
          <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white mb-6">
            Take your day back.
          </h2>
          <p className="text-base sm:text-lg text-zinc-300 mb-10 max-w-lg">
            No more lost mornings or broken promises to yourself. Put the system to work today.
          </p>

          {/* Download for iPhone CTA */}
          <div className="flex flex-col items-center gap-6 w-full">
            <a 
              href="#"
              className="inline-flex items-center gap-3 px-10 py-4 rounded-full bg-white text-black font-extrabold text-base sm:text-lg hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,2,232,0.4)] cursor-pointer"
            >
              <Apple className="w-6 h-6 fill-current" />
              <span>Download for iPhone</span>
            </a>

            {/* Email Updates Option */}
            <div className="w-full max-w-md pt-6 border-t border-white/10">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-3">
                Or get updates by email
              </span>

              {emailSubmitted ? (
                <div className="p-3.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>You&apos;re subscribed. We&apos;ll send you release notes and updates.</span>
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="flex gap-2">
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email for updates"
                    className="flex-1 px-4 py-3 rounded-full bg-white/[0.04] border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
