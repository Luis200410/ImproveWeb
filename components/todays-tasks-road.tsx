'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, MapPin, Calendar as CalendarIcon, ArrowRight } from 'lucide-react'
import { Entry } from '@/lib/data-store'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { cn } from '@/lib/utils'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface TodaysTasksRoadProps {
    entries: Entry[]
    onToggleStatus: (entry: Entry) => void
    onEditEntry: (entry: Entry) => void
    onCreateEntry: () => void
}

export function TodaysTasksRoad({ entries, onToggleStatus, onEditEntry, onCreateEntry }: TodaysTasksRoadProps) {
    // Sort entries by status (pending first) then perhaps by time if available?
    // For now just generic sort.
    const sortedEntries = [...entries].sort((a, b) => {
        if (a.data['Status'] === 'Done' && b.data['Status'] !== 'Done') return 1
        if (a.data['Status'] !== 'Done' && b.data['Status'] === 'Done') return -1
        return 0
    })

    return (
        <div className="w-full relative py-12 overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 mb-8 px-4">
                <span className="text-xl">🔥</span>
                <h2 className={`${playfair.className} text-3xl font-bold text-white`}>
                    Drag the Motion-style road
                </h2>
            </div>

            {/* The Road Container */}
            <div className="relative min-h-[300px] flex items-center">
                {/* Visual Line */}
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white/10 z-0" />

                <motion.div
                    className="flex items-stretch gap-12 px-12 z-10 cursor-grab active:cursor-grabbing w-full overflow-x-auto no-scrollbar"
                    drag="x"
                    dragConstraints={{ left: -((sortedEntries.length + 1) * 350), right: 0 }}
                >
                    {/* Task Cards */}
                    {sortedEntries.map((entry, index) => {
                        const isDone = entry.data['Status'] === 'Done'

                        return (
                            <motion.div
                                key={entry.id}
                                className={cn(
                                    "relative flex-shrink-0 w-[400px] flex flex-col bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 transition-all duration-300 group",
                                    isDone ? "opacity-60" : "hover:border-white/30 hover:bg-white/5"
                                )}
                                whileHover={{ y: -5 }}
                            >
                                {/* Connector Dot */}
                                <div className="absolute top-1/2 -left-[31px] w-4 h-4 rounded-full bg-white/20 border-2 border-[#0A0A0A] z-20 group-hover:bg-white transition-colors" />
                                {index === sortedEntries.length - 1 && (
                                    <div className="absolute top-1/2 -right-[31px] w-4 h-4 rounded-full bg-white/20 border-2 border-[#0A0A0A] z-20" />
                                )}

                                {/* Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Task Parent</p>
                                        <h3 className={cn(
                                            `${playfair.className} text-xl font-bold text-white leading-tight`,
                                            isDone && "line-through text-white/40"
                                        )}>
                                            {entry.data['Title'] || 'Untitled Task'}
                                        </h3>
                                    </div>
                                    <span className={cn(
                                        "text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full",
                                        isDone ? "bg-white/10 text-emerald-400" : "bg-white/10 text-amber-400"
                                    )}>
                                        {isDone ? 'Done' : 'Active'}
                                    </span>
                                </div>

                                {/* Metadata */}
                                <div className="mb-6 flex-1">
                                    <p className="text-sm text-white/50 mb-3">
                                        Project: {entry.data['Project']?.title || 'No Project'}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                                            {entry.data['Start Date']
                                                ? new Date(entry.data['Start Date']).toLocaleDateString('en-US', {
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    year: 'numeric'
                                                })
                                                : 'No Date'}
                                        </div>
                                        {entry.data['Resources'] && (
                                            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">
                                                Resources linked
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 border-t border-white/10 pt-4 mt-auto">
                                    <button
                                        onClick={() => onToggleStatus(entry)}
                                        className="bg-white text-black text-sm font-semibold px-4 py-2 rounded-md hover:bg-white/90 transition-colors"
                                    >
                                        Toggle state
                                    </button>
                                    <button
                                        onClick={() => onEditEntry(entry)}
                                        className="bg-black text-white border border-white/20 text-sm font-semibold px-4 py-2 rounded-md hover:border-white transition-colors"
                                    >
                                        Open
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
                                    <MapPin className="w-3 h-3" />
                                    <span>Drag to reorder priority along the road #{index + 1}</span>
                                </div>
                            </motion.div>
                        )
                    })}

                    {/* Add New Card */}
                    <motion.div
                        onClick={onCreateEntry}
                        className="relative flex-shrink-0 w-[200px] min-h-[250px] flex flex-col items-center justify-center gap-4 bg-[#0A0A0A] border border-dashed border-white/10 rounded-3xl p-6 cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all group"
                        whileHover={{ scale: 1.05 }}
                    >
                        {/* Connector Dot */}
                        <div className="absolute top-1/2 -left-[31px] w-4 h-4 rounded-full bg-white/20 border-2 border-[#0A0A0A] z-20 group-hover:bg-amber-400 transition-colors" />

                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                            <Plus className="w-6 h-6 text-white/60 group-hover:text-white" />
                        </div>
                        <p className="text-sm font-medium text-white/40 group-hover:text-white/80 transition-colors">
                            Add to Day
                        </p>
                    </motion.div>

                    {/* Spacer for scroll */}
                    <div className="w-12 flex-shrink-0" />
                </motion.div>
            </div>
        </div>
    )
}
