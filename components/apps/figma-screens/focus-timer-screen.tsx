'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, ChevronRight, CheckCircle2, TrendingUp, Sparkles, Flame, Clock } from 'lucide-react'

export function FocusTimerScreen() {
  const [seconds, setSeconds] = useState(41)
  const [minutes, setMinutes] = useState(55)
  const [hours, setHours] = useState(1)
  const [isActive, setIsActive] = useState(true)

  // Live ticking timer
  useEffect(() => {
    if (!isActive) return
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
  }, [isActive])

  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="w-full h-full bg-[#050507] text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 select-none relative overflow-hidden border border-white/10 shadow-2xl">
      
      {/* Background ambient radar wave */}
      <motion.div 
        animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-10 left-1/2 -translate-x-1/2 w-64 h-32 bg-[#30D158]/20 blur-3xl pointer-events-none rounded-full"
      />

      {/* App Top Status bar */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold tracking-tight text-white/90">Dashboard</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#30D158] animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-rounded text-white/40 uppercase tracking-wider">Ultradian Wave</span>
          <div className="px-2 py-0.5 rounded-full bg-[#30D158]/20 border border-[#30D158]/40 text-[#30D158] text-[10px] font-rounded font-bold">
            Peak Energy
          </div>
        </div>
      </div>

      {/* Main Active Session Banner from Figma */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsActive(!isActive)}
        className="relative group cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-[#19A33E] via-[#22C55E] to-[#15803D] p-4 sm:p-5 text-white shadow-[0_0_40px_rgba(34,197,94,0.35)] border border-white/20"
      >
        {/* Glow sheen sweep */}
        <motion.div 
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none"
        />

        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="text-xs uppercase tracking-wider font-bold text-white/90">FOCUSING NOW</span>
            </div>
            <div className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Study programming</span>
              <span className="text-white/60 font-normal text-sm">• Session 4/6</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <div className="font-rounded text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-md">
              {formattedTime}
            </div>
            <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Mini progress bar inside card */}
        <div className="mt-3 pt-3 border-t border-white/20 flex items-center justify-between text-[11px] text-white/80 font-rounded">
          <span>7 habits left today</span>
          <span className="flex items-center gap-1 font-bold">
            <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300" /> +45m Deep Focus
          </span>
        </div>
      </motion.div>

      {/* Telemetry Metrics Grid from Figma */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white/[0.04] border border-white/5 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Sessions Today</span>
          <div className="flex items-baseline gap-1">
            <span className="text-red-400 text-xs font-bold">🎯</span>
            <span className="font-rounded text-xl font-black text-white">6</span>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/5 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Focused Time</span>
          <div className="flex items-baseline gap-1">
            <span className="text-green-400 text-xs font-bold">⏳</span>
            <span className="font-rounded text-xl font-black text-white">8h</span>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/5 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">Consistency</span>
          <div className="flex items-baseline gap-1">
            <span className="text-yellow-400 text-xs font-bold">📈</span>
            <span className="font-rounded text-xl font-black text-white">40%</span>
          </div>
        </div>

        <div className="bg-white/[0.04] border border-white/5 rounded-xl p-3 space-y-1">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block">This Week</span>
          <div className="flex items-baseline gap-1">
            <span className="text-indigo-400 text-xs font-bold">⚡</span>
            <span className="font-rounded text-xl font-black text-white">36.3h</span>
          </div>
        </div>
      </div>

      {/* Today's Completed Sessions Timeline from Figma */}
      <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-white/50 border-b border-white/5 pb-1.5">
          <span className="font-bold tracking-wide uppercase">Today&apos;s Sessions</span>
          <span className="font-rounded text-emerald-400 font-semibold">100% In Peak Window</span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-white/80 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Deep study session</span>
            </div>
            <span className="font-rounded text-white/40 text-[11px]">8:00 AM • 55m</span>
          </div>

          <div className="flex items-center justify-between text-white/80 py-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" />
              <span>Project roadmap review</span>
            </div>
            <span className="font-rounded text-white/40 text-[11px]">10:30 AM • 45m</span>
          </div>
        </div>
      </div>

      {/* Bottom control pill */}
      <div className="flex items-center justify-between text-[11px] text-white/40 pt-1">
        <span>Tap green card to pause/resume</span>
        <span className="text-[#30D158] font-rounded font-semibold">Chronobiology Engine Active</span>
      </div>

    </div>
  )
}
