'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Entry, dataStore, PomodoroSession } from '@/lib/data-store'
import { BrainCircuit, Activity, Layers, AlertTriangle, Timer, Loader2 } from 'lucide-react'
import { usePomodoro } from '@/components/productivity/pomodoro/pomodoro-context'

interface TaskForgeProps {
    task: Entry
    onUpdate: (updates: Partial<Entry['data']>) => void
    onDelete?: () => void
}

export function TaskForge({ task, onUpdate, onDelete }: TaskForgeProps) {
    const { data } = task
    const [localData, setLocalData] = useState(data)

    useEffect(() => {
        setLocalData(data)
    }, [data])

    const { startSession } = usePomodoro()
    const [smartTime, setSmartTime] = useState<number | null>(null)
    const [matchedHabit, setMatchedHabit] = useState<string | null>(null)
    const [isCalculating, setIsCalculating] = useState(true)

    const updateField = (field: string, value: any) => {
        setLocalData(prev => ({ ...prev, [field]: value }))
        onUpdate({ [field]: value })
    }

    useEffect(() => {
        // AI Smart Timing Engine
        const calculateTime = async () => {
            setIsCalculating(true)
            try {
                // 1. Get habits and today's sessions
                const [habits, sessions] = await Promise.all([
                    dataStore.getEntries('atomic-habits', task.userId),
                    dataStore.getPomodoroSessions(task.userId)
                ])

                const todayStr = new Date().toISOString().split('T')[0]
                const todaySessions = sessions.filter(s => s.completedAt.startsWith(todayStr) && s.habitId)

                // 2. Find matching habit based on simple text correlation (can be enhanced with AI)
                const taskString = `${localData.Task || ''} ${localData.Category || ''} ${localData.Area || ''}`.toLowerCase()

                let bestMatch = null
                let maxLen = 0
                for (const habit of habits) {
                    const hName = (habit.data['Habit Name'] || '').toLowerCase()
                    if (hName && taskString.includes(hName) && hName.length > maxLen) {
                        bestMatch = habit
                        maxLen = hName.length
                    }
                }

                let targetDuration = 25 // Default
                let remainingHabitTime = 25

                if (bestMatch) {
                    setMatchedHabit(bestMatch.data['Habit Name'])
                    targetDuration = Number(bestMatch.data.duration) || 25

                    const completedForHabit = todaySessions
                        .filter(s => s.habitId === bestMatch.id)
                        .reduce((sum, s) => sum + s.workDuration, 0)

                    remainingHabitTime = Math.max(0, targetDuration - completedForHabit)
                }

                // 3. Modulate based on task complexity
                let recommendedTime = remainingHabitTime > 0 ? remainingHabitTime : 25

                // If it's a huge task but we only have 5m of habit left, cap it or extend dynamically.
                // Let's do a strict override: if it's L/XL, minimum 25m. If XS/S, maybe less.
                const comp = localData.Complexity || 'M'
                if (comp === 'L' || comp === 'XL') recommendedTime = Math.max(recommendedTime, 25)
                if (comp === 'XS' || comp === 'S') recommendedTime = Math.min(recommendedTime, 25)

                if (recommendedTime === 0) recommendedTime = 25 // Fallback if habit completely done but user wants to work

                setSmartTime(Math.min(recommendedTime, 60)) // Cap single sprint at 60m
            } catch (error) {
                console.error("Smart timing failed to calculate", error)
                setSmartTime(25)
            } finally {
                setIsCalculating(false)
            }
        }

        calculateTime()
    }, [task.id, task.userId, localData.Task, localData.Complexity, localData.Area, localData.Category])

    const handleQuickStart = () => {
        if (smartTime) {
            startSession(smartTime, 'WORK')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold">Forge: Smart Override</span>
                </div>

                <button
                    onClick={handleQuickStart}
                    disabled={isCalculating}
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded text-[10px] uppercase tracking-widest transition-colors font-bold border border-emerald-500/30 disabled:opacity-50"
                >
                    {isCalculating ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Calculating...
                        </>
                    ) : (
                        <>
                            <Timer className="w-3.5 h-3.5" /> Quick Focus ({smartTime}m)
                        </>
                    )}
                </button>
            </div>

            {matchedHabit && !isCalculating && (
                <div className="text-[10px] text-emerald-400/70 uppercase tracking-wider mb-2 font-mono">
                    System aligned with habit: [{matchedHabit}]
                </div>
            )}

            {/* Status Grid */}
            <div className="space-y-2">
                <label className="text-[9px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-3 h-3" /> Operational State
                </label>
                <div className="grid grid-cols-3 gap-1">
                    {[
                        { id: 'Inbox', label: 'Inbox', color: 'border-white/20 text-white/50 hover:bg-white/5' },
                        { id: 'Review', label: 'Review', color: 'border-amber-500 text-amber-500 bg-amber-500/10' },
                        { id: 'Done', label: 'Done', color: 'border-emerald-500 text-emerald-500 bg-emerald-500/10' }
                    ].map(status => (
                        <button
                            key={status.id}
                            onClick={() => updateField('Status', status.id)}
                            className={`
                                py-2 text-[10px] font-bold uppercase tracking-wider border rounded transition-all
                                ${(localData.Status === status.id || (!localData.Status && status.id === 'Inbox')) ? status.color : 'border-white/10 text-white/30 hover:border-white/30'}
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
                    <div className="grid grid-cols-3 gap-1">
                        {['High', 'Medium', 'Low'].map(p => (
                            <button
                                key={p}
                                onClick={() => updateField('Priority', p)}
                                className={`
                                    py-1.5 text-[10px] font-mono border rounded transition-all
                                    ${localData.Priority === p ? 'bg-white/10 border-white text-white' : 'border-white/10 text-white/30 hover:border-white/30'}
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
                                onClick={() => updateField('Complexity', c)}
                                className={`
                                    py-1.5 text-[10px] font-mono border rounded transition-all
                                    ${(localData.Complexity === c || (!localData.Complexity && c === 'M')) ? 'bg-white/10 border-white text-white' : 'border-white/10 text-white/30 hover:border-white/30'}
                                `}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Data Management */}
            {(localData.Status === 'Done' || onDelete) && (
                <div className="pt-4 mt-6 border-t border-white/5 space-y-2">
                    <label className="text-[9px] text-white/30 uppercase tracking-widest flex items-center gap-2">
                        <Activity className="w-3 h-3" /> Data Management
                    </label>
                    <div className="flex gap-2">
                        {localData.Status === 'Done' && !localData.archived && (
                            <button
                                onClick={() => updateField('archived', true)}
                                className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border border-white/10 text-white/50 hover:bg-white/5 hover:text-white rounded transition-all"
                            >
                                Archive Task
                            </button>
                        )}
                        {localData.archived && (
                            <button
                                onClick={() => updateField('archived', false)}
                                className="flex-1 py-2 text-[10px] font-bold uppercase tracking-wider border border-white/10 text-white/50 hover:bg-white/5 hover:text-white rounded transition-all"
                            >
                                Unarchive
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={onDelete}
                                className="flex items-center justify-center px-4 py-2 border border-rose-500/20 text-rose-500 hover:bg-rose-500/10 rounded transition-all"
                                title="Permanently Delete Task"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
