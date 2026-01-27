'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useTimer } from '@/contexts/timer-context'
import { useState } from 'react'
import { PomodoroTimer } from './pomodoro-timer'

export function GlobalTimerIndicator() {
    const { isTimerActive } = useTimer()
    const [isTimerOpen, setIsTimerOpen] = useState(false)

    if (!isTimerActive) return null

    return (
        <>
            <AnimatePresence>
                <motion.button
                    initial={{ scale: 0, y: 100 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0, y: 100 }}
                    onClick={() => setIsTimerOpen(true)}
                    className="fixed bottom-8 right-8 z-50 bg-white text-black px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
                >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <Clock className="w-5 h-5" />
                    <span className="font-mono text-sm font-bold">Timer Running</span>
                </motion.button>
            </AnimatePresence>

            <PomodoroTimer
                isOpen={isTimerOpen}
                onClose={() => setIsTimerOpen(false)}
            />
        </>
    )
}
