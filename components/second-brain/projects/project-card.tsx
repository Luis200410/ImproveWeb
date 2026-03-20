'use client'

import { motion } from 'framer-motion'
import { AlertOctagon } from 'lucide-react'
import { ProjectEntry, calculateProgress, getDaysRemaining } from './project-utils'
import { Playfair_Display } from '@/lib/font-shim'
import { Entry } from '@/lib/data-store'
import { getProjectTitle, getProjectDeadline } from '../utils'
import { cn } from '@/lib/utils'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface ProjectCardProps {
    project: ProjectEntry
    onClick?: () => void
    linkedTasks?: Entry[]
}

export function ProjectCard({ project, onClick, linkedTasks = [] }: ProjectCardProps) {
    const { data } = project

    // Calculate progress from REAL tasks if available, otherwise fallback to subtasks
    let progress = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    if (linkedTasks.length > 0) {
        totalTasks = linkedTasks.length;
        completedTasks = linkedTasks.filter(t => {
            const s = t.data.Status || t.data.status;
            return s === 'Done' || s === 'done' || s === 'Completed' || s === 'completed' || s === true;
        }).length;
        progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    } else {
        const subtasks = data.subtasks || [];
        totalTasks = subtasks.length;
        completedTasks = subtasks.filter(t => t.completed).length;
        progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    }

    const title = getProjectTitle(project)
    const priority = data.priority || 'Medium'
    const ragStatus = data.ragStatus || 'Green'
    const complexity = data.complexity || '3'
    const deadline = getProjectDeadline(project)
    
    // Days remaining logic
    const daysRemaining = deadline ? getDaysRemaining(deadline) : null
    const isOverdue = daysRemaining !== null && daysRemaining < 0

    // Visual Mappings for Health (RAG)
    const ragConfig = {
        'Red': { border: 'border-rose-500/50', text: 'text-rose-500', bg: 'bg-rose-500/10', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]' },
        'Amber': { border: 'border-amber-500/50', text: 'text-amber-500', bg: 'bg-amber-500/10', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]' },
        'Green': { border: 'border-emerald-500/50', text: 'text-emerald-500', bg: 'bg-emerald-500/10', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]' }
    }
    const theme = ragConfig[ragStatus as keyof typeof ragConfig] || ragConfig['Green']

    return (
        <motion.div
            layout
            whileHover={{ y: -4, scale: 1.01 }}
            onClick={onClick}
            className={`
                group relative bg-[#0A0A0A] border border-white/5 rounded-2xl p-5 cursor-pointer overflow-hidden transition-all 
                hover:border-white/10 hover:bg-[#0C0C0C] hover:shadow-2xl hover:shadow-black/50
            `}
        >
            {/* Status Indicator Bar */}
            <div className={`absolute top-0 left-0 right-0 h-1 ${theme.bg} opacity-50 group-hover:opacity-100 transition-opacity`} />
            
            {/* Drag Handle */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-40 transition-opacity p-1">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-white">
                    <circle cx="4" cy="2" r="1" fill="currentColor" />
                    <circle cx="4" cy="6" r="1" fill="currentColor" />
                    <circle cx="4" cy="10" r="1" fill="currentColor" />
                    <circle cx="8" cy="2" r="1" fill="currentColor" />
                    <circle cx="8" cy="6" r="1" fill="currentColor" />
                    <circle cx="8" cy="10" r="1" fill="currentColor" />
                </svg>
            </div>

            {/* Header: Title & Deadline */}
            <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.bg} ${theme.glow}`} />
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.2em]">Neural Node</span>
                    </div>
                    <h3 className={`${playfair.className} text-xl text-white group-hover:text-emerald-400 transition-colors leading-tight`}>
                        {title}
                    </h3>
                </div>
                {daysRemaining !== null && (
                    <div className="text-right shrink-0">
                        <div className={`text-[10px] font-black font-mono tracking-tighter ${isOverdue ? 'text-rose-500' : 'text-white/40'}`}>
                            {isOverdue ? 'CRITICAL' : `${daysRemaining}D`}
                        </div>
                        <div className="text-[8px] text-white/20 uppercase tracking-widest font-black -mt-1">TTL</div>
                    </div>
                )}
            </div>

            {/* Middle: Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                    <div className="text-[7px] text-white/20 uppercase tracking-[0.3em] mb-1">Complexity</div>
                    <div className="text-xs font-mono text-white/60">LVL_{complexity}</div>
                </div>
                <div className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                    <div className="text-[7px] text-white/20 uppercase tracking-[0.3em] mb-1">ROI/Priority</div>
                    <div className="text-xs font-mono text-white/60">{priority.toUpperCase()}</div>
                </div>
            </div>

            {/* Progress Section (SaaS Style) */}
            <div className="space-y-3">
                <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-white/50">{progress}%</span>
                        <span className="text-[8px] text-white/20 uppercase tracking-widest font-bold">Lattice Completion</span>
                    </div>
                    <span className="text-[9px] text-white/30 font-mono">
                        {completedTasks}/{totalTasks} UNITs
                    </span>
                </div>
                
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className={cn(
                            "h-full rounded-full transition-all duration-700",
                            progress === 100 ? "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]" : 
                            progress > 60 ? "bg-emerald-500/70" :
                            progress > 30 ? "bg-amber-500/70" : "bg-blue-500/50"
                        )}
                    />
                </div>
            </div>

            {/* Footer Overlay for Blocked status */}
            {data.blockedBy && (
                <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-2">
                    <AlertOctagon className="w-3 h-3 text-rose-500" />
                    <span className="text-[9px] text-rose-500/70 uppercase tracking-tighter font-bold truncate">
                        Lattice Blocked: {data.blockedBy}
                    </span>
                </div>
            )}
        </motion.div>
    )
}
