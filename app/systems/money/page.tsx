'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { motion, AnimatePresence } from 'framer-motion'
import { dataStore, Entry, System } from '@/lib/data-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Sparkles, TrendingDown, TrendingUp, PieChart, Banknote, ShieldCheck, PiggyBank, Receipt, DollarSign, Activity, AlertCircle, ArrowUpRight, CreditCard, Landmark, Loader2, History, Shield, Zap } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { PlaidLinkButton } from '@/components/ui/plaid-link-button'
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

// Recharts Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-black/90 border border-white/10 p-3 rounded-lg shadow-xl">
                <p className="text-white/60 text-xs uppercase tracking-widest mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="font-mono text-sm">
                        {entry.name}: ${entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

export default function MoneyPage() {
    const [system, setSystem] = useState<System | null>(null)
    const [userId, setUserId] = useState<string>('defaultUser')
    const [entries, setEntries] = useState<Record<string, Entry[]>>({})

    // Plaid States
    const [plaidAccounts, setPlaidAccounts] = useState<any[]>([])
    const [plaidHoldings, setPlaidHoldings] = useState<any[]>([])
    const [isLoadingPlaid, setIsLoadingPlaid] = useState(true)

    // Account Sidebar States
    const [selectedAccount, setSelectedAccount] = useState<any | null>(null)
    const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false)
    const [accountTransactions, setAccountTransactions] = useState<any[]>([])
    const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
    const [annualChartData, setAnnualChartData] = useState<any[]>([
        { month: 'Jan', income: 0, expense: 0 },
        { month: 'Feb', income: 0, expense: 0 },
        { month: 'Mar', income: 0, expense: 0 },
        { month: 'Apr', income: 0, expense: 0 },
        { month: 'May', income: 0, expense: 0 },
        { month: 'Jun', income: 0, expense: 0 },
        { month: 'Jul', income: 0, expense: 0 },
        { month: 'Aug', income: 0, expense: 0 },
        { month: 'Sep', income: 0, expense: 0 },
        { month: 'Oct', income: 0, expense: 0 },
        { month: 'Nov', income: 0, expense: 0 },
        { month: 'Dec', income: 0, expense: 0 },
    ])

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
        const loadSupabaseData = async () => {
            if (!system) return
            const map: Record<string, Entry[]> = {}
            await Promise.all(system.microapps.map(async (app) => {
                const list = await dataStore.getEntries(app.id, userId)
                map[app.id] = list
            }))
            setEntries(map)
        }
        loadSupabaseData()
    }, [system, userId])

    // Load Plaid Data
    useEffect(() => {
        const fetchPlaidData = async () => {
            if (!userId) {
                setIsLoadingPlaid(false)
                return
            }
            try {
                const [acctRes, cashflowRes] = await Promise.all([
                    fetch(`/api/plaid/accounts?userId=${userId}`),
                    fetch(`/api/plaid/cashflow-data?userId=${userId}`)
                ]);

                if (acctRes.ok) {
                    const data = await acctRes.json()
                    setPlaidAccounts(data.accounts || [])
                    setPlaidHoldings(data.holdings || [])
                }
                if (cashflowRes.ok) {
                    const data = await cashflowRes.json()
                    if (data.chartData) setAnnualChartData(data.chartData)
                }
            } catch (err) {
                console.error("Failed to load plaid accounts", err)
            } finally {
                setIsLoadingPlaid(false)
            }
        }
        fetchPlaidData()
    }, [userId])

    // Calculate Balances 
    const cashBalance = useMemo(() => {
        return plaidAccounts
            .filter(a => a.type === 'depository')
            .reduce((sum, a) => sum + (a.balances.available || a.balances.current || 0), 0)
    }, [plaidAccounts])

    const creditLiabilities = useMemo(() => {
        return plaidAccounts
            .filter(a => a.type === 'credit')
            .reduce((sum, a) => sum + (a.balances.current || 0), 0)
    }, [plaidAccounts])

    const investmentBalance = useMemo(() => {
        // Holdings contain quantities and prices. Recreate balance from holdings.
        const holdingsTotal = plaidHoldings.reduce((sum, h) => sum + ((h.quantity || 0) * (h.institution_price || 0)), 0)

        // Also add generic investment accounts if holdings couldn't be loaded separately
        const investmentAcctTotal = plaidAccounts
            .filter(a => a.type === 'investment' || a.type === 'brokerage')
            .reduce((sum, a) => sum + (a.balances.current || 0), 0)

        return holdingsTotal > 0 ? holdingsTotal : investmentAcctTotal
    }, [plaidAccounts, plaidHoldings])

    const netWorth = (cashBalance + investmentBalance) - creditLiabilities

    // The Safe-To-Spend Engine
    // Upcoming Bills (Subscriptions)
    const upcomingBills = useMemo(() => {
        const list = entries['subscriptions'] || []
        return list.reduce((sum, e) => sum + (Number(e.data['Amount']) || 0), 0)
    }, [entries])

    // Monthly Savings Goal
    const monthlySavingsTarget = useMemo(() => {
        // E.g., taking total active goals and splitting by months etc.
        // For now, let's assume they contribute a set % of total target monthly based on 'Target Amount'
        const list = entries['savings-goals'] || []
        const totalTarget = list.reduce((sum, e) => sum + (Number(e.data['Target Amount']) || 0), 0)
        return totalTarget > 0 ? totalTarget * 0.05 : 0 // Assume returning 5% of ambitious goals per month
    }, [entries])

    // Automated Sinking Funds
    const sinkingFundsTotal = useMemo(() => {
        const list = entries['sinking-funds'] || []
        return list.reduce((sum, e) => {
            const totalCost = Number(e.data['Target Amount']) || 0;
            return sum + (totalCost > 0 ? totalCost * 0.1 : 0); // assume 10 months avg for mockup
        }, 0)
    }, [entries])

    // STS immediately deducts Credit Liabilities to prevent visibility alibi
    const safeToSpend = Math.max(0, cashBalance - creditLiabilities - (upcomingBills + monthlySavingsTarget + sinkingFundsTotal))

    // Velocity Score
    const velocityScore = useMemo(() => {
        const currentMonthIndex = new Date().getMonth();
        const currentMonthData = annualChartData[currentMonthIndex];
        const actualSavings = (currentMonthData?.income || 0) - (currentMonthData?.expense || 0);
        // If income hasn't started yet but expense did, or we don't have enough data:
        if (actualSavings <= 0 && monthlySavingsTarget === 0) return 0;
        const planned = monthlySavingsTarget > 0 ? monthlySavingsTarget : 500; // fallback 500
        return Math.max(0, actualSavings / planned);
    }, [annualChartData, monthlySavingsTarget])

    // Daily Burn Rate
    const dailyBurnRate = useMemo(() => {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const daysRemaining = daysInMonth - now.getDate() + 1;
        return safeToSpend / daysRemaining;
    }, [safeToSpend])

    // Mock Chart Data for Zero-Knowledge Reports 
    // Usually built from real YTD data, simplified here for the dashboard visual
    // -> Now provided by annualChartData state from the Cashflow API

    // Action Center Alert Logic
    const highIdleCash = safeToSpend > 2000
    const isWindfallActive = annualChartData[new Date().getMonth()]?.income > 5000;
    const isAlibiInterceptorActive = velocityScore > 0 && velocityScore < 1.0;

    const sections = [
        { key: 'budget', title: 'Budget', icon: <PieChart size={18} />, colorClass: 'bg-amber-500/10 text-amber-400' },
        { key: 'expenses', title: 'Expenses', icon: <TrendingDown size={18} />, colorClass: 'bg-rose-500/10 text-rose-400' },
        { key: 'income', title: 'Income', icon: <TrendingUp size={18} />, colorClass: 'bg-emerald-500/10 text-emerald-400' },
        { key: 'subscriptions', title: 'Subscriptions', icon: <Receipt size={18} />, colorClass: 'bg-sky-500/10 text-sky-400' },
        { key: 'savings-goals', title: 'Savings Goals', icon: <PiggyBank size={18} />, colorClass: 'bg-lime-500/10 text-lime-400' },
        { key: 'investment-hub', title: 'Investment Hub', icon: <TrendingUp size={18} />, colorClass: 'bg-blue-500/10 text-blue-400' },
        { key: 'net-worth-radar', title: 'Net Worth Radar', icon: <Activity size={18} />, colorClass: 'bg-indigo-500/10 text-indigo-400' },
    ]

    if (!system) return null

    return (
        <div className="min-h-screen bg-[#020204] text-white font-sans overflow-x-hidden pb-32 selection:bg-emerald-500/30">
            {/* Background Mesh Gradients */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute top-[30%] right-[10%] w-[20%] h-[30%] bg-indigo-500/5 rounded-full blur-[80px]" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 pointer-events-none" />
            </div>




            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-10 relative">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-white/40">
                            <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition group">
                                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exit Command</span>
                            </Link>
                            <span className="text-white/10 opacity-30">|</span>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="uppercase tracking-[0.4em] text-[10px] font-black text-emerald-500/80">System Engine Live</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h1 className={`${playfair.className} text-5xl md:text-7xl font-bold tracking-tighter text-white`}>
                                Wealth <span className="text-white/20">Command</span>
                            </h1>
                            <div className="flex items-center gap-3">
                                <div className="h-px w-12 bg-emerald-500/30" />
                                <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white/20">Zero-Knowledge Financial OS</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-6">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-xl shadow-2xl">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                                <Shield size={20} />
                            </div>
                            <div className="text-right pr-2">
                                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60 mb-1">Liquidity Status</div>
                                <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Optimal Performance</div>
                            </div>
                        </div>
                        {userId && (
                            <div className="flex items-center gap-3">
                                {isLoadingPlaid ? (
                                    <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                        <Loader2 className="w-3 h-3 animate-spin text-white/40" />
                                        <span className="text-[9px] uppercase tracking-widest font-black text-white/40">Syncing Nodes</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                        <span className="text-[9px] uppercase tracking-widest font-black text-emerald-400">{plaidAccounts.length} ACTIVE NODES</span>
                                    </div>
                                )}
                                <PlaidLinkButton 
                                    userId={userId} 
                                    onSuccess={() => {
                                        setIsLoadingPlaid(true);
                                        Promise.all([
                                            fetch(`/api/plaid/accounts?userId=${userId}`),
                                            fetch(`/api/plaid/cashflow-data?userId=${userId}`)
                                        ]).then(() => window.location.reload());
                                    }} 
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Top Dash: Net Worth & Safe to Spend */}
                <div className="grid lg:grid-cols-[1fr,1.3fr] gap-6 items-stretch">

                    {/* Safe to Spend Engine */}
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}>
                        <Card className="h-full bg-gradient-to-br from-white/[0.05] to-transparent border-emerald-500/20 shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden relative backdrop-blur-2xl group/engine">
                            <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-emerald-500/[0.03] via-transparent to-transparent pointer-events-none" />
                            <div className="absolute top-0 right-0 p-8">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover/engine:scale-110 transition-transform duration-500">
                                    <Banknote size={24} />
                                </div>
                            </div>
                            <CardContent className="p-10 h-full flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-3 text-emerald-400/80 mb-8">
                                        <div className="relative">
                                            <Sparkles className="w-5 h-5 animate-pulse" />
                                            <div className="absolute inset-0 bg-emerald-500/40 blur-lg animate-pulse" />
                                        </div>
                                        <span className="text-[10px] uppercase tracking-[0.4em] font-black">Liquid Capital Availability</span>
                                    </div>
                                    <div className="relative">
                                        <div className={`${playfair.className} text-9xl font-bold tracking-tighter text-white mb-6`}>
                                            ${safeToSpend.toFixed(0)}
                                        </div>
                                        <div className="absolute -top-4 -right-12 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[9px] font-bold text-emerald-300 uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                            Safe to Spend
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-white/30 text-[10px] font-mono uppercase tracking-widest">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/40" />
                                            Cash: <span className="text-white/60">${cashBalance.toFixed(0)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-400/40" />
                                            Debt: <span className="text-white/60">${creditLiabilities.toFixed(0)}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-sky-400/40" />
                                            Bills: <span className="text-white/60">${upcomingBills.toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Velocity & Burn Rate Metrics */}
                                <div className="grid grid-cols-2 gap-6 mt-12">
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-emerald-400/60 font-bold mb-3 flex items-center justify-between">
                                            Velocity Score
                                            <Activity size={12} />
                                        </div>
                                        <div className={`text-4xl font-mono tracking-tighter ${velocityScore >= 1.0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                            {velocityScore.toFixed(2)}<span className="text-lg opacity-40">v</span>
                                        </div>
                                        <p className="text-[9px] text-white/20 uppercase font-bold mt-3 tracking-widest">
                                            {velocityScore >= 1.0 ? 'Accelerating Wealth' : 'Efficiency Decay'}
                                        </p>
                                    </div>
                                    <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-sky-500/20 transition-all duration-300">
                                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="text-[10px] uppercase tracking-[0.2em] text-sky-400/60 font-bold mb-3 flex items-center justify-between">
                                            Daily Allowance
                                            <TrendingDown size={12} />
                                        </div>
                                        <div className="text-4xl font-mono tracking-tighter text-white">
                                            ${dailyBurnRate.toFixed(0)}<span className="text-lg opacity-40">/d</span>
                                        </div>
                                        <p className="text-[9px] text-white/20 uppercase font-bold mt-3 tracking-widest">
                                            Dynamic burn throttle
                                        </p>
                                    </div>
                                </div>

                                {/* Action Center Overlay */}
                                <div className="mt-8">
                                    {isWindfallActive ? (
                                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 flex gap-5 items-start relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-indigo-500/[0.03] animate-pulse" />
                                            <div className="bg-indigo-500/20 p-3 rounded-xl text-indigo-400 relative z-10">
                                                <Sparkles className="w-6 h-6" />
                                            </div>
                                            <div className="relative z-10 w-full">
                                                <p className="font-bold text-white mb-1.5 uppercase tracking-wide text-sm">Windfall Strategy Active</p>
                                                <p className="text-xs text-white/40 mb-5 leading-relaxed">
                                                    Abnormal deposit detected. Deploy wealth capture workflow to prevent lifestyle creep.
                                                </p>
                                                <Button variant="outline" className="text-[10px] h-9 bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500 hover:text-white transition-all w-full font-bold tracking-widest uppercase">
                                                    Execute Fund Allocation
                                                </Button>
                                            </div>
                                        </div>
                                    ) : isAlibiInterceptorActive ? (
                                        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-5 flex gap-5 items-start relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-rose-500/[0.03] animate-pulse" />
                                            <div className="bg-rose-500/20 p-3 rounded-xl text-rose-400 relative z-10">
                                                <AlertCircle className="w-6 h-6" />
                                            </div>
                                            <div className="relative z-10 w-full">
                                                <p className="font-bold text-white mb-1.5 uppercase tracking-wide text-sm flex items-center gap-2">
                                                    The Alibi Interceptor
                                                    <span className="bg-rose-500/20 text-[8px] px-2 py-0.5 rounded-full text-rose-300 font-black">CRITICAL</span>
                                                </p>
                                                <p className="text-xs text-white/40 mb-5 leading-relaxed">
                                                    Spending variance detected. Rebalance goals to sustain zero-alibi integrity.
                                                </p>
                                                <Button variant="outline" className="text-[10px] h-9 bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500 hover:text-white transition-all w-full font-bold tracking-widest uppercase">
                                                    Re-align Objectives
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-5 flex gap-5 items-center backdrop-blur-sm">
                                            <div className="bg-emerald-500/20 p-3 rounded-xl text-emerald-400">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm uppercase tracking-wide">Financial Integrity Maintained</p>
                                                <p className="text-[11px] text-white/40 mt-1">
                                                    Your Velocity Score confirms positive compounding trajectory.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>


                    {/* Net Worth Radar & Investments */}
                    <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.1 }}>
                        <Card className="h-full bg-gradient-to-br from-white/[0.03] to-transparent border-white/10 backdrop-blur-3xl shadow-2xl overflow-hidden group/radar">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <CardHeader className="p-8 pb-2">
                                <CardTitle className="text-[10px] uppercase tracking-[0.4em] text-white/40 flex items-center justify-between font-black">
                                    <span>Global Asset Radar</span>
                                    <Activity className="w-4 h-4 text-blue-400" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 pt-4">
                                <div className="flex flex-col gap-2 mb-10">
                                    <span className="text-[10px] text-white/30 font-mono uppercase tracking-widest">Total Net Liquidity</span>
                                    <span className={`${playfair.className} text-6xl font-bold text-white tracking-tighter`}>
                                        ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                                    <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                        <div className="text-[9px] uppercase tracking-[0.2em] text-emerald-400/60 font-black">Liquid Cash</div>
                                        <div className="font-mono text-xl text-white font-bold">${cashBalance.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                        <div className="text-[9px] uppercase tracking-[0.2em] text-blue-400/60 font-black">Investments</div>
                                        <div className="font-mono text-xl text-white font-bold">${investmentBalance.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-2 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                        <div className="text-[9px] uppercase tracking-[0.2em] text-rose-400/60 font-black">Liabilities</div>
                                        <div className="font-mono text-xl text-white font-bold">${creditLiabilities.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Financial Freedom Progress */}
                                <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-blue-500/5 to-transparent border border-indigo-500/20 relative overflow-hidden group/freedom">
                                    <div className="absolute inset-0 bg-indigo-500/[0.02] mix-blend-overlay" />
                                    <div className="flex justify-between items-end mb-4 relative z-10">
                                        <div className="space-y-1">
                                            <div className="text-[9px] uppercase tracking-[0.3em] text-indigo-300 font-black">Wealth Acquisition Index</div>
                                            <div className="text-[10px] text-white/30 uppercase tracking-tighter font-mono">Based on $1.00M Target</div>
                                        </div>
                                        <div className="text-3xl font-mono font-bold text-white tracking-tighter">
                                            {Math.min(100, Math.max(0, (netWorth / 1000000) * 100)).toFixed(1)}%
                                        </div>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden relative z-10">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(100, Math.max(0, (netWorth / 1000000) * 100))}%` }}
                                            transition={{ duration: 2, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                        />
                                    </div>
                                </div>

                                {highIdleCash && investmentBalance > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-5 flex items-center justify-between group/alert"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-blue-500/20 p-3 rounded-xl text-blue-400 group-hover/alert:scale-110 transition-transform">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-blue-100 uppercase tracking-wide">Capital Optimization Alert</div>
                                                <div className="text-[10px] text-blue-300/60 uppercase tracking-widest mt-0.5">Move ${safeToSpend.toFixed(0)} to Investment Engine</div>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="text-[9px] h-8 bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500 hover:text-white transition-all font-black uppercase tracking-widest">
                                            Execute
                                        </Button>
                                    </motion.div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Connected Accounts & Cards */}
                {isLoadingPlaid ? (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                        <Card className="bg-[#0A0A0E]/50 border-white/5 shadow-2xl backdrop-blur-3xl overflow-hidden border border-white/5 animate-pulse">
                            <CardHeader className="border-b border-white/5 bg-white/[0.01]">
                                <CardTitle className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-400/50 flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                                    Establishing Secure Tunnel...
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="h-40 flex items-center justify-center p-10">
                                <div className="text-[10px] text-white/20 uppercase tracking-[0.5em] font-mono animate-pulse">Verifying Institution Handshakes</div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ) : plaidAccounts.length > 0 ? (
                    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                    Active Financial Nodes
                                </h3>
                                <div className="text-[9px] font-mono text-emerald-500/60 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">
                                    AES-256 ENCRYPTION ACTIVE
                                </div>
                            </div>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {plaidAccounts.map((account, idx) => (
                                    <motion.div
                                        key={idx}
                                        whileHover={{ y: -5, scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setSelectedAccount(account);
                                            setIsAccountSheetOpen(true);
                                            setAccountTransactions([]);
                                            setIsLoadingTransactions(true);
                                            fetch(`/api/plaid/account-transactions?userId=${userId}&accountId=${account.account_id}`)
                                                .then(res => res.json())
                                                .then(data => {
                                                    setAccountTransactions(data.transactions || []);
                                                    setIsLoadingTransactions(false);
                                                });
                                        }}
                                        className="relative p-8 rounded-[2rem] bg-gradient-to-br from-white/[0.05] to-transparent border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer group shadow-2xl overflow-hidden backdrop-blur-xl"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Landmark size={80} className="rotate-12" />
                                        </div>

                                        <div className="flex justify-between items-start mb-10 relative z-10">
                                            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                                {account.type === 'credit' ? <CreditCard size={20} /> : <Landmark size={20} />}
                                            </div>
                                            <span className="text-[9px] font-mono font-bold text-white/30 uppercase border border-white/10 px-3 py-1 rounded-full bg-white/5 backdrop-blur-md">
                                                {account.mask || '****'}
                                            </span>
                                        </div>

                                        <div className="space-y-2 relative z-10">
                                            <h3 className="font-bold text-white tracking-tight text-lg truncate group-hover:text-emerald-400 transition-colors">{account.name}</h3>
                                            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] font-black">{account.subtype || account.type}</p>
                                        </div>

                                        <div className={`text-4xl font-mono mt-8 tracking-tighter relative z-10 ${account.type === 'credit' ? 'text-rose-400' : 'text-white'}`}>
                                            <span className="text-xl opacity-30 mr-1">$</span>
                                            {(account.balances.current || 0).toLocaleString()}
                                        </div>

                                        <div className="mt-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500" />
                                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-emerald-400">View Node Details</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ) : null}

                {/* Mid Dash: Zero Knowledge YTD & Asset Holdings */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-10">
                    {/* Zero Knowledge Reports */}
                    <Card className="bg-white/[0.02] border-white/5 shadow-2xl overflow-hidden backdrop-blur-3xl rounded-[2.5rem] border border-white/10">
                        <CardHeader className="p-10 border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 flex items-center justify-between">
                                <span>Zero-Knowledge Architecture: Financial Velocity Radar</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        <span className="text-[8px]">Inflow</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                        <span className="text-[8px]">Outflow</span>
                                    </div>
                                    <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10">
                            <div className="h-80 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={annualChartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis
                                            dataKey="month"
                                            stroke="#ffffff20"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 700, letterSpacing: '0.1em' }}
                                        />
                                        <YAxis
                                            stroke="#ffffff20"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(val) => `$${val / 1000}k`}
                                            tick={{ fill: 'rgba(255,255,255,0.3)', fontWeight: 700 }}
                                        />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }} />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            name="Inflow"
                                            stroke="#10b981"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorIncome)"
                                            animationDuration={2000}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expense"
                                            name="Outflow"
                                            stroke="#f43f5e"
                                            strokeWidth={4}
                                            fillOpacity={1}
                                            fill="url(#colorExpense)"
                                            animationDuration={2500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Investment Hub Breakdowns */}
                    <Card className="bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-3xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="p-10 border-b border-white/5 bg-white/[0.01]">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40 flex items-center justify-between">
                                <span>Portfolio Stratification</span>
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                    <PieChart size={16} />
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-10 pt-8">
                            {plaidHoldings.length > 0 ? (
                                <div className="space-y-5">
                                    {plaidHoldings.slice(0, 5).map((holding, i) => {
                                        const value = (holding.quantity || 0) * (holding.institution_price || 0)
                                        const perc = ((value / investmentBalance) * 100).toFixed(1)
                                        return (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                                className="flex items-center justify-between p-5 rounded-[1.25rem] bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-blue-500/20 transition-all group"
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/20 flex items-center justify-center font-mono text-xs font-black text-white group-hover:scale-110 transition-transform shadow-lg">
                                                        {holding.ticker_symbol?.substring(0, 3) || 'AST'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-white tracking-tight">{holding.ticker_symbol || 'Unknown Asset'}</div>
                                                        <div className="text-[8px] text-white/20 uppercase tracking-[0.3em] font-black mt-1">{holding.type}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono text-base font-bold text-white tracking-tighter">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                    <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1 opacity-60">{perc}% PORTFOLIO</div>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-center p-10">
                                    <div className="w-20 h-20 rounded-[2rem] bg-white/[0.02] border border-white/5 flex items-center justify-center mb-6 shadow-2xl">
                                        <PieChart size={32} className="text-white/10" />
                                    </div>
                                    <p className="text-sm font-bold text-white uppercase tracking-widest">No Portfolios Detected</p>
                                    <p className="text-[10px] text-white/20 mt-3 uppercase leading-relaxed tracking-widest max-w-[180px]">Link high-equity accounts to activate portfolio analytics.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Legacy Data Micro-Apps and Heat Map */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 flex items-center gap-3">
                            <Activity className="w-4 h-4 text-emerald-500" />
                            Burn-Rate Velocity Matrix
                        </h3>
                        <div className="flex items-center gap-6 text-[8px] uppercase font-black tracking-widest text-white/30">
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-emerald-500/30 border border-emerald-500/50 rounded-full" />
                                Optimal
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-amber-500/30 border border-amber-500/50 rounded-full" />
                                Threshold
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-rose-500/30 border border-rose-500/50 rounded-full" />
                                Critical
                            </div>
                        </div>
                    </div>

                    {/* Heat Map Simulation (Calendar View) */}
                    <Card className="bg-white/[0.02] border border-white/10 shadow-3xl rounded-[2.5rem] overflow-hidden backdrop-blur-3xl group/heatmap">
                        <CardContent className="p-10">
                            <div className="grid grid-cols-7 gap-3">
                                {/* Week Days */}
                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                                    <div key={d} className="text-[9px] text-center uppercase text-white/20 font-black tracking-[0.2em] pb-4">{d}</div>
                                ))}
                                {/* Mockup Days with Rich Data */}
                                {Array.from({ length: 28 }).map((_, i) => {
                                    const dayOfWeek = i % 7;
                                    // Make values deterministic to avoid hydration mismatches
                                    const seededValue = ((i * 12345) % 1000) / 1000;
                                    const dailyTotal = Math.floor(seededValue * 350) + 40;
                                    const efficiency = 100 - Math.floor(seededValue * 40 * (dailyTotal / 400));
                                    
                                    let burnLevel = 'low';
                                    if (dailyTotal > 250) burnLevel = 'high';
                                    else if (dailyTotal > 150) burnLevel = 'medium';

                                    const colorStyles = {
                                        low: 'bg-emerald-500/[0.03] border-emerald-500/10 hover:bg-emerald-500/10 hover:border-emerald-500/30',
                                        medium: 'bg-amber-500/[0.03] border-amber-500/10 hover:bg-amber-500/10 hover:border-amber-500/30',
                                        high: 'bg-rose-500/[0.03] border-rose-500/10 hover:bg-rose-500/10 hover:border-rose-500/30',
                                    };

                                    return (
                                        <motion.div
                                            key={i}
                                            whileHover={{ scale: 1.05, zIndex: 10, y: -5 }}
                                            className={`aspect-square rounded-[1.5rem] border p-3 flex flex-col items-stretch justify-between transition-all cursor-crosshair relative group/day ${colorStyles[burnLevel as keyof typeof colorStyles]}`}
                                        >
                                            {/* Header Section */}
                                            <div className="flex justify-between items-start">
                                                <span className="text-[10px] text-white/10 font-mono group-hover/day:text-white/60 transition-colors">{i + 1}</span>
                                                <div className={`text-[8px] font-mono font-bold tracking-tighter ${efficiency > 90 ? 'text-emerald-400' : efficiency > 75 ? 'text-amber-400' : 'text-rose-400/60'}`}>
                                                    {efficiency}%
                                                </div>
                                            </div>

                                            {/* Value & Visualization */}
                                            <div className="space-y-2">
                                                <div className="text-[11px] font-mono font-black text-white/5 group-hover/day:text-white transition-all">
                                                    <span className="text-[8px] opacity-40 mr-0.5">$</span>{dailyTotal}
                                                </div>
                                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${Math.min((dailyTotal / 400) * 100, 100)}%` }}
                                                        className={`h-full ${burnLevel === 'high' ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' : burnLevel === 'medium' ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]'}`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Status Dot */}
                                            <div className="flex justify-center items-center gap-1">
                                                <div className={`w-1 h-1 rounded-full ${burnLevel === 'high' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]' : burnLevel === 'medium' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]'}`} />
                                            </div>
                                        </motion.div>
                                    )
                                })}
                            </div>

                            <div className="mt-10 flex items-center justify-between p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/80 uppercase tracking-widest">Efficiency Insight</p>
                                        <p className="text-[9px] text-white/30 uppercase tracking-tighter mt-0.5">Your burn-rate remains optimal for 82% of the active period.</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-xl font-mono text-white font-bold tracking-tighter">82<span className="text-[10px] opacity-30 ml-0.5">%</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 pl-2">System Control Nodes</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                            {sections.map((sec) => (
                                <Link key={sec.key} href={`/systems/money/${sec.key}`}>
                                    <motion.div
                                        whileHover={{ y: -5 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="h-full"
                                    >
                                        <Card className="bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all group cursor-pointer h-full relative overflow-hidden rounded-3xl shadow-xl">
                                            {sec.key === 'savings-goals' && (
                                                <div className="absolute top-0 right-0 p-3">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                                                </div>
                                            )}
                                            <CardContent className="p-8 flex flex-col items-center justify-center text-center gap-4 h-full">
                                                <div className={`p-4 rounded-2xl ${sec.colorClass} group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-500`}>
                                                    {sec.icon}
                                                </div>
                                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 group-hover:text-white transition-colors">{sec.title}</div>
                                                <div className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                                                    {sec.key === 'savings-goals' ? 'Active Countdown' : `${(entries[sec.key] || []).length} Data Points`}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            {/* Account Details Sidebar */}
            <Sheet open={isAccountSheetOpen} onOpenChange={setIsAccountSheetOpen}>
                <SheetContent className="bg-[#020204]/95 border-l border-white/10 text-white w-full sm:max-w-md overflow-y-auto backdrop-blur-3xl p-0">
                    {selectedAccount && (
                        <div className="flex flex-col h-full bg-gradient-to-b from-white/[0.02] to-transparent">
                            <div className="p-10 border-b border-white/5 bg-white/[0.01]">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="bg-emerald-500/10 p-4 rounded-2xl text-emerald-400 shadow-xl border border-emerald-500/20">
                                        {selectedAccount.type === 'credit' ? <CreditCard size={28} /> : <Landmark size={28} />}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Encrypted Node ID</div>
                                        <div className="text-[11px] font-mono text-emerald-500/40">{selectedAccount.account_id.substring(0, 16)}...</div>
                                    </div>
                                </div>
                                <SheetHeader className="text-left space-y-0">
                                    <SheetTitle className={`${playfair.className} text-3xl font-bold text-white tracking-tight`}>
                                        {selectedAccount.name}
                                    </SheetTitle>
                                </SheetHeader>
                                <p className="text-[10px] text-white/40 uppercase tracking-[0.4em] font-black mt-2">{selectedAccount.subtype || selectedAccount.type}</p>
                            </div>

                            <div className="p-10 space-y-12">
                                {/* Balance Display */}
                                <div className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group/sidebar-balance text-center">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
                                    <div className="relative z-10">
                                        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400/60 mb-4">Total Liquid Value</div>
                                        <div className={`text-6xl font-mono tracking-tighter font-bold ${selectedAccount.type === 'credit' ? 'text-rose-400' : 'text-white'}`}>
                                            <span className="text-2xl opacity-30 mr-1">$</span>
                                            {(selectedAccount.balances.current || 0).toLocaleString()}
                                        </div>
                                        <div className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">{selectedAccount.mask || '****'} AUTHENTICATED</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Latest Transactions */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Node Ledger</h4>
                                        <Receipt className="w-4 h-4 text-white/10" />
                                    </div>
                                    
                                    {isLoadingTransactions ? (
                                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                                            <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-emerald-500 animate-spin" />
                                            <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-black">Syncing Ledger...</p>
                                        </div>
                                    ) : accountTransactions.length > 0 ? (
                                        <div className="space-y-3">
                                            {accountTransactions.map((tx, idx) => (
                                                <motion.div 
                                                    key={idx}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className="flex justify-between items-center p-5 rounded-2xl bg-white/[0.01] hover:bg-white/[0.04] transition-all border border-white/5 group/tx"
                                                >
                                                    <div className="flex items-center gap-4 overflow-hidden">
                                                        <div className={`p-3 rounded-xl shrink-0 transition-transform group-hover/tx:scale-110 ${tx.amount > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/10' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10'}`}>
                                                            <Receipt className="w-4 h-4" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-bold text-white/90 truncate group-hover/tx:text-white transition-colors">{tx.name}</p>
                                                            <p className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-1">{tx.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`text-lg font-mono font-bold tracking-tighter shrink-0 pl-4 ${tx.amount > 0 ? 'text-white' : 'text-emerald-400'}`}>
                                                        {tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 rounded-[2rem] border border-dashed border-white/5">
                                            <div className="bg-white/[0.02] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <History className="w-5 h-5 text-white/10" />
                                            </div>
                                            <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] font-black">No Recent Ledger Activity</p>
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    className="w-full h-16 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-[10px] transition-all"
                                    onClick={() => setIsAccountSheetOpen(false)}
                                >
                                    Close Secure View
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>

        </div>
    )
}
