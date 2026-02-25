'use client'

import { useState, useEffect, useRef } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Entry } from '@/lib/data-store'
import {
    Maximize2, Link as LinkIcon, Calendar, Activity,
    Hash, Terminal, CheckCircle2, Trash2, Save, Timer, Play, ChevronDown, Sparkles, NotebookPen, ExternalLink, Plus, Minimize2
} from 'lucide-react'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { usePomodoro } from '@/components/productivity/pomodoro/pomodoro-context'
import { ProjectEntry } from '@/components/second-brain/projects/project-utils'
import { NoteDetailView } from '@/components/second-brain/notes/note-detail-view'
import { NoteForge } from '@/components/second-brain/notes/note-forge'
import { TaskForge } from '@/components/second-brain/tasks/task-forge'
import { AnimatePresence } from 'framer-motion'
import { getTaskTitle, getTaskDeadline } from './utils'
import { sileo } from 'sileo'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface TaskDetailsSheetProps {
    task: Entry
    trigger: React.ReactNode
    onUpdate?: (updates: Partial<Entry['data']>) => void
}

interface TaskDetailsInnerProps {
    task: Entry
    onUpdate?: (updates: Partial<Entry['data']>) => void
    isPopup: boolean
    onTogglePopup: () => void
    onClose: () => void
}

