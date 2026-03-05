'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Navigation } from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowLeft, ShieldCheck, TrendingDown, Crosshair, PiggyBank, RefreshCw, Receipt } from 'lucide-react'
import Link from 'next/link'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts'
import { motion } from 'framer-motion'
import { PlaidLinkButton } from '@/components/ui/plaid-link-button'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

// Custom Recharts Tooltip
const BurnRateTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[#0A0A0E] border border-white/10 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-white/50 text-xs mb-2">Day {label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-sm font-medium text-white">{entry.name}:</span>
                        <span className="text-sm font-mono text-white/80">${entry.value?.toFixed(0) || 0}</span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

const CircularProgress = ({ percentage, colorClass, size = 120, icon: Icon, label, amount }: any) => {
    const strokeWidth = 8
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (percentage / 100) * circumference

    // Clean tailwind colors for stroke
    let strokeColor = "#3b82f6" // fallback
    if (colorClass.includes('rose')) strokeColor = "#f43f5e"
    if (colorClass.includes('emerald')) strokeColor = "#10b981"
    if (colorClass.includes('amber')) strokeColor = "#f59e0b"

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="currentColor"
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        className="text-white/5"
                    />
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="drop-shadow-lg"
                        strokeLinecap="round"
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    <Icon className="w-5 h-5 mb-1 opacity-70" />
                    <span className="text-lg font-bold">{percentage.toFixed(0)}%</span>
                </div>
            </div>
            <div className="mt-4 text-center">
                <div className="text-[10px] uppercase tracking-widest text-white/50">{label}</div>
                <div className="font-mono text-sm mt-1">${amount.toFixed(0)} Avg</div>
            </div>
        </div>
    )
}

