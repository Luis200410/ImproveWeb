'use client'

import { motion, Reorder } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Entry } from '@/lib/data-store'
import { Check, Clock, Zap, ArrowRight, LayoutGrid, Plus, Diamond, Rocket, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TaskCreationSheet } from './task-creation-sheet'
import { TaskDetailsSheet } from './task-details-sheet'
import { getTaskTitle } from './utils'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface ActiveTasksProps {
    tasks: Entry[]
    onToggleStatus: (task: Entry) => void
    onUpdateLane: (task: Entry, lane: string) => void
    onUpdateTask?: (task: Entry, updates: Partial<Entry['data']>) => void
    onDeleteTask?: (taskId: string) => void
}

export function ActiveTasks({ tasks, onToggleStatus, onUpdateLane, onUpdateTask, onDeleteTask }: ActiveTasksProps) {
    const [items, setItems] = useState(tasks)
    const router = useRouter()

    useEffect(() => {
        setItems(tasks)
    }, [tasks])

    return (
        <div className="w-full space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-xs uppercase tracking-widest text-white/40">Architecture Nodes (Tasks)</h3>
                    <TaskCreationSheet
                        trigger={
                            <button className="p-1 hover:bg-white/10 rounded-full transition-colors group">
                                <Plus className="w-3 h-3 text-white/30 group-hover:text-emerald-500" />
                            </button>
                        }
                    />
                </div>
                <button
                    onClick={() => router.push('/systems/second-brain/tasks-sb')}
                    className="text-xs text-white/50 hover:text-white flex items-center gap-1 transition-colors"
                >
                    View All <ArrowRight className="w-3 h-3" />
                </button>
            </div>

            <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
                {items.length === 0 && (
                    <div className="p-8 text-center text-white/30 text-sm border border-dashed border-white/10 rounded-2xl">
                        No active tasks for today.
                    </div>
                )}

                {items.map((task, i) => (
                    <Reorder.Item key={task.id} value={task}>
                        <TaskCard 
                            task={task} 
                            onUpdate={(updates) => onUpdateTask?.(task, updates)}
                            onDelete={() => onDeleteTask?.(task.id)}
                        />
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    )
}

function TaskCard({ task, onUpdate, onDelete }: { task: Entry, onUpdate?: (updates: Partial<Entry['data']>) => void, onDelete?: () => void }) {
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
                <div className="group relative overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing text-left">
                    {/* Hover Glow */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                        {/* Header Section */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                {/* Task Logo */}
                                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 text-white/40 group-hover:text-emerald-500 transition-colors">
                                    <Rocket className="w-6 h-6" />
                                </div>

                                <div className="space-y-1">
                                    {/* P-Level Diamonds */}
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/30 font-bold">P_LEVEL:</span>
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
                                    <p className="text-[10px] font-mono tracking-widest text-white/20">
                                        ID: SB-X-{taskId}
                                    </p>
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

                        {/* Title & Notes Section */}
                        <div className="space-y-3">
                            <h4 className="text-sm font-medium text-white tracking-wide uppercase">{getTaskTitle(task)}</h4>
                            
                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/systems/second-brain/notes-sb?taskId=${task.id}`);
                                    }}
                                    className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/40 hover:text-emerald-500 transition-colors group/link"
                                >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>View Task Notes</span>
                                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all" />
                                </button>

                                <div className={cn(
                                    "px-2 py-1 rounded text-[8px] font-bold uppercase tracking-[0.2em] border",
                                    isDone ? "border-emerald-500/20 text-emerald-500 bg-emerald-500/5" : "border-white/10 text-white/30 bg-white/5"
                                )}>
                                    {task.data?.Status || 'Pending'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        />
    )
}
