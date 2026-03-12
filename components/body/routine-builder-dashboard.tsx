'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Entry } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Dumbbell, Wind, BedDouble, Zap, Sparkles, ChevronRight, Activity, Calendar, Play } from 'lucide-react'
import { IdentitySetupSheet } from './identity-setup-sheet'
import { ActiveSessionSidebar } from './active-session-sidebar'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface RoutineDashboardProps {
    entries: Entry[]
    userId?: string | null
    onEditEntry?: (entry: Entry) => void
    onDeleteEntry?: (id: string) => void
    onCreateEntry?: () => void
}

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

export function RoutineBuilderDashboard({ userId }: RoutineDashboardProps) {
    const supabase = createClient()
    const [weekPlan, setWeekPlan] = useState<DayPlan[] | null>(null)
    const [goalLabel, setGoalLabel] = useState('')
    const [loading, setLoading] = useState(true)
    const [showSetup, setShowSetup] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)
    const [selectedDay, setSelectedDay] = useState<DayPlan | null>(null)

    const loadIdentity = useCallback(async () => {
        if (!userId) return;
        setLoading(true)
        const { data } = await supabase
            .from('body_identity')
            .select('week_plan, goal_label')
            .eq('user_id', userId)
            .maybeSingle()
        
        if (data?.week_plan) {
            setWeekPlan(data.week_plan as DayPlan[])
            setGoalLabel(data.goal_label || '')
        } else {
            setWeekPlan(null)
        }
        setLoading(false)
    }, [userId, supabase, refreshKey])

    useEffect(() => { loadIdentity() }, [loadIdentity])

    if (!userId) return null

    if (loading) {
        return (
            <div className="py-24 text-center">
                <Activity className="w-6 h-6 text-white/20 animate-pulse mx-auto mb-4" />
                <p className="text-white/40 text-sm">Loading your AI plan...</p>
            </div>
        )
    }

    if (!weekPlan || weekPlan.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-32 bg-white/[0.02] border border-white/10 rounded-3xl backdrop-blur-sm relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                {showSetup && (
                    <IdentitySetupSheet
                        userId={userId}
                        onComplete={() => { setShowSetup(false); setRefreshKey(k => k + 1) }}
                    />
                )}

                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                    <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className={`${playfair.className} text-3xl font-bold text-white mb-3`}>AI Weekly Planner</h3>
                <p className={`${inter.className} text-white/50 max-w-md mx-auto mb-8 text-sm leading-relaxed`}>
                    We've upgraded from manual routines. Tell the AI your exact goals, and it will build a complete 7-day protocol including training, recovery, and rest days perfectly tailored to you.
                </p>
                <button
                    onClick={() => setShowSetup(true)}
                    className="bg-white text-black px-8 py-3.5 rounded-full uppercase tracking-widest text-xs font-bold hover:bg-white/90 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] flex items-center gap-2 mx-auto"
                >
                    <Zap className="w-4 h-4" /> Generate My Protocol
                </button>
            </motion.div>
        )
    }

    return (
        <div className="space-y-12 pb-24">
            
            {showSetup && (
                <IdentitySetupSheet
                    userId={userId}
                    onComplete={() => { setShowSetup(false); setRefreshKey(k => k + 1) }}
                />
            )}

            {/* Active Session Sidebar */}
            <ActiveSessionSidebar
                isOpen={!!selectedDay}
                onClose={() => setSelectedDay(null)}
                dayPlan={selectedDay}
                userId={userId}
                goalLabel={goalLabel}
            />

            {/* Active Spotlight */}
            <div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-between items-center mb-6"
                >
                    <div className="flex items-center gap-4">
                        <h2 className={`${playfair.className} text-2xl font-bold text-white flex items-center gap-3`}>
                            <Zap className="w-5 h-5 text-emerald-400" /> Active AI Protocol
                        </h2>
                        <div className="h-px bg-white/10 w-12 hidden md:block" />
                        <span className="hidden md:flex px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-widest text-white/50">
                            {goalLabel || 'Custom Training Goal'}
                        </span>
                    </div>
                    <button 
                        onClick={() => setShowSetup(true)}
                        className="text-[10px] uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
                    >
                        Rebuild Plan
                    </button>
                </motion.div>

                <div className="space-y-4">
                    {weekPlan.map((day, i) => {
                        const style = day.type === 'training'
                            ? { icon: <Dumbbell className="w-5 h-5" />, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20' }
                            : day.type === 'recovery'
                            ? { icon: <Wind className="w-5 h-5" />, color: 'text-sky-400', bg: 'bg-sky-500/10 border-sky-500/20' }
                            : { icon: <BedDouble className="w-5 h-5" />, color: 'text-white/40', bg: 'bg-white/5 border-white/10' }

                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                key={day.day_index}
                                onClick={() => setSelectedDay(day)}
                                className={`relative group overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.02] backdrop-blur-md p-6 lg:p-8 transition-all hover:bg-white/[0.04] cursor-pointer`}
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    {/* Left: Day & Focus */}
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${style.bg} ${style.color}`}>
                                            {style.icon}
                                        </div>
                                        <div className="space-y-1 mt-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white">{day.day}</span>
                                                <span className="text-[10px] uppercase tracking-widest text-white/40 border border-white/10 rounded-full px-2 py-0.5">
                                                    {day.type}
                                                </span>
                                            </div>
                                            <h4 className="text-lg text-white/90">{day.focus}</h4>
                                            <div className="flex items-center gap-3 pt-2 text-xs text-white/50">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" /> {day.duration_min} min
                                                </div>
                                                {day.type === 'training' && day.exercises?.length > 0 && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Activity className="w-3.5 h-3.5" /> {day.exercises.length} blocks
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Details / Exercises */}
                                    <div className="flex-1 md:max-w-md w-full bg-black/20 rounded-xl p-4 border border-white/5">
                                        {day.type === 'training' && day.exercises && day.exercises.length > 0 ? (
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Training Blocks</p>
                                                {day.exercises.map((ex, idx) => (
                                                    <div key={idx} className="flex items-baseline justify-between gap-4 text-xs">
                                                        <span className="text-white/80 font-medium truncate">{ex.name}</span>
                                                        <span className="text-white/40 shrink-0 tabular-nums">{ex.sets} × {ex.reps}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : day.type === 'recovery' ? (
                                            <div className="space-y-2">
                                                <p className="text-[10px] uppercase tracking-widest text-sky-400/50 mb-2">Recovery Directives</p>
                                                <p className="text-sm text-sky-200/80 leading-relaxed">{day.recovery_notes}</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2 h-full flex flex-col justify-center">
                                                <p className="text-sm text-white/40 italic">"Growth happens during rest. Let the system recover."</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {day.coaching_note && (
                                    <div className="mt-5 pt-4 border-t border-white/5 flex gap-3">
                                        <Zap className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                                        <p className="text-sm text-emerald-100/70 italic">"{day.coaching_note}"</p>
                                    </div>
                                )}
                            </motion.div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
