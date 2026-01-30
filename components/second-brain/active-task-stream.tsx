'use client'

import { motion, Reorder } from 'framer-motion'
import { Check, Clock, Zap, ArrowRight, Play, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Entry } from '@/lib/data-store'
import { useRouter } from 'next/navigation'
import { TaskCreationSheet } from './task-creation-sheet'
import { TaskDetailsSheet } from './task-details-sheet'

interface ActiveTaskStreamProps {
    tasks: Entry[]
    onToggleStatus: (task: Entry) => void
    onUpdateLane: (task: Entry, lane: string) => void
}

export function ActiveTaskStream({ tasks, onToggleStatus, onUpdateLane }: ActiveTaskStreamProps) {
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
                        <StreamCard task={task} onToggleStatus={onToggleStatus} />
                    </Reorder.Item>
                ))}
            </Reorder.Group>
        </div>
    )
}

function StreamCard({ task, onToggleStatus }: { task: Entry, onToggleStatus: (task: Entry) => void }) {
    const isDone = task.data?.Status === true
    const priority = task.data?.Priority || 'Medium'
    const statusColor = isDone ? 'text-emerald-500' : 'text-blue-500' // blue for active stream aesthetic

    return (
        <TaskDetailsSheet
            task={task}
            trigger={
                <div className="w-[320px] bg-[#0A0A0A] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden group text-left">
                    {/* Accent Line */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", isDone ? "from-emerald-500 to-transparent" : "from-blue-500 to-transparent")} />

                    <div className="pl-2">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-sm font-medium text-white line-clamp-1">{task.data?.Task || 'Untitled'}</h4>
                            <span className={cn("px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border border-white/10 bg-white/5", isDone ? "text-emerald-500" : "text-blue-400")}>
                                {isDone ? 'DONE' : 'ACTIVE'}
                            </span>
                        </div>

                        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-4">
                            {task.data?.Project ? 'Linked Project' : 'Solo Agent'}
                        </p>

                        {/* Action Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-4">
                            <button onClick={() => onToggleStatus(task)} className={cn(
                                "flex flex-col items-center justify-center gap-1 py-2 rounded border transition-colors",
                                isDone ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500" : "border-white/10 bg-white/5 text-white/20 hover:text-emerald-500 hover:border-emerald-500/30"
                            )}>
                                <Check className="w-3 h-3" />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Done</span>
                            </button>

                            <button className="flex flex-col items-center justify-center gap-1 py-2 rounded border border-white/10 bg-white/5 text-white/20 hover:text-amber-500 hover:border-amber-500/30 transition-colors">
                                <Clock className="w-3 h-3" />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Wait</span>
                            </button>

                            <button onClick={() => !isDone && console.log("Already active")} className={cn(
                                "flex flex-col items-center justify-center gap-1 py-2 rounded border transition-colors",
                                !isDone ? "border-blue-500/30 bg-blue-500/10 text-blue-500" : "border-white/10 bg-white/5 text-white/20 hover:text-blue-500 hover:border-blue-500/30"
                            )}>
                                <Zap className="w-3 h-3" />
                                <span className="text-[8px] font-bold uppercase tracking-wider">Active</span>
                            </button>
                        </div>
                    </div>
                </div>
            }
        />
    )
}