export default function BudgetPlannerPage() {
    const [userId, setUserId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any>(null)

    useEffect(() => {
        const fetchUserAndData = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                setUserId(user.id)
                await fetchBudgetData(user.id)
            } else {
                setUserId('defaultUser')
                await fetchBudgetData('defaultUser')
            }
        }

        fetchUserAndData()
    }, [])

    const fetchBudgetData = async (uid: string) => {
        try {
            setLoading(true)
            const res = await fetch(`/api/plaid/budget-data?userId=${uid}`)
            const result = await res.json()
            setData(result)
        } catch (error) {
            console.error("Failed to compile budget data:", error)
        } finally {
            setLoading(false)
        }
    }

    // Default target parameters for calculations
    const totalIncomeEstimate = (data?.buckets?.fixed || 0) + (data?.buckets?.goals || 0) + (data?.buckets?.flexible || 0) || 1;

    // Percentages of total spending based on historical 6 months baseline
    const fixedPerc = Math.min(100, ((data?.buckets?.fixed || 0) / totalIncomeEstimate) * 100)
    const goalsPerc = Math.min(100, ((data?.buckets?.goals || 0) / totalIncomeEstimate) * 100)
    const flexPerc = Math.min(100, ((data?.buckets?.flexible || 0) / totalIncomeEstimate) * 100)

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050508] text-white flex items-center justify-center flex-col gap-4">
                <RefreshCw className="w-8 h-8 text-white/20 animate-spin" />
                <div className="text-sm text-white/40 uppercase tracking-widest">Compiling Zero-Knowledge Pass-Through...</div>
            </div>
        )
    }

    if (data?.error) {
        return (
            <div className="min-h-screen bg-[#050508] text-white p-6 relative overflow-hidden">
                <Navigation />
                <div className="max-w-7xl mx-auto mt-24 text-center">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-rose-500/50" />
                    <h1 className={`${playfair.className} text-4xl mb-4`}>Connection Error</h1>
                    <p className="max-w-md mx-auto text-white/50 mb-8">
                        The Zero-Knowledge Budget Planner encountered an issue while compiling data. This is often due to missing sandbox transaction data.
                    </p>
                    <p className="text-rose-400 text-sm">{data.error}</p>
                    <div className="mt-8">
                        <Link href="/systems/money" className="text-emerald-400 hover:underline text-sm uppercase tracking-widest">
                            Return to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (data?.status === 'no_accounts') {
        return (
            <div className="min-h-screen bg-[#050508] text-white p-6 relative overflow-hidden">
                <Navigation />
                <div className="max-w-7xl mx-auto mt-24 text-center">
                    <ShieldCheck className="w-16 h-16 mx-auto mb-6 text-emerald-500/50" />
                    <h1 className={`${playfair.className} text-4xl mb-4`}>Connect to Activate</h1>
                    <p className="max-w-md mx-auto text-white/50 mb-8">
                        The Zero-Knowledge Budget Planner requires a Plaid connection to establish your target spending baseline purely from RAM.
                    </p>
                    {userId && <PlaidLinkButton userId={userId} onSuccess={() => fetchBudgetData(userId)} />}
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#050508] text-white font-sans overflow-x-hidden pb-32">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.03),transparent_50%)]" />

            <Navigation />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
                {/* Header Section */}
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link href="/systems/money" className="inline-flex items-center text-[10px] uppercase tracking-widest text-white/40 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-3 h-3 mr-2" />
                            Money System
                        </Link>
                        <h1 className={`${playfair.className} text-4xl md:text-5xl font-bold tracking-tight text-white mb-3`}>
                            Budget Planner
                        </h1>
                        <p className={`${inter.className} text-white/50 max-w-2xl leading-relaxed`}>
                            Your real-time spending tracker driven by the strict privacy of Zero-Knowledge Pass-Through processing.
                        </p>
                    </div>

                    {/* Privacy Badge Requirement */}
                    <div className="bg-[#0A0A0E] border border-white/5 shadow-2xl rounded-2xl p-4 flex items-center gap-4 shrink-0 max-w-xs md:max-w-sm">
                        <div className="bg-emerald-500/10 p-3 rounded-full shrink-0">
                            <ShieldCheck className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold uppercase tracking-widest text-emerald-400/80 mb-1">Pass-Through Active</div>
                            <div className="text-[10px] text-white/40 leading-tight">
                                Powered by Plaid. Zero transaction data stored on our servers. Compiled entirely in RAM.
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6 mb-8">
                    {/* The Safe To Spend Metric */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <Card className="bg-gradient-to-br from-blue-900/10 to-transparent border-blue-500/20 shadow-2xl h-full">
                            <CardContent className="p-8 pb-10 flex flex-col justify-between h-full relative overflow-hidden">
                                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full mix-blend-screen" />
                                <div>
                                    <div className="text-[10px] uppercase tracking-[0.3em] text-blue-400/70 mb-8 font-semibold flex items-center gap-2">
                                        <Crosshair className="w-4 h-4" />
                                        Safe-to-Spend Target
                                    </div>
                                    <div className={`${playfair.className} text-6xl font-bold bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent mb-4`}>
                                        ${data?.safeToSpend?.toFixed(0)}
                                    </div>
                                    <div className="text-xs text-white/40 leading-relaxed font-mono">
                                        Current Balances - (Remaining Fixed Bills + Remaining Savings Goal)
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* The 3 Buckets Heuristic Rings */}
                    <Card className="bg-[#0A0A0E] border-white/5 shadow-2xl lg:col-span-2">
                        <CardHeader>
                            <CardTitle className="text-xs uppercase tracking-[0.2em] text-white/40">The 3 Buckets (6-Month Baseline Average)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-4 py-4">
                                <CircularProgress
                                    percentage={fixedPerc}
                                    colorClass="text-rose-400"
                                    icon={Receipt}
                                    label="Fixed Bills"
                                    amount={data?.buckets?.fixed || 0}
                                />
                                <CircularProgress
                                    percentage={goalsPerc}
                                    colorClass="text-emerald-400"
                                    icon={PiggyBank}
                                    label="Goals/Savings"
                                    amount={data?.buckets?.goals || 0}
                                />
                                <CircularProgress
                                    percentage={flexPerc}
                                    colorClass="text-amber-400"
                                    icon={TrendingDown}
                                    label="Flexible Spend"
                                    amount={data?.buckets?.flexible || 0}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Burn Rate Line Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                    <Card className="bg-[#0A0A0E] border-white/5 shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-xs uppercase tracking-[0.2em] text-white/40">Current Month Flexible Burn Rate vs Target Pace</CardTitle>
                            <CardDescription className="text-[10px] text-white/30 uppercase tracking-widest">
                                Tracking day-by-day accumulation against ideal linear consumption
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[350px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={data?.burnRate} margin={{ top: 20, right: 10, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="day"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }}
                                            tickFormatter={(val) => `$${val}`}
                                            dx={-10}
                                        />
                                        <Tooltip content={<BurnRateTooltip />} />
                                        <Line
                                            type="monotone"
                                            name="Ideal Pace"
                                            dataKey="target"
                                            stroke="rgba(255,255,255,0.2)"
                                            strokeWidth={2}
                                            strokeDasharray="4 4"
                                            dot={false}
                                            activeDot={false}
                                        />
                                        <Line
                                            type="monotone"
                                            name="Actual Spent"
                                            dataKey="actual"
                                            stroke="#f59e0b"
                                            strokeWidth={3}
                                            dot={{ r: 0, fill: '#f59e0b', strokeWidth: 0 }}
                                            activeDot={{ r: 6, fill: '#f59e0b', stroke: 'rgba(255,255,255,0.5)', strokeWidth: 2 }}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    )
}
