'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Entry } from '@/lib/data-store'
import { AlertTriangle, TrendingDown, TrendingUp, Zap, Scale, Dumbbell } from 'lucide-react'

/* ──────────────────────────────────────────────────────────────
   Types
   ────────────────────────────────────────────────────────── */
interface BodyIdentity {
    goal_key: string
    goal_label: string
    current_weight_kg: number
    target_weight_kg: number
    height_cm: number
    squat_1rm_kg: number
    press_1rm_kg: number
    staple_list: Array<{ name: string; category: string; priority: string }>
    week_start_weight_kg: number | null
}

interface WeightEntry {
    weight_kg: number
    squat_1rm_kg: number | null
    press_1rm_kg: number | null
    logged_at: string
}

interface MacroTargets {
    calories: number
    protein_g: number
    carbs_g: number
    fat_g: number
}

interface Props {
    userId: string
    dietEntries: Entry[]
    recoveryEntries: Entry[]
    macroTargets: MacroTargets | null
}

/* ──────────────────────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────────────────── */

/** Extract Fuel Grade from AI-scanned Notes field */
function extractFuelGrade(notes: string): number | null {
    const m = notes?.match(/Fuel Grade (\d+(?:\.\d+)?)\/10/)
    return m ? parseFloat(m[1]) : null
}

/** Compute Fuel Score: how many of today's food items match the staple list */
function computeFuelScore(entries: Entry[], staples: BodyIdentity['staple_list']): number {
    const stapleNames = staples.map(s => s.name.toLowerCase())
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = entries.filter(e => e.createdAt.startsWith(today))

    // Try extracting from AI fuel grades first
    const grades = todayEntries
        .map(e => extractFuelGrade(e.data['Notes'] || ''))
        .filter((g): g is number => g !== null)
    if (grades.length > 0) {
        return (grades.reduce((a, b) => a + b, 0) / grades.length) * 10 // map 0-10 → 0-100
    }

    // Fallback: match Plate Build items against staple list
    let total = 0, matched = 0
    for (const e of todayEntries) {
        const plateBuild: string = e.data['Plate Build'] || ''
        // If it looks like a comma-separated food list (from scanner, not a dropdown)
        if (plateBuild.includes(',')) {
            const items = plateBuild.split(',').map(n => n.trim().toLowerCase())
            total += items.length
            matched += items.filter(name => stapleNames.some(s => name.includes(s) || s.includes(name))).length
        }
    }
    return total > 0 ? (matched / total) * 100 : 0
}

/* ──────────────────────────────────────────────────────────────
   Sub-component: Identity Radar (SVG spider chart)
   ────────────────────────────────────────────────────────── */
const AXES = ['Stamina', 'Recovery', 'Power', 'Consistency', 'Mobility']
const SIZE = 220, CX = 110, CY = 110, MAX_R = 85

function radarPoint(i: number, value: number): [number, number] {
    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    const r = (Math.min(value, 10) / 10) * MAX_R
    return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)]
}

function radarAxis(i: number): [number, number] {
    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    return [CX + MAX_R * Math.cos(angle), CY + MAX_R * Math.sin(angle)]
}

function labelPosition(i: number): [number, number] {
    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    const r = MAX_R + 20
    return [CX + r * Math.cos(angle), CY + r * Math.sin(angle)]
}

interface RadarProps {
    values: number[] // 5 values 0-10
}

