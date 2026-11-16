'use client'

import React, { useRef, useState, useEffect } from 'react'
import { motion, useScroll, AnimatePresence } from 'framer-motion'
import { 
  Heart, 
  Send, 
  MoreHorizontal, 
  X, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Bell, 
  Clock, 
  ListTodo
} from 'lucide-react'

export interface ProblemStoryItem {
  id: number
  number: string
  badge: string
  title: string
  quote: string
  description: string
  videoUrl?: string
  posterImage?: string
  accentColor: string
}

export const DEFAULT_PROBLEM_STORIES: ProblemStoryItem[] = [
  {
    id: 1,
    number: '01',
    badge: 'The Hijack',
    title: 'OTHER PLANS',
    quote: 'You sit down to work. Your phone has other plans.',
    description: 'You sit down with complete clarity and energy. But the moment your hands touch the keyboard, a phantom vibration or screen flash hijacks your attention before you even type the first word.',
    accentColor: '#FF02E8',
  },
  {
    id: 2,
    number: '02',
    badge: 'Dopamine Trap',
    title: 'LOST MORNING',
    quote: 'You plan the morning, then lose it to one notification.',
    description: 'You planned an unbroken 2-hour morning sprint. One quick glance at a notification leads to a 45-minute rabbit hole of feeds and group chats. The morning is gone, and recovery costs another 23 minutes.',
    accentColor: '#efb219',
  },
  {
    id: 3,
    number: '03',
    badge: 'Passive Lists',
    title: 'UNOPENED LISTS',
    quote: 'Your habits live in a list you never open.',
    description: 'Traditional to-do and habit tracker apps sit passively in phone folders. They rely on willpower and memory when you are already fatigued. A habit hidden inside an app list is a habit you never do.',
    accentColor: '#ff6900',
  },
  {
    id: 4,
    number: '04',
    badge: 'Starting Friction',
    title: 'NEVER ON TIME',
    quote: 'You know exactly what to do. You just never start on time.',
    description: 'Starting is the only real barrier. You have the goal, the skill, and the intention. But without a high-priority breakthrough system that locks distractions automatically, you delay until the day is lost.',
    accentColor: '#2254f5',
  },
]

interface ProblemsStoryShowcaseProps {
  stories?: ProblemStoryItem[]
}

