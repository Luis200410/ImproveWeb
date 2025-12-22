'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { dataStore, Entry, System, type FitnessGoal } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Activity, ArrowLeft, Brain, ChefHat, Clock3, Droplets, Dumbbell, Flame, HeartPulse, Leaf, Moon, Sparkles, Wind, Zap } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })
type RecoveryPreset = 'mobility' | 'heat' | 'walk'
type DietPreset = 'shake' | 'balanced' | 'nightcap'

export default function BodyPage() {
    const [system, setSystem] = useState<System | null>(null)
    const [entries, setEntries] = useState<Record<string, Entry[]>>({})
    const [userId, setUserId] = useState<string>('defaultUser')
    const [isSaving, setIsSaving] = useState(false)
    const [goals, setGoals] = useState<FitnessGoal[]>([])
    const [goalText, setGoalText] = useState('')
    const [goalTimeframe, setGoalTimeframe] = useState('8 weeks')
    const [goalPriority, setGoalPriority] = useState<'Low' | 'Medium' | 'High'>('High')

    useEffect(() => {
        const bodySystem = dataStore.getSystem('body')
        setSystem(bodySystem || null)
    }, [])

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()
    }, [])

    const refreshEntries = useCallback(async () => {
        if (!system) return
        const map: Record<string, Entry[]> = {}
        await Promise.all(system.microapps.map(async (microapp) => {
            const list = await dataStore.getEntries(microapp.id, userId)
            map[microapp.id] = list
        }))
        setEntries(map)
    }, [system, userId])

    useEffect(() => {
        refreshEntries()
    }, [refreshEntries])

    const refreshGoals = useCallback(async () => {
        if (!userId) return
        const list = await dataStore.getFitnessGoals(userId)
        setGoals(list)
    }, [userId])

    useEffect(() => {
        refreshGoals()
    }, [refreshGoals])

    const numeric = (value: any) => {
        const num = Number(value)
        return Number.isFinite(num) ? num : 0
    }

    const today = new Date().toISOString().split('T')[0]

    const routineEntries = entries['routine-builder'] || []
    const recoveryEntries = entries['recovery'] || []
    const dietEntries = entries['diet'] || []

    const nextSession = useMemo(() => {
        const futureDates = routineEntries
            .map(r => r.data['Next Session'])
            .filter(Boolean)
            .map((d: string) => d)
            .filter(d => d >= today)
            .sort()
        return futureDates[0]
    }, [routineEntries, today])

    const avgWeeklySessions = useMemo(() => {
        if (routineEntries.length === 0) return 0
        const total = routineEntries.reduce((sum, r) => sum + numeric(r.data['Sessions / Week']), 0)
        return Math.round((total / routineEntries.length) * 10) / 10
    }, [routineEntries])

    const readinessAvg = useMemo(() => {
        if (recoveryEntries.length === 0) return 0
        const total = recoveryEntries.reduce((sum, r) => sum + numeric(r.data['Readiness (1-10)']), 0)
        return Math.round((total / recoveryEntries.length) * 10) / 10
    }, [recoveryEntries])

    const caloriesToday = useMemo(() => {
        return dietEntries
            .filter(d => (d.data['Date'] || '').startsWith(today))
            .reduce((sum, d) => sum + numeric(d.data['Calories']), 0)
    }, [dietEntries, today])

    const proteinToday = useMemo(() => {
        return dietEntries
            .filter(d => (d.data['Date'] || '').startsWith(today))
            .reduce((sum, d) => sum + numeric(d.data['Protein (g)']), 0)
    }, [dietEntries, today])

    const hydrationToday = useMemo(() => {
        return dietEntries
            .filter(d => (d.data['Date'] || '').startsWith(today))
            .reduce((sum, d) => sum + numeric(d.data['Hydration (glasses)']), 0)
    }, [dietEntries, today])

    const parseBlocks = (value: any) => {
        if (Array.isArray(value)) return value
        if (typeof value === 'string') {
            try {
                const parsed = JSON.parse(value)
                return Array.isArray(parsed) ? parsed : []
            } catch (e) {
                return []
            }
        }
        return []
    }

    const handleRoutineTemplate = async () => {
        if (!system) return
        setIsSaving(true)
        const todayDate = new Date().toISOString().split('T')[0]
        try {
            await dataStore.addEntry(userId, 'routine-builder', {
                'Program Name': 'Power x Build Sprint',
                Goal: 'Athleticism',
                Split: 'Hybrid',
                'Sessions / Week': 5,
                'Session Length (min)': 65,
                'Next Session': todayDate,
                'Equipment Tier': 'Gym',
                Blocks: [
                    { block: 'Priming', minutes: 8, note: 'Mobility + breath' },
                    { block: 'Power', sets: 3, note: 'Jumps / throws' },
                    { block: 'Strength', sets: 5, note: 'Main lift + accessory' },
                    { block: 'Conditioning', minutes: 12, note: 'Bike / sled finisher' }
                ],
                Notes: 'Auto-built template. Swap blocks or drag inside the microapp.'
            })
            await refreshEntries()
        } finally {
            setIsSaving(false)
        }
    }

    const handleAddGoal = async () => {
        if (!goalText.trim() || !userId) return
        setIsSaving(true)
        try {
            await dataStore.saveFitnessGoal({
                userId,
                goal: goalText.trim(),
                timeframe: goalTimeframe,
                priority: goalPriority
            })
            setGoalText('')
            await refreshGoals()
        } finally {
            setIsSaving(false)
        }
    }

    const handleRecoveryPreset = async (type: RecoveryPreset) => {
        if (!system) return
        setIsSaving(true)
        const todayDate = new Date().toISOString().split('T')[0]
        const presets: Record<RecoveryPreset, Record<string, any>> = {
            mobility: {
                Date: todayDate,
                Modality: 'Mobility',
                'Focus Area': 'Hips',
                'Duration (min)': 12,
                'Readiness (1-10)': 7,
                Intensity: 'Low',
                'Sleep Hours': 0,
                Notes: 'Hip cars + 90/90 transitions + breathing reset.'
            },
            heat: {
                Date: todayDate,
                Modality: 'Cold / Heat',
                'Focus Area': 'Full Body',
                'Duration (min)': 14,
                'Readiness (1-10)': 6,
                Intensity: 'Medium',
                'Sleep Hours': 0,
                Notes: '3x sauna + cold alternation; finish with nasal breathing.'
            },
            walk: {
                Date: todayDate,
                Modality: 'Walk',
                'Focus Area': 'Mind',
                'Duration (min)': 20,
                'Readiness (1-10)': 8,
                Intensity: 'Low',
                'Sleep Hours': 0,
                Notes: 'Sunlight loop, slow exhales, no phone.'
            }
        }
        try {
            await dataStore.addEntry(userId, 'recovery', presets[type])
            await refreshEntries()
        } finally {
            setIsSaving(false)
        }
    }

    const handleDietPreset = async (preset: DietPreset) => {
        if (!system) return
        setIsSaving(true)
        const todayDate = new Date().toISOString().split('T')[0]
        const presets: Record<DietPreset, Record<string, any>> = {
            shake: {
                Date: todayDate,
                Meal: 'Shake',
                'Plate Build': 'Protein-only snack',
                Calories: 320,
                'Protein (g)': 38,
                'Carbs (g)': 18,
                'Fats (g)': 8,
                'Prep Time (min)': 3,
                'Mood After': 'Light & ready',
                'Hydration (glasses)': 1,
                Notes: 'Whey + berries + flax; quick recovery hit.'
            },
            balanced: {
                Date: todayDate,
                Meal: 'Lunch',
                'Plate Build': 'Balanced plate',
                Calories: 620,
                'Protein (g)': 42,
                'Carbs (g)': 60,
                'Fats (g)': 18,
                'Prep Time (min)': 10,
                'Mood After': 'Balanced',
                'Hydration (glasses)': 1,
                Notes: 'Grilled chicken, rice, avocado, greens.'
            },
            nightcap: {
                Date: todayDate,
                Meal: 'Snack',
                'Plate Build': 'Plant-forward',
                Calories: 250,
                'Protein (g)': 18,
                'Carbs (g)': 22,
                'Fats (g)': 9,
                'Prep Time (min)': 5,
                'Mood After': 'Sleepy',
                'Hydration (glasses)': 1,
                Notes: 'Greek yogurt + tart cherry + seeds.'
            }
        }
        try {
            await dataStore.addEntry(userId, 'diet', presets[preset])
            await refreshEntries()
        } finally {
            setIsSaving(false)
        }
    }

    if (!system) return null

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-black to-black" />
                <div className="absolute -left-16 top-24 w-[520px] h-[520px] bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.12),transparent_50%)] blur-3xl" />
                <div className="absolute right-[-120px] top-32 w-[480px] h-[480px] bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.06),transparent_50%)] blur-3xl" />
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
            </div>

            <Navigation />
            <div className="h-16" />

            <div className="max-w-7xl mx-auto px-6 pb-14 relative z-10 space-y-10">
                <div className="flex items-center gap-3 text-white/60">
                    <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="uppercase tracking-[0.3em] text-xs">Body System</span>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-start"
                >
                    <div className="space-y-6">
                        <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.04] p-8 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                            <div className="flex flex-wrap items-center gap-3 text-emerald-200 relative z-10">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-xs uppercase tracking-[0.32em] text-white/70">Athletic OS · Body</span>
                            </div>
                            <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold mt-4 mb-3 text-white relative z-10`}>
                                Build + Recover + Fuel without friction
                            </h1>
                            <p className={`${inter.className} text-lg text-white/75 max-w-3xl relative z-10`}>
                                Three linked microapps: design a weekly block, auto-log a reset, and drop in fuel presets. Zero boring forms, lots of tactile moves.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                                <Button asChild className="bg-white text-black hover:bg-white/90">
                                    <Link href="/systems/body/routine-builder">Open Routine Builder</Link>
                                </Button>
                                <Button variant="outline" className="border-white/40 text-white hover:bg-white/10" disabled={isSaving} onClick={() => handleRecoveryPreset('mobility')}>
                                    <Wind className="w-4 h-4" />
                                    Quick recovery
                                </Button>
                                <Button variant="ghost" className="border border-white/12 bg-white/5 text-white hover:border-white/40" disabled={isSaving} onClick={handleRoutineTemplate}>
                                    <Zap className="w-4 h-4" />
                                    Drop a template
                                </Button>
                                <Button asChild variant="ghost" className="border border-white/12 bg-white/5 text-white hover:border-white/40">
                                    <Link href="/systems/body/library">
                                        Browse Library
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <Card className="bg-white/[0.05] border-white/10 backdrop-blur-md shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    Tactical snapshot
                                    <Activity className="w-5 h-5 text-white/60" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-5 rounded-2xl border border-white/12 bg-white/[0.04]">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Next session</p>
                                    <p className="text-3xl font-bold mt-2">{nextSession ? new Date(nextSession).toLocaleDateString() : 'Set it'}</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-white/12 bg-white/[0.04]">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Plan / wk</p>
                                    <p className="text-3xl font-bold mt-2">{avgWeeklySessions || '—'}</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-white/12 bg-white/[0.04]">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Readiness</p>
                                    <p className="text-3xl font-bold mt-2">{readinessAvg ? readinessAvg : 'Calibrate'}</p>
                                </div>
                                <div className="p-5 rounded-2xl border border-white/12 bg-white/[0.04]">
                                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/60">Fuel today</p>
                                    <p className="text-3xl font-bold mt-2">{caloriesToday ? `${caloriesToday.toFixed(0)} kcal` : 'Tap a preset'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.05] border-white/12 overflow-hidden backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader className="flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Routine Builder</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-3">
                                    <button
                                        onClick={handleRoutineTemplate}
                                        disabled={isSaving}
                                        className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60 mb-1">
                                            <Zap className="w-4 h-4" /> Template
                                        </div>
                                        <p className="text-white font-semibold">Power x Build week</p>
                                        <p className="text-white/60 text-sm">5 sessions · mixed blocks</p>
                                    </button>
                                    <Link
                                        href="/systems/body/routine-builder?new=1"
                                        className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60 mb-1">
                                            <Flame className="w-4 h-4" /> Sprint
                                        </div>
                                        <p className="text-white font-semibold">Design a microcycle</p>
                                        <p className="text-white/60 text-sm">Track splits, equipment, and blocks.</p>
                                    </Link>
                                    <Link
                                        href="/systems/body/routine-builder"
                                        className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60 mb-1">
                                            <Clock3 className="w-4 h-4" /> Timeline
                                        </div>
                                        <p className="text-white font-semibold">Review the block</p>
                                        <p className="text-white/60 text-sm">See sessions, lengths, and next date.</p>
                                    </Link>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {(routineEntries || []).slice(0, 2).map((plan) => {
                                        const blocks = parseBlocks(plan.data['Blocks'])
                                        return (
                                            <div key={plan.id} className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">{plan.data['Split'] || 'Custom split'}</p>
                                                        <p className="text-xl font-semibold text-white">{plan.data['Program Name'] || 'Unnamed program'}</p>
                                                    </div>
                                                    <span className="text-white/60 text-sm">{plan.data['Goal'] || 'Goal'}</span>
                                                </div>
                                                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/60">
                                                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Sessions/wk: {plan.data['Sessions / Week'] || '—'}</span>
                                                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Length: {plan.data['Session Length (min)'] || '—'}m</span>
                                                    <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">{blocks.length} blocks</span>
                                                </div>
                                                {blocks.length > 0 && (
                                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                                        {blocks.slice(0, 4).map((block, idx) => (
                                                            <div key={idx} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80">
                                                                <p className="font-semibold">{block.block || 'Block'}</p>
                                                                <p className="text-white/60">
                                                                    {block.minutes ? `${block.minutes} min` : ''}{block.sets ? `${block.sets} sets` : ''} {block.note ? `· ${block.note}` : ''}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {(routineEntries || []).length === 0 && (
                                        <div className="text-white/60 text-sm">No routines yet. Drop a template to start fast.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.05] border-white/12 overflow-hidden backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader className="flex items-center gap-2">
                                <HeartPulse className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Recovery</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleRecoveryPreset('mobility')}
                                        disabled={isSaving}
                                        className="rounded-xl border border-white/15 bg-gradient-to-br from-emerald-500/15 to-teal-500/10 px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 mb-1">
                                            <Leaf className="w-4 h-4" /> Mobility hit
                                        </div>
                                        <p className="text-white font-semibold">12m hips + breath</p>
                                        <p className="text-white/60 text-sm">Logs instantly.</p>
                                    </button>
                                    <button
                                        onClick={() => handleRecoveryPreset('heat')}
                                        disabled={isSaving}
                                        className="rounded-xl border border-white/15 bg-gradient-to-br from-orange-500/15 to-red-500/10 px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 mb-1">
                                            <Flame className="w-4 h-4" /> Heat / cold
                                        </div>
                                        <p className="text-white font-semibold">14m alternation</p>
                                        <p className="text-white/60 text-sm">Save the reset.</p>
                                    </button>
                                    <button
                                        onClick={() => handleRecoveryPreset('walk')}
                                        disabled={isSaving}
                                        className="rounded-xl border border-white/15 bg-gradient-to-br from-sky-500/15 to-blue-500/10 px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 mb-1">
                                            <Wind className="w-4 h-4" /> Walk loop
                                        </div>
                                        <p className="text-white font-semibold">20m sunlight</p>
                                        <p className="text-white/60 text-sm">Calm + movement.</p>
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                    {(recoveryEntries || []).slice(0, 4).map((rec) => (
                                        <Link
                                            key={rec.id}
                                            href={`/systems/body/recovery?id=${rec.id}`}
                                            className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3 hover:border-white/40 transition"
                                        >
                                            <div className="flex items-center justify-between text-white">
                                                <span className="font-semibold">{rec.data['Modality'] || 'Recovery'}</span>
                                                <span className="text-sm text-white/60">{rec.data['Duration (min)'] ? `${rec.data['Duration (min)']}m` : ''}</span>
                                            </div>
                                            <p className="text-xs text-white/50">{rec.data['Focus Area'] || 'Full body'} · {rec.data['Readiness (1-10)'] ? `R${rec.data['Readiness (1-10)']}` : 'rate it'}</p>
                                        </Link>
                                    ))}
                                    {(recoveryEntries || []).length === 0 && (
                                        <div className="text-white/60 text-sm">No recovery logs yet. One tap above will create your first.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.05] border-white/12 overflow-hidden backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.45)]">
                            <CardHeader className="flex items-center gap-2">
                                <ChefHat className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Diet</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid sm:grid-cols-3 gap-3">
                                    <button
                                        onClick={() => handleDietPreset('shake')}
                                        disabled={isSaving}
                                        className="rounded-xl border border-white/15 bg-gradient-to-br from-green-500/15 to-emerald-500/10 px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 mb-1">
                                            <Droplets className="w-4 h-4" /> Shake
                                        </div>
                                        <p className="text-white font-semibold">38g protein</p>
                                        <p className="text-white/60 text-sm">3 min · logs now</p>
                                    </button>
                                    <button
                                        onClick={() => handleDietPreset('balanced')}
                                        disabled={isSaving}
                                        className="rounded-xl border border-white/15 bg-gradient-to-br from-blue-500/15 to-cyan-500/10 px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 mb-1">
                                            <Activity className="w-4 h-4" /> Training plate
                                        </div>
                                        <p className="text-white font-semibold">620 kcal, 42p</p>
                                        <p className="text-white/60 text-sm">balanced plate</p>
                                    </button>
                                    <button
                                        onClick={() => handleDietPreset('nightcap')}
                                        disabled={isSaving}
                                        className="rounded-xl border border-white/15 bg-gradient-to-br from-indigo-500/15 to-slate-500/10 px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/70 mb-1">
                                            <Moon className="w-4 h-4" /> Night cap
                                        </div>
                                        <p className="text-white font-semibold">Tart cherry + protein</p>
                                        <p className="text-white/60 text-sm">sleep-friendly</p>
                                    </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Today</p>
                                        <p className="text-3xl font-bold text-white mt-2">{caloriesToday ? `${caloriesToday.toFixed(0)} kcal` : 'Log one'}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/70">
                                            <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Protein: {proteinToday ? `${proteinToday.toFixed(0)}g` : '—'}</span>
                                            <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Hydration: {hydrationToday ? `${hydrationToday} glasses` : '—'}</span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Latest</p>
                                        {dietEntries[0] ? (
                                            <div className="mt-2">
                                                <p className="text-xl font-semibold text-white">{dietEntries[0].data['Meal'] || 'Meal'}</p>
                                                <p className="text-white/60 text-sm">{dietEntries[0].data['Plate Build'] || 'Plate'} · {dietEntries[0].data['Calories'] ? `${dietEntries[0].data['Calories']} kcal` : 'No calories'}</p>
                                            </div>
                                        ) : (
                                            <p className="text-white/60 text-sm mt-2">No meals logged yet.</p>
                                        )}
                                        <div className="mt-3 flex gap-2">
                                            <Button asChild variant="outline" size="sm">
                                                <Link href="/systems/body/diet?new=1">Log custom</Link>
                                            </Button>
                                            <Button asChild variant="ghost" size="sm" className="border border-white/15 bg-white/5">
                                                <Link href="/systems/body/diet">Open diet app</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="bg-white/[0.05] border-white/12 backdrop-blur-md shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                            <CardHeader className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Goals (for AI plans)</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3">
                                    <label className="text-xs uppercase tracking-[0.25em] text-white/50 block">Goal</label>
                                    <input
                                        value={goalText}
                                        onChange={(e) => setGoalText(e.target.value)}
                                        placeholder="e.g. Run a sub-22 5k while gaining strength"
                                        className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-[0.2em] text-white/50 block">Timeframe</label>
                                            <input
                                                value={goalTimeframe}
                                                onChange={(e) => setGoalTimeframe(e.target.value)}
                                                className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-white placeholder:text-white/30 focus:border-white/40 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs uppercase tracking-[0.2em] text-white/50 block">Priority</label>
                                            <select
                                                value={goalPriority}
                                                onChange={(e) => setGoalPriority(e.target.value as 'Low' | 'Medium' | 'High')}
                                                className="w-full rounded-xl bg-white/5 border border-white/15 px-3 py-2 text-white focus:border-white/40 outline-none"
                                            >
                                                <option value="High">High</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Low">Low</option>
                                            </select>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={handleAddGoal}
                                        disabled={!goalText.trim() || isSaving}
                                        className="bg-white text-black hover:bg-white/90"
                                    >
                                        Save goal
                                    </Button>
                                    <p className="text-xs text-white/45">
                                        Capture intent now; the AI builder will turn these into custom routines soon.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">Saved goals</p>
                                    {goals.slice(0, 4).map(goal => (
                                        <div key={goal.id} className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-3">
                                            <p className="text-white">{goal.goal}</p>
                                            <div className="mt-2 flex items-center gap-2 text-xs text-white/50">
                                                {goal.timeframe && <span className="px-2 py-1 rounded-full border border-white/15">{goal.timeframe}</span>}
                                                {goal.priority && <span className="px-2 py-1 rounded-full border border-white/15">Priority: {goal.priority}</span>}
                                            </div>
                                        </div>
                                    ))}
                                    {goals.length === 0 && (
                                        <p className="text-white/50 text-sm">No goals yet—add one to prep the AI builder.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
