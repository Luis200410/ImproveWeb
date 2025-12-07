'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Playfair_Display, Inter } from 'next/font/google'
import { dataStore } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { PomodoroTimer } from '@/components/pomodoro-timer'
import { ImprovementGarden, type VisualTheme } from '@/components/improvement-garden'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function PomodoroPage() {
    const router = useRouter()
    const [isTimerModalOpen, setIsTimerModalOpen] = useState(false)
    const [isTimerRunning, setIsTimerRunning] = useState(false)
    const [selectedPreset, setSelectedPreset] = useState<{ work: number, break: number } | null>(null)
    const [userId, setUserId] = useState<string | null>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [todayCount, setTodayCount] = useState(0)
    const [selectedTheme, setSelectedTheme] = useState<VisualTheme>('arrows')
    const [timerProgress, setTimerProgress] = useState(0)

    // Get user and load sessions
    useEffect(() => {
        const loadData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUserId(user.id)

            // Load sessions
            const pomodoroSessions = await dataStore.getPomodoroSessions(user.id)
            setSessions(pomodoroSessions)

            // Load today count
            const count = await dataStore.getTodayPomodoroCount(user.id)
            setTodayCount(count)

            // Load saved theme preference
            const saved = localStorage.getItem('pomodoroTheme')
            if (saved) setSelectedTheme(saved as VisualTheme)
        }

        loadData()
    }, [router])

    // Calculate total focus time
    const totalFocusTime = sessions.reduce((sum, s) => sum + s.workDuration, 0)

    // Handle timer completion
    const handleTimerComplete = async (workMinutes: number, breakMinutes: number) => {
        if (!userId) return

        // Save session
        await dataStore.savePomodoroSession({
            userId,
            workDuration: workMinutes,
            breakDuration: breakMinutes,
            wasAutoTriggered: false,
        })

        // Reload data
        const pomodoroSessions = await dataStore.getPomodoroSessions(userId)
        setSessions(pomodoroSessions)

        const count = await dataStore.getTodayPomodoroCount(userId)
        setTodayCount(count)
    }

    // Handle theme change
    const handleThemeChange = (theme: VisualTheme) => {
        setSelectedTheme(theme)
        localStorage.setItem('pomodoroTheme', theme)
    }

    const PRESETS = [
        { label: '25+5', work: 25, break: 5 },
        { label: '30+5', work: 30, break: 5 },
        { label: '45+10', work: 45, break: 10 },
        { label: '60+15', work: 60, break: 15 },
    ]

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase tracking-widest text-xs">Back</span>
                    </button>
                </motion.div>

                {/* Header - minimal */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">Focus Sessions</div>
                    <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold text-white mb-4`}>
                        Pomodoro
                    </h1>
                </motion.div>

                {/* Timer Presets - Compact like Forest */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="grid grid-cols-4 gap-3 max-w-2xl mx-auto">
                        {PRESETS.map((preset, index) => (
                            <motion.button
                                key={preset.label}
                                onClick={() => {
                                    setSelectedPreset({ work: preset.work, break: preset.break })
                                    setIsTimerModalOpen(true)
                                    setIsTimerRunning(true)
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                className="group relative bg-white/5 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all p-4"
                            >
                                {/* Time display - compact */}
                                <div className="text-center">
                                    <div className="text-3xl font-mono text-white mb-1">
                                        {preset.label}
                                    </div>
                                    <div className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
                                        min
                                    </div>
                                </div>

                                {/* Subtle accent line */}
                                <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10 group-hover:bg-white/30 transition-colors" />
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                {/* Stats - Minimal inline */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-12 flex items-center gap-8 bg-white/5 backdrop-blur-md border border-white/10 p-6"
                >
                    <div>
                        <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Today</div>
                        <div className="text-3xl font-mono text-white">{todayCount}</div>
                    </div>
                    <div className="h-12 w-px bg-white/10" />
                    <div>
                        <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Total</div>
                        <div className="text-3xl font-mono text-white">{sessions.length}</div>
                    </div>
                    <div className="h-12 w-px bg-white/10" />
                    <div>
                        <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Focus Time</div>
                        <div className="text-3xl font-mono text-white">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
                    </div>
                </motion.div>

                {/* Visual Progress Garden */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <ImprovementGarden
                        completedSessions={sessions.length}
                        todayCount={todayCount}
                        totalFocusTime={totalFocusTime}
                        selectedTheme={selectedTheme}
                        onThemeChange={handleThemeChange}
                    />
                </motion.div>
            </div>

            {/* Floating timer indicator when running but minimized */}
            {isTimerRunning && !isTimerModalOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    onClick={() => setIsTimerModalOpen(true)}
                    className="fixed bottom-8 right-8 z-50 bg-white text-black px-6 py-4 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center gap-3"
                >
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="font-mono text-sm font-bold">Timer Running</span>
                </motion.button>
            )}

            {/* Timer Modal */}
            <PomodoroTimer
                isOpen={isTimerModalOpen}
                onClose={() => setIsTimerModalOpen(false)}
                selectedPreset={selectedPreset}
                autoStart={true}
                onComplete={handleTimerComplete}
                onTimerStop={() => {
                    setIsTimerRunning(false)
                    setIsTimerModalOpen(false)
                }}
            />
        </div>
    )
}
