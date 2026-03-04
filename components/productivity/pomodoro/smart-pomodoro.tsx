'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Play, Clock, ExternalLink, CheckSquare } from 'lucide-react'
import { dataStore } from '@/lib/data-store'
import { usePomodoro } from '@/components/productivity/pomodoro/pomodoro-context'

interface SubTask {
    title: string
    completed: boolean
}

interface TaskOption {
    id: string
    title: string
    deadline: string | null
    subtasks: SubTask[]
    projectName?: string
}

interface ScheduledSession {
    subtaskTitle: string
    durationMinutes: number
    sessionIndex: number
}

const MIN_SESSION_MINUTES = 25

function formatDeadline(dateStr: string | null): string {
    if (!dateStr) return ''
    try {
        const d = new Date(dateStr)
        const today = new Date()
        const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
        if (diff < 0) return `${Math.abs(diff)}d overdue`
        if (diff === 0) return 'Due today'
        if (diff === 1) return 'Due tomorrow'
        return `Due in ${diff}d`
    } catch {
        return dateStr
    }
}

function deadlineUrgency(dateStr: string | null): 'overdue' | 'urgent' | 'soon' | 'ok' {
    if (!dateStr) return 'ok'
    try {
        const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        if (diff < 0) return 'overdue'
        if (diff === 0) return 'overdue'
        if (diff <= 2) return 'urgent'
        if (diff <= 7) return 'soon'
        return 'ok'
    } catch { return 'ok' }
}

function buildSchedule(subtasks: SubTask[], totalMinutes: number): ScheduledSession[] {
    const pending = subtasks.filter(s => !s.completed)
    if (pending.length === 0) return []
    const rawPerSession = Math.floor(totalMinutes / pending.length)
    const sessionTime = Math.max(rawPerSession, MIN_SESSION_MINUTES)
    return pending.map((s, i) => ({
        subtaskTitle: s.title,
        durationMinutes: sessionTime,
        sessionIndex: i + 1,
    }))
}

interface SmartPomodoroProps {
    userId: string
}

