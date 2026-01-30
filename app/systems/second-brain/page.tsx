'use client'

import { ReactNode, useEffect, useState, useMemo } from 'react'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry, System } from '@/lib/data-store'
import { StatsSidebar } from '@/components/second-brain/stats-sidebar'
import { KnowledgeHub } from '@/components/second-brain/knowledge-hub'
import { ActiveTaskStream } from '@/components/second-brain/active-task-stream'
import { ArchitectureNodes } from '@/components/second-brain/architecture-nodes'
import { Navigation } from '@/components/navigation'
import { RefreshCw, PanelLeftClose, PanelLeftOpen } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function SecondBrainPage() {
    const [system, setSystem] = useState<System | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser')
    const [allTasks, setAllTasks] = useState<Entry[]>([])
    const [todayTasks, setTodayTasks] = useState<Entry[]>([])
    const [statsVisible, setStatsVisible] = useState(true)
    const [counts, setCounts] = useState({ projects: 0, tasks: 0, notes: 0 })

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
        setAllTasks(tasksRaw)
        const today = new Date().toISOString().split('T')[0]
        const relevant = tasksRaw.filter(t => !t.data['Status'] || t.data['Status'] === false || t.data['Start Date']?.startsWith(today))
        setTodayTasks(relevant)

        // Counts for Architecture Nodes
        const projects = await dataStore.getEntries('projects-sb', userId)
        const notes = await dataStore.getEntries('notes-sb', userId)
        setCounts({
            projects: projects.length,
            tasks: tasksRaw.length,
            notes: notes.length
        })
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

                {/* Top Row: [Stats (Toggle)] [Hub] [Architecture Nodes] */}
                <div className="flex flex-col lg:flex-row gap-8 items-stretch h-[600px]">

                    {/* Toggle Button for Stats */}
                    <button
                        onClick={() => setStatsVisible(!statsVisible)}
                        className="fixed left-6 top-24 z-50 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                        title="Toggle Stats"
                    >
                        {statsVisible ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </button>

                    {/* Stats Sidebar (Collapsible) */}
                    <AnimatePresence mode="wait">
                        {statsVisible && (
                            <motion.div
                                initial={{ width: 0, opacity: 0, x: -50 }}
                                animate={{ width: 320, opacity: 1, x: 0 }}
                                exit={{ width: 0, opacity: 0, x: -50 }}
                                className="overflow-hidden shrink-0"
                            >
                                <div className="w-[320px] pt-12"> {/* pt-12 to clear toggle button */}
                                    <StatsSidebar />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
                            <KnowledgeHub />
                        </div>

                        <div className="absolute bottom-6 w-full px-8 flex justify-between items-center text-[10px] uppercase tracking-widest text-white/30 font-mono">
                            <div>Active Links: <span className="text-white">482</span></div>
                            <div>Cluster Density: <span className="text-white">0.74</span></div>
                        </div>
                    </motion.div>

                    {/* Architecture Nodes (Right Side) */}
                    <div className="w-full lg:w-[280px] shrink-0 pt-4">
                        <ArchitectureNodes counts={counts} />
                    </div>
                </div>

                {/* Bottom Row: Active Task Stream */}
                <div className="w-full">
                    <ActiveTaskStream
                        tasks={todayTasks}
                        onToggleStatus={handleToggleStatus}
                        onUpdateLane={handleUpdateLane}
                    />
                </div>

            </div>
        </div>
    )
}
