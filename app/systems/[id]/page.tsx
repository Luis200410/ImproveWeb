'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { dataStore, System } from '@/lib/data-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Playfair_Display, Inter } from 'next/font/google'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { ArrowLeft, Sparkles, ArrowRight, Database, Eye, Layers } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

export default function SystemPage() {
    const params = useParams()
    const router = useRouter()
    const [system, setSystem] = useState<System | null>(null)
    const [entryCounts, setEntryCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        const systemId = params.id as string
        const foundSystem = dataStore.getSystems().find(s => s.id === systemId)
        setSystem(foundSystem || null)

        if (foundSystem) {
            const loadCounts = async () => {
                const counts: Record<string, number> = {}
                await Promise.all(foundSystem.microapps.map(async (microapp) => {
                    const entries = await dataStore.getEntries(microapp.id)
                    counts[microapp.id] = entries.length
                }))
                setEntryCounts(counts)
            }
            loadCounts()
        }
    }, [params.id])

    if (!system) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-white/60 mb-4">System not found</p>
                    <Link href="/dashboard">
                        <button className="border border-white text-white px-4 py-2">
                            Return to Dashboard
                        </button>
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{
                        duration: 11,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 right-1/4 w-[650px] h-[650px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.25, 0.1],
                    }}
                    transition={{
                        duration: 14,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1.5
                    }}
                    className="absolute bottom-1/4 left-1/3 w-[550px] h-[550px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"
                />

                <div className="absolute inset-0 opacity-[0.02]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="system-grid" width="70" height="70" patternUnits="userSpaceOnUse">
                                <path d="M 70 0 L 0 0 0 70" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#system-grid)" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Navigation isAuthenticated={true} />
                <div className="h-20" />

                <div className="max-w-7xl mx-auto px-8 py-12">
                    {/* Back Button */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-8"
                    >
                        <Link href="/dashboard">
                            <button className="text-white/60 hover:text-white hover:bg-white/5 gap-2 flex items-center px-4 py-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </button>
                        </Link>
                    </motion.div>

                    {/* System Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mb-16 text-center"
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                            className="text-8xl mb-6 inline-block"
                        >
                            {system.icon}
                        </motion.div>

                        <div className="inline-flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4 text-white/60" />
                            <p className="text-xs uppercase tracking-[0.3em] text-white/40">System</p>
                            <Sparkles className="w-4 h-4 text-white/60" />
                        </div>

                        <h1 className={`${playfair.className} text-6xl md:text-7xl font-bold mb-6 text-white`}>
                            {system.name}
                        </h1>
                        <p className={`${inter.className} text-xl text-white/60 max-w-3xl mx-auto leading-relaxed`}>
                            {system.description}
                        </p>
                    </motion.div>

                    {/* Microapps Grid */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="flex items-center gap-6 mb-8"
                        >
                            <h2 className={`${playfair.className} text-4xl font-bold text-white`}>
                                Microapps
                            </h2>
                            <div className="h-px bg-white/10 flex-1" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {system.microapps.map((microapp, index) => {
                                const entryCount = entryCounts[microapp.id] || 0

                                return (
                                    <motion.div
                                        key={microapp.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        href={microapp.customPath || `/systems/${system.id}/${microapp.id}`}
                                    >
                                                </div>

                    <div className="border-t border-white/10 pt-4">
                        <motion.div
                            className="flex items-center justify-between text-xs uppercase tracking-wider font-medium"
                            whileHover={{ x: 5 }}
                        >
                            <span className="text-white/40">Open</span>
                            <span className="text-white flex items-center gap-1">
                                View <ArrowRight className="w-3 h-3" />
                            </span>
                        </motion.div>
                    </div>
                </CardContent>
                    </Card>
                </div>
            </Link >
        </motion.div >
    )
})}
                </motion.div >
            </div >
        </div >
            </div >
        </div >
    )
}
