'use client'

import { useState } from 'react'
import { Playfair_Display } from 'next/font/google'
import { motion } from 'framer-motion'
import { Calendar, TrendingUp, Award } from 'lucide-react'
import type { HabitStats, PomodoroStats } from '@/lib/data-store'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface WeeklyReviewProps {
    habitStats: HabitStats
    pomodoroStats: PomodoroStats
    periodStart: string
    periodEnd: string
}

export function WeeklyReview({ habitStats, pomodoroStats, periodStart, periodEnd }: WeeklyReviewProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    const totalFocusHours = Math.floor(pomodoroStats.totalFocusMinutes / 60)
    const totalFocusMin = pomodoroStats.totalFocusMinutes % 60

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="border-b border-white/10 pb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Calendar className="w-5 h-5 text-white/40" />
                    <p className="text-xs uppercase tracking-[0.3em] text-white/40">Weekly Review</p>
                </div>
                <h2 className={`${playfair.className} text-3xl font-bold text-white`}>
                    {formatDate(periodStart)} - {formatDate(periodEnd)}
                </h2>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 p-6"
                >
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Habits</p>
                    <p className="text-4xl font-mono text-white mb-1">
                        {habitStats.completedCount}/{habitStats.completedCount + (habitStats.totalHabits * 7 - habitStats.completedCount)}
                    </p>
                    <p className="text-sm text-white/60">{Math.round(habitStats.completionRate)}% complete</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 p-6"
                >
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Focus Time</p>
                    <p className="text-4xl font-mono text-white mb-1">
                        {totalFocusHours}h {totalFocusMin}m
                    </p>
                    <p className="text-sm text-white/60">{pomodoroStats.totalSessions} sessions</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/5 backdrop-blur-md border border-white/10 p-6"
                >
                    <p className="text-xs uppercase tracking-widest text-white/40 mb-2">Best Day</p>
                    <p className="text-4xl font-mono text-white mb-1">
                        {pomodoroStats.mostProductiveDay ? formatDate(pomodoroStats.mostProductiveDay) : '-'}
                    </p>
                    <p className="text-sm text-white/60">Most productive</p>
                </motion.div>
            </div>

            {/* Habit Breakdown */}
            {habitStats.habitBreakdown.length > 0 && (
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="w-5 h-5 text-white/40" />
                        <h3 className={`${playfair.className} text-xl text-white`}>Habit Details</h3>
                    </div>

                    <div className="space-y-4">
                        {habitStats.habitBreakdown.map((habit, index) => (
                            <motion.div
                                key={habit.habitId}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0"
                            >
                                <div>
                                    <p className="text-white font-medium">{habit.habitName}</p>
                                    <p className="text-sm text-white/60 font-mono">
                                        {habit.completed}/{habit.total} completed
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-mono text-white">{Math.round(habit.rate)}%</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Insights */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Award className="w-5 h-5 text-white/40" />
                    <h3 className={`${playfair.className} text-xl text-white`}>Weekly Insights</h3>
                </div>

                <div className="space-y-3">
                    {habitStats.completionRate >= 80 && (
                        <p className="text-white/80">✨ Outstanding week! You completed {Math.round(habitStats.completionRate)}% of your habits.</p>
                    )}
                    {pomodoroStats.totalSessions > 0 && (
                        <p className="text-white/80">
                            ⏱️ You focused for {totalFocusHours}h {totalFocusMin}m across {pomodoroStats.totalSessions} sessions.
                        </p>
                    )}
                    {habitStats.completionRate < 50 && (
                        <p className="text-white/80">💪 Room for improvement - try setting more realistic daily goals.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
