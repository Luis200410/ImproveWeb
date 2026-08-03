'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore, Entry } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Inbox, ArrowRight, LayoutGrid, Database, StickyNote, Link as LinkIcon, Target, Plus, X } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'
import { NoteCard } from '@/components/second-brain/notes/note-card'
import { ResourceCard } from '@/components/second-brain/resources/resource-card'
import { MatrixCard } from '@/components/second-brain/matrix/matrix-card'
import { ProjectCard } from '@/components/second-brain/projects/project-card'
import { NoteDetailView } from '@/components/second-brain/notes/note-detail-view'
import { ProjectDetailsSidebar } from '@/components/second-brain/projects/project-details-sidebar'
import { AreaEntry } from '@/components/second-brain/areas/area-utils'
import { AreaDetailsSidebar } from '@/components/second-brain/areas/area-details-sidebar'
import { ResourceDetailsSidebar } from '@/components/second-brain/resources/resource-details-sidebar'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function InboxSystem() {
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string>('defaultUser')
    const [projectMap, setProjectMap] = useState<Record<string, string>>({})
    const [areaMap, setAreaMap] = useState<Record<string, string>>({})
    const [taskMap, setTaskMap] = useState<Record<string, string>>({})
    
    const [inboxItems, setItems] = useState<{
        projects: Entry[],
        areas: AreaEntry[],
        tasks: Entry[],
        notes: Entry[],
        resources: Entry[]
    }>({ projects: [], areas: [], tasks: [], notes: [], resources: [] })

    const [activeQuickAdd, setActiveQuickAdd] = useState<string | null>(null)
    const [quickAddValue, setQuickAddValue] = useState('')
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
    const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
    const [selectedResourceId, setSelectedResourceId] = useState<string | null>(null)

    const [allData, setAllData] = useState<{
        projects: Entry[],
        areas: Entry[],
        tasks: Entry[],
        resources: Entry[],
        habits: Entry[]
    }>({ projects: [], areas: [], tasks: [], resources: [], habits: [] })

    const loadData = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const uid = user?.id || 'defaultUser'
        setUserId(uid)

        const [p, a, t1, n, r, h] = await Promise.all([
            dataStore.getEntries('projects-sb', uid),
            dataStore.getEntries('areas-sb', uid),
            dataStore.getEntries('tasks-sb', uid),
            dataStore.getEntries('notes-sb', uid),
            dataStore.getEntries('resources-sb', uid),
            dataStore.getEntries('atomic-habits', uid)
        ])

        const allTasks = [...t1]

        const pMap: Record<string, string> = {}
        p.forEach(x => pMap[x.id] = x.data['Project Name'] || x.data.title || 'Untitled')
        setProjectMap(pMap)

        const aMap: Record<string, string> = {}
        a.forEach((x: any) => aMap[x.id] = x.data.title || 'Untitled')
        setAreaMap(aMap)

        const tMap: Record<string, string> = {}
        allTasks.forEach(x => tMap[x.id] = x.data.Task || x.data.Title || 'Untitled')
        setTaskMap(tMap)

        const inboxProjects = p.filter(x => x.data.status === 'backlog' && !x.data.Area)
        const inboxAreas = (a as unknown as AreaEntry[]).filter(x => !x.data.goal || x.data.goal === '')
        const inboxTasks = allTasks.filter(x => !x.data.Status || x.data.Status === 'inbox' || x.data.Status === 'backlog')
        const inboxNotes = n.filter(x => !x.data.Project && !x.data.Area && !x.data.Task)
        const inboxResources = r.filter(x => !x.data.noteId)

        setItems({
            projects: inboxProjects,
            areas: inboxAreas as any,
            tasks: inboxTasks,
            notes: inboxNotes,
            resources: inboxResources
        })

        setAllData({
            projects: p,
            areas: a,
            tasks: allTasks,
            resources: r,
            habits: h
        })
        setLoading(false)
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleQuickAdd = async (type: keyof typeof inboxItems) => {
        if (!quickAddValue.trim()) return

        const collection = type === 'projects' ? 'projects-sb' : 
                          type === 'areas' ? 'areas-sb' : 
                          type === 'tasks' ? 'tasks-sb' : 
                          type === 'notes' ? 'notes-sb' : 'resources-sb'

        const data = { 
            title: quickAddValue,
            'Project Name': type === 'projects' ? quickAddValue : undefined,
            Task: type === 'tasks' ? quickAddValue : undefined,
            Title: type === 'notes' ? quickAddValue : undefined,
            status: type === 'projects' ? 'backlog' as any : undefined,
            Status: type === 'tasks' ? 'inbox' as any : undefined,
            Date: new Date().toISOString(),
            // Areas specific
            icon: type === 'areas' ? '📁' : undefined,
            goal: type === 'areas' ? '' : undefined,
            color: type === 'areas' ? 'bg-purple-500' : undefined,
        }

        const newItem: Entry = {
            id: Math.random().toString(36).substr(2, 9),
            userId: userId,
            microappId: collection,
            data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        // Optimistic update
        setItems(prev => ({
            ...prev,
            [type]: [newItem, ...prev[type]] as any
        }))
        if (type === 'projects') {
            setSelectedProjectId(newItem.id)
        }
        if (type === 'areas') {
            setSelectedAreaId(newItem.id)
        }
        if (type === 'resources') {
            setSelectedResourceId(newItem.id)
        }
        setActiveQuickAdd(null)
        setQuickAddValue('')

        // Save to DB
        await dataStore.addEntry(userId, collection, data)
        // Refresh silently
        loadData()
    }

    const handleUpdateNote = async (noteId: string, updates: any) => {
        // Optimistic update locally
        setItems(prev => ({
            ...prev,
            notes: prev.notes.map(n => n.id === noteId ? { ...n, data: { ...n.data, ...updates } } : n)
        }))
        
        await dataStore.updateEntry(noteId, updates)
        loadData()
    }

    const handleDeleteNote = async (noteId: string) => {
        setItems(prev => ({
            ...prev,
            notes: prev.notes.filter(n => n.id !== noteId)
        }))
        setSelectedNoteId(null)
        await dataStore.deleteEntry(noteId)
        loadData()
    }

    const handleAssign = async (itemId: string, collection: string, updates: any) => {
        // Optimistic remove from local inbox
        const type = collection.replace('-sb', '') as keyof typeof inboxItems
        setItems(prev => ({
            ...prev,
            [type]: prev[type].filter(item => item.id !== itemId)
        }))

        // Update in DB
        await dataStore.updateEntry(itemId, updates)
        loadData()
    }

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
                        id="projects"
                        title="PROJECTS"
                        icon={<Target className="w-4 h-4 text-blue-500" />}
                        count={inboxItems.projects.length}
                        color="border-blue-500/20 bg-blue-500/5 text-blue-500"
                        onAddClick={() => setActiveQuickAdd('projects')}
                        isAdding={activeQuickAdd === 'projects'}
                        quickAddValue={quickAddValue}
                        onQuickAddValueChange={setQuickAddValue}
                        onQuickAddSubmit={() => handleQuickAdd('projects')}
                    >
                        {inboxItems.projects.map(p => (
                            <div key={p.id} className="scale-90 origin-top-left w-[110%] -mb-4">
                                <ProjectCard 
                                    project={p as any} 
                                    onClick={() => setSelectedProjectId(p.id)} 
                                    linkedTasks={allData.tasks.filter(t => t.data.Project === p.id || t.data.projectId === p.id)}
                                />
                            </div>
                        ))}
                    </InboxColumn>

                    {/* AREAS COLUMN */}
                    <InboxColumn
                        id="areas"
                        title="AREAS"
                        icon={<LayoutGrid className="w-4 h-4 text-purple-500" />}
                        count={inboxItems.areas.length}
                        color="border-purple-500/20 bg-purple-500/5 text-purple-500"
                        onAddClick={() => setActiveQuickAdd('areas')}
                        isAdding={activeQuickAdd === 'areas'}
                        quickAddValue={quickAddValue}
                        onQuickAddValueChange={setQuickAddValue}
                        onQuickAddSubmit={() => handleQuickAdd('areas')}
                    >
                        {inboxItems.areas.map(a => (
                            <div 
                                key={a.id} 
                                onClick={() => setSelectedAreaId(a.id)}
                                className="p-4 bg-[#0A0A0A] border border-white/5 rounded-lg group hover:border-purple-500/30 transition-all cursor-pointer"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{a.data.icon || '📁'}</span>
                                        <span className="font-bold text-xs uppercase tracking-widest">{a.data.title || 'UNTITLED'}</span>
                                    </div>
                                    <ArrowRight className="w-3 h-3 text-white/10 group-hover:text-purple-500 transition-all" />
                                </div>
                            </div>
                        ))}
                    </InboxColumn>

                    {/* TASKS COLUMN */}
                    <InboxColumn
                        id="tasks"
                        title="TASKS"
                        icon={<Database className="w-4 h-4 text-emerald-500" />}
                        count={inboxItems.tasks.length}
                        color="border-emerald-500/20 bg-emerald-500/5 text-emerald-500"
                        onAddClick={() => setActiveQuickAdd('tasks')}
                        isAdding={activeQuickAdd === 'tasks'}
                        quickAddValue={quickAddValue}
                        onQuickAddValueChange={setQuickAddValue}
                        onQuickAddSubmit={() => handleQuickAdd('tasks')}
                    >
                        {inboxItems.tasks.map(t => (
                            <div key={t.id} className="scale-90 origin-top-left w-[110%] -mb-2">
                                <MatrixCard 
                                    task={t} 
                                    onUpdate={async (updates) => {
                                        await dataStore.updateEntry(t.id, updates)
                                        loadData()
                                    }}
                                    onDelete={async () => {
                                        await dataStore.deleteEntry(t.id)
                                        loadData()
                                    }}
                                />
                            </div>
                        ))}
                    </InboxColumn>

                    {/* NOTES COLUMN */}
                    <InboxColumn
                        id="notes"
                        title="NOTES"
                        icon={<StickyNote className="w-4 h-4 text-amber-500" />}
                        count={inboxItems.notes.length}
                        color="border-amber-500/20 bg-amber-500/5 text-amber-500"
                        onAddClick={() => setActiveQuickAdd('notes')}
                        isAdding={activeQuickAdd === 'notes'}
                        quickAddValue={quickAddValue}
                        onQuickAddValueChange={setQuickAddValue}
                        onQuickAddSubmit={() => handleQuickAdd('notes')}
                    >
                        {inboxItems.notes.map(n => (
                            <div key={n.id} className="scale-90 origin-top-left w-[110%] -mb-2">
                                <NoteCard
                                    note={n}
                                    isSelected={false}
                                    onClick={() => setSelectedNoteId(n.id)}
                                    projectMap={projectMap}
                                    areaMap={areaMap}
                                    taskMap={taskMap}
                                />
                            </div>
                        ))}
                    </InboxColumn>

                    {/* RESOURCES COLUMN */}
                    <InboxColumn
                        id="resources"
                        title="RESOURCES"
                        icon={<LinkIcon className="w-4 h-4 text-pink-500" />}
                        count={inboxItems.resources.length}
                        color="border-pink-500/20 bg-pink-500/5 text-pink-500"
                        onAddClick={() => setActiveQuickAdd('resources')}
                        isAdding={activeQuickAdd === 'resources'}
                        quickAddValue={quickAddValue}
                        onQuickAddValueChange={setQuickAddValue}
                        onQuickAddSubmit={() => handleQuickAdd('resources')}
                    >
                        {inboxItems.resources.map(r => (
                            <div key={r.id} className="scale-90 origin-top-left w-[110%] -mb-2">
                                <ResourceCard resource={r} onClick={() => setSelectedResourceId(r.id)} />
                            </div>
                        ))}
                    </InboxColumn>

                </div>
            </div>

            {/* Processing Modal for Notes */}
            <AnimatePresence>
                {selectedNoteId && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedNoteId(null)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-6xl h-full bg-[#050505] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
                        >
                            <div className="absolute top-4 right-4 z-50">
                                <button 
                                    onClick={() => setSelectedNoteId(null)}
                                    className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-auto">
                                <NoteDetailView 
                                    note={inboxItems.notes.find(n => n.id === selectedNoteId)!}
                                    onClose={() => setSelectedNoteId(null)}
                                    onUpdate={handleUpdateNote}
                                    onDelete={handleDeleteNote}
                                    projectMap={projectMap}
                                    areaMap={areaMap}
                                    taskMap={taskMap}
                                />
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Project Details Sidebar */}
            <ProjectDetailsSidebar
                project={(allData.projects.find(p => p.id === selectedProjectId) as any) 
                    || (inboxItems.projects.find(p => p.id === selectedProjectId) as any) 
                    || null}
                onClose={() => setSelectedProjectId(null)}
                onUpdate={async (project: any, updates: any) => {
                    await dataStore.updateEntry(project.id, updates)
                    loadData()
                }}
                onDelete={async (projectId: string) => {
                    await dataStore.deleteEntry(projectId)
                    setSelectedProjectId(null)
                    loadData()
                }}
                linkedTasks={allData.tasks.filter(t => t.data.Project === selectedProjectId || t.data.projectId === selectedProjectId)}
                onCreateTask={async (taskData: any) => {
                    await dataStore.addEntry(userId, 'tasks-sb', taskData.data)
                    loadData()
                }}
                onUpdateTask={async (task: any, updates: any) => {
                    await dataStore.updateEntry(task.id, updates)
                    loadData()
                }}
                onDeleteLinkedTask={async (taskId: string) => {
                    await dataStore.deleteEntry(taskId)
                    loadData()
                }}
                areas={allData.areas}
                habits={allData.habits}
            />

            {/* Area Details Sidebar */}
            <AreaDetailsSidebar
                area={(allData.areas.find(a => a.id === selectedAreaId) as any)
                    || (inboxItems.areas.find(a => a.id === selectedAreaId) as any)
                    || null}
                onClose={() => setSelectedAreaId(null)}
                onUpdate={async (area: any, updates: any) => {
                    await dataStore.updateEntry(area.id, updates)
                    loadData()
                }}
                onDelete={async (id) => {
                    await dataStore.deleteEntry(id)
                    setSelectedAreaId(null)
                    loadData()
                }}
                projects={allData.projects}
                tasks={allData.tasks}
            />

            {/* Resource Details Sidebar */}
            <ResourceDetailsSidebar
                resource={allData.resources.find(r => r.id === selectedResourceId)
                    || inboxItems.resources.find(r => r.id === selectedResourceId)
                    || null}
                onClose={() => setSelectedResourceId(null)}
                onUpdate={async () => {
                    loadData()
                }}
            />
        </div>
    )
}

function InboxColumn({ title, icon, count, children, color, onAddClick, isAdding, quickAddValue, onQuickAddValueChange, onQuickAddSubmit }: { 
    id: string,
    title: string, 
    icon: any, 
    count: number, 
    children: React.ReactNode, 
    color: string,
    onAddClick: () => void,
    isAdding: boolean,
    quickAddValue: string,
    onQuickAddValueChange: (val: string) => void,
    onQuickAddSubmit: () => void
}) {
    return (
        <div className="flex-1 min-w-[320px] flex flex-col h-full bg-[#050505]/50 border-r border-white/5 last:border-r-0 pr-6 group/col">
            <div className={`flex items-center justify-between mb-6 pb-4 border-b border-white/5 transition-all ${color.replace('border-', 'border-b-')}`}>
                <div className="flex items-center gap-3">
                    {icon}
                    <h3 className="text-xs font-bold tracking-[0.2em] text-white">{title}</h3>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${color}`}>
                        {count}
                    </span>
                    <button 
                        onClick={onAddClick}
                        className="p-1.5 bg-white/5 rounded-md text-white/20 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover/col:opacity-100"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {isAdding && (
                <div className="mb-6">
                    <input 
                        autoFocus
                        value={quickAddValue}
                        onChange={(e) => onQuickAddValueChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onQuickAddSubmit()}
                        placeholder={`FLASH_${title}...`}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-3 text-xs font-mono text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10 uppercase"
                    />
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar pr-2">
                {children}
                {count === 0 && !isAdding && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-white/10 rounded-lg text-white/20 text-xs font-mono uppercase tracking-widest bg-white/[0.01]">
                        Clear
                    </div>
                )}
            </div>
        </div>
    )
}
