
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
import { AreaFilterDropdown } from '@/components/second-brain/projects/area-filter-dropdown'

import { ProjectsDashboard } from '@/components/projects-dashboard'

const playfair = Playfair_Display({ subsets: ['latin'] })
export default function ProjectsPage() {
    const [projects, setProjects] = useState<ProjectEntry[]>([])
    const [areas, setAreas] = useState<Entry[]>([]) // Areas state
    const [tasks, setTasks] = useState<Entry[]>([])
    const [habits, setHabits] = useState<Entry[]>([]) // Habits state
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser') // Add userId state
    const [stats, setStats] = useState<ProjectStats | null>(null)
    const [showGlobalConstraints, setShowGlobalConstraints] = useState(false)
    const [isCreationSheetOpen, setIsCreationSheetOpen] = useState(false)
    const [defaultStatusForCreation, setDefaultStatusForCreation] = useState<string | undefined>(undefined)

    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

    const loadProjects = async () => {
        setLoading(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const uid = user?.id || 'defaultUser'
            setUserId(uid)

            const [projectsData, tasksSbData, areasData, habitsData] = await Promise.all([
                dataStore.getEntries('projects-sb', uid),
                dataStore.getEntries('tasks-sb', uid), // Fetch tasks-sb
                dataStore.getEntries('areas-sb', uid), // Fetch Areas
                dataStore.getEntries('atomic-habits', uid) // Fetch Habits
            ])

            // Filter tasks that belong to the 'tasks-sb' microapp
            const allTasks = [...tasksSbData]

            const projects = projectsData.map(p => ({
                ...p,
                data: {
                    ...(p.data as any),
                    // Sanitize Area: if it's the string "unassigned", treat it as undefined
                    Area: p.data.Area === 'unassigned' ? undefined : p.data.Area,
                    Habit: p.data.Habit === 'unassigned' ? undefined : p.data.Habit,
                    subtasks: allTasks.filter(t => t.data.Project === p.id || t.data.projectId === p.id)
                }
            })) as unknown as ProjectEntry[]

            const sorted = sortProjects(projects)

            setProjects(sorted)
            setTasks(allTasks) // Set the tasks state
            setAreas(areasData)
            setHabits(habitsData)

            // Default to first area if configured
            if (areasData.length > 0 && !selectedAreaId) {
                setSelectedAreaId(areasData[0].id)
            }

            setStats(calculateProjectStats(sorted, allTasks))
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
        setStats(calculateProjectStats(newProjects, tasks))

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
        setProjects(prev => prev.map(p => ({
            ...p,
            data: {
                ...p.data,
                subtasks: p.data.subtasks.map(t => t.id === task.id ? updatedTask : t) as any
            }
        })))

        await dataStore.updateEntry(task.id, updates)
    }

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        setProjects(prev => prev.map(p => ({
            ...p,
            data: {
                ...p.data,
                subtasks: p.data.subtasks.filter(t => t.id !== taskId) as any
            }
        })))
    }

    const handleDeleteProject = (projectId: string) => {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        if (selectedId === projectId) setSelectedId(null)
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const id = params.get('selectedId')
        if (id) {
            setSelectedId(id)
        }
        loadProjects()
    }, [])

    const selectedProject = projects.find(p => p.id === selectedId)
    const constraints = projects.filter(p => p.data.ragStatus === 'Red' || p.data.blockedBy)

    // Filter projects by selected Area and only show non-archived ones in the main view
    const filteredProjects = (!selectedAreaId || selectedAreaId === 'unassigned')
        ? projects.filter(p => (!p.data.Area || p.data.Area === 'unassigned' || p.data.Area === '') && !(p.data as any).archived)
        : projects.filter(p => p.data.Area === selectedAreaId && !(p.data as any).archived)

    // Calculate archived count for the current area
    const archivedCount = projects.filter(p => {
        const matchesArea = (!selectedAreaId || selectedAreaId === 'unassigned')
            ? (!p.data.Area || p.data.Area === 'unassigned' || p.data.Area === '')
            : p.data.Area === selectedAreaId
        return matchesArea && (p.data as any).archived
    }).length

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-32">

            {/* Top Bar / HUD */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-8 border-b border-white/5 relative">
                {/* Decorative scanning line */}
                <div className="absolute bottom-0 left-0 w-32 h-[1px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-emerald-500/60 mb-3">
                        <Activity className="w-3 h-3 animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.4em] font-mono font-bold">Activity Control</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <h1 className={`${playfair.className} text-5xl text-white tracking-widest uppercase`}>Project Neural Net</h1>
                        <div className="flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded border border-white/10">
                            <span className="text-[10px] font-mono text-emerald-500/80 font-bold tracking-widest">v5.0.2</span>
                        </div>
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
                            <div className="text-amber-500 font-bold text-lg leading-none">{archivedCount}</div>
                            <div className="tracking-wider">ARCHIVED</div>
                        </div>
                        <div className="text-center">
                            <div className="text-blue-500 font-bold text-lg leading-none">{stats?.overallProgress || 0}%</div>
                            <div className="tracking-wider">LATTICE COMPLETION</div>
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
                        open={isCreationSheetOpen}
                        onOpenChange={setIsCreationSheetOpen}
                        onProjectCreated={(id) => {
                            setIsCreationSheetOpen(false)
                            loadProjects().then(() => {
                                if (id) setSelectedId(id)
                            })
                        }}
                        areas={areas}
                        defaultAreaId={selectedAreaId || undefined}
                        defaultStatus={defaultStatusForCreation}
                    />
                </div>
            </div>

            {/* Area Filter Dropdown */}
            <div className="mb-8 flex items-center gap-4">
                <AreaFilterDropdown
                    areas={areas}
                    selectedAreaId={selectedAreaId}
                    onSelectArea={setSelectedAreaId}
                />
                <div className="h-[1px] flex-1 bg-white/5" />
            </div>



            {/* Main Content Area - Full Width */}
            <div className="flex-1 w-full min-w-0">
                {loading ? (
                    <div className="h-full flex items-center justify-center text-white/20">Loading Neural Lattice...</div>
                ) : (
                    <div className="py-8">
                        <ProjectsDashboard
                            projects={filteredProjects as any}
                            tasks={tasks}
                            areas={areas}
                            statusOptions={['Inbox', 'Active', 'Done']}
                            onUpdateProject={async (id: string, updates: any) => {
                                const project = projects.find(p => p.id === id)
                                if (project) handleUpdateProject(project, updates)
                            }}
                            onEditProject={(project: Entry) => setSelectedId(project.id)}
                            onCreateProject={(status?: string) => { 
                                setDefaultStatusForCreation(status?.toLowerCase())
                                setIsCreationSheetOpen(true)
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Sidebar for Details */}
            <ProjectDetailsSidebar
                project={selectedProject || null}
                onClose={() => setSelectedId(null)}
                onUpdate={handleUpdateProject}
                onDelete={handleDeleteProject}
                linkedTasks={tasks.filter(t => t.data.Project === selectedId || t.data.projectId === selectedId)}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteLinkedTask={handleDeleteTask}
                areas={areas}
                habits={habits}
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
