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
                fill="rgba(16,185,129,0.1)"
                stroke="#10b981"
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{ transformOrigin: `${CX}px ${CY}px` }}
            />
            {/* Pulsing glow polygon */}
            <motion.polygon
                points={dataPath}
                fill="none"
                stroke="#10b981"
                strokeWidth={4}
                className="opacity-20"
                animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
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

        // Use a fixed reference to ensure consistency regardless of local time execution
        const now = new Date()
        now.setHours(12, 0, 0, 0)

        for (let i = 29; i >= 0; i--) {
            const d = new Date(now)
            d.setDate(d.getDate() - i)
            const dateStr = d.toISOString().split('T')[0]

            const dayEntries = entries.filter(e => e.createdAt.startsWith(dateStr))
            if (dayEntries.length === 0) {
                result.push({ date: dateStr, score: null })
                continue
            }

            const grades = dayEntries.map(e => extractFuelGrade(e.data['Notes'] || '')).filter((g): g is number => g !== null)
            if (grades.length > 0) {
                result.push({ date: dateStr, score: (grades.reduce((a, b) => a + b, 0) / grades.length) * 10 })
                continue
            }

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
            <div className="flex flex-wrap gap-2">
                {days.map(({ date, score }) => {
                    const day = date.split('-')[2] // Keep original string for visual zero if intended
                    return (
                        <div
                            key={date}
                            className="relative group w-8 h-8 rounded border border-white/5 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:z-10 bg-white/[0.02] backdrop-blur-sm shadow-lg overflow-hidden"
                            style={{ 
                                backgroundColor: score !== null ? `${fuelColor(score)}44` : 'transparent',
                                borderColor: score !== null ? `${fuelColor(score)}88` : 'rgba(255,255,255,0.05)'
                            }}
                        >
                            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundColor: fuelColor(score) }} />
                            <span className="relative z-10 text-[9px] font-mono text-white/60 group-hover:text-white transition-colors">{day}</span>
                            
                            {/* Score Glow Effect */}
                            {score !== null && (
                                <div className="absolute inset-[-4px] blur-md opacity-0 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: fuelColor(score) }} />
                            )}

                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 backdrop-blur-md border border-white/20 rounded-lg text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-20 shadow-2xl">
                                <div className="font-semibold text-white/50 mb-0.5">{date}</div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fuelColor(score) }} />
                                    {score !== null ? `${Math.round(score)}% Quality` : 'No Log Data'}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
            {/* Legend */}
            <div className="flex items-center gap-4 mt-5 py-3 px-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-[9px] text-white/40">
                {[
                    { color: '#f87171', label: 'CRITICAL' },
                    { color: '#f59e0b', label: 'AVERAGE' },
                    { color: '#84cc16', label: 'OPTIMAL' },
                    { color: '#10b981', label: 'PEAK' },
                    { color: '#ffffff0a', label: 'NULL' },
                ].map(({ color, label }) => (
                    <div key={label} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-sm border border-white/10 shadow-[0_0_8px_rgba(255,255,255,0.05)]" style={{ backgroundColor: color }} />
                        <span className="tracking-widest uppercase opacity-70 font-bebas">{label}</span>
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
        <div className="group space-y-2">
            <div className="flex justify-between text-[11px]">
                <span className="text-white/40 uppercase tracking-[0.2em] font-bebas group-hover:text-white/70 transition-colors">{label}</span>
                <span className="text-white font-mono font-bold tracking-tighter" style={{ color }}>{value.toFixed(2)} {unit}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
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
            <div className="relative p-6 rounded-2xl bg-white/[0.02] border border-white/5 overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between text-[10px] mb-3 items-end">
                    <div>
                        <p className="text-white/30 uppercase tracking-[0.2em] font-bebas">Identity Horizon</p>
                        <p className="text-lg font-bebas text-white tracking-widest leading-none mt-1">{(progress * 100).toFixed(0)}% PROGRESS</p>
                    </div>
                    <span className="text-emerald-400 font-mono text-xs font-bold bg-emerald-500/10 px-2 py-0.5 rounded">TARGET ACQUISITION</span>
                </div>
                <div className="h-4 bg-white/5 rounded-full overflow-hidden relative border border-white/10 p-0.5">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 relative shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress * 100}%` }}
                        transition={{ duration: 1.5, ease: 'circOut' }}
                    >
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.3)_50%,transparent_100%)] animate-[scan_2s_linear_infinite]" />
                    </motion.div>
                    {/* Target marker */}
                    <div className="absolute top-0 right-0 h-full w-0.5 bg-white/20 z-10 shadow-[0_0_10px_white]" />
                </div>
                <div className="flex justify-between text-[10px] text-white/20 mt-3 font-mono">
                    <div className="flex flex-col">
                        <span>INITIATION</span>
                        <span className="text-white/40">{startWeight} KG</span>
                    </div>
                    <div className="flex flex-col text-right">
                        <span>OBJECTIVE</span>
                        <span className="text-white/40">{target} KG</span>
                    </div>
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
        const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0]
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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="space-y-8 mt-12 pb-12">

            {/* ─── Modern HUD Header ── */}
            <div className="flex flex-col md:flex-row md:items-center gap-8 bg-white/[0.03] backdrop-blur-md border border-white/10 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />
                
                <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                        {identity.goal_key === 'pro_basketball' ? '🏀' : identity.goal_key === 'weight_loss' ? '⚖️' : identity.goal_key === 'muscle_gain' ? '💪' : identity.goal_key === 'athletic_performance' ? '🏃' : '🌱'}
                    </div>
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-bebas">Primary Objective</p>
                        <p className="text-3xl font-bebas text-white tracking-widest mt-1 group-hover:text-emerald-400 transition-colors duration-500">{identity.goal_label}</p>
                    </div>
                </div>

                <div className="hidden md:block h-12 w-px bg-white/10 mx-4" />

                <div className="flex-1 space-y-2 relative z-10">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/30 font-bebas">
                        <span>Metabolism Integrity</span>
                        <span className={`font-mono text-sm font-bold ${fuelColor}`}>{Math.round(fuelScore)}%</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            className="h-full bg-gradient-to-r from-transparent to-current"
                            style={{ width: `${fuelScore}%`, color: fuelScore >= 80 ? '#10b981' : fuelScore >= 40 ? '#f59e0b' : '#f87171' }}
                            initial={{ width: 0 }}
                            animate={{ width: `${fuelScore}%` }}
                            transition={{ duration: 1.5, ease: 'circOut' }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bebas">Current Status</p>
                        <p className="text-xl font-mono text-white font-bold leading-none mt-1 uppercase tracking-tighter">OPERATIONAL</p>
                    </div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]" />
                </div>
            </div>

            {/* ─── Functional Modules ── */}
            <div className="grid lg:grid-cols-2 gap-8">

                {/* Tactical Radar */}
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-4 right-8 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500/40" />
                        <span className="text-[9px] uppercase tracking-[0.2em] text-white/20 font-bebas">Signal: Strong</span>
                    </div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bebas mb-8">Biometric Radar Profile</p>
                    <div className="flex justify-center py-4 relative">
                        {/* Circular glow background */}
                        <div className="absolute inset-0 bg-emerald-500/5 rounded-full blur-[80px] scale-75" />
                        <IdentityRadar values={radarValues} />
                    </div>
                    <div className="grid grid-cols-5 gap-4 mt-10 pt-8 border-t border-white/5">
                        {AXES.map((label, i) => (
                            <div key={label} className="text-center group/item hover:scale-110 transition-transform cursor-default">
                                <span className="text-[9px] text-white/30 uppercase font-bebas tracking-widest">{label}</span>
                                <div className="text-lg font-mono font-bold text-emerald-400 tracking-tighter mt-1">{radarValues[i].toFixed(1)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Metabolic History Map */}
                <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl relative overflow-hidden group">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bebas mb-8">Fuel Consumption Matrix · 30D</p>
                    <FuelHeatmap entries={dietEntries} staples={identity.staple_list} />
                    
                    {/* Inventory chips */}
                    {identity.staple_list.length > 0 && (
                        <div className="mt-8 pt-8 border-t border-white/5">
                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 font-bebas mb-4">Core Logistic Inventory (Staples)</p>
                            <div className="flex flex-wrap gap-2">
                                {identity.staple_list.slice(0, 8).map((s, i) => (
                                    <span key={i} className={`text-[10px] font-mono px-3 py-1.5 rounded-lg border transition-all duration-300 cursor-default hover:bg-white/5
                                        ${s.priority === 'high' ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'border-white/10 text-white/40'}`}>
                                        {s.name.toUpperCase()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ─── Identity Expansion ── */}
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 shadow-2xl group relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/5 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2" />
                
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                        <TrendingUp className="w-5 h-5 text-teal-400" />
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.3em] text-white/40 font-bebas">Trajectory Perspective</p>
                        <p className="text-lg text-white font-bebas tracking-widest mt-0.5 uppercase">Identity Horizon Scanner</p>
                    </div>
                    <div className="ml-auto text-right font-mono">
                        <span className="text-xl font-bold text-white tracking-tighter">{identity.current_weight_kg}</span>
                        <span className="text-[10px] text-white/40 ml-1 uppercase">KG CURRENT</span>
                    </div>
                </div>
                <IdentityHorizon identity={identity} weightHistory={weightHistory} />
            </div>

        </motion.div>
    )
}
