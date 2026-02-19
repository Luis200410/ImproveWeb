'use client'

import { motion } from 'framer-motion'
import { Folder, CheckCircle2, FileText, ArrowRight, Activity, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ProjectMetrics, TaskMetrics, ProductivityScore } from './analytics-utils'
import { cn } from '@/lib/utils'

interface ArchitectureNodesProps {
    counts: {
        projects: number
        tasks: number
        notes: number
    }
    taskMetrics?: TaskMetrics
    projectMetrics?: ProjectMetrics
    productivity?: ProductivityScore
}

export function ArchitectureNodes({ counts, taskMetrics, projectMetrics, productivity }: ArchitectureNodesProps) {
    const router = useRouter()

    const score = productivity?.score ?? 0;
    const taskCompletion = taskMetrics?.completionRate ?? 0;
    const projectCompletion = projectMetrics?.completionRate ?? 0;
    const overdue = taskMetrics?.overdueCount ?? 0;

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xs uppercase tracking-widest text-white/40">Architecture Nodes</h3>
                {productivity && (
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-white/40" />
                        <span className={cn("text-xs font-mono font-bold", score >= 0 ? "text-emerald-400" : "text-red-400")}>
                            {score.toFixed(1)}
                        </span>
                    </div>
                )}
            </div>

            <div className="space-y-4 flex-1">
                {/* Projects Card */}
                <button
                    onClick={() => router.push('/systems/second-brain/projects-sb')}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group text-left relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-black border border-white/10 text-amber-400 group-hover:scale-110 transition-transform">
                                <Folder className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors block">Projects</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">{projectMetrics?.activeCount ?? 0} Active</span>
                            </div>
                        </div>
                        <span className="font-mono text-xl text-white">
                            {counts.projects}
                        </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-amber-500/50" style={{ width: `${projectCompletion}%` }} />
                    </div>
                </button>

                {/* Tasks Card */}
                <button
                    onClick={() => router.push('/systems/second-brain/tasks-sb')}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group text-left relative overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-black border border-white/10 text-blue-400 group-hover:scale-110 transition-transform">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors block">Tasks</span>
                                {overdue > 0 ? (
                                    <span className="text-[10px] text-red-400 uppercase tracking-wider flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {overdue} Overdue
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{taskCompletion.toFixed(0)}% Done</span>
                                )}
                            </div>
                        </div>
                        <span className="font-mono text-xl text-white">
                            {counts.tasks}
                        </span>
                    </div>
                    {/* Mini Progress Bar */}
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden mt-2">
                        <div className={cn("h-full", overdue > 0 ? "bg-red-500/50" : "bg-blue-500/50")} style={{ width: `${taskCompletion}%` }} />
                    </div>
                </button>

                {/* Notes Card */}
                <button
                    onClick={() => router.push('/systems/second-brain/notes-sb')}
                    className="w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group text-left"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded bg-black border border-white/10 text-emerald-400 group-hover:scale-110 transition-transform">
                                <FileText className="w-4 h-4" />
                            </div>
                            <div>
                                <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors block">Notes</span>
                                <span className="text-[10px] text-white/40 uppercase tracking-wider">Knowledge Base</span>
                            </div>
                        </div>
                        <span className="font-mono text-xl text-white">
                            {counts.notes > 1000 ? (counts.notes / 1000).toFixed(1) + 'k' : counts.notes}
                        </span>
                    </div>
                </button>
            </div>

            <div className="pt-6 border-t border-white/10 mt-auto">
                <button className="w-full py-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
                    Full Inventory
                </button>
            </div>
        </div>
    )
}
