'use client'

import { motion } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { cn } from '@/lib/utils'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export function StatsSidebar() {
    return (
        <div className="space-y-6 w-full max-w-sm">
            {/* Neural Growth Widget */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-xs uppercase tracking-widest text-white/40">Neural Growth</span>
                    <span className="text-xs text-emerald-400 font-mono">+12.4%</span>
                </div>
                {/* Mock Chart Area */}
                <div className="h-24 flex items-end gap-1 mb-2">
                    {[30, 45, 35, 60, 50, 75, 65].map((h, i) => (
                        <div key={i} className="flex-1 bg-white/5 rounded-t hover:bg-white/10 transition-colors relative group">
                            <div className="absolute bottom-0 w-full bg-emerald-500/20" style={{ height: `${h}%` }} />
                            <div className="absolute bottom-0 w-full border-t border-emerald-500/50" style={{ height: `${h}%` }} />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-[9px] text-white/20 uppercase tracking-widest">
                    <span>Mon</span>
                    <span>Sun</span>
                </div>
            </div>

            {/* Task Velocity Widget */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-50">
                    <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-white/50 font-mono">
                        Stitch - Design with AI
                    </div>
                </div>

                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-8">Task Velocity</h3>

                <div className="flex items-center justify-center relative py-6">
                    {/* Circular Progress Mock */}
                    <svg className="w-32 h-32 rotate-[-90deg]">
                        <circle className="text-white/5" strokeWidth="8" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                        <circle className="text-amber-400" strokeWidth="8" strokeDasharray="364" strokeDashoffset="90" strokeLinecap="round" stroke="currentColor" fill="transparent" r="58" cx="64" cy="64" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className={cn(playfair.className, "text-4xl font-bold text-white")}>84</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40">Nodes/Hr</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/5">
                    <div>
                        <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Output</div>
                        <div className="text-sm font-medium text-blue-400">High</div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] uppercase tracking-wider text-white/30 mb-1">Trend</div>
                        <div className="text-sm font-medium text-emerald-400">Rising</div>
                    </div>
                </div>
            </div>

            {/* Knowledge Distribution Widget */}
            <div className="p-6 rounded-3xl bg-[#0A0A0A] border border-white/10">
                <h3 className="text-xs uppercase tracking-widest text-white/40 mb-6">Knowledge Distribution</h3>
                <div className="space-y-5">
                    {[
                        { label: 'Concepts', val: 42, color: 'bg-white/80' },
                        { label: 'Logistics', val: 28, color: 'bg-white/40' },
                        { label: 'Media', val: 15, color: 'bg-white/20' },
                        { label: 'Archive', val: 15, color: 'bg-white/10' },
                    ].map((item) => (
                        <div key={item.label}>
                            <div className="flex justify-between text-xs text-white/60 mb-2">
                                <span>{item.label}</span>
                                <span className="font-mono">{item.val}%</span>
                            </div>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.val}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
