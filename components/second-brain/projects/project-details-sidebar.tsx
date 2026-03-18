'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Sparkles, X, ChevronDown, Check, FileText, Link as LinkIcon, Download, Plus, Trash2, Lock, AlertTriangle, AlertOctagon, Activity, Square, Calendar } from 'lucide-react'
import { ProjectEntry, calculateProgress } from './project-utils'
import { Bebas_Neue } from '@/lib/font-shim'
import { Entry, dataStore } from '@/lib/data-store'
import { cn } from '@/lib/utils'
import { ProjectAnalyticsModule } from './project-analytics-module'
import { generateAnalytics } from './project-analytics'
import { ProjectCalendar } from './project-calendar'
import { ProjectForge } from './project-forge'
import { getTaskTitle, getTaskDeadline, getProjectTitle, getProjectDeadline } from '../utils'
import { sileo } from 'sileo'
import { ProjectCleanupModal } from './project-cleanup-modal'

const bebas = Bebas_Neue({ subsets: ['latin'] })

import { TaskDetailsSheet } from '../task-details-sheet'

interface ProjectDetailsSidebarProps {
    project: ProjectEntry | null
    onClose: () => void
    onUpdate: (project: ProjectEntry, updates: Partial<ProjectEntry['data']>) => void
    linkedTasks?: Entry[]
    onCreateTask?: (taskData: any) => void
    onUpdateTask?: (task: Entry, updates: Partial<Entry['data']>) => void
    onDeleteLinkedTask?: (taskId: string) => Promise<void>
    areas?: Entry[]
    habits?: Entry[]
}

