'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Link as LinkIcon, Cpu } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { ResourceBoard } from '@/components/second-brain/resources/resource-board'
import { ResourceCreationSheet } from '@/components/second-brain/resources/resource-creation-sheet'
import { ResourceDetailsSidebar } from '@/components/second-brain/resources/resource-details-sidebar'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function ResourcesSystem() {
    const [resources, setResources] = useState<Entry[]>([])
    const [notes, setNotes] = useState<Entry[]>([])
    const [projects, setProjects] = useState<Entry[]>([])

    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [currentNoteId, setCurrentNoteId] = useState<string | undefined>(undefined)
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

    // For Sheet control
    const [creationOpen, setCreationOpen] = useState(false) // Not used directly, sheet manages open state but we trigger re-load

    const loadData = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'

        const [resData, notesData, projectsData] = await Promise.all([
            dataStore.getEntries('resources-sb', uid),
            dataStore.getEntries('notes-sb', uid),
            dataStore.getEntries('projects-sb', uid)
        ])

        setResources(resData)
        setNotes(notesData)
        setProjects(projectsData)
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleUpdateResource = async (resource: Entry, updates: any) => {
        // Optimistic
        setResources(prev => prev.map(r => r.id === resource.id ? { ...r, data: { ...r.data, ...updates } } : r))
        // DB
        await dataStore.updateEntry(resource.id, updates)
    }

    const handleResourceMoved = (resource: Entry, targetNoteId: string) => {
        handleUpdateResource(resource, { noteId: targetNoteId })
    }

    // Filter Logic
    const filteredProjects = projects.filter(p => !['completed', 'archived'].includes(p.data.status))
    const activeProject = projects.find(p => p.id === selectedProjectId)

    // 1. Get Notes for the selected project
    const projectNotes = selectedProjectId
        ? notes.filter(n => n.data.Project === selectedProjectId || n.data.projectId === selectedProjectId)
        : notes // If no project selected, show all notes? Or maybe empty? Notes view usually allows all. 
    // User said "filtering for projects", so likely we select a project first.

    // 2. Filter Resources
    // Logic: Show resources that are assigned to the visible notes OR unassigned (if no project is selected?)
    // Actually, if we are in a Project context, we probably only want resources related to that project (via note or direct link)
    // But since Resources are linked to Notes, if we filter Notes by Project, we implicitly filter Resources.
    // However, what if a resource is linked to the Project directly but not a Note? 
    // For now, we only show resources linked to the *visible notes* + unassigned ones if in "All" view.

    const visibleNoteIds = new Set(projectNotes.map(n => n.id))

    const filteredResources = resources.filter(r => {
        const matchesSearch = (r.data.title || '').toLowerCase().includes(searchQuery.toLowerCase())

        // If we have a project selected, we only show resources that belong to one of the project's notes
        // OR resources that might be directly linked to the project (future proofing)
        // For now: only those linked to visible notes
        if (selectedProjectId) {
            // If unassigned, we hide it? Or show it in unassigned column?
            // Unassigned column in ResourceBoard collects items with no noteId.
            // But if we select Project A, we shouldn't see unassigned resources of Project B.
            // We don't have projectId on resources explicitly in the creation sheet yet, only noteId.
            // So we just filter by: is it in one of the visible notes?
            // What about "Unassigned"? Use unassigned only if no project selected? 
            // Or we need resources to track projectId too? 
            // Let's assume for now we filter by Note association.
            if (r.data.noteId && !visibleNoteIds.has(r.data.noteId)) return false
        }

        return matchesSearch
    })

    return (
        <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-0 border-b border-white/10 shrink-0">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-1">Second Brain OS</div>
                        <h1 className={`${playfair.className} text-4xl leading-none`}>
                            Resource <i className="text-blue-500">Hub</i>
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <ResourceCreationSheet
                            notes={projectNotes}
                            defaultNoteId={currentNoteId}
                            onResourceCreated={loadData}
                        />
                    </div>
                </div>

                {/* Project Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0 custom-scrollbar hide-scrollbar">
                    <button
                        onClick={() => setSelectedProjectId(null)}
                        className={`
                            px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap
                            ${!selectedProjectId ? 'border-blue-500 text-white' : 'border-transparent text-white/30 hover:text-white'}
                        `}
                    >
                        All Resources
                    </button>
                    {filteredProjects.map(project => (
                        <button
                            key={project.id}
                            onClick={() => setSelectedProjectId(project.id)}
                            className={`
                                px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap
                                ${selectedProjectId === project.id ? 'border-blue-500 text-white' : 'border-transparent text-white/30 hover:text-white'}
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
                        placeholder="SEARCH RESOURCES..."
                        className="w-full bg-white/5 border border-white/10 rounded-sm py-1.5 pl-8 pr-4 text-[10px] font-mono text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 uppercase tracking-wider"
                    />
                </div>
                {selectedProjectId && (
                    <div className="flex items-center gap-2 text-[10px] font-mono text-blue-500 uppercase">
                        <Cpu className="w-3 h-3" />
                        <span>Context: {activeProject?.data.title}</span>
                    </div>
                )}
            </div>

            {/* Board Content */}
            <div className="flex-1 overflow-hidden p-8">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-white/20">Loading Resources...</div>
                ) : (
                    <ResourceBoard
                        notes={projectNotes}
                        resources={filteredResources}
                        onResourceMoved={handleResourceMoved}
                        onResourceClick={(id) => setSelectedResourceId(id)}
                        onCreateResource={(noteId) => {
                            // Trigger sheet?
                            // We need to pass logic to open the sheet with default noteId
                            // But sheet is in header. Use a dedicated state/context or move sheet here?
                            // For simplicity, we can't easily trigger the header sheet from the board item directly without lifting state.
                            // OR we put a sheet trigger button inside the board column header.
                            // Actually the board 'BoardColumn' calls onCreateResource.
                            // We should make the "Create" button in the header smarter or add one.
                            console.log("Create for note", noteId)
                        }}
                    />
                )}
            </div>

            <ResourceDetailsSidebar
                resource={resources.find(r => r.id === selectedResourceId) || null}
                onClose={() => setSelectedResourceId(null)}
                onUpdate={handleUpdateResource}
            />
        </div>
    )
}
