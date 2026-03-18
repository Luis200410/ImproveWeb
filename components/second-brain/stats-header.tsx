'use client'

import { motion } from 'framer-motion'
import { Bebas_Neue } from '@/lib/font-shim'
import { cn } from '@/lib/utils'
import { ProductivityScore, ProjectMetrics, TaskMetrics } from './analytics-utils'

const bebas = Bebas_Neue({ subsets: ['latin'] })

interface StatsHeaderProps {
    productivity?: ProductivityScore;
    taskMetrics?: TaskMetrics;
    projectMetrics?: ProjectMetrics;
}

export function StatsHeader({ productivity, taskMetrics, projectMetrics }: StatsHeaderProps) {
    // Default values if undefined
    const prodScore = productivity?.score ?? 0;
    const taskCompletion = taskMetrics?.completionRate ?? 0;
    const activeProjects = projectMetrics?.activeCount ?? 0;
    const projectCompletion = projectMetrics?.completionRate ?? 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Productivity Score Widget */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/5 blur-[100px] pointer-events-none" />
                
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/30">Productivity Score</span>
                        <div className="flex items-baseline gap-1">
                            <span className={cn("text-3xl font-bebas font-bold tracking-wider", prodScore >= 0 ? "text-emerald-400" : "text-red-400")}>
                                {prodScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-white/20 uppercase font-mono">pts</span>
                        </div>
                    </div>

                    <div className="h-24 flex items-end gap-3 mb-4">
                        {[
                            { label: 'Tasks', val: productivity?.breakdown.taskComponent || 0, color: 'from-blue-600 to-blue-400', ghostColor: 'bg-blue-500/5' },
                            { label: 'Projs', val: productivity?.breakdown.projectComponent || 0, color: 'from-purple-600 to-purple-400', ghostColor: 'bg-purple-500/5' },
                            { label: 'Overdue', val: productivity?.breakdown.overduePenalty || 0, color: 'from-rose-600 to-red-500', ghostColor: 'bg-red-500/5' }
                        ].map((bar, i) => {
                            // Enhanced scaling for visibility: Base height + calculated growth
                            const heightPercent = Math.min(100, Math.max(2, (bar.val * 2.5) + (bar.val > 0 ? 5 : 0)));
                            
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full justify-end">
                                    <div className={cn("w-full relative overflow-hidden", bar.ghostColor, "h-full border-x border-t border-white/5")}>
                                        <motion.div 
                                            initial={{ height: 0 }}
                                            animate={{ height: `${heightPercent}%` }}
                                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                            className={cn("absolute bottom-0 w-full bg-gradient-to-t shadow-[0_-5px_15px_rgba(0,0,0,0.3)]", bar.color)}
                                        />
                                    </div>
                                    <span className="text-[8px] uppercase tracking-[0.1em] text-white/25 font-bold">{bar.label}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
                
                <div className="pt-4 border-t border-white/5 flex justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-[0.15em] text-white/20">System Performance</span>
                </div>
            </div>

            {/* Task Stats */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10 relative overflow-hidden flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xs uppercase tracking-widest text-white/40">Task Completion</h3>
                    <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-400 font-mono">
                        {taskMetrics?.overdueCount ?? 0} Overdue
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-2xl font-bebas text-white tracking-widest">
                                {taskCompletion.toFixed(0)}% <span className="text-[10px] text-white/20">Process</span>
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">
                                {taskMetrics?.completedTasks}/{taskMetrics?.totalTasks} Units
                            </span>
                        </div>
                        <div className="h-4 w-full bg-white/5 border border-white/10 overflow-hidden relative">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${taskCompletion}%` }}
                                transition={{ duration: 1.2, ease: "circOut" }}
                                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 relative"
                            >
                                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase text-white/30 tracking-widest mb-1">Avg Lead Time</span>
                            <span className="text-sm font-mono text-blue-400">{taskMetrics?.avgDurationHours.toFixed(1)}h</span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-[9px] uppercase text-white/30 tracking-widest mb-1">Total Impact</span>
                            <span className="text-sm font-mono text-emerald-400">{taskMetrics?.totalTasks}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project Stats */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10 flex flex-col justify-between">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6">Strategic Metrics</h3>
                <div className="space-y-5">
                    {[
                        { label: 'Pipeline Completion', val: projectCompletion, color: 'from-emerald-600 to-emerald-400' },
                        { label: 'Active Streams', val: activeProjects, color: 'from-blue-600 to-blue-400', isCount: true, max: 20 },
                        { label: 'Lifecycle Avg', val: projectMetrics?.avgDurationDays ?? 0, color: 'from-purple-600 to-purple-400', isCount: true, suffix: ' Days', max: 90 },
                    ].map((item) => (
                        <div key={item.label} className="group">
                            <div className="flex justify-between text-[10px] text-white/50 mb-2 font-bold tracking-wider group-hover:text-white transition-colors">
                                <span className="uppercase">{item.label}</span>
                                <span className="font-mono">{item.isCount ? `${item.val.toFixed(0)}${item.suffix || ''}` : `${item.val.toFixed(1)}%`}</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 border border-white/10 overflow-hidden">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min(100, (item.isCount ? (item.val / (item.max || 100)) * 100 : item.val))}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className={cn("h-full bg-gradient-to-r shadow-lg", item.color)} 
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
