'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { motion } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { dataStore, Entry, System } from '@/lib/data-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Sparkles, Wallet, TrendingDown, TrendingUp, PieChart, Banknote, CalendarClock, ShieldCheck, PiggyBank, Receipt } from 'lucide-react'
import { Button } from '@/components/ui/button'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

type MoneySection = {
    key: string
    title: string
    description: string
    icon: React.ReactNode
    openPath: string
    newPath: string
    items: number
}

export default function MoneyPage() {
    const [system, setSystem] = useState<System | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entries, setEntries] = useState<Record<string, Entry[]>>({})

    useEffect(() => {
        const s = dataStore.getSystem('money')
        setSystem(s || null)
    }, [])

    useEffect(() => {
        const loadUser = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setUserId(user?.id || 'defaultUser')
        }
        loadUser()
    }, [])

    useEffect(() => {
        const load = async () => {
            if (!system) return
            const map: Record<string, Entry[]> = {}
            await Promise.all(system.microapps.map(async (app) => {
                const list = await dataStore.getEntries(app.id, userId)
                map[app.id] = list
            }))
            setEntries(map)
        }
        load()
    }, [system, userId])

    const totalIncome = useMemo(() => {
        const list = entries['income'] || []
        return list.reduce((sum, e) => sum + (Number(e.data['Amount']) || 0), 0)
    }, [entries])

    const totalExpenses = useMemo(() => {
        const list = entries['expenses'] || []
        return list.reduce((sum, e) => sum + (Number(e.data['Amount']) || 0), 0)
    }, [entries])

    const subsMonthly = useMemo(() => {
        const list = entries['subscriptions'] || []
        return list.reduce((sum, e) => sum + (Number(e.data['Amount']) || 0), 0)
    }, [entries])

    const savingsProgress = useMemo(() => {
        const list = entries['savings-goals'] || []
        if (list.length === 0) return 0
        const totalTarget = list.reduce((sum, e) => sum + (Number(e.data['Target Amount']) || 0), 0)
        const totalCurrent = list.reduce((sum, e) => sum + (Number(e.data['Current Amount']) || 0), 0)
        if (totalTarget === 0) return 0
        return Math.min(100, Math.round((totalCurrent / totalTarget) * 100))
    }, [entries])

    const moneySections: MoneySection[] = [
        {
            key: 'budget',
            title: 'Budget',
            description: 'Plan months and keep spend in check.',
            icon: <PieChart className="w-5 h-5 text-amber-200" />,
            openPath: '/systems/money/budget',
            newPath: '/systems/money/budget?new=1',
            items: entries['budget']?.length || 0
        },
        {
            key: 'expenses',
            title: 'Expenses',
            description: 'Track daily spend and leaks.',
            icon: <TrendingDown className="w-5 h-5 text-rose-200" />,
            openPath: '/systems/money/expenses',
            newPath: '/systems/money/expenses?new=1',
            items: entries['expenses']?.length || 0
        },
        {
            key: 'income',
            title: 'Income',
            description: 'Log inflows across streams.',
            icon: <TrendingUp className="w-5 h-5 text-emerald-200" />,
            openPath: '/systems/money/income',
            newPath: '/systems/money/income?new=1',
            items: entries['income']?.length || 0
        },
        {
            key: 'subscriptions',
            title: 'Subscriptions',
            description: 'Recurring charges and renewals.',
            icon: <Receipt className="w-5 h-5 text-sky-200" />,
            openPath: '/systems/money/subscriptions',
            newPath: '/systems/money/subscriptions?new=1',
            items: entries['subscriptions']?.length || 0
        },
        {
            key: 'savings-goals',
            title: 'Savings',
            description: 'Targets, balances, progress.',
            icon: <PiggyBank className="w-5 h-5 text-lime-200" />,
            openPath: '/systems/money/savings-goals',
            newPath: '/systems/money/savings-goals?new=1',
            items: entries['savings-goals']?.length || 0
        }
    ]

    if (!system) return null

    const net = totalIncome - totalExpenses

    return (
        <div className="min-h-screen bg-[#050508] text-white">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_30%),radial-gradient(circle_at_40%_80%,rgba(234,179,8,0.12),transparent_30%)]" />
                <div className="absolute inset-0 opacity-[0.03]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="money-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#money-grid)" />
                    </svg>
                </div>
            </div>

            <Navigation isAuthenticated />
            <div className="h-16" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                <div className="flex items-center gap-3 text-white/60">
                    <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition">
                        <ArrowLeft className="w-4 h-4" /> Back
                    </Link>
                    <span className="text-white/30">/</span>
                    <span className="uppercase tracking-[0.3em] text-xs">Money</span>
                </div>

                <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-start">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-6"
                    >
                        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
                            <div className="flex items-center gap-3 text-emerald-200">
                                <Sparkles className="w-5 h-5" />
                                <span className="text-xs uppercase tracking-[0.3em] text-white/60">Money x Spendee</span>
                            </div>
                            <h1 className={`${playfair.className} text-5xl font-bold mt-4 mb-3`}>
                                Control cashflow with clarity
                            </h1>
                            <p className={`${inter.className} text-lg text-white/70 max-w-3xl`}>
                                Real-time snapshot of income, spend, and recurring commitments. Every microapp below is wired—no rebuild needed.
                            </p>
                            <div className="mt-6 grid sm:grid-cols-2 gap-3">
                                <Link href="/systems/money/income" className="rounded-xl border border-white/15 bg-white text-black text-center py-3 hover:bg-white/90 transition">
                                    Log Income
                                </Link>
                                <Link href="/systems/money/expenses" className="rounded-xl border border-white/15 bg-black/60 text-white text-center py-3 hover:bg-white/10 transition">
                                    Add Expense
                                </Link>
                            </div>
                        </div>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    Snapshot
                                    <Wallet className="w-5 h-5 text-white/60" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Income</p>
                                    <p className="text-2xl font-bold mt-2">${totalIncome.toFixed(0)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Expenses</p>
                                    <p className="text-2xl font-bold mt-2">${totalExpenses.toFixed(0)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-indigo-200">Net</p>
                                    <p className="text-2xl font-bold mt-2">${net.toFixed(0)}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-xs uppercase tracking-[0.2em] text-amber-200">Subs / mo</p>
                                    <p className="text-2xl font-bold mt-2">${subsMonthly.toFixed(0)}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader>
                                <CardTitle className="text-white flex items-center gap-2">
                                    PARA-style control
                                    <ShieldCheck className="w-5 h-5 text-white/60" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-4">
                                {moneySections.map((section) => (
                                    <div key={section.key} className="relative rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
                                        <div className="p-5 space-y-3">
                                            <div className="flex items-center gap-3 text-white">
                                                {section.icon}
                                                <div>
                                                    <p className="text-xs uppercase tracking-[0.25em] text-white/50">Money</p>
                                                    <h3 className="text-2xl font-semibold">{section.title}</h3>
                                                </div>
                                                <span className="ml-auto text-xs text-white/60">{section.items} items</span>
                                            </div>
                                            <p className={`${inter.className} text-white/70`}>{section.description}</p>
                                        </div>
                                        <div className="grid grid-cols-2 border-t border-white/10 divide-x divide-white/10">
                                            <Link href={section.openPath} className="block text-center text-white py-3 hover:bg-white/10 transition">
                                                Open
                                            </Link>
                                            <Link href={section.newPath} className="block text-center text-white py-3 hover:bg-white/10 transition">
                                                Create
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6"
                    >
                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex items-center gap-2">
                                <CalendarClock className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Recurring radar</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {(entries['subscriptions'] || []).slice(0, 5).map(sub => (
                                    <Link
                                        key={sub.id}
                                        href={`/systems/money/subscriptions?id=${sub.id}`}
                                        className="block p-3 rounded-xl border border-white/10 bg-black/30 hover:border-white/40 transition"
                                    >
                                        <div className="flex items-center justify-between text-white">
                                            <span className="font-semibold">{sub.data['Name'] || 'Subscription'}</span>
                                            <span className="text-sm text-white/60">${Number(sub.data['Amount'] || 0).toFixed(0)}</span>
                                        </div>
                                        <p className="text-xs text-white/50">Next: {sub.data['Next Charge'] || 'N/A'}</p>
                                    </Link>
                                ))}
                                {((entries['subscriptions'] || []).length === 0) && (
                                    <div className="text-white/60 text-sm">No subscriptions yet.</div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="bg-white/5 border-white/10">
                            <CardHeader className="flex items-center gap-2">
                                <PiggyBank className="w-5 h-5 text-white/60" />
                                <CardTitle className="text-white">Savings goals</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-lime-400 to-emerald-500" style={{ width: `${savingsProgress}%` }} />
                                </div>
                                <p className="text-sm text-white/70">{savingsProgress}% funded across goals</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}
