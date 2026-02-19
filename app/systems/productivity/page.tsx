'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { dataStore, Entry, System } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, Clock, Calendar, Zap, Target, List, ArrowRight, Timer, Play, CheckCircle2 } from 'lucide-react'

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

            if (user?.id) {
                // AUTO-MIGRATION & CLEANUP LOGIC
                // Check if 'tasks' exists in Productivity
                const prod = dataStore.getSystem('productivity')
                const hasLegacyTasksApp = prod?.microapps.some(m => m.id === 'tasks')
                const legacyTasks = await dataStore.getEntries('tasks', user.id)

                if (hasLegacyTasksApp || legacyTasks.length > 0) {
                    console.log('Legacy tasks configuration detected. Starting auto-cleanup...')

                    // 1. Migrate Data if needed
                    if (legacyTasks.length > 0) {
                        const sbTasks = await dataStore.getEntries('tasks-sb', user.id)
                        const sbProjects = await dataStore.getEntries('projects-sb', user.id)

                        for (const task of legacyTasks) {
                            const title = task.data['Title'] || task.data['Task Name'] || task.data['Task'] || 'Untitled Task';
                            const legacyProjectName = task.data['Project'] || task.data['Project Name'] || task.data['Goal'];

                            // Find matching SB Project ID
                            let targetProjectId = null;
                            if (legacyProjectName) {
                                const match = sbProjects.find(p => p.data['Title'] === legacyProjectName || p.id === legacyProjectName);
                                if (match) targetProjectId = match.id;
                            }

                            const existingTask = sbTasks.find(sb => sb.data['Task'] === title);

                            if (!existingTask) {
                                await dataStore.addEntry(user.id, 'tasks-sb', {
                                    'Task': title,
                                    'Status': (task.data['Status']?.toLowerCase().includes('done') || task.data['Status']?.toLowerCase().includes('complete')) ? 'Done' : 'Pending',
                                    'Start Date': task.data['Due Date'] || new Date().toISOString(),
                                    'Priority': task.data['Priority'] || 'Medium',
                                    'Notes': task.data['Notes'] || '',
                                    'Assignee': 'Me',
                                    'Project': targetProjectId // Link to project
                                })
                            } else if (targetProjectId && !existingTask.data['Project']) {
                                // Repair: Link existing task to project if missing
                                await dataStore.updateEntry(existingTask.id, { 'Project': targetProjectId })
                            }
                            // Delete legacy entry to prevent re-migration
                            // await dataStore.deleteEntry(task.id) // Optional: Keep data but hide app
                        }
                    }

                    // 2. Remove 'tasks' microapp from System Config
                    // We can just hit resetSystems() to enforce code defaults which we know are correct (no 'tasks' in productivity)
                    dataStore.resetSystems()

                    // Reload local state
                    const updatedSystem = dataStore.getSystem('productivity')
                    setSystem(updatedSystem || null)
                    console.log('Auto-cleanup complete. Systems reset.')
                }
            }
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

    const habits = entries['atomic-habits'] || []

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
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.05] via-black to-black" />
                <div className="absolute -left-24 top-10 w-[700px] h-[700px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_45%)] blur-3xl" />
                <div className="absolute right-[-180px] top-28 w-[620px] h-[620px] bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,0.08),transparent_40%)] blur-3xl" />
                <div className="absolute inset-0 opacity-[0.04]">
                    <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:34px_34px]" />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-14 relative z-10 space-y-10">


                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-start"
                >
                    {/* Left Column: Intro & Main Cards */}
                    <div className="space-y-6">
                        {/* Hero Card */}
                        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/[0.07] via-black to-black shadow-[0_25px_80px_rgba(0,0,0,0.55)] p-8">
                            <div className="absolute inset-0 opacity-[0.07]">
                                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.4)_1px,transparent_1px)] bg-[size:36px_36px]" />
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-amber-100 relative z-10">
                                <Zap className="w-5 h-5" />
                                <span className="text-xs uppercase tracking-[0.32em] text-white/70">Execution OS · Productivity</span>
                            </div>
                            <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold mt-4 mb-3 text-white relative z-10`}>
                                Focus. Execute. Review.
                            </h1>
                            <p className={`${inter.className} text-lg text-white/75 max-w-3xl relative z-10`}>
                                Your command center for getting things done. Manage tasks, build habits, track focus, and review progress.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                                <Button asChild className="bg-white text-black hover:bg-white/90">
                                    <Link href="/systems/productivity/tasks?new=1">Capture Task</Link>
                                </Button>
                                <Button variant="outline" asChild className="border-white/40 text-white hover:bg-white/10">
                                    <Link href="/systems/productivity/pomodoro">
                                        <Timer className="w-4 h-4 mr-2" />
                                        Focus Mode
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {/* Habits Snapshot */}
                        <Card className="bg-white/[0.05] border-white/10 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-amber-500" />
                                    Daily Snapshot
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.06] to-black">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Habits Today</p>
                                    <p className="text-3xl font-bold mt-2 text-white">{habitsProgress.completed}/{habitsProgress.total}</p>
                                    <p className="text-xs text-white/50 mt-1">Daily completion</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-white/15 bg-gradient-to-br from-white/[0.05] to-black">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Focus Time</p>
                                    <p className="text-3xl font-bold mt-2 text-white">{pomodoroStats.todayMinutes}m</p>
                                    <p className="text-xs text-white/50 mt-1">{pomodoroStats.todaySessions} sessions</p>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    {/* Right Column: Habits & Quick Links */}
                    <div className="space-y-6">
                        {/* Atomic Habits */}
                        <Card className="bg-white/[0.05] border-white/12 backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
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
                        <Card className="bg-white/[0.05] border-white/12 backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
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
                        <div className="rounded-2xl bg-gradient-to-br from-white/[0.08] to-black border border-white/15 p-6 relative overflow-hidden group shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
                            <div className="relative z-10">
                                <h3 className={`${playfair.className} text-xl text-white font-bold mb-2`}>Weekly Review</h3>
                                <p className="text-white/65 text-sm mb-4">Clear your mind. Review the past. Plan the future.</p>
                                <Button asChild size="sm" className="bg-white text-black hover:bg-white/90 border-none">
                                    <Link href="/systems/productivity/review">Start Review</Link>
                                </Button>
                            </div>
                            <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
