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
import { NoteBoard } from '@/components/second-brain/notes/note-board'
import { ProjectEntry } from '@/components/second-brain/projects/project-utils'
import { ProjectFilterDropdown } from '@/components/second-brain/matrix/project-filter-dropdown'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function NotesSystem() {
    const [notes, setNotes] = useState<Entry[]>([])
    const [projects, setProjects] = useState<ProjectEntry[]>([])
    const [areas, setAreas] = useState<Entry[]>([])
    const [tasks, setTasks] = useState<Entry[]>([])

    const [loading, setLoading] = useState(true)
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [isPopupMode, setIsPopupMode] = useState(false)
    const [showForge, setShowForge] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [userId, setUserId] = useState('defaultUser')
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [defaultForgeTaskId, setDefaultForgeTaskId] = useState<string | undefined>(undefined)

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

        const [notesData, projectsData, areasData, tasksSbData] = await Promise.all([
            dataStore.getEntries('notes-sb'),
            dataStore.getEntries('projects-sb'),
            dataStore.getEntries('areas-sb'),
            dataStore.getEntries('tasks-sb')
        ])

        const rawTasks = [...(tasksSbData as Entry[])]

        // Normalize task data structure
        const tasksData = rawTasks.map(task => {
            // If it has 'title' but not 'Title' (Project Architect format)
            if (!task.data.Title && (task.data.title || task.data.ProjectName)) {
                return {
                    ...task,
                    data: {
                        ...task.data,
                        Title: task.data.Title || task.data.title || task.data.ProjectName,
                        Task: task.data.Title || task.data.title || task.data.ProjectName, // For NeuralCalendar
                        Status: task.data.Status || task.data.status || 'backlog',
                        Priority: task.data.Priority || task.data.priority || 'Medium',
                        DueDate: task.data.DueDate || task.data.deadline || task.data.date,
                        'Start Date': task.data['Start Date'] || task.data.startDate || task.data.date
                    }
                }
            }
            // Ensure 'Task' field exists if 'Title' exists (some components use 'Task')
            if (task.data.Title && !task.data.Task) {
                return {
                    ...task,
                    data: {
                        ...task.data,
                        Task: task.data.Title
                    }
                }
            }
            return task
        })

        // Sort notes by date desc
        const sortedNotes = (notesData as Entry[]).sort((a, b) =>
            new Date(b.data.Date || b.createdAt).getTime() - new Date(a.data.Date || a.createdAt).getTime()
        )

        setNotes(sortedNotes)
        setProjects(projectsData as unknown as ProjectEntry[])
        setAreas(areasData as Entry[])
        setTasks(tasksData)

        // Build maps
        const pMap: Record<string, string> = {}
        projectsData.forEach((p: any) => pMap[p.id] = p.data['Project Name'])
        setProjectMap(pMap)

        const aMap: Record<string, string> = {}
        areasData.forEach((a: any) => aMap[a.id] = a.data['Area Name'] || a.data.title || a.data.name || 'Untitled Area')
        setAreaMap(aMap)

        const tMap: Record<string, string> = {}
        tasksData.forEach((t: any) => tMap[t.id] = t.data.Task)
        setTaskMap(tMap)

        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleOpenForge = (taskId?: string) => {
        setDefaultForgeTaskId(taskId)
        setShowForge(true)
    }

    const handleCreateNote = async (data: any) => {
        await dataStore.addEntry(userId, 'notes-sb', data)
        await loadData()
        setShowForge(false)
        setDefaultForgeTaskId(undefined) // Reset
    }

    const handleUpdateNote = async (id: string, updates: any) => {
        // Optimistic update
        setNotes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n))
        
        await dataStore.updateEntry(id, updates)
    }

    const handleDeleteNote = async (id: string) => {
        // Optimistic delete
        setNotes(prev => prev.filter(n => n.id !== id))
        setSelectedNoteId(null)
        
        await dataStore.deleteEntry(id)
    }

    const handleMoveNote = async (note: Entry, targetTaskId: string) => {
        // Optimistic
        setNotes(prev => prev.map(n => n.id === note.id ? { ...n, data: { ...n.data, Task: targetTaskId } } : n))

        // DB
        await dataStore.updateEntry(note.id, { Task: targetTaskId, taskId: targetTaskId })
    }

    // Filter Logic
    const filteredProjects = projects.filter(p => !['completed', 'archived'].includes(p.data.status))

    const activeProject = projects.find(p => p.id === selectedProjectId)

    // Tasks for the board: Only tasks belonging to the selected project
    const boardTasks = selectedProjectId
        ? tasks.filter(t => t.data.Project === selectedProjectId || t.data.projectId === selectedProjectId)
        : []

    // Notes for the board: filtered by searching AND selected project
    const filteredNotes = notes.filter(n => {
        const matchesSearch = n.data.Title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (n.data.Cues || '').toLowerCase().includes(searchQuery.toLowerCase())

        const matchesProject = selectedProjectId
            ? (n.data.Project === selectedProjectId || n.data.projectId === selectedProjectId)
            : true

        return matchesSearch && matchesProject
    })

    const activeNote = notes.find(n => n.id === selectedNoteId)

    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden">
            {/* Main Board View */}
            <div className={`flex-1 flex flex-col min-w-0 ${selectedNoteId ? 'hidden lg:flex' : 'flex'}`}>
                {/* Header */}
                <div className="p-8 pb-0 border-b border-white/10 shrink-0">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-1 h-6 bg-amber-500" />
                                <h1 className={`${playfair.className} text-2xl leading-none uppercase tracking-widest`}>
                                    Neural <i className="text-amber-500 font-bold italic lowercase">Matrix</i>
                                </h1>
                            </div>
                            
                            <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

                            <ProjectFilterDropdown
                                projects={projects as any[]}
                                selectedProjectId={selectedProjectId}
                                onSelectProject={(id) => setSelectedProjectId(id)}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="relative group/search max-w-[240px] flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20 group-focus-within/search:text-amber-500/50 transition-colors" />
                                <input
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="LOOK_UP_MATRIX..."
                                    className="bg-[#0A0A0A] border border-white/10 rounded-lg px-3 pl-8 py-1.5 text-[10px] font-mono text-white/70 focus:outline-none focus:border-amber-500/50 transition-colors placeholder:text-white/10 w-48 uppercase tracking-widest"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono pointer-events-none group-focus-within/search:text-amber-500/50 transition-colors uppercase">
                                    CMD_K
                                </div>
                            </div>
                            {selectedProjectId && (
                                <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-amber-500/70 uppercase border-l border-white/10 pl-4 h-4">
                                    <Cpu className="w-3 h-3 animate-pulse" />
                                    <span>Active_Context: {activeProject?.data.title || 'ALIGNED'}</span>
                                </div>
                            )}
                            <button
                                onClick={() => handleOpenForge()}
                                className="bg-amber-500 text-black px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all hover:bg-amber-400 font-bold uppercase tracking-wider text-[10px] shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                            >
                                <Plus className="w-4 h-4" /> New Note
                            </button>
                        </div>
                    </div>
                </div>

                {/* Board Content */}
                <div className="flex-1 overflow-hidden p-8 pt-4">
                    {selectedProjectId ? (
                        <div className="h-full">
                            <NoteBoard
                                notes={filteredNotes}
                                tasks={boardTasks}
                                onNoteMoved={handleMoveNote}
                                onNoteClick={setSelectedNoteId}
                                onCreateNote={handleOpenForge}
                                projectMap={projectMap}
                                areaMap={areaMap}
                                taskMap={taskMap}
                            />
                        </div>
                    ) : (
                        // Fallback List View
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto h-full custom-scrollbar content-start">
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
            </div>

            {/* Note Detail Overlay (Right Sidebar or Full Modal) */}
            <AnimatePresence>
                {selectedNoteId && !isPopupMode && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedNoteId(null)}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[45]"
                    />
                )}
            </AnimatePresence>

            {selectedNoteId && isPopupMode ? (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedNoteId(null)} />
                    <div className="relative z-10 w-full max-w-5xl h-[90vh] rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10">
                        {activeNote && (
                            <NoteDetailView
                                note={activeNote}
                                onClose={() => setSelectedNoteId(null)}
                                onUpdate={handleUpdateNote}
                                onDelete={handleDeleteNote}
                                projectMap={projectMap}
                                areaMap={areaMap}
                                taskMap={taskMap}
                                projects={projects}
                                areas={areas}
                                tasks={tasks}
                                isPopupMode={isPopupMode}
                                onTogglePopup={() => setIsPopupMode(false)}
                            />
                        )}
                    </div>
                </div>
            ) : null}

            {!isPopupMode && (
                <div className={`
                    fixed inset-y-0 right-0 w-full lg:w-[600px] bg-[#080808] border-l border-white/10 transform transition-transform duration-300 z-50
                    ${selectedNoteId ? 'translate-x-0 shadow-[-20px_0_50px_rgba(0,0,0,0.5)]' : 'translate-x-full'}
                `}>
                    {selectedNoteId && activeNote && (
                        <NoteDetailView
                            note={activeNote}
                            onClose={() => setSelectedNoteId(null)}
                            onUpdate={handleUpdateNote}
                            onDelete={handleDeleteNote}
                            projectMap={projectMap}
                            areaMap={areaMap}
                            taskMap={taskMap}
                            projects={projects}
                            areas={areas}
                            tasks={tasks}
                            isPopupMode={isPopupMode}
                            onTogglePopup={() => setIsPopupMode(true)}
                        />
                    )}
                </div>
            )}

            {/* Forge Panel Overlay */}
            <AnimatePresence>
                {showForge && (
                    <NoteForge
                        onClose={() => {
                            setShowForge(false)
                            setDefaultForgeTaskId(undefined)
                        }}
                        onCreate={handleCreateNote}
                        projects={projects}
                        areas={areas}
                        tasks={tasks}
                        defaultProjectId={selectedProjectId || undefined}
                        defaultTaskId={defaultForgeTaskId}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
