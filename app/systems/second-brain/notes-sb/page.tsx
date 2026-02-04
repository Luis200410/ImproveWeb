'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, SlidersHorizontal, Cpu, Sparkles } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { NoteCard } from '@/components/second-brain/notes/note-card'
import { NoteDetailView } from '@/components/second-brain/notes/note-detail-view'
import { NoteForge } from '@/components/second-brain/notes/note-forge'
import { ProjectEntry } from '@/components/second-brain/projects/project-utils'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function NotesSystem() {
    const [notes, setNotes] = useState<Entry[]>([])
    const [projects, setProjects] = useState<ProjectEntry[]>([])
    const [areas, setAreas] = useState<Entry[]>([])
    const [tasks, setTasks] = useState<Entry[]>([])

    const [loading, setLoading] = useState(true)
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [showForge, setShowForge] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [userId, setUserId] = useState('defaultUser')

    // Maps for O(1) lookups
    const [projectMap, setProjectMap] = useState<Record<string, string>>({})
    const [areaMap, setAreaMap] = useState<Record<string, string>>({})
    const [taskMap, setTaskMap] = useState<Record<string, string>>({})

    const loadData = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'
        setUserId(uid)

        const [notesData, projectsData, areasData, tasksData] = await Promise.all([
            dataStore.getEntries('notes-sb'),
            dataStore.getEntries('projects-sb'),
            dataStore.getEntries('areas-sb'),
            dataStore.getEntries('tasks-sb')
        ])

        // Sort notes by date desc
        const sortedNotes = (notesData as Entry[]).sort((a, b) =>
            new Date(b.data.Date || b.createdAt).getTime() - new Date(a.data.Date || a.createdAt).getTime()
        )

        setNotes(sortedNotes)
        setProjects(projectsData as unknown as ProjectEntry[])
        setAreas(areasData as Entry[])
        setTasks(tasksData as Entry[])

        // Build maps
        const pMap: Record<string, string> = {}
        projectsData.forEach((p: any) => pMap[p.id] = p.data['Project Name'])
        setProjectMap(pMap)

        const aMap: Record<string, string> = {}
        areasData.forEach((a: any) => aMap[a.id] = a.data.Name)
        setAreaMap(aMap)

        const tMap: Record<string, string> = {}
        tasksData.forEach((t: any) => tMap[t.id] = t.data.Task)
        setTaskMap(tMap)

        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleCreateNote = async (data: any) => {
        await dataStore.addEntry(userId, 'notes-sb', data)
        await loadData()
        setShowForge(false)
    }

    const handleUpdateNote = async (id: string, updates: any) => {
        await dataStore.updateEntry(id, updates)

        // Optimistic update
        setNotes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n))
    }

    const filteredNotes = notes.filter(n =>
        n.data.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.data.Cues || '').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const activeNote = notes.find(n => n.id === selectedNoteId)

    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden">
            {/* Sidebar / List View */}
            <div className={`w-full ${selectedNoteId ? 'hidden lg:flex lg:w-[360px]' : 'flex'} flex-col border-r border-white/10 shrink-0`}>
                {/* Header */}
                <div className="p-8 pb-4 border-b border-white/10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-1">Database_Index</div>
                            <h1 className={`${playfair.className} text-4xl leading-none`}>
                                Recent <br /> <i className="text-amber-500">Entries</i>
                            </h1>
                        </div>
                        <button
                            onClick={() => setShowForge(true)}
                            className="bg-white/5 hover:bg-white/10 text-white p-2 rounded-full border border-white/10 transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="QUERY_GRAPH..."
                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-sm py-2 pl-9 pr-4 text-xs font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 uppercase tracking-wider"
                            />
                        </div>
                        <button className="px-3 border border-white/10 rounded-sm hover:bg-white/5 text-white/40">
                            <SlidersHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="p-8 text-center text-xs font-mono text-white/30 animate-pulse">Loading Index...</div>
                    ) : filteredNotes.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="text-xs font-mono text-white/30 mb-4">NO ENTRIES FOUND</div>
                            <button onClick={() => setShowForge(true)} className="text-amber-500 text-xs uppercase tracking-widest hover:underline">Initialize First Entry</button>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {filteredNotes.map(note => (
                                <NoteCard
                                    key={note.id}
                                    note={note}
                                    isSelected={selectedNoteId === note.id}
                                    onClick={() => setSelectedNoteId(note.id)}
                                    projectMap={projectMap}
                                    areaMap={areaMap}
                                    taskMap={taskMap}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Status */}
                <div className="p-2 bg-[#0A0A0A] border-t border-white/10 text-[9px] font-mono text-white/30 flex justify-between uppercase tracking-widest px-4">
                    <span>System Nominal</span>
                    <span>Kernel_ID: X-Brain-Core-99</span>
                </div>
            </div>

            {/* Detail View */}
            <div className={`flex-1 ${!selectedNoteId ? 'hidden lg:flex' : 'flex'}`}>
                {selectedNoteId && activeNote ? (
                    <NoteDetailView
                        note={activeNote}
                        onClose={() => setSelectedNoteId(null)}
                        onUpdate={handleUpdateNote}
                        projectMap={projectMap}
                        areaMap={areaMap}
                        taskMap={taskMap}
                    />
                ) : (
                    // Empty State
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#030303] text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-black to-black opacity-50" />
                        <div className="relative z-10 max-w-md space-y-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-8 h-8 text-amber-500/50" />
                            </div>
                            <h2 className={`${playfair.className} text-3xl text-white`}>Select a Neural Sequence</h2>
                            <p className="text-sm text-white/40 leading-relaxed font-light">
                                Access the distributed database to view, edit, or synthesize new knowledge nodes. Establish connections between disjointed information clusters.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Forge Panel Overlay */}
            <AnimatePresence>
                {showForge && (
                    <NoteForge
                        onClose={() => setShowForge(false)}
                        onCreate={handleCreateNote}
                        projects={projects}
                        areas={areas}
                        tasks={tasks}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
