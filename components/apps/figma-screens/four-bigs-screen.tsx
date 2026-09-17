'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Flame, Star, Circle, Plus, ArrowUpRight, FolderGit2, CheckCircle2 } from 'lucide-react'

export function FourBigsScreen() {
  const [commitment, setCommitment] = useState<'casual' | 'serious' | 'non-negotiable'>('non-negotiable')
  const [progress, setProgress] = useState(40)

  return (
    <div className="w-full h-full bg-[#060608] text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 select-none relative overflow-hidden border border-white/10 shadow-2xl">
      
      {/* Ambient background glow matching commitment state */}
      <motion.div 
        animate={{ 
          opacity: commitment === 'non-negotiable' ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
          scale: [0.95, 1.05, 0.95]
        }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute -top-12 -right-12 w-64 h-64 blur-3xl pointer-events-none rounded-full ${
          commitment === 'non-negotiable' ? 'bg-[#FF453A]/25' : 'bg-[#BF5AF2]/20'
        }`}
      />

      {/* Top Header: Stylized 2026 + Four Bigs from Figma */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <div className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Annual Target Suite</div>
          <div className="font-rounded text-2xl font-black tracking-tight text-white flex items-baseline gap-2">
            <span>2026</span>
            <span className="text-xs font-normal text-purple-400">Four Bigs Active</span>
          </div>
        </div>

        {/* 40% Circular SVG Progress Ring from Figma */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-11 h-11 flex items-center justify-center">
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
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-[#BF5AF2]"
                strokeDasharray="100, 100"
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-rounded text-xs font-bold text-white">{progress}%</span>
          </div>
          <span className="text-[10px] text-white/40 leading-tight">Annual<br />Pacing</span>
        </div>
      </div>

      {/* Active Big Goal Card (Goal 1 of 4) from Figma */}
      <div className="bg-[#111116] border border-white/10 rounded-xl p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span className="text-xs font-bold text-white">Finish improve ecosystem</span>
          </div>
          <span className="text-[10px] font-rounded px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">
            BIG 1 OF 4
          </span>
        </div>

        {/* Commitment Level Selector Pills from Figma */}
        <div className="space-y-1.5">
          <span className="text-[10px] text-white/40 uppercase tracking-wider block font-bold">Commitment Mode</span>
          <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setCommitment('casual')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border transition-all ${
                commitment === 'casual'
                  ? 'bg-white/20 border-white text-white'
                  : 'bg-white/[0.03] border-white/5 text-white/40 hover:text-white'
              }`}
            >
              <Circle className="w-3 h-3" />
              <span>Casual</span>
            </button>

            <button
              onClick={() => setCommitment('serious')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border transition-all ${
                commitment === 'serious'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-white/[0.03] border-white/5 text-white/40 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 fill-current" />
              <span>Serious</span>
            </button>

            <button
              onClick={() => setCommitment('non-negotiable')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border transition-all ${
                commitment === 'non-negotiable'
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]'
                  : 'bg-white/[0.03] border-white/5 text-white/40 hover:text-white'
              }`}
            >
              <Flame className="w-3 h-3 fill-current animate-pulse" />
              <span>Non-Neg</span>
            </button>
          </div>
        </div>

        {/* Link to Second Brain & Today's 15-Min Step from Figma */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="bg-white/[0.04] border border-white/5 rounded-lg p-2 space-y-0.5">
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <FolderGit2 className="w-3 h-3 text-indigo-400" /> Second Brain
            </span>
            <div className="text-xs font-bold text-white/90 truncate">Improve Core V1</div>
          </div>

          <div className="bg-white/[0.04] border border-white/5 rounded-lg p-2 space-y-0.5">
            <span className="text-[10px] text-white/40 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-green-400" /> Daily Micro-Step
            </span>
            <div className="text-xs font-bold text-white/90 truncate">15m Habit Write-back</div>
          </div>
        </div>
      </div>

      {/* 3 Remaining Slots from Figma (+ Buttons) */}
      <div className="grid grid-cols-3 gap-2">
        {[2, 3, 4].map(num => (
          <div 
            key={num}
            className="border-2 border-dashed border-white/10 rounded-xl p-2.5 flex flex-col items-center justify-center space-y-1 hover:border-purple-400/50 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center text-white/40">
              <Plus className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-rounded text-white/40">Big Goal #{num}</span>
          </div>
        ))}
      </div>

      {/* Bottom Footer Status */}
      <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5">
        <span>Yearly outcomes built into 15-minute daily wins</span>
        <span className="text-purple-300 font-rounded">Tap commitment to switch</span>
      </div>

    </div>
  )
}
