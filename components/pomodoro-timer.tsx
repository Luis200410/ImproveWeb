'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, Minimize2, Maximize2 } from 'lucide-react'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Button } from '@/components/ui/button'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

type TimerPreset = {
    label: string
    work: number // minutes
    break: number // minutes
}

const PRESETS: TimerPreset[] = [
    { label: '25 + 5', work: 25, break: 5 },
    { label: '30 + 5', work: 30, break: 5 },
    { label: '45 + 10', work: 45, break: 10 },
    { label: '60 + 15', work: 60, break: 15 },
]

type TimerPhase = 'idle' | 'work' | 'break' | 'complete'

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
    const [currentPreset, setCurrentPreset] = useState<TimerPreset>(
        propSelectedPreset
            ? { label: `${propSelectedPreset.work}+${propSelectedPreset.break}`, work: propSelectedPreset.work, break: propSelectedPreset.break }
            : PRESETS[0]
    )
    const [phase, setPhase] = useState<TimerPhase>('idle')
    const [timeLeft, setTimeLeft] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [isMinimized, setIsMinimized] = useState(false)

    // Calculate progress percentage
    const totalTime =
        phase === 'work'
            ? currentPreset.work * 60
            : phase === 'break'
                ? currentPreset.break * 60
                : 0
    const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0
    const SEGMENT_COUNT = 12
    const activeSegments = Math.round((progress / 100) * SEGMENT_COUNT)
    const phaseLabel = phase === 'work' ? 'Work' : phase === 'break' ? 'Break' : phase === 'complete' ? 'Complete' : 'Idle'

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

    // Start timer
    const startTimer = (preset: TimerPreset) => {
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
                            setPhase('break')
                            setTimeLeft(currentPreset.break * 60)
                            setIsRunning(true)
                        }, 1000)
                    } else if (phase === 'break') {
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

    // Auto-start effect with selected preset
    useEffect(() => {
        if (autoStart && isOpen && phase === 'idle' && propSelectedPreset) {
            startTimer({ label: `${propSelectedPreset.work}+${propSelectedPreset.break}`, work: propSelectedPreset.work, break: propSelectedPreset.break })
        } else if (autoStart && isOpen && phase === 'idle') {
            startTimer(PRESETS[0])
        }
    }, [autoStart, isOpen, phase, propSelectedPreset])

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
                                {phase === 'work' ? 'Focusing' : 'Break'}
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
                        className="relative w-full max-w-3xl"
                    >
                        <div className="absolute inset-6 rounded-[32px] bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.14),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(255,255,255,0.08),transparent_32%)] blur-3xl" />
                        <div className="absolute inset-0 rounded-[32px] border border-white/10 opacity-60" />

                        {/* Main timer card */}
                        <div className="relative overflow-y-auto max-h-[85vh] rounded-[32px] border border-white/12 bg-gradient-to-b from-white/[0.06] via-black to-black shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
                            <div className="absolute inset-0 opacity-[0.05]">
                                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:32px_32px]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_55%)]" />
                            </div>

                            <div className="relative p-6 md:p-10 space-y-10 text-white">
                                {/* Window Controls */}
                                <div className="absolute top-6 right-6 z-10 flex items-center gap-4">
                                    <button
                                        onClick={() => setIsMinimized(true)}
                                        className="text-white/60 hover:text-white transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="text-xs uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Minimize</span>
                                        <Minimize2 className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="text-white/60 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Header */}
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                    <div className="space-y-3">
                                        <p className="text-[10px] uppercase tracking-[0.35em] text-white/50">
                                            {habitName ? 'Focus Session' : 'Pomodoro Timer'}
                                        </p>
                                        <h2 className={`${playfair.className} text-4xl md:text-5xl font-bold leading-tight`}>
                                            {habitName || 'Deep Work Mode'}
                                        </h2>
                                        <p className={`${inter.className} text-sm text-white/55 max-w-xl`}>
                                            A heritage-inspired sprint: focus, recover, repeat. Stay in rhythm and let the system carry you.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 self-start">
                                        <span className="px-4 py-2 rounded-full border border-white/20 bg-white/5 text-[10px] uppercase tracking-[0.3em] text-white/80">
                                            {phaseLabel}
                                        </span>
                                        <button
                                            onClick={() => setSoundEnabled(!soundEnabled)}
                                            className="p-3 rounded-full border border-white/15 bg-white/5 hover:border-white/40 transition-colors"
                                            aria-label={soundEnabled ? 'Mute timer alert' : 'Unmute timer alert'}
                                        >
                                            {soundEnabled ? (
                                                <Volume2 className="w-5 h-5 text-white" />
                                            ) : (
                                                <VolumeX className="w-5 h-5 text-white/50" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-[1.05fr,0.95fr] gap-8 items-center">
                                    {/* Timer display */}
                                    <div className="flex justify-center">
                                        <div className="relative w-72 h-72 md:w-80 md:h-80">
                                            <div className="absolute inset-6 rounded-full border border-white/10 bg-white/[0.03] blur" />
                                            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                                                <defs>
                                                    <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                        <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                                                        <stop offset="100%" stopColor="rgba(255,255,255,0.4)" />
                                                    </linearGradient>
                                                </defs>
                                                <circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke="rgba(255,255,255,0.08)"
                                                    strokeWidth="3"
                                                    strokeDasharray="4 6"
                                                />
                                                <motion.circle
                                                    cx="50"
                                                    cy="50"
                                                    r="45"
                                                    fill="none"
                                                    stroke="url(#timerGradient)"
                                                    strokeWidth="3"
                                                    strokeDasharray={`${2 * Math.PI * 45}`}
                                                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                                                    strokeLinecap="round"
                                                    initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                                    animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
                                                    transition={{ duration: 0.5 }}
                                                    className="drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]"
                                                />
                                            </svg>

                                            {/* Time display */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                <p className={`${playfair.className} text-6xl md:text-7xl font-bold text-white mb-2`}>
                                                    {formatTime(timeLeft)}
                                                </p>
                                                <p className="text-xs uppercase tracking-[0.28em] text-white/45">
                                                    {phase === 'work' ? 'Work Interval' : phase === 'break' ? 'Recovery' : phase === 'complete' ? 'Complete' : 'Select Duration'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 mb-1">Work</p>
                                                <p className={`${playfair.className} text-2xl font-semibold`}>{currentPreset.work}m</p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 mb-1">Break</p>
                                                <p className={`${playfair.className} text-2xl font-semibold`}>{currentPreset.break}m</p>
                                            </div>
                                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                                <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 mb-1">Progress</p>
                                                <p className={`${playfair.className} text-2xl font-semibold`}>{Math.round(progress)}%</p>
                                            </div>
                                        </div>

                                        {(phase === 'work' || phase === 'break') && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-white/45">
                                                    <span>Momentum</span>
                                                    <span>{phase === 'work' ? 'In the pocket' : 'Intentional recovery'}</span>
                                                </div>
                                                <div className="flex items-end gap-1">
                                                    {Array.from({ length: SEGMENT_COUNT }).map((_, idx) => {
                                                        const active = idx < activeSegments
                                                        return (
                                                            <motion.span
                                                                key={idx}
                                                                animate={{
                                                                    opacity: active ? 0.95 : 0.25,
                                                                    height: active ? 24 + idx * 4 : 16 + idx * 3
                                                                }}
                                                                transition={{ duration: 0.3 }}
                                                                className="w-[7px] rounded-full bg-white"
                                                            />
                                                        )
                                                    })}
                                                </div>
                                                <p className={`${inter.className} text-[12px] text-white/60`}>
                                                    {phase === 'work'
                                                        ? 'Stay in flow—each minute compounds toward mastery.'
                                                        : 'Let the mind breathe so the next sprint hits sharper.'}
                                                </p>
                                            </div>
                                        )}

                                        {/* Preset buttons - Only show in idle state */}
                                        {phase === 'idle' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="grid grid-cols-2 md:grid-cols-4 gap-3"
                                            >
                                                {PRESETS.map((preset) => (
                                                    <motion.button
                                                        key={preset.label}
                                                        onClick={() => startTimer(preset)}
                                                        whileHover={{ y: -2 }}
                                                        whileTap={{ scale: 0.97 }}
                                                        className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-left"
                                                    >
                                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        <p className={`${playfair.className} text-2xl font-semibold text-white mb-1`}>
                                                            {preset.label}
                                                        </p>
                                                        <p className="text-[11px] uppercase tracking-[0.28em] text-white/45">
                                                            {preset.work}m focus · {preset.break}m break
                                                        </p>
                                                    </motion.button>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* Controls - Show when timer is active */}
                                        {phase !== 'idle' && phase !== 'complete' && (
                                            <div className="grid sm:grid-cols-[1fr,1fr,auto] gap-3">
                                                <Button
                                                    onClick={togglePause}
                                                    size="lg"
                                                    className="bg-white text-black hover:bg-white/90 justify-center"
                                                >
                                                    {isRunning ? (
                                                        <>
                                                            <Pause className="w-5 h-5 mr-2" />
                                                            Pause
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Play className="w-5 h-5 mr-2" />
                                                            Resume
                                                        </>
                                                    )}
                                                </Button>
                                                <Button
                                                    onClick={reset}
                                                    size="lg"
                                                    variant="outline"
                                                    className="border-white/30 text-white hover:bg-white/10 justify-center"
                                                >
                                                    <RotateCcw className="w-5 h-5 mr-2" />
                                                    Stop
                                                </Button>
                                                <div className="hidden sm:block text-[11px] uppercase tracking-[0.25em] text-white/45 self-center text-right">
                                                    {phase === 'work' ? 'Breathe through the burn' : 'Let your mind go slack'}
                                                </div>
                                            </div>
                                        )}

                                        {/* Completion state */}
                                        {phase === 'complete' && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 text-center space-y-3"
                                            >
                                                <p className={`${playfair.className} text-4xl font-bold text-white`}>
                                                    Session Complete
                                                </p>
                                                <p className={`${inter.className} text-white/70`}>
                                                    {currentPreset.work} minutes of focused craft—log the win and roll forward.
                                                </p>
                                                <Button onClick={onClose} size="lg" className="bg-white text-black hover:bg-white/90">
                                                    Close
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