function TaskDetailsInner({ task, onUpdate, isPopup, onTogglePopup, onClose }: TaskDetailsInnerProps) {
    const { startSession } = usePomodoro()
    const [status] = useState(task.data.Status || false)
    const [localTitle, setLocalTitle] = useState(getTaskTitle(task, ''))

    // Relational Data
    const [projects, setProjects] = useState<ProjectEntry[]>([])
    const [areas, setAreas] = useState<Entry[]>([])
    const [tasks, setTasks] = useState<Entry[]>([])

    // Note Integration
    const [linkedNote, setLinkedNote] = useState<Entry | null>(null)
    const [showNotePopup, setShowNotePopup] = useState(false)
    const [showForge, setShowForge] = useState(false)

    // Subtasks
    const [subtasks, setSubtasks] = useState<{ title: string, completed: boolean }[]>([])
    const [newSubtask, setNewSubtask] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)

    // Maps
    const [projectMap, setProjectMap] = useState<Record<string, string>>({})
    const [areaMap, setAreaMap] = useState<Record<string, string>>({})
    const [taskMap, setTaskMap] = useState<Record<string, string>>({})

    const loadData = async () => {
        const { dataStore } = await import('@/lib/data-store')
        const [p, a, t] = await Promise.all([
            dataStore.getEntries('projects-sb'),
            dataStore.getEntries('areas-sb'),
            dataStore.getEntries('tasks-sb')
        ])

        const sortedP = p as unknown as ProjectEntry[]
        const sortedA = a as Entry[]
        const sortedT = t as Entry[]

        setProjects(sortedP)
        setAreas(sortedA)
        setTasks(sortedT)

        const pMap: Record<string, string> = {}
        sortedP.forEach(pr => pMap[pr.id] = pr.data['Project Name'] || pr.data.title || 'Untitled Project')
        setProjectMap(pMap)

        const aMap: Record<string, string> = {}
        sortedA.forEach(ar => aMap[ar.id] = ar.data['Area Name'] || ar.data.title || ar.data.name || 'Untitled Area')
        setAreaMap(aMap)

        const tMap: Record<string, string> = {}
        sortedT.forEach(ts => tMap[ts.id] = getTaskTitle(ts))
        setTaskMap(tMap)

        // Find linked note
        const notes = await dataStore.getEntries('notes-sb')
        const foundNote = notes.find(n => n.data.Task === task.id || n.id === task.data.Notes)
        if (foundNote) {
            setLinkedNote(foundNote)
        }

        // Parse Subtasks
        try {
            if (typeof task.data.Subtasks === 'string') {
                setSubtasks(JSON.parse(task.data.Subtasks))
            } else if (Array.isArray(task.data.Subtasks)) {
                setSubtasks(task.data.Subtasks)
            }
        } catch {
            setSubtasks([])
        }
    }

    useEffect(() => {
        loadData()
    }, [task.id, task.data.Notes])

    const handleUpdateTask = async (updates: Partial<Entry['data']>) => {
        if (onUpdate) onUpdate(updates)
        const { dataStore } = await import('@/lib/data-store')
        await dataStore.updateEntry(task.id, updates)
    }

    // Debounced title save
    const titleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const handleTitleChange = (newTitle: string) => {
        setLocalTitle(newTitle)
        if (titleTimeoutRef.current) clearTimeout(titleTimeoutRef.current)
        titleTimeoutRef.current = setTimeout(() => {
            handleUpdateTask({ Task: newTitle })
        }, 500)
    }

    // --- Subtask Handlers ---
    const handleAddSubtask = () => {
        if (!newSubtask.trim()) return
        const updated = [...subtasks, { title: newSubtask.trim(), completed: false }]
        setSubtasks(updated)
        setNewSubtask('')
        handleUpdateTask({ Subtasks: JSON.stringify(updated) })
    }

    const handleToggleSubtask = (index: number) => {
        const updated = [...subtasks]
        updated[index].completed = !updated[index].completed
        setSubtasks(updated)
        handleUpdateTask({ Subtasks: JSON.stringify(updated) })
    }

    const handleDeleteSubtask = (index: number) => {
        const updated = subtasks.filter((_, i) => i !== index)
        setSubtasks(updated)
        handleUpdateTask({ Subtasks: JSON.stringify(updated) })
    }

    const handleReverseEngineer = async () => {
        setIsGenerating(true)
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{
                        role: 'user',
                        content: `Break down this task into 3-5 distinct, actionable subtasks. Return ONLY a JSON array of strings, nothing else. Task: "${localTitle}". Context: Project "${projectMap[task.data.Project || '']} ", Area "${areaMap[task.data.Area || '']}"`
                    }]
                })
            })
            const text = await response.text()
            const jsonStart = text.indexOf('[')
            const jsonEnd = text.lastIndexOf(']')
            if (jsonStart !== -1 && jsonEnd !== -1) {
                const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1))
                if (Array.isArray(parsed)) {
                    const newSubtasks = parsed.map(p => ({ title: String(p), completed: false }))
                    const updated = [...subtasks, ...newSubtasks]
                    setSubtasks(updated)
                    handleUpdateTask({ Subtasks: JSON.stringify(updated) })
                }
            }
        } catch (e) {
            console.error('Failed to generate subtasks:', e)
        }
        setIsGenerating(false)
    }

    // --- Note Forge Handler ---
    const handleCreateNoteFromForge = async (data: any) => {
        const { dataStore } = await import('@/lib/data-store')
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        const newId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)
        const now = new Date().toISOString()
        const newNote = {
            id: newId,
            userId: user?.id || 'defaultUser',
            microappId: 'notes-sb',
            data,
            createdAt: now,
            updatedAt: now
        }
        await dataStore.saveEntry(newNote)
        setLinkedNote(newNote)
        setShowForge(false)
        handleUpdateTask({ Notes: newId })
        sileo.success({ description: 'Neural Note Linked' })
    }

    const createdDate = task.createdAt ? new Date(task.createdAt).toLocaleDateString() : '2024-01-01'
    const deadlineStr = getTaskDeadline(task)
    const deadlineDate = deadlineStr ? new Date(deadlineStr).toLocaleDateString() : 'NO_DEADLINE'

    const filteredProjects = projects.filter(p => {
        if (!task.data.Area) return !['completed', 'archived'].includes(p.data.status)
        return p.data.Area === task.data.Area && !['completed', 'archived'].includes(p.data.status)
    })

    return (
        <div className="flex flex-col h-full bg-[#050505] text-white">
            {/* Header Section */}
            <div className="p-8 pb-4 border-b border-white/5 space-y-6 shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-blue-400 font-mono">
                        <span>{areaMap[task.data.Area || ''] || 'AREA_NULL'}</span>
                        <span className="text-white/20">›</span>
                        <span>{projectMap[task.data.Project || ''] || 'PROJECT_NULL'}</span>
                    </div>
                </div>

                <div className="flex justify-between items-start gap-4">
                    <input
                        value={localTitle}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        className={`${playfair.className} text-4xl text-white leading-tight bg-transparent border-none outline-none placeholder:text-white/20 w-full focus:ring-0 px-0`}
                        placeholder="Untitled Node"
                    />
                    <Button variant="ghost" size="icon" className="text-white/30 hover:text-white shrink-0" onClick={onTogglePopup}>
                        {isPopup ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                </div>

                {/* Smart Focus Forge */}
                <div className="mt-6 border border-white/10 rounded-xl p-4 bg-white/[0.02]">
                    <TaskForge
                        task={task}
                        onUpdate={(updates) => handleUpdateTask(updates)}
                        onDelete={async () => {
                            if (!confirm('Are you sure you want to permanently delete this task?')) return
                            const { dataStore } = await import('@/lib/data-store')
                            await dataStore.deleteEntry(task.id)
                            sileo.success({ description: 'Neural Fragment Erased' })
                            onClose()
                            setTimeout(() => window.location.reload(), 1500)
                        }}
                    />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-3 gap-8 pt-2">
                    <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-widest text-white/30">Created Date</p>
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            {createdDate}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-widest text-white/30">Deadline</p>
                        <div className="flex items-center gap-2 text-rose-400 text-xs font-mono">
                            <span className={`w-1.5 h-1.5 rounded-full ${deadlineStr ? 'bg-rose-500' : 'bg-white/20'}`} />
                            {deadlineDate}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[9px] uppercase tracking-widest text-white/30">Status</p>
                        <p className={`text-xs font-mono font-bold ${status ? 'text-emerald-500' : 'text-amber-500'}`}>
                            {status ? 'ENCRYPTED' : 'ACTIVE_SIGNAL'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Linked Relations Dashboard */}
            <div className="p-6 border-b border-white/10 bg-white/[0.01] shrink-0">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Linked Relations</span>
                    <span className="text-[9px] uppercase tracking-widest text-amber-500 font-mono animate-pulse">Active_Link</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Area Dropdown */}
                    <div className="bg-[#0F0F0F] border border-white/10 rounded p-1">
                        <div className="text-[8px] uppercase tracking-widest text-purple-400 mb-1 px-2 pt-1">Area</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center justify-between bg-transparent border-none text-white/80 p-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/50 hover:bg-white/5 transition-colors group">
                                    <span className="truncate">{task.data.Area ? (areaMap[task.data.Area] || 'Untitled Area') : 'NO_AREA'}</span>
                                    <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-amber-500 transition-colors shrink-0 ml-2" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] bg-[#0A0A0A] border-white/10 text-white/70 max-h-[300px] overflow-y-auto custom-scrollbar z-[300]" align="start">
                                <DropdownMenuRadioGroup value={task.data.Area || ''} onValueChange={(val) => handleUpdateTask({ Area: val || null })}>
                                    <DropdownMenuRadioItem value="" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer pl-6">
                                        NO_AREA
                                    </DropdownMenuRadioItem>
                                    {areas.map(a => (
                                        <DropdownMenuRadioItem key={a.id} value={a.id} className="text-xs focus:bg-white/10 focus:text-white cursor-pointer pl-6">
                                            {a.data['Area Name'] || a.data.title || a.data.name || 'Untitled Area'}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="bg-[#0F0F0F] border border-white/10 rounded p-1">
                        <div className="text-[8px] uppercase tracking-widest text-blue-400 mb-1 px-2 pt-1">Project</div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="w-full flex items-center justify-between bg-transparent border-none text-white/80 p-2 rounded text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-500/50 hover:bg-white/5 transition-colors group">
                                    <span className="truncate">{task.data.Project ? (projectMap[task.data.Project] || 'Untitled Project') : 'NO_PROJECT'}</span>
                                    <ChevronDown className="w-3 h-3 text-white/30 group-hover:text-amber-500 transition-colors shrink-0 ml-2" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px] bg-[#0A0A0A] border-white/10 text-white/70 max-h-[300px] overflow-y-auto custom-scrollbar z-[300]" align="start">
                                <DropdownMenuRadioGroup value={task.data.Project || ''} onValueChange={(val) => handleUpdateTask({ Project: val || null })}>
                                    <DropdownMenuRadioItem value="" className="text-xs focus:bg-white/10 focus:text-white cursor-pointer pl-6">
                                        NO_PROJECT
                                    </DropdownMenuRadioItem>
                                    {filteredProjects.map(p => (
                                        <DropdownMenuRadioItem key={p.id} value={p.id} className="text-xs focus:bg-white/10 focus:text-white cursor-pointer pl-6">
                                            {p.data['Project Name'] || p.data.title || 'Untitled Project'}
                                        </DropdownMenuRadioItem>
                                    ))}
                                </DropdownMenuRadioGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                {/* Notes Link Integration */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <NotebookPen className="w-4 h-4" />
                        <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">Signal Log / Neural Note</h3>
                    </div>

                    {linkedNote ? (
                        <div className="bg-[#0A0A0A] border border-emerald-500/30 rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 group hover:border-emerald-500/60 transition-colors">
                            <div>
                                <h4 className="text-white font-serif text-lg leading-none mb-2">{linkedNote.data.Title || 'Untitled Sequence'}</h4>
                                <p className="text-xs text-white/40 font-mono">Last edited: {new Date(linkedNote.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button
                                onClick={() => setShowNotePopup(true)}
                                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 font-bold tracking-widest uppercase text-[10px]"
                            >
                                <ExternalLink className="w-3 h-3 mr-2" />
                                Open Node
                            </Button>
                        </div>
                    ) : (
                        <div className="bg-[#0A0A0A] border border-white/10 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-4 text-center">
                            <div className="text-white/40">
                                <NotebookPen className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                <p className="text-xs">No active notes linked to this task.</p>
                            </div>
                            <Button
                                onClick={() => setShowForge(true)}
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold tracking-widest uppercase text-[10px]"
                            >
                                <Plus className="w-3 h-3 mr-2 text-amber-500" />
                                Create Attached Note
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sub-tasks / Checklist with AI */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-blue-400">
                            <Hash className="w-4 h-4" />
                            <h3 className="text-sm font-bold uppercase tracking-wider text-white/90">Sub-tasks</h3>
                        </div>
                        <Button
                            onClick={handleReverseEngineer}
                            disabled={isGenerating}
                            variant="ghost"
                            className={`h-7 px-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[10px] uppercase font-bold tracking-widest border border-blue-500/20 ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <Sparkles className={`w-3 h-3 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? 'Engineeering...' : 'Reverse Engineer (AI)'}
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <input
                                value={newSubtask}
                                onChange={(e) => setNewSubtask(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSubtask()}
                                placeholder="Add new subtask..."
                                className="flex-1 bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                            />
                            <Button onClick={handleAddSubtask} size="icon" className="bg-white/10 hover:bg-white/20 text-white shrink-0">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        {subtasks.length === 0 && !isGenerating && (
                            <p className="text-xs text-white/30 italic py-2 font-mono">No subtasks defined.</p>
                        )}

                        {subtasks.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 group bg-[#0A0A0A] p-3 rounded-lg border border-white/5">
                                <input
                                    type="checkbox"
                                    id={`st-${i}`}
                                    checked={item.completed}
                                    onChange={() => handleToggleSubtask(i)}
                                    className="appearance-none w-5 h-5 rounded border border-white/20 checked:bg-blue-500 checked:border-blue-500 transition-colors cursor-pointer mt-0.5"
                                />
                                <label
                                    htmlFor={`st-${i}`}
                                    className={`text-sm flex-1 cursor-pointer transition-colors ${item.completed ? 'text-white/30 line-through' : 'text-white/80 group-hover:text-white'}`}
                                >
                                    {item.title}
                                </label>
                                <button onClick={() => handleDeleteSubtask(i)} className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-rose-500 transition-colors p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">System Ready</span>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" className="text-white/40 hover:text-white text-xs uppercase tracking-widest hover:bg-transparent px-2" onClick={onClose}>
                        Close
                    </Button>
                </div>
            </div>

            {/* Modals & Popups */}
            {/* Note Forge (Create Note) */}
            <AnimatePresence>
                {showForge && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div className="relative z-10 w-full max-w-2xl">
                            <NoteForge
                                onClose={() => setShowForge(false)}
                                onCreate={handleCreateNoteFromForge}
                                projects={projects}
                                areas={areas}
                                tasks={tasks}
                                defaultProjectId={task.data.Project || undefined}
                                defaultTaskId={task.id}
                            />
                        </div>
                    </div>
                )}
            </AnimatePresence>

            {/* Note Detail View (View Linked Note) */}
            {showNotePopup && linkedNote && (
                <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowNotePopup(false)} />
                    <div className="relative z-10 w-full max-w-5xl h-[90vh] rounded-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/10">
                        <NoteDetailView
                            note={linkedNote}
                            onClose={() => setShowNotePopup(false)}
                            onUpdate={async (id, updates) => {
                                const { dataStore } = await import('@/lib/data-store')
                                await dataStore.updateEntry(id, updates)
                                setLinkedNote(prev => prev ? { ...prev, data: { ...prev.data, ...updates } } : prev)
                            }}
                            projectMap={projectMap}
                            areaMap={areaMap}
                            taskMap={taskMap}
                            projects={projects}
                            areas={areas}
                            tasks={tasks}
                            isPopupMode={true}
                            onTogglePopup={() => setShowNotePopup(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

export function TaskDetailsSheet({ task, trigger, onUpdate }: TaskDetailsSheetProps) {
    const [open, setOpen] = useState(false)
    const [isPopup, setIsPopup] = useState(false)

    return (
        <>
            {/* Sheet View */}
            <Sheet open={open && !isPopup} onOpenChange={(v) => {
                if (v) setOpen(true)
                else if (!isPopup) setOpen(false) // Only close if we didn't just switch to popup
            }}>
                <SheetTrigger asChild>
                    <div onClick={() => setIsPopup(false)}>
                        {trigger}
                    </div>
                </SheetTrigger>
                <SheetContent className="bg-[#050505] border-l border-white/10 w-full sm:max-w-[800px] p-0 flex flex-col z-[100]" showCloseButton={false}>
                    <SheetTitle className="sr-only">Task Details</SheetTitle>
                    {open && !isPopup && (
                        <TaskDetailsInner
                            task={task}
                            onUpdate={onUpdate}
                            isPopup={false}
                            onTogglePopup={() => setIsPopup(true)}
                            onClose={() => setOpen(false)}
                        />
                    )}
                </SheetContent>
            </Sheet>

            {/* Dialog View */}
            <Dialog open={open && isPopup} onOpenChange={(v) => {
                if (!v) {
                    setOpen(false)
                    setIsPopup(false)
                }
            }}>
                <DialogContent className="max-w-[800px] max-h-[85vh] p-0 overflow-hidden bg-transparent border-none outline-none shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-0 focus:outline-none focus:ring-0 z-[100]" showCloseButton={false}>
                    <DialogTitle className="sr-only">Task Details</DialogTitle>
                    {open && isPopup && (
                        <div className="w-full h-full max-h-[85vh] rounded-xl overflow-hidden border border-white/10 ring-0 focus:outline-none">
                            <TaskDetailsInner
                                task={task}
                                onUpdate={onUpdate}
                                isPopup={true}
                                onTogglePopup={() => setIsPopup(false)}
                                onClose={() => {
                                    setOpen(false)
                                    setIsPopup(false)
                                }}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
