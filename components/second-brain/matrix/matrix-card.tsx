'use client'

import { motion } from 'framer-motion'
import { Gem, Database, Rocket, Play, Pause, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Entry } from '@/lib/data-store'
import { TaskDetailsSheet } from '../task-details-sheet'

interface MatrixCardProps {
    task: Entry
    onAction?: (action: 'done' | 'wait' | 'exec') => void
}

export function MatrixCard({ task, onAction }: MatrixCardProps) {
    const isDone = task.data?.Status === true
    const isActive = task.data?.Status === 'active' // Assuming 'active' string for now or derived logic
    const priority = task.data?.Priority || 'Medium'

    // Status visual mapping
    const statusColor = isDone ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' :
        isActive ? 'border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' :
            'border-white/10'

    return (
        <TaskDetailsSheet
            task={task}
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
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "p-2 rounded-lg bg-white/5 border border-white/10",
                                isDone ? "text-emerald-500" : "text-white/60"
                            )}>
                                {priority === 'High' ? <Rocket className="w-4 h-4" /> :
                                    priority === 'Low' ? <Database className="w-4 h-4" /> :
                                        <Gem className="w-4 h-4" />}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold text-white/40 tracking-wider">P_LEVEL:</span>
                                    <div className="flex gap-0.5">
                                        <Gem className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        <Gem className="w-3 h-3 text-amber-500 fill-amber-500" />
                                        <Gem className="w-3 h-3 text-white/10" />
                                    </div>
                                </div>
                                <div className="text-[9px] font-mono text-white/30">ID: SB-X-{task.id.slice(0, 4).toUpperCase()}</div>
                            </div>
                        </div>
                        {/* Waveform graphic placeholder */}
                        <div className="w-12 h-6 flex items-end gap-0.5 opacity-30">
                            {[4, 8, 3, 6, 2, 7, 5].map((h, i) => (
                                <div key={i} className="w-1 bg-white" style={{ height: `${h * 10}%` }} />
                            ))}
                        </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-snug">
                        {task.data?.Task || 'Untitled Neural process'}
                    </h3>
                    <p className="text-xs text-white/50 mb-6 leading-relaxed line-clamp-3">
                        {task.data?.Description || 'Manual execution of recursive cross-indexing between local vault nodes and master matrix index.'}
                    </p>

                    {/* Actions Footer */}
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction?.('done') }}
                            className={cn("py-2 rounded border text-[9px] font-bold tracking-wider uppercase transition-all",
                                isDone ? "bg-emerald-500 text-black border-emerald-500" : "bg-white/5 border-white/10 text-white/30 hover:bg-white/10 hover:text-white"
                            )}
                        >
                            Done
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction?.('wait') }}
                            className="py-2 rounded border border-white/10 bg-white/5 text-white/30 text-[9px] font-bold tracking-wider uppercase hover:bg-white/10 hover:text-white transition-all"
                        >
                            Wait
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); onAction?.('exec') }}
                            className={cn("py-2 rounded border text-[9px] font-bold tracking-wider uppercase transition-all",
                                isActive ? "bg-blue-600 text-white border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "bg-white/5 border-white/10 text-white/30 hover:bg-blue-500/20 hover:text-blue-400 hover:border-blue-500/50"
                            )}
                        >
                            Exec
                        </button>
                    </div>
                </div>
            }
        />
    )
}
