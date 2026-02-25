'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Hash, Database } from 'lucide-react'
import { Entry } from '@/lib/data-store'

interface NoteCardProps {
    note: Entry
    isSelected: boolean
    onClick: () => void
    projectMap: Record<string, string> // ID -> Name
    areaMap: Record<string, string> // ID -> Name
    taskMap: Record<string, string> // ID -> Name
}

export function NoteCard({ note, isSelected, onClick, projectMap, areaMap, taskMap }: NoteCardProps) {
    const stripHtml = (html: string) => {
        if (!html) return ''
        return html.replace(/<[^>]*>?/gm, ' ')
    }
    const date = new Date(note.data.Date || note.createdAt).toLocaleDateString().replace(/\//g, '.')
    const time = new Date(note.data.Date || note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const projectName = note.data.Project ? projectMap[note.data.Project] : null
    const areaName = note.data.Area ? areaMap[note.data.Area] : null
    const taskName = note.data.Task ? taskMap[note.data.Task] : null

    return (
        <motion.div
            onClick={onClick}
            layoutId={note.id}
            className={`
                group relative p-5 cursor-pointer border-b border-white/5 transition-all duration-300
                ${isSelected ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}
            `}
        >
            {/* Selection Indicator */}
            {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
            )}

            {/* Header Metadata */}
            <div className="flex justify-between items-start mb-4 opacity-50 text-[10px] font-mono">
                <div className="flex gap-2">
                    {projectName && (
                        <span className="border border-blue-500/30 text-blue-400 px-1.5 py-0.5 rounded bg-blue-500/5">
                            PRJ: {projectName.toUpperCase().slice(0, 10)}
                        </span>
                    )}
                    {areaName && (
                        <span className="border border-purple-500/30 text-purple-400 px-1.5 py-0.5 rounded bg-purple-500/5">
                            AREA: {areaName.toUpperCase().slice(0, 10)}
                        </span>
                    )}
                </div>
                <div className="tracking-tighter">
                    {date}_{time}
                </div>
            </div>

            {/* Task Badge (if exists) */}
            {taskName && (
                <div className="mb-3 inline-flex items-center gap-2 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-mono uppercase tracking-wider">
                    <Database className="w-3 h-3" />
                    TSK: {taskName.slice(0, 20)}
                </div>
            )}

            {/* Title */}
            <h3 className={`text-xl font-serif leading-tight mb-3 transition-colors ${isSelected ? 'text-white' : 'text-white/80 group-hover:text-white'}`}>
                {note.data.Title || 'Untitled Sequence'}
            </h3>

            {/* Snippet */}
            <p className="text-sm text-white/40 font-light line-clamp-2 mb-4 leading-relaxed">
                {note.data.Summary || stripHtml(note.data['Main Notes']) || 'No content preview available... content encrypted/missing.'}
            </p>

            {/* Footer / Tags */}
            <div className="flex justify-between items-center text-[10px] text-amber-500/50 font-mono">
                <div className="flex gap-3">
                    {note.data.Cues ? (
                        note.data.Cues.split(',').slice(0, 2).map((cue: string, i: number) => (
                            <span key={i} className="flex items-center gap-1 opacity-70">
                                #{(cue.trim() || 'tag').toLowerCase()}
                            </span>
                        ))
                    ) : (
                        <span className="opacity-30">#untagged</span>
                    )}
                </div>
                <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isSelected ? 'translate-x-1 text-amber-500 opactiy-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
            </div>
        </motion.div>
    )
}
