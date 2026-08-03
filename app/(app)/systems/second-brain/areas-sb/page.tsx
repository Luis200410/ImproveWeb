'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { dataStore, Entry } from '@/lib/data-store'
import { AreaEntry } from '@/components/second-brain/areas/area-utils'
import { AreaCreationSheet } from '@/components/second-brain/areas/area-creation-sheet'
import { AreaBoard } from '@/components/second-brain/areas/area-board'
import { AreaDetailsSidebar } from '@/components/second-brain/areas/area-details-sidebar'
import { Plus } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function AreasDashboard() {
    const [loading, setLoading] = useState(true)
    const [areas, setAreas] = useState<AreaEntry[]>([])
    const [projects, setProjects] = useState<Entry[]>([])
    const [tasks, setTasks] = useState<Entry[]>([])
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)

    const supabase = createClient()

    const loadAreas = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'

        const [areaItems, projectItems, taskItems] = await Promise.all([
            dataStore.getEntries('areas-sb', uid),
            dataStore.getEntries('projects-sb', uid),
            dataStore.getEntries('tasks-sb', uid)
        ])

        // Transform to AreaEntry type
        const typedAreas = areaItems.map(item => ({
            ...item,
            data: item.data as any
        })) as AreaEntry[]

        setAreas(typedAreas)
        setProjects(projectItems)
        setTasks(taskItems)
        setLoading(false)
    }

    useEffect(() => {
        loadAreas()
    }, [])

    const handleUpdateArea = async (area: AreaEntry, updates: any) => {
        const updatedArea = { ...area, data: { ...area.data, ...updates } }

        // Optimistic UI
        setAreas(areas.map(a => a.id === area.id ? updatedArea : a))

        // DB Update
        await dataStore.updateEntry(area.id, updatedArea.data)
    }

    const handleDeleteArea = async (areaId: string) => {
        setAreas(prev => prev.filter(a => a.id !== areaId))
        setSelectedAreaId(null)
        await dataStore.deleteEntry(areaId)
    }

    const handleDeleteProject = async (projectId: string) => {
        setProjects(prev => prev.filter(p => p.id !== projectId))
        await dataStore.deleteEntry(projectId)
    }

    const handleDeleteTask = async (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId))
        await dataStore.deleteEntry(taskId)
    }

    const [searchQuery, setSearchQuery] = useState('')

    const filteredAreas = areas.filter(a => {
        const title = (a.data.title || '').toLowerCase()
        const goal = (a.data.goal || '').toLowerCase()
        return title.includes(searchQuery.toLowerCase()) || goal.includes(searchQuery.toLowerCase())
    })

    const selectedArea = areas.find(a => a.id === selectedAreaId)

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 pb-32">
            {/* Top Bar / HUD */}
            <div className="flex justify-between items-center mb-12 border-b border-white/5 pb-8">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                        <h1 className="text-sm font-bold tracking-[0.4em] text-white uppercase">Neural Domain Map</h1>
                    </div>

                    <div className="h-4 w-[1px] bg-white/10" />

                    <div className="flex items-center gap-4">
                        <AreaCreationSheet onAreaCreated={loadAreas} />
                    </div>
                </div>

                {/* Right Side: Search / Look up */}
                <div className="flex items-center gap-4">
                    <div className="relative group/search max-w-[250px]">
                        <input 
                            type="text" 
                            placeholder="LOOK_UP_DOMAIN..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-[#0A0A0A] border border-white/10 rounded-lg px-4 py-2 text-[10px] font-mono text-white/70 focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-white/10 w-56"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono pointer-events-none group-focus-within/search:text-purple-500/50 transition-colors uppercase">
                            CMD_K
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full min-w-0">
                {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4 text-white/20">
                        <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em]">Synchronizing Domains...</span>
                    </div>
                ) : (
                    <AreaBoard
                        areas={filteredAreas}
                        onUpdateArea={handleUpdateArea}
                        onAreaClick={setSelectedAreaId}
                        projects={projects}
                        tasks={tasks}
                    />
                )}
            </div>

            {/* Sidebar for Details */}
            <AreaDetailsSidebar
                area={selectedArea || null}
                onClose={() => setSelectedAreaId(null)}
                onUpdate={handleUpdateArea}
                onDelete={handleDeleteArea}
                onDeleteProject={handleDeleteProject}
                onDeleteTask={handleDeleteTask}
                onUpdateTask={async (task, updates) => {
                    const updatedTask = { ...task, data: { ...task.data, ...updates } }
                    setTasks(prev => prev.map(t => t.id === task.id ? updatedTask : t))
                    await dataStore.updateEntry(task.id, updatedTask.data)
                }}
                onUpdateProject={async (project, updates) => {
                    const updatedProject = { ...project, data: { ...project.data, ...updates } }
                    setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p))
                    await dataStore.updateEntry(project.id, updatedProject.data)
                }}
                projects={projects}
                tasks={tasks}
            />
        </div>
    )
}
