'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Minimize2, Maximize2, Zap } from 'lucide-react'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Button } from '@/components/ui/button'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

import { usePomodoro } from '@/components/productivity/pomodoro/pomodoro-context'
import { PomodoroSettings } from '@/components/productivity/pomodoro/pomodoro-settings'

type TimerPhase = 'idle' | 'work' | 'break' | 'longBreak' | 'complete'

interface PomodoroTimerProps {
    isOpen: boolean
    onClose: () => void
    habitName?: string
    habitId?: string
    selectedPreset?: { work: number; break: number } | null
    autoStart?: boolean
    onComplete?: (workMinutes: number, breakMinutes: number) => void
    onTimerStop?: () => void
}

export function PomodoroTimer({
    isOpen,
    onClose,
    habitName,
    habitId,
    selectedPreset: propSelectedPreset, // Renamed to avoid conflict with state
    autoStart = false,
    onComplete,
    onTimerStop,
}: PomodoroTimerProps) {
    const { config, updateConfig } = usePomodoro()
    const [currentPreset, setCurrentPreset] = useState<{ work: number, break: number }>(
        propSelectedPreset
            ? { work: propSelectedPreset.work, break: propSelectedPreset.break }
            : { work: config.sprintDuration, break: config.shortBreakDuration }
    )
    const [phase, setPhase] = useState<TimerPhase>('idle')
    const [timeLeft, setTimeLeft] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [isMinimized, setIsMinimized] = useState(false)
    const [sessionCount, setSessionCount] = useState(0)

    // Calculate progress percentage
    const totalTime =
        phase === 'work'
            ? currentPreset.work * 60
            : phase === 'break'
                ? currentPreset.break * 60
                : phase === 'longBreak'
                    ? config.longBreakDuration * 60
                    : 0
    const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0
    const SEGMENT_COUNT = 12
    const activeSegments = Math.round((progress / 100) * SEGMENT_COUNT)
    const phaseLabel = phase === 'work' ? 'Focusing' : phase === 'break' ? 'Resting' : phase === 'longBreak' ? 'Long Rest' : phase === 'complete' ? 'Complete' : 'Idle'

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Play notification sound
    const playSound = useCallback(() => {
        if (soundEnabled && typeof window !== 'undefined') {
            const audio = new Audio('/notification.mp3')
            audio.play().catch(() => {
                // Fallback if audio fails
                console.log('Audio playback failed')
            })
        }
    }, [soundEnabled])

    const startTimer = (preset: { work: number, break: number }) => {
        setCurrentPreset(preset)
        setPhase('work')
        setTimeLeft(preset.work * 60)
        setIsRunning(true)
    }

    // Pause/resume
    const togglePause = () => {
        setIsRunning(!isRunning)
    }

    // Reset
    const reset = () => {
        setPhase('idle')
        setTimeLeft(0)
        setIsRunning(false)
        setSessionCount(0)
        onTimerStop?.() // Notify parent that timer has stopped/reset
    }

    // Timer countdown effect
    useEffect(() => {
        if (!isRunning || timeLeft <= 0) return

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = prev - 1

                if (newTime <= 0) {
                    setIsRunning(false)
                    playSound()

                    // If we're completing a phase, ensure we're not minimized so user sees it
                    if (isMinimized) {
                        setIsMinimized(false)
                    }

                    // Auto-advance to next phase
                    if (phase === 'work') {
                        setTimeout(() => {
                            const newCount = sessionCount + 1
                            setSessionCount(newCount)

                            if (newCount % 3 === 0) {
                                setPhase('longBreak')
                                setTimeLeft(config.longBreakDuration * 60)
                            } else {
                                setPhase('break')
                                setTimeLeft(currentPreset.break * 60)
                            }
                            setIsRunning(true)
                        }, 1000)
                    } else if (phase === 'break' || phase === 'longBreak') {
                        setTimeout(() => {
                            setPhase('complete')
                            onComplete?.(currentPreset.work, currentPreset.break)
                        }, 1000)
                    }
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isRunning, timeLeft, phase, currentPreset, playSound, onComplete, isMinimized])

    useEffect(() => {
        if (autoStart && isOpen && phase === 'idle' && propSelectedPreset) {
            startTimer({ work: propSelectedPreset.work, break: propSelectedPreset.break })
        } else if (autoStart && isOpen && phase === 'idle') {
            startTimer({ work: config.sprintDuration, break: config.shortBreakDuration })
        }
    }, [autoStart, isOpen, phase, propSelectedPreset, config.sprintDuration, config.shortBreakDuration])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className={isMinimized
                    ? "fixed bottom-6 right-6 z-50 pointer-events-auto"
                    : "fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                }
            >
                {isMinimized ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-zinc-900 border border-white/10 rounded-2xl p-4 shadow-2xl w-[300px] flex items-center gap-4"
                    >
                        <div className="relative w-12 h-12 flex items-center justify-center">
                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                <motion.circle
                                    cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="8"
                                    strokeDasharray={`${2 * Math.PI * 45}`}
                                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <button onClick={togglePause} className="relative z-10 text-white hover:text-white/80">
                                {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            <p className={`${playfair.className} text-xl font-bold text-white`}>
                                {formatTime(timeLeft)}
                            </p>
                            <p className="text-[10px] uppercase tracking-wider text-white/50 truncate">
                                {phase === 'work' ? 'Focusing' : phase === 'longBreak' ? 'Long Rest' : 'Rest'}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <button onClick={() => setIsMinimized(false)} className="text-white/50 hover:text-white">
                                <Maximize2 className="w-4 h-4" />
                            </button>
                            <button onClick={onClose} className="text-white/50 hover:text-red-400">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className={`relative w-full transition-all duration-700 ease-[cubic-bezier(0.19,1,0.22,1)] ${phase === 'idle' ? 'max-w-6xl' : 'max-w-2xl'}`}
                    >
                        <div className="absolute inset-8 rounded-[38px] bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.06),transparent_40%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.04),transparent_35%)] blur-2xl" />
                        <div className="absolute inset-0 rounded-[38px] border border-white/[0.08] opacity-60" />

                        {/* Main timer card */}
                        <div className="relative overflow-y-auto max-h-[90vh] rounded-[38px] border border-white/[0.08] bg-[#050505] shadow-[0_30px_100px_rgba(0,0,0,0.6)]">
                            <div className="absolute inset-0 opacity-[0.03]">
                                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:48px_48px]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_55%)]" />
                            </div>

                            <div className="relative p-6 md:p-10 text-white">
                                {/* Window Controls */}
                                <div className="absolute top-6 right-6 z-50 flex items-center gap-4">
                                    {phase !== 'idle' && (
                                        <button
                                            onClick={() => setIsMinimized(true)}
                                            className="p-2 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center group"
                                        >
                                            <Minimize2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="p-2 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-colors flex items-center justify-center"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {phase === 'idle' ? (
                                    <div className="flex flex-col gap-8 md:p-4">
                                        <div className="flex justify-between items-end mb-4">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.35em] text-white/50 mb-2">
                                                    Configuration
                                                </p>
                                                <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold leading-tight`}>
                                                    Sprint Settings
                                                </h2>
                                            </div>
                                        </div>

                                        <PomodoroSettings config={config} updateConfig={updateConfig} />

                                        <div className="flex justify-center pt-8">
                                            <Button
                                                onClick={() => startTimer({ work: config.sprintDuration, break: config.shortBreakDuration })}
                                                size="lg"
                                                className="w-full md:w-auto md:min-w-[400px] h-16 bg-white text-black hover:bg-white/90 font-bold text-xs tracking-[0.2em] uppercase rounded-full shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-3"
                                            >
                                                <Play className="w-5 h-5" /> Initialize Sprint
                                            </Button>
                                        </div>
                                    </div>
                                ) : phase !== 'complete' ? (
                                    <div className="flex flex-col items-center justify-center py-12 md:py-20 relative px-4">
                                        {/* Status Header Absolute Top */}
                                        <div className="absolute top-0 left-0 right-0 flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <h2 className={`${playfair.className} text-xl md:text-2xl font-bold text-white mb-1 tracking-wide opacity-90`}>
                                                    {habitName || 'Deep Work Mode'}
                                                </h2>
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-amber-500/80 font-mono">
                                                    {phase === 'work' ? '// FOCUS IN PROGRESS' : phase === 'longBreak' ? '// LONG REST ACTIVE' : '// REST ACTIVE'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => setSoundEnabled(!soundEnabled)}
                                                className="p-3 mt-1 rounded-full border border-white/10 bg-white/5 hover:border-white/30 transition-colors"
                                            >
                                                {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white/50" />}
                                            </button>
                                        </div>

                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.8, ease: "easeOut" }}
                                            className="relative w-80 h-80 md:w-96 md:h-96 mt-16 mb-20 flex items-center justify-center"
                                        >
                                            <div className="absolute inset-16 rounded-full border border-white/5 bg-white/[0.01] blur-2xl" />
                                            <svg className="absolute inset-0 -rotate-90 w-full h-full" viewBox="0 0 100 100">
                                                <defs>
                                                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor={phase === 'work' ? '#f59e0b' : '#34d399'} stopOpacity="1" />
                                                        <stop offset="100%" stopColor={phase === 'work' ? '#fbbf24' : '#6ee7b7'} stopOpacity="0.4" />
                                                    </linearGradient>
                                                    <filter id="glow">
                                                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                                                        <feMerge>
                                                            <feMergeNode in="coloredBlur" />
                                                            <feMergeNode in="SourceGraphic" />
                                                        </feMerge>
                                                    </filter>
                                                </defs>
                                                <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" strokeDasharray="0.5 3" />
                                                <circle cx="50" cy="50" r="43" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
                                                <motion.circle
                                                    cx="50"
                                                    cy="50"
                                                    r="43"
                                                    fill="none"
                                                    stroke="url(#timerGradient)"
                                                    strokeWidth="2.5"
                                                    strokeDasharray={`${2 * Math.PI * 43}`}
                                                    strokeDashoffset={`${2 * Math.PI * 43 * (1 - progress / 100)}`}
                                                    strokeLinecap="round"
                                                    initial={{ strokeDashoffset: 2 * Math.PI * 43 }}
                                                    animate={{ strokeDashoffset: 2 * Math.PI * 43 * (1 - progress / 100) }}
                                                    transition={{ duration: 0.5, ease: "linear" }}
                                                    filter="url(#glow)"
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center mt-2">
                                                <p className={`${playfair.className} text-7xl md:text-[6rem] leading-none font-bold text-white tracking-tighter mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.15)]`}>
                                                    {formatTime(timeLeft)}
                                                </p>
                                                <span className="px-4 py-1.5 rounded-full border border-white/10 bg-black/40 text-[9px] uppercase tracking-[0.4em] text-white/50 backdrop-blur-md">
                                                    {phase === 'work' ? currentPreset.work + 'm Focus' : phase === 'longBreak' ? config.longBreakDuration + 'm Long Rest' : currentPreset.break + 'm Rest'}
                                                </span>
                                                <div className="mt-3 text-[10px] uppercase tracking-widest text-white/30 font-semibold">
                                                    Session {(sessionCount % 3) + 1} / 3
                                                </div>
                                            </div>
                                        </motion.div>

                                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center justify-center -mb-4">
                                            <Button
                                                onClick={togglePause}
                                                size="lg"
                                                className="bg-white text-black hover:bg-white/90 h-14 md:px-12 w-full sm:w-auto rounded-full uppercase tracking-widest text-xs font-bold"
                                            >
                                                {isRunning ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Resume</>}
                                            </Button>
                                            <Button
                                                onClick={reset}
                                                size="lg"
                                                variant="outline"
                                                className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 h-14 md:px-12 w-full sm:w-auto rounded-full uppercase tracking-widest text-xs font-bold transition-all"
                                            >
                                                <RotateCcw className="w-4 h-4 mr-2" /> End Drop
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 relative">
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center space-y-6 max-w-sm w-full mx-auto shadow-2xl"
                                        >
                                            <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto border border-amber-500/30">
                                                <Zap className="w-10 h-10 text-amber-500" />
                                            </div>
                                            <div>
                                                <p className={`${playfair.className} text-4xl font-bold text-white mb-2`}>
                                                    Session Complete
                                                </p>
                                                <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                                                    {currentPreset.work} MIN FOCUS LOGGED
                                                </p>
                                            </div>
                                            <Button onClick={onClose} size="lg" className="bg-white text-black hover:bg-white/90 w-full h-14 rounded-full font-bold uppercase tracking-widest text-xs">
                                                Confirm Sync
                                            </Button>
                                        </motion.div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
