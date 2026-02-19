
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
import { AreasList } from '@/components/second-brain/projects/areas-list'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<ProjectEntry[]>([])
    const [areas, setAreas] = useState<Entry[]>([]) // Areas state
    const [tasks, setTasks] = useState<Entry[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser') // Add userId state
    const [stats, setStats] = useState<ProjectStats | null>(null)
    const [showGlobalConstraints, setShowGlobalConstraints] = useState(false)

    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

    const loadProjects = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const uid = user?.id || 'defaultUser'
            setUserId(uid)

            const [projectsData, tasksSbData, tasksLegacyData, areasData] = await Promise.all([
                dataStore.getEntries('projects-sb', uid),
                dataStore.getEntries('tasks-sb', uid), // Fetch tasks-sb
                dataStore.getEntries('tasks', uid),    // Fetch legacy tasks
                dataStore.getEntries('areas-sb', uid) // Fetch Areas
            ])

            // Filter tasks that belong to the 'tasks-sb' microapp or legacy 'tasks'
            const allTasks = [...tasksSbData, ...tasksLegacyData]

            const projects = projectsData.map(p => ({
                ...p,
                data: {
                    ...p.data,
                    // Sanitize Area: if it's the string "unassigned", treat it as undefined
                    Area: p.data.Area === 'unassigned' ? undefined : p.data.Area,
                    subtasks: allTasks.filter(t => t.data.Project === p.id || t.data.projectId === p.id)
                }
            })) as ProjectEntry[]

            const sorted = sortProjects(projects)

            setProjects(sorted)
            setTasks(allTasks) // Set the tasks state
            setAreas(areasData)

            // Default to first area if configured
            if (areasData.length > 0 && !selectedAreaId) {
                setSelectedAreaId(areasData[0].id)
            }

            setStats(calculateProjectStats(sorted))
        } catch (error) {
            console.error('Failed to load project data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProject = async (project: ProjectEntry, updates: Partial<ProjectEntry['data']>) => {
        const updatedProject = { ...project, data: { ...project.data, ...updates } }
        const newProjects = projects.map(p => p.id === project.id ? updatedProject : p)
        setProjects(newProjects)
        setStats(calculateProjectStats(newProjects))

        await dataStore.updateEntry(project.id, updatedProject.data)
    }

    const handleCreateTask = async (taskData: any) => {
        // Save to tasks-sb
        await dataStore.addEntry(userId, 'tasks-sb', taskData.data)
        loadProjects() // Refresh to linkage
    }

    const handleUpdateTask = async (task: Entry, updates: Partial<Entry['data']>) => {
        // Optimistic update
        const updatedTask = { ...task, data: { ...task.data, ...updates } }
        setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t))

        // Update projects state to reflect task changes in subtasks if needed
        // (This might be expensive to re-map all projects, but accurate)
        setProjects(prev => prev.map(p => ({
            ...p,
            data: {
                ...p.data,
                subtasks: p.data.subtasks.map(t => t.id === task.id ? updatedTask : t) as any
            }
        })))

        await dataStore.updateEntry(task.id, updates)
    }

    useEffect(() => {
        loadProjects()
    }, [])

    const selectedProject = projects.find(p => p.id === selectedId)
    const constraints = projects.filter(p => p.data.ragStatus === 'Red' || p.data.blockedBy)

    // Filter projects by selected Area
    // If selectedAreaId is 'unassigned', show projects with no area
    const filteredProjects = selectedAreaId === 'unassigned'
        ? projects.filter(p => !p.data.Area || p.data.Area === 'unassigned') // Double safety
        : projects.filter(p => p.data.Area === selectedAreaId)

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-32">

            {/* Top Bar / HUD */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-white/10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <Activity className="w-4 h-4" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Activity Control</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <h1 className={`${playfair.className} text-3xl text-white`}>Project Neural Net</h1>
                        <span className="text-xs font-mono text-white/30">v5.0.2</span>
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
                    <ProjectCreationSheet
                        onProjectCreated={loadProjects}
                        areas={areas}
                        defaultAreaId={selectedAreaId || undefined}
                    />
                </div>
            </div>

            {/* Area Tabs */}
            <AreasList
                areas={areas}
                selectedAreaId={selectedAreaId}
                onSelectArea={setSelectedAreaId}
                onReorderAreas={(newAreas) => setAreas(newAreas)}
            />



            {/* Main Content Area - Full Width */}
            <div className="flex-1 w-full min-w-0 h-[calc(100vh-250px)]">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-white/20">Loading Neural Lattice...</div>
                ) : (
                    <ProjectBoard
                        projects={filteredProjects}
                        onUpdateProject={handleUpdateProject}
                        onProjectClick={setSelectedId}
                        tasks={tasks}
                    />
                )}
            </div>

            {/* Sidebar for Details */}
            <ProjectDetailsSidebar
                project={selectedProject || null}
                onClose={() => setSelectedId(null)}
                onUpdate={handleUpdateProject}
                linkedTasks={tasks.filter(t => t.data.Project === selectedId || t.data.projectId === selectedId)}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                areas={areas}
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
