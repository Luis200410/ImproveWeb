'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Clock, TrendingUp, Sparkles, Activity, Play, Pause } from 'lucide-react'

export function UltradianWaveExhibit() {
  const [seconds, setSeconds] = useState(41)
  const [minutes, setMinutes] = useState(55)
  const [hours, setHours] = useState(1)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning) return
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
  }, [isRunning])

  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  return (
    <div className="w-full h-full min-h-[420px] sm:min-h-[480px] rounded-3xl bg-gradient-to-b from-[#0B120E] to-[#070908] border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden select-none shadow-2xl">
      
      {/* Background ambient green energy halo */}
      <motion.div 
        animate={{ 
          scale: isRunning ? [1, 1.25, 1] : 1,
          opacity: isRunning ? [0.2, 0.4, 0.2] : 0.1
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#22C55E]/20 blur-[120px] pointer-events-none rounded-full"
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center shadow-lg">
            <Activity className="w-5 h-5 text-[#22C55E]" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-white tracking-tight">Chronobiology Focus Engine</div>
            <div className="text-xs text-white/50">90-Minute Ultradian Rhythm Cycle Matching</div>
          </div>
        </div>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-rounded font-bold transition-all ${
            isRunning 
              ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E] shadow-[0_0_15px_rgba(34,197,94,0.3)]' 
              : 'bg-white/10 border-white/20 text-white/50'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'WAVE ACTIVE' : 'PAUSED'}</span>
        </button>
      </div>

      {/* Giant Neon Focus Hero Card */}
      <div className="relative z-10 my-auto py-3 space-y-5">
        
        {/* The Live Neon Card */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="relative rounded-3xl bg-gradient-to-r from-[#15803D] via-[#22C55E] to-[#16A34A] p-6 sm:p-7 text-white shadow-[0_10px_50px_rgba(34,197,94,0.4)] border border-white/30 overflow-hidden"
        >
          {/* Animated light sweep */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none"
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/90">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                <span>ACTIVE DEEP WORK SESSION</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Core System Architecture
              </h3>
              <p className="text-xs sm:text-sm text-white/80">Matched to Peak Cortisol Window</p>
            </div>

            <div className="text-right">
              <div className="font-rounded text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-lg">
                {formattedTime}
              </div>
              <div className="text-xs font-rounded font-bold text-white/80 mt-0.5">
                Session 4 of 6 • Ultradian Wave 2
              </div>
            </div>
          </div>
        </motion.div>

        {/* The 90-Minute Ultradian Sine Wave Graph */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#0D1610]/80 border border-white/10 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-white/60 font-rounded">
            <span className="flex items-center gap-1.5 text-white/80 font-bold">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span>90m Energy Sine Wave</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-[#22C55E]/20 text-[#22C55E] text-[11px] font-bold">
              ⚡ CURRENT CREST: 92% COGNITIVE SHARPNESS
            </span>
          </div>

          {/* SVG Animated Sine Wave */}
          <div className="relative w-full h-20 sm:h-24 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 400 80" preserveAspectRatio="none">
              {/* Baseline */}
              <line x1="0" y1="65" x2="400" y2="65" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
              
              {/* Sine wave curve */}
              <path
                d="M 0 65 Q 100 0, 200 65 T 400 65"
                fill="none"
                stroke="rgba(34,197,94,0.3)"
                strokeWidth="3"
              />
              
              {/* Active illuminated crest path */}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
                d="M 0 65 Q 100 0, 200 65"
                fill="none"
                stroke="#22C55E"
                strokeWidth="4"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_#22C55E]"
              />

              {/* Peak indicator dot */}
              <circle cx="100" cy="18" r="6" fill="#FFFFFF" className="animate-pulse shadow-xl" />
              <circle cx="100" cy="18" r="12" fill="none" stroke="#22C55E" strokeWidth="2" opacity="0.6" />
            </svg>

            {/* Float badge at peak */}
            <div className="absolute top-0 left-1/4 -translate-x-1/2 -translate-y-1 px-2.5 py-0.5 rounded-full bg-black/90 border border-[#22C55E] text-[#22C55E] text-[10px] font-rounded font-bold shadow-lg">
              YOU ARE HERE (PEAK)
            </div>
          </div>

          {/* Wave milestones */}
          <div className="flex justify-between text-[10px] sm:text-xs font-rounded text-white/40 pt-1">
            <span>Warm Up (15m)</span>
            <span className="text-[#22C55E] font-bold">Deep Work Peak (60m)</span>
            <span>Recovery Cooldown (15m)</span>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#22C55E]" />
          <span>Work with your biology, not against it.</span>
        </div>
        <span className="font-rounded text-[#22C55E] font-semibold">
          Tap top right to pause/play session
        </span>
      </div>

    </div>
  )
}
