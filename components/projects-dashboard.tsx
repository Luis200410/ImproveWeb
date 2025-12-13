'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreVertical, Calendar, CheckSquare, Layers } from 'lucide-react'
import { Entry } from '@/lib/data-store'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { cn } from '@/lib/utils'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface ProjectsDashboardProps {
    projects: Entry[]
    tasks: Entry[] // Needed for progress calculation
    areas: Entry[] // Needed for area mapping
    onUpdateProject: (projectId: string, updates: Record<string, any>) => void
    onEditProject: (project: Entry) => void
    onCreateProject: (status?: string) => void
}

const STATUS_COLUMNS = ['Backlog', 'In Progress', 'In Review', 'Done']

export function ProjectsDashboard({ projects, tasks, areas, onUpdateProject, onEditProject, onCreateProject }: ProjectsDashboardProps) {
    const [draggedProject, setDraggedProject] = useState<string | null>(null)

    // Helper: Calculate progress for a project
    const getProjectProgress = (projectId: string) => {
        // Find tasks linked to this project
        // Note: Project field in tasks is a relation, which usually stores the ID or object
        const projectTasks = tasks.filter(t => {
            const projectRel = t.data['Project']
            // Handle both object (if resolved) or string ID
            const relId = typeof projectRel === 'object' ? projectRel?.id : projectRel
            return relId === projectId
        })

        if (projectTasks.length === 0) return 0
        const completed = projectTasks.filter(t => t.data['Status'] === 'Done').length
        return Math.round((completed / projectTasks.length) * 100)
    }

    // Helper: Get Area name
    const getAreaName = (areaRel: any) => {
        if (!areaRel) return null
        const areaId = typeof areaRel === 'object' ? areaRel.id : areaRel
        const area = areas.find(a => a.id === areaId)
        return area?.data['Area Name'] || 'Unassigned Area'
    }

    // Group projects by status
    const columns = useMemo(() => {
        const cols: Record<string, Entry[]> = {}
        STATUS_COLUMNS.forEach(s => cols[s] = [])
        projects.forEach(p => {
            const status = p.data['Status'] || 'Backlog'
            if (cols[status]) cols[status].push(p)
            else cols['Backlog'].push(p) // Default fallback
        })
        return cols
    }, [projects])

    const handleDragStart = (e: React.DragEvent, projectId: string) => {
        setDraggedProject(projectId)
        e.dataTransfer.setData('text/plain', projectId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault()
        const projectId = e.dataTransfer.getData('text/plain')
        if (projectId) {
            onUpdateProject(projectId, { 'Status': status })
        }
        setDraggedProject(null)
    }

    return (
        <div className="w-full h-full overflow-x-auto pb-8">
            <div className="flex gap-6 min-w-max px-4">
                {STATUS_COLUMNS.map((col) => (
                    <div
                        key={col}
                        className="w-[350px] flex-shrink-0"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, col)}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4 px-2">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    col === 'Done' ? "bg-emerald-500" :
                                        col === 'In Progress' ? "bg-amber-500" :
                                            col === 'In Review' ? "bg-purple-500" : "bg-white/20"
                                )} />
                                <h3 className={`${playfair.className} text-white font-bold text-lg`}>{col}</h3>
                                <span className="text-white/30 text-xs font-mono">{columns[col].length}</span>
                            </div>
                            <button
                                onClick={() => onCreateProject(col)}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <Plus className="w-4 h-4 text-white/40" />
                            </button>
                        </div>

                        {/* Drop Zone / List */}
                        <div className="flex flex-col gap-4 min-h-[200px]">
                            <AnimatePresence>
                                {columns[col].map((project) => {
                                    const progress = getProjectProgress(project.id)
                                    const areaName = getAreaName(project.data['Area'])

                                    return (
                                        <motion.div
                                            key={project.id}
                                            layoutId={project.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e as any, project.id)}
                                            onClick={() => onEditProject(project)}
                                            className="bg-[#0A0A0A] border border-white/10 rounded-xl p-5 hover:border-white/30 cursor-pointer group active:cursor-grabbing transition-all hover:bg-white/5"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                {areaName && (
                                                    <div className="bg-white/5 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider text-white/50 border border-white/5 flex items-center gap-1">
                                                        <Layers className="w-3 h-3" />
                                                        {areaName}
                                                    </div>
                                                )}
                                                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="w-4 h-4 text-white/40 hover:text-white" />
                                                </div>
                                            </div>

                                            <h4 className={`${playfair.className} text-xl font-bold text-white mb-2 leading-tight`}>
                                                {project.data['Project Name'] || 'Untitled Project'}
                                            </h4>

                                            {project.data['Description'] && (
                                                <p className="text-white/40 text-sm line-clamp-2 mb-4 font-light">
                                                    {project.data['Description']}
                                                </p>
                                            )}

                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center text-xs text-white/40 mb-1.5">
                                                    <span>Progress</span>
                                                    <span>{progress}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${progress}%` }}
                                                        transition={{ duration: 1, ease: "easeOut" }}
                                                        className={cn(
                                                            "h-full rounded-full transition-colors duration-500",
                                                            progress === 100 ? "bg-emerald-500" : "bg-white"
                                                        )}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-3 border-t border-white/5 text-xs text-white/40">
                                                {project.data['Deadline'] && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>{new Date(project.data['Deadline']).toLocaleDateString()}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </AnimatePresence>
                            {columns[col].length === 0 && (
                                <div
                                    className="h-24 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-white/20 text-xs uppercase tracking-widest hover:border-white/10 hover:bg-white/5 transition-all cursor-pointer"
                                    onClick={() => onCreateProject(col)}
                                >
                                    Empty
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
