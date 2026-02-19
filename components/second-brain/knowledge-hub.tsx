'use client'

import { motion } from 'framer-motion'
import { Brain, LayoutGrid, Rocket, ListTodo, Layers, BookOpenCheck, Archive, Inbox, NotebookPen, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Playfair_Display } from '@/lib/font-shim'
import { ProjectMetrics, TaskMetrics, ProductivityScore } from './analytics-utils'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface KnowledgeHubProps {
    counts: {
        projects: number
        tasks: number
        notes: number
    }
    taskMetrics?: TaskMetrics
    projectMetrics?: ProjectMetrics
    productivity?: ProductivityScore
}

export function KnowledgeHub({ counts, taskMetrics, projectMetrics, productivity }: KnowledgeHubProps) {
    const router = useRouter()

    const score = productivity?.score ?? 0
    const overdue = taskMetrics?.overdueCount ?? 0

    // Map data to nodes
    const nodes = [
        {
            id: 'projects',
            label: 'Projects',
            icon: Rocket,
            color: 'text-indigo-400',
            href: '/systems/second-brain/projects-sb',
            angle: -90,
            metric: `${projectMetrics?.activeCount ?? 0} Active`,
            subMetric: `${projectMetrics?.completionRate.toFixed(0)}% Done`
        },
        {
            id: 'tasks',
            label: 'Tasks',
            icon: ListTodo,
            color: 'text-sky-400',
            href: '/systems/second-brain/tasks-sb',
            angle: -30,
            metric: `${taskMetrics?.totalTasks ?? 0} Total`,
            subMetric: overdue > 0 ? `${overdue} Overdue` : `${taskMetrics?.completionRate.toFixed(0)}% Done`,
            alert: overdue > 0
        },
        {
            id: 'notes',
            label: 'Notes',
            icon: NotebookPen,
            color: 'text-purple-400',
            href: '/systems/second-brain/notes-sb',
            angle: 30,
            metric: counts.notes > 1000 ? (counts.notes / 1000).toFixed(1) + 'k' : counts.notes,
            subMetric: 'Notes'
        },
        {
            id: 'resources',
            label: 'Resources',
            icon: BookOpenCheck,
            color: 'text-amber-400',
            href: '/systems/second-brain/resources-sb',
            angle: 90,
            metric: 'Library',
            subMetric: 'View'
        },
        {
            id: 'areas',
            label: 'Areas',
            icon: Layers,
            color: 'text-emerald-400',
            href: '/systems/second-brain/areas-sb',
            angle: 150,
            metric: 'Zones',
            subMetric: 'Manage'
        },
        {
            id: 'inbox',
            label: 'Inbox',
            icon: Inbox,
            color: 'text-rose-400',
            href: '/systems/second-brain/inbox-sb',
            angle: 210,
            metric: 'Capture',
            subMetric: 'Process'
        },
    ]

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative w-full aspect-square max-w-[800px] flex items-center justify-center"
        >

            {/* Background Rings - Circuit Style */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-[70%] h-[70%] border border-white/5 rounded-full border-dashed" />
                <div className="w-[40%] h-[40%] border border-white/5 rounded-full" />
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent rotate-0" />
                <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent rotate-90" />
            </div>

            {/* Connecting Lines (Circuit Board Style) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-40">
                <g style={{ transform: 'translate(50%, 50%)' }}>
                    {nodes.map((node, i) => {
                        const radius = 240
                        const angleRad = (node.angle - 90) * (Math.PI / 180)
                        // Circuit Style: Move Out then Angled
                        // Endpoint
                        const x = Math.cos(node.angle * (Math.PI / 180)) * radius * 0.8
                        const y = Math.sin(node.angle * (Math.PI / 180)) * radius * 0.8

                        // Midpoints for circuit look
                        const midX = x * 0.5
                        const midY = y * 0.5

                        return (
                            <path
                                key={i}
                                d={`M 0 0 L ${midX} ${midY} L ${x} ${y}`}
                                stroke="url(#circuit-gradient)"
                                strokeWidth="1"
                                fill="none"
                            />
                        )
                    })}
                    <defs>
                        <linearGradient id="circuit-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="50%" stopColor="rgba(245, 158, 11, 0.5)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                    </defs>
                </g>
            </svg>

            {/* Center Node: Brain (Turning On Animation) */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                className="relative z-20 w-24 h-24 rounded-full bg-[#1A1A1A] border border-amber-500/50 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.2)] group cursor-default"
            >
                <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-pulse" />
                <Brain className="w-10 h-10 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
            </motion.div>

            {/* Satellite Nodes (Orbital Animation) */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            >
                {nodes.map((node, i) => {
                    const radius = 240
                    const x = Math.cos(node.angle * (Math.PI / 180)) * radius
                    const y = Math.sin(node.angle * (Math.PI / 180)) * radius

                    return (
                        <motion.button
                            key={node.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.8 + (i * 0.1) }}
                            onClick={() => router.push(node.href)}
                            className="absolute left-1/2 top-1/2 w-32 h-32 -ml-16 -mt-16 flex flex-col items-center justify-center gap-1 pointer-events-auto group outline-none"
                            style={{ x, y }}
                        >
                            <motion.div
                                // Counter-rotate to keep text upright
                                animate={{ rotate: -360 }}
                                transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                                className="flex flex-col items-center justify-center"
                            >
                                <div className={cn(
                                    "w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-[#111] transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] relative",
                                    "shadow-lg backdrop-blur-sm"
                                )}>
                                    <node.icon className={cn("w-5 h-5 transition-colors", node.color)} />
                                    {node.alert && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border border-black" />
                                    )}
                                </div>
                                <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium group-hover:text-white transition-colors mt-2">
                                    {node.label}
                                </span>
                                <div className="flex flex-col items-center">
                                    <span className={cn("text-xs font-bold font-mono", node.alert ? "text-red-400" : "text-white/80")}>
                                        {node.metric}
                                    </span>
                                    {node.subMetric && (
                                        <span className="text-[8px] text-white/40 uppercase tracking-wider">
                                            {node.subMetric}
                                        </span>
                                    )}
                                </div>
                            </motion.div>
                        </motion.button>
                    )
                })}
            </motion.div>
        </motion.div>
    )
}
