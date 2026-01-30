
'use client'

import { motion } from 'framer-motion'
import { ProjectEntry, ProjectData } from './project-utils'
import { Zap, Activity, Layers, AlertTriangle, Timer } from 'lucide-react'
import { usePomodoro } from '@/components/productivity/pomodoro/pomodoro-context'

interface ProjectForgeProps {
    project: ProjectEntry
    onUpdate: (project: ProjectEntry, updates: Partial<ProjectData>) => void
}

export function ProjectForge({ project, onUpdate }: ProjectForgeProps) {
    const { data } = project
    const { startSession } = usePomodoro()

    const updateField = (field: keyof ProjectData, value: any) => {
        onUpdate(project, { [field]: value })
    }

    const handleQuickStart = () => {
        // Start a 25m session for this project context
        startSession(25, 'WORK')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Zap className="w-3 h-3 text-amber-500" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Forge: Command Override</span>
                </div>
                <button
                    onClick={handleQuickStart}
                    className="flex items-center gap-2 px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded text-[9px] uppercase tracking-widest transition-colors font-bold border border-amber-500/20"
                >
                    <Timer className="w-3 h-3" /> Quick Focus (25m)
                </button>
            </div>

            {/* Status Grid */}
            <div className="space-y-2">
                <label className="text-[9px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Operational State
                </label>
                <div className="grid grid-cols-3 gap-1">
                    {[
                        { id: 'backlog', label: 'Stasis', color: 'border-white/20 text-white/50 hover:bg-white/5' },
                        { id: 'active', label: 'Active', color: 'border-amber-500 text-amber-500 bg-amber-500/10' },
                        { id: 'completed', label: 'Terminated', color: 'border-emerald-500 text-emerald-500 bg-emerald-500/10' }
                    ].map(status => (
                        <button
                            key={status.id}
                            onClick={() => updateField('status', status.id)}
                            className={`
                                py-2 text-[10px] font-bold uppercase tracking-wider border rounded transition-all
                                ${data.status === status.id ? status.color : 'border-white/10 text-white/30 hover:border-white/30'}
                            `}
                        >
                            {status.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Priority & Complexity */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3" /> Priority
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                        {['P0', 'P1', 'P2', 'P3'].map(p => (
                            <button
                                key={p}
                                onClick={() => updateField('priority', p)}
                                className={`
                                    py-1.5 text-[10px] font-mono border rounded transition-all
                                    ${data.priority === p ? 'bg-white/10 border-white text-white' : 'border-white/10 text-white/30 hover:border-white/30'}
                                `}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Complexity
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                        {['S', 'M', 'L'].map(c => (
                            <button
                                key={c}
                                onClick={() => updateField('complexity', c)}
                                className={`
                                    py-1.5 text-[10px] font-mono border rounded transition-all
                                    ${data.complexity === c ? 'bg-white/10 border-white text-white' : 'border-white/10 text-white/30 hover:border-white/30'}
                                `}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