export function SmartPomodoro({ userId }: SmartPomodoroProps) {
    const [tasks, setTasks] = useState<TaskOption[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
    const [totalHours, setTotalHours] = useState(2)
    const [queue, setQueue] = useState<ScheduledSession[]>([])
    const [queueIndex, setQueueIndex] = useState(0)
    const [queueActive, setQueueActive] = useState(false)

    const { startSession, isActive } = usePomodoro()

    useEffect(() => {
        async function loadTasks() {
            setLoading(true)
            try {
                const allTasks = await dataStore.getEntries('tasks-sb', userId)
                const now = new Date()
                const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

                const nearDeadline = allTasks
                    .filter(t => {
                        const deadline = t.data['End Date'] || t.data['Deadline'] || t.data['Due Date']
                        if (!deadline) return false
                        try {
                            const d = new Date(deadline)
                            // only upcoming: must be today or in the future, and within 7 days
                            return d >= now && d <= weekFromNow
                        } catch { return false }
                    })
                    .sort((a, b) => {
                        const da = new Date(a.data['End Date'] || a.data['Deadline'] || a.data['Due Date']).getTime()
                        const db = new Date(b.data['End Date'] || b.data['Deadline'] || b.data['Due Date']).getTime()
                        return da - db
                    })
                    .map(t => {
                        let subtasks: SubTask[] = []
                        try {
                            const raw = t.data['Subtasks']
                            if (Array.isArray(raw)) subtasks = raw
                            else if (typeof raw === 'string') subtasks = JSON.parse(raw)
                        } catch { /* ignore */ }

                        return {
                            id: t.id,
                            title: t.data['Title'] || t.data['Task Name'] || 'Untitled Task',
                            deadline: t.data['End Date'] || t.data['Deadline'] || t.data['Due Date'] || null,
                            subtasks,
                            projectName: t.data['Project Id'] || undefined,
                        }
                    })

                setTasks(nearDeadline)
            } catch (e) {
                console.warn('SmartPomodoro: failed to load tasks', e)
            }
            setLoading(false)
        }
        if (userId && userId !== 'defaultUser') loadTasks()
    }, [userId])

    const selectedTask = tasks.find(t => t.id === selectedTaskId)
    const pendingSubtasks = selectedTask?.subtasks.filter(s => !s.completed) || []
    const hasNoSubtasks = selectedTask && selectedTask.subtasks.length === 0
    const totalMinutes = Math.round(totalHours * 60)
    const previewQueue = selectedTask ? buildSchedule(selectedTask.subtasks, totalMinutes) : []

    const handleLaunchQueue = () => {
        if (!selectedTask || previewQueue.length === 0) return
        setQueue(previewQueue)
        setQueueIndex(0)
        setQueueActive(true)
        startSession(previewQueue[0].durationMinutes, 'WORK')
    }

    const handleNextSession = () => {
        const next = queueIndex + 1
        if (next < queue.length) {
            setQueueIndex(next)
            startSession(queue[next].durationMinutes, 'WORK')
        } else {
            setQueueActive(false)
            setQueue([])
        }
    }

    if (loading) {
        return (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-6 animate-pulse h-40" />
        )
    }

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
            <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm uppercase tracking-widest font-bold text-white/60">Smart Schedule</h3>
            </div>

            {/* Active queue display */}
            {queueActive && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                    <div className="text-xs uppercase tracking-widest text-amber-400 font-bold">Queue Active</div>
                    <div className="font-bold text-white">{queue[queueIndex]?.subtaskTitle}</div>
                    <div className="text-xs text-white/40">Session {queueIndex + 1} of {queue.length} · {queue[queueIndex]?.durationMinutes} min</div>
                    {!isActive && queueIndex + 1 < queue.length && (
                        <button
                            onClick={handleNextSession}
                            className="w-full py-2 bg-amber-500 text-black rounded-xl font-bold text-sm hover:bg-amber-400 transition-colors flex items-center justify-center gap-2"
                        >
                            <Play className="w-4 h-4" /> Next: {queue[queueIndex + 1]?.subtaskTitle}
                        </button>
                    )}
                    {!isActive && queueIndex + 1 >= queue.length && (
                        <div className="text-center text-emerald-400 text-sm font-bold">🎉 All sessions complete!</div>
                    )}
                </div>
            )}

            {/* Task selector */}
            <div className="space-y-2">
                <label className="text-xs text-white/40 uppercase tracking-widest">Upcoming tasks — due within 7 days</label>

                {tasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                        <div className="text-3xl">✅</div>
                        <p className="text-white/50 text-sm font-medium">No upcoming deadlines</p>
                        <p className="text-white/25 text-xs max-w-[220px] leading-relaxed">Tasks due in the next 7 days will appear here so you can plan your sprint.</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                        {tasks.map(task => {
                            const urgency = deadlineUrgency(task.deadline)
                            const urgencyColors = {
                                overdue: 'border-red-500/30 bg-red-500/5',
                                urgent: 'border-orange-500/30 bg-orange-500/5',
                                soon: 'border-amber-500/20 bg-amber-500/5',
                                ok: 'border-white/10 bg-white/5',
                            }
                            const hasSub = task.subtasks.length > 0
                            return (
                                <button
                                    key={task.id}
                                    onClick={() => setSelectedTaskId(task.id === selectedTaskId ? null : task.id)}
                                    className={`w-full text-left p-3 rounded-xl border transition-all ${selectedTaskId === task.id ? 'border-white/40 bg-white/10' : urgencyColors[urgency]} hover:border-white/20`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium text-white text-sm truncate">{task.title}</div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] uppercase tracking-wider font-bold ${urgency === 'overdue' ? 'text-red-400' : urgency === 'urgent' ? 'text-orange-400' : urgency === 'soon' ? 'text-amber-400' : 'text-white/30'}`}>
                                                    {formatDeadline(task.deadline)}
                                                </span>
                                                {hasSub ? (
                                                    <span className="text-[10px] text-white/30">· {task.subtasks.filter(s => !s.completed).length}/{task.subtasks.length} pending</span>
                                                ) : (
                                                    <span className="text-[10px] text-rose-400">· No subtasks</span>
                                                )}
                                            </div>
                                        </div>
                                        <CheckSquare className={`w-4 h-4 flex-shrink-0 mt-0.5 ${selectedTaskId === task.id ? 'text-white' : 'text-white/20'}`} />
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>


            {/* Task detail / action area */}
            <AnimatePresence mode="wait">
                {selectedTask && (
                    <motion.div
                        key={selectedTask.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="space-y-4"
                    >
                        {/* No subtasks warning */}
                        {hasNoSubtasks ? (
                            <div className="flex gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
                                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="font-bold text-rose-400 text-sm mb-1">No subtasks found</div>
                                    <p className="text-white/50 text-xs leading-relaxed">
                                        This task has no subtasks, so we can't calculate a smart schedule. Open the task in Second Brain, add subtasks, then come back here.
                                    </p>
                                    <a
                                        href={`/systems/second-brain/tasks-sb?task=${selectedTask.id}`}
                                        className="inline-flex items-center gap-1 mt-2 text-xs text-rose-400 hover:text-rose-300 transition-colors"
                                    >
                                        Open task in Second Brain <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </div>
                        ) : pendingSubtasks.length === 0 ? (
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold text-center">
                                ✅ All subtasks complete for this task!
                            </div>
                        ) : (
                            <>
                                {/* Total hours input */}
                                <div className="flex items-center gap-4">
                                    <label className="text-xs text-white/40 uppercase tracking-widest whitespace-nowrap">Available time</label>
                                    <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
                                        <input
                                            type="number"
                                            min={0.5}
                                            max={12}
                                            step={0.5}
                                            value={totalHours}
                                            onChange={e => setTotalHours(parseFloat(e.target.value) || 1)}
                                            className="bg-transparent text-white font-mono font-bold w-12 outline-none text-center"
                                        />
                                        <span className="text-white/40 text-sm">hours</span>
                                    </div>
                                </div>

                                {/* Preview queue */}
                                <div className="space-y-2">
                                    <div className="text-xs uppercase tracking-widest text-white/30 font-bold">Session Queue</div>
                                    {previewQueue.map((session, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                                            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</div>
                                            <div className="flex-1 text-sm text-white truncate">{session.subtaskTitle}</div>
                                            <div className="text-xs text-white/40 font-mono">{session.durationMinutes}m</div>
                                        </div>
                                    ))}
                                    {previewQueue.length === 0 && (
                                        <div className="text-xs text-white/30 italic text-center py-2">Increase available time (min {MIN_SESSION_MINUTES} min per session)</div>
                                    )}
                                </div>

                                {/* Launch */}
                                {previewQueue.length > 0 && (
                                    <button
                                        onClick={handleLaunchQueue}
                                        disabled={isActive}
                                        className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold text-sm rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-4 h-4" />
                                        Launch {previewQueue.length}-Session Sprint
                                    </button>
                                )}
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
