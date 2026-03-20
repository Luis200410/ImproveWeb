'use client'

import { motion, Reorder } from 'framer-motion'
import { Check, Clock, Zap, ArrowRight, Play, Plus, Diamond, Rocket, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Entry } from '@/lib/data-store'
import { useRouter } from 'next/navigation'
import { TaskCreationSheet } from './task-creation-sheet'
import { TaskDetailsSheet } from './task-details-sheet'
import { getTaskTitle } from './utils'

interface ActiveTaskStreamProps {
    tasks: Entry[]
    onToggleStatus: (task: Entry) => void
    onUpdateLane: (task: Entry, lane: string) => void
    onUpdateTask?: (task: Entry, updates: Partial<Entry['data']>) => void
    onDeleteTask?: (taskId: string) => void
}

export function ActiveTaskStream({ tasks, onToggleStatus, onUpdateLane, onUpdateTask, onDeleteTask }: ActiveTaskStreamProps) {
    const [items, setItems] = useState(tasks)
    const router = useRouter()

    useEffect(() => {
        setItems(tasks)
    }, [tasks])

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <h3 className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold">Active Task Stream</h3>
                <TaskCreationSheet
                    trigger={
                        <button className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500 hover:bg-amber-500/20 hover:border-amber-500/40 transition-all uppercase tracking-wider">
                            <Plus className="w-3 h-3" /> New Task
                        </button>
                    }
                />
            </div>

            <Reorder.Group axis="x" values={items} onReorder={setItems} className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide">
                {items.length === 0 && (
                    <div className="w-full py-12 text-center text-white/30 text-sm border border-dashed border-white/10 rounded-2xl">
                        No active stream for today.
                    </div>
                )}

                {items.map((task) => (
                    <Reorder.Item key={task.id} value={task} className="shrink-0">
                        <StreamCard 
                            task={task} 
                            onToggleStatus={onToggleStatus} 
                            onUpdate={(updates) => onUpdateTask?.(task, updates)}
                            onDelete={() => onDeleteTask?.(task.id)}
                        />
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    )
}

function StreamCard({ task, onToggleStatus, onUpdate, onDelete }: { task: Entry, onToggleStatus: (task: Entry) => void, onUpdate?: (updates: Partial<Entry['data']>) => void, onDelete?: () => void }) {
    const isDone = task.data?.Status === 'Done'
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

    return (
        <TaskDetailsSheet
            task={task}
            onUpdate={onUpdate}
            onDelete={onDelete}
            trigger={
                <div className="w-[320px] bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden group text-left">
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        {/* Header Section */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {/* Task Logo */}
                                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-white/40 group-hover:text-blue-400 transition-colors">
                                    <Rocket className="w-5 h-5" />
                                </div>

                                <div className="space-y-0.5">
                                    {/* P-Level Diamonds */}
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[8px] uppercase tracking-[0.2em] text-white/30 font-bold">P_LEVEL:</span>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3].map((level) => (
                                                <Diamond
                                                    key={level}
                                                    className={cn(
                                                        "w-2.5 h-2.5",
                                                        level <= complexityLevel ? "text-blue-500 fill-blue-500" : "text-white/10"
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-[9px] font-mono tracking-widest text-white/20">
                                        ID: SB-X-{taskId}
                                    </p>
                                </div>
                            </div>

                            {/* Priority Bars */}
                            <div className="flex items-end gap-0.5 h-6">
                                {[1, 2, 3, 4, 5].map((bar) => (
                                    <div
                                        key={bar}
                                        className={cn(
                                            "w-1 rounded-t-sm transition-all duration-300",
                                            bar <= priorityBars ? "bg-blue-400" : "bg-white/5"
                                        )}
                                        style={{
                                            height: `${20 + (bar * 16)}%`,
                                            opacity: bar <= priorityBars ? 1 : 0.3
                                        }}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Title & Stats */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-white tracking-wide uppercase line-clamp-1">{getTaskTitle(task)}</h4>
                            
                            <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-white/40 group-hover:text-blue-400 transition-colors">
                                    <FileText className="w-3 h-3" />
                                    <span>Notes Attached</span>
                                </div>

                                <span className={cn(
                                    "px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border border-white/10 bg-white/5",
                                    isDone ? "text-emerald-500 border-emerald-500/20" : "text-blue-400 border-blue-500/20"
                                )}>
                                    {isDone ? 'DONE' : 'ACTIVE'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            }
        />
    )
}
