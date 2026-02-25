'use client'

import { motion, Reorder } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Entry } from '@/lib/data-store'
import { Check, Clock, Zap, ArrowRight, LayoutGrid, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { TaskCreationSheet } from './task-creation-sheet'
import { getTaskTitle } from './utils'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface ActiveTasksProps {
    tasks: Entry[]
    onToggleStatus: (task: Entry) => void
    onUpdateLane: (task: Entry, lane: string) => void
}

export function ActiveTasks({ tasks, onToggleStatus, onUpdateLane }: ActiveTasksProps) {
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
                        <TaskCard task={task} />
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    )
}

function TaskCard({ task }: { task: Entry }) {
    const isDone = task.data?.Status === true
    const priority = task.data?.Priority || 'Medium'

    return (
        <div className="group relative overflow-hidden bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing">
            {/* Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="flex items-start justify-between gap-4 relative z-10">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10",
                            isDone ? "text-emerald-400" : "text-amber-400"
                        )}>
                            {isDone ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-white leading-tight">{getTaskTitle(task)}</h4>
                            <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">
                                {task.data?.Project ? 'Linked Project' : 'Solo Agent'} // Cognitive
                            </p>
                        </div>
                    </div>
                </div>

                {/* Status Actions */}
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest border",
                        priority === 'High' ? "border-amber-500/30 text-amber-500 bg-amber-500/5" : "border-white/10 text-white/40 bg-white/5"
                    )}>
                        Priority A
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between gap-2">
                <p className="text-xs text-white/50 line-clamp-1">
                    {task.data?.Description || 'Refining the cross-reference matrix between second brain modules...'}
                </p>

                {/* Action Buttons (Mock visual based on image) */}
                <div className="flex gap-1">
                    <div className="w-20 h-8 rounded border border-white/10 bg-white/5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-500 opacity-30">
                        <Check className="w-3 h-3" /> Done
                    </div>
                    <div className="w-20 h-8 rounded border border-amber-500/20 bg-amber-500/5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                        <Clock className="w-3 h-3" /> Pending
                    </div>
                    <div className="w-20 h-8 rounded border border-blue-500/20 bg-blue-500/5 flex items-center justify-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-blue-500 opacity-60">
                        <Zap className="w-3 h-3" /> Active
                    </div>
                </div>
            </div>
        </div>
    )
}
