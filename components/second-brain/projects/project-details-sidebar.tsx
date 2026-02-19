'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { X, ChevronDown, Check, FileText, Link as LinkIcon, Download, Plus, Trash2, Lock, AlertTriangle, AlertOctagon, Activity, Square } from 'lucide-react'
import { ProjectEntry, calculateProgress } from './project-utils'
import { Playfair_Display } from '@/lib/font-shim'
import { Entry } from '@/lib/data-store'
import { ProjectAnalyticsModule } from './project-analytics-module'
import { generateAnalytics } from './project-analytics'
import { ProjectCalendar } from './project-calendar'
import { ProjectForge } from './project-forge'

const playfair = Playfair_Display({ subsets: ['latin'] })

import { TaskDetailsSheet } from '../task-details-sheet'

interface ProjectDetailsSidebarProps {
    project: ProjectEntry | null
    onClose: () => void
    onUpdate: (project: ProjectEntry, updates: Partial<ProjectEntry['data']>) => void
    linkedTasks?: Entry[]
    onCreateTask?: (taskData: any) => void
    onUpdateTask?: (task: Entry, updates: Partial<Entry['data']>) => void
    areas?: Entry[]
}

export function ProjectDetailsSidebar({ project, onClose, onUpdate, linkedTasks = [], onCreateTask, onUpdateTask, areas = [] }: ProjectDetailsSidebarProps) {
    // Helper to calculate time remaining
    const getDeadlineText = () => {
        if (!project?.data.deadline) return 'No Deadline'
        const days = Math.ceil((new Date(project.data.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return days < 0 ? `${Math.abs(days)}d Overdue` : `${days}d Remaining`
    }

    const progress = project ? calculateProgress(project.data.subtasks) : 0

    return (
        <Sheet open={!!project} onOpenChange={(open) => !open && onClose()}>
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

                                {/* Area Selector */}
                                <select
                                    className="bg-white/5 border border-white/10 rounded text-[10px] text-white/50 px-2 py-1 uppercase tracking-widest hover:text-white transition-colors cursor-pointer outline-none focus:border-amber-500"
                                    value={project.data.Area || ''}
                                    onChange={(e) => onUpdate(project, { Area: e.target.value || undefined })}
                                >
                                    <option value="">Unassigned</option>
                                    {areas.map(area => (
                                        <option key={area.id} value={area.id}>{area.data.title}</option>
                                    ))}
                                </select>
                            </div>
                            <SheetTitle className={`${playfair.className} text-xl text-white mb-2 leading-tight`}>{project.data.title || 'Untitled Project'}</SheetTitle>
                            <div className="flex gap-2 mb-4">
                                <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${project.data.ragStatus === 'Red' ? 'border-rose-500 text-rose-500 bg-rose-500/10' :
                                    project.data.ragStatus === 'Amber' ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                                        'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                                    }`}>
                                    Health: {project.data.ragStatus || 'Green'}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-white/10 text-white/50 bg-white/5">
                                    ROI: {project.data.priority || 'P3'}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] font-bold uppercase rounded border border-white/10 text-white/50 bg-white/5">
                                    {getDeadlineText()}
                                </span>
                            </div>
                            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${project.data.ragStatus === 'Red' ? 'bg-rose-500' :
                                        project.data.ragStatus === 'Amber' ? 'bg-amber-500' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: `${progress}%` }}
                                />
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
                                <ProjectForge project={project} onUpdate={onUpdate} />
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
                                <div className="space-y-2">
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
                                                                const isDone = task.data.Status === true || task.data.Status === 'Done'
                                                                onUpdateTask(task, { Status: isDone ? 'backlog' : true })
                                                            }
                                                        }}
                                                    >
                                                        {task.data.Status === true || task.data.Status === 'Done' ? (
                                                            <div className="w-4 h-4 bg-emerald-500 rounded flex items-center justify-center text-black hover:bg-emerald-400 transition-colors">
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                        ) : (
                                                            <div className="w-4 h-4 border border-white/20 rounded group-hover:border-white/50 hover:bg-white/10 transition-colors" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`text-sm font-medium truncate ${task.data.Status === true || task.data.Status === 'Done' ? 'text-white/30 line-through' : 'text-white/90'}`}>
                                                            {task.data.Title || 'Untitled Task'}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] uppercase tracking-wider text-white/40 bg-white/5 px-1.5 rounded">{task.data.Status || 'Backlog'}</span>
                                                            {task.data.Priority && <span className="text-[10px] uppercase tracking-wider text-amber-500/60 bg-amber-500/10 px-1.5 rounded">{task.data.Priority}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    ))}

                                    <button
                                        className="w-full py-2 flex items-center justify-center gap-2 text-xs uppercase tracking-wider border border-dashed border-white/10 rounded-lg text-white/30 hover:text-white hover:border-white/30 hover:bg-white/5 transition-all"
                                        onClick={() => {
                                            if (onCreateTask && project) {
                                                onCreateTask({
                                                    id: crypto.randomUUID(),
                                                    microappId: 'tasks',
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
                                        <Plus className="w-3 h-3" /> Create Linked Task
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
