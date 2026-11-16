'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, CheckCircle2, Bell, Shield, ArrowUpRight } from 'lucide-react'
import type { AppIdentity } from '@/lib/apps-data'

interface AppComingSoonProps {
  app: AppIdentity
}

export function AppComingSoon({ app }: AppComingSoonProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email && email.includes('@')) {
      setSubmitted(true)
    }
  }

  return (
    <div className="relative w-full overflow-hidden pt-12 pb-24 text-white">
      {/* Background ambient radial glow matching app's accent color */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[450px] blur-[140px] pointer-events-none rounded-full opacity-20"
        style={{ backgroundColor: app.accentHex || '#FF02E8' }}
      />

      <div className="px-4 sm:px-6 relative z-10">
        <div className="access-glass max-w-5xl mx-auto px-6 sm:px-12 py-12 sm:py-16 flex flex-col items-center text-center">
        {/* Pillar Number & Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md mb-8">
          <span 
            className="w-2 h-2 rounded-full animate-ping"
            style={{ backgroundColor: app.accentHex || '#FF02E8' }}
          />
          <span className="text-xs font-mono font-bold tracking-widest uppercase text-white/70">
            SYSTEM {app.number} • COMING SOON
          </span>
        </div>

        {/* App Logo with subtle inactive / holographic treatment */}
        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-8 flex items-center justify-center">
          <div 
            className="absolute inset-0 rounded-3xl blur-2xl opacity-30"
            style={{ backgroundColor: app.accentHex || '#FF02E8' }}
          />
          <div className="relative w-full h-full rounded-3xl bg-white/[0.03] border border-white/15 p-6 backdrop-blur-xl flex items-center justify-center shadow-2xl">
            <img 
              src={app.logoUrl} 
              alt={app.name} 
              className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>

        {/* App Name */}
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight mb-4">
          {app.name}
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-white/60 font-normal max-w-2xl mx-auto mb-6 leading-relaxed">
          {app.tagline}
        </p>

        {/* In-Development Notice */}
        <div className="max-w-xl mx-auto p-4 rounded-2xl bg-white/[0.02] border border-white/10 backdrop-blur-md mb-10 text-sm text-zinc-400 leading-relaxed">
          We are currently engineering this pillar of Improve. Join the priority waitlist to receive access as soon as beta invites roll out.
        </div>

        {/* Waitlist Email Capture */}
        <div className="w-full max-w-md mx-auto mb-16">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm font-medium flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>You&apos;re on the priority waitlist for {app.name}.</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-full bg-white/[0.04] border border-white/15 text-white placeholder-zinc-500 text-sm focus:outline-none focus:border-white/40 transition-colors"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-full bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Bell className="w-4 h-4" />
                <span>Get Updates</span>
              </button>
            </form>
          )}
        </div>

        {/* Navigation to Live App */}
        <div className="w-full pt-8 border-t border-white/10">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-mono mb-6">
            Available Today
          </p>
          <div className="max-w-md mx-auto text-left">
            <Link 
              href="/dive"
              className="group p-5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-[#FF02E8]/40 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FF02E8]/10 border border-[#FF02E8]/30 flex items-center justify-center">
                  <img src="/Productivity Logo.svg" alt="Dive" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white uppercase tracking-tight">Dive</span>
                    <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[#FF02E8]/20 text-[#FF02E8] font-bold">Live</span>
                  </div>
                  <p className="text-xs text-zinc-400">Sit down, dive in, do the real work.</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
