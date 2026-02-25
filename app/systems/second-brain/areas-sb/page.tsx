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

    const selectedArea = areas.find(a => a.id === selectedAreaId)

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-32">
            {/* Top Bar / HUD */}
            <div className="flex justify-between items-end mb-12 border-b border-white/5 pb-6">
                <div>
                    <div className="text-[10px] text-purple-500 uppercase tracking-[0.2em] font-bold mb-2">Second Brain OS</div>
                    <h1 className={`${playfair.className} text-4xl text-white`}>Domain Map</h1>
                </div>

                <div className="flex items-center gap-4">
                    <AreaCreationSheet onAreaCreated={loadAreas} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full min-w-0">
                {loading ? (
                    <div className="h-96 flex items-center justify-center text-white/20">Loading Domain Map...</div>
                ) : (
                    <AreaBoard
                        areas={areas}
                        onUpdateArea={handleUpdateArea}
                        onAreaClick={setSelectedAreaId}
                        onReorder={setAreas}
                    />
                )}
            </div>

            {/* Sidebar for Details */}
            <AreaDetailsSidebar
                area={selectedArea || null}
                onClose={() => setSelectedAreaId(null)}
                onUpdate={handleUpdateArea}
                projects={projects}
                tasks={tasks}
            />
        </div>
    )
}
