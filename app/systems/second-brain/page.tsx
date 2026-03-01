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
import { Navigation } from '@/components/navigation'
import { HabitTimeline } from '@/components/habit-timeline'
import { RefreshCw } from 'lucide-react'
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

        createClient().auth.getUser().then(({ data: { user } }) => {
            setUserId(user?.id || 'defaultUser')
        })
    }, [])

    // Load Data
    const loadData = async () => {
        if (!userId) return

        // Tasks
        const tasksRaw = await dataStore.getEntries('tasks-sb', userId)
        // Legacy 'tasks' removed
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
    }

    useEffect(() => {
        if (userId !== 'defaultUser') {
            loadData()
        }
    }, [userId])

    const handleToggleStatus = async (task: Entry) => {
        const updated = { ...task.data, Status: !task.data['Status'] }
        await dataStore.updateEntry(task.id, updated)
        loadData()
    }

    const handleUpdateLane = async (task: Entry, lane: string) => {
        const updated = { ...task.data, Lane: lane }
        await dataStore.updateEntry(task.id, updated)
        loadData()
    }

    if (!system) return null

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-amber-500/30 font-sans overflow-x-hidden">
            <Navigation />

            {/* Main Content Area */}
            <div className="max-w-[1600px] mx-auto p-6 pt-24 min-h-screen flex flex-col gap-8">

                {/* Top Row: Stats (Horizontal) */}
                <div className="w-full">
                    <StatsHeader
                        taskMetrics={taskMetrics}
                        projectMetrics={projectMetrics}
                        productivity={productivityScore}
                    />
                </div>

                {/* Middle Row: [Hub] */}
                <div className="flex flex-col lg:flex-row gap-8 items-stretch min-h-[600px] lg:h-[600px] h-auto">
                    {/* Central Hub (Full Center) */}
                    <motion.div
                        layout
                        className="flex-1 rounded-[3rem] bg-[#0A0A0A] border border-white/5 relative overflow-hidden flex flex-col items-center justify-center min-w-[300px]"
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
