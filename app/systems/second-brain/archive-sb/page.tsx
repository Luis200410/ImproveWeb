'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Archive, LayoutGrid, Target, ChevronRight, CornerUpLeft } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { ProjectEntry } from '@/components/second-brain/projects/project-utils'
import { AreaEntry } from '@/components/second-brain/areas/area-utils'
import { ProjectCard } from '@/components/second-brain/projects/project-card'
import { NoteCard } from '@/components/second-brain/notes/note-card'
import { ResourceCard } from '@/components/second-brain/resources/resource-card'
import { MatrixCard } from '@/components/second-brain/matrix/matrix-card'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function ArchiveSystem() {
    const [loading, setLoading] = useState(true)
    const [archivedData, setArchivedData] = useState<{
        projects: ProjectEntry[],
        areas: AreaEntry[]
    }>({ projects: [], areas: [] })

    const [allContent, setAllContent] = useState<{
        tasks: Entry[],
        notes: Entry[],
        resources: Entry[],
        projects: ProjectEntry[]
    }>({ tasks: [], notes: [], resources: [], projects: [] })

    const [selection, setSelection] = useState<{ type: 'area' | 'project', id: string } | null>(null)

    const loadData = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'

        const [p, a, t1, t2, n, r] = await Promise.all([
            dataStore.getEntries('projects-sb', uid),
            dataStore.getEntries('areas-sb', uid),
            dataStore.getEntries('tasks-sb', uid),
            dataStore.getEntries('tasks', uid),
            dataStore.getEntries('notes-sb', uid),
            dataStore.getEntries('resources-sb', uid)
        ])

        const allProjects = p as unknown as ProjectEntry[]
        const allAreas = a as unknown as AreaEntry[]
        const allTasks = [...t1, ...t2]

        // IDENTIFY ARCHIVED ITEMS
        // Projects: status === 'completed' OR explicitly 'archived' if we support it. 
        // User said: "when a project hit archive... status property"
        // Usually 'completed' IS the archive state in this system.
        const archivedProjects = allProjects.filter(p => p.data.status === 'completed' || (p.data as any).archived === true)

        // Areas: User said "if an area is archive". We don't have an archive status yet.
        // Let's assume we filter by a new property 'archived' or 'ragStatus' === 'Red' (unlikely).
        // For now, let's include Areas that have NO active projects? Or maybe add an 'Archived' status to AreaBoard later.
        // I will assume for now only Projects are reliably archived. 
        // But to support the user request, I'll allow searching for Areas that MIGHT be archived if we add that flag.
        // Let's filter Areas that have (data.archived === true).
        const archivedAreas = allAreas.filter(a => (a.data as any).archived === true)

        setArchivedData({ projects: archivedProjects, areas: archivedAreas })
        setAllContent({
            tasks: allTasks,
            notes: n,
            resources: r,
            projects: allProjects // Needed to find projects for an Area
        })
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    // Content resolution based on selection
    const getResolvedContent = () => {
        if (!selection) return null

        if (selection.type === 'project') {
            // Show Tasks, Notes, Resources for this Project
            const pId = selection.id
            const project = [...archivedData.projects, ...allContent.projects].find(p => p.id === pId)

            return {
                title: project?.data.title,
                tasks: allContent.tasks.filter(t => t.data.Project === pId || t.data.projectId === pId),
                notes: allContent.notes.filter(n => n.data.Project === pId || n.data.projectId === pId),
                resources: allContent.resources.filter(r => {
                    // Direct link or via note
                    const linkedNotes = allContent.notes.filter(n => n.data.Project === pId).map(n => n.id)
                    return (r.data.noteId && linkedNotes.includes(r.data.noteId)) // || r.data.projectId === pId (if we had it)
                })
            }
        }

        if (selection.type === 'area') {
            // Show Projects for this Area
            const aId = selection.id
            const area = archivedData.areas.find(a => a.id === aId)
            // Should we show ALL projects or just archived ones? 
            // "if an area is archive we see the project related to that area"
            // Typically if an Area is archived, EVERYTHING inside is archived.
            const areaProjects = allContent.projects.filter(p => p.data.Area === aId)

            return {
                title: area?.data.title,
                projects: areaProjects,
                isAreaView: true
            }
        }
        return null
    }

    const content = getResolvedContent()

    return (
        <div className="h-screen bg-[#050505] text-white flex overflow-hidden">
            {/* Sidebar: Archive Index */}
            <div className="w-80 border-r border-white/10 flex flex-col bg-[#080808]">
                <div className="p-8 pb-6 border-b border-white/10 shrink-0">
                    <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-1">Second Brain OS</div>
                    <h1 className={`${playfair.className} text-3xl leading-none flex items-center gap-2`}>
                        <Archive className="w-6 h-6 text-white/50" />
                        Archive
                    </h1>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* Areas Section */}
                    {archivedData.areas.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-4 mb-2">Archived Domains</h3>
                            <div className="space-y-1">
                                {archivedData.areas.map(area => (
                                    <button
                                        key={area.id}
                                        onClick={() => setSelection({ type: 'area', id: area.id })}
                                        className={`w-full text-left px-4 py-3 rounded-md text-sm transition-colors flex items-center gap-3
                                            ${selection?.id === area.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                                        `}
                                    >
                                        <span>{area.data.icon}</span>
                                        <span className="truncate">{area.data.title}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Projects Section */}
                    <div>
                        <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-4 mb-2">Archived Projects</h3>
                        {archivedData.projects.length === 0 && (
                            <div className="px-4 text-xs text-white/20 italic">No archived projects found.</div>
                        )}
                        <div className="space-y-1">
                            {archivedData.projects.map(project => (
                                <button
                                    key={project.id}
                                    onClick={() => setSelection({ type: 'project', id: project.id })}
                                    className={`w-full text-left px-4 py-3 rounded-md text-sm transition-colors flex items-center gap-3
                                        ${selection?.id === project.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5 hover:text-white'}
                                    `}
                                >
                                    <Target className="w-4 h-4 opacity-50" />
                                    <span className="truncate">{project.data.title}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-[#050505] p-8 custom-scrollbar">
                {content ? (
                    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
                        <header className="mb-12 border-b border-white/5 pb-8">
                            <div className="flex items-center gap-2 text-white/30 text-xs mb-4 uppercase tracking-wider">
                                <Archive className="w-3 h-3" />
                                <span>Archive</span>
                                <ChevronRight className="w-3 h-3" />
                                <span className="text-white">{content.title}</span>
                            </div>
                            <h2 className={`${playfair.className} text-5xl text-white mb-4`}>{content.title}</h2>
                        </header>

                        {/* If Area View: Show Projects */}
                        {content.isAreaView && content.projects && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {content.projects.map(p => (
                                    <div key={p.id} onClick={() => setSelection({ type: 'project', id: p.id })} className="cursor-pointer">
                                        <ProjectCard project={p} onClick={() => { }} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* If Project View: Show Content */}
                        {!content.isAreaView && (
                            <div className="space-y-12">
                                {/* Tasks */}
                                <section>
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6 border-l-2 border-emerald-500 pl-4">Task Ledger</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {content.tasks?.length === 0 && <div className="text-white/20 text-sm italic">No tasks recorded.</div>}
                                        {content.tasks?.map(t => (
                                            <div key={t.id} className="opacity-75 hover:opacity-100 transition-opacity">
                                                <MatrixCard task={t} onAction={() => { }} />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Notes */}
                                <section>
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6 border-l-2 border-amber-500 pl-4">Knowledge Base</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {content.notes?.length === 0 && <div className="text-white/20 text-sm italic">No notes recorded.</div>}
                                        {content.notes?.map(n => (
                                            <div key={n.id} className="bg-white/5 rounded-lg overflow-hidden">
                                                <NoteCard note={n} isSelected={false} onClick={() => { }} projectMap={{}} areaMap={{}} taskMap={{}} />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Resources */}
                                <section>
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-6 border-l-2 border-pink-500 pl-4">Asset Library</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {content.resources?.length === 0 && <div className="text-white/20 text-sm italic">No resources recorded.</div>}
                                        {content.resources?.map(r => (
                                            <ResourceCard key={r.id} resource={r} onClick={() => { }} />
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white/20">
                        <Archive className="w-16 h-16 mb-6 opacity-20" />
                        <p className="text-sm uppercase tracking-widest">Select an item from the archive index</p>
                    </div>
                )}
            </div>
        </div>
    )
}
