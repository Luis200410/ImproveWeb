
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Activity, LayoutGrid, ListFilter, AlertTriangle, Cpu, Lock, AlertOctagon } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { ProjectCard } from '@/components/second-brain/projects/project-card'
import { ProjectBoard } from '@/components/second-brain/projects/project-board'
import { ProjectCreationSheet } from '@/components/second-brain/projects/project-creation-sheet'
import { ProjectDetailsSidebar } from '@/components/second-brain/projects/project-details-sidebar'
import { GlobalConstraintsSheet } from '@/components/second-brain/projects/global-constraints-sheet'
import { ProjectEntry, sortProjects, calculateProjectStats, ProjectStats } from '@/components/second-brain/projects/project-utils'
import { Entry } from '@/lib/data-store'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<ProjectEntry[]>([])
    const [tasks, setTasks] = useState<Entry[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser') // Add userId state
    const [stats, setStats] = useState<ProjectStats | null>(null)
    const [showGlobalConstraints, setShowGlobalConstraints] = useState(false)

    const loadProjects = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'
        setUserId(uid)

        const [items, taskItems] = await Promise.all([
            dataStore.getEntries('projects-sb'),
            dataStore.getEntries('tasks')
        ])

        const sorted = sortProjects(items as unknown as ProjectEntry[])

        setProjects(sorted)
        setTasks(taskItems)
        setStats(calculateProjectStats(sorted))
        setLoading(false)
    }

    const handleUpdateProject = async (project: ProjectEntry, updates: Partial<ProjectEntry['data']>) => {
        const updatedProject = { ...project, data: { ...project.data, ...updates } }
        const newProjects = projects.map(p => p.id === project.id ? updatedProject : p)
        setProjects(newProjects)
        setStats(calculateProjectStats(newProjects))

        // Persist to Supabase
        await dataStore.updateEntry(project.id, updatedProject.data)
    }


    const handleCreateTask = async (taskData: any) => {
        await dataStore.addEntry(userId, 'tasks', taskData.data)
        loadProjects()
    }

    useEffect(() => {
        loadProjects()
    }, [])

    const selectedProject = projects.find(p => p.id === selectedId)
    const constraints = projects.filter(p => p.data.ragStatus === 'Red' || p.data.blockedBy)

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-32">

            {/* Top Bar / HUD */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-white/10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Activity Control</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <h1 className={`${playfair.className} text-3xl text-white`}>Project Neural Net</h1>
                        <span className="text-xs font-mono text-white/30">v5.0.1</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex gap-6 text-[10px] font-mono text-white/40 border-r border-white/10 pr-6 mr-2">
                        <div className="text-center">
                            <div className="text-white font-bold text-lg leading-none">{stats?.activeCount || 0}</div>
                            <div className="tracking-wider">ACTIVE</div>
                        </div>
                        <div className="text-center">
                            <div className="text-emerald-500 font-bold text-lg leading-none">{stats?.completedCount || 0}</div>
                            <div className="tracking-wider">COMPLETED</div>
                        </div>
                        <div className="text-center">
                            <div className="text-amber-500 font-bold text-lg leading-none">{stats?.ragDistribution.Red || 0}</div>
                            <div className="tracking-wider">CRITICAL</div>
                        </div>
                        <div className="text-center">
                            <div className="text-blue-500 font-bold text-lg leading-none">{stats?.overallProgress || 0}%</div>
                            <div className="tracking-wider">VELOCITY</div>
                        </div>
                        {/* Global Constraint Toggle */}
                        <div
                            className="text-center cursor-pointer hover:opacity-100 opacity-50 transition-opacity"
                            onClick={() => setShowGlobalConstraints(true)}
                        >
                            <div className="text-amber-500 font-bold text-lg leading-none flex justify-center"><AlertTriangle className="w-5 h-5" /></div>
                            <div className="tracking-wider text-amber-500/50">ALERTS</div>
                        </div>
                    </div>
                    <ProjectCreationSheet onProjectCreated={loadProjects} />
                </div>
            </div>

            {/* Main Content Area - Full Width */}
            <div className="flex-1 w-full min-w-0 h-[calc(100vh-200px)]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-white/20">Loading Neural Lattice...</div>
                ) : (
                    <ProjectBoard
                        projects={projects}
                        onUpdateProject={handleUpdateProject}
                        onProjectClick={setSelectedId}
                        tasks={tasks}
                    />
                )}
            </div>

            {/* Sheets (Overlays) */}
            <ProjectDetailsSidebar
                project={selectedProject || null}
                onClose={() => setSelectedId(null)}
                onUpdate={handleUpdateProject}
                linkedTasks={tasks.filter(t => t.data.projectId === selectedProject?.id || t.data.Project === selectedProject?.id)}
                onCreateTask={handleCreateTask}
            />

            <GlobalConstraintsSheet
                open={showGlobalConstraints}
                onOpenChange={setShowGlobalConstraints}
                constraints={constraints}
                onSelectProject={setSelectedId}
            />
        </div>
    )
}
