'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import {
    Loader2, Check, ChevronRight, ChevronLeft, Dumbbell,
    Wind, BedDouble, Flame, Apple, Scale, Ruler, Zap,
} from 'lucide-react'

/* ──────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */
interface Exercise { name: string; sets: string; reps: string; notes: string }
interface DayPlan {
    day_index: number
    day: string
    type: 'training' | 'recovery' | 'rest'
    focus: string
    duration_min: number
    exercises: Exercise[]
    recovery_notes: string
    coaching_note: string
}
interface GeneratedPlan {
    goal_label: string
    goal_key: string
    staple_list: Array<{ name: string; category: string; priority: string }>
    week_plan: DayPlan[]
}

interface Props {
    userId: string
    onComplete: () => void
}

type Step = 'goal' | 'metrics' | 'generating' | 'preview' | 'done'

/* ──────────────────────────────────────────────────────────────
   Example goal chips (clickable to pre-fill)
   ────────────────────────────────────────────────────────── */
const EXAMPLE_GOALS = [
    'I want to dunk a basketball',
    'Lose 20 kg for summer',
    'Build strength and muscle mass',
    'Train for my first marathon',
    'Improve speed and agility for soccer',
    'Get lean and athletic like a tennis player',
]

/* ──────────────────────────────────────────────────────────────
   Day type icons + colors
   ────────────────────────────────────────────────────────── */
const DAY_STYLE: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
    training: {
        icon: <Dumbbell className="w-4 h-4" />,
        color: 'text-orange-300',
        bg: 'border-orange-500/30 bg-orange-500/8',
    },
    recovery: {
        icon: <Wind className="w-4 h-4" />,
        color: 'text-sky-300',
        bg: 'border-sky-500/30 bg-sky-500/8',
    },
    rest: {
        icon: <BedDouble className="w-4 h-4" />,
        color: 'text-white/40',
        bg: 'border-white/12 bg-white/[0.02]',
    },
}

/* ──────────────────────────────────────────────────────────────
   Metric input
   ────────────────────────────────────────────────────────── */
function MetricInput({
    label, sub, value, onChange, unit, min = 0, optional = false,
}: {
    label: string; sub?: string; value: string; onChange: (v: string) => void; unit: string; min?: number; optional?: boolean
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.15em] text-white/50">
                {label}
                {optional && <span className="ml-1 text-white/25">(optional)</span>}
            </label>
            {sub && <p className="text-[10px] text-white/30">{sub}</p>}
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    value={value}
                    min={min}
                    onChange={e => onChange(e.target.value)}
                    className="w-24 bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-white/40 text-center"
                />
                <span className="text-xs text-white/40">{unit}</span>
            </div>
        </div>
    )
}

/* ──────────────────────────────────────────────────────────────
   Week Plan day card
   ────────────────────────────────────────────────────────── */
