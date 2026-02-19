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

        const [notesData, projectsData, areasData, tasksSbData, tasksLegacyData] = await Promise.all([
            dataStore.getEntries('notes-sb'),
            dataStore.getEntries('projects-sb'),
            dataStore.getEntries('areas-sb'),
            dataStore.getEntries('tasks-sb'),
            dataStore.getEntries('tasks')
        ])

        const rawTasks = [...(tasksSbData as Entry[]), ...(tasksLegacyData as Entry[])]

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
        await dataStore.updateEntry(id, updates)

        // Optimistic update
        setNotes(prev => prev.map(n => n.id === id ? { ...n, data: { ...n.data, ...updates } } : n))
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
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-1">Second Brain OS</div>
                            <h1 className={`${playfair.className} text-4xl leading-none`}>
                                Neural <i className="text-amber-500">Matrix</i>
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handleOpenForge()}
                                className="bg-[#0A0A0A] border border-white/10 hover:bg-white/5 text-white px-4 py-2 rounded-sm flex items-center gap-2 transition-colors uppercase tracking-wider text-xs font-bold"
                            >
                                <Plus className="w-4 h-4 text-amber-500" /> New Entry
                            </button>
                        </div>
                    </div>

                    {/* Project Tabs */}
                    <div className="flex items-center gap-1 overflow-x-auto pb-0 custom-scrollbar hide-scrollbar">
                        <button
                            onClick={() => setSelectedProjectId(null)}
                            className={`
                                px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap
                                ${!selectedProjectId ? 'border-amber-500 text-white' : 'border-transparent text-white/30 hover:text-white'}
                            `}
                        >
                            All / Unfiltered
                        </button>
                        {filteredProjects.map(project => (
                            <button
                                key={project.id}
                                onClick={() => setSelectedProjectId(project.id)}
                                className={`
                                    px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap
                                    ${selectedProjectId === project.id ? 'border-amber-500 text-white' : 'border-transparent text-white/30 hover:text-white'}
                                `}
                            >
                                {project.data.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="px-8 py-4 border-b border-white/10 flex items-center gap-4 shrink-0 bg-[#0A0A0A]">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-white/20" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="SEARCH MATRIX..."
                            className="w-full bg-white/5 border border-white/10 rounded-sm py-1.5 pl-8 pr-4 text-[10px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 uppercase tracking-wider"
                        />
                    </div>
                    {/* Display current context */}
                    {selectedProjectId && (
                        <div className="flex items-center gap-2 text-[10px] font-mono text-amber-500 uppercase">
                            <Cpu className="w-3 h-3" />
                            <span>Context: {activeProject?.data.title}</span>
                        </div>
                    )}
                </div>

                {/* Board Content */}
                <div className="flex-1 overflow-hidden p-8">
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

            {/* Note Detail Overlay (Right Sidebar) */}
            <div className={`
                fixed inset-y-0 right-0 w-full lg:w-[600px] bg-[#080808] border-l border-white/10 transform transition-transform duration-300 z-50
                ${selectedNoteId ? 'translate-x-0' : 'translate-x-full'}
            `}>
                {selectedNoteId && activeNote && (
                    <NoteDetailView
                        note={activeNote}
                        onClose={() => setSelectedNoteId(null)}
                        onUpdate={handleUpdateNote}
                        projectMap={projectMap}
                        areaMap={areaMap}
                        taskMap={taskMap}
                    />
                )}
            </div>

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
