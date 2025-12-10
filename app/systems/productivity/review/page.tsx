'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Playfair_Display } from '@/lib/font-shim'
import { motion } from 'framer-motion'
import { ArrowLeft, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { dataStore, type HabitStats, type PomodoroStats } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { WeeklyReview } from '@/components/weekly-review'

const playfair = Playfair_Display({ subsets: ['latin'] })

type ReviewType = 'weekly' | 'monthly' | 'yearly'

export default function ReviewPage() {
    const router = useRouter()
    const [reviewType, setReviewType] = useState<ReviewType>('weekly')
    const [userId, setUserId] = useState<string | null>(null)
    const [habitStats, setHabitStats] = useState<HabitStats | null>(null)
    const [pomodoroStats, setPomodoroStats] = useState<PomodoroStats | null>(null)
    const [periodStart, setPeriodStart] = useState('')
    const [periodEnd, setPeriodEnd] = useState('')
    const [loading, setLoading] = useState(true)

    // Get user
    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/login')
                return
            }

            setUserId(user.id)
        }

        loadUser()
    }, [router])

    // Calculate period dates
    useEffect(() => {
        const now = new Date()
        let start: Date, end: Date

        if (reviewType === 'weekly') {
            // Last 7 days
            end = now
            start = new Date(now)
            start.setDate(start.getDate() - 6)
        } else if (reviewType === 'monthly') {
            // Last 30 days
            end = now
            start = new Date(now)
            start.setDate(start.getDate() - 29)
        } else {
            // Last 365 days
            end = now
            start = new Date(now)
            start.setDate(start.getDate() - 364)
        }

        setPeriodStart(start.toISOString().split('T')[0])
        setPeriodEnd(end.toISOString().split('T')[0])
    }, [reviewType])

    // Load review data
    useEffect(() => {
        const loadData = async () => {
            if (!userId || !periodStart || !periodEnd) return

            setLoading(true)

            try {
                const [habits, pomodoro] = await Promise.all([
                    dataStore.getHabitStats(userId, periodStart, periodEnd),
                    dataStore.getPomodoroStats(userId, periodStart, periodEnd)
                ])

                setHabitStats(habits)
                setPomodoroStats(pomodoro)
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [userId, periodStart, periodEnd])

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-7xl mx-auto p-4 md:p-8 pt-24 md:pt-32">
                {/* Back button */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="uppercase tracking-widest text-xs">Back</span>
                    </button>
                </motion.div>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <div className="text-xs uppercase tracking-[0.3em] text-white/40 mb-2">GTD</div>
                    <h1 className={`${playfair.className} text-5xl md:text-6xl font-bold text-white mb-8`}>
                        Review
                    </h1>

                    {/* Period Selector */}
                    <div className="flex gap-3">
                        {(['weekly', 'monthly', 'yearly'] as ReviewType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setReviewType(type)}
                                className={`px-6 py-3 border transition-all ${reviewType === type
                                        ? 'bg-white text-black border-white'
                                        : 'bg-white/5 text-white border-white/10 hover:border-white/30'
                                    }`}
                            >
                                <span className="text-xs uppercase tracking-widest">
                                    {type}
                                </span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Review Content */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-white/40">Loading review...</div>
                    </div>
                ) : (
                    <motion.div
                        key={reviewType}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {reviewType === 'weekly' && habitStats && pomodoroStats && (
                            <WeeklyReview
                                habitStats={habitStats}
                                pomodoroStats={pomodoroStats}
                                periodStart={periodStart}
                                periodEnd={periodEnd}
                            />
                        )}
                        {reviewType === 'monthly' && (
                            <div className="text-center py-20 text-white/60">
                                <p className="text-xl mb-2">Monthly Review</p>
                                <p className="text-sm">Coming soon...</p>
                            </div>
                        )}
                        {reviewType === 'yearly' && (
                            <div className="text-center py-20 text-white/60">
                                <p className="text-xl mb-2">Yearly Review</p>
                                <p className="text-sm">Coming soon...</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    )
}