function DayCard({ day, isSelected, onClick }: { day: DayPlan; isSelected: boolean; onClick: () => void }) {
    const style = DAY_STYLE[day.type]
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition text-left min-w-[90px]
                ${isSelected ? `ring-2 ring-white/30 ${style.bg}` : `${style.bg} hover:brightness-125`}`}
        >
            <div className={`${style.color}`}>{style.icon}</div>
            <span className="text-[10px] uppercase tracking-[0.1em] text-white/60">{day.day.slice(0, 3)}</span>
            <span className={`text-[9px] font-medium text-center ${style.color}`}>{day.type}</span>
            <span className="text-[8px] text-white/40 text-center leading-tight">{day.focus}</span>
        </button>
    )
}

/* ──────────────────────────────────────────────────────────────
   Main component
   ────────────────────────────────────────────────────────── */
export function IdentitySetupSheet({ userId, onComplete }: Props) {
    const supabase = createClient()
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const [step, setStep] = useState<Step>('goal')
    const [goalText, setGoalText] = useState('')
    const [metrics, setMetrics] = useState({
        current_weight_kg: '',
        target_weight_kg: '',
        height_cm: '',
        squat_1rm_kg: '',
        press_1rm_kg: '',
        weightUnit: 'kg' as 'kg' | 'lbs',
    })
    const [plan, setPlan] = useState<GeneratedPlan | null>(null)
    const [selectedDay, setSelectedDay] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    /* Convert lbs to kg if needed */
    const toKg = (value: string, unit: 'kg' | 'lbs') =>
        value ? (unit === 'lbs' ? parseFloat(value) / 2.205 : parseFloat(value)) : undefined

    /* ── Step 1: validate goal text */
    const handleGoalNext = () => {
        if (!goalText.trim()) return
        if (goalText.trim().length < 10) {
            setError('Tell us a bit more — what exactly do you want to achieve?')
            return
        }
        setError(null)
        setStep('metrics')
    }

    /* ── Step 2 → generate plan */
    const handleGenerate = async () => {
        setStep('generating')
        setError(null)
        setSaving(false)

        try {
            const current = toKg(metrics.current_weight_kg, metrics.weightUnit)
            const res = await fetch('/api/ai/body-identity', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goal_text: goalText.trim(),
                    current_weight_kg: current,
                    height_cm: metrics.height_cm ? parseFloat(metrics.height_cm) : undefined,
                }),
            })
            const json = await res.json()
            if (!res.ok) throw new Error(json.error)
            setPlan(json as GeneratedPlan)
            setStep('preview')
        } catch (err: any) {
            setError(err.message || 'Generation failed. Please try again.')
            setStep('metrics')
        }
    }

    /* ── Step 4: save everything */
    const handleActivate = async () => {
        if (!plan) return
        setSaving(true)

        const current_kg = toKg(metrics.current_weight_kg, metrics.weightUnit) ?? 80
        const target_kg = toKg(metrics.target_weight_kg, metrics.weightUnit) ?? 75
        const squat_kg = toKg(metrics.squat_1rm_kg, metrics.weightUnit) ?? 0
        const press_kg = toKg(metrics.press_1rm_kg, metrics.weightUnit) ?? 0

        await Promise.all([
            supabase.from('body_identity').upsert({
                user_id: userId,
                goal_text: goalText.trim(),
                goal_key: plan.goal_key,
                goal_label: plan.goal_label,
                current_weight_kg: current_kg,
                target_weight_kg: target_kg,
                height_cm: metrics.height_cm ? parseFloat(metrics.height_cm) : 175,
                squat_1rm_kg: squat_kg,
                press_1rm_kg: press_kg,
                staple_list: plan.staple_list,
                week_plan: plan.week_plan,
                week_start_weight_kg: current_kg,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' }),
            supabase.from('body_weight_log').insert({
                user_id: userId,
                weight_kg: current_kg,
                squat_1rm_kg: squat_kg || null,
                press_1rm_kg: press_kg || null,
            }),
        ])

        setSaving(false)
        setStep('done')
    }

    const canGoNext = goalText.trim().length >= 10

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-2xl bg-[#080808] border border-white/10 rounded-2xl overflow-hidden my-auto"
            >
                {/* ── Header ── */}
                <div className="px-8 pt-8 pb-5 border-b border-white/8">
                    {/* Step indicator */}
                    <div className="flex items-center gap-1.5 mb-4">
                        {(['goal', 'metrics', 'generating', 'preview', 'done'] as Step[]).map((s, i) => (
                            <div
                                key={s}
                                className={`h-1 rounded-full transition-all duration-500
                                    ${step === s ? 'w-8 bg-white' :
                                        ['goal', 'metrics', 'generating', 'preview', 'done'].indexOf(step) > i
                                            ? 'w-4 bg-white/40' : 'w-4 bg-white/10'}`}
                            />
                        ))}
                    </div>

                    <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 mb-1">Body System · Setup</div>
                    <h2 className="text-2xl font-bold text-white">
                        {step === 'goal' && 'What do you want to accomplish?'}
                        {step === 'metrics' && 'Your baseline numbers'}
                        {step === 'generating' && 'Building your 1-week plan…'}
                        {step === 'preview' && `Your ${plan?.goal_label ?? 'custom'} plan`}
                        {step === 'done' && 'Identity activated'}
                    </h2>
                    <p className="text-white/45 text-sm mt-1">
                        {step === 'goal' && 'Be specific — the AI reads your exact words to build the plan.'}
                        {step === 'metrics' && 'Used to calculate safe weight loss rate, macros, and power-to-weight ratio.'}
                        {step === 'generating' && 'AI is designing your first 7-day training + recovery + food plan.'}
                        {step === 'preview' && 'Review your first week before activating.'}
                        {step === 'done' && 'Your first week is ready. Check the analytics dashboard below.'}
                    </p>
                </div>

                {/* ── Body ── */}
                <div className="px-8 py-6">
                    <AnimatePresence mode="wait">

                        {/* ─────────── STEP 1: Goal text ─────────── */}
                        {step === 'goal' && (
                            <motion.div key="goal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <textarea
                                    ref={textareaRef}
                                    value={goalText}
                                    onChange={e => { setGoalText(e.target.value); setError(null) }}
                                    onKeyDown={e => { if (e.key === 'Enter' && e.metaKey && canGoNext) handleGoalNext() }}
                                    rows={4}
                                    placeholder="I want to dunk a basketball by summer. I'm 6'1 and athletic but slow…"
                                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-white/35 resize-none text-sm leading-relaxed"
                                />
                                <p className="text-[10px] text-white/25 mt-1.5">Tip: the more specific you are, the better the plan. ⌘ + Enter to continue.</p>

                                {/* Example chips */}
                                <div className="mt-4">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/35 mb-3">Example goals</p>
                                    <div className="flex flex-wrap gap-2">
                                        {EXAMPLE_GOALS.map(g => (
                                            <button
                                                key={g}
                                                onClick={() => { setGoalText(g); textareaRef.current?.focus() }}
                                                className="text-[11px] px-3 py-1.5 rounded-full border border-white/12 text-white/50 hover:border-white/30 hover:text-white transition"
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {error && <p className="mt-3 text-xs text-rose-400">{error}</p>}

                                <div className="flex justify-end mt-6">
                                    <button
                                        disabled={!canGoNext}
                                        onClick={handleGoalNext}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition disabled:opacity-30"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ─────────── STEP 2: Metrics ─────────── */}
                        {step === 'metrics' && (
                            <motion.div key="metrics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                                {/* Unit toggle */}
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/40">Units:</span>
                                    {(['kg', 'lbs'] as const).map(u => (
                                        <button
                                            key={u}
                                            onClick={() => setMetrics(m => ({ ...m, weightUnit: u }))}
                                            className={`px-3 py-1 rounded-lg text-xs font-medium transition border
                                                ${metrics.weightUnit === u
                                                    ? 'bg-white text-black border-white'
                                                    : 'border-white/15 text-white/40 hover:text-white'}`}
                                        >
                                            {u}
                                        </button>
                                    ))}
                                </div>

                                {/* Weight + height */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-4 flex items-center gap-2">
                                        <Scale className="w-3.5 h-3.5" /> Weight &amp; Height
                                    </p>
                                    <div className="grid sm:grid-cols-3 gap-5">
                                        <MetricInput
                                            label="Current Weight"
                                            sub="Where you are right now"
                                            unit={metrics.weightUnit}
                                            value={metrics.current_weight_kg}
                                            onChange={v => setMetrics(m => ({ ...m, current_weight_kg: v }))}
                                        />
                                        <MetricInput
                                            label="Target Weight"
                                            sub="Where you want to be"
                                            unit={metrics.weightUnit}
                                            value={metrics.target_weight_kg}
                                            onChange={v => setMetrics(m => ({ ...m, target_weight_kg: v }))}
                                        />
                                        <MetricInput
                                            label="Height"
                                            sub="Used to calculate BMR"
                                            unit="cm"
                                            value={metrics.height_cm}
                                            onChange={v => setMetrics(m => ({ ...m, height_cm: v }))}
                                        />
                                    </div>
                                </div>

                                {/* Strength (optional) */}
                                <div className="pt-4 border-t border-white/8">
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-4 flex items-center gap-2">
                                        <Dumbbell className="w-3.5 h-3.5" /> Strength Baseline
                                        <span className="text-white/25">(optional)</span>
                                    </p>
                                    <p className="text-[11px] text-white/30 mb-4">
                                        Used to calculate your power-to-weight ratio on the Identity Horizon chart. Leave at 0 if unknown — you can update later.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-5">
                                        <MetricInput
                                            label="Squat 1RM"
                                            unit={metrics.weightUnit}
                                            value={metrics.squat_1rm_kg}
                                            onChange={v => setMetrics(m => ({ ...m, squat_1rm_kg: v }))}
                                            optional
                                        />
                                        <MetricInput
                                            label="Press 1RM"
                                            unit={metrics.weightUnit}
                                            value={metrics.press_1rm_kg}
                                            onChange={v => setMetrics(m => ({ ...m, press_1rm_kg: v }))}
                                            optional
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-xs text-rose-400">{error}</p>}

                                <div className="flex justify-between pt-2">
                                    <button onClick={() => setStep('goal')} className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white transition">
                                        <ChevronLeft className="w-4 h-4" /> Back
                                    </button>
                                    <button
                                        onClick={handleGenerate}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition"
                                    >
                                        <Zap className="w-4 h-4" /> Generate My 1-Week Plan
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ─────────── STEP 3: Generating ─────────── */}
                        {step === 'generating' && (
                            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-14 flex flex-col items-center gap-5">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 rounded-full border-2 border-white/10 animate-ping" />
                                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-pulse" />
                                    <div className="absolute inset-2 rounded-full bg-white/5 flex items-center justify-center">
                                        <Loader2 className="w-6 h-6 text-white/60 animate-spin" />
                                    </div>
                                </div>
                                <div className="text-center">
                                    <p className="text-white font-medium mb-1">Reading your goal…</p>
                                    <p className="text-white/40 text-sm">Designing 7-day training + recovery + food plan</p>
                                </div>
                                {/* Animated steps */}
                                <div className="space-y-2 mt-2">
                                    {['Analysing goal intent', 'Structuring weekly training split', 'Generating staple food list', 'Writing coaching notes'].map((s, i) => (
                                        <motion.div
                                            key={s}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.6 }}
                                            className="flex items-center gap-2 text-xs text-white/40"
                                        >
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                            {s}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* ─────────── STEP 4: Preview ─────────── */}
                        {step === 'preview' && plan && (
                            <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">

                                {/* Goal label */}
                                <div className="flex items-center gap-3">
                                    <div className="px-3 py-1.5 rounded-full border border-white/20 bg-white/5 text-sm text-white font-medium">
                                        {plan.goal_label}
                                    </div>
                                    <span className="text-xs text-white/30">AI-generated from your goal</span>
                                </div>

                                {/* 7-day week strip */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3">Your First Week</p>
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {plan.week_plan.map((day, i) => (
                                            <DayCard
                                                key={day.day}
                                                day={day}
                                                isSelected={selectedDay === i}
                                                onClick={() => setSelectedDay(i)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Selected day detail */}
                                {plan.week_plan[selectedDay] && (
                                    <motion.div
                                        key={selectedDay}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-white font-semibold">{plan.week_plan[selectedDay].day} — {plan.week_plan[selectedDay].focus}</p>
                                                <p className="text-xs text-white/40 mt-0.5">{plan.week_plan[selectedDay].duration_min} min · {plan.week_plan[selectedDay].type}</p>
                                            </div>
                                        </div>

                                        {/* Exercises (training days) */}
                                        {plan.week_plan[selectedDay].exercises?.length > 0 && (
                                            <div className="space-y-1.5">
                                                {plan.week_plan[selectedDay].exercises.map((ex, i) => (
                                                    <div key={i} className="flex items-center gap-3 text-xs">
                                                        <span className="w-5 h-5 rounded-full bg-white/8 flex items-center justify-center text-white/40 shrink-0">{i + 1}</span>
                                                        <span className="text-white font-medium">{ex.name}</span>
                                                        <span className="text-white/40">{ex.sets}×{ex.reps}</span>
                                                        {ex.notes && <span className="text-white/30 italic">{ex.notes}</span>}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Recovery notes */}
                                        {plan.week_plan[selectedDay].recovery_notes && (
                                            <p className="text-xs text-sky-300/70 bg-sky-500/5 border border-sky-500/15 rounded-lg px-3 py-2">
                                                <Wind className="w-3 h-3 inline mr-1.5" />
                                                {plan.week_plan[selectedDay].recovery_notes}
                                            </p>
                                        )}

                                        {/* Coaching note */}
                                        <p className="text-xs text-white/35 italic border-l-2 border-white/15 pl-3">
                                            "{plan.week_plan[selectedDay].coaching_note}"
                                        </p>
                                    </motion.div>
                                )}

                                {/* Staple list preview */}
                                <div>
                                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40 mb-3 flex items-center gap-2">
                                        <Apple className="w-3 h-3" /> Staple Shopping List
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {plan.staple_list.map((item, i) => (
                                            <span
                                                key={i}
                                                className={`px-2.5 py-1 rounded-full text-[10px] border
                                                    ${item.priority === 'high'
                                                        ? 'border-emerald-500/40 text-emerald-300 bg-emerald-500/8'
                                                        : item.priority === 'medium'
                                                            ? 'border-amber-500/25 text-amber-300/80 bg-amber-500/5'
                                                            : 'border-white/10 text-white/35 bg-white/[0.02]'}`}
                                            >
                                                {item.name}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[9px] text-white/25 mt-2">🟢 Daily · 🟡 3-4×/wk · ⚪ Occasional</p>
                                </div>

                                <div className="flex justify-between pt-2">
                                    <button onClick={() => setStep('metrics')} className="flex items-center gap-1.5 text-sm text-white/30 hover:text-white transition">
                                        <ChevronLeft className="w-4 h-4" /> Edit metrics
                                    </button>
                                    <button
                                        disabled={saving}
                                        onClick={handleActivate}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                        {saving ? 'Saving…' : 'Activate This Plan'}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* ─────────── STEP 5: Done ─────────── */}
                        {step === 'done' && (
                            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center gap-5 text-center">
                                <div className="w-14 h-14 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center">
                                    <Check className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">{plan?.goal_label} identity active</p>
                                    <p className="text-white/40 text-sm mt-1">
                                        Your first week plan, staple list, and analytics are ready.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-3 w-full max-w-sm mt-2">
                                    {[
                                        { icon: <Dumbbell className="w-4 h-4" />, label: '7-day plan', color: 'text-orange-300' },
                                        { icon: <Apple className="w-4 h-4" />, label: '14 staples', color: 'text-emerald-300' },
                                        { icon: <Flame className="w-4 h-4" />, label: 'Macros + radar', color: 'text-amber-300' },
                                    ].map(({ icon, label, color }) => (
                                        <div key={label} className={`flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/[0.03] ${color}`}>
                                            {icon}
                                            <span className="text-[10px] text-white/50">{label}</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={onComplete}
                                    className="px-8 py-3 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition mt-2"
                                >
                                    Open Dashboard →
                                </button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    )
}
