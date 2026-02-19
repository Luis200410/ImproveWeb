'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Inbox, ArrowRight, LayoutGrid, Database, StickyNote, Link as LinkIcon, Target } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { NoteCard } from '@/components/second-brain/notes/note-card'
import { ResourceCard } from '@/components/second-brain/resources/resource-card'
import { MatrixCard } from '@/components/second-brain/matrix/matrix-card'
import { ProjectCard } from '@/components/second-brain/projects/project-card'
import { AreaEntry } from '@/components/second-brain/areas/area-utils'
import { AreaBoard } from '@/components/second-brain/areas/area-board'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function InboxSystem() {
    const [loading, setLoading] = useState(true)
    const [inboxItems, setItems] = useState<{
        projects: Entry[],
        areas: AreaEntry[],
        tasks: Entry[],
        notes: Entry[],
        resources: Entry[]
    }>({ projects: [], areas: [], tasks: [], notes: [], resources: [] })

    const loadData = async () => {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'

        const [p, a, t1, n, r] = await Promise.all([
            dataStore.getEntries('projects-sb', uid),
            dataStore.getEntries('areas-sb', uid),
            dataStore.getEntries('tasks-sb', uid),
            dataStore.getEntries('notes-sb', uid),
            dataStore.getEntries('resources-sb', uid)
        ])

        const allTasks = [...t1]

        // FILTER LOGIC FOR INBOX implies "Unprocessed"
        // 1. Projects: Status 'backlog' (and maybe no Area?)
        // 2. Areas: Maybe newly created? Or we assume Areas don't go to inbox? User said "flash thought projects and more".
        //    Let's show ALL Areas that are "Draft" if we had that. 
        //    For now, let's show Areas without a Goal? Or maybe just manual?
        //    User said: "Inbox is a bucket for unprocessed data... creating buckets to flash thought projects... so colums are the sections (projects, area...)"
        //    I will assume all *new* items go here if they lack specific metadata.

        const inboxProjects = p.filter(x => x.data.status === 'backlog' && !x.data.Area)
        const inboxAreas = (a as unknown as AreaEntry[]).filter(x => !x.data.goal || x.data.goal === '') // Heuristic: No goal = unprocessed
        const inboxTasks = allTasks.filter(x => !x.data.Status || x.data.Status === 'inbox' || x.data.Status === 'backlog')
        const inboxNotes = n.filter(x => !x.data.Project && !x.data.Area && !x.data.Task)
        const inboxResources = r.filter(x => !x.data.noteId)

        setItems({
            projects: inboxProjects,
            areas: inboxAreas,
            tasks: inboxTasks,
            notes: inboxNotes,
            resources: inboxResources
        })
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    return (
        <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-8 pb-6 border-b border-white/10 shrink-0">
                <div className="flex items-end gap-4 mb-2">
                    <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/40 mb-1">Second Brain OS</div>
                </div>
                <h1 className={`${playfair.className} text-4xl leading-none flex items-center gap-3`}>
                    <Inbox className="w-8 h-8 text-white/50" />
                    Global <i className="text-white">Inbox</i>
                </h1>
                <p className="text-white/40 text-xs mt-2 max-w-lg">
                    The capture zone. All unprocessed signals, thoughts, and artifacts land here before being assigned to the system.
                </p>
            </div>

            {/* Board Content */}
            <div className="flex-1 overflow-x-auto p-8 custom-scrollbar">
                <div className="flex h-full gap-6 min-w-[1500px]">

                    {/* PROJECTS COLUMN */}
                    <InboxColumn
                        title="PROJECTS"
                        icon={<Target className="w-4 h-4 text-blue-500" />}
                        count={inboxItems.projects.length}
                        color="border-blue-500/20 bg-blue-500/5 text-blue-500"
                    >
                        {inboxItems.projects.map(p => (
                            <div key={p.id} className="scale-90 origin-top-left w-[110%] -mb-4">
                                <ProjectCard project={p as any} onClick={() => { }} />
                            </div>
                        ))}
                    </InboxColumn>

                    {/* AREAS COLUMN */}
                    <InboxColumn
                        title="AREAS"
                        icon={<LayoutGrid className="w-4 h-4 text-purple-500" />}
                        count={inboxItems.areas.length}
                        color="border-purple-500/20 bg-purple-500/5 text-purple-500"
                    >
                        {/* AreaBoard is too big, let's use a simple card */}
                        {inboxItems.areas.map(a => (
                            <div key={a.id} className="p-4 bg-[#0A0A0A] border border-white/5 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl">{a.data.icon}</span>
                                    <span className="font-bold">{a.data.title}</span>
                                </div>
                            </div>
                        ))}
                    </InboxColumn>

                    {/* TASKS COLUMN */}
                    <InboxColumn
                        title="TASKS"
                        icon={<Database className="w-4 h-4 text-emerald-500" />}
                        count={inboxItems.tasks.length}
                        color="border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                    >
                        {inboxItems.tasks.map(t => (
                            <div key={t.id} className="scale-90 origin-top-left w-[110%] -mb-2">
                                <MatrixCard task={t} onAction={() => { }} />
                            </div>
                        ))}
                    </InboxColumn>

                    {/* NOTES COLUMN */}
                    <InboxColumn
                        title="NOTES"
                        icon={<StickyNote className="w-4 h-4 text-amber-500" />}
                        count={inboxItems.notes.length}
                        color="border-amber-500/20 bg-amber-500/5 text-amber-500"
                    >
                        {inboxItems.notes.map(n => (
                            <NoteCard
                                key={n.id}
                                note={n}
                                isSelected={false}
                                onClick={() => { }}
                                projectMap={{}}
                                areaMap={{}}
                                taskMap={{}}
                            />
                        ))}
                    </InboxColumn>

                    {/* RESOURCES COLUMN */}
                    <InboxColumn
                        title="RESOURCES"
                        icon={<LinkIcon className="w-4 h-4 text-pink-500" />}
                        count={inboxItems.resources.length}
                        color="border-pink-500/20 bg-pink-500/5 text-pink-500"
                    >
                        {inboxItems.resources.map(r => (
                            <ResourceCard key={r.id} resource={r} onClick={() => { }} />
                        ))}
                    </InboxColumn>

                </div>
            </div>
        </div>
    )
}

function InboxColumn({ title, icon, count, children, color }: { title: string, icon: any, count: number, children: React.ReactNode, color: string }) {
    return (
        <div className="flex-1 min-w-[300px] flex flex-col h-full bg-[#050505]/50 border-r border-white/5 last:border-r-0 pr-6">
            <div className={`flex items-center justify-between mb-6 pb-4 border-b border-white/5 ${color.replace('border-', 'border-b-')}`}>
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-xs font-bold tracking-[0.2em] text-white">{title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${color}`}>
                    {count}
                </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {children}
                {count === 0 && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-lg text-white/20 text-xs font-mono uppercase tracking-widest">
                        Empty
                    </div>
                )}
            </div>
        </div>
    )
}
