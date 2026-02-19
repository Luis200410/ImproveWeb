'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Folder, Boxes, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProjectEntry } from '@/components/second-brain/projects/project-utils'
import { Entry } from '@/lib/data-store'

interface NoteForgeProps {
    onClose: () => void
    onCreate: (data: any) => void
    projects: ProjectEntry[]
    areas: Entry[]
    tasks: Entry[]
    defaultProjectId?: string
    defaultTaskId?: string
}

export function NoteForge({ onClose, onCreate, projects, areas, tasks, defaultProjectId, defaultTaskId }: NoteForgeProps) {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedProject, setSelectedProject] = useState(defaultProjectId || '')
    const [selectedArea, setSelectedArea] = useState('')
    const [selectedTask, setSelectedTask] = useState(defaultTaskId || '')

    const handleSubmit = () => {
        if (!title) return

        onCreate({
            Title: title,
            Date: date,
            Project: selectedProject || null,
            Area: selectedArea || null,
            Task: selectedTask || null,
            'Main Notes': '', // Start empty
            Cues: ''
        })
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-end justify-end sm:items-center p-4 sm:p-0">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="w-full sm:w-[500px] bg-[#050505] border-l border-white/10 h-full shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 flex flex-col"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-8 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-white">Neural Forge</h2>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Bar (Visual) */}
                <div className="w-full h-0.5 bg-white/5">
                    <div className="h-full w-[25%] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-10">
                    {/* 01 Designation */}
                    <div className="space-y-4">
                        <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-2">01 Neural Designation</div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest text-white/30">Entry Title</label>
                            <input
                                autoFocus
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="CAPTURE_THOUGHT_SEQUENCE..."
                                className="w-full bg-[#0A0A0A] border border-white/10 text-white p-4 rounded text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 transition-colors uppercase"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] uppercase tracking-widest text-white/30">Temporal Marker</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-[#0A0A0A] border border-white/10 text-amber-500 p-4 rounded text-sm font-mono focus:outline-none focus:border-amber-500/50 transition-colors"
                                />
                                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {/* 02 Classification */}
                    <div className="space-y-4">
                        <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-2">02 Matrix Classification</div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase tracking-widest text-white/30">Select Project</label>
                                <select
                                    className="w-full bg-[#0A0A0A] border border-white/10 text-white/60 p-4 rounded text-xs font-mono focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                                    value={selectedProject}
                                    onChange={e => setSelectedProject(e.target.value)}
                                >
                                    <option value="">NO_PROJECT</option>
                                    {projects.map(p => (
                                        <option key={p.id} value={p.id}>{p.data['Project Name']}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] uppercase tracking-widest text-white/30">Assign Area</label>
                                <select
                                    className="w-full bg-[#0A0A0A] border border-white/10 text-white/60 p-4 rounded text-xs font-mono focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                                    value={selectedArea}
                                    onChange={e => setSelectedArea(e.target.value)}
                                >
                                    <option value="">NO_AREA</option>
                                    {areas.map(a => (
                                        <option key={a.id} value={a.id}>{a.data.Name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* 03 Task Synapse */}
                    <div className="space-y-4">
                        <div className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-2">03 Task Synapse</div>
                        <div className="relative group">
                            <select
                                className="w-full bg-[#0A0A0A] border border-amber-500/20 text-emerald-500 p-6 rounded text-xs font-mono focus:outline-none focus:border-emerald-500 transition-colors appearance-none cursor-pointer"
                                value={selectedTask}
                                onChange={e => setSelectedTask(e.target.value)}
                            >
                                <option value="">RELATE TO ACTIVE TASK...</option>
                                {tasks.map(t => (
                                    <option key={t.id} value={t.id}>{t.data.Task}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Zap className="w-4 h-4 text-amber-500" />
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-[#0A0A0A] flex justify-between items-center">
                    <div className="text-[9px] font-mono text-white/30 uppercase tracking-widest">
                        Buffer Status: Optional
                    </div>
                    <Button
                        onClick={handleSubmit}
                        className="bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest text-xs py-6 px-8 shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-all"
                    >
                        Initialize Entry <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>

            </motion.div>
        </div>
    )
}
