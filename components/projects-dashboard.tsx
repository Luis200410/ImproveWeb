'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, MoreVertical, Calendar, CheckSquare, Layers, Image as ImageIcon } from 'lucide-react'
import { Entry } from '@/lib/data-store'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { cn } from '@/lib/utils'
import Image from 'next/image'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

import { ProjectCard } from '@/components/second-brain/projects/project-card'
import { ProjectEntry } from '@/components/second-brain/projects/project-utils'

interface ProjectsDashboardProps {
    projects: ProjectEntry[]
    tasks: Entry[] // Needed for progress calculation
    areas: Entry[] // Needed for area mapping
    onUpdateProject: (projectId: string, updates: Record<string, any>) => void
    onEditProject: (project: ProjectEntry) => void
    onCreateProject: (status?: string) => void
    statusOptions?: string[]
}

const DEFAULT_STATUS_COLUMNS = ['Backlog', 'In Progress', 'In Review', 'Done']

export function ProjectsDashboard({
    projects,
    tasks,
    areas,
    onUpdateProject,
    onEditProject,
    onCreateProject,
    statusOptions
}: ProjectsDashboardProps) {
    const [draggedProject, setDraggedProject] = useState<string | null>(null)
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

    const columnsToUse = statusOptions || DEFAULT_STATUS_COLUMNS

    // Group projects by status
    const columns = useMemo(() => {
        const cols: Record<string, any[]> = {}
        columnsToUse.forEach(s => cols[s] = [])
        projects.forEach(p => {
            // Map internal 'status' to column label
            const rawStatus = p.data.status || 'inbox'
            
            // Map common internal status keys to column names
            const statusMap: Record<string, string> = {
                'active': 'Active',
                'inbox': 'Inbox',
                'done': 'Done',
                'backlog': 'Backlog'
            }

            const mappedStatus = statusMap[rawStatus.toLowerCase()] || rawStatus
            
            // Find the column that matches the mapped status
            const finalCol = columnsToUse.find(c => c.toLowerCase() === mappedStatus.toLowerCase()) || columnsToUse[0]
            cols[finalCol].push(p)
        })
        return cols
    }, [projects, columnsToUse])

    const handleDragStart = (e: React.DragEvent, projectId: string) => {
        setDraggedProject(projectId)
        e.dataTransfer.setData('text/plain', projectId)
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDragEnter = (e: React.DragEvent, status: string) => {
        e.preventDefault()
        setDragOverColumn(status)
    }

    const handleDrop = (e: React.DragEvent, status: string) => {
        e.preventDefault()
        setDragOverColumn(null)
        const projectId = e.dataTransfer.getData('text/plain')
        if (projectId) {
            // Map column label back to internal status ID
            const statusMap: Record<string, string> = {
                'Inbox': 'inbox',
                'Active': 'active',
                'Done': 'done',
                'Backlog': 'backlog'
            }
            const internalStatus = statusMap[status] || status.toLowerCase()
            onUpdateProject(projectId, { status: internalStatus })
        }
        setDraggedProject(null)
    }

    return (
        <div className="w-full h-full overflow-x-auto pb-12 custom-scrollbar">
            <div className="flex gap-8 min-w-max px-6">
                {columnsToUse.map((col) => (
                    <div
                        key={col}
                        className={cn(
                            "w-[380px] flex-shrink-0 flex flex-col p-3 rounded-3xl transition-all duration-500",
                            dragOverColumn === col ? "bg-white/[0.03] ring-1 ring-white/10 shadow-2xl scale-[1.01]" : "bg-transparent"
                        )}
                        onDragOver={handleDragOver}
                        onDragEnter={(e) => handleDragEnter(e, col)}
                        onDrop={(e) => handleDrop(e, col)}
                    >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-6 px-3 pt-2">
                            <div className="flex items-center gap-3">
                                <span className={cn(
                                    "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)]",
                                    col === 'Done' || col === 'Completed' || col === 'ARCHIVED' ? "bg-emerald-400 shadow-emerald-500/40" :
                                        col === 'In Progress' || col === 'Active' || col === 'REVIEW' ? "bg-blue-400 shadow-blue-500/40" :
                                            col === 'In Review' ? "bg-purple-400 shadow-purple-500/40" :
                                                col === 'On Hold' || col === 'Backlog' ? "bg-amber-400 shadow-amber-500/40" : "bg-white/30"
                                )} />
                                <h3 className={`${playfair.className} text-white font-bold text-xl tracking-tight uppercase`}>{col}</h3>
                                <span className="bg-white/5 px-2 py-0.5 rounded-full text-white/40 text-[10px] font-mono border border-white/5">
                                    {columns[col].length}
                                </span>
                            </div>
                            <button
                                onClick={() => onCreateProject(col)}
                                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 group"
                            >
                                <Plus className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        {/* Drop Zone / List */}
                        <div className="flex flex-col gap-5 min-h-[400px]">
                            <AnimatePresence mode="popLayout">
                                {columns[col].map((project) => (
                                    <motion.div
                                        key={project.id}
                                        layoutId={project.id}
                                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e as any, project.id)}
                                        onDragEnd={() => setDraggedProject(null)}
                                        className={cn(
                                            "group",
                                            draggedProject === project.id ? "opacity-30" : "opacity-100"
                                        )}
                                    >
                                        <ProjectCard
                                            project={project}
                                            onClick={() => onEditProject(project)}
                                            linkedTasks={tasks.filter(t => {
                                                const pRel = t.data.Project || t.data.projectId || t.data.project
                                                const relId = typeof pRel === 'object' ? pRel?.id : pRel
                                                return relId === project.id
                                            })}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {columns[col].length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-32 border-2 border-dashed border-white/5 rounded-[2rem] flex flex-col items-center justify-center gap-3 text-white/20 group hover:border-white/10 hover:bg-white/[0.02] transition-all cursor-pointer overflow-hidden relative"
                                    onClick={() => onCreateProject(col)}
                                >
                                    <div className="w-10 h-10 rounded-full bg-white/[0.02] flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Plus className="w-5 h-5 opacity-50" />
                                    </div>
                                    <span className="text-[10px] uppercase tracking-[0.2em] font-medium">Add Project</span>
                                </motion.div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