export function ProblemsStoryShowcase({
  stories = DEFAULT_PROBLEM_STORIES
}: ProblemsStoryShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMuted, setIsMuted] = useState(true)

  // Track scroll through the multi-screen container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (latest) => {
      const count = stories.length
      const step = 1 / count
      const index = Math.min(Math.floor(latest / step), count - 1)
      setActiveIndex(Math.max(0, index))
    })

    return () => unsubscribe()
  }, [scrollYProgress, stories.length])

  const activeStory = stories[activeIndex]

  const handleNextStory = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev + 1) % stories.length)
  }

  const handlePrevStory = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setActiveIndex((prev) => (prev - 1 + stories.length) % stories.length)
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[300vh] bg-transparent text-white border-t border-white/10"
    >
      {/* Sticky Viewport Stage: Optimized with dvh for Mobile Safari/Chrome */}
      <div className="sticky top-0 h-[100dvh] w-full flex flex-col justify-center items-center overflow-hidden px-4 sm:px-6 lg:px-12 py-3 sm:py-6">
        
        {/* Ambient Glow */}
        <div 
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] lg:w-[850px] h-[340px] sm:h-[500px] rounded-full blur-[120px] sm:blur-[170px] opacity-25 transition-colors duration-700"
          style={{ backgroundColor: activeStory.accentColor }}
        />

        {/* Responsive Grid: Mobile stacks vertically, Desktop/iPad sits side-by-side */}
        <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-12 items-center justify-center h-full max-h-[100dvh]">
          
          {/* =========================================================================
              TITLE & DYNAMIC TEXT AREA (WRAPPED IN ACCESS-GLASS CONTAINER)
             ========================================================================= */}
          <div className="w-full lg:col-span-5 flex flex-col justify-center pt-1 lg:pt-0">
            <div className="access-glass p-5 xs:p-6 sm:p-8 rounded-[24px] sm:rounded-[28px] space-y-2 sm:space-y-4 text-center lg:text-left shadow-2xl">
              {/* Title */}
              <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight text-white leading-tight">
                The Problems
              </h2>

              {/* Dynamic Text: Transitions smoothly per story */}
              <div className="relative min-h-[46px] xs:min-h-[52px] sm:min-h-[68px] lg:min-h-[96px] flex items-center justify-center lg:justify-start">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStory.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="w-full"
                  >
                    <p className="text-sm xs:text-base sm:text-lg lg:text-xl text-zinc-300 font-medium leading-snug sm:leading-relaxed">
                      {activeStory.quote}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* =========================================================================
              PHONE FRAME: IPHONE INSTAGRAM STORY (SCALED FOR MOBILE PERFECTION)
             ========================================================================= */}
          <div className="w-full lg:col-span-7 flex items-center justify-center pb-2 lg:pb-0">
            
            {/* 
              Responsive iPhone Chassis:
              - Mobile: Uses dynamic viewport height percentage (h-[58dvh] max-h-[500px]) so it NEVER clips!
              - Tablet / Desktop: Scales up to full 660px desktop height.
            */}
            <div className="relative h-[58dvh] xs:h-[60dvh] max-h-[480px] xs:max-h-[520px] sm:max-h-[580px] lg:h-[640px] lg:max-h-[660px] aspect-[9/18.5] bg-black rounded-[36px] xs:rounded-[40px] sm:rounded-[48px] lg:rounded-[52px] p-2 xs:p-2.5 sm:p-3 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_40px_rgba(255,2,232,0.12)] border-[3.5px] xs:border-[4px] lg:border-[5px] border-zinc-800/90 ring-1 ring-white/15 select-none">
              
              {/* Dynamic Island */}
              <div className="absolute top-3 xs:top-3.5 sm:top-4 left-1/2 -translate-x-1/2 w-20 xs:w-22 sm:w-26 lg:w-28 h-4 xs:h-4.5 sm:h-5 lg:h-5.5 bg-black rounded-full z-40 flex items-center justify-between px-2.5 border border-white/10">
                <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-zinc-900 border border-zinc-800" />
                <span className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-blue-900/60" />
              </div>

              {/* Inner Instagram Stories Screen */}
              <div className="relative w-full h-full bg-neutral-950 rounded-[28px] xs:rounded-[32px] sm:rounded-[38px] lg:rounded-[42px] overflow-hidden flex flex-col justify-between">
                
                {/* 1. Instagram Stories Top Segmented Progress Bars */}
                <div className="relative z-30 pt-2.5 xs:pt-3 px-2.5 xs:px-3">
                  <div className="flex items-center gap-1 sm:gap-1.5 w-full">
                    {stories.map((story, idx) => {
                      const isCompleted = idx < activeIndex
                      const isCurrent = idx === activeIndex

                      return (
                        <div 
                          key={story.id}
                          onClick={() => setActiveIndex(idx)}
                          className="flex-1 h-0.5 sm:h-1 rounded-full bg-white/20 overflow-hidden cursor-pointer"
                        >
                          <div 
                            className={`h-full transition-all duration-300 ${
                              isCompleted 
                                ? 'w-full bg-white' 
                                : isCurrent 
                                  ? 'w-full bg-white shadow-[0_0_8px_#ffffff]' 
                                  : 'w-0'
                            }`}
                          />
                        </div>
                      )
                    })}
                  </div>

                  {/* 2. Instagram Story Header */}
                  <div className="flex items-center justify-between mt-2 xs:mt-2.5 text-white">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 xs:w-7 xs:h-7 rounded-full p-[1.5px] bg-gradient-to-tr from-amber-500 via-rose-500 to-[#FF02E8] flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden p-0.5">
                          <img 
                            src="/Productivity Logo.svg" 
                            alt="Improve" 
                            className="w-full h-full object-contain filter" 
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 leading-none">
                        <span className="text-[11px] xs:text-xs font-bold tracking-tight">improve.app</span>
                        <span className="text-[9px] xs:text-[10px] text-white/50">3m</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 text-white/80">
                      <button 
                        type="button" 
                        onClick={() => setIsMuted(!isMuted)}
                        className="hover:text-white cursor-pointer"
                        aria-label="Toggle audio"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 xs:w-4 xs:h-4" /> : <Volume2 className="w-3.5 h-3.5 xs:w-4 xs:h-4" />}
                      </button>
                      <MoreHorizontal className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                      <X className="w-3.5 h-3.5 xs:w-4 xs:h-4" />
                    </div>
                  </div>
                </div>

                {/* 3. Screen Content / Tap Zones for Next & Prev */}
                <div className="absolute inset-0 z-10 flex flex-col justify-center items-center">
                  
                  {/* Left Tap Zone = Previous Story */}
                  <div 
                    onClick={handlePrevStory} 
                    className="absolute left-0 inset-y-0 w-1/3 z-20 cursor-w-resize" 
                    title="Previous Story"
                  />
                  {/* Right Tap Zone = Next Story */}
                  <div 
                    onClick={handleNextStory} 
                    className="absolute right-0 inset-y-0 w-2/3 z-20 cursor-e-resize" 
                    title="Next Story"
                  />

                  {/* Story Animated Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStory.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.03 }}
                      transition={{ duration: 0.25 }}
                      className="relative w-full h-full flex flex-col justify-center items-center p-4 xs:p-5 pt-16 pb-14 overflow-hidden"
                    >
                      {/* Video element if videoUrl is supplied */}
                      {activeStory.videoUrl ? (
                        <video
                          src={activeStory.videoUrl}
                          autoPlay
                          loop
                          muted={isMuted}
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover z-0"
                        />
                      ) : (
                        <>
                          {/* Radial Background Tone */}
                          <div 
                            className="absolute inset-0 opacity-40 blur-2xl pointer-events-none"
                            style={{ 
                              background: `radial-gradient(circle at 50% 45%, ${activeStory.accentColor}50, transparent 75%)` 
                            }}
                          />

                          {/* Center Graphic + Clean Instagram Story Text Card */}
                          <div className="relative z-10 my-auto flex flex-col items-center text-center space-y-3 xs:space-y-4">
                            
                            {/* Graphic Icon */}
                            <div 
                              className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl xs:rounded-3xl border flex items-center justify-center shadow-lg backdrop-blur-xl"
                              style={{ 
                                backgroundColor: `${activeStory.accentColor}18`,
                                borderColor: `${activeStory.accentColor}50`
                              }}
                            >
                              {activeStory.id === 1 && <Smartphone className="w-6 h-6 xs:w-7 xs:h-7 text-rose-400 animate-pulse" />}
                              {activeStory.id === 2 && <Bell className="w-6 h-6 xs:w-7 xs:h-7 text-amber-300 animate-bounce" />}
                              {activeStory.id === 3 && <ListTodo className="w-6 h-6 xs:w-7 xs:h-7 text-[#ff6900]" />}
                              {activeStory.id === 4 && <Clock className="w-6 h-6 xs:w-7 xs:h-7 text-[#2254f5]" />}
                            </div>

                            {/* Clean Instagram Story Quote Card */}
                            <div className="w-full max-w-[210px] xs:max-w-[240px] rounded-2xl bg-black/60 border border-white/15 backdrop-blur-xl p-3.5 xs:p-4 sm:p-5 shadow-2xl">
                              <p className="text-xs xs:text-sm sm:text-base font-bold text-white leading-snug">
                                {activeStory.quote}
                              </p>
                            </div>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* 4. Instagram Stories Bottom Interaction Bar */}
                <div className="relative z-30 pb-2.5 xs:pb-3 px-3 flex items-center gap-2 xs:gap-2.5">
                  <div className="flex-1 py-1.5 xs:py-2 px-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-[10px] xs:text-xs text-white/50 flex items-center">
                    <span>Send message...</span>
                  </div>
                  <Heart className="w-4 h-4 xs:w-5 xs:h-5 text-white/80 hover:text-rose-500 transition-colors cursor-pointer" />
                  <Send className="w-4 h-4 xs:w-5 xs:h-5 text-white/80 hover:text-white transition-colors cursor-pointer" />
                </div>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}
