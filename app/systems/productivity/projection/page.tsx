'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LIFE_AREAS, getLifeArea, LifeAreaId } from '@/lib/life-areas'
import { dataStore, LifeAreaGoal, MonthlyReflection } from '@/lib/data-store'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Star, Target, Flame, BookOpen, X, Zap } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AreaRating {
    areaId: string
    rating: number | null
}

// ─── Big Four Banner ──────────────────────────────────────────────────────────

function BigFourBanner({ goals, onEditGoal }: { goals: LifeAreaGoal[]; onEditGoal: (areaId: string) => void }) {
    const bigFours = goals.filter(g => g.isBigFour)

    if (bigFours.length === 0) {
        return (
            <div className="border border-dashed border-white/10 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-2">🔥</div>
                <p className="text-white/40 text-sm">No 4 Bigs set yet. Toggle "Mark as 4 Big" on any area goal below to highlight it here.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {bigFours.map(goal => {
                const area = getLifeArea(goal.lifeAreaId)
                if (!area) return null
                return (
                    <motion.button
                        key={goal.lifeAreaId}
                        onClick={() => onEditGoal(goal.lifeAreaId)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative p-5 rounded-2xl border text-left overflow-hidden transition-all"
                        style={{ borderColor: area.color + '40', background: area.color + '10' }}
                    >
                        <div className="absolute inset-0 opacity-30" style={{ background: `radial-gradient(circle at 20% 20%, ${area.color}30, transparent 60%)` }} />
                        <div className="relative z-10">
                            <div className="text-2xl mb-2">{area.emoji}</div>
                            <div className="text-xs uppercase tracking-widest font-bold mb-2" style={{ color: area.color }}>{area.label}</div>
                            <p className="text-white/70 text-sm leading-relaxed line-clamp-3">{goal.goal || 'No goal set yet.'}</p>
                        </div>
                    </motion.button>
                )
            })}
        </div>
    )
}

// ─── Area Detail Panel ────────────────────────────────────────────────────────

interface AreaDetailPanelProps {
    areaId: string
    year: number
    month: number
    userId: string
    goal?: LifeAreaGoal
    reflections: MonthlyReflection[]
    onClose: () => void
    onGoalSave: (goal: string, isBigFour: boolean) => void
    onReflectionSave: (month: number, journal: string) => void
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function AreaDetailPanel({ areaId, year, month, userId, goal, reflections, onClose, onGoalSave, onReflectionSave }: AreaDetailPanelProps) {
    const area = getLifeArea(areaId)
    const [goalText, setGoalText] = useState(goal?.goal || '')
    const [isBigFour, setIsBigFour] = useState(goal?.isBigFour || false)
    const [expandedMonth, setExpandedMonth] = useState<number | null>(month)
    const [editingJournal, setEditingJournal] = useState<Record<number, string>>({})
    const [savingMonth, setSavingMonth] = useState<number | null>(null)
    const [habits, setHabits] = useState<Array<{ id: string; name: string; frequency: string }>>([])
    const [loadingHabits, setLoadingHabits] = useState(true)

    // Seed editing state from existing reflections
    useEffect(() => {
        const seed: Record<number, string> = {}
        reflections.forEach(r => { seed[r.month] = r.journal ?? '' })
        setEditingJournal(seed)
    }, [reflections])

    // Load connected habits for this area
    useEffect(() => {
        setLoadingHabits(true)
        dataStore.getEntries('atomic-habits', userId).then(entries => {
            const areaHabits = entries
                .filter(e => e.data['Life Area'] === areaId)
                .map(e => ({
                    id: e.id,
                    name: e.data['Habit Name'] || e.data['name'] || 'Untitled',
                    frequency: e.data['frequency'] || 'daily',
                }))
            setHabits(areaHabits)
            setLoadingHabits(false)
        })
    }, [areaId, userId])

    const handleGoalBlur = () => onGoalSave(goalText, isBigFour)

    const handleToggleBigFour = () => {
        const next = !isBigFour
        setIsBigFour(next)
        onGoalSave(goalText, next)
    }

    const handleSaveJournal = async (m: number) => {
        setSavingMonth(m)
        await onReflectionSave(m, editingJournal[m] ?? '')
        setSavingMonth(null)
    }

    if (!area) return null

    return (
        <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:w-[520px] bg-[#080808] border-l border-white/10 z-50 overflow-y-auto flex flex-col"
        >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#080808]/95 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: area.color + '18' }}>
                        {area.emoji}
                    </div>
                    <div>
                        <div className="font-bold text-white text-lg">{area.label}</div>
                        <div className="text-xs text-white/40">{area.description}</div>
                    </div>
                </div>
                <button onClick={onClose} className="text-white/30 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5 flex-shrink-0">
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="flex-1 px-6 py-6 space-y-8">

                {/* ── Annual Goal ───────────────────────────────────────── */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-widest font-bold text-white/40 flex items-center gap-2">
                            <Target className="w-3.5 h-3.5" /> Annual Goal {year}
                        </label>
                        <button
                            onClick={handleToggleBigFour}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${isBigFour ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/5 border-white/10 text-white/30 hover:text-white/60'}`}
                        >
                            <Flame className="w-3 h-3" /> 4 Big
                        </button>
                    </div>
                    <textarea
                        value={goalText}
                        onChange={e => setGoalText(e.target.value)}
                        onBlur={handleGoalBlur}
                        placeholder={`What do you want to achieve in ${area.label.toLowerCase()} this year?`}
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-white/30 transition-colors resize-none leading-relaxed"
                        style={{ caretColor: area.color }}
                    />
                    {goalText !== (goal?.goal || '') && (
                        <p className="text-[10px] text-white/30 italic">Click outside the box to save</p>
                    )}
                </div>

                {/* ── Connected Habits ─────────────────────────────────── */}
                <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-bold text-white/40 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5" /> Connected Habits
                    </label>
                    {loadingHabits ? (
                        <div className="space-y-2">
                            {[1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}
                        </div>
                    ) : habits.length === 0 ? (
                        <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                            <p className="text-white/30 text-sm">No habits linked to this area yet.</p>
                            <p className="text-white/20 text-xs mt-1">Build habits in the Atomic Habits microapp and select this life area.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {habits.map(h => (
                                <div
                                    key={h.id}
                                    className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03]"
                                    style={{ borderLeftColor: area.color, borderLeftWidth: 2 }}
                                >
                                    <div className="text-lg">{area.emoji}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{h.name}</div>
                                        <div className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">{h.frequency}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Monthly Journal Timeline ──────────────────────────── */}
                <div className="space-y-3">
                    <label className="text-xs uppercase tracking-widest font-bold text-white/40 flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" /> Monthly Journal — {year}
                    </label>
                    <div className="space-y-2">
                        {MONTH_NAMES.map((name, idx) => {
                            const m = idx + 1
                            const isExpanded = expandedMonth === m
                            const existing = reflections.find(r => r.month === m)
                            const hasNote = !!existing?.journal
                            const isCurrent = m === month

                            return (
                                <div key={m} className="rounded-xl border border-white/10 overflow-hidden transition-all">
                                    {/* Month row */}
                                    <button
                                        onClick={() => setExpandedMonth(isExpanded ? null : m)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                                    >
                                        {/* Color dot — filled if has note */}
                                        <div
                                            className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-all"
                                            style={{ background: hasNote ? area.color : 'rgba(255,255,255,0.1)' }}
                                        />
                                        <span className={`text-sm font-medium flex-1 ${isCurrent ? 'text-white' : hasNote ? 'text-white/80' : 'text-white/30'}`}>
                                            {name}
                                            {isCurrent && <span className="ml-2 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full" style={{ background: area.color + '30', color: area.color }}>Current</span>}
                                        </span>
                                        {hasNote && !isExpanded && (
                                            <span className="text-xs text-white/30 truncate max-w-[140px]">{existing?.journal?.slice(0, 40)}…</span>
                                        )}
                                        <ChevronRight className={`w-4 h-4 text-white/20 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </button>

                                    {/* Expanded journal editor */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3 bg-white/[0.02]">
                                                    <textarea
                                                        value={editingJournal[m] ?? ''}
                                                        onChange={e => setEditingJournal(prev => ({ ...prev, [m]: e.target.value }))}
                                                        placeholder={`How was ${name} for ${area.label.toLowerCase()}? What progressed, what stalled?`}
                                                        rows={4}
                                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm outline-none focus:border-white/20 transition-colors resize-none leading-relaxed"
                                                        style={{ caretColor: area.color }}
                                                    />
                                                    <button
                                                        onClick={() => handleSaveJournal(m)}
                                                        disabled={savingMonth === m}
                                                        className="w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                                                        style={{ background: area.color + '20', color: area.color, border: `1px solid ${area.color}30` }}
                                                    >
                                                        {savingMonth === m ? 'Saving…' : `Save ${MONTH_SHORT[idx]} Note`}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}




// ─── Life Area Card ───────────────────────────────────────────────────────────

interface LifeAreaCardProps {
    area: typeof LIFE_AREAS[number]
    goal?: LifeAreaGoal
    areaRating: number | null
    onClick: () => void
}

function LifeAreaCard({ area, goal, areaRating, onClick }: LifeAreaCardProps) {
    const ratingColor = areaRating === null ? '#ffffff20' : areaRating >= 7 ? '#4ade80' : areaRating >= 4 ? '#fbbf24' : '#f87171'

    return (
        <motion.button
            onClick={onClick}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="relative p-5 rounded-2xl border text-left overflow-hidden w-full transition-colors group"
            style={{ borderColor: area.color + '25', background: `linear-gradient(135deg, ${area.color}08, transparent)` }}
        >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `radial-gradient(circle at 30% 50%, ${area.color}12, transparent 60%)` }} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{area.emoji}</div>
                    {areaRating !== null && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold" style={{ background: ratingColor + '20', color: ratingColor }}>
                            <Star className="w-3 h-3" />{areaRating}
                        </div>
                    )}
                </div>

                <div className="font-bold text-white text-sm mb-1">{area.label}</div>

                {goal?.isBigFour && (
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-400 text-[10px] font-bold mb-2">
                        <Flame className="w-2.5 h-2.5" /> 4 BIG
                    </div>
                )}

                <p className="text-white/40 text-xs leading-relaxed line-clamp-2 mt-1">
                    {goal?.goal || 'Tap to set your annual goal…'}
                </p>
            </div>
        </motion.button>
    )
}

// ─── Main Projection Page ─────────────────────────────────────────────────────

export default function ProjectionPage() {
    const [userId, setUserId] = useState<string | null>(null)
    const [year, setYear] = useState(new Date().getFullYear())
    const [currentMonth] = useState(new Date().getMonth() + 1)
    const [goals, setGoals] = useState<LifeAreaGoal[]>([])
    const [reflections, setReflections] = useState<MonthlyReflection[]>([])
    const [ratings, setRatings] = useState<Record<string, number | null>>({})
    const [selectedArea, setSelectedArea] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    // Auth
    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            if (data.user) setUserId(data.user.id)
        })
    }, [])

    // Fetch data
    const fetchData = useCallback(async () => {
        if (!userId) {
            setLoading(false)
            return
        }
        setLoading(true)
        try {
            const [gs, rs, habits] = await Promise.all([
                dataStore.getLifeAreaGoals(userId, year),
                dataStore.getMonthlyReflections(userId, year),
                dataStore.getEntries('atomic-habits', userId),
            ])
            setGoals(gs)
            setReflections(rs)

            // Compute all 12 area ratings from already-fetched data (no extra round trips)
            const ratingMap: Record<string, number | null> = {}
            const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            const daysInMonth = new Date(year, currentMonth, 0).getDate()

            for (const area of LIFE_AREAS) {
                const reflection = rs.find(r => r.lifeAreaId === area.id && r.month === currentMonth)
                const monthlyRating = reflection?.rating ?? null

                const areaHabits = habits.filter(h => h.data['Life Area'] === area.id)
                let habitRate = 0

                if (areaHabits.length > 0) {
                    let totalPossible = 0, totalCompleted = 0
                    for (const habit of areaHabits) {
                        let completedDates: string[] = []
                        try {
                            const raw = habit.data['completedDates']
                            if (Array.isArray(raw)) completedDates = raw
                            else if (typeof raw === 'string') completedDates = JSON.parse(raw)
                        } catch { /* ignore */ }
                        const frequency = habit.data['frequency'] || 'daily'
                        const repeatDays: string[] = (() => {
                            try { return JSON.parse(habit.data['repeatDays'] || '[]') } catch { return [] }
                        })()
                        for (let d = 1; d <= daysInMonth; d++) {
                            const dateStr = `${year}-${String(currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                            const dayName = DAY_NAMES[new Date(year, currentMonth - 1, d).getDay()]
                            const isScheduled = frequency === 'daily' || (frequency === 'specific_days' && repeatDays.includes(dayName))
                            if (isScheduled) {
                                totalPossible++
                                if (completedDates.includes(dateStr)) totalCompleted++
                            }
                        }
                    }
                    habitRate = totalPossible > 0 ? totalCompleted / totalPossible : 0
                }

                if (monthlyRating === null && areaHabits.length === 0) {
                    ratingMap[area.id] = null
                } else if (monthlyRating === null) {
                    ratingMap[area.id] = Math.round(habitRate * 10 * 10) / 10
                } else if (areaHabits.length === 0) {
                    ratingMap[area.id] = monthlyRating
                } else {
                    ratingMap[area.id] = Math.round((habitRate * 0.5 + (monthlyRating / 10) * 0.5) * 10 * 10) / 10
                }
            }
            setRatings(ratingMap)
        } catch (e) {
            console.warn('[Projection] fetchData error:', e)
        } finally {
            setLoading(false)
        }
    }, [userId, year, currentMonth])

    useEffect(() => { fetchData() }, [fetchData])

    const handleGoalSave = async (areaId: string, goalText: string, isBigFour: boolean) => {
        if (!userId) return
        await dataStore.upsertLifeAreaGoal(userId, areaId, year, goalText, isBigFour)
        await fetchData()
    }

    const handleReflectionSave = async (areaId: string, month: number, journal: string): Promise<void> => {
        if (!userId) return
        await dataStore.upsertMonthlyReflection(userId, areaId, year, month, 0, journal)
        await fetchData()
    }

    const selectedGoal = goals.find(g => g.lifeAreaId === selectedArea)
    const selectedRating = selectedArea ? ratings[selectedArea] ?? null : null

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Page Header */}
            <div className="border-b border-white/10 px-6 md:px-10 py-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-white">Projection & Reflexión</h1>
                            <p className="text-white/40 text-sm mt-1">Map your life areas, set annual goals, track monthly reflections</p>
                        </div>
                        {/* Year selector */}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setYear(y => y - 1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="font-mono font-bold text-xl w-16 text-center">{year}</span>
                            <button onClick={() => setYear(y => y + 1)} className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 space-y-10">
                {/* 4 Bigs Banner */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="w-5 h-5 text-rose-400" />
                        <h2 className="text-sm uppercase tracking-widest font-bold text-white/60">4 Bigs — Annual Priorities</h2>
                    </div>
                    {loading ? (
                        <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
                    ) : (
                        <BigFourBanner goals={goals} onEditGoal={setSelectedArea} />
                    )}
                </section>

                {/* Life Areas Grid */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-indigo-400" />
                        <h2 className="text-sm uppercase tracking-widest font-bold text-white/60">Life Areas</h2>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="h-36 rounded-2xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {LIFE_AREAS.map(area => (
                                <LifeAreaCard
                                    key={area.id}
                                    area={area}
                                    goal={goals.find(g => g.lifeAreaId === area.id)}
                                    areaRating={ratings[area.id] ?? null}
                                    onClick={() => setSelectedArea(area.id)}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </div>

            {/* Area Detail Panel */}
            <AnimatePresence>
                {selectedArea && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedArea(null)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <AreaDetailPanel
                            key={selectedArea}
                            areaId={selectedArea}
                            year={year}
                            month={currentMonth}
                            userId={userId ?? ''}
                            goal={selectedGoal}
                            reflections={reflections.filter(r => r.lifeAreaId === selectedArea)}
                            onClose={() => setSelectedArea(null)}
                            onGoalSave={(goal, isBigFour) => handleGoalSave(selectedArea, goal, isBigFour)}
                            onReflectionSave={(month, journal) => handleReflectionSave(selectedArea, month, journal)}
                        />
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
