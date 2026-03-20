'use client'

import { motion } from 'framer-motion'
import { Gem, ListTodo, Rocket, Play, Pause, Check, Diamond, FileText, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Entry } from '@/lib/data-store'
import { TaskDetailsSheet } from '../task-details-sheet'
import { getTaskTitle } from '../utils'

interface MatrixCardProps {
    task: Entry
    onAction?: (action: 'done' | 'wait' | 'exec') => void
    onUpdate?: (updates: Partial<Entry['data']>) => void
    onDelete?: () => void
}

export function MatrixCard({ task, onAction, onUpdate, onDelete }: MatrixCardProps) {
    const isDone = task.data?.Status === true || task.data?.Status === 'Done'
    const isActive = task.data?.Status === 'active'
    const priority = task.data?.Priority || 'Medium'
    const complexity = task.data?.Complexity || 'M'
    const taskId = task.id.slice(0, 4).toUpperCase()
    const router = useRouter()

    const getComplexityLevel = () => {
        switch (complexity) {
            case 'L': return 3
            case 'XL': return 3
            case 'S': return 1
            case 'M':
            default: return 2
        }
    }

    const getPriorityBars = () => {
        switch (priority) {
            case 'High': return 5
            case 'Urgent': return 5
            case 'Low': return 1
            case 'Medium':
            default: return 3
        }
    }

    const complexityLevel = getComplexityLevel()
    const priorityBars = getPriorityBars()

    // Status visual mapping
    const statusColor = isDone ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
        isActive ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' :
            'border-white/10'

    return (
        <TaskDetailsSheet
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
            trigger={
                <div className={cn(
                    "relative w-full bg-[#080808] rounded-xl p-5 border transition-all group hover:border-white/20 cursor-pointer text-left",
                    statusColor
                )}>
                    {/* Corner Brackets - Top Left */}
                    <div className="absolute -top-px -left-px w-3 h-3 border-t-2 border-l-2 border-amber-500/50 rounded-tl-sm opacity-50 group-hover:opacity-100 transition-opacity" />
                    {/* Corner Brackets - Bottom Right */}
                    <div className="absolute -bottom-px -right-px w-3 h-3 border-b-2 border-r-2 border-amber-500/50 rounded-br-sm opacity-50 group-hover:opacity-100 transition-opacity" />

                    {/* Header: Icon + Metrics */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white/40 group-hover:text-amber-500 transition-colors"
                            )}>
                                <ListTodo className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-white/40 tracking-wider">P_LEVEL:</span>
                                    <div className="flex gap-1">
                                        {[1, 2, 3].map((level) => (
                                            <Diamond
                                                key={level}
                                                className={cn(
                                                    "w-3 h-3",
                                                    level <= complexityLevel ? "text-orange-500 fill-orange-500" : "text-white/10"
                                                )}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="text-[9px] font-mono text-white/20 tracking-wider">ID: SB-X-{taskId}</div>
                            </div>
                        </div>

                        {/* Priority Bars */}
                        <div className="flex items-end gap-1 h-8">
                            {[1, 2, 3, 4, 5].map((bar) => (
                                <div
                                    key={bar}
                                    className={cn(
                                        "w-1.5 rounded-t-sm transition-all duration-300",
                                        bar <= priorityBars ? "bg-white/40" : "bg-white/5"
                                    )}
                                    style={{
                                        height: `${20 + (bar * 16)}%`,
                                        opacity: bar <= priorityBars ? 1 : 0.3
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-sm font-bold text-white mb-4 line-clamp-2 uppercase tracking-wide">
                        {getTaskTitle(task)}
                    </h3>
                    
                    <div className="pt-4 border-t border-white/5">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/systems/second-brain/notes-sb?taskId=${task.id}`);
                            }}
                            className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-amber-500 transition-colors group/link"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            <span>View task notes</span>
                            <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all ml-1" />
                        </button>
                    </div>
                </div>
            }
        />
    )
}
