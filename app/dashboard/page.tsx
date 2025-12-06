'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { dataStore, System } from '@/lib/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Playfair_Display, Inter } from 'next/font/google'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { TrendingUp, Target, Calendar, Sparkles, ArrowRight } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function DashboardPage() {
    const [systems, setSystems] = useState<System[]>([])
    const [todayCount, setTodayCount] = useState(0)

    useEffect(() => {
        setSystems(dataStore.getSystems())
        dataStore.getTodayEntries().then(entries => {
            setTodayCount(entries.length)
        })
    }, [])

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.35, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 right-1/3 w-[600px] h-[600px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"
                />

                <div className="absolute inset-0 opacity-[0.02]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="dashboard-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                                <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dashboard-grid)" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Navigation isAuthenticated={true} />
                <div className="h-20" />

                <div className="max-w-7xl mx-auto px-8 py-12">
                    {/* Welcome Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-16 text-center"
                    >
                        <div className="inline-flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-white/60" />
                            <p className="text-xs uppercase tracking-[0.3em] text-white/40">Your Command Center</p>
                            <Sparkles className="w-4 h-4 text-white/60" />
                        </div>
                        <h1 className={`${playfair.className} text-6xl md:text-7xl font-bold mb-6 text-white tracking-tight`}>
                            Welcome Back
                        </h1>
                        <p className={`${inter.className} text-lg text-white/60 max-w-2xl mx-auto font-light`}>
                            Excellence is built one day at a time
                        </p>
                    </motion.div>

                    {/* Stats Overview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
                    >
                        {[
                            { icon: Calendar, value: todayCount, label: "Today's Entries", desc: "Actions logged today", delay: 0.3 },
                            { icon: Target, value: systems.length, label: "Active Systems", desc: "Pillars of excellence", delay: 0.4 },
                            { icon: TrendingUp, value: systems.reduce((acc, s) => acc + (s?.microapps?.length || 0), 0), label: "Total Microapps", desc: "Tools at your disposal", delay: 0.5 }
                        ].map((stat, i) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: stat.delay, duration: 0.6 }}
                                whileHover={{ scale: 1.05, y: -5 }}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                                <div className="relative bg-white/5 border border-white/10 p-8 group-hover:border-white/30 transition-all duration-500">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-white/10 border border-white/20 group-hover:bg-white/20 transition-colors duration-300">
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: stat.delay + 0.2, type: "spring" }}
                                                className={`${playfair.className} text-5xl font-bold text-white mb-2`}
                                            >
                                                {stat.value}
                                            </motion.div>
                                            <div className="text-xs uppercase tracking-[0.2em] text-white/40 font-semibold mb-2">
                                                {stat.label}
                                            </div>
                                            <p className={`${inter.className} text-sm text-white/50`}>
                                                {stat.desc}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Systems Grid */}
                    <div className="mb-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="flex items-center gap-6 mb-8"
                        >
                            <h2 className={`${playfair.className} text-4xl font-bold text-white`}>Your Systems</h2>
                            <div className="h-px bg-white/10 flex-1" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.7 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {systems.map((system, index) => (
                                <motion.div
                                    key={system.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                >
                                    <Link href={`/systems/${system.id}`}>
                                        <div className="relative group cursor-pointer h-full">
                                            <div className="absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />

                                            <Card className="relative border border-white/10 bg-black group-hover:border-white/30 transition-all duration-500 h-full flex flex-col">
                                                <CardHeader className="bg-black border-b border-white/10 group-hover:bg-white/5 transition-colors duration-500 pb-8">
                                                    <div className="flex flex-col items-center text-center gap-4">
                                                        <motion.span
                                                            whileHover={{ scale: 1.2, rotate: 5 }}
                                                            className="text-5xl"
                                                        >
                                                            {system.icon}
                                                        </motion.span>
                                                        <CardTitle className={`${playfair.className} text-2xl font-bold text-white`}>
                                                            {system.name}
                                                        </CardTitle>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-6 flex-1 flex flex-col">
                                                    <CardDescription className="text-white/60 mb-6 min-h-[4rem] font-light text-sm leading-relaxed text-center flex-1">
                                                        {system.description}
                                                    </CardDescription>
                                                    <div className="flex items-center justify-between text-xs uppercase tracking-wider font-medium border-t border-white/10 pt-4">
                                                        <span className="text-white/40">
                                                            {system?.microapps?.length || 0} microapps
                                                        </span>
                                                        <motion.span
                                                            className="text-white flex items-center gap-1"
                                                            whileHover={{ x: 5 }}
                                                        >
                                                            View <ArrowRight className="w-3 h-3" />
                                                        </motion.span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>

                    {/* Daily Wisdom */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="mt-20 relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-2xl opacity-50" />
                        <div className="relative bg-white/5 border border-white/10 p-12">
                            <div className="flex items-start gap-6 max-w-4xl mx-auto">
                                <span className="text-5xl">💡</span>
                                <div>
                                    <h3 className={`${playfair.className} font-bold text-3xl mb-4 text-white`}>
                                        Today's Reflection
                                    </h3>
                                    <p className={`${inter.className} text-white/70 leading-relaxed text-lg mb-4 italic`}>
                                        "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                                    </p>
                                    <p className={`${inter.className} text-white/40 text-sm`}>— Aristotle</p>
                                    <p className={`${inter.className} text-white/60 leading-relaxed mt-6`}>
                                        Every entry you make, every metric you track, every system you engage with—these are the small,
                                        deliberate actions that compound into extraordinary results.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
