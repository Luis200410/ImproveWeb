'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Flame, Star, Circle, CheckCircle2, Sparkles, FolderGit2, ArrowRight } from 'lucide-react'

export function FourBigsFlameExhibit() {
  const [commitment, setCommitment] = useState<'casual' | 'serious' | 'non-negotiable'>('non-negotiable')
  const [isDone, setIsDone] = useState(false)

  return (
    <div className="w-full h-full min-h-[420px] sm:min-h-[480px] rounded-3xl bg-gradient-to-b from-[#130E16] to-[#09070B] border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden select-none shadow-2xl">
      
      {/* Dynamic ambient backlight matching commitment state */}
      <motion.div 
        animate={{ 
          scale: commitment === 'non-negotiable' ? [1, 1.25, 1] : 1,
          opacity: commitment === 'non-negotiable' ? [0.25, 0.45, 0.25] : 0.15
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-10 -right-10 w-96 h-96 blur-[120px] pointer-events-none rounded-full transition-colors duration-500 ${
          commitment === 'non-negotiable' ? 'bg-[#FF453A]/30' : 'bg-[#BF5AF2]/20'
        }`}
      />

      {/* Header with stylized watermark year */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#BF5AF2]/20 border border-[#BF5AF2]/40 flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-[#BF5AF2]" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-white tracking-tight">Four Bigs Protocol</div>
            <div className="text-xs text-white/50">Annual Outcomes Cascaded into Daily Micro-Steps</div>
          </div>
        </div>

        <div className="font-rounded text-2xl font-black text-white/20 tracking-tighter">
          2026
        </div>
      </div>

      {/* Centerpiece: Goal Progress Ring + Interactive Commitment Pill */}
      <div className="relative z-10 my-auto py-3 space-y-4">
        
        {/* Main Goal Card */}
        <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden ${
          commitment === 'non-negotiable'
            ? 'bg-gradient-to-b from-[#1E1215] to-[#120B0E] border-red-500/40 shadow-[0_0_50px_rgba(239,68,68,0.25)]'
            : 'bg-[#151218] border-white/10 shadow-lg'
        }`}>
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-rounded font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  BIG GOAL 1 OF 4
                </span>
                <span className="text-xs text-white/50">Annual Target</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Finish Improve Ecosystem
              </h3>
              <p className="text-xs sm:text-sm text-white/70">
                Connected to Second Brain Architecture
              </p>
            </div>

            {/* Giant Circular Progress Ring */}
            <div className="flex items-center gap-3">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-white/10"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 0.4 }}
                    transition={{ duration: 1.8, ease: "easeOut" }}
                    className={commitment === 'non-negotiable' ? 'text-red-500' : 'text-purple-500'}
                    strokeDasharray="100, 100"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="font-rounded text-base sm:text-lg font-black text-white block leading-none">40%</span>
                  <span className="text-[9px] text-white/40 uppercase font-rounded">Complete</span>
                </div>
              </div>
            </div>
          </div>

          {/* Large Interactive Commitment Switcher */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <span className="text-xs text-white/50 uppercase tracking-wider font-bold block">
              Select Commitment Intensity:
            </span>
            <div className="grid grid-cols-3 gap-2 text-xs sm:text-sm font-bold">
              <button
                onClick={() => setCommitment('casual')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all ${
                  commitment === 'casual'
                    ? 'bg-white/20 border-white text-white shadow-md'
                    : 'bg-white/[0.04] border-white/5 text-white/40 hover:text-white'
                }`}
              >
                <Circle className="w-4 h-4" />
                <span>Casual</span>
              </button>

              <button
                onClick={() => setCommitment('serious')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all ${
                  commitment === 'serious'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-white/[0.04] border-white/5 text-white/40 hover:text-white'
                }`}
              >
                <Star className="w-4 h-4 fill-current" />
                <span>Serious</span>
              </button>

              <button
                onClick={() => setCommitment('non-negotiable')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border transition-all ${
                  commitment === 'non-negotiable'
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 border-red-400 text-white shadow-[0_0_30px_rgba(239,68,68,0.6)] scale-[1.02]'
                    : 'bg-white/[0.04] border-white/5 text-white/40 hover:text-white'
                }`}
              >
                <Flame className="w-4 h-4 fill-current animate-bounce" />
                <span>Non-Negotiable</span>
              </button>
            </div>
          </div>

        </div>

        {/* Daily 15-Minute Micro-Step Dropping In */}
        <motion.div
          whileHover={{ scale: 1.01 }}
          onClick={() => setIsDone(!isDone)}
          className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
            isDone 
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
              : 'bg-white/[0.04] border-white/10 hover:border-white/20 text-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
              isDone ? 'bg-emerald-500 border-emerald-500 text-black font-bold' : 'border-white/30'
            }`}>
              {isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
            </div>
            <div>
              <div className={`text-sm font-bold ${isDone ? 'line-through opacity-60' : ''}`}>
                Today&apos;s 15-Minute Micro-Step: Code Habit Sync
              </div>
              <div className="text-xs opacity-50">Checking this off wins today&apos;s progress</div>
            </div>
          </div>

          <span className="font-rounded text-xs font-bold px-2.5 py-1 rounded-lg bg-black/40 border border-white/10">
            {isDone ? 'COMPLETED' : 'PENDING'}
          </span>
        </motion.div>

      </div>

      {/* Footer */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#BF5AF2]" />
          <span>Never lose touch with big yearly ambitions.</span>
        </div>
        <span className="font-rounded text-purple-400 font-semibold">
          Tap commitment buttons to toggle intensity
        </span>
      </div>

    </div>
  )
}
