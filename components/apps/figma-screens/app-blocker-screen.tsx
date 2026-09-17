'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Check, 
  Flame, 
  Briefcase, 
  Brain, 
  Activity, 
  Sparkles, 
  Users, 
  Compass, 
  DollarSign, 
  BookOpen 
} from 'lucide-react'

interface BlockableApp {
  id: string
  name: string
  category: string
  iconColor: string
  isBlocked: boolean
}

export function AppBlockerScreen() {
  const [apps, setApps] = useState<BlockableApp[]>([
    { id: 'social', name: 'Social & Feeds', category: 'Instagram, TikTok, X', iconColor: '#FF453A', isBlocked: true },
    { id: 'games', name: 'Games & Arcade', category: 'All gaming apps', iconColor: '#BF5AF2', isBlocked: true },
    { id: 'entertainment', name: 'Entertainment', category: 'YouTube, Netflix', iconColor: '#FF9F0A', isBlocked: true },
    { id: 'chrome', name: 'Chrome Browser', category: 'Web browsing', iconColor: '#0A84FF', isBlocked: true },
    { id: 'messages', name: 'Messages & Chat', category: 'WhatsApp, Telegram', iconColor: '#30D158', isBlocked: false },
    { id: 'appstore', name: 'App Store', category: 'Purchases & downloads', iconColor: '#5E5CE6', isBlocked: false },
  ])

  const [activeArea, setActiveArea] = useState('Career')

  const toggleApp = (id: string) => {
    setApps(prev => prev.map(a => a.id === id ? { ...a, isBlocked: !a.isBlocked } : a))
  }

  const blockedCount = apps.filter(a => a.isBlocked).length

  return (
    <div className="w-full h-full bg-[#070709] text-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4 select-none relative overflow-hidden border border-white/10 shadow-2xl">
      
      {/* Background ambient shield glow */}
      <motion.div 
        animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="absolute -top-12 -right-12 w-64 h-64 bg-[#5E5CE6]/20 blur-3xl pointer-events-none rounded-full"
      />

      {/* Header with Life Areas */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#5E5CE6]/20 border border-[#5E5CE6]/40 flex items-center justify-center">
              <Lock className="w-3.5 h-3.5 text-[#5E5CE6]" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white">ATTENTION SHIELD</span>
              <span className="text-[10px] text-white/40 block">iOS Family Controls Native</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-rounded font-bold">
            <ShieldAlert className="w-3 h-3" />
            <span>{blockedCount} Categories Locked</span>
          </div>
        </div>

        {/* Life Area Selector Pills from Figma */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-[11px] font-medium">
          {[
            { label: 'Career', icon: Briefcase },
            { label: 'Mind', icon: Brain },
            { label: 'Fitness', icon: Activity },
            { label: 'Knowledge', icon: BookOpen }
          ].map(area => {
            const Icon = area.icon
            const isSelected = activeArea === area.label
            return (
              <button
                key={area.label}
                onClick={() => setActiveArea(area.label)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                  isSelected 
                    ? 'bg-[#5E5CE6] border-[#5E5CE6] text-white shadow-md' 
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{area.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* The Apps to Block Sheet from Figma */}
      <div className="bg-[#121216] border border-white/10 rounded-xl p-3.5 space-y-2.5 shadow-inner">
        <div className="flex items-center justify-between text-[11px] text-white/60 pb-1 border-b border-white/5">
          <span className="font-bold tracking-wide uppercase">Apps To Block On Timer</span>
          <span className="text-[10px] text-indigo-400 cursor-pointer hover:underline">Select All</span>
        </div>

        <div className="space-y-1.5">
          {apps.map(app => (
            <motion.div
              key={app.id}
              whileTap={{ scale: 0.99 }}
              onClick={() => toggleApp(app.id)}
              className="flex items-center justify-between p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: `${app.iconColor}25`, color: app.iconColor, border: `1px solid ${app.iconColor}50` }}
                >
                  {app.isBlocked ? <Lock className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5 opacity-40" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white/90 leading-snug">{app.name}</div>
                  <div className="text-[10px] text-white/40">{app.category}</div>
                </div>
              </div>

              {/* iOS Style Toggle Switch */}
              <div 
                className={`w-10 h-5.5 rounded-full p-0.5 transition-colors duration-200 flex items-center ${
                  app.isBlocked ? 'bg-[#30D158] justify-end' : 'bg-white/20 justify-start'
                }`}
              >
                <motion.div 
                  layout
                  transition={{ type: 'spring', stiffness: 700, damping: 30 }}
                  className="w-4.5 h-4.5 rounded-full bg-white shadow-sm"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom Status Banner */}
      <div className="flex items-center justify-between text-[11px] text-white/50 pt-1 border-t border-white/5">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#30D158]" />
          <span>No willpower needed. 100% blocked.</span>
        </span>
        <span className="font-rounded text-indigo-300">Tap toggles to test</span>
      </div>

    </div>
  )
}
