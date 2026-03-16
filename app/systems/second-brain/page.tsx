'use client'

import { ReactNode, useEffect, useState, useMemo } from 'react'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry, System } from '@/lib/data-store'
import { StatsHeader } from '@/components/second-brain/stats-header'
import { KnowledgeHub } from '@/components/second-brain/knowledge-hub'
import { ActiveTaskStream } from '@/components/second-brain/active-task-stream'
import { ArchitectureNodes } from '@/components/second-brain/architecture-nodes'
import { HabitTimeline } from '@/components/habit-timeline'
import { ArrowLeft, Brain, Cpu, Sparkles, RefreshCw, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { calculateTaskMetrics, calculateProjectMetrics, calculateProductivityScore, TaskMetrics, ProjectMetrics, ProductivityScore } from '@/components/second-brain/analytics-utils'
import { getTaskDeadline } from '@/components/second-brain/utils'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function SecondBrainPage() {
    const [system, setSystem] = useState<System | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser')
    const [allTasks, setAllTasks] = useState<Entry[]>([])
    const [todayTasks, setTodayTasks] = useState<Entry[]>([])
    const [allHabits, setAllHabits] = useState<Entry[]>([])
    const [allProjects, setAllProjects] = useState<Entry[]>([])
    const [timelineView, setTimelineView] = useState<'day' | 'week' | 'list' | 'overview'>('day')
    const [counts, setCounts] = useState({ projects: 0, tasks: 0, notes: 0 })

    // Analytics State
    const [taskMetrics, setTaskMetrics] = useState<TaskMetrics>()
    const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics>()
    const [productivityScore, setProductivityScore] = useState<ProductivityScore>()

    // Load System & User
    useEffect(() => {
        const s = dataStore.getSystem('second-brain')
        setSystem(s || null)

        import('@/lib/debug-microapps').then(m => m.checkMicroapps())

        createClient().auth.getUser().then(({ data: { user }, error }) => {
            if (error) console.error('DEBUG: SecondBrain auth error:', error);
            const id = user?.id || 'defaultUser';
            console.log('DEBUG: SecondBrain resolved userId:', id);
            setUserId(id);
        })
    }, [])

    // Load Data
    const loadData = async () => {
        if (!userId || userId === 'defaultUser') return
        
        try {
            // Tasks
            const tasksRaw = await dataStore.getEntries('tasks-sb', userId)
            const combinedTasks = [...tasksRaw]
            setAllTasks(combinedTasks)

            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const todayLocal = `${year}-${month}-${day}`;

            const relevant = combinedTasks.filter(t => {
                const isNotDone = !t.data['Status'] || t.data['Status'] === false;
                const deadline = getTaskDeadline(t);
                const isToday = deadline?.startsWith(todayLocal);
                return isNotDone && isToday;
            })
            setTodayTasks(relevant)

            // Projects & Notes for Counts & Analytics
            const projects = await dataStore.getEntries('projects-sb', userId)
            setAllProjects(projects)
            const notes = await dataStore.getEntries('notes-sb', userId)
            const habits = await dataStore.getEntries('atomic-habits', userId)
            setAllHabits(habits)

            setCounts({
                projects: projects.length,
                tasks: combinedTasks.length,
                notes: notes.length
            })

            // Calculate Analytics
            const tMetrics = calculateTaskMetrics(combinedTasks, 'all')
            setTaskMetrics(tMetrics)

            const pMetrics = calculateProjectMetrics(projects)
            setProjectMetrics(pMetrics)

            const pScore = calculateProductivityScore(tMetrics, pMetrics)
            setProductivityScore(pScore)
        } catch (err) {
            console.error('ERROR: SecondBrain loadData failed:', err);
        }
    }

    useEffect(() => {
        if (userId !== 'defaultUser') {
            loadData()
        }
    }, [userId])

    const handleToggleStatus = async (task: Entry) => {
        const newStatus = !task.data['Status']
        await dataStore.updateEntry(task.id, { ...task.data, Status: newStatus })
        loadData()
    }

    const handleUpdateLane = async (task: Entry, newLane: string) => {
        await dataStore.updateEntry(task.id, { ...task.data, Lane: newLane })
        loadData()
    }

    if (!system) return null

    return (
        <div className={`min-h-screen bg-black text-white ${inter.className} selection:bg-amber-500/30`}>
            {/* Background elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-amber-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-amber-500/3 rounded-full blur-[100px]" />
            </div>




            <div className="max-w-[1600px] mx-auto px-6 py-12 relative">
                {/* Breadcrumb */}
                <div className="flex items-center gap-3 text-white/60 mb-12">
                    <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="uppercase tracking-[0.3em] text-xs">Second Brain</span>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl">
                                {system.icon}
                            </div>
                            <div>
                                <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold tracking-tight text-white`}>
                                    {system.name}
                                </h1>
                                <p className="text-white/40 text-xs md:text-sm uppercase tracking-[0.3em] font-light mt-1">
                                    Strategic Cognitive Architecture
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <motion.button
                            whileHover={{ rotate: 180 }}
                            transition={{ duration: 0.5 }}
                            onClick={() => loadData()}
                            className="p-3 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </motion.button>
                        <StatsHeader 
                            productivity={productivityScore} 
                            taskMetrics={taskMetrics} 
                            projectMetrics={projectMetrics} 
                        />
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                    {/* Left & Middle Column (Architecture & Graph) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-12 relative bg-white/[0.02] border border-white/5 rounded-3xl overflow-hidden min-h-[500px] flex items-center justify-center p-8 group"
                    >
                        <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-xs font-mono uppercase tracking-widest text-white/50">Core Map</span>
                        </div>

                        <div className="scale-75 md:scale-90 lg:scale-100 transition-transform">
                            <KnowledgeHub
                                counts={counts}
                                taskMetrics={taskMetrics}
                                projectMetrics={projectMetrics}
                                productivity={productivityScore}
                            />
                        </div>


                    </motion.div>
                </div>

                {/* Bottom Row: Habit Timeline & Active Task Stream */}
                <div className="flex flex-col xl:flex-row gap-8 w-full">
                    <div className="w-full xl:w-2/3">
                        <HabitTimeline
                            entries={allHabits}
                            linkedProjects={allProjects}
                            systemFilter="second-brain"
                            viewMode={timelineView}
                            onChangeViewMode={setTimelineView}
                            onToggleStatus={async (entry) => {
                                await dataStore.updateEntry(entry.id, entry.data)
                                loadData()
                            }}
                            onEdit={() => { }} // Not fully editing habits from dashboard yet
                        />
                    </div>
                    <div className="w-full xl:w-1/3">
                        <ActiveTaskStream
                            tasks={todayTasks}
                            onToggleStatus={handleToggleStatus}
                            onUpdateLane={handleUpdateLane}
                        />
                    </div>
                </div>

            </div>
        </div>
    )
}
