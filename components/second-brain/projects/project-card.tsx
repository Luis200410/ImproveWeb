'use client'

import { motion } from 'framer-motion'
import { AlertOctagon } from 'lucide-react'
import { ProjectEntry, calculateProgress, getDaysRemaining } from './project-utils'
import { Playfair_Display } from '@/lib/font-shim'
import { Entry } from '@/lib/data-store'

interface ProjectCardProps {
    project: ProjectEntry
    onClick?: () => void
    linkedTasks?: Entry[] // Added prop
}

export function ProjectCard({ project, onClick, linkedTasks = [] }: ProjectCardProps) {
    const { data } = project

    // Calculate progress from REAL tasks if available, otherwise fallback to subtasks
    let progress = 0;
    let totalTasks = 0;
    let completedTasks = 0;

    if (linkedTasks.length > 0) {
        totalTasks = linkedTasks.length;
        completedTasks = linkedTasks.filter(t => t.data.Status === 'Done' || t.data.Status === true).length;
        progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    } else {
        progress = calculateProgress(data.subtasks);
        totalTasks = data.subtasks?.length || 0;
        completedTasks = data.subtasks?.filter(t => t.completed)?.length || 0;
    }

    const title = (data.title || data['Project Name'] || 'Untitled Project').toString()
    const priority = data.priority || 'P3'
    const ragStatus = data.ragStatus || 'Green'
    const blockedBy = data.blockedBy
    const complexity = data.complexity || 'M'
    const deadline = data.deadline
    const subtasks = data.subtasks || []

    const daysRemaining = getDaysRemaining(deadline)
    const isOverdue = daysRemaining < 0

    // Visual Mappings
    const ragConfig = {
        'Red': { border: 'border-rose-500', text: 'text-rose-500', bg: 'bg-rose-500', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]' },
        'Amber': { border: 'border-amber-500', text: 'text-amber-500', bg: 'bg-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]' },
        'Green': { border: 'border-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]' }
    }
    const theme = ragConfig[ragStatus] || ragConfig['Green']

    // Neural Activity Grid Logic (Data-Driven)
    // Map subtasks to grid cells. If not enough subtasks, fill with 'pending'
    // Completed -> Green, Next -> Yellow, Pending -> Grey
    const generateActivity = () => {
        // Create a fixed grid of 12 cells (3 rows x 4 cols)
        const totalCells = 12
        const cells = []

        let foundNext = false

        for (let i = 0; i < totalCells; i++) {
            const task = subtasks[i]
            let color = 'bg-white/5' // Default Pending (Grey)
            let opacity = 0.1

            if (task) {
                if (task.completed) {
                    color = 'bg-emerald-500' // Done
                    opacity = 1
                } else if (!foundNext) {
                    color = 'bg-amber-500' // Working on (Next)
                    opacity = 1
                    foundNext = true
                } else {
                    color = 'bg-white/20' // Pending but exists
                    opacity = 0.5
                }
            }

            cells.push({ color, opacity })
        }

        return cells
    }
    const activityGrid = generateActivity()

    // Circular Progress Params
    const radius = 28
    const circumference = 2 * Math.PI * radius
    const strokeDashoffset = circumference - (progress / 100) * circumference

    return (
        <motion.div
            layout
            whileHover={{ scale: 1.02 }}
            onClick={onClick}
            className={`group relative bg-[#080808] border-l-4 ${theme.border} rounded-r-xl p-6 cursor-pointer overflow-hidden transition-all hover:bg-[#0A0A0A]`}
        >
            {/* Drag Handle (Visible on Hover) - Keeping specific style requested */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="p-1 rounded hover:bg-white/10 cursor-grab active:cursor-grabbing">
                    <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white/20">
                        <circle cx="2" cy="2" r="1.5" fill="currentColor" />
                        <circle cx="2" cy="8" r="1.5" fill="currentColor" />
                        <circle cx="2" cy="14" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="2" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                        <circle cx="8" cy="14" r="1.5" fill="currentColor" />
                    </svg>
                </div>
            </div>

            {/* Top Row: Title & Days */}
            <div className="flex justify-between items-start mb-6 w-full">
                <div className="flex-1 pr-8">
                    <h3 className="font-serif text-xl text-white mb-2 leading-none truncate">{title}</h3>
                    <div className="flex gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-mono border border-white/10 rounded text-white/40 uppercase">
                            ROI: {priority}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-mono border border-white/10 rounded text-white/40 uppercase">
                            SIZE: {complexity}
                        </span>
                    </div>
                </div>
                <div className="text-right shrink-0">
                    <div className="text-[9px] text-white/30 uppercase tracking-widest mb-1">Temporal</div>
                    <div className={`text-xs font-bold font-mono ${isOverdue ? 'text-rose-500' : theme.text}`}>
                        {isOverdue ? 'OVERDUE' : `${daysRemaining} DAYS`}
                    </div>
                    {!isOverdue && <div className="text-[9px] text-white/30 tracking-wider">REMAINING</div>}
                </div>
            </div>

            {/* Middle Row: Activity Grid & Progress Ring */}
            <div className="flex items-center justify-between">

                {/* Neural Activity Grid (The "GitHub part") */}
                <div className="space-y-2">
                    <div className="text-[9px] text-white/30 uppercase tracking-widest">Neural Activity Grid</div>
                    {/* 3 rows x 4 cols grid */}
                    <div className="grid grid-cols-4 gap-1">
                        {activityGrid.map((cell, i) => (
                            <div
                                key={i}
                                className={`w-3 h-3 rounded-sm ${cell.color}`}
                                style={{ opacity: cell.opacity }}
                            />
                        ))}
                    </div>
                </div>

                {/* Circular Progress */}
                <div className="relative flex items-center justify-center">
                    <svg className="w-20 h-20 -rotate-90">
                        {/* Track */}
                        <circle
                            cx="40" cy="40" r={radius}
                            className="stroke-white/5"
                            strokeWidth="6"
                            fill="transparent"
                        />
                        {/* Indicator */}
                        <circle
                            cx="40" cy="40" r={radius}
                            className={`${theme.text}`}
                            strokeWidth="6"
                            fill="transparent"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-white font-mono">
                        {progress}%
                    </div>
                </div>
            </div>

            {/* Blocked Warning Overlay or Footer */}
            {blockedBy && (
                <div className="mt-4 pt-3 border-t border-dashed border-white/10 flex items-center gap-2 text-rose-500">
                    <AlertOctagon className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-wider font-bold">Hard Blocker: {blockedBy}</span>
                </div>
            )}
        </motion.div>
    )
}