export function ProjectDetailsSidebar({ project, onClose, onUpdate, linkedTasks = [], onCreateTask, onUpdateTask, onDeleteLinkedTask, areas = [], habits = [] }: ProjectDetailsSidebarProps) {
    const [showCleanupModal, setShowCleanupModal] = useState(false)
    const deadline = getProjectDeadline(project)
    // Helper to calculate time remaining
    const getDeadlineText = () => {
        if (!deadline) return 'No Deadline'
        const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return days < 0 ? `${Math.abs(days)}d Overdue` : `${days}d Remaining`
    }

    const progress = project ? calculateProgress(project.data.subtasks) : 0

    return (
        <>
            <Sheet open={!!project && !showCleanupModal} onOpenChange={(open) => !open && !showCleanupModal && onClose()}>
                <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-[#080808] border-l border-white/10 z-[100]">

                    {project && (
                        <>
                            {/* Header */}
                            <div className="p-6 border-b border-white/10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold flex items-center gap-2">
                                        <Activity className="w-3 h-3 text-emerald-500" />
                                        Project Context
                                    </div>

                                    <div className="flex gap-2">
                                        {/* Area Selector */}
                                        <select
                                            className="bg-white/5 border border-white/10 rounded text-[10px] text-white/50 px-2 py-1 uppercase tracking-widest hover:text-white transition-colors cursor-pointer outline-none focus:border-amber-500 max-w-[120px]"
                                            value={project.data.Area || ''}
                                            onChange={(e) => onUpdate(project, { Area: e.target.value || undefined })}
                                        >
                                            <option value="">No Area</option>
                                            {areas.map(area => (
                                                <option key={area.id} value={area.id}>{area.data.title}</option>
                                            ))}
                                        </select>

                                        {/* Habit Selector */}
                                        <select
                                            className="bg-white/5 border border-white/10 rounded text-[10px] text-white/50 px-2 py-1 uppercase tracking-widest hover:text-white transition-colors cursor-pointer outline-none focus:border-amber-500 max-w-[120px]"
                                            value={project.data.Habit || ''}
                                            onChange={(e) => onUpdate(project, { Habit: e.target.value || undefined })}
                                        >
                                            <option value="">No Habit</option>
                                            {habits.map(habit => (
                                                <option key={habit.id} value={habit.id}>{habit.data['Habit Name'] || habit.id}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <SheetTitle className={`${bebas.className} text-xl text-white mb-2 leading-tight`}>{getProjectTitle(project)}</SheetTitle>
                                <div className="flex gap-2 mb-4">
                                    <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${project.data.ragStatus === 'Red' ? 'border-rose-500 text-rose-500 bg-rose-500/10' :
                                        project.data.ragStatus === 'Amber' ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                                            'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                                        }`}>
                                        Health: {project.data.ragStatus || 'Green'}
                                    </span>
                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-white/10 text-white/50 bg-white/5">
                                        ROI: {project.data.priority || 'Low'}
                                    </span>
                                    <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-white/10 text-white/50 bg-white/5">
                                        {getDeadlineText()}
                                    </span>
                                </div>
                                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/[0.03]">
                                    <div
                                        className={cn(
                                            "h-full transition-all duration-1000 ease-out relative overflow-hidden",
                                            progress > 0 
                                                ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" 
                                                : "bg-white/10"
                                        )}
                                        style={{ width: `${progress}%` }}
                                    >
                                        <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                    </div>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">

                                {/* Blockers Alert */}
                                {project.data.blockedBy && (
                                    <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-lg">
                                        <div className="flex items-center gap-2 text-rose-500 mb-2 font-bold text-xs uppercase tracking-wider">
                                            <AlertOctagon className="w-4 h-4" /> Active Constraint
                                        </div>
                                        <p className="text-sm text-rose-200/80">{project.data.blockedBy}</p>
                                    </div>
                                )}

                                {/* Sections */}
                                <CollapsibleSection title="Command Override" defaultOpen>
                                    <ProjectForge
                                        project={project}
                                        onUpdate={onUpdate}
                                        onDelete={async () => {
                                            setShowCleanupModal(true)
                                        }}
                                    />
                                </CollapsibleSection>

                                <CollapsibleSection title="Neural Analytics" defaultOpen>
                                    <ProjectAnalyticsModule metrics={generateAnalytics(project, linkedTasks)} />
                                </CollapsibleSection>

                                <CollapsibleSection title="Timeline Grid" defaultOpen>
                                    <ProjectCalendar
                                        tasks={linkedTasks}
                                        projectStart={project.data.startDate}
                                        projectDeadline={project.data.deadline}
                                    />
                                </CollapsibleSection>

                                <CollapsibleSection title="Linked Tasks" count={linkedTasks.length} defaultOpen>
                                    <div className="space-y-3">
                                        {/* AI Architect Trigger for Empty Projects */}
                                        {linkedTasks.length === 0 && (
                                            <button
                                                onClick={async () => {
                                                    const { sileo } = await import('sileo')
                                                    const { generateProjectPlan } = await import('@/app/actions/project-architect')
                                                    const { dataStore } = await import('@/lib/data-store')
                                                    
                                                    try {
                                                        sileo.info({ description: 'Architecting your neural roadmap...' })
                                                        const habit = habits.find(h => h.id === project.data.Habit)
                                                        const habitName = habit?.data['Habit Name'] || 'General Deep Work'
                                                        
                                                        const aiTasks = await generateProjectPlan(
                                                            getProjectTitle(project),
                                                            project.data.description || getProjectTitle(project),
                                                            habitName,
                                                            project.data.startDate || new Date().toISOString(),
                                                            project.data.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                                                        )

                                                        for (const task of aiTasks) {
                                                            if (onCreateTask) {
                                                                onCreateTask({
                                                                    id: crypto.randomUUID(),
                                                                    microappId: 'tasks-sb',
                                                                    data: {
                                                                        Title: task.title,
                                                                        Status: 'backlog',
                                                                        Project: project.id,
                                                                        Habit: project.data.Habit,
                                                                        DueDate: task.data.scheduled_date,
                                                                        Duration: task.data.duration_mins,
                                                                        Priority: task.data.is_essential ? 'High' : 'Medium',
                                                                        Notes: `${task.data.description}\n\nAI Tip: ${task.data.professional_tip}`
                                                                    }
                                                                })
                                                            }
                                                        }
                                                        sileo.success({ description: `Project architecture complete: ${aiTasks.length} tasks committed.` })
                                                    } catch (e: any) {
                                                        sileo.error({ description: 'Neural Architect Offline: ' + e.message })
                                                    }
                                                }}
                                                className="w-full p-6 border-2 border-dashed border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/40 rounded-xl transition-all group flex flex-col items-center gap-3 text-center"
                                            >
                                                <div className="p-3 bg-amber-500/20 rounded-full text-amber-500 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                                                    <Sparkles className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-white uppercase tracking-widest group-hover:text-amber-500 transition-colors">Neural Roadmap Engine</div>
                                                    <p className="text-[10px] text-white/40 mt-1 uppercase tracking-wider">Generate AI task structure based on project goals</p>
                                                </div>
                                            </button>
                                        )}

                                        {/* Display Actual Linked Tasks */}
                                        {linkedTasks.map((task) => (
                                            <TaskDetailsSheet
                                                key={task.id}
                                                task={task}
                                                trigger={
                                                    <div className="flex items-start gap-3 p-3 bg-white/5 rounded border border-white/5 hover:border-white/20 transition-all group cursor-pointer text-left">
                                                        <div
                                                            className="mt-0.5"
                                                            onClick={(e) => {
                                                                e.stopPropagation() // Prevent sheet opening
                                                                if (onUpdateTask) {
                                                                    const isDone = task.data.Status === true || task.data.Status === 'Done' || task.data.Status === 'done'
                                                                    onUpdateTask(task, { Status: isDone ? 'backlog' : 'done' })
                                                                }
                                                            }}
                                                        >
                                                            {task.data.Status === true || task.data.Status === 'Done' || task.data.Status === 'done' ? (
                                                                <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center text-black hover:bg-emerald-400 transition-colors">
                                                                    <Check className="w-3 h-3" />
                                                                </div>
                                                            ) : (
                                                                <div className="w-4 h-4 border border-white/20 rounded group-hover:border-white/50 hover:bg-white/10 transition-colors" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className={`text-sm font-medium truncate ${task.data.Status === true || task.data.Status === 'Done' || task.data.Status === 'done' ? 'text-white/30 line-through' : 'text-white/90'}`}>
                                                                {getTaskTitle(task)}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] uppercase tracking-wider text-white/40 bg-white/5 px-1.5 rounded">{task.data.Status || 'Backlog'}</span>
                                                                {task.data.Priority && <span className="text-[10px] uppercase tracking-wider text-amber-500/60 bg-amber-500/10 px-1.5 rounded">{task.data.Priority}</span>}
                                                                {getTaskDeadline(task) && (
                                                                    <span className="text-[10px] uppercase tracking-wider text-blue-400/60 bg-blue-400/10 px-1.5 rounded flex items-center gap-1">
                                                                        <Calendar className="w-2.5 h-2.5" />
                                                                        {new Date(getTaskDeadline(task)!).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                }
                                            />
                                        ))}

                                        <button
                                            className="w-full py-2 flex items-center justify-center gap-2 text-[10px] uppercase tracking-[0.2em] border border-dashed border-white/10 rounded-lg text-white/30 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all font-bold"
                                            onClick={() => {
                                                if (onCreateTask && project) {
                                                    onCreateTask({
                                                        id: crypto.randomUUID(),
                                                        microappId: 'tasks-sb',
                                                        data: {
                                                            Title: 'New Project Task',
                                                            Status: 'backlog',
                                                            Project: project.id, // AUTO-LINK
                                                            createdAt: new Date().toISOString()
                                                        }
                                                    })
                                                }
                                            }}
                                        >
                                            <Plus className="w-3 h-3" /> Create Manual Task
                                        </button>
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection title="Knowledge Base" count={project.data.notes?.length || 0}>
                                    <div className="space-y-3">
                                        {project.data.notes?.map((note) => (
                                            <div key={note.id} className="p-3 bg-white/5 rounded border border-white/5 hover:border-white/20 transition-colors group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                                        <FileText className="w-3 h-3 text-blue-500" />
                                                        {note.title}
                                                    </h4>
                                                    <button className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-rose-500 transition-all">
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                                <p className="text-xs text-white/50 line-clamp-2">{note.content}</p>
                                            </div>
                                        ))}
                                        <button
                                            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center text-white/40 hover:text-white transition-colors text-xs"
                                            onClick={() => {
                                                const newNote = { id: crypto.randomUUID(), title: 'New Field Note', content: 'Observations from the neural interface...', createdAt: new Date().toISOString() }
                                                const newNotes = [...(project.data.notes || []), newNote]
                                                onUpdate(project, { notes: newNotes })
                                            }}
                                        >
                                            <Plus className="w-3 h-3 mr-2" /> Log Entry
                                        </button>
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection title="Asset Uplink" count={project.data.resources?.length || 0}>
                                    <div className="space-y-2">
                                        {project.data.resources?.map((res) => (
                                            <div key={res.id} className="flex items-center justify-between p-2 pl-3 bg-white/5 rounded hover:bg-white/10 cursor-pointer group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    {res.type === 'link' ? <LinkIcon className="w-3 h-3 text-amber-500 flex-shrink-0" /> : <LinkIcon className="w-3 h-3 text-emerald-500 flex-shrink-0" />}
                                                    <span className="text-xs text-white/80 truncate">{res.title}</span>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white">
                                                        <LinkIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            className="w-full py-2 flex items-center justify-center text-xs text-white/30 hover:text-amber-500 transition-colors"
                                            onClick={() => {
                                                const newRes = { id: crypto.randomUUID(), title: 'External Reference', type: 'link' as const, url: '#' }
                                                const newResources = [...(project.data.resources || []), newRes]
                                                onUpdate(project, { resources: newResources })
                                            }}
                                        >
                                            <Plus className="w-3 h-3 mr-1" /> Attach Asset
                                        </button>
                                    </div>
                                </CollapsibleSection>
                            </div >
                        </>
                    )
                    }
                </SheetContent >
            </Sheet >

            {/* Cleanup Modal */}
            {
                project && (
                    <ProjectCleanupModal
                        open={showCleanupModal}
                        onOpenChange={setShowCleanupModal}
                        projectTitle={getProjectTitle(project)}
                        tasks={linkedTasks}
                        notes={project.data.notes || []}
                        resources={project.data.resources || []}
                        onConfirmDelete={async (decisions) => {
                            const { dataStore } = await import('@/lib/data-store')

                            // 1. Handle linked TASKS (real DB entries)
                            for (const task of linkedTasks) {
                                const action = decisions[task.id]
                                if (!action) continue
                                try {
                                    if (action === 'delete') {
                                        await dataStore.deleteEntry(task.id)
                                    } else if (action === 'inbox') {
                                        // Unlink from project and put to backlog
                                        const { Project: _p, projectId: _pid, ...rest } = task.data
                                        await dataStore.updateEntry(task.id, { ...rest, Project: undefined, projectId: undefined, Status: 'backlog' })
                                    } else if (action === 'archive') {
                                        const { Project: _p, projectId: _pid, ...rest } = task.data
                                        await dataStore.updateEntry(task.id, { ...rest, Project: undefined, projectId: undefined, Status: 'archived' })
                                    }
                                } catch (e) {
                                    console.error(`Failed to handle task ${task.id}:`, e)
                                }
                            }

                            // 2. Handle embedded NOTES (stored in project.data.notes[])
                            // Notes/Resources with archive or inbox will be saved as standalone inbox entries
                            const notesList: any[] = project.data.notes || []
                            for (const note of notesList) {
                                const action = decisions[note.id]
                                if (!action || action === 'delete') continue
                                try {
                                    // Create a standalone note entry in the inbox
                                    const { data: { user } } = await import('@/utils/supabase/client').then(m => m.createClient().auth.getUser())
                                    await dataStore.addEntry(user?.id || '', 'notes-sb', {
                                        Title: note.title,
                                        Content: note.content || '',
                                        Status: action === 'archive' ? 'archived' : 'inbox',
                                        Tags: note.tags || [],
                                    })
                                } catch (e) {
                                    console.error(`Failed to move note ${note.id}:`, e)
                                }
                            }

                            // 3. Handle embedded RESOURCES (stored in project.data.resources[])
                            const resourcesList: any[] = project.data.resources || []
                            for (const resource of resourcesList) {
                                const action = decisions[resource.id]
                                if (!action || action === 'delete') continue
                                try {
                                    const { data: { user } } = await import('@/utils/supabase/client').then(m => m.createClient().auth.getUser())
                                    await dataStore.addEntry(user?.id || '', 'resources-sb', {
                                        Title: resource.title,
                                        URL: resource.url || '',
                                        Type: resource.type || '',
                                        Status: action === 'archive' ? 'archived' : 'inbox',
                                    })
                                } catch (e) {
                                    console.error(`Failed to move resource ${resource.id}:`, e)
                                }
                            }

                            // 4. Delete the project itself
                            await dataStore.deleteEntry(project.id)
                            sileo.success({ description: 'Project dissolved. Items redistributed.' })
                            setShowCleanupModal(false)
                            onClose()
                            setTimeout(() => window.location.reload(), 1500)
                        }}
                    />
                )
            }
        </>
    )
}

function CollapsibleSection({ title, count, children, defaultOpen = false }: { title: string, count?: number, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="space-y-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-white/40 hover:text-white group transition-colors"
            >
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                    {title}
                </div>
                {count !== undefined && <span className="text-[10px] font-mono bg-white/5 px-1.5 rounded text-white/30 group-hover:text-white/50">{count}</span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
