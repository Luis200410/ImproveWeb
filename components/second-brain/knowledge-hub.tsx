'use client'

import { motion } from 'framer-motion'
import { Brain, LayoutGrid, Rocket, ListTodo, Layers, BookOpenCheck, Archive, Inbox, NotebookPen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { Playfair_Display } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })

const nodes = [
    { id: 'projects', label: 'Projects', icon: Rocket, color: 'text-indigo-400', href: '/systems/second-brain/projects-sb', angle: -90 }, // Top
    { id: 'tasks', label: 'Tasks', icon: ListTodo, color: 'text-sky-400', href: '/systems/second-brain/tasks-sb', angle: -30 }, // Top Right
    { id: 'notes', label: 'Notes', icon: NotebookPen, color: 'text-purple-400', href: '/systems/second-brain/notes-sb', angle: 30 }, // Bottom Right
    { id: 'resources', label: 'Resources', icon: BookOpenCheck, color: 'text-amber-400', href: '/systems/second-brain/resources-sb', angle: 90 }, // Bottom
    { id: 'areas', label: 'Areas', icon: Layers, color: 'text-emerald-400', href: '/systems/second-brain/areas-sb', angle: 150 }, // Bottom Left
    { id: 'inbox', label: 'Inbox', icon: Inbox, color: 'text-rose-400', href: '/systems/second-brain/inbox-sb', angle: 210 }, // Top Left
    // Archive could be central or another node? Let's put it nearby or just 6 items. 
    // The user image shows ~6 peripheral nodes.
]

export function KnowledgeHub() {
    const router = useRouter()

    return (
        <div className="relative w-full aspect-square max-w-[800px] flex items-center justify-center">

            {/* Background Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-[80%] h-[80%] border border-dashed border-white/20 rounded-full" />
                <div className="w-[50%] h-[50%] border border-white/10 rounded-full" />
            </div>

            {/* Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-30">
                <g style={{ transform: 'translate(50%, 50%)' }}>
                    {nodes.map((node, i) => {
                        const radius = 280 // Approximate distance
                        const rad = (node.angle - 90) * (Math.PI / 180) // -90 offset because 0 is right in SVG, but we want 0 to be top? No, let's just stick to standard trig: 0 is Right.
                        // My node.angle usage: -90 is top.
                        // Trig: 0 deg = Right (x+, y0). -90 deg = Top (x0, y-).
                        // So standard conversion works if angle is correct.

                        const x = Math.cos(node.angle * (Math.PI / 180)) * radius
                        const y = Math.sin(node.angle * (Math.PI / 180)) * radius

                        return (
                            <line
                                key={i}
                                x1={0} y1={0}
                                x2={x * 0.8} y2={y * 0.8} // Stop short of the icon
                                stroke="currentColor"
                                className="text-white/40"
                                strokeDasharray="4 4"
                            />
                        )
                    })}
                </g>
            </svg>

            {/* Center Node */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-20 w-32 h-32 rounded-full bg-[#1A1A1A] border border-amber-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.1)] group cursor-default"
            >
                <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-pulse" />
                <Brain className="w-12 h-12 text-amber-500" />
            </motion.div>

            {/* Satellite Nodes */}
            <div className="absolute inset-0 pointer-events-none">
                {nodes.map((node, i) => {
                    const radius = 280 // matches SVG
                    // Calculate CSS position
                    // We want to translate from center
                    const x = Math.cos(node.angle * (Math.PI / 180)) * radius
                    const y = Math.sin(node.angle * (Math.PI / 180)) * radius

                    return (
                        <motion.button
                            key={node.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            onClick={() => router.push(node.href)}
                            className="absolute left-1/2 top-1/2 w-24 h-24 -ml-12 -mt-12 flex flex-col items-center justify-center gap-2 pointer-events-auto group outline-none"
                            style={{ x, y }}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center border border-white/10 bg-[#111] transition-all duration-300 group-hover:scale-110 group-hover:border-white/30 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]",
                                "shadow-lg"
                            )}>
                                <node.icon className={cn("w-5 h-5 transition-colors", node.color)} />
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium group-hover:text-white transition-colors">
                                {node.label}
                            </span>
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}
