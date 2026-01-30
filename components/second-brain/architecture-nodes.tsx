'use client'

import { motion } from 'framer-motion'
import { Folder, CheckCircle2, FileText, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ArchitectureNodesProps {
    counts: {
        projects: number
        tasks: number
        notes: number
    }
}

export function ArchitectureNodes({ counts }: ArchitectureNodesProps) {
    const router = useRouter()

    const items = [
        { label: 'Projects', count: counts.projects, icon: Folder, color: 'text-amber-400', href: '/systems/second-brain/projects-sb' },
        { label: 'Tasks', count: counts.tasks, icon: CheckCircle2, color: 'text-blue-400', href: '/systems/second-brain/tasks-sb' },
        { label: 'Notes', count: counts.notes > 1000 ? (counts.notes / 1000).toFixed(1) + 'k' : counts.notes, icon: FileText, color: 'text-emerald-400', href: '/systems/second-brain/notes-sb' },
    ]

    return (
        <div className="w-full h-full flex flex-col">
            <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6">Architecture Nodes</h3>

            <div className="space-y-4 flex-1">
                {items.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => router.push(item.href)}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded bg-black border border-white/10 ${item.color} group-hover:scale-110 transition-transform`}>
                                <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                                {item.label}
                            </span>
                        </div>
                        <span className="font-mono text-sm text-white transition-all group-hover:translate-x-[-4px]">
                            {item.count}
                        </span>
                    </button>
                ))}
            </div>

            <div className="pt-6 border-t border-white/10 mt-auto">
                <button className="w-full py-3 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white transition-all">
                    Full Inventory
                </button>
            </div>
        </div>
    )
}
