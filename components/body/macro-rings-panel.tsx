'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Entry } from '@/lib/data-store'
import { Settings2, Check, Flame, Zap, Dumbbell, Moon } from 'lucide-react'

/* ── Types ──────────────────────────────────────────────────── */
interface MacroTargets {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
}

interface Props {
    /** All diet entries for the current user (unfiltered — we filter for today) */
    entries: Entry[]
    userId: string
}

/* ── SVG Ring helper ─────────────────────────────────────────── */
function Ring({
    pct,
    size,
    stroke,
    color,
    bg = '#ffffff12',
    children,
}: {
    pct: number
    size: number
    stroke: number
    color: string
    bg?: string
    children?: React.ReactNode
}) {
    const r = (size - stroke) / 2
    const circ = 2 * Math.PI * r
    const clamped = Math.min(pct, 1)

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
                {/* track */}
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={bg} strokeWidth={stroke} />
                {/* progress */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{ strokeDashoffset: circ }}
                    animate={{ strokeDashoffset: circ * (1 - clamped) }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
                {children}
            </div>
        </div>
    )
}

/* ── Small inline-ring badge ─────────────────────────────────── */
function SmallRing({
    label,
    consumed,
    target,
    color,
    unit = 'g',
}: {
    label: string
    consumed: number
    target: number
    color: string
    unit?: string
}) {
    const pct = target > 0 ? consumed / target : 0
    const over = pct > 1
    return (
        <div className="flex flex-col items-center gap-1.5">
            <Ring size={72} stroke={6} color={over ? '#f87171' : color} pct={pct}>
                <span className="text-[11px] font-bold text-white" style={{ color: over ? '#f87171' : 'white' }}>
                    {Math.round(consumed)}
                    <span className="text-[8px] font-normal text-white/50">{unit}</span>
                </span>
            </Ring>
            <span className="text-[10px] uppercase tracking-[0.15em] text-white/50">{label}</span>
            <span className="text-[10px] text-white/30">/{target}{unit}</span>
        </div>
    )
}

/* ── Targets setup form ──────────────────────────────────────── */
function NumberField({
    label,
    value,
    onChange,
    unit,
}: {
    label: string
    value: number
    onChange: (v: number) => void
    unit: string
}) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase tracking-[0.15em] text-white/50">{label}</label>
            <div className="flex items-center gap-1.5">
                <input
                    type="number"
                    value={value}
                    min={0}
                    onChange={e => onChange(Number(e.target.value))}
                    className="w-20 bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-white/40"
                />
                <span className="text-xs text-white/40">{unit}</span>
            </div>
        </div>
    )
}

