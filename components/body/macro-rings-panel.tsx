'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Entry } from '@/lib/data-store'
import { Dumbbell, Moon, Settings2, Check, Zap, Flame, Droplets, ChevronDown, ChevronUp } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────────────────── */
interface MacroTargets {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
}

interface Props {
    entries: Entry[]
    userId: string
}

/* ─────────────────────────────────────────────────────────────────────────
   Color formula
   • 0 – 50%   →  green   (just getting started)
   • 50 – 90%  →  yellow  (in the zone)
   • 90 – 100% →  orange  (almost there)
   • > 100%    →  red     (exceeded)
   ───────────────────────────────────────────────────────────────────────── */
function macroColor(pct: number): { bar: string; text: string; glow: string } {
    if (pct > 1) return { bar: '#f87171', text: 'text-rose-400', glow: 'shadow-[0_0_12px_rgba(248,113,113,0.35)]' }
    if (pct > 0.9) return { bar: '#fb923c', text: 'text-orange-400', glow: 'shadow-[0_0_12px_rgba(251,146,60,0.25)]' }
    if (pct > 0.5) return { bar: '#facc15', text: 'text-yellow-400', glow: '' }
    return { bar: '#4ade80', text: 'text-emerald-400', glow: '' }
}

/* ─────────────────────────────────────────────────────────────────────────
   Helper: local timezone YYYY-MM-DD
   ───────────────────────────────────────────────────────────────────────── */
function toLocalIso(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

/* ─────────────────────────────────────────────────────────────────────────
   Week start (Monday of current week) → Local ISO date string
   ───────────────────────────────────────────────────────────────────────── */
function weekStart(): string {
    const d = new Date()
    const day = d.getDay() // 0=Sun
    const diff = day === 0 ? -6 : 1 - day
    d.setDate(d.getDate() + diff)
    return toLocalIso(d)
}

/* ─────────────────────────────────────────────────────────────────────────
   Animated progress bar (line diagram)
   ───────────────────────────────────────────────────────────────────────── */
function MacroBar({
    label,
    consumed,
    target,
    unit = 'g',
}: {
    label: string
    consumed: number
    target: number
    unit?: string
}) {
    const pct = target > 0 ? consumed / target : 0
    const remaining = Math.max(0, target - consumed)
    const over = consumed > target
    const { bar, text, glow } = macroColor(pct)

    return (
        <div className="space-y-2">
            {/* Label row */}
            <div className="flex items-baseline justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/50">{label}</span>
                <div className="flex items-baseline gap-1.5">
                    <span className={`text-sm font-bold font-mono ${text}`}>{Math.round(consumed)}{unit}</span>
                    <span className="text-[10px] text-white/30">/ {target}{unit}</span>
                </div>
            </div>

            {/* Bar track */}
            <div className="relative h-2 w-full rounded-full bg-white/8 overflow-hidden">
                <motion.div
                    className={`absolute left-0 top-0 h-full rounded-full ${glow}`}
                    style={{ backgroundColor: bar }}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(pct * 100, 100)}%` }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                />
                {/* Overflow cap — red overflow spike */}
                {over && (
                    <motion.div
                        className="absolute right-0 top-0 h-full w-1.5 rounded-full bg-rose-500"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    />
                )}
            </div>

            {/* Remaining */}
            <div className="flex items-center justify-between text-[10px]">
                {over ? (
                    <span className="text-rose-400 font-medium">+{Math.round(consumed - target)}{unit} over target</span>
                ) : (
                    <span className="text-white/30">{Math.round(remaining)}{unit} remaining</span>
                )}
                <span className="text-white/20">{Math.round(pct * 100)}%</span>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────
   Big calorie display
   ───────────────────────────────────────────────────────────────────────── */
function CalorieDisplay({ consumed, target }: { consumed: number; target: number }) {
    const pct = target > 0 ? consumed / target : 0
    const { text } = macroColor(pct)
    const remaining = Math.max(0, target - consumed)
    const over = consumed > target

    return (
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35 mb-1">
                    {over ? 'Calories Exceeded' : 'Calories Remaining'}
                </p>
                <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-bold font-mono leading-none ${text}`}>
                        {over ? `+${Math.round(consumed - target)}` : Math.round(remaining)}
                    </span>
                    <span className="text-sm text-white/30">kcal</span>
                </div>
                <p className="text-[10px] text-white/30 mt-1">
                    {Math.round(consumed)} consumed of {target} target
                </p>
            </div>

            {/* Circular arc mini */}
            <svg width={72} height={72} className="rotate-[-90deg] shrink-0">
                <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={7} />
                <motion.circle
                    cx={36} cy={36} r={28}
                    fill="none"
                    stroke={macroColor(pct).bar}
                    strokeWidth={7}
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - Math.min(pct, 1)) }}
                    transition={{ duration: 1.1, ease: 'easeOut' }}
                />
            </svg>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────
   Settings form
   ───────────────────────────────────────────────────────────────────────── */