function IdentityRadar({ values }: RadarProps) {
    const dataPath = values.map((v, i) => radarPoint(i, v).join(',')).join(' ')

    return (
        <svg width={SIZE} height={SIZE} className="overflow-visible">
            {/* Grid rings */}
            {[0.25, 0.5, 0.75, 1].map(scale => {
                const pts = AXES.map((_, i) => {
                    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
                    const r = scale * MAX_R
                    return `${CX + r * Math.cos(angle)},${CY + r * Math.sin(angle)}`
                }).join(' ')
                return <polygon key={scale} points={pts} fill="none" stroke="white" strokeOpacity={0.08} strokeWidth={1} />
            })}
            {/* Axes */}
            {AXES.map((_, i) => {
                const [x, y] = radarAxis(i)
                return <line key={i} x1={CX} y1={CY} x2={x} y2={y} stroke="white" strokeOpacity={0.12} strokeWidth={1} />
            })}
            {/* Data polygon */}
            <motion.polygon
                points={dataPath}
                fill="rgba(16,185,129,0.15)"
                stroke="#10b981"
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
            />
            {/* Data points */}
            {values.map((v, i) => {
                const [x, y] = radarPoint(i, v)
                return (
                    <motion.circle
                        key={i} cx={x} cy={y} r={3.5}
                        fill="#10b981"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 + i * 0.05 }}
                    />
                )
            })}
            {/* Labels */}
            {AXES.map((label, i) => {
                const [x, y] = labelPosition(i)
                return (
                    <text
                        key={label}
                        x={x} y={y}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={10} fill="rgba(255,255,255,0.5)"
                        fontFamily="system-ui"
                        style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
                    >
                        {label}
                    </text>
                )
            })}
            {/* Current values at each axis end */}
            {values.map((v, i) => {
                const [x, y] = radarAxis(i)
                return (
                    <text
                        key={`val-${i}`}
                        x={x} y={y - 8}
                        textAnchor="middle"
                        fontSize={9} fill="#10b981"
                        fontFamily="system-ui" fontWeight="bold"
                    >
                        {v.toFixed(1)}
                    </text>
                )
            })}
        </svg>
    )
}

/* ──────────────────────────────────────────────────────────────
   Sub-component: Fuel Quality Heatmap (last 30 days)
   ────────────────────────────────────────────────────────── */
function fuelColor(score: number | null): string {
    if (score === null) return '#ffffff0a'
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#84cc16'
    if (score >= 40) return '#f59e0b'
    if (score > 0) return '#f87171'
    return '#ffffff0a'
}

interface HeatmapProps {
    entries: Entry[]
    staples: BodyIdentity['staple_list']
}

