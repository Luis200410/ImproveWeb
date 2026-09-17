'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Plus, CheckCircle, ChevronRight, Sparkles } from 'lucide-react'

interface ScheduleBlock {
  id: string
  time: string
  endTime: string
  title: string
  duration: string
  color: string
  bgLight: string
  borderLight: string
  isDone: boolean
}

export function TimelineScheduleScreen() {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([
    { 
      id: '1', 
      time: '7:00 AM', 
      endTime: '7:30 AM', 
      title: 'Healthy Breakfast', 
      duration: '30 min', 
      color: '#15803D', 
      bgLight: 'rgba(34, 197, 94, 0.12)', 
      borderLight: 'rgba(34, 197, 94, 0.35)', 
      isDone: true 
    },
    { 
      id: '2', 
      time: '7:30 AM', 
      endTime: '8:00 AM', 
      title: 'Get ready & plan day', 
      duration: '30 min', 
      color: '#BE185D', 
      bgLight: 'rgba(244, 114, 182, 0.12)', 
      borderLight: 'rgba(244, 114, 182, 0.35)', 
      isDone: true 
    },
    { 
      id: '3', 
      time: '8:00 AM', 
      endTime: '8:55 AM', 
      title: 'Deep study & core code', 
      duration: '55 min', 
      color: '#0369A1', 
      bgLight: 'rgba(56, 189, 248, 0.14)', 
      borderLight: 'rgba(56, 189, 248, 0.40)', 
      isDone: false 
    },
    { 
      id: '4', 
      time: '10:30 PM', 
      endTime: '11:00 PM', 
      title: 'Night wind down & read', 
      duration: '30 min', 
      color: '#6D28D9', 
      bgLight: 'rgba(167, 139, 250, 0.12)', 
      borderLight: 'rgba(167, 139, 250, 0.35)', 
      isDone: false 
    }
  ])

  const toggleDone = (id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, isDone: !b.isDone } : b))
  }

  return (
    <div className="w-full h-full bg-[#08080B] text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3.5 select-none relative overflow-hidden border border-white/10 shadow-2xl">
      
      {/* Background ambient calendar glow */}
      <motion.div 
        animate={{ opacity: [0.12, 0.25, 0.12] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="absolute -bottom-10 -left-10 w-64 h-64 bg-[#FF9F0A]/15 blur-3xl pointer-events-none rounded-full"
      />

      {/* Header: Habits Day Plan from Figma */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF9F0A]" />
            <h4 className="text-sm font-bold text-white tracking-tight">Timeline Habits</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF9F0A]/15 text-[#FF9F0A] font-rounded font-bold">
              Apple EventKit Live
            </span>
          </div>
          <p className="text-[11px] text-white/40">Monday, September 14 • 4 blocks scheduled</p>
        </div>

        <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5 text-[11px]">
          <span className="px-2 py-0.5 rounded bg-white/15 text-white font-medium">Day</span>
          <span className="px-2 py-0.5 text-white/40">Week</span>
        </div>
      </div>

      {/* Calendar Timeline Grid from Figma */}
      <div className="bg-[#111116] border border-white/10 rounded-xl p-3.5 space-y-2.5 relative overflow-hidden">
        
        {/* Real-time sweeping red/orange time indicator line */}
        <div className="relative flex items-center gap-2 py-0.5">
          <span className="text-[10px] font-rounded font-bold text-[#FF453A]">8:15 AM</span>
          <div className="flex-1 h-0.5 bg-[#FF453A]/80 shadow-[0_0_8px_#FF453A]" />
          <span className="w-2 h-2 rounded-full bg-[#FF453A] animate-ping" />
        </div>

        {/* Scheduled Habit Blocks from Figma */}
        <div className="space-y-2">
          {blocks.map((b, idx) => (
            <motion.div
              key={b.id}
              whileHover={{ scale: 1.015, x: 3 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleDone(b.id)}
              className="flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden"
              style={{
                backgroundColor: b.bgLight,
                borderColor: b.borderLight
              }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    b.isDone ? 'bg-[#30D158] border-[#30D158] text-black' : 'border-white/30 hover:border-white'
                  }`}
                >
                  {b.isDone && <CheckCircle className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div>
                  <div className={`text-xs font-bold transition-all ${b.isDone ? 'line-through text-white/50' : 'text-white'}`}>
                    {b.title}
                  </div>
                  <div className="text-[10px] text-white/50 flex items-center gap-1.5 font-rounded">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{b.time} – {b.endTime}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-rounded font-bold px-2 py-0.5 rounded-md bg-black/30 border border-white/10 text-white/90">
                  {b.duration}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>

      {/* Bottom Apple Calendar status */}
      <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#FF9F0A]" />
          <span>Syncs with your real Apple Calendar in 0.0s</span>
        </span>
        <span className="text-[#FF9F0A] font-rounded">Click to check off</span>
      </div>

    </div>
  )
}
