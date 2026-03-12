'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import {
    Dumbbell, Wind, BedDouble, ChevronDown, ChevronUp,
    Save, Trophy, Check, RotateCcw, Timer
} from 'lucide-react'

/* ──────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */
export interface Exercise {
    name: string
    sets: string
    reps: string
    notes: string
}

export interface DayPlan {
    day_index: number
    day: string
    type: 'training' | 'recovery' | 'rest'
    focus: string
    duration_min: number
    exercises: Exercise[]
    recovery_notes: string
    coaching_note: string
}

export interface ExerciseLog {
    exercise_name: string
    plan_sets: string
    plan_reps: string
    last_sets_done: number
    last_reps_done: number
    last_weight_kg: number
    pr_weight_kg: number
    total_sessions: number
    notes: string
    last_logged_at: string
}

interface Props {
    userId: string
}

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────── */

/** Maps JS getDay() (0=Sun) → day_index (0=Mon, 6=Sun) */
function todayDayIndex(): number {
    const js = new Date().getDay()
    return js === 0 ? 6 : js - 1
}

/* ──────────────────────────────────────────────────────────────
   ExerciseRow — inline logging with upsert
   ────────────────────────────────────────────────────────── */
export function ExerciseRow({
    exercise,
    log,
    userId,
    isActive,
    onLogged,
}: {
    exercise: Exercise
    log: ExerciseLog | undefined
    userId: string
    isActive: boolean
    onLogged: () => void
}) {
    const supabase = createClient()
    const [open, setOpen] = useState(false)
    const [sets, setSets] = useState(log?.last_sets_done?.toString() || exercise.sets)
    const [reps, setReps] = useState(log?.last_reps_done?.toString() || exercise.reps)
    const [weight, setWeight] = useState(log?.last_weight_kg?.toString() || '0')
    const [notes, setNotes] = useState('')
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    // Rest Timer State
    const [restSeconds, setRestSeconds] = useState(0)

    useEffect(() => {
        if (restSeconds > 0) {
            const timer = setInterval(() => setRestSeconds(r => r - 1), 1000)
            return () => clearInterval(timer)
        }
    }, [restSeconds])

    const startRest = (secs: number) => {
        setRestSeconds(secs)
    }

    const currentPR = log?.pr_weight_kg ?? 0
    const newPR = parseFloat(weight) > currentPR && parseFloat(weight) > 0

    const handleSave = async () => {
        setSaving(true)
        const setsNum = parseInt(sets) || 0
        const repsNum = parseInt(reps) || 0
        const weightNum = parseFloat(weight) || 0

        // ── UPSERT: the key insight — one row per exercise, not one per session ──
        await supabase.from('exercise_log').upsert(
            {
                user_id: userId,
                exercise_name: exercise.name.toLowerCase().trim(), // normalized key
                plan_sets: exercise.sets,
                plan_reps: exercise.reps,
                last_sets_done: setsNum,
                last_reps_done: repsNum,
                last_weight_kg: weightNum,
                pr_weight_kg: Math.max(weightNum, currentPR),
                total_sessions: (log?.total_sessions ?? 0) + 1,
                notes: notes || log?.notes || '',
                last_logged_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,exercise_name' }  // never creates duplicates
        )

        setSaving(false)
        setSaved(true)
        if (!isActive) setOpen(false) // Only collapse automatically if not in an active session
        onLogged() // re-fetch to update last performance display
        setTimeout(() => setSaved(false), 4000)
    }

    const formatTime = (secs: number) => {
        const m = Math.floor(secs / 60)
        const s = secs % 60
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            {/* Header row — clickable to expand */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/5 transition"
            >
                {/* Left: name + prescribed */}
                <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium text-sm">{exercise.name}</span>

                        {/* Logged badge */}
                        {saved && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[9px] border border-emerald-500/25">
                                <Check className="w-2.5 h-2.5" /> Logged
                            </span>
                        )}
                        {/* PR badge */}
                        {newPR && open && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-yellow-500/12 text-yellow-400 text-[9px] border border-yellow-500/20">
                                <Trophy className="w-2.5 h-2.5" /> New PR
                            </span>
                        )}
                    </div>

                    {/* Plan + last performance */}
                    <p className="text-white/40 text-xs">
                        <span className="text-white/55">{exercise.sets} × {exercise.reps}</span>
                        {exercise.notes && <span className="ml-2 text-white/25">{exercise.notes}</span>}
                        {log && (
                            <span className="ml-3 text-white/30">
                                · Last: {log.last_sets_done}×{log.last_reps_done}
                                {log.last_weight_kg > 0 && ` @ ${log.last_weight_kg} kg`}
                                {log.pr_weight_kg > 0 && ` · PR: ${log.pr_weight_kg} kg`}
                                {' · '}{log.total_sessions} session{log.total_sessions !== 1 ? 's' : ''}
                            </span>
                        )}
                        {!log && <span className="ml-3 text-white/20">· Never logged</span>}
                    </p>
                </div>

                {/* Chevron */}
                <div className="text-white/25 shrink-0">
                    {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </button>

            {/* Inline logging form */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-white/8"
                    >
                        <div className="px-4 pb-4 pt-3 space-y-3">
                            {/* Sets / Reps / Weight */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Sets', value: sets, onChange: setSets },
                                    { label: 'Reps', value: reps, onChange: setReps },
                                    { label: 'Weight kg', value: weight, onChange: setWeight },
                                ].map(({ label, value, onChange }) => (
                                    <div key={label}>
                                        <label className="text-[9px] uppercase tracking-[0.12em] text-white/35 block mb-1">{label}</label>
                                        <input
                                            type="number"
                                            value={value}
                                            min={0}
                                            onChange={e => onChange(e.target.value)}
                                            className="w-full bg-white/5 border border-white/12 rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none focus:border-white/35"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Notes */}
                            <input
                                type="text"
                                placeholder="Notes (optional — form cues, adjustments…)"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full bg-white/5 border border-white/12 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                            />

                            {/* New PR callout */}
                            {newPR && (
                                <div className="flex items-center gap-1.5 text-xs text-yellow-400/80">
                                    <Trophy className="w-3.5 h-3.5" />
                                    <span>New personal record — previous best {currentPR} kg</span>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition disabled:opacity-40 shadow-md ${isActive ? 'bg-orange-500 hover:bg-orange-400 text-white' : 'bg-white text-black hover:bg-white/90'
                                        }`}
                                >
                                    {saving
                                        ? <RotateCcw className="w-4 h-4 animate-spin" />
                                        : <Check className="w-4 h-4" />}
                                    {saving ? 'Saving…' : (isActive ? 'Log Set' : 'Log Session')}
                                </button>

                                {isActive && (
                                    <>
                                        <button
                                            onClick={() => { handleSave(); startRest(60); }}
                                            disabled={saving}
                                            className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white transition flex items-center gap-1"
                                        >
                                            <Timer className="w-3.5 h-3.5" /> 60s
                                        </button>
                                        <button
                                            onClick={() => { handleSave(); startRest(90); }}
                                            disabled={saving}
                                            className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-medium text-white transition flex items-center gap-1"
                                        >
                                            <Timer className="w-3.5 h-3.5" /> 90s
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Active Rest Timer overlay element inline */}
                            <AnimatePresence>
                                {restSeconds > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="mt-3 p-4 rounded-xl border border-sky-500/30 bg-sky-500/10 flex flex-col items-center justify-center space-y-2">
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-sky-200/60">Resting</p>
                                            <div className="text-4xl font-mono font-bold text-sky-400">
                                                {formatTime(restSeconds)}
                                            </div>
                                            <button
                                                onClick={() => setRestSeconds(0)}
                                                className="text-[10px] text-sky-300/50 hover:text-sky-300 transition underline underline-offset-2"
                                            >
                                                Skip rest
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ──────────────────────────────────────────────────────────────
   Main: TodaySessionCard
   ────────────────────────────────────────────────────────── */
export function TodaySessionCard({ userId }: Props) {
    const supabase = createClient()
    const [todayPlan, setTodayPlan] = useState<DayPlan | null>(null)
    const [goalLabel, setGoalLabel] = useState('')
    const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const [isSessionActive, setIsSessionActive] = useState(false)

    // Compute "today"
    const todayStr = useMemo(() => {
        if (typeof window === 'undefined') return ''
        const d = new Date()
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }, [refreshKey])

    const load = useCallback(async () => {
        const [{ data: identity }, { data: logs }] = await Promise.all([
            supabase.from('body_identity').select('week_plan, goal_label').eq('user_id', userId).maybeSingle(),
            supabase.from('exercise_log').select('*').eq('user_id', userId),
        ])

        if (identity?.week_plan) {
            const dayIdx = todayDayIndex()
            const day = (identity.week_plan as DayPlan[]).find(d => d.day_index === dayIdx)
            setTodayPlan(day ?? null)
            setGoalLabel(identity.goal_label ?? '')
        }

        setExerciseLogs((logs as ExerciseLog[]) ?? [])
        setLoading(false)
    }, [userId, refreshKey])  // eslint-disable-line

    useEffect(() => { load() }, [load])

    const handleLogged = () => setRefreshKey(k => k + 1)

    if (loading || !todayPlan) return null

    const logMap = new Map(exerciseLogs.map(l => [l.exercise_name, l]))

    const typeKey = (todayPlan.type?.toLowerCase() || 'rest') as 'training' | 'recovery' | 'rest';
    const typeStyle = {
        training: { icon: <Dumbbell className="w-4 h-4" />, color: 'text-orange-300', border: 'border-orange-500/20', badge: 'border-orange-500/20 bg-orange-500/8 text-orange-300' },
        recovery: { icon: <Wind className="w-4 h-4" />, color: 'text-sky-300', border: 'border-sky-500/20', badge: 'border-sky-500/20 bg-sky-500/8 text-sky-300' },
        rest: { icon: <BedDouble className="w-4 h-4" />, color: 'text-white/40', border: 'border-white/10', badge: 'border-white/10 bg-white/5 text-white/40' },
    }[typeKey] || { icon: <BedDouble className="w-4 h-4" />, color: 'text-white/40', border: 'border-white/10', badge: 'border-white/10 bg-white/5 text-white/40' };

    const exercises = todayPlan.exercises ?? []

    // Formula for progress
    const completedToday = exercises.filter(ex => {
        const log = logMap.get(ex.name.toLowerCase().trim())
        if (!log || !log.last_logged_at) return false
        return log.last_logged_at.startsWith(todayStr)
    }).length

    const progressPct = exercises.length > 0 ? completedToday / exercises.length : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`rounded-2xl border ${typeStyle.border} bg-white/[0.03] p-5 space-y-5`}
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1 mt-1">
                    <div className="flex items-center gap-2">
                        <span className={typeStyle.color}>{typeStyle.icon}</span>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Today's Session</span>
                        <span className="text-[10px] text-white/20">·</span>
                        <span className="text-[10px] text-white/30">{todayPlan.duration_min} min</span>
                    </div>
                    <h3 className="text-white font-semibold text-lg">{todayPlan.focus}</h3>
                    <p className="text-[10px] text-white/30">{todayPlan.day} · {goalLabel}</p>
                </div>
                {/* Visual Ring for Session Progress */}
                {todayPlan.type === 'training' && exercises.length > 0 && (
                    <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                        <svg className="w-full h-full -rotate-90">
                            <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                            <motion.circle
                                cx="24" cy="24" r="20"
                                fill="none"
                                stroke="#f97316"
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 20}
                                initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                animate={{ strokeDashoffset: 2 * Math.PI * 20 * (1 - progressPct) }}
                                transition={{ duration: 1, ease: 'easeOut' }}
                                className={progressPct === 1 ? 'stroke-emerald-500' : 'stroke-orange-500'}
                            />
                        </svg>
                        <span className="absolute text-[10px] font-bold font-mono text-white">
                            {completedToday}/{exercises.length}
                        </span>
                    </div>
                )}
                {todayPlan.type !== 'training' && (
                    <span className={`px-2.5 py-1 rounded-full border text-[10px] font-medium ${typeStyle.badge}`}>
                        {todayPlan.type}
                    </span>
                )}
            </div>

            {/* Exercises list — training days */}
            {exercises.length > 0 && (
                <div className="space-y-3">
                    {/* Linear Comparison Formula Diagram */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] uppercase tracking-[0.1em] text-white/40">Session Completion</span>
                            <span className="text-[10px] font-mono text-white/30">{Math.round(progressPct * 100)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${progressPct === 1 ? 'bg-emerald-500' : 'bg-orange-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPct * 100}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>

                    <div className="space-y-2 pt-2">
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] uppercase tracking-[0.15em] text-white/35">
                                {exercises.length} Exercise{exercises.length !== 1 ? 's' : ''} · tap to log
                            </p>
                            <div className="h-px flex-1 bg-white/8" />
                        </div>
                        {exercises.map((ex, i) => (
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

                    {!isSessionActive && progressPct < 1 && (
                        <div className="pt-2 pb-1">
                            <button
                                onClick={() => setIsSessionActive(true)}
                                className="w-full py-3 rounded-xl bg-white/5 text-white font-semibold text-xs tracking-wide uppercase hover:bg-white border border-white/10 hover:text-black transition shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                            >
                                Start Exercise Session
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Non-training empty state / Recovery emphasis */}
            {(todayPlan.type === 'recovery' || todayPlan.type === 'rest') && exercises.length === 0 && (
                <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <Wind className="w-8 h-8 text-sky-400" />
                    </div>
                    <div>
                        <h4 className="text-white font-medium mb-1">Active Recovery Day</h4>
                        <p className="text-xs text-white/40 max-w-[200px] mx-auto">
                            No heavy lifting scheduled. Focus on mobility, breathing, or light cardio.
                        </p>
                    </div>
                    {todayPlan.recovery_notes && (
                        <div className="inline-flex items-start gap-2.5 bg-sky-500/5 border border-sky-500/15 rounded-xl px-4 py-3 mt-2 text-left">
                            <Wind className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-sky-300/80 leading-relaxed font-medium">{todayPlan.recovery_notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Even on training days, show recovery work below exercises */}
            {todayPlan.type === 'training' && todayPlan.recovery_notes && (
                <div className="flex items-start gap-2 text-xs text-white/30 pt-1">
                    <Wind className="w-3.5 h-3.5 text-sky-500/50 shrink-0 mt-0.5" />
                    <span>{todayPlan.recovery_notes}</span>
                </div>
            )}

            {/* Coaching note */}
            {todayPlan.coaching_note && (
                <p className="text-xs text-white/25 italic border-l-2 border-white/10 pl-3 leading-relaxed">
                    "{todayPlan.coaching_note}"
                </p>
            )}
        </motion.div>
    )
}
