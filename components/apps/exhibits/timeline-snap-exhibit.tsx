'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, CheckCircle2, RotateCcw, Sparkles, ArrowRight } from 'lucide-react'

interface HabitBlock {
  id: string
  title: string
  slot: string
  duration: string
  startHour: string
  bg: string
  border: string
  accent: string
  isDone: boolean
}

export function TimelineSnapExhibit() {
  const [animationKey, setAnimationKey] = useState(0)
  const [blocks, setBlocks] = useState<HabitBlock[]>([
    {
      id: '1',
      title: 'Healthy Fuel & Breakfast',
      slot: '7:00 AM – 7:30 AM',
      duration: '30m',
      startHour: '7 AM',
      bg: 'rgba(34, 197, 94, 0.16)',
      border: 'rgba(34, 197, 94, 0.40)',
      accent: '#22C55E',
      isDone: true
    },
    {
      id: '2',
      title: 'Deep Coding & Architecture',
      slot: '8:00 AM – 9:30 AM',
      duration: '90m',
      startHour: '8 AM',
      bg: 'rgba(56, 189, 248, 0.18)',
      border: 'rgba(56, 189, 248, 0.45)',
      accent: '#38BDF8',
      isDone: false
    },
    {
      id: '3',
      title: 'Mind Reset & Walk',
      slot: '10:00 AM – 10:30 AM',
      duration: '30m',
      startHour: '10 AM',
      bg: 'rgba(244, 114, 182, 0.16)',
      border: 'rgba(244, 114, 182, 0.40)',
      accent: '#F472B6',
      isDone: false
    }
  ])

  const toggleDone = (id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, isDone: !b.isDone } : b))
  }

  const replayAnimation = () => {
    setAnimationKey(prev => prev + 1)
  }

  return (
    <div className="w-full h-full min-h-[420px] sm:min-h-[480px] rounded-3xl bg-gradient-to-b from-[#0F0E13] to-[#08080A] border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden select-none shadow-2xl">
      
      {/* Background ambient calendar glow */}
      <motion.div 
        animate={{ opacity: [0.15, 0.3, 0.15] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute bottom-10 right-10 w-80 h-80 bg-[#FF9F0A]/20 blur-[100px] pointer-events-none rounded-full"
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FF9F0A]/20 border border-[#FF9F0A]/40 flex items-center justify-center shadow-lg">
            <Calendar className="w-5 h-5 text-[#FF9F0A]" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-white tracking-tight">Timeline Habit Engine</div>
            <div className="text-xs text-white/50">Direct Apple Calendar EventKit Synchronization</div>
          </div>
        </div>

        <button
          onClick={replayAnimation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white/80 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Replay Snap</span>
        </button>
      </div>

      {/* Calendar Timeline Track with Cards Sliding Left-to-Right into place */}
      <div key={animationKey} className="relative z-10 my-auto py-4 space-y-4">
        
        {/* Glowing Red Current-Time Sweeper Bar */}
        <div className="relative flex items-center gap-3">
          <span className="font-rounded text-xs font-bold text-[#FF453A] w-14 text-right">8:00 AM</span>
          <div className="flex-1 h-0.5 bg-[#FF453A] shadow-[0_0_12px_#FF453A] relative">
            <span className="absolute -top-1 left-0 w-2.5 h-2.5 rounded-full bg-[#FF453A] animate-ping" />
            <span className="absolute -top-1 left-0 w-2.5 h-2.5 rounded-full bg-[#FF453A]" />
          </div>
          <span className="text-[11px] font-rounded font-semibold text-[#FF453A] uppercase tracking-wider">
            Live Hour
          </span>
        </div>

        {/* Sliding & Snapping Habit Cards */}
        <div className="space-y-3 pl-4 sm:pl-8 border-l border-white/10">
          {blocks.map((block, idx) => (
            <motion.div
              key={block.id}
              initial={{ opacity: 0, x: -140, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ 
                duration: 0.65, 
                delay: idx * 0.22, 
                type: 'spring', 
                stiffness: 260, 
                damping: 24 
              }}
              whileHover={{ scale: 1.02, x: 6 }}
              onClick={() => toggleDone(block.id)}
              className="flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer shadow-lg relative overflow-hidden group"
              style={{
                backgroundColor: block.bg,
                borderColor: block.border
              }}
            >
              {/* Left Accent Bar */}
              <div 
                className="absolute left-0 top-0 bottom-0 w-1.5"
                style={{ backgroundColor: block.accent }}
              />

              <div className="flex items-center gap-3.5 pl-2">
                <div 
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                    block.isDone 
                      ? 'bg-[#30D158] border-[#30D158] text-black shadow-md' 
                      : 'border-white/30 hover:border-white'
                  }`}
                >
                  {block.isDone && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                </div>

                <div>
                  <div className={`text-sm sm:text-base font-bold transition-all ${
                    block.isDone ? 'line-through text-white/50' : 'text-white'
                  }`}>
                    {block.title}
                  </div>
                  <div className="text-xs text-white/60 flex items-center gap-2 font-rounded mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{block.slot}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-rounded font-bold px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-white/90">
                  {block.duration}
                </span>
                <span className="text-[10px] text-white/40 hidden sm:inline uppercase tracking-wider font-semibold">
                  Locked to Calendar
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Bottom Footer Details */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs text-white/60">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF9F0A]" />
          <span>If it isn&apos;t on your calendar, it doesn&apos;t happen.</span>
        </div>
        <span className="font-rounded text-[#FF9F0A] font-semibold">
          Tap any habit card to check off
        </span>
      </div>

    </div>
  )
}
