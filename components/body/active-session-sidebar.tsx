'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Dumbbell, Wind, BedDouble, Calendar, Activity, X, Check, Timer } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ExerciseRow, ExerciseLog, DayPlan } from './today-session-card'

interface ActiveSessionSidebarProps {
    isOpen: boolean
    onClose: () => void
    dayPlan: DayPlan | null
    userId: string
    goalLabel: string
}

export function ActiveSessionSidebar({ isOpen, onClose, dayPlan, userId, goalLabel }: ActiveSessionSidebarProps) {
    const supabase = createClient()
    const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([])
    const [loading, setLoading] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [isSessionActive, setIsSessionActive] = useState(false)

    const loadLogs = useCallback(async () => {
        if (!isOpen || !userId || !dayPlan) return
        setLoading(true)
        const { data } = await supabase
            .from('exercise_log')
            .select('*')
            .eq('user_id', userId)

        setExerciseLogs((data as ExerciseLog[]) ?? [])
        setLoading(false)
    }, [isOpen, userId, dayPlan, supabase, refreshKey])

    useEffect(() => { loadLogs() }, [loadLogs])

    const handleLogged = () => setRefreshKey(k => k + 1)

    // Wait for dayPlan before trying to render properties
    if (!dayPlan) return null

    const logMap = new Map(exerciseLogs.map(l => [l.exercise_name, l]))
    const exercises = dayPlan.exercises ?? []

    const typeStyle = {
        training: { icon: <Dumbbell className="w-5 h-5" />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' },
        recovery: { icon: <Wind className="w-5 h-5" />, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' },
        rest: { icon: <BedDouble className="w-5 h-5" />, color: 'text-white/40', bg: 'bg-white/5 border-white/10' },
    }[dayPlan.type || 'rest']

    // Today string for progress calculation
    const todayStr = (() => {
        const d = new Date()
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    })()

    const completedToday = exercises.filter(ex => {
        const log = logMap.get(ex.name.toLowerCase().trim())
        if (!log || !log.last_logged_at) return false
        return log.last_logged_at.split('T')[0] === todayStr
    }).length

    const progressPct = exercises.length > 0 ? completedToday / exercises.length : 0

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent side="right" className="w-[450px] sm:max-w-md p-0 bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/10 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                <SheetHeader className="p-6 pb-0 space-y-0 text-left">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${typeStyle.bg} ${typeStyle.color}`}>
                            {typeStyle.icon}
                        </div>
                    </div>
                    <SheetTitle className="text-2xl font-bold text-white mb-1">
                        {dayPlan.day}
                    </SheetTitle>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-white/50 mb-4">
                        <span className="px-2 py-0.5 rounded-full border border-white/10 bg-white/5">{dayPlan.type}</span>
                        <span>·</span>
                        <span>{goalLabel}</span>
                    </div>
                    <p className="text-lg text-white/90">{dayPlan.focus}</p>
                </SheetHeader>

                <div className="p-6 space-y-6">
                    {dayPlan.type === 'training' && exercises.length > 0 && (
                        <div className="space-y-6">
                            {/* Linear Progress Display */}
                            <div className="space-y-2">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] uppercase tracking-[0.1em] text-white/40">Session Completion</span>
                                    <span className="text-[10px] font-mono text-white/30">{Math.round(progressPct * 100)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className={`h-full rounded-full ${progressPct === 1 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progressPct * 100}%` }}
                                        transition={{ duration: 1 }}
                                    />
                                </div>
                            </div>

                            {/* Session Timer / State Controller */}
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <span className="text-white text-sm font-semibold">{isSessionActive ? 'Session Active' : 'Start Session'}</span>
                                    <p className="text-[10px] text-white/40">{isSessionActive ? 'Auto-expand exercises and manage rest.' : 'Log in real-time as you go.'}</p>
                                </div>
                                <button
                                    onClick={() => setIsSessionActive(!isSessionActive)}
                                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition ${isSessionActive ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'}`}
                                >
                                    {isSessionActive ? 'End' : 'Start'}
                                </button>
                            </div>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-center gap-3">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                                        {exercises.length} Exercises · tap to log
                                    </p>
                                    <div className="h-px flex-1 bg-white/8" />
                                </div>
                                {loading && (
                                    <div className="text-center py-4">
                                        <Activity className="w-4 h-4 text-white/20 animate-pulse mx-auto" />
                                    </div>
                                )}
                                {!loading && exercises.map((ex, i) => (
                                    <ExerciseRow
                                        key={ex.name + i}
                                        exercise={ex}
                                        log={logMap.get(ex.name.toLowerCase().trim())}
                                        userId={userId}
                                        isActive={isSessionActive}
                                        onLogged={handleLogged}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {dayPlan.type === 'recovery' && (
                        <div className="space-y-4 pt-4">
                            <p className="text-[10px] uppercase tracking-widest text-sky-400/50 mb-2">Recovery Directives</p>
                            <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-5 text-sky-100/90 leading-relaxed text-sm">
                                {dayPlan.recovery_notes}
                            </div>
                            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                                <p className="text-xs text-white/50">Your goal on a recovery day is simple: feed your body, increase blood flow passively, and reduce mental load. Ensure you've hit your protein targets and hydrated appropriately.</p>
                            </div>
                        </div>
                    )}

                    {dayPlan.type === 'rest' && (
                        <div className="space-y-4 pt-4">
                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-8 text-center">
                                <BedDouble className="w-8 h-8 text-white/20 mx-auto mb-4" />
                                <h4 className="text-lg text-white font-medium mb-2">Absolute Rest</h4>
                                <p className="text-sm text-white/40">Growth happens outside of the gym. Embrace the down time. Refuel, repair, and detach from the program today.</p>
                            </div>
                        </div>
                    )}
                    
                    {dayPlan.coaching_note && (
                        <div className="mt-8 pt-6 border-t border-white/10">
                            <h5 className="text-[10px] uppercase tracking-widest text-emerald-400/50 mb-3">Coach's Note</h5>
                            <p className="text-sm text-white/70 italic">"{dayPlan.coaching_note}"</p>
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
