'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { dataStore, Entry, System } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, CheckSquare, Clock, Calendar, Zap, Sparkles, Target, List, ArrowRight, Timer, Play, CheckCircle2 } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function ProductivityPage() {
    const [system, setSystem] = useState<System | null>(null)
    const [entries, setEntries] = useState<Record<string, Entry[]>>({})
    const [userId, setUserId] = useState<string>('defaultUser')
    const [pomodoroStats, setPomodoroStats] = useState({ todaySessions: 0, todayMinutes: 0 })

    useEffect(() => {
        const prodSystem = dataStore.getSystem('productivity')
        setSystem(prodSystem || null)
    }, [])

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()
    }, [])

    const refreshEntries = useCallback(async () => {
        if (!system || !userId) return
        const map: Record<string, Entry[]> = {}

        // Load standard entries
        await Promise.all(system.microapps.map(async (microapp) => {
            if (microapp.id === 'pomodoro' || microapp.id === 'review') return // These have special handling or separate tables usually
            const list = await dataStore.getEntries(microapp.id, userId)
            map[microapp.id] = list
        }))

        // Load specific stats
        const todaySessions = await dataStore.getTodayPomodoroCount(userId)
        // Estimate minutes (assuming 25m per session for now as simple stat)
        setPomodoroStats({ todaySessions, todayMinutes: todaySessions * 25 })

        setEntries(map)
    }, [system, userId])

    useEffect(() => {
        refreshEntries()
    }, [refreshEntries])

    const tasks = entries['tasks'] || []
    const habits = entries['atomic-habits'] || []

    const nextTasks = useMemo(() => {
        return tasks.filter(t => t.data['Status'] === 'Next').slice(0, 5)
    }, [tasks])

    const habitsProgress = useMemo(() => {
        const today = new Date().toISOString().split('T')[0]
        if (habits.length === 0) return { completed: 0, total: 0 }

        let completed = 0
        habits.forEach(h => {
            const dates = h.data['completedDates']
            let completedDates: string[] = []
            if (Array.isArray(dates)) completedDates = dates
            else if (typeof dates === 'string') {
                try { completedDates = JSON.parse(dates) } catch (e) { }
            }
            if (Array.isArray(completedDates) && completedDates.includes(today)) {
                completed++
            }
        })
        return { completed, total: habits.length }
    }, [habits])

    if (!system) return null

    return (
        <div className="min-h-screen bg-[#030303] text-white relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.15),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(217,119,6,0.12),transparent_25%),radial-gradient(circle_at_40%_80%,rgba(245,158,11,0.12),transparent_30%)]" />
                <div className="absolute inset-0 opacity-[0.03]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="prod-grid" width="90" height="90" patternUnits="userSpaceOnUse">
                                <path d="M 90 0 L 0 0 0 90" fill="none" stroke="white" strokeWidth="0.6" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#prod-grid)" />
                    </svg>
                </div>
            </div>

            <Navigation />
            <div className="h-16" />

            <div className="max-w-7xl mx-auto px-6 pb-14 relative z-10 space-y-10">
                {/* Header */}
                <div className="flex items-center gap-3 text-white/60">
                    <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="uppercase tracking-[0.3em] text-xs">Productivity System</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-start"
                >
                    {/* Left Column: Intro & Main Cards */}
                    <div className="space-y-6">
                        {/* Hero Card */}
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/0 pointer-events-none" />
                            <div className="flex flex-wrap items-center gap-3 text-amber-200">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-xs uppercase tracking-[0.3em] text-white/60">Execution OS · Productivity</span>
                            </div>
                            <h1 className={`${playfair.className} text-5xl font-bold mt-4 mb-3 text-white`}>
                                Focus. Execute. Review.
                            </h1>
                            <p className={`${inter.className} text-lg text-white/70 max-w-3xl`}>
                                Your command center for getting things done. Manage tasks, build habits, track focus, and review progress.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button asChild className="bg-white text-black hover:bg-white/90">
                                    <Link href="/systems/productivity/tasks?new=1">Capture Task</Link>
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/systems/productivity/pomodoro">
                                        <Timer className="w-4 h-4 mr-2" />
                                        Focus Mode
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Tactical Snapshot */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    Tactical snapshot
                                    <Target className="w-5 h-5 text-white/60" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Next Tasks</p>
                                    <p className="text-2xl font-bold mt-2 text-white">{nextTasks.length}</p>
                                    <p className="text-xs text-white/40 mt-1">Ready to execute</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Habits Today</p>
                                    <p className="text-2xl font-bold mt-2 text-white">{habitsProgress.completed}/{habitsProgress.total}</p>
                                    <p className="text-xs text-white/40 mt-1">Daily completion</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Focus Time</p>
                                    <p className="text-2xl font-bold mt-2 text-white">{pomodoroStats.todayMinutes}m</p>
                                    <p className="text-xs text-white/40 mt-1">{pomodoroStats.todaySessions} sessions</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tasks Card */}
                        <Card className="bg-white/5 border-white/10 overflow-hidden">
                            <CardHeader className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-white/60" />
                                    <CardTitle className="text-white">Active Tasks</CardTitle>
                                </div>
                                <Button asChild variant="ghost" size="sm" className="text-xs uppercase tracking-wider text-white/40 hover:text-white">
                                    <Link href="/systems/productivity/tasks">View All</Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {nextTasks.length > 0 ? (
                                    <div className="space-y-3">
                                        {nextTasks.map((task, i) => (
                                            <div key={task.id} className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-black/30 hover:bg-black/50 transition">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-2 h-2 rounded-full ${task.data['Priority'] === 'High' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                                    <span className="text-white font-medium">{task.data['Task']}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {task.data['Due Date'] && (
                                                        <span className="text-xs text-white/40">{new Date(task.data['Due Date']).toLocaleDateString()}</span>
                                                    )}
                                                    <Button asChild size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity p-0 h-8 w-8">
                                                        <Link href={`/systems/productivity/tasks?id=${task.id}`}><ArrowRight className="w-4 h-4" /></Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-white/40">
                                        <p>No immediate tasks. Clear skies.</p>
                                        <Button asChild variant="link" className="text-amber-400 mt-2">
                                            <Link href="/systems/productivity/tasks?new=1">Create Task</Link>
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Habits & Quick Links */}
                    <div className="space-y-6">
                        {/* Atomic Habits */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-white/60" />
                                    <CardTitle className="text-white">Atomic Habits</CardTitle>
                                </div>
                                <Button asChild variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Link href="/systems/productivity/atomic-habits"><ArrowRight className="w-4 h-4 text-white/40" /></Link>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-sm text-white/40 mb-2">
                                        <span>Daily Progress</span>
                                        <span>{Math.round((habitsProgress.completed / (habitsProgress.total || 1)) * 100)}%</span>
                                    </div>
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden mb-6">
                                        <div
                                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                                            style={{ width: `${(habitsProgress.completed / (habitsProgress.total || 1)) * 100}%` }}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        {habits.slice(0, 4).map(habit => {
                                            const today = new Date().toISOString().split('T')[0]
                                            const dates = habit.data['completedDates']
                                            let completedDates: string[] = []
                                            if (Array.isArray(dates)) completedDates = dates
                                            else if (typeof dates === 'string') {
                                                try { completedDates = JSON.parse(dates) } catch (e) { }
                                            }
                                            const isDone = Array.isArray(completedDates) && completedDates.includes(today)

                                            return (
                                                <div key={habit.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition">
                                                    <span className={`text-sm ${isDone ? 'text-white/40 line-through' : 'text-white'}`}>{habit.data['Habit Name']}</span>
                                                    {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                </div>
                                            )
                                        })}
                                    </div>

                                    <Button asChild className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 mt-2">
                                        <Link href="/systems/productivity/atomic-habits">Track Habits</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Microapps List */}
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex items-center gap-2">
                                <List className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Microapps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {system.microapps.map((microapp) => (
                                    <Link key={microapp.id} href={`/systems/productivity/${microapp.id}`}>
                                        <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20 transition cursor-pointer group">
                                            <div className="text-xl group-hover:scale-110 transition-transform">{microapp.icon}</div>
                                            <div className="flex-1">
                                                <p className="text-white font-medium text-sm">{microapp.name}</p>
                                                <p className="text-white/40 text-xs truncate">{microapp.description}</p>
                                            </div>
                                            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/60" />
                                        </div>
                                    </Link>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Weekly Review Promo */}
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 p-6 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className={`${playfair.className} text-xl text-white font-bold mb-2`}>Weekly Review</h3>
                                <p className="text-indigo-200/70 text-sm mb-4">Clear your mind. Review the past. Plan the future.</p>
                                <Button asChild size="sm" className="bg-indigo-500 hover:bg-indigo-400 text-white border-none">
                                    <Link href="/systems/productivity/review">Start Review</Link>
                                </Button>
                            </div>
                            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
