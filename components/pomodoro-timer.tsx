'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react'
import { Playfair_Display, Inter } from 'next/font/google'
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
    onProgressUpdate?: (progress: number) => void
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
    onProgressUpdate,
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

    // Calculate progress percentage
    const totalTime =
        phase === 'work'
            ? currentPreset.work * 60
            : phase === 'break'
                ? currentPreset.break * 60
                : 0
    const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0

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

                // Update progress for parent
                if (onProgressUpdate) {
                    const newProgress = totalTime > 0 ? ((totalTime - newTime) / totalTime) * 100 : 0
                    onProgressUpdate(newProgress)
                }

                if (newTime <= 0) {
                    setIsRunning(false)
                    playSound()

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
    }, [isRunning, timeLeft, phase, currentPreset, playSound, onComplete])

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
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="relative w-full max-w-2xl"
                >
                    {/* Close button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 text-white/60 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Main timer card */}
                    <div className="bg-black border border-white/10 p-8 md:p-12">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">
                                {habitName ? 'Focus Session' : 'Pomodoro Timer'}
                            </p>
                            <h2 className={`${playfair.className} text-3xl md:text-4xl font-bold text-white`}>
                                {habitName || 'Deep Work Mode'}
                            </h2>
                        </div>

                        {/* Timer display */}
                        <div className="flex justify-center mb-12">
                            <div className="relative w-64 h-64">
                                {/* Progress ring */}
                                <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.1)"
                                        strokeWidth="2"
                                    />
                                    <motion.circle
                                        cx="50"
                                        cy="50"
                                        r="45"
                                        fill="none"
                                        stroke="white"
                                        strokeWidth="2"
                                        strokeDasharray={`${2 * Math.PI * 45}`}
                                        strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                                        strokeLinecap="round"
                                        initial={{ strokeDashoffset: 2 * Math.PI * 45 }}
                                        animate={{ strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100) }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </svg>

                                {/* Time display */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <p className={`${playfair.className} text-6xl font-bold text-white mb-2`}>
                                        {formatTime(timeLeft)}
                                    </p>
                                    <p className="text-xs uppercase tracking-wider text-white/40">
                                        {phase === 'work' ? 'Work Time' : phase === 'break' ? 'Break Time' : phase === 'complete' ? 'Complete!' : 'Select Duration'}
                                    </p>

                                    {/* Real-time visual reward - growing during timer */}
                                    {(phase === 'work' || phase === 'break') && (
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{
                                                scale: phase === 'work' ? progress / 100 : 1,
                                                opacity: phase === 'work' ? 0.3 + (progress / 100) * 0.7 : 1
                                            }}
                                            className="absolute -bottom-8"
                                        >
                                            <div className="text-4xl">⬆️</div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Preset buttons - Only show in idle state */}
                        {phase === 'idle' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                            >
                                {PRESETS.map((preset) => (
                                    <motion.button
                                        key={preset.label}
                                        onClick={() => startTimer(preset)}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-white/5 border border-white/10 hover:border-white/30 p-4 transition-all"
                                    >
                                        <p className={`${playfair.className} text-2xl font-bold text-white mb-1`}>
                                            {preset.label}
                                        </p>
                                        <p className="text-xs text-white/40">
                                            {preset.work}m + {preset.break}m
                                        </p>
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}

                        {/* Controls - Show when timer is active */}
                        {phase !== 'idle' && phase !== 'complete' && (
                            <div className="flex items-center justify-center gap-4">
                                <Button
                                    onClick={togglePause}
                                    size="lg"
                                    className="bg-white text-black hover:bg-white/90"
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
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                                >
                                    <RotateCcw className="w-5 h-5 mr-2" />
                                    Stop
                                </Button>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="p-3 border border-white/20 hover:border-white/40 transition-colors"
                                >
                                    {soundEnabled ? (
                                        <Volume2 className="w-5 h-5 text-white" />
                                    ) : (
                                        <VolumeX className="w-5 h-5 text-white/40" />
                                    )}
                                </button>
                            </div>
                        )}

                        {/* Completion state */}
                        {phase === 'complete' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center"
                            >
                                <p className={`${playfair.className} text-4xl font-bold text-white mb-4`}>
                                    Session Complete! 🎉
                                </p>
                                <p className="text-white/60 mb-8">
                                    You focused for {currentPreset.work} minutes
                                </p>
                                <Button onClick={onClose} size="lg" className="bg-white text-black hover:bg-white/90">
                                    Close
                                </Button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
