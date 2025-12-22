'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Playfair_Display, Inter } from '@/lib/font-shim'
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
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] via-transparent to-black" />
                <div className="absolute -left-24 top-20 w-[620px] h-[620px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.14),transparent_45%)] blur-3xl" />
                <div className="absolute right-[-160px] top-40 w-[560px] h-[560px] bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.08),transparent_40%)] blur-3xl" />
                <div className="absolute inset-0 opacity-[0.04]">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:38px_38px]" />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-8 pt-24 md:pt-28 pb-16 space-y-10 relative">
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
                    <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:items-end md:justify-between">
                        <div className="space-y-3">
                            <div className="text-[10px] uppercase tracking-[0.35em] text-white/50">Focus Sessions</div>
                            <div className="flex items-center gap-3">
                                <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold text-white`}>
                                    Pomodoro
                                </h1>
                                <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5 text-[11px] uppercase tracking-[0.25em] text-white/70">Discipline</span>
                            </div>
                            <p className={`${inter.className} text-white/65 max-w-2xl`}>
                                Drop into deep work blocks, track your sprints, and watch your progress grow every day.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-white/60">
                            <div className="h-10 w-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
                                <span className="text-lg">⚡</span>
                            </div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-white/40">Today</p>
                                <p className="text-white font-semibold">{todayCount} sessions</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Primary card */}
                <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-md p-6 md:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                    >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.28em] text-white/45 mb-2">Choose your sprint</p>
                                <p className={`${playfair.className} text-3xl font-semibold text-white`}>Preset Durations</p>
                            </div>
                            <div className="text-sm text-white/60">
                                <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Auto start on select</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                                    whileTap={{ scale: 0.97 }}
                                    className="group relative overflow-hidden rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-5 text-left"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className={`${playfair.className} text-2xl font-semibold text-white`}>{preset.label}</p>
                                            <p className="text-[11px] uppercase tracking-[0.24em] text-white/50 mt-1">
                                                {preset.work}m focus · {preset.break}m break
                                            </p>
                                        </div>
                                        <div className="text-lg">↗</div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.05] to-black/50 backdrop-blur-md p-6 md:p-8 space-y-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]"
                    >
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-xl">🌿</div>
                            <div>
                                <p className="text-[11px] uppercase tracking-[0.25em] text-white/45">Momentum</p>
                                <p className={`${playfair.className} text-2xl font-semibold text-white`}>Visual Garden</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 mb-1">Today</p>
                                <p className="text-3xl font-mono text-white">{todayCount}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 mb-1">Lifetime</p>
                                <p className="text-3xl font-mono text-white">{sessions.length}</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                                <p className="text-[10px] uppercase tracking-[0.24em] text-white/45 mb-1">Focus Time</p>
                                <p className="text-3xl font-mono text-white">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</p>
                            </div>
                        </div>

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
        </div>
    )
}
