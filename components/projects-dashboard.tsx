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

interface ProjectsDashboardProps {
    projects: Entry[]
    tasks: Entry[] // Needed for progress calculation
    areas: Entry[] // Needed for area mapping
    onUpdateProject: (projectId: string, updates: Record<string, any>) => void
    onEditProject: (project: Entry) => void
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

    // Helper: Calculate progress for a project
    const getProjectProgress = (projectId: string) => {
        const projectTasks = tasks.filter(t => {
            const projectRel = t.data['Project']
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
        return area?.data['Area Name'] || area?.data['Name'] || 'Unassigned Area'
    }

    // Group projects by status
    const columns = useMemo(() => {
        const cols: Record<string, Entry[]> = {}
        columnsToUse.forEach(s => cols[s] = [])
        projects.forEach(p => {
            const status = p.data['Status']
            if (status && cols[status]) {
                cols[status].push(p)
            } else {
                // Fallback to the first column if status is unrecognized or missing
                cols[columnsToUse[0]].push(p)
            }
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
            onUpdateProject(projectId, { 'Status': status })
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
                                    col === 'Done' || col === 'Completed' ? "bg-emerald-400 shadow-emerald-500/40" :
                                        col === 'In Progress' || col === 'Active' ? "bg-blue-400 shadow-blue-500/40" :
                                            col === 'In Review' ? "bg-purple-400 shadow-purple-500/40" :
                                                col === 'On Hold' ? "bg-amber-400 shadow-amber-500/40" : "bg-white/30"
                                )} />
                                <h3 className={`${playfair.className} text-white font-bold text-xl tracking-tight`}>{col}</h3>
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
                                {columns[col].map((project) => {
                                    const progress = getProjectProgress(project.id)
                                    const areaName = getAreaName(project.data['Area'])
                                    const coverImage = project.data['Cover Image']

                                    return (
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
                                            onClick={() => onEditProject(project)}
                                            className={cn(
                                                "group relative bg-[#0D0D0D]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden cursor-pointer hover:border-white/30 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-500",
                                                draggedProject === project.id ? "opacity-30 border-dashed" : "opacity-100"
                                            )}
                                        >
                                            {/* Cover Image */}
                                            {coverImage ? (
                                                <div className="relative w-full h-32 overflow-hidden">
                                                    <Image
                                                        src={coverImage}
                                                        alt={project.data['Project Name'] || ''}
                                                        fill
                                                        className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] to-transparent opacity-60" />
                                                </div>
                                            ) : (
                                                <div className="w-full h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20" />
                                            )}

                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    {areaName && (
                                                        <div className="bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-lg text-[9px] uppercase tracking-[0.15em] text-white/60 border border-white/10 flex items-center gap-1.5 font-medium">
                                                            <Layers className="w-3 h-3 text-white/40" />
                                                            {areaName}
                                                        </div>
                                                    )}
                                                    <div className="ml-auto flex gap-2">
                                                        {project.data['Priority'] === 'Urgent' && (
                                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" title="Urgent" />
                                                        )}
                                                        <MoreVertical className="w-4 h-4 text-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </div>
                                                </div>

                                                <h4 className={`${playfair.className} text-xl font-bold text-white mb-3 leading-[1.2] group-hover:text-blue-400 transition-colors`}>
                                                    {project.data['Project Name'] || 'Untitled Project'}
                                                </h4>

                                                {project.data['Description'] && (
                                                    <p className="text-white/40 text-sm line-clamp-2 mb-6 font-light leading-relaxed">
                                                        {project.data['Description']}
                                                    </p>
                                                )}

                                                {/* Progress Section */}
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-[10px] uppercase tracking-widest font-semibold">
                                                        <span className="text-white/30">Completion</span>
                                                        <span className={cn(
                                                            "transition-colors duration-300",
                                                            progress === 100 ? "text-emerald-400" : "text-white/60"
                                                        )}>{progress}%</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/[0.03]">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${progress}%` }}
                                                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                                                            className={cn(
                                                                "h-full rounded-full relative overflow-hidden",
                                                                progress === 100
                                                                    ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                                                    : "bg-gradient-to-r from-blue-500 to-indigo-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                                            )}
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                                        </motion.div>
                                                    </div>
                                                </div>

                                                {/* Meta Info */}
                                                <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-white/5">
                                                    <div className="flex items-center gap-4">
                                                        {project.data['Deadline'] && (
                                                            <div className="flex items-center gap-1.5 text-[10px] text-white/30 font-medium">
                                                                <Calendar className="w-3 h-3" />
                                                                <span>{new Date(project.data['Deadline']).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                            </div>
                                                        )}
                                                        {project.data['Priority'] && (
                                                            <div className="text-[10px] text-white/30 font-medium px-2 py-0.5 rounded border border-white/5 bg-white/[0.02]">
                                                                {project.data['Priority']}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Avatar placeholder or tasks count */}
                                                    <div className="flex -space-x-2">
                                                        <div className="w-6 h-6 rounded-full border border-black bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[8px] text-white font-bold">
                                                            LC
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )
                                })}
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