/* ── Main Component ──────────────────────────────────────────── */
export function MacroRingsPanel({ entries, userId }: Props) {
    const [targets, setTargets] = useState<MacroTargets | null>(null)
    const [goalKey, setGoalKey] = useState<string | null>(null)
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState<MacroTargets>({ calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65 })
    const [saving, setSaving] = useState(false)
    const supabase = createClient()

    // Training / Rest day toggle — persisted in localStorage by today's date
    const today = new Date().toISOString().split('T')[0]
    const [isTrainingDay, setIsTrainingDay] = useState(() => {
        if (typeof window === 'undefined') return false
        return localStorage.getItem(`training_day_${new Date().toISOString().split('T')[0]}`) === 'true'
    })
    const toggleTrainingDay = () => {
        const next = !isTrainingDay
        setIsTrainingDay(next)
        if (typeof window !== 'undefined') localStorage.setItem(`training_day_${today}`, String(next))
    }

    /* ── Load targets + identity ── */
    const loadTargets = useCallback(async () => {
        const [{ data: mt }, { data: bi }] = await Promise.all([
            supabase.from('macro_targets').select('*').eq('user_id', userId).single(),
            supabase.from('body_identity').select('goal_key').eq('user_id', userId).single(),
        ])
        if (mt) {
            const t = { calories: mt.calories, protein_g: mt.protein_g, carbs_g: mt.carbs_g, fat_g: mt.fat_g }
            setTargets(t)
            setDraft(t)
        }
        if (bi) setGoalKey(bi.goal_key)
    }, [userId])

    useEffect(() => { loadTargets() }, [loadTargets])

    /* ── Save targets ── */
    const saveTargets = async () => {
        setSaving(true)
        await supabase.from('macro_targets').upsert({
            user_id: userId,
            calories: draft.calories,
            protein_g: draft.protein_g,
            carbs_g: draft.carbs_g,
            fat_g: draft.fat_g,
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        setTargets(draft)
        setEditing(false)
        setSaving(false)
    }

    /* ── Dynamic macro split (PRD: Training vs Rest Day) ── */
    const isAthletic = goalKey === 'pro_basketball' || goalKey === 'athletic_performance'
    const effectiveTargets = useMemo(() => {
        if (!targets) return null
        if (!isAthletic) return targets
        const cal = targets.calories
        return isTrainingDay
            // Training: Carbs 50% | Protein 30% | Fat 20%
            ? { calories: cal, protein_g: Math.round((cal * 0.30) / 4), carbs_g: Math.round((cal * 0.50) / 4), fat_g: Math.round((cal * 0.20) / 9) }
            // Rest:     Carbs 20% | Protein 50% | Fat 30%
            : { calories: cal, protein_g: Math.round((cal * 0.50) / 4), carbs_g: Math.round((cal * 0.20) / 4), fat_g: Math.round((cal * 0.30) / 9) }
    }, [targets, isTrainingDay, isAthletic])

    /* ── Today's totals ── */
    const todayEntries = entries.filter(e => e.createdAt.startsWith(today))

    const consumed = todayEntries.reduce(
        (acc, e) => ({
            calories: acc.calories + Number(e.data['Calories'] || 0),
            protein_g: acc.protein_g + Number(e.data['Protein (g)'] || 0),
            carbs_g: acc.carbs_g + Number(e.data['Carbs (g)'] || 0),
            fat_g: acc.fat_g + Number(e.data['Fats (g)'] || 0),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    )

    const calPct = effectiveTargets ? consumed.calories / effectiveTargets.calories : 0
    const calOver = calPct > 1

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-0.5">Today's Macros</p>
                    <p className="text-white/70 text-sm">
                        {todayEntries.length === 0
                            ? 'No meals logged yet'
                            : `${todayEntries.length} meal${todayEntries.length > 1 ? 's' : ''} logged`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Training / Rest day toggle — only for athletic identities */}
                    {isAthletic && (
                        <button
                            onClick={toggleTrainingDay}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition
                                ${isTrainingDay
                                    ? 'border-orange-500/40 bg-orange-500/10 text-orange-300'
                                    : 'border-blue-500/30 bg-blue-500/8 text-blue-300'}`}
                        >
                            {isTrainingDay ? <Dumbbell className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                            {isTrainingDay ? 'Train' : 'Rest'}
                        </button>
                    )}
                    <button
                        onClick={() => setEditing(e => !e)}
                        className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-white/50 hover:text-white"
                    >
                        <Settings2 className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Targets setup form ── */}
            <AnimatePresence>
                {(editing || !targets) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-5"
                    >
                        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                            <p className="text-xs text-white/50 mb-4">
                                {!targets ? '👋 Set your daily macro targets to unlock the rings.' : 'Edit your daily targets'}
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <NumberField label="Calories" unit="kcal" value={draft.calories} onChange={v => setDraft(d => ({ ...d, calories: v }))} />
                                <NumberField label="Protein" unit="g" value={draft.protein_g} onChange={v => setDraft(d => ({ ...d, protein_g: v }))} />
                                <NumberField label="Carbs" unit="g" value={draft.carbs_g} onChange={v => setDraft(d => ({ ...d, carbs_g: v }))} />
                                <NumberField label="Fat" unit="g" value={draft.fat_g} onChange={v => setDraft(d => ({ ...d, fat_g: v }))} />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={saveTargets}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5" />
                                    {saving ? 'Saving…' : 'Save targets'}
                                </button>
                                {targets && (
                                    <button
                                        onClick={() => { setDraft(targets); setEditing(false) }}
                                        className="px-4 py-2 text-xs text-white/50 hover:text-white transition"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Rings row ── */}
            {effectiveTargets && (
                <div className="flex flex-wrap items-center gap-6 md:gap-10">
                    {/* Big calorie ring */}
                    <Ring
                        size={120}
                        stroke={10}
                        color={calOver ? '#f87171' : '#10b981'}
                        pct={calPct}
                    >
                        <div className="flex flex-col items-center">
                            <Flame className={`w-3.5 h-3.5 mb-0.5 ${calOver ? 'text-rose-400' : 'text-emerald-400'}`} />
                            <span className={`text-xl font-bold leading-none ${calOver ? 'text-rose-400' : 'text-white'}`}>
                                {Math.round(consumed.calories)}
                            </span>
                            <span className="text-[9px] text-white/40 uppercase tracking-wider">kcal</span>
                            <span className="text-[9px] text-white/30 mt-0.5">/{effectiveTargets.calories}</span>
                        </div>
                    </Ring>

                    {/* Divider */}
                    <div className="hidden md:block w-px h-16 bg-white/10" />

                    {/* Macro trio */}
                    <div className="flex gap-5">
                        <SmallRing label="Protein" consumed={consumed.protein_g} target={effectiveTargets.protein_g} color="#60a5fa" />
                        <SmallRing label="Carbs" consumed={consumed.carbs_g} target={effectiveTargets.carbs_g} color="#f59e0b" />
                        <SmallRing label="Fat" consumed={consumed.fat_g} target={effectiveTargets.fat_g} color="#a78bfa" />
                    </div>

                    {/* Remaining callout */}
                    <div className="hidden lg:flex flex-col gap-2 ml-auto">
                        {['calories', 'protein_g', 'carbs_g', 'fat_g'].map(key => {
                            const tVal = effectiveTargets[key as keyof MacroTargets]
                            const cVal = consumed[key as keyof typeof consumed]
                            const rem = Math.max(0, tVal - cVal)
                            const labels: Record<string, string> = { calories: 'kcal left', protein_g: 'g protein left', carbs_g: 'g carbs left', fat_g: 'g fat left' }
                            return (
                                <div key={key} className="flex items-center justify-between gap-6 text-xs">
                                    <span className="text-white/40 uppercase tracking-[0.1em]">{labels[key]}</span>
                                    <span className={`font-mono font-bold ${rem === 0 && cVal >= tVal ? 'text-emerald-400' : 'text-white'}`}>
                                        {cVal > tVal ? `+${Math.round(cVal - tVal)} over` : Math.round(rem)}
                                    </span>
                                </div>
                            )
                        })}
                        {/* Dynamic split label */}
                        {isAthletic && (
                            <p className="text-[9px] text-white/25 uppercase tracking-[0.1em] mt-1">
                                {isTrainingDay ? '50C · 30P · 20F split' : '20C · 50P · 30F split'}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {/* Fuel grade strip if any meals today */}
            {todayEntries.length > 0 && targets && (
                <div className="mt-5 pt-4 border-t border-white/8 flex items-center gap-2 text-xs text-white/40">
                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                    <span>
                        Avg Fuel Grade today:{' '}
                        <span className="text-white font-bold">
                            {(
                                todayEntries.reduce((s, e) => {
                                    const notes: string = e.data['Notes'] || ''
                                    const m = notes.match(/Fuel Grade (\d+(?:\.\d+)?)/)
                                    return s + (m ? parseFloat(m[1]) : 0)
                                }, 0) / todayEntries.length
                            ).toFixed(1)}
                            /10
                        </span>
                    </span>
                    <span className="ml-auto">{today}</span>
                </div>
            )}
        </div>
    )
}
