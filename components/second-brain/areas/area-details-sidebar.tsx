'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChevronDown, Activity, LayoutGrid, Clock, CheckCircle2, Circle, ArrowUpRight, Trash2 } from 'lucide-react'
import { AreaEntry } from './area-utils'
import { Playfair_Display } from '@/lib/font-shim'
import { Input } from '@/components/ui/input'
import { Entry } from '@/lib/data-store'
import { getTaskTitle, getProjectTitle, getTaskDeadline, getProjectDeadline } from '../utils'
import { cn } from '@/lib/utils'
import { ProjectDetailsSidebar } from '../projects/project-details-sidebar'
import { TaskDetailsSheet } from '../task-details-sheet'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface AreaDetailsSidebarProps {
    area: AreaEntry | null
    onClose: () => void
    onUpdate: (area: AreaEntry, updates: Partial<AreaEntry['data']>) => void
    onDelete?: (areaId: string) => void
    onDeleteProject?: (projectId: string) => void
    onDeleteTask?: (taskId: string) => void
    onUpdateProject?: (project: Entry, updates: Partial<Entry['data']>) => void
    onUpdateTask?: (task: Entry, updates: Partial<Entry['data']>) => void
    projects?: Entry[]
    tasks?: Entry[]
}

export function AreaDetailsSidebar({ 
    area, onClose, onUpdate, onDelete, 
    onDeleteProject, onDeleteTask, 
    onUpdateProject, onUpdateTask,
    projects = [], tasks = [] 
}: AreaDetailsSidebarProps) {
    if (!area) return null

    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)

    const linkedProjects = projects.filter(p => p.data.Area === area.id)
    const linkedProjectIds = new Set(linkedProjects.map(p => p.id))
    
    const linkedTasks = tasks.filter(t => {
        // Direct link to area
        if (t.data.Area === area.id) return true
        
        // Indirect link via project
        const p = t.data.Project || t.data.projectId
        const pId = typeof p === 'object' ? p?.id : p
        return pId && linkedProjectIds.has(pId)
    })
    
    const selectedProject = projects.find(p => p.id === selectedProjectId)

    return (
        <Sheet open={!!area} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-[#080808] border-l border-white/10 z-[100]">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10 shadow-inner">
                                {area.data.icon || '🪐'}
                            </div>
                            <div>
                                <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-1 font-bold flex items-center gap-2">
                                    <LayoutGrid className="w-3 h-3 text-purple-500" />
                                    Domain Map
                                </div>
                                <SheetTitle className={`${playfair.className} text-2xl text-white leading-tight`}>{area.data.title}</SheetTitle>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Convergence</span>
                                {(() => {
                                    const total = linkedTasks.length
                                    const done = linkedTasks.filter(t => {
                                        const s = String(t.data.Status).toLowerCase()
                                        return t.data.Status === true || s === 'true' || s === 'done' || s === 'completed' || t.data.done
                                    }).length
                                    const p = total > 0 ? Math.round((done / total) * 100) : 0
                                    return (
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden border border-white/10">
                                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${p}%` }} />
                                            </div>
                                            <span className="text-[10px] text-purple-400 font-mono font-bold">{p}%</span>
                                        </div>
                                    )
                                })()}
                            </div>
                            {onDelete && (
                                <button 
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this area? This cannot be undone.')) {
                                            onDelete(area.id)
                                        }
                                    }}
                                    className="p-2 hover:bg-rose-500/10 rounded-lg text-white/20 hover:text-rose-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded border ${area.data.ragStatus === 'Red' ? 'border-rose-500 text-rose-500 bg-rose-500/10' :
                            area.data.ragStatus === 'Amber' ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                                'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                            }`}>
                            Vitality: {area.data.ragStatus || 'Green'}
                        </span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    <CollapsibleSection title="Core Definitions" defaultOpen>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">High Level Goal</label>
                                <Input
                                    className="bg-white/5 border-white/10 text-white shadow-none focus-visible:ring-purple-500/20"
                                    value={area.data.goal || ''}
                                    onChange={(e) => onUpdate(area, { goal: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">Icon</label>
                                <Input
                                    className="bg-white/5 border-white/10 text-white w-20 text-center shadow-none focus-visible:ring-purple-500/20"
                                    value={area.data.icon || ''}
                                    onChange={(e) => onUpdate(area, { icon: e.target.value })}
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Domain Analytics */}
                    <CollapsibleSection title="Domain Analytics" defaultOpen>
                        <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-4">
                            <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase tracking-widest font-bold">
                                <Activity className="w-4 h-4 text-purple-400" />
                                <span>Strategic Distribution</span>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                {(() => {
                                    const stats = {
                                        inbox: linkedTasks.filter(t => !t.data.Status || String(t.data.Status).toLowerCase() === 'inbox' || String(t.data.Status).toLowerCase() === 'backlog').length,
                                        active: linkedTasks.filter(t => ['active', 'in progress', 'working on'].includes(String(t.data.Status).toLowerCase())).length,
                                        done: linkedTasks.filter(t => [true, 'true', 'done', 'completed'].includes(t.data.Status)).length
                                    }
                                    return (
                                        <>
                                            <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex flex-col items-center">
                                                <span className="text-xl font-bold text-white leading-none">{stats.inbox}</span>
                                                <span className="text-[8px] text-white/30 uppercase mt-2 tracking-tighter">Entropic</span>
                                            </div>
                                            <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 flex flex-col items-center">
                                                <span className="text-xl font-bold text-amber-500 leading-none">{stats.active}</span>
                                                <span className="text-[8px] text-amber-500/30 uppercase mt-2 tracking-tighter">Active</span>
                                            </div>
                                            <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10 flex flex-col items-center">
                                                <span className="text-xl font-bold text-emerald-500 leading-none">{stats.done}</span>
                                                <span className="text-[8px] text-emerald-500/30 uppercase mt-2 tracking-tighter">Decay</span>
                                            </div>
                                        </>
                                    )
                                })()}
                            </div>
                            <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                                <span className="text-[9px] text-white/20 uppercase tracking-widest font-mono">Domain Momentum</span>
                                <span className="text-[10px] text-white/50 font-mono tracking-tighter">{linkedTasks.length} Active Waves</span>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Strategic Projects */}
                    <CollapsibleSection title="Strategic Projects" count={linkedProjects.length} defaultOpen={linkedProjects.length > 0}>
                        <div className="grid grid-cols-1 gap-3">
                            {linkedProjects.length === 0 ? (
                                <p className="text-[10px] text-white/20 italic py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01] text-center uppercase tracking-widest px-4 font-mono">
                                    No strategic projects anchored.
                                </p>
                            ) : (
                                linkedProjects.map(project => {
                                    const deadline = getProjectDeadline(project)
                                    const isDone = project.data.Status === 'Done' || project.data.Status === 'completed'
                                    return (
                                        <div 
                                            key={project.id} 
                                            onClick={() => setSelectedProjectId(project.id)}
                                            className="p-4 rounded-xl border border-white/5 bg-[#0A0A0A] hover:bg-[#0F0F0F] hover:border-blue-500/30 transition-all group cursor-pointer shadow-sm relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-2xl -mr-8 -mt-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                            
                                            <div className="flex items-start gap-4 transition-transform duration-300 group-hover:translate-x-1">
                                                <div className="mt-1">
                                                    {isDone ? (
                                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border border-blue-500/30 flex items-center justify-center group-hover:border-blue-500 transition-colors">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-white font-bold truncate group-hover:text-blue-400 transition-colors">
                                                        {getProjectTitle(project)}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[9px] text-white/30 mt-2 font-mono">
                                                        <span className={cn(
                                                            "uppercase tracking-widest px-1.5 py-0.5 rounded border",
                                                            isDone ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-blue-500/20 text-blue-400 bg-blue-500/5"
                                                        )}>
                                                            {project.data.Status || 'INBOX'}
                                                        </span>
                                                        {deadline && (
                                                            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
                                                                <Clock className="w-3 h-3 text-white/20" />
                                                                <span className="uppercase">{new Date(deadline).toLocaleDateString()}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-all" />
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CollapsibleSection>

                    {/* Operational Signals */}
                    <CollapsibleSection title="Operational Signals" count={linkedTasks.length} defaultOpen={linkedTasks.length > 0}>
                        <div className="grid grid-cols-1 gap-3">
                            {linkedTasks.length === 0 ? (
                                <p className="text-[10px] text-white/20 italic py-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01] text-center uppercase tracking-widest px-4 font-mono">
                                    No active signals detected.
                                </p>
                            ) : (
                                linkedTasks.map(task => {
                                    const deadline = getTaskDeadline(task)
                                    const status = String(task.data.Status || '').toLowerCase()
                                    const isDone = task.data.Status === true || status === 'true' || status === 'done' || status === 'completed' || task.data.done
                                    const isActive = status === 'active' || status === 'wait' || status === 'waiting' || status === 'in progress'
                                    
                                    return (
                                        <TaskDetailsSheet
                                            key={task.id}
                                            task={task}
                                            onUpdate={(updates) => onUpdateTask?.(task, updates)}
                                            onDelete={() => onDeleteTask?.(task.id)}
                                            trigger={
                                                <div className="p-4 rounded-xl border border-white/5 bg-[#0A0A0A] hover:bg-[#0F0F0F] hover:border-amber-500/30 transition-all group cursor-pointer relative overflow-hidden">
                                                    <div className={cn(
                                                        "absolute left-0 top-0 bottom-0 w-1 opacity-40",
                                                        isDone ? "bg-emerald-500" : isActive ? "bg-blue-500" : "bg-white/20"
                                                    )} />
                                                    
                                                    <div className="flex items-center gap-4">
                                                        <div className="shrink-0">
                                                            {isDone ? (
                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                            ) : isActive ? (
                                                                <div className="w-4 h-4 rounded-full border border-blue-500/30 flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                                </div>
                                                            ) : (
                                                                <Circle className="w-4 h-4 text-white/20 group-hover:text-white/40 transition-colors" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                                <div className="text-xs text-white group-hover:text-amber-500 transition-colors truncate font-bold">
                                                                    {getTaskTitle(task)}
                                                                </div>
                                                                {(() => {
                                                                    const p = task.data.Project || task.data.projectId
                                                                    const pId = typeof p === 'object' ? p?.id : p
                                                                    const projName = pId ? projects.find(pr => pr.id === pId)?.data['Project Name'] || projects.find(pr => pr.id === pId)?.data.title : null
                                                                    if (!projName) return null
                                                                    return (
                                                                        <span className="text-[7px] px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono uppercase truncate max-w-[100px] font-bold">
                                                                            {projName}
                                                                        </span>
                                                                    )
                                                                })()}
                                                            </div>
                                                            <div className="flex items-center justify-between text-[8px] font-mono text-white/30 uppercase tracking-[0.1em]">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn(
                                                                        "px-1 rounded-sm",
                                                                        isDone ? "text-emerald-500 bg-emerald-500/5" : isActive ? "text-blue-400 bg-blue-500/5" : "text-white/20 bg-white/5"
                                                                    )}>
                                                                        {isActive ? 'ACTIVE_FLOW' : isDone ? 'SYNC_DONE' : 'IDLE_BUFFER'}
                                                                    </span>
                                                                </div>
                                                                {deadline && (
                                                                    <div className="flex items-center gap-1 group-hover:text-white/50 transition-colors">
                                                                        <Clock className="w-2.5 h-2.5" />
                                                                        <span>{new Date(deadline).toLocaleDateString()}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            }
                                        />
                                    )
                                })
                            )}
                        </div>
                    </CollapsibleSection>
                </div>
            </SheetContent>

            {/* Nested Detail Sidebar */}
            <ProjectDetailsSidebar
                project={selectedProject as any || null}
                onClose={() => setSelectedProjectId(null)}
                onUpdate={(p, updates) => onUpdateProject?.(p as any, updates)}
                onDelete={(id) => {
                    onDeleteProject?.(id)
                    setSelectedProjectId(null)
                }}
                linkedTasks={tasks.filter(t => t.data.Project === selectedProjectId)}
                onDeleteLinkedTask={onDeleteTask}
                onUpdateTask={onUpdateTask}
            />
        </Sheet>
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
