'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation } from '@/components/navigation'
import { dataStore, Entry, System } from '@/lib/data-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/utils/supabase/client'
import { ArrowLeft, Sparkles, TrendingDown, TrendingUp, PieChart, Banknote, ShieldCheck, PiggyBank, Receipt, DollarSign, Activity, AlertCircle, ArrowUpRight, CreditCard, Landmark, Loader2 } from 'lucide-react'
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

    const safeToSpend = Math.max(0, cashBalance - (upcomingBills + monthlySavingsTarget))

    // Mock Chart Data for Zero-Knowledge Reports 
    // Usually built from real YTD data, simplified here for the dashboard visual
    // -> Now provided by annualChartData state from the Cashflow API

    // Action Center Alert Logic
    const highIdleCash = safeToSpend > 2000

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
        <div className="min-h-screen bg-[#050508] text-white font-sans overflow-x-hidden pb-32">
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_0%,rgba(16,185,129,0.05),transparent_40%),radial-gradient(circle_at_90%_90%,rgba(59,130,246,0.05),transparent_40%)]" />

            <Navigation />
            <div className="h-16" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 text-white/60">
                        <Link href="/dashboard" className="flex items-center gap-2 hover:text-white transition">
                            <ArrowLeft className="w-4 h-4" /> Back
                        </Link>
                        <span className="text-white/30">/</span>
                        <span className="uppercase tracking-[0.3em] text-xs font-semibold text-emerald-400">IMPROVE money engine</span>
                    </div>

                    {userId && (
                        <div className="flex items-center gap-4">
                            {!isLoadingPlaid && plaidAccounts.length > 0 && (
                                <div className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                                    {plaidAccounts.length} Connected Accounts
                                </div>
                            )}
                            <PlaidLinkButton
                                userId={userId}
                                onSuccess={() => {
                                    setIsLoadingPlaid(true);
                                    Promise.all([
                                        fetch(`/api/plaid/accounts?userId=${userId}`),
                                        fetch(`/api/plaid/cashflow-data?userId=${userId}`)
                                    ]).then(async ([acctRes, cashflowRes]) => {
                                        if (acctRes.ok) {
                                            const data = await acctRes.json();
                                            setPlaidAccounts(data.accounts || []);
                                            setPlaidHoldings(data.holdings || []);
                                        }
                                        if (cashflowRes.ok) {
                                            const data = await cashflowRes.json();
                                            if (data.chartData) setAnnualChartData(data.chartData);
                                        }
                                        setIsLoadingPlaid(false);
                                    });
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Top Dash: Net Worth & Safe to Spend */}
                <div className="grid lg:grid-cols-[1fr,1.3fr] gap-6 items-stretch">

                    {/* Safe to Spend Engine */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <Card className="h-full bg-black/40 border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.05)] overflow-hidden relative backdrop-blur-md">
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-emerald-500/10 to-transparent pointer-events-none" />
                            <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 text-emerald-400 mb-6">
                                        <Sparkles className="w-5 h-5" />
                                        <span className="text-xs uppercase tracking-[0.3em] font-bold">The Safe-to-Spend Engine</span>
                                    </div>
                                    <div className={`${playfair.className} text-7xl font-bold tracking-tight text-white mb-2`}>
                                        ${safeToSpend.toFixed(0)}
                                    </div>
                                    <p className="text-white/50 text-sm max-w-sm leading-relaxed">
                                        Actual Cash (${cashBalance.toFixed(0)}) — Bills (${upcomingBills.toFixed(0)}) — Savings Tracker (${monthlySavingsTarget.toFixed(0)})
                                    </p>
                                </div>

                                {/* Action Center Overlay */}
                                <div className="mt-8 bg-emerald-950/30 border border-emerald-500/20 rounded-xl p-4 flex gap-4 items-start">
                                    <AlertCircle className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-emerald-100 mb-1">Weekly Pulse Action</p>
                                        <p className="text-sm text-emerald-400/70">
                                            You have {(entries['subscriptions'] || []).length} recurring subscriptions draining ${upcomingBills.toFixed(0)} monthly. Your baseline has safely protected these funds.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Net Worth Radar & Investments */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
                        <Card className="h-full bg-white/5 border-white/10 backdrop-blur-md">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm uppercase tracking-[0.2em] text-white/50 flex items-center justify-between">
                                    <span>Net Worth Radar</span>
                                    <Activity className="w-4 h-4" />
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-baseline gap-3 mb-8">
                                    <span className={`${playfair.className} text-5xl font-bold text-white`}>
                                        ${netWorth.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase tracking-widest text-emerald-400">Liquid Cash</div>
                                        <div className="font-mono text-xl text-white">${cashBalance.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase tracking-widest text-blue-400">Total Assets</div>
                                        <div className="font-mono text-xl text-white">${investmentBalance.toLocaleString()}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] uppercase tracking-widest text-rose-400">Credit Use</div>
                                        <div className="font-mono text-xl text-white">${creditLiabilities.toLocaleString()}</div>
                                    </div>
                                </div>

                                {/* Financial Freedom Score */}
                                <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-500/20">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="text-[10px] uppercase tracking-widest text-indigo-300">Financial Freedom Score</div>
                                        <div className="text-xl font-bold text-white">{Math.min(100, Math.max(0, (netWorth / 1000000) * 100)).toFixed(1)}%</div>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-1000"
                                            style={{ width: `${Math.min(100, Math.max(0, (netWorth / 1000000) * 100))}%` }}
                                        />
                                    </div>
                                    <p className="text-[9px] text-white/40 mt-2 uppercase tracking-tighter">Based on $1M Freedom Target</p>
                                </div>

                                {highIdleCash && investmentBalance > 0 && (
                                    <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/20 p-2 rounded-full">
                                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-blue-100">Asset Deflation Detected</div>
                                                <div className="text-xs text-blue-300/70">You have ${safeToSpend.toFixed(0)} idle in checking. Move to Robinhood?</div>
                                            </div>
                                        </div>
                                        <Button variant="outline" className="text-xs h-8 bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500 hover:text-white transition-all">
                                            Sync Funds
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Connected Accounts & Cards */}
                {plaidAccounts.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                        <Card className="bg-[#0A0A0E] border-white/5 shadow-2xl overflow-hidden">
                            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                                <CardTitle className="text-xs font-mono uppercase tracking-widest text-emerald-400/80 flex items-center gap-2">
                                    <Landmark className="w-4 h-4" />
                                    Active Plaid Connections
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="grid sm:grid-cols-2 lg:grid-cols-4 border-b border-white/5">
                                    {plaidAccounts.map((account, idx) => (
                                        <div
                                            key={idx}
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
                                            className="p-6 hover:bg-white/[0.05] transition-colors relative group cursor-pointer border-r border-b border-white/5"
                                        >
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all">
                                                    {account.type === 'credit' ? <CreditCard className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                                                </div>
                                                <span className="text-[10px] font-mono text-emerald-400/50 uppercase border border-emerald-500/10 px-2 py-0.5 rounded-full bg-emerald-500/5">
                                                    ...{account.mask || '****'}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-semibold text-white/90 truncate">{account.name}</h3>
                                                <p className="text-[10px] text-white/40 uppercase tracking-widest">{account.subtype || account.type}</p>
                                            </div>
                                            <div className={`text-3xl font-mono mt-4 tracking-tighter ${account.type === 'credit' ? 'text-rose-400' : 'text-white'}`}>
                                                ${(account.balances.current || 0).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}

                {/* Mid Dash: Zero Knowledge YTD & Asset Holdings */}
                <div className="grid lg:grid-cols-[1.5fr,1fr] gap-6">
                    {/* Zero Knowledge Reports */}
                    <Card className="bg-[#0A0A0E] border-white/5 shadow-2xl overflow-hidden">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-xs font-mono uppercase tracking-widest text-white/40 flex items-center justify-between">
                                <span>Zero-Knowledge Architecture: YTD Cashflow</span>
                                <ShieldCheck className="w-4 h-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={annualChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#ffffff20" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val / 1000}k`} />
                                        <RechartsTooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorIncome)" />
                                        <Area type="monotone" dataKey="expense" name="Spend" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorExpense)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Investment Hub Breakdowns */}
                    <Card className="bg-[#0A0A0E] border-white/5 shadow-2xl">
                        <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                            <CardTitle className="text-xs font-mono uppercase tracking-widest text-white/40 flex items-center justify-between">
                                <span>Investment Hub Diversification</span>
                                <PieChart className="w-4 h-4" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            {plaidHoldings.length > 0 ? (
                                <div className="space-y-4">
                                    {plaidHoldings.slice(0, 5).map((holding, i) => {
                                        const value = (holding.quantity || 0) * (holding.institution_price || 0)
                                        const perc = ((value / investmentBalance) * 100).toFixed(1)
                                        return (
                                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-mono text-xs font-bold text-white tracking-tighter">
                                                        {holding.ticker_symbol?.substring(0, 3) || 'AST'}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold">{holding.ticker_symbol || 'Unknown'}</div>
                                                        <div className="text-[10px] text-white/40 uppercase tracking-widest">{holding.type}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono text-sm">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                                                    <div className="text-[10px] text-blue-400">{perc}% Portfolio</div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="h-48 flex flex-col items-center justify-center text-center opacity-50">
                                    <PieChart className="w-8 h-8 mb-4 text-white/30" />
                                    <p className="text-sm font-medium">No external portfolios linked.</p>
                                    <p className="text-xs text-white/40 mt-1">Connect Plaid to sync Robinhood, Webull, or Fidelity.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Legacy Data Micro-Apps */}
                <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-white/40 pl-2">System Manual Modules</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {sections.map((sec) => (
                            <Link key={sec.key} href={`/systems/money/${sec.key}`}>
                                <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition group cursor-pointer h-full">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-3 h-full">
                                        <div className={`p-3 rounded-full ${sec.colorClass} group-hover:scale-110 transition-transform`}>
                                            {sec.icon}
                                        </div>
                                        <div className="text-xs font-semibold uppercase tracking-wider">{sec.title}</div>
                                        <div className="text-[10px] text-white/30">{(entries[sec.key] || []).length} Entries</div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>

            {/* Account Details Sidebar */}
            <Sheet open={isAccountSheetOpen} onOpenChange={setIsAccountSheetOpen}>
                <SheetContent className="bg-[#0A0A0E] border-l border-white/10 text-white w-full sm:max-w-md overflow-y-auto">
                    {selectedAccount && (
                        <>
                            <SheetHeader className="pb-6 border-b border-white/5">
                                <SheetTitle className="text-white flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
                                            {selectedAccount.type === 'credit' ? <CreditCard className="w-5 h-5" /> : <Landmark className="w-5 h-5" />}
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-lg font-bold">{selectedAccount.name}</h3>
                                            <p className="text-xs text-white/40 uppercase tracking-widest">{selectedAccount.subtype || selectedAccount.type}</p>
                                        </div>
                                    </div>
                                </SheetTitle>
                            </SheetHeader>

                            <div className="py-6 space-y-8">
                                {/* Balance Display */}
                                <div className="space-y-1 text-center">
                                    <div className="text-xs uppercase tracking-widest text-emerald-400/80">Available Balance</div>
                                    <div className={`text-4xl font-mono tracking-tighter ${selectedAccount.type === 'credit' ? 'text-rose-400' : 'text-white'}`}>
                                        ${(selectedAccount.balances.current || 0).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-white/30 uppercase border border-white/10 px-2 py-0.5 rounded-full inline-block mt-2 font-mono">
                                        ...{selectedAccount.mask || '****'}
                                    </div>
                                </div>

                                {/* Latest Transactions */}
                                <div>
                                    <h4 className="text-xs font-mono uppercase tracking-widest text-white/40 mb-4 border-b border-white/5 pb-2">Latest Transactions</h4>
                                    {isLoadingTransactions ? (
                                        <div className="flex justify-center py-10">
                                            <Loader2 className="w-6 h-6 animate-spin text-white/20" />
                                        </div>
                                    ) : accountTransactions.length > 0 ? (
                                        <div className="space-y-3">
                                            {accountTransactions.map((tx, idx) => (
                                                <div key={idx} className="flex justify-between items-center p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] transition border border-white/5">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className={`p-2 rounded-full shrink-0 ${tx.amount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                                                            <Receipt className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-white/90 truncate">{tx.name}</p>
                                                            <p className="text-[10px] text-white/40 font-mono">{tx.date}</p>
                                                        </div>
                                                    </div>
                                                    <div className={`text-sm font-mono shrink-0 pl-3 ${tx.amount > 0 ? 'text-white' : 'text-emerald-400'}`}>
                                                        {tx.amount > 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 text-white/30 text-sm">
                                            No recent transactions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>

        </div>
    )
}
