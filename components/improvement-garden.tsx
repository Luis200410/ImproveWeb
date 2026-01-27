'use client'

import { motion } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { TrendingUp, Mountain, Zap, Target, Flame, Trophy } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export type VisualTheme = 'arrows' | 'peaks' | 'energy' | 'targets' | 'streak' | 'trophies'

interface ImprovementGardenProps {
    completedSessions: number
    todayCount: number
    totalFocusTime: number // in minutes
    selectedTheme?: VisualTheme
    onThemeChange?: (theme: VisualTheme) => void
}

const THEMES = {
    arrows: {
        icon: TrendingUp,
        name: 'Rising Arrows',
        color: 'from-blue-500 to-cyan-500',
        description: 'Chart your upward progress',
    },
    peaks: {
        icon: Mountain,
        name: 'Mountain Peaks',
        color: 'from-emerald-500 to-teal-500',
        description: 'Reach new heights',
    },
    energy: {
        icon: Zap,
        name: 'Energy Bolts',
        color: 'from-yellow-500 to-orange-500',
        description: 'Power through challenges',
    },
    targets: {
        icon: Target,
        name: 'Bullseyes',
        color: 'from-red-500 to-pink-500',
        description: 'Hit your goals',
    },
    streak: {
        icon: Flame,
        name: 'Fire Streak',
        color: 'from-orange-500 to-red-500',
        description: 'Keep the flame alive',
    },
    trophies: {
        icon: Trophy,
        name: 'Achievements',
        color: 'from-purple-500 to-indigo-500',
        description: 'Collect victories',
    },
}

export function ImprovementGarden({
    completedSessions,
    todayCount,
    totalFocusTime,
    selectedTheme = 'arrows',
    onThemeChange,
}: ImprovementGardenProps) {
    const theme = THEMES[selectedTheme]
    const Icon = theme.icon

    // Calculate grid size based on sessions (max 50 displayed)
    const displayCount = Math.min(completedSessions, 50)
    const gridCols = Math.ceil(Math.sqrt(displayCount))

    return (
        <div className="bg-black border border-white/10 p-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className={`${playfair.className} text-3xl font-bold text-white`}>
                        Your Progress Garden
                    </h3>
                    <div className="text-right">
                        <p className={`${playfair.className} text-4xl font-bold text-white`}>
                            {completedSessions}
                        </p>
                        <p className="text-xs uppercase tracking-wider text-white/40">Total Sessions</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white/5 border border-white/10 p-4">
                        <p className={`${playfair.className} text-2xl font-bold text-white`}>{todayCount}</p>
                        <p className="text-xs uppercase tracking-wider text-white/40">Today</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4">
                        <p className={`${playfair.className} text-2xl font-bold text-white`}>
                            {Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m
                        </p>
                        <p className="text-xs uppercase tracking-wider text-white/40">Total Focus</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4">
                        <p className={`${playfair.className} text-2xl font-bold text-white`}>
                            {completedSessions > 0 ? Math.round(totalFocusTime / completedSessions) : 0}m
                        </p>
                        <p className="text-xs uppercase tracking-wider text-white/40">Avg Session</p>
                    </div>
                </div>

                {/* Theme selector */}
                <div className="mb-6">
                    <p className="text-xs uppercase tracking-wider text-white/40 mb-3">Visual Theme</p>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {(Object.keys(THEMES) as VisualTheme[]).map((themeKey) => {
                            const t = THEMES[themeKey]
                            const ThemeIcon = t.icon
                            return (
                                <motion.button
                                    key={themeKey}
                                    onClick={() => onThemeChange?.(themeKey)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`p-3 border transition-all ${selectedTheme === themeKey
                                            ? 'border-white/40 bg-white/10'
                                            : 'border-white/10 bg-white/5 hover:border-white/20'
                                        }`}
                                    title={t.description}
                                >
                                    <ThemeIcon className="w-6 h-6 text-white mx-auto" />
                                </motion.button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Garden grid */}
            <div className="relative min-h-[300px] bg-black/50 border border-white/10 p-8">
                {completedSessions === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Icon className="w-16 h-16 text-white/20 mb-4" />
                        <p className={`${playfair.className} text-2xl text-white/40 mb-2`}>
                            Your garden awaits
                        </p>
                        <p className="text-sm text-white/30">
                            Complete your first Pomodoro session to see your progress grow
                        </p>
                    </div>
                ) : (
                    <div
                        className="grid gap-3"
                        style={{
                            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                        }}
                    >
                        {Array.from({ length: displayCount }).map((_, index) => (
                            <motion.div
                                key={index}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                    delay: index * 0.02,
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 15,
                                }}
                                className="relative aspect-square"
                            >
                                <div
                                    className={`absolute inset-0 bg-gradient-to-br ${theme.color} opacity-20 blur-sm`}
                                />
                                <div className="relative flex items-center justify-center h-full border border-white/20 bg-black/40 backdrop-blur-sm">
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Overflow indicator */}
                {completedSessions > 50 && (
                    <div className="mt-4 text-center">
                        <p className="text-xs text-white/40">
                            + {completedSessions - 50} more sessions
                        </p>
                    </div>
                )}
            </div>

            {/* Motivational message */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-center"
            >
                <p className={`${inter.className} text-sm text-white/60 italic`}>
                    {completedSessions === 0 && "Begin your journey to excellence"}
                    {completedSessions > 0 && completedSessions < 5 && "Great start! Keep the momentum going"}
                    {completedSessions >= 5 && completedSessions < 20 && "You're building consistency"}
                    {completedSessions >= 20 && completedSessions < 50 && "Impressive dedication!"}
                    {completedSessions >= 50 && completedSessions < 100 && "You're unstoppable!"}
                    {completedSessions >= 100 && "Master of focus and discipline"}
                </p>
            </motion.div>
        </div>
    )
}
