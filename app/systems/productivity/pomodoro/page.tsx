'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Playfair_Display, Inter } from 'next/font/google'
import { dataStore } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { PomodoroTimer } from '@/components/pomodoro-timer'
import { ImprovementGarden, type VisualTheme } from '@/components/improvement-garden'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function PomodoroPage() {
    const router = useRouter()
    const [isTimerOpen, setIsTimerOpen] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)
    const [sessions, setSessions] = useState<any[]>([])
    const [todayCount, setTodayCount] = useState(0)
    const [selectedTheme, setSelectedTheme] = useState<VisualTheme>('arrows')

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

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="w-8 h-8 text-white" />
                        <h1 className={`${playfair.className} text-5xl font-bold text-white`}>
                            Pomodoro Timer
                        </h1>
                    </div>
                    <p className={`${inter.className} text-white/60 text-lg`}>
                        Deep work sessions with visual progress tracking
                    </p>
                </motion.div>

                {/* Main Timer Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="mb-12"
                >
                    <div className="bg-black border border-white/10 p-12">
                        <div className="text-center mb-8">
                            <p className="text-xs uppercase tracking-[0.3em] text-white/40 mb-4">
                                Select Your Focus Duration
                            </p>
                            <h2 className={`${playfair.className} text-4xl font-bold text-white mb-2`}>
                                Start Deep Work
                            </h2>
                            <p className={`${inter.className} text-white/60`}>
                                Choose a Pomodoro preset and begin your session
                            </p>
                        </div>

                        {/* Quick Start Buttons - Large and Prominent */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                            {[
                                { label: '25 + 5', work: 25, break: 5, desc: 'Classic Pomodoro' },
                                { label: '30 + 5', work: 30, break: 5, desc: 'Extended Focus' },
                                { label: '45 + 10', work: 45, break: 10, desc: 'Deep Work' },
                                { label: '60 + 15', work: 60, break: 15, desc: 'Ultra Focus' },
                            ].map((preset) => (
                                <motion.button
                                    key={preset.label}
                                    onClick={() => setIsTimerOpen(true)}
                                    whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.4)' }}
                                    whileTap={{ scale: 0.95 }}
                                    className="bg-black border-2 border-white/20 hover:border-white/40 p-8 transition-all group"
                                >
                                    <div className="mb-4">
                                        <p className={`${playfair.className} text-5xl font-bold text-white group-hover:scale-110 transition-transform`}>
                                            {preset.label}
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm text-white/60">{preset.desc}</p>
                                        <p className="text-xs text-white/40">
                                            {preset.work}m work + {preset.break}m break
                                        </p>
                                    </div>
                                </motion.button>
                            ))}
                        </div>

                        {/* Stats Preview */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-12 grid grid-cols-3 gap-6 max-w-3xl mx-auto"
                        >
                            <div className="text-center">
                                <p className={`${playfair.className} text-4xl font-bold text-white mb-1`}>
                                    {todayCount}
                                </p>
                                <p className="text-xs uppercase tracking-wider text-white/40">Today</p>
                            </div>
                            <div className="text-center">
                                <p className={`${playfair.className} text-4xl font-bold text-white mb-1`}>
                                    {sessions.length}
                                </p>
                                <p className="text-xs uppercase tracking-wider text-white/40">Total Sessions</p>
                            </div>
                            <div className="text-center">
                                <p className={`${playfair.className} text-4xl font-bold text-white mb-1`}>
                                    {Math.floor(totalFocusTime / 60)}h
                                </p>
                                <p className="text-xs uppercase tracking-wider text-white/40">Focus Time</p>
                            </div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Visual Progress Garden */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
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

            {/* Timer Modal */}
            <PomodoroTimer
                isOpen={isTimerOpen}
                onClose={() => setIsTimerOpen(false)}
                onComplete={handleTimerComplete}
            />
        </div>
    )
}
