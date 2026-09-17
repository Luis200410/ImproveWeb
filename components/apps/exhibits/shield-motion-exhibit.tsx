'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Lock, Bell, Sparkles, Check, X, ShieldAlert } from 'lucide-react'

export function ShieldMotionExhibit() {
  const [isLocked, setIsLocked] = useState(true)
  const [bouncedNotification, setBouncedNotification] = useState(false)

  const triggerDeflect = () => {
    setBouncedNotification(true)
    setTimeout(() => setBouncedNotification(false), 2400)
  }

  const blockedApps = [
    { name: 'Instagram & TikTok', category: 'Infinite Scroll Feeds', color: '#FF3B30', icon: '📱' },
    { name: 'YouTube & Netflix', category: 'Entertainment Streams', color: '#FF9500', icon: '🎬' },
    { name: 'Casual Gaming', category: 'Dopamine Traps', color: '#AF52DE', icon: '🎮' },
  ]

  return (
    <div className="w-full h-full min-h-[420px] sm:min-h-[480px] rounded-3xl bg-gradient-to-b from-[#0F0F14] to-[#08080B] border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden select-none shadow-2xl">
      
      {/* Radial backlight glow */}
      <motion.div 
        animate={{ 
          scale: isLocked ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: isLocked ? [0.2, 0.35, 0.2] : 0.08
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#5E5CE6]/30 blur-[100px] pointer-events-none rounded-full"
      />

      {/* Top Bar with Master Shield Toggle */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#5E5CE6]/20 border border-[#5E5CE6]/40 flex items-center justify-center shadow-lg">
            <Shield className="w-5 h-5 text-[#5E5CE6]" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-bold text-white tracking-tight">iOS Attention Shield</div>
            <div className="text-xs text-white/50">Apple Family Controls Native Framework</div>
          </div>
        </div>

        <button
          onClick={() => setIsLocked(!isLocked)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-rounded font-bold transition-all ${
            isLocked 
              ? 'bg-[#5E5CE6] border-[#5E5CE6] text-white shadow-[0_0_20px_rgba(94,92,230,0.5)]' 
              : 'bg-white/10 border-white/20 text-white/50 hover:text-white'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{isLocked ? 'SHIELD ACTIVE' : 'DISARMED'}</span>
        </button>
      </div>

      {/* Centerpiece: Flying App Cards & The Shield Interception */}
      <div className="relative z-10 my-auto py-4 space-y-3">
        {blockedApps.map((app, idx) => (
          <motion.div
            key={app.name}
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.15, type: 'spring', damping: 20 }}
            whileHover={{ scale: 1.02, x: 4 }}
            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 ${
              isLocked 
                ? 'bg-[#15151C]/90 border-white/10 shadow-lg' 
                : 'bg-white/[0.03] border-white/5 opacity-50'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div 
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/10"
                style={{ backgroundColor: `${app.color}20` }}
              >
                {app.icon}
              </div>
              <div>
                <div className="text-sm sm:text-base font-bold text-white tracking-tight">{app.name}</div>
                <div className="text-xs text-white/40">{app.category}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.div 
                animate={{ scale: isLocked ? [1, 1.08, 1] : 1 }}
                transition={{ duration: 2, repeat: Infinity, delay: idx * 0.3 }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-rounded font-bold border transition-colors ${
                  isLocked 
                    ? 'bg-red-500/15 border-red-500/30 text-red-400 shadow-[0_0_12px_rgba(239,68,68,0.25)]' 
                    : 'bg-white/10 border-white/10 text-white/40'
                }`}
              >
                <Lock className="w-3 h-3" />
                <span>{isLocked ? 'BLOCKED' : 'ALLOWED'}</span>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Deflected Notification Bubble Animation */}
      <AnimatePresence>
        {bouncedNotification && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: [0, 10, -10, 40],
              scale: [0.8, 1.05, 0.95, 0.6],
              rotate: [0, -5, 5, -15]
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 2.2, times: [0, 0.2, 0.8, 1] }}
            className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-950/90 border border-red-500/50 text-white shadow-2xl backdrop-blur-xl"
          >
            <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-300">Ping Deflected!</div>
              <div className="text-[11px] text-white/70">+23m deep focus protected</div>
            </div>
            <X className="w-4 h-4 text-red-400/80 ml-1" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Interactive Shield Action */}
      <div className="relative z-10 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-white/60">
          <Sparkles className="w-4 h-4 text-[#5E5CE6]" />
          <span>Zero willpower required. The OS blocks it for you.</span>
        </div>

        <button
          onClick={triggerDeflect}
          className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/20 text-white font-rounded font-semibold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Bell className="w-3.5 h-3.5 text-yellow-400" />
          <span>Simulate Incoming Ping</span>
        </button>
      </div>

    </div>
  )
}
