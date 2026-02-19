'use client'

import { motion } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { cn } from '@/lib/utils'
import { ProductivityScore, ProjectMetrics, TaskMetrics } from './analytics-utils'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface StatsSidebarProps {
    productivity?: ProductivityScore;
    taskMetrics?: TaskMetrics;
    projectMetrics?: ProjectMetrics;
}

export function StatsSidebar({ productivity, taskMetrics, projectMetrics }: StatsSidebarProps) {
    // Default values if undefined
    const prodScore = productivity?.score ?? 0;
    const taskCompletion = taskMetrics?.completionRate ?? 0;
    const taskVelocity = taskMetrics ? (taskMetrics.completedTasks / 1).toFixed(0) : '0'; // Tasks per week? context needed. Let's just show raw completed count for now or "Tasks Done".
    // Actually "Velocity" usually means speed. Let's map it to "Avg Duration" or just "Total Completed".
    const activeProjects = projectMetrics?.activeCount ?? 0;
    const projectCompletion = projectMetrics?.completionRate ?? 0;

    return (
        <div className="space-y-6 w-full max-w-sm">
            {/* Productivity Score Widget (replaces Neural Growth) */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-xs uppercase tracking-widest text-white/40">Productivity Score</span>
                    <span className={cn("text-xs font-mono", prodScore >= 0 ? "text-emerald-400" : "text-red-400")}>
                        {prodScore.toFixed(1)}
                    </span>
                </div>
                <div className="h-24 flex items-end gap-1 mb-2">
                    {/* Visualizing component contribution. Multiplied by 5 to make them visible even for low scores. */}
                    <div className="flex-1 bg-white/5 rounded-t relative group flex flex-col justify-end">
                        <div className="w-full bg-blue-500/20" style={{ height: `${Math.min(100, Math.max(5, (productivity?.breakdown.taskComponent || 0) * 5))}%` }} />
                        <span className="absolute bottom-1 w-full text-center text-[8px] text-white/20">Tasks</span>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-t relative group flex flex-col justify-end">
                        <div className="w-full bg-purple-500/20" style={{ height: `${Math.min(100, Math.max(5, (productivity?.breakdown.projectComponent || 0) * 5))}%` }} />
                        <span className="absolute bottom-1 w-full text-center text-[8px] text-white/20">Projs</span>
                    </div>
                    <div className="flex-1 bg-white/5 rounded-t relative group flex flex-col justify-end">
                        {/* Overdue penalty */}
                        <div className="w-full bg-red-500/20" style={{ height: `${Math.min(100, Math.max(5, (productivity?.breakdown.overduePenalty || 0) * 5))}%` }} />
                        <span className="absolute bottom-1 w-full text-center text-[8px] text-white/20">Overdue</span>
                    </div>
                </div>
                <div className="flex justify-between text-[9px] text-white/20 uppercase tracking-widest">
                    <span>Components</span>
                </div>
            </div>

            {/* Task Stats (replaces Task Velocity) */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-white/50 font-mono">
                        Overdue: {taskMetrics?.overdueCount ?? 0}
                    </div>
                </div>

                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-8">Task Stats</h3>

                <div className="flex items-center justify-center relative py-6">
                    {/* Circular Progress for Completion Rate */}
                    <svg className="w-32 h-32 rotate-[-90deg]">
                        <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                        <circle className="text-amber-400 transition-all duration-1000 ease-out" strokeWidth="8" strokeDasharray="364"
                            strokeDashoffset={364 - (364 * taskCompletion / 100)}
                            strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className={cn(playfair.className, "text-4xl font-bold text-white")}>
                            {taskCompletion.toFixed(0)}%
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40">Completion</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div>
                        <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Avg Duration</div>
                        <div className="text-sm font-medium text-blue-400">{taskMetrics?.avgDurationHours.toFixed(1)} hrs</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Total</div>
                        <div className="text-sm font-medium text-emerald-400">{taskMetrics?.totalTasks}</div>
                    </div>
                </div>
            </div>

            {/* Project Stats (replaces Knowledge Distribution) */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6">Project Metrics</h3>
                <div className="space-y-5">
                    {[
                        { label: 'Completion Rate', val: projectCompletion, color: 'bg-green-500/80' },
                        { label: 'Active Projects', val: activeProjects, color: 'bg-blue-500/80', isCount: true },
                        { label: 'Archived', val: projectMetrics?.archivedCount ?? 0, color: 'bg-white/20', isCount: true },
                        { label: 'Avg Duration (Days)', val: projectMetrics?.avgDurationDays ?? 0, color: 'bg-purple-500/40', isCount: true },
                    ].map((item) => (
                        <div key={item.label}>
                            <div className="flex justify-between text-xs text-white/60 mb-2">
                                <span>{item.label}</span>
                                <span className="font-mono">{item.isCount ? item.val.toFixed(0) : `${item.val.toFixed(1)}%`}</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", item.color)} style={{ width: `${Math.min(100, item.val)}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
