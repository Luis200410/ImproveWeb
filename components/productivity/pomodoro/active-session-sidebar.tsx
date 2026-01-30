
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Play, Pause, FastForward, Maximize2 } from 'lucide-react'
import { usePomodoro } from './pomodoro-context'
import { formatTime, calculateEfficiency } from './pomodoro-utils'

export function ActiveSessionSidebar() {
    const {
        isActive,
        timeLeft,
        sessionType,
        isSidebarOpen,
        minimizeSidebar,
        toggleSidebar,
        pauseSession,
        startSession,
        skipSession,
        config,
        totalSessions
    } = usePomodoro()

    if (!isSidebarOpen) return null

    const totalDurationKey = sessionType === 'WORK' ? 'sprintDuration' : sessionType === 'SHORT_BREAK' ? 'shortBreakDuration' : 'longBreakDuration'
    const totalDuration = config[totalDurationKey] * 60
    const progress = ((totalDuration - timeLeft) / totalDuration) * 100

    // Neural Ring Logic
    const radius = 80
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                className="fixed top-0 right-0 h-full w-[400px] bg-black border-l border-white/10 z-[200] flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-amber-500 animate-pulse' : 'bg-white/20'}`} />
                        <span className="text-xs font-mono uppercase tracking-widest text-white/50">
                            Neural Sync // {isActive ? 'Active' : 'Standby'}
                        </span>
                    </div>
                    <div className="flex gap-4">
                        <button onClick={minimizeSidebar} className="text-white/20 hover:text-white transition-colors">
                            <Minus className="w-4 h-4" />
                        </button>
                        <button onClick={toggleSidebar} className="text-white/20 hover:text-white transition-colors">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-12 relative overflow-hidden">

                    {/* Background Grid Effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

                    {/* Timer Ring */}
                    <div className="relative z-10">
                        <svg className="w-64 h-64 -rotate-90">
                            {/* Track */}
                            <circle
                                cx="128" cy="128" r={radius}
                                className="stroke-white/5"
                                strokeWidth="2"
                                fill="transparent"
                                strokeDasharray="10 10"
                            />
                            {/* Progress */}
                            <circle
                                cx="128" cy="128" r={radius}
                                className={sessionType === 'WORK' ? 'stroke-amber-500' : 'stroke-emerald-500'}
                                strokeWidth="4"
                                fill="transparent"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s linear' }}
                            />
                        </svg>

                        {/* Center Stats */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <div className="text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-2 font-bold">Neural Interval</div>
                            <div className="text-6xl font-serif text-white tracking-tighter mb-2">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-[10px] uppercase tracking-widest text-white/30">
                                {sessionType === 'WORK' ? 'Focus Phase Active' : 'Recovery Phase'}
                            </div>
                        </div>
                    </div>

                    {/* Active Controls */}
                    <div className="flex items-center gap-6 z-10">
                        {isActive ? (
                            <button
                                onClick={pauseSession}
                                className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 transition-all group"
                            >
                                <Pause className="w-4 h-4 text-white/50 group-hover:text-white" />
                            </button>
                        ) : (
                            <button
                                onClick={() => startSession()}
                                className="w-12 h-12 rounded-full border border-amber-500/50 bg-amber-500/10 flex items-center justify-center hover:bg-amber-500/20 transition-all group shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            >
                                <Play className="w-4 h-4 text-amber-500" />
                            </button>
                        )}
                        <button
                            onClick={skipSession}
                            className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all text-white/20 hover:text-white"
                        >
                            <FastForward className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Neural Race Track (Linear Progress) */}
                    <div className="w-full space-y-2 z-10">
                        <div className="flex justify-between text-[10px] uppercase tracking-widest text-white/30">
                            <span>Latency</span>
                            <span>Velocity</span>
                        </div>
                        <div className="h-12 border border-white/10 bg-white/[0.02] rounded-lg relative overflow-hidden flex items-center px-4">
                            {/* Grid Lines */}
                            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_100%] pointer-events-none" />

                            {/* Runner */}
                            <motion.div
                                className="absolute top-0 bottom-0 w-[2px] bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] z-20"
                                style={{ left: `${progress}%` }}
                            >
                                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-amber-500 rotate-45 border-2 border-black flex items-center justify-center">
                                    <div className="w-1 h-1 bg-white rounded-full" />
                                </div>
                                <div className="absolute -top-8 -translate-x-1/2 whitespace-nowrap bg-amber-900/80 text-[9px] px-2 py-0.5 rounded text-amber-200 border border-amber-500/30">
                                    AGENT_A1
                                </div>
                            </motion.div>

                            {/* Fill */}
                            <motion.div
                                className="absolute inset-y-0 left-0 bg-amber-500/10 border-r border-amber-500/30 transition-all duration-1000"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-white/20">
                            <span>0.4ms</span>
                            <span>1.28 GB/s</span>
                        </div>
                    </div>

                </div>

                {/* Footer Stats */}
                <div className="p-6 border-t border-white/10 grid grid-cols-2 gap-4 bg-[#050505]">
                    <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                        <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Total Sessions</div>
                        <div className="text-2xl font-serif text-white">{String(totalSessions).padStart(2, '0')}</div>
                    </div>
                    <div className="p-4 bg-white/5 rounded-lg border border-white/5">
                        <div className="text-[9px] uppercase tracking-widest text-white/30 mb-1">Neural Progress</div>
                        <div className="text-2xl font-serif text-amber-500">72%</div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}

export function MinimizedSessionWidget() {
    const {
        isActive,
        timeLeft,
        minimized,
        toggleSidebar,
        sessionType
    } = usePomodoro()

    if (!minimized) return null

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-6 right-6 z-[100]"
        >
            <div
                onClick={toggleSidebar}
                className="bg-[#0A0A0A] border border-white/10 rounded-full p-1 pr-6 flex items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors shadow-2xl group"
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-white/10 text-white/50'}`}>
                    {sessionType === 'WORK' ? <Activity className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                </div>
                <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/30 font-bold mb-0.5">
                        {sessionType === 'WORK' ? 'Focus Active' : 'Rest Cycle'}
                    </div>
                    <div className="font-mono text-lg font-bold text-white leading-none">
                        {formatTime(timeLeft)}
                    </div>
                </div>
                <Maximize2 className="w-4 h-4 text-white/20 group-hover:text-white transition-colors" />
            </div>
        </motion.div>
    )
}

import { Activity, Zap } from 'lucide-react'
