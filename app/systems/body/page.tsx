'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { dataStore, Entry, System } from '@/lib/data-store'
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
        <div className="min-h-screen bg-[#030303] text-white relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.15),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(74,222,128,0.12),transparent_25%),radial-gradient(circle_at_40%_80%,rgba(59,130,246,0.12),transparent_30%)]" />
                <div className="absolute inset-0 opacity-[0.03]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="body-grid" width="90" height="90" patternUnits="userSpaceOnUse">
                                <path d="M 90 0 L 0 0 0 90" fill="none" stroke="white" strokeWidth="0.6" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#body-grid)" />
                    </svg>
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
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/0 pointer-events-none" />
                            <div className="flex flex-wrap items-center gap-3 text-emerald-200">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-xs uppercase tracking-[0.3em] text-white/60">Athletic OS · Body</span>
                            </div>
                            <h1 className={`${playfair.className} text-5xl font-bold mt-4 mb-3`}>
                                Build + Recover + Fuel without friction
                            </h1>
                            <p className={`${inter.className} text-lg text-white/70 max-w-3xl`}>
                                Three linked microapps: design a weekly block, auto-log a reset, and drop in fuel presets. Zero boring forms, lots of tactile moves.
                            </p>
                            <div className="mt-6 flex flex-wrap gap-3">
                                <Button asChild className="bg-white text-black hover:bg-white/90">
                                    <Link href="/systems/body/routine-builder">Open Routine Builder</Link>
                                </Button>
                                <Button variant="outline" disabled={isSaving} onClick={() => handleRecoveryPreset('mobility')}>
                                    <Wind className="w-4 h-4" />
                                    Quick recovery
                                </Button>
                                <Button variant="ghost" className="border border-white/10 bg-white/5" disabled={isSaving} onClick={handleRoutineTemplate}>
                                    <Zap className="w-4 h-4" />
                                    Drop a template
                                </Button>
                            </div>
                        </div>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    Tactical snapshot
                                    <Activity className="w-5 h-5 text-white/60" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-red-200">Next session</p>
                                    <p className="text-2xl font-bold mt-2">{nextSession ? new Date(nextSession).toLocaleDateString() : 'Set it'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Plan / wk</p>
                                    <p className="text-2xl font-bold mt-2">{avgWeeklySessions || '—'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Readiness</p>
                                    <p className="text-2xl font-bold mt-2">{readinessAvg ? readinessAvg : 'Calibrate'}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-sky-200">Fuel today</p>
                                    <p className="text-2xl font-bold mt-2">{caloriesToday ? `${caloriesToday.toFixed(0)} kcal` : 'Tap a preset'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10 overflow-hidden">
                            <CardHeader className="flex items-center gap-2">
                                <Dumbbell className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Routine Builder</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-3 gap-3">
                                    <button
                                        onClick={handleRoutineTemplate}
                                        disabled={isSaving}
                                        className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60 mb-1">
                                            <Zap className="w-4 h-4" /> Template
                                        </div>
                                        <p className="text-white font-semibold">Power x Build week</p>
                                        <p className="text-white/60 text-sm">5 sessions · mixed blocks</p>
                                    </button>
                                    <Link
                                        href="/systems/body/routine-builder?new=1"
                                        className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-left hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-white/60 mb-1">
                                            <Flame className="w-4 h-4" /> Sprint
                                        </div>
                                        <p className="text-white font-semibold">Design a microcycle</p>
                                        <p className="text-white/60 text-sm">Track splits, equipment, and blocks.</p>
                                    </Link>
                                    <Link
                                        href="/systems/body/routine-builder"
                                        className="rounded-xl border border-white/15 bg-black/40 px-4 py-3 text-left hover:border-white/40 transition"
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
                                            <div key={plan.id} className="rounded-2xl border border-white/10 bg-black/30 p-4">
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

                        <Card className="bg-white/5 border-white/10 overflow-hidden">
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
                                            className="rounded-xl border border-white/10 bg-black/30 px-4 py-3 hover:border-white/40 transition"
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

                        <Card className="bg-white/5 border-white/10 overflow-hidden">
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
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
                                        <p className="text-xs uppercase tracking-[0.2em] text-white/50">Today</p>
                                        <p className="text-3xl font-bold text-white mt-2">{caloriesToday ? `${caloriesToday.toFixed(0)} kcal` : 'Log one'}</p>
                                        <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/70">
                                            <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Protein: {proteinToday ? `${proteinToday.toFixed(0)}g` : '—'}</span>
                                            <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Hydration: {hydrationToday ? `${hydrationToday} glasses` : '—'}</span>
                                        </div>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
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
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex items-center gap-2">
                                <Brain className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Live deck</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 to-transparent p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs uppercase tracking-[0.2em] text-white/50">Up next</p>
                                            <p className="text-2xl font-bold text-white">{nextSession ? new Date(nextSession).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Set a date'}</p>
                                            <p className="text-white/60 text-sm">{routineEntries[0]?.data['Program Name'] || 'Routine builder'}</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center text-white/70">
                                            <Clock3 className="w-7 h-7" />
                                        </div>
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Readiness trend</p>
                                    <p className="text-2xl font-bold text-white mt-2">{readinessAvg ? `${readinessAvg}/10` : 'Add a reset'}</p>
                                    <p className="text-white/60 text-sm">Use quick recovery hits to keep this high.</p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-white/50">Fuel & hydration</p>
                                    <div className="mt-3 flex flex-wrap gap-2 text-sm text-white/70">
                                        <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Protein today: {proteinToday ? `${proteinToday.toFixed(0)}g` : '—'}</span>
                                        <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Hydration: {hydrationToday ? `${hydrationToday} glasses` : '—'}</span>
                                        <span className="px-3 py-1 rounded-full border border-white/15 bg-white/5">Entries: {dietEntries.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Microapps</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {system.microapps.map((microapp) => (
                                    <div key={microapp.id} className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-black/40">
                                        <div className="text-2xl">{microapp.icon}</div>
                                        <div className="flex-1">
                                            <p className="text-white font-semibold">{microapp.name}</p>
                                            <p className="text-white/60 text-sm">{microapp.description}</p>
                                        </div>
                                        <span className="text-xs text-white/60 uppercase tracking-[0.2em]">{entries[microapp.id]?.length || 0} items</span>
                                        <div className="flex gap-2">
                                            <Button asChild size="sm" variant="outline">
                                                <Link href={`/systems/body/${microapp.id}`}>Open</Link>
                                            </Button>
                                            <Button asChild size="sm" variant="ghost" className="border border-white/10 bg-white/5">
                                                <Link href={`/systems/body/${microapp.id}?new=1`}>Create</Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
