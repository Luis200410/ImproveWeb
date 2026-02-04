'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, ExternalLink, Activity, Database, Cpu, Command, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Entry } from '@/lib/data-store'
import { Playfair_Display } from '@/lib/font-shim'
import { NeuralEditor } from './neural-editor'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface NoteDetailViewProps {
    note: Entry
    onClose: () => void
    onUpdate: (id: string, updates: Partial<Entry['data']>) => void
    projectMap: Record<string, string>
    areaMap: Record<string, string>
    taskMap: Record<string, string>
}

export function NoteDetailView({ note, onClose, onUpdate, projectMap, areaMap, taskMap }: NoteDetailViewProps) {
    const [content, setContent] = useState(note.data['Main Notes'] || '')
    const [title, setTitle] = useState(note.data.Title || '')
    const [editMode, setEditMode] = useState(false)

    useEffect(() => {
        setContent(note.data['Main Notes'] || '')
        setTitle(note.data.Title || '')
    }, [note])

    const handleSave = () => {
        onUpdate(note.id, {
            'Main Notes': content,
            'Title': title
        })
        setEditMode(false)
    }

    const projectName = note.data.Project ? projectMap[note.data.Project] : 'UNLINKED'
    const areaName = note.data.Area ? areaMap[note.data.Area] : 'GENERAL'
    // Ensure taskMap exists and task ID is valid before access
    const taskName = (note.data.Task && taskMap && taskMap[note.data.Task]) ? taskMap[note.data.Task] : 'NO_OPS'

    return (
        <div className="h-full flex flex-col bg-[#050505] border-l border-white/10 relative">
            {/* Header / Active Session Indicator */}
            <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0A0A0A]">
                <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/80">Neural Active Session</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="font-mono text-[10px] text-white/30">SESSION_ID: N-{note.id.slice(0, 4)}</span>
                    <button onClick={onClose} className="hover:text-amber-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Linked Relations Dashboard */}
            <div className="p-6 border-b border-white/10 bg-white/[0.01]">
                <div className="flex justify-between items-end mb-4">
                    <span className="text-[9px] uppercase tracking-widest text-white/30 font-mono">Linked Relations</span>
                    <span className="text-[9px] uppercase tracking-widest text-amber-500 font-mono animate-pulse">Active_Link</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-[#0F0F0F] border border-white/10 rounded p-3">
                        <div className="text-[8px] uppercase tracking-widest text-blue-400 mb-1">Project</div>
                        <div className="text-xs font-mono text-blue-200 truncate">{projectName}</div>
                    </div>
                    <div className="bg-[#0F0F0F] border border-white/10 rounded p-3">
                        <div className="text-[8px] uppercase tracking-widest text-purple-400 mb-1">Area</div>
                        <div className="text-xs font-mono text-purple-200 truncate">{areaName}</div>
                    </div>
                    <div className="bg-[#0F0F0F] border border-white/10 rounded p-3">
                        <div className="text-[8px] uppercase tracking-widest text-emerald-400 mb-1">Task</div>
                        <div className="text-xs font-mono text-emerald-200 truncate">{taskName}</div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left Column: Cues & Metadata */}
                <div className="w-64 border-r border-white/10 p-6 space-y-8 hidden lg:block overflow-y-auto custom-scrollbar">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-amber-500">
                            <span className="w-1 h-3 bg-amber-500 rounded-full" />
                            <span className="text-[10px] uppercase tracking-widest font-bold">Cues & Keywords</span>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h4 className="text-[9px] uppercase text-white/40 mb-2 font-mono">Cognitive Load</h4>
                                <p className="text-xs text-white/60 italic leading-relaxed">
                                    {note.data.Cues || 'No specific cognitive markers defined for this entry.'}
                                </p>
                            </div>
                            <div className="pt-4 border-t border-white/5">
                                <h4 className="text-[9px] uppercase text-white/40 mb-2 font-mono">Recall Triggers</h4>
                                <div className="space-y-2">
                                    {(note.data.Cues || '').split(',').map((cue: string, i: number) => (
                                        cue && <div key={i} className="text-xs text-amber-500/80 font-mono">→ {cue.trim()}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Note Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12 relative">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <div>
                            <span className="block text-[10px] uppercase tracking-widest text-white/30 mb-4 font-mono">• Note Content</span>
                            <input
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value)
                                    // Debounced save for title could go here, or just save on blur/effect
                                    // For now, we'll rely on the useEffect below or specific blur handler if needed.
                                    // Actually, simplest is to just expose onUpdate and let parent debounce, 
                                    // but we'll trigger a simpler update here.
                                    onUpdate(note.id, { 'Title': e.target.value })
                                }}
                                className={`${playfair.className} text-4xl lg:text-5xl text-white bg-transparent border-b border-white/5 w-full focus:outline-none focus:border-amber-500 transition-colors pb-2 placeholder:text-white/10`}
                                placeholder="Untitled Sequence"
                            />
                        </div>

                        <div className="min-h-[500px]">
                            <NeuralEditor
                                initialContent={content}
                                onChange={(newContent) => {
                                    setContent(newContent)
                                    // Debounced auto-save logic needs to be robust. 
                                    // For this iteration, we'll call onUpdate directly but we should ideally debounce it.
                                    // Assuming onUpdate in page.tsx handles or we wrap it. 
                                    // Let's implement a simple local debounce or throttle if needed, 
                                    // but for "Notion-fast" feel, immediate state update + debounced DB call is best.
                                    // We will pass to parent.
                                    onUpdate(note.id, { 'Main Notes': newContent })
                                }}
                            />
                        </div>

                        <div className="pt-12 mt-12 border-t border-white/10">
                            <div className="flex items-center gap-2 mb-4 text-emerald-500">
                                <Cpu className="w-4 h-4" />
                                <span className="text-[10px] uppercase tracking-widest font-bold">Synthesis Summary</span>
                            </div>
                            <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
                                {note.data.Summary || 'No synthesis generated for this entry.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-white/10 bg-[#0A0A0A] flex justify-between items-center z-10">
                <div className="hidden lg:flex items-center gap-8">
                    <div>
                        <span className="block text-[8px] uppercase tracking-widest text-white/30 mb-1">Neural Connectivity</span>
                        <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full w-[84%] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                        </div>
                    </div>
                    <span className="font-mono text-[10px] text-amber-500 animate-pulse">SYNC_ACTIVE</span>
                </div>

                <div className="flex items-center gap-4 ml-auto">
                    <span className="text-[9px] uppercase tracking-wider text-white/20 font-mono">
                        Auto-Save Enabled
                    </span>
                </div>
            </div>
        </div>
    )
}
