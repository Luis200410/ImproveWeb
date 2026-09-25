'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Lock, 
  ChevronRight, 
  Apple,
  Clock
} from 'lucide-react'
import Link from 'next/link'
import type { AppIdentity } from '@/lib/apps-data'

import JellyfishDrift from '@/components/general/jelly-fish'

interface AppHeroShowcaseProps {
  app: AppIdentity
}

export function AppHeroShowcase({ app }: AppHeroShowcaseProps) {
  const [seconds, setSeconds] = useState(41)
  const [minutes, setMinutes] = useState(55)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev >= 59) {
          setMinutes(m => (m >= 59 ? 0 : m + 1))
          return 0
        }
        return prev + 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const isProductivity = app.slug === 'execution-productivity' || app.id === 'execution-productivity'

  return (
    <div className={`relative w-full overflow-hidden ${isProductivity ? 'pt-0 pb-10 sm:pb-16' : 'py-12 sm:py-20'}`}>
      
      {/* Background radial aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[450px] bg-gradient-to-b from-[#FF02E8]/20 via-[#5E5CE6]/15 to-transparent blur-[120px] pointer-events-none rounded-full" />

      {isProductivity ? (
        /* Full Bleed 100vw Unboxed 3D Hero Stage for Productivity App */
        <div className="w-full flex flex-col items-center text-center">
          
          {/* Full Wall-to-Wall 3D Hero Stage (Contains Logo, 3D Words & First-Frame CTA Buttons) */}
          <div className="w-full relative overflow-hidden">
            <JellyfishDrift centerMode="logo" />
          </div>

            {/* Micro Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 border-t border-white/10 text-xs font-rounded text-white/50 w-full max-w-xl mx-auto"
            >
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
                <span>Screen-Time Lock</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#FF9F0A]" />
                <span>Apple Calendar Synced</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-[#FF02E8]" />
                <span>Zero Willpower Needed</span>
              </span>
            </motion.div>

          </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Standard 2-Column Grid Layout for Other Apps */}
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Hero Column */}
            <div className="lg:col-span-6 space-y-6 sm:space-y-8 text-left">
              
              {/* Tag Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.06] border border-white/10 backdrop-blur-md"
              >
                <div className="w-2 h-2 rounded-full bg-[#30D158] animate-pulse" />
                <span className="font-rounded text-xs font-bold uppercase tracking-wider text-white/90">
                  {app.number} • NATIVE IOS SUITE
                </span>
              </motion.div>

              {/* Massive Hero Title */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="title-huge text-5xl sm:text-7xl md:text-8xl lg:text-8xl font-black uppercase tracking-tight text-white leading-[0.88]"
              >
                {app.name}
              </motion.h1>

              {/* Copy */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="type-body text-base sm:text-xl text-[var(--label-2)] max-w-xl leading-relaxed"
              >
                Built for real execution. Locks distracting apps at the iOS system level, drops habits straight onto your Apple Calendar, and tracks your daily 90-minute energy rhythm.
              </motion.p>

              {/* Polished Capsule Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-4 pt-2"
              >
                <Link
                  href="/register"
                  className="btn-primary text-xs sm:text-sm uppercase px-8 sm:px-9 py-4 sm:py-4.5 tracking-wider shadow-[0_0_30px_rgba(94,92,230,0.45)] hover:shadow-[0_0_40px_rgba(94,92,230,0.65)] transition-all flex items-center gap-2"
                >
                  <span>Get {app.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="btn-secondary text-xs sm:text-sm uppercase px-8 sm:px-9 py-4 sm:py-4.5 tracking-wider hover:bg-white/10 transition-all"
                >
                  <span>View Membership</span>
                </Link>
              </motion.div>

              {/* Micro Trust Indicators */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-6 pt-4 border-t border-white/10 text-xs font-rounded text-white/50"
              >
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
                  <span>Screen-Time Lock</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#FF9F0A]" />
                  <span>Apple Calendar Synced</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-[#5E5CE6]" />
                  <span>Zero Willpower Needed</span>
                </span>
              </motion.div>

            </div>

            {/* Right Hero Column: Floating 3D Device Showcase */}
            <div className="lg:col-span-6 flex justify-center relative">
              
              {/* Top Floating Badge */}
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 sm:-top-6 -left-4 sm:left-4 z-30 px-4 py-2.5 rounded-2xl bg-[#1C1C24]/90 border border-white/15 text-white shadow-2xl backdrop-blur-xl flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">App Shield Active</div>
                  <div className="text-[10px] text-white/50">Instagram, TikTok & Games Blocked</div>
                </div>
              </motion.div>

              {/* Bottom Floating Badge */}
              <motion.div 
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 sm:-bottom-6 -right-2 sm:right-4 z-30 px-4 py-2.5 rounded-2xl bg-[#1C1C24]/90 border border-white/15 text-white shadow-2xl backdrop-blur-xl flex items-center gap-2.5"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FF9F0A]/20 border border-[#FF9F0A]/30 flex items-center justify-center text-[#FF9F0A]">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Timeline Synced</div>
                  <div className="text-[10px] text-white/50">Habits Locked into Real Hours</div>
                </div>
              </motion.div>

              {/* The iPhone Showcase Frame */}
              <motion.div 
                whileHover={{ rotateY: 4, rotateX: -3, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                className="w-full max-w-[340px] sm:max-w-[370px] rounded-[52px] border-[5px] border-[#323238] bg-[#0A0A0E] p-3.5 shadow-[0_25px_80px_rgba(0,0,0,0.9)] relative overflow-hidden"
              >
                
                {/* Device Bezel & Inner Glass */}
                <div className="w-full rounded-[42px] bg-[#050507] border border-white/10 p-4 space-y-4 text-white overflow-hidden relative">
                  
                  {/* Status Bar */}
                  <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-white/5">
                    <span className="text-xs font-rounded font-bold text-white/80">9:41</span>
                    <div className="w-24 h-4.5 bg-black rounded-full border border-white/15 mx-auto" />
                    <div className="flex items-center gap-1.5 text-white/80">
                      <span className="text-[10px] font-bold">5G</span>
                      <div className="w-4 h-2 border border-white/80 rounded-sm" />
                    </div>
                  </div>

                  {/* Dashboard Top Greeting */}
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Good Morning</span>
                      <h3 className="text-lg font-black text-white tracking-tight">Today&apos;s Focus</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5E5CE6] to-[#30D158] flex items-center justify-center font-bold text-xs shadow-md">
                      LC
                    </div>
                  </div>

                  {/* Live Card */}
                  <div className="rounded-2xl bg-gradient-to-r from-[#15803D] via-[#22C55E] to-[#16A34A] p-4 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)] border border-white/20 relative overflow-hidden group">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/90">
                          <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                          <span>FOCUS TIMER ACTIVE</span>
                        </div>
                        <div className="text-sm font-bold text-white">Study programming</div>
                      </div>
                      <div className="text-right">
                        <div className="font-rounded text-xl font-black text-white">
                          1:{minutes}:{seconds.toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Metrics Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5">
                      <span className="text-[9px] text-white/40 uppercase tracking-wider block">Sessions</span>
                      <div className="font-rounded text-lg font-black text-white mt-0.5">6 Today</div>
                    </div>
                    <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5">
                      <span className="text-[9px] text-white/40 uppercase tracking-wider block">Deep Work</span>
                      <div className="font-rounded text-lg font-black text-white mt-0.5">8h Logged</div>
                    </div>
                    <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5">
                      <span className="text-[9px] text-white/40 uppercase tracking-wider block">Consistency</span>
                      <div className="font-rounded text-lg font-black text-white mt-0.5">94% Score</div>
                    </div>
                    <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5">
                      <span className="text-[9px] text-white/40 uppercase tracking-wider block">This Week</span>
                      <div className="font-rounded text-lg font-black text-white mt-0.5">36.3h Peak</div>
                    </div>
                  </div>

                  {/* Next Scheduled Event */}
                  <div className="bg-[#121216] border border-white/5 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#FF9F0A]" />
                      <span className="text-white/80 font-medium truncate">Deep study session</span>
                    </div>
                    <span className="text-[10px] font-rounded text-white/40">8:00 AM</span>
                  </div>

                  {/* Bottom Home Bar */}
                  <div className="flex justify-center pt-2 pb-1">
                    <div className="w-28 h-1 bg-white/25 rounded-full" />
                  </div>

                </div>
              </motion.div>

            </div>

          </div>
        </div>
      )}
    </div>
  )
}