function FuelHeatmap({ entries, staples }: HeatmapProps) {
    const days = useMemo(() => {
        const result: Array<{ date: string; score: number | null }> = []
        const stapleNames = staples.map(s => s.name.toLowerCase())

        for (let i = 29; i >= 0; i--) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]

            const dayEntries = entries.filter(e => e.createdAt.startsWith(dateStr))
            if (dayEntries.length === 0) {
                result.push({ date: dateStr, score: null })
                continue
            }

            // Grade from AI fuel grades
            const grades = dayEntries.map(e => extractFuelGrade(e.data['Notes'] || '')).filter((g): g is number => g !== null)
            if (grades.length > 0) {
                result.push({ date: dateStr, score: (grades.reduce((a, b) => a + b, 0) / grades.length) * 10 })
                continue
            }

            // Fallback: staple match
            let total = 0, matched = 0
            for (const e of dayEntries) {
                const pb: string = e.data['Plate Build'] || ''
                if (pb.includes(',')) {
                    const items = pb.split(',').map(n => n.trim().toLowerCase())
                    total += items.length
                    matched += items.filter(n => stapleNames.some(s => n.includes(s) || s.includes(n))).length
                }
            }
            result.push({ date: dateStr, score: total > 0 ? (matched / total) * 100 : 0 })
        }
        return result
    }, [entries, staples])

    return (
        <div>
            <div className="flex flex-wrap gap-1.5">
                {days.map(({ date, score }) => {
                    const day = new Date(date + 'T00:00:00').getDate()
                    return (
                        <div
                            key={date}
                            className="relative group w-7 h-7 rounded-md flex items-center justify-center cursor-default"
                            style={{ backgroundColor: fuelColor(score) }}
                        >
                            <span className="text-[8px] text-white/40">{day}</span>
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-black border border-white/15 rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none z-10">
                                {date}: {score !== null ? `${Math.round(score)}%` : 'No log'}
                            </div>
                        </div>
                    )
                })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-3 mt-3 text-[9px] text-white/40">
                {[
                    { color: '#f87171', label: '<40%' },
                    { color: '#f59e0b', label: '40-60%' },
                    { color: '#84cc16', label: '60-80%' },
                    { color: '#10b981', label: '80%+' },
                    { color: '#ffffff0a', label: 'No log' },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-sm border border-white/10" style={{ backgroundColor: color }} />
                        <span>{label}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ──────────────────────────────────────────────────────────────
   Sub-component: Identity Horizon (P:W + goal distance)
   ────────────────────────────────────────────────────────── */
function HorizBar({ label, value, max, color, unit }: { label: string; value: number; max: number; color: string; unit: string }) {
    const pct = Math.min(value / max, 1)
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
                <span className="text-white/50 uppercase tracking-[0.1em]">{label}</span>
                <span className="text-white font-mono">{value.toFixed(2)} {unit}</span>
            </div>
            <div className="h-2 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}

interface HorizonProps {
    identity: BodyIdentity
    weightHistory: WeightEntry[]
}

function IdentityHorizon({ identity, weightHistory }: HorizonProps) {
    const startWeight = identity.week_start_weight_kg ?? identity.current_weight_kg
    const current = identity.current_weight_kg
    const target = identity.target_weight_kg
    const totalDelta = Math.abs(startWeight - target)
    const progress = totalDelta > 0 ? Math.abs(startWeight - current) / totalDelta : 0

    // Power-to-Weight ratios
    const squat_pw = identity.squat_1rm_kg > 0 ? identity.squat_1rm_kg / current : 0
    const press_pw = identity.press_1rm_kg > 0 ? identity.press_1rm_kg / current : 0

    // Target P:W for each goal
    const PW_TARGETS: Record<string, { squat: number; press: number }> = {
        pro_basketball: { squat: 1.75, press: 1.0 },
        athletic_performance: { squat: 1.5, press: 1.0 },
        muscle_gain: { squat: 2.0, press: 1.25 },
        weight_loss: { squat: 1.0, press: 0.75 },
        general_fitness: { squat: 1.25, press: 0.85 },
    }
    const pw_target = PW_TARGETS[identity.goal_key] ?? { squat: 1.5, press: 1.0 }

    const weeklyData = weightHistory.slice(-8).map((w, i, arr) => {
        const prev = arr[i - 1]
        return { ...w, delta: prev ? w.weight_kg - prev.weight_kg : 0 }
    })

    const weeklyLoss = weeklyData.length >= 2
        ? Math.abs(weeklyData[weeklyData.length - 1].weight_kg - weeklyData[weeklyData.length - 2].weight_kg)
        : 0
    const maxSafeLoss = current * 0.01  // Adaptation Rate formula: MaxLoss = CurrentWeight × 0.01/week

    return (
        <div className="space-y-5">
            {/* Goal composition progress */}
            <div>
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-white/50 uppercase tracking-[0.1em]">Identity Horizon</span>
                    <span className="text-white font-mono">{(progress * 100).toFixed(0)}% to goal</span>
                </div>
                <div className="h-3 bg-white/8 rounded-full overflow-hidden relative">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                    {/* Target marker */}
                    <div className="absolute top-0 right-0 h-full w-0.5 bg-white/20" />
                </div>
                <div className="flex justify-between text-[10px] text-white/30 mt-1">
                    <span>{startWeight} kg (start)</span>
                    <span>{target} kg (target)</span>
                </div>
            </div>

            {/* Power-to-weight */}
            {(squat_pw > 0 || press_pw > 0) && (
                <div className="space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/40">Power-to-Weight Ratio</p>
                    {squat_pw > 0 && (
                        <HorizBar label="Squat P:W" value={squat_pw} max={pw_target.squat} color="#a78bfa" unit="×BW" />
                    )}
                    {press_pw > 0 && (
                        <HorizBar label="Press P:W" value={press_pw} max={pw_target.press} color="#60a5fa" unit="×BW" />
                    )}
                    <p className="text-[10px] text-white/30">
                        Target for {identity.goal_label}: Squat ≥{pw_target.squat}× · Press ≥{pw_target.press}×
                    </p>
                </div>
            )}

            {/* Adaptation rate pill */}
            {weeklyLoss > 0 && (
                <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs
                    ${weeklyLoss > maxSafeLoss
                        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                        : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'}`}
                >
                    {weeklyLoss > maxSafeLoss ? <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> : <TrendingDown className="w-3.5 h-3.5 shrink-0" />}
                    <span>
                        {weeklyLoss > maxSafeLoss
                            ? `Muscle Preservation Alert — losing ${weeklyLoss.toFixed(2)} kg/wk vs safe max ${maxSafeLoss.toFixed(2)} kg. Increase protein.`
                            : `Adaptation Rate OK — ${weeklyLoss.toFixed(2)} kg/wk (max safe: ${maxSafeLoss.toFixed(2)} kg)`}
                    </span>
                </div>
            )}
        </div>
    )
}

/* ──────────────────────────────────────────────────────────────
   Main exported component
   ────────────────────────────────────────────────────────── */
export function BodyAnalytics({ userId, dietEntries, recoveryEntries, macroTargets }: Props) {
    const supabase = createClient()
    const [identity, setIdentity] = useState<BodyIdentity | null>(null)
    const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([])
    const [loading, setLoading] = useState(true)

    const load = useCallback(async () => {
        const [{ data: id }, { data: wh }] = await Promise.all([
            supabase.from('body_identity').select('*').eq('user_id', userId).maybeSingle(),
            supabase.from('body_weight_log').select('*').eq('user_id', userId).order('logged_at', { ascending: true }).limit(20),
        ])
        if (id) setIdentity(id as BodyIdentity)
        setWeightHistory((wh as WeightEntry[]) ?? [])
        setLoading(false)
    }, [userId])

    useEffect(() => { load() }, [load])

    /* ── Compute radar values ── */
    const today = new Date().toISOString().split('T')[0]
    const todayDiet = dietEntries.filter(e => e.createdAt.startsWith(today))
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]
    })

    const radarValues = useMemo((): number[] => {
        if (!identity || !macroTargets) return [0, 0, 0, 0, 0]

        // Stamina: carb status
        const carbConsumed = todayDiet.reduce((s, e) => s + Number(e.data['Carbs (g)'] || 0), 0)
        const stamina = Math.min((carbConsumed / (macroTargets.carbs_g || 1)) * 10, 10)

        // Recovery: protein + sleep
        const proteinConsumed = todayDiet.reduce((s, e) => s + Number(e.data['Protein (g)'] || 0), 0)
        const sleepEntry = recoveryEntries.find(e => e.createdAt.startsWith(today) && e.data['Sleep Hours'])
        const sleepHours = sleepEntry ? Number(sleepEntry.data['Sleep Hours']) : 6
        const recovery = Math.min(
            ((proteinConsumed / (macroTargets.protein_g || 1)) * 0.6 + (sleepHours / 9) * 0.4) * 10,
            10
        )

        // Mobility: hydration + recovery modalities this week
        const hydration = todayDiet.reduce((s, e) => s + Number(e.data['Hydration (glasses)'] || 0), 0)
        const recoveryThisWeek = recoveryEntries.filter(e => last7.some(d => e.createdAt.startsWith(d)) && ['Mobility', 'Breathwork', 'Cold / Heat', 'Contrast'].includes(e.data['Modality'])).length
        const mobility = Math.min((hydration / 8) * 6 + Math.min(recoveryThisWeek, 2) * 2, 10)

        // Consistency: % of last 7 days with a fuel grade > 5 (or at least one scanned meal)
        const daysWithGoodFuel = last7.filter(d => {
            const dayEntries = dietEntries.filter(e => e.createdAt.startsWith(d))
            const grades = dayEntries.map(e => extractFuelGrade(e.data['Notes'] || '')).filter((g): g is number => g !== null)
            return grades.length > 0 && grades.some(g => g >= 6)
        }).length
        const consistency = (daysWithGoodFuel / 7) * 10

        // Power: P:W ratio vs target
        if (identity.squat_1rm_kg === 0) {
            return [stamina, recovery, 5, consistency, mobility]
        }
        const PW_TARGETS: Record<string, number> = { pro_basketball: 1.75, athletic_performance: 1.5, muscle_gain: 2.0, weight_loss: 1.0, general_fitness: 1.25 }
        const pwTarget = PW_TARGETS[identity.goal_key] ?? 1.5
        const actual_pw = identity.squat_1rm_kg / identity.current_weight_kg
        const power = Math.min((actual_pw / pwTarget) * 10, 10)

        return [stamina, recovery, power, consistency, mobility]
    }, [identity, macroTargets, todayDiet, recoveryEntries, dietEntries])

    const fuelScore = useMemo(() => {
        if (!identity) return 0
        return computeFuelScore(dietEntries, identity.staple_list)
    }, [identity, dietEntries])

    if (loading) return null
    if (!identity) return null

    const fuelColor = fuelScore >= 80 ? 'text-emerald-400' : fuelScore >= 60 ? 'text-lime-400' : fuelScore >= 40 ? 'text-amber-400' : 'text-rose-400'

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-6 mt-8">

            {/* ─── Section header ── */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{identity.goal_key === 'pro_basketball' ? '🏀' : identity.goal_key === 'weight_loss' ? '⚖️' : identity.goal_key === 'muscle_gain' ? '💪' : identity.goal_key === 'athletic_performance' ? '🏃' : '🌱'}</span>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Current Identity</p>
                        <p className="text-white font-semibold">{identity.goal_label}</p>
                    </div>
                </div>
                <div className="h-px flex-1 bg-white/8" />
                {/* Fuel Score badge */}
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-[10px] uppercase tracking-[0.15em] text-white/40">Fuel Score</span>
                    <span className={`text-xl font-bold font-mono ${fuelColor}`}>{Math.round(fuelScore)}%</span>
                </div>
            </div>

            {/* ─── Radar + Heatmap row ── */}
            <div className="grid lg:grid-cols-2 gap-6">

                {/* Radar */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5">Identity Radar</p>
                    <div className="flex justify-center">
                        <IdentityRadar values={radarValues} />
                    </div>
                    {/* Axis legend */}
                    <div className="grid grid-cols-5 gap-1 mt-4">
                        {AXES.map((label, i) => (
                            <div key={label} className="flex flex-col items-center">
                                <span className="text-[8px] text-white/40 uppercase">{label}</span>
                                <span className="text-xs font-mono text-emerald-400">{radarValues[i].toFixed(1)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fuel Quality Heatmap */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-5">Fuel Quality Map · Last 30 Days</p>
                    <FuelHeatmap entries={dietEntries} staples={identity.staple_list} />
                    {/* Staple list chips */}
                    {identity.staple_list.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-white/8">
                            <p className="text-[9px] uppercase tracking-[0.15em] text-white/30 mb-2">Your Staple List</p>
                            <div className="flex flex-wrap gap-1.5">
                                {identity.staple_list.slice(0, 10).map((s, i) => (
                                    <span key={i} className={`text-[10px] px-2 py-0.5 rounded-full border
                                        ${s.priority === 'high' ? 'border-emerald-500/30 text-emerald-400' : 'border-white/12 text-white/40'}`}>
                                        {s.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Identity Horizon ── */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-5">
                    <TrendingUp className="w-4 h-4 text-teal-400" />
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">Identity Horizon</p>
                    <span className="text-[10px] text-white/30 ml-auto">
                        {identity.current_weight_kg} kg · {identity.height_cm > 0 ? `${identity.height_cm} cm` : ''}
                    </span>
                </div>
                <IdentityHorizon identity={identity} weightHistory={weightHistory} />
            </div>

        </motion.div>
    )
}