function SettingsForm({
    draft,
    saving,
    onChange,
    onSave,
    onCancel,
    hasTargets,
}: {
    draft: MacroTargets
    saving: boolean
    onChange: (d: MacroTargets) => void
    onSave: () => void
    onCancel: () => void
    hasTargets: boolean
}) {
    const fields: { key: keyof MacroTargets; label: string; unit: string }[] = [
        { key: 'calories', label: 'Calories', unit: 'kcal' },
        { key: 'protein_g', label: 'Protein', unit: 'g' },
        { key: 'carbs_g', label: 'Carbs', unit: 'g' },
        { key: 'fat_g', label: 'Fat', unit: 'g' },
    ]
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
        >
            <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 mt-4">
                <p className="text-xs text-white/40 mb-4">
                    {hasTargets ? 'Adjust your daily macro targets' : '👋 Set targets to start tracking'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    {fields.map(({ key, label, unit }) => (
                        <div key={key} className="space-y-1">
                            <label className="text-[10px] uppercase tracking-[0.15em] text-white/40">{label}</label>
                            <div className="flex items-center gap-1">
                                <input
                                    type="number"
                                    min={0}
                                    value={draft[key]}
                                    onChange={e => onChange({ ...draft, [key]: Number(e.target.value) })}
                                    className="w-full bg-white/5 border border-white/12 rounded-lg px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:border-white/35"
                                />
                                <span className="text-[10px] text-white/30 shrink-0">{unit}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={onSave}
                        disabled={saving}
                        className="flex items-center gap-1.5 px-4 py-2 bg-white text-black text-xs font-bold rounded-lg hover:bg-white/90 transition disabled:opacity-40"
                    >
                        <Check className="w-3 h-3" />
                        {saving ? 'Saving…' : 'Save targets'}
                    </button>
                    {hasTargets && (
                        <button onClick={onCancel} className="px-4 py-2 text-xs text-white/40 hover:text-white transition">
                            Cancel
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────
   Main export
   ───────────────────────────────────────────────────────────────────────── */
export function MacroRingsPanel({ entries, userId }: Props) {
    const supabase = createClient()
    const [targets, setTargets] = useState<MacroTargets | null>(null)
    const [goalKey, setGoalKey] = useState<string | null>(null)
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState<MacroTargets>({ calories: 2000, protein_g: 150, carbs_g: 200, fat_g: 65 })
    const [saving, setSaving] = useState(false)
    const [showWeekly, setShowWeekly] = useState(false)
    const todayStr = toLocalIso(new Date())

    /* ── No athletic split toggle needed here per user request ── */

    /* ── Load targets + identity ── */
    const loadData = useCallback(async () => {
        const [{ data: mt }, { data: bi }] = await Promise.all([
            supabase.from('macro_targets').select('*').eq('user_id', userId).maybeSingle(),
            supabase.from('body_identity').select('goal_key').eq('user_id', userId).maybeSingle(),
        ])
        if (mt) {
            const t = { calories: mt.calories, protein_g: mt.protein_g, carbs_g: mt.carbs_g, fat_g: mt.fat_g }
            setTargets(t)
            setDraft(t)
        }
        if (bi) setGoalKey(bi.goal_key)
    }, [userId])     // eslint-disable-line

    useEffect(() => { loadData() }, [loadData])

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

    const effectiveTargets = targets;

    const isToday = (dStr: string) => {
        if (!dStr) return false;
        if (!dStr.includes('T')) {
            return dStr.startsWith(todayStr);
        }
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return false;
        return toLocalIso(d) === todayStr;
    }

    /* ── Hydration Total ── */
    const hydrationTotal = useMemo(() =>
        entries.filter(e => {
            const d = String(e.data?.['Date'] || e.createdAt || '')
            return e.data?.['Type'] === 'hydration' && isToday(d)
        }).reduce((acc, e) => acc + Number(e.data?.['Hydration (glasses)'] || 0), 0)
        , [entries, todayStr])

    /* ── Today's consumed totals ── */
    const todayEntries = useMemo(() =>
        entries.filter(e => {
            const dateStr = String(e.data?.['Date'] || e.createdAt || '');
            return isToday(dateStr) && e.data?.['Type'] !== 'hydration';
        }),
        [entries, todayStr])

    const consumed = useMemo(() => todayEntries.reduce(
        (acc, e) => ({
            calories: acc.calories + Number(e.data?.['Calories'] || 0),
            protein_g: acc.protein_g + Number(e.data?.['Protein (g)'] || 0),
            carbs_g: acc.carbs_g + Number(e.data?.['Carbs (g)'] || 0),
            fat_g: acc.fat_g + Number(e.data?.['Fats (g)'] || 0),
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
    ), [todayEntries])

    /* ── Weekly totals (Monday → today) ── */
    const weekStartStr = weekStart()
    const weekEntries = useMemo(() =>
        entries.filter(e => {
            const dateStr = String(e.data?.['Date'] || e.createdAt || '');
            return dateStr >= weekStartStr && e.data?.['Type'] !== 'hydration';
        }),
        [entries, weekStartStr])

    const weeklyTotals = useMemo(() => weekEntries.reduce(
        (acc, e) => ({
            calories: acc.calories + Number(e.data?.['Calories'] || 0),
            protein_g: acc.protein_g + Number(e.data?.['Protein (g)'] || 0),
            carbs_g: acc.carbs_g + Number(e.data?.['Carbs (g)'] || 0),
            fat_g: acc.fat_g + Number(e.data?.['Fats (g)'] || 0),
            meals: acc.meals + 1,
        }),
        { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, meals: 0 }
    ), [weekEntries])

    /* ── Average fuel grade today ── */
    const avgFuelGrade = useMemo(() => {
        const withGrade = todayEntries.filter(e => e.data['Fuel Grade'])
        if (!withGrade.length) return null
        return withGrade.reduce((s, e) => s + Number(e.data['Fuel Grade'] || 0), 0) / withGrade.length
    }, [todayEntries])

    /* ── Hydration today ── */
    const hydrationToday = useMemo(() =>
        todayEntries.reduce((s, e) => s + Number(e.data['Hydration (glasses)'] || 0), 0),
        [todayEntries])

    const noTargets = !effectiveTargets

    return (
        <div className="mb-8 space-y-3">

            {/* ── Main macro panel ── */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Today's Fuel</p>
                        <p className="text-white/60 text-sm mt-0.5">
                            {todayEntries.length === 0
                                ? 'No meals scanned yet'
                                : `${todayEntries.length} meal${todayEntries.length > 1 ? 's' : ''} logged · ${todayStr}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditing(e => !e)}
                            className="p-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition text-white/40 hover:text-white"
                        >
                            <Settings2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Settings form */}
                <AnimatePresence>
                    {(editing || noTargets) && (
                        <SettingsForm
                            draft={draft}
                            saving={saving}
                            onChange={setDraft}
                            onSave={saveTargets}
                            onCancel={() => { setDraft(targets!); setEditing(false) }}
                            hasTargets={!!targets}
                        />
                    )}
                </AnimatePresence>

                {effectiveTargets && (
                    <>
                        {/* ── Big calorie remaining ── */}
                        <CalorieDisplay consumed={consumed.calories} target={effectiveTargets.calories} />

                        {/* ── Macro line bars ── */}
                        <div className="space-y-5 pt-2 border-t border-white/8">
                            <MacroBar
                                label="Protein"
                                consumed={consumed.protein_g}
                                target={effectiveTargets.protein_g}
                            />
                            <MacroBar
                                label="Carbohydrates"
                                consumed={consumed.carbs_g}
                                target={effectiveTargets.carbs_g}
                            />
                            <MacroBar
                                label="Fats"
                                consumed={consumed.fat_g}
                                target={effectiveTargets.fat_g}
                            />
                        </div>

                        {/* ── Hydration + Fuel Grade strip ── */}
                        <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-white/8 text-xs">
                            {/* Hydration */}
                            <div className="flex items-center gap-1.5">
                                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                                <span className="text-sky-300/80 font-medium">{hydrationToday}</span>
                                <span className="text-white/30">glasses water</span>
                            </div>

                            {/* Fuel grade */}
                            {avgFuelGrade !== null && (
                                <div className="flex items-center gap-1.5 ml-auto">
                                    <Zap className="w-3.5 h-3.5 text-yellow-400" />
                                    <span className="text-white/50">Fuel Grade</span>
                                    <span className={`font-bold font-mono ${avgFuelGrade >= 8 ? 'text-emerald-400'
                                        : avgFuelGrade >= 5 ? 'text-yellow-400'
                                            : 'text-rose-400'
                                        }`}>
                                        {avgFuelGrade.toFixed(1)}/10
                                    </span>
                                </div>
                            )}

                        </div>
                    </>
                )}
            </div>

            {/* ── Weekly summary toggle ── */}
            <button
                onClick={() => setShowWeekly(w => !w)}
                className="w-full flex items-center justify-between px-5 py-3 rounded-xl border border-white/8 bg-white/[0.02] text-xs text-white/40 hover:text-white/60 hover:border-white/15 transition"
            >
                <span className="uppercase tracking-[0.18em]">
                    This Week · {weekEntries.length} meal{weekEntries.length !== 1 ? 's' : ''}
                </span>
                {showWeekly ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
                {showWeekly && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-5 py-4 space-y-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
                                Week of {weekStartStr} → {todayStr}
                            </p>

                            {/* Weekly bar comparisons: consumed vs (target × days elapsed) */}
                            {effectiveTargets && (() => {
                                // Days elapsed this week (including today)
                                const jsDay = new Date().getDay()
                                const daysElapsed = jsDay === 0 ? 7 : jsDay // Mon=1…Sun=0→7
                                const weekTargetCal = effectiveTargets.calories * daysElapsed
                                const weekTargetPro = effectiveTargets.protein_g * daysElapsed
                                const weekTargetCarb = effectiveTargets.carbs_g * daysElapsed
                                const weekTargetFat = effectiveTargets.fat_g * daysElapsed

                                return (
                                    <div className="space-y-4">
                                        <MacroBar label="Calories" consumed={weeklyTotals.calories} target={weekTargetCal} unit=" kcal" />
                                        <MacroBar label="Protein" consumed={weeklyTotals.protein_g} target={weekTargetPro} />
                                        <MacroBar label="Carbs" consumed={weeklyTotals.carbs_g} target={weekTargetCarb} />
                                        <MacroBar label="Fats" consumed={weeklyTotals.fat_g} target={weekTargetFat} />
                                    </div>
                                )
                            })()}

                            {/* Weekly averages */}
                            {weekEntries.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/8">
                                    {[
                                        { label: 'Avg kcal/day', value: Math.round(weeklyTotals.calories / Math.max(1, weekEntries.length)) },
                                        { label: 'Avg protein', value: Math.round(weeklyTotals.protein_g / Math.max(1, weekEntries.length)) + 'g' },
                                        { label: 'Avg carbs', value: Math.round(weeklyTotals.carbs_g / Math.max(1, weekEntries.length)) + 'g' },
                                        { label: 'Avg fat', value: Math.round(weeklyTotals.fat_g / Math.max(1, weekEntries.length)) + 'g' },
                                    ].map(({ label, value }) => (
                                        <div key={label}>
                                            <p className="text-[9px] uppercase tracking-[0.15em] text-white/30">{label}</p>
                                            <p className="text-lg font-bold text-white mt-0.5">{value}</p>
                                            <p className="text-[9px] text-white/20">per meal</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
