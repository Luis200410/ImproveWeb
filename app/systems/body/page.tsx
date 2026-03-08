'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { dataStore, Entry, System } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { ArrowLeft, ChefHat, HeartPulse, ScanLine, Sparkles, Target } from 'lucide-react'
import { IdentitySetupSheet } from '@/components/body/identity-setup-sheet'
import { BodyAnalytics } from '@/components/body/body-analytics'
import { TodaySessionCard } from '@/components/body/today-session-card'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function BodyPage() {
    const [system, setSystem] = useState<System | null>(null)
    const [entries, setEntries] = useState<Record<string, Entry[]>>({})
    const [userId, setUserId] = useState<string>('defaultUser')
    const [identityReady, setIdentityReady] = useState(false)
    const [showSetup, setShowSetup] = useState(false)
    const [macroTargets, setMacroTargets] = useState<{ calories: number; protein_g: number; carbs_g: number; fat_g: number } | null>(null)

    useEffect(() => {
        const bodySystem = dataStore.getSystem('body')
        setSystem(bodySystem || null)
    }, [])

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const uid = user?.id || 'defaultUser'
            setUserId(uid)
            if (user?.id) {
                const [{ data: id }, { data: mt }] = await Promise.all([
                    supabase.from('body_identity').select('id').eq('user_id', uid).single(),
                    supabase.from('macro_targets').select('*').eq('user_id', uid).single(),
                ])
                setIdentityReady(!!id)
                if (!id) setShowSetup(true)
                if (mt) setMacroTargets({ calories: mt.calories, protein_g: mt.protein_g, carbs_g: mt.carbs_g, fat_g: mt.fat_g })
            }
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

    useEffect(() => { refreshEntries() }, [refreshEntries])

    const numeric = (value: any) => {
        const num = Number(value)
        return Number.isFinite(num) ? num : 0
    }

    const today = new Date().toISOString().split('T')[0]
    const recoveryEntries = entries['recovery'] || []
    const dietEntries = entries['diet'] || []

    const readinessAvg = useMemo(() => {
        if (recoveryEntries.length === 0) return 0
        const total = recoveryEntries.reduce((sum, r) => sum + numeric(r.data['Readiness (1-10)']), 0)
        return Math.round((total / recoveryEntries.length) * 10) / 10
    }, [recoveryEntries])

    const caloriesToday = useMemo(() => dietEntries
        .filter(d => (d.data['Date'] || '').startsWith(today))
        .reduce((sum, d) => sum + numeric(d.data['Calories']), 0),
        [dietEntries, today])

    const proteinToday = useMemo(() => dietEntries
        .filter(d => (d.data['Date'] || '').startsWith(today))
        .reduce((sum, d) => sum + numeric(d.data['Protein (g)']), 0),
        [dietEntries, today])

    const hydrationToday = useMemo(() => dietEntries
        .filter(d => (d.data['Date'] || '').startsWith(today))
        .reduce((sum, d) => sum + numeric(d.data['Hydration (glasses)']), 0),
        [dietEntries, today])

    if (!system) return null

    return (
        <div className="min-h-screen bg-black text-white relative overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-black to-black" />
                <div className="absolute left-[-200px] top-[-100px] w-[700px] h-[700px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.04),transparent_55%)] blur-3xl" />
                <div className="absolute right-[-120px] top-32 w-[480px] h-[480px] bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.06),transparent_50%)] blur-3xl" />
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.3)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
            </div>

            {/* Identity Setup Sheet — full-screen overlay on first use */}
            {showSetup && userId !== 'defaultUser' && (
                <IdentitySetupSheet
                    userId={userId}
                    onComplete={() => { setShowSetup(false); setIdentityReady(true) }}
                />
            )}

            <Navigation />
            <div className="h-16" />

            <div className="max-w-4xl mx-auto px-6 pb-14 relative z-10 space-y-10">
                {/* Breadcrumb */}
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
                    className="space-y-6"
                >
                    {/* ── Hero ── */}
                    <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-white/[0.04] p-8 shadow-[0_16px_50px_rgba(0,0,0,0.35)]">
                        <div className="flex flex-wrap items-center gap-3 text-emerald-200 relative z-10">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-xs uppercase tracking-[0.32em] text-white/70">Athletic OS · Body</span>
                        </div>
                        <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold mt-4 mb-3 text-white relative z-10`}>
                            Build + Recover + Fuel
                        </h1>
                        <p className={`${inter.className} text-lg text-white/55 max-w-2xl relative z-10`}>
                            Your AI-generated week plan is live. Log your session, scan your meals, track your recovery.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                            <Button asChild className="bg-emerald-500/90 hover:bg-emerald-500 text-black border-0 font-bold">
                                <Link href="/systems/body/macro-scanner">
                                    <ScanLine className="w-4 h-4" />
                                    Scan a Meal
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="border-white/25 text-white hover:bg-white/10">
                                <Link href="/systems/body/routine-builder">View Routine Log</Link>
                            </Button>
                        </div>
                    </div>

                    {/* ── 4-stat strip ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Readiness', value: readinessAvg ? String(readinessAvg) : '—', sub: '/10' },
                            { label: 'Fuel today', value: caloriesToday ? caloriesToday.toFixed(0) : '—', sub: 'kcal' },
                            { label: 'Protein', value: proteinToday ? proteinToday.toFixed(0) + 'g' : '—', sub: 'today' },
                            { label: 'Hydration', value: hydrationToday ? String(hydrationToday) : '—', sub: 'glasses' },
                        ].map(({ label, value, sub }) => (
                            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</p>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold text-white">{value}</span>
                                    {value !== '—' && <span className="text-xs text-white/35">{sub}</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Today's Session (AI week plan + exercise logger) ── */}
                    {identityReady && userId !== 'defaultUser' && (
                        <TodaySessionCard userId={userId} />
                    )}

                    {/* ── Recovery last log ── */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <HeartPulse className="w-4 h-4 text-white/40" />
                                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Recovery</span>
                            </div>
                            <Link href="/systems/body/recovery" className="text-[11px] text-white/30 hover:text-white transition">
                                View log →
                            </Link>
                        </div>
                        {recoveryEntries[0] ? (
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-semibold">{recoveryEntries[0].data['Modality'] || 'Recovery'}</p>
                                    <p className="text-xs text-white/40 mt-0.5">{recoveryEntries[0].data['Focus Area']} · {recoveryEntries[0].data['Duration (min)']}m</p>
                                </div>
                                <div className={`text-3xl font-bold ${Number(recoveryEntries[0].data['Readiness (1-10)']) >= 8 ? 'text-emerald-400'
                                        : Number(recoveryEntries[0].data['Readiness (1-10)']) >= 5 ? 'text-amber-400'
                                            : 'text-rose-400'
                                    }`}>
                                    {recoveryEntries[0].data['Readiness (1-10)'] || '—'}
                                    <span className="text-base text-white/30">/10</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-white/30 text-sm">No recovery logged yet. Log after today's session.</p>
                        )}
                    </div>

                    {/* ── Diet last meal ── */}
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <ChefHat className="w-4 h-4 text-white/40" />
                                <span className="text-xs uppercase tracking-[0.2em] text-white/40">Last Meal Scanned</span>
                            </div>
                            <Link href="/systems/body/diet" className="text-[11px] text-white/30 hover:text-white transition">
                                View log →
                            </Link>
                        </div>
                        {dietEntries[0] ? (
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-semibold truncate">{dietEntries[0].data['Meal'] || 'Scanned meal'}</p>
                                    <p className="text-xs text-white/40 mt-0.5 truncate">{dietEntries[0].data['Plate Build']}</p>
                                </div>
                                <div className="text-right shrink-0 ml-4">
                                    <div className="text-2xl font-bold text-emerald-300">{dietEntries[0].data['Calories']}</div>
                                    <div className="text-[10px] text-white/35">kcal</div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <p className="text-white/30 text-sm">No meals scanned yet.</p>
                                <Link href="/systems/body/macro-scanner"
                                    className="text-xs text-emerald-400 border border-emerald-500/30 rounded-full px-3 py-1 hover:bg-emerald-500/10 transition">
                                    Scan now →
                                </Link>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── Identity Analytics (radar, heatmap, horizon) ── */}
                {identityReady && userId !== 'defaultUser' && (
                    <>
                        <BodyAnalytics
                            userId={userId}
                            dietEntries={dietEntries}
                            recoveryEntries={recoveryEntries}
                            macroTargets={macroTargets}
                        />
                        <div className="flex justify-end pt-2">
                            <button
                                onClick={() => setShowSetup(true)}
                                className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition"
                            >
                                <Target className="w-3.5 h-3.5" />
                                Change Identity / Update Metrics
                            </button>
                        </div>
                    </>
                )}

                {/* ── Setup CTA (if identity not configured yet) ── */}
                {!identityReady && userId !== 'defaultUser' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center"
                    >
                        <p className="text-3xl mb-3">🎯</p>
                        <h3 className="text-white font-semibold mb-1">Set Your Identity</h3>
                        <p className="text-white/40 text-sm mb-4">Your goal defines how every meal is scored, how macros shift daily, and how your analytics radar is built.</p>
                        <button
                            onClick={() => setShowSetup(true)}
                            className="px-6 py-2.5 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/90 transition"
                        >
                            Configure My Identity
                        </button>
                    </motion.div>
                )}

            </div>
        </div>
    )
}
