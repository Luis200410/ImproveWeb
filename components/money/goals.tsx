'use client'

import React, { useState, useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, ReferenceLine, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Edit2, Check, TrendingUp, AlertTriangle, ArrowRight, Wallet, Calendar, PieChart, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Switch } from "@/components/ui/switch"
import { createClient } from '@/utils/supabase/client'
import { dataStore } from '@/lib/data-store'

type Envelope = {
    id: string
    name: string
    monthlySpend: number
}

const ACTIVE_ENVELOPES: Envelope[] = [
    { id: 'env1', name: 'Dining', monthlySpend: 450 },
    { id: 'env2', name: 'Groceries', monthlySpend: 600 },
    { id: 'env3', name: 'Transport', monthlySpend: 200 },
    { id: 'env4', name: 'Entertainment', monthlySpend: 300 }
]

const IRREGULAR_INCOME = [
    { month: 2, amount: 1500, label: 'Expected Bonus' },
    { month: 4, amount: 800, label: 'Tax Refund' }
]

export function GoalsSimulator({ isDemo }: { isDemo?: boolean }) {
    const [targetAmount, setTargetAmount] = useState<number>(5000)
    const [targetMonths, setTargetMonths] = useState<number>(6)
    const [simulatorActive, setSimulatorActive] = useState(false)
    
    // New Variables
    const [squeezedIds, setSqueezedIds] = useState<Set<string>>(new Set())
    const [existingSavingsRate, setExistingSavingsRate] = useState<number>(200)
    const [isEditingSavings, setIsEditingSavings] = useState(false)
    const [includeIrregular, setIncludeIrregular] = useState(false)

    // Derived Logic
    const totalIrregular = useMemo(() => {
        if (!includeIrregular) return 0
        return IRREGULAR_INCOME.reduce((sum, inc) => sum + inc.amount, 0)
    }, [includeIrregular])

    const monthlyRequirement = useMemo(() => {
        const remainingGoal = Math.max(0, targetAmount - totalIrregular)
        const baseRateNeeded = remainingGoal / targetMonths
        return Math.max(0, baseRateNeeded - existingSavingsRate)
    }, [targetAmount, targetMonths, existingSavingsRate, totalIrregular])

    const cutPerEnvelope = useMemo(() => {
        if (squeezedIds.size === 0) return 0
        return Math.ceil(monthlyRequirement / squeezedIds.size)
    }, [monthlyRequirement, squeezedIds.size])

    const maxCapacity = 800 // Mock total available structural surplus
    const isReachable = monthlyRequirement <= maxCapacity 

    const alternateTimeline = useMemo(() => {
        const capacity = Math.max(10, maxCapacity + existingSavingsRate)
        const remaining = Math.max(0, targetAmount - totalIrregular)
        return Math.ceil(remaining / capacity)
    }, [targetAmount, existingSavingsRate, totalIrregular])

    const generatePaths = () => {
        const data = []
        let currentStatus = 500
        let adjustedStatus = 500
        
        const baseSavingsRate = 300 // Standard trajectory
        const effectiveMonthlyFlow = (targetAmount - totalIrregular) / targetMonths

        for (let i = 0; i <= Math.max(targetMonths, 12); i++) {
            // Apply irregular income if toggled
            let irregularBump = 0
            if (includeIrregular) {
                const bump = IRREGULAR_INCOME.find(inc => inc.month === i)
                if (bump) irregularBump = bump.amount
            }

            if (i > 0) {
                currentStatus += baseSavingsRate
                adjustedStatus += effectiveMonthlyFlow + irregularBump
            }

            data.push({
                month: `M${i}`,
                currentPath: currentStatus,
                adjustedPath: Math.min(adjustedStatus, targetAmount + 2000) // Cap visual height slightly
            })
        }
        return data
    }

    const data = generatePaths()

    const toggleSqueeze = (id: string) => {
        setSqueezedIds(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const handleSendToDailyDecisions = async () => {
        const envelopeNames = ACTIVE_ENVELOPES.filter(e => squeezedIds.has(e.id)).map(e => e.name)
        
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                await dataStore.queueMoneyAction(user.id, {
                    id: 'goal-tradeoff-' + Date.now(),
                    title: 'Squeeze Validation',
                    amount: cutPerEnvelope,
                    reason: `Approve squeezing £${cutPerEnvelope}/mo from ${envelopeNames.join(', ')} to hit your £${targetAmount} target in ${targetMonths} months.`,
                    type: 'budget'
                })
                toast.success("Trade-offs sent to queue", {
                    description: `Sent ${envelopeNames.length} pace adjustment cards to Daily Decisions.`
                })
            }
        } catch (e) {
            toast.error("Failed to queue trades")
        }
    }

    React.useEffect(() => {
        if (!isDemo) return;
        const t1 = setTimeout(() => toggleSqueeze('env1'), 500);
        const t2 = setTimeout(() => toggleSqueeze('env4'), 1000);
        const t3 = setTimeout(() => setSimulatorActive(true), 2000);
        return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); }
    }, [isDemo])

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-black border border-neutral-800 p-4 shadow-2xl space-y-3 font-mono">
                    <p className="text-neutral-500 text-[9px] uppercase tracking-[0.3em] font-bold">{label}</p>
                    {payload.map((entry: any, i: number) => (
                        <div key={i} className="space-y-1">
                            <p className="text-neutral-600 text-[8px] uppercase tracking-widest leading-none">{entry.name}</p>
                            <p className={`text-sm tracking-tighter font-bold ${entry.dataKey === 'adjustedPath' ? 'text-teal-400' : 'text-neutral-400'}`}>
                                £{entry.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            )
        }
        return null
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-24">
            
            {/* Header Area */}
            <div className="space-y-4">
                <h1 className="text-4xl font-mono uppercase tracking-tight text-neutral-100 font-bold">Trade-off Simulator</h1>
                <p className="text-neutral-500 font-mono text-xs uppercase tracking-[0.2em] leading-relaxed max-w-2xl">
                    Analyze the mathematical impact of adopting new savings goals. Review parallel trajectory tracks and assess required spending squeeze adjustments before committing.
                </p>
            </div>

            {/* Input & Variable Surface */}
            <div className="border border-neutral-900 bg-neutral-950 p-10 space-y-12">
                
                {/* Core Inputs */}
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                        <label className="block text-neutral-500 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">Target Capital</label>
                        <div className="relative group">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 font-mono text-2xl">£</span>
                            <input 
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(Number(e.target.value))}
                                className="w-full bg-black border border-neutral-800 text-neutral-100 font-mono text-4xl tracking-tighter pl-12 pr-6 py-6 outline-none focus:border-neutral-600 transition-colors rounded-none"
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <label className="block text-neutral-500 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">Timeline Horizon (Months)</label>
                        <input 
                            type="number"
                            value={targetMonths}
                            onChange={(e) => setTargetMonths(Number(e.target.value))}
                            className="w-full bg-black border border-neutral-800 text-neutral-100 font-mono text-4xl tracking-tighter px-8 py-6 outline-none focus:border-neutral-600 transition-colors rounded-none"
                        />
                    </div>
                </div>

                {/* Variable 2: Existing Savings (Plaid) */}
                <div className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-neutral-900/20 border border-neutral-900 border-dashed gap-6">
                    <div className="flex items-center gap-4">
                        <Wallet className="size-5 text-teal-800" />
                        <div className="space-y-1">
                            {isEditingSavings ? (
                                <div className="flex items-center gap-2">
                                    <input 
                                        autoFocus
                                        className="bg-black border border-neutral-700 text-teal-400 font-mono text-sm px-2 py-1 outline-none w-24"
                                        value={existingSavingsRate}
                                        onChange={(e) => setExistingSavingsRate(Number(e.target.value))}
                                        onBlur={() => setIsEditingSavings(false)}
                                    />
                                    <Check className="size-4 text-teal-500 cursor-pointer" onClick={() => setIsEditingSavings(false)} />
                                </div>
                            ) : (
                                <p className="text-neutral-400 font-mono text-[11px] uppercase tracking-wider">
                                    We detected you're already saving <span className="text-teal-400 font-bold">£{existingSavingsRate}/mo</span>
                                </p>
                            )}
                            <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-[0.2em]">Automated detection from Plaid history</p>
                        </div>
                    </div>
                    <button onClick={() => setIsEditingSavings(true)} className="text-neutral-600 hover:text-neutral-400 transition-colors">
                        <Edit2 className="size-4" />
                    </button>
                </div>

                {/* Variable 1: Envelope Squeeze Toggles */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <PieChart className="size-4 text-neutral-700" />
                        <h3 className="text-neutral-500 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">Squeeze Active Behavioral Zones</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {ACTIVE_ENVELOPES.map(env => {
                            const active = squeezedIds.has(env.id)
                            return (
                                <div 
                                    key={env.id}
                                    onClick={() => toggleSqueeze(env.id)}
                                    className={`p-5 border cursor-pointer transition-all space-y-4 text-left relative overflow-hidden group ${
                                        active ? 'bg-amber-500/[0.03] border-amber-500/40' : 'bg-black border-neutral-900 hover:border-neutral-700'
                                    }`}
                                >
                                    {active && <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/20 blur-xl" />}
                                    <div className="flex items-center justify-between">
                                        <span className={`font-mono text-[10px] uppercase tracking-widest font-bold ${active ? 'text-amber-500' : 'text-neutral-400'}`}>
                                            {env.name}
                                        </span>
                                        <div className={`size-1.5 rounded-full ${active ? 'bg-amber-500' : 'bg-neutral-800'}`} />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">Base Spend: £{env.monthlySpend}/mo</div>
                                        <AnimatePresence>
                                            {active && (
                                                <motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="text-amber-500/80 font-mono text-[11px] font-bold"
                                                >
                                                    -£{cutPerEnvelope}/mo
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Variable 3: Irregular Income Toggle */}
                <div className="flex items-center justify-between border-t border-neutral-900 pt-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.4em] font-bold flex items-center gap-2">
                            Include expected irregular income
                            <HelpCircle className="size-3 text-neutral-700" />
                        </label>
                        <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest leading-none">Apply classified bonuses and one-time deposits</p>
                    </div>
                    <Switch 
                        checked={includeIrregular}
                        onCheckedChange={setIncludeIrregular}
                    />
                </div>

                {/* Simulation Button */}
                <button 
                    onClick={() => setSimulatorActive(true)}
                    className="w-full bg-neutral-100 hover:bg-white text-black font-mono text-xs font-bold uppercase tracking-[0.4em] py-5 transition-all shadow-[0_0_40px_rgba(255,255,255,0.02)]"
                >
                    Simulate Trade-offs
                </button>
            </div>

            {/* Simulation Results */}
            <AnimatePresence>
                {simulatorActive && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid lg:grid-cols-12 gap-10"
                    >
                        
                        {/* Trajectory Comparison Card */}
                        <div className="lg:col-span-8 border border-neutral-900 bg-black p-8 h-[450px] relative">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-mono text-neutral-400 uppercase tracking-[0.4em] font-bold">Trajectory Comparison</h3>
                                    <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest">Parallel tracks for Baseline vs Adjusted capacity</p>
                                </div>
                            </div>
                            <div className="h-full pb-10">
                                <ResponsiveContainer width="100%" height="90%">
                                    <AreaChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAdjusted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.1}/>
                                                <stop offset="95%" stopColor="#0d9488" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#171717" />
                                        <XAxis 
                                            dataKey="month" 
                                            stroke="#404040" 
                                            fontSize={9} 
                                            tickLine={false} 
                                            axisLine={false}
                                            fontFamily="monospace"
                                            dy={10}
                                        />
                                        <YAxis 
                                            stroke="#404040" 
                                            fontSize={9} 
                                            tickLine={false} 
                                            axisLine={false}
                                            tickFormatter={(v) => `£${v}`}
                                            fontFamily="monospace"
                                            orientation="right"
                                        />
                                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#404040', strokeWidth: 1 }} />
                                        
                                        <Area 
                                            type="monotone" 
                                            dataKey="currentPath" 
                                            name="Current Path"
                                            stroke="#404040" 
                                            strokeWidth={2}
                                            strokeDasharray="5 5"
                                            fill="transparent"
                                        />
                                        
                                        <Area 
                                            type="stepAfter" 
                                            dataKey="adjustedPath" 
                                            name="Adjusted Goal Trajectory"
                                            stroke="#0d9488" 
                                            strokeWidth={3}
                                            fillOpacity={1} 
                                            fill="url(#colorAdjusted)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Feasibility Analysis Panel */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="border border-neutral-900 bg-neutral-950 p-8 space-y-8 h-full relative overflow-hidden group">
                                <div className="space-y-2">
                                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-bold border-b border-neutral-900 pb-4">
                                        Feasibility Analysis
                                    </div>
                                </div>
                                
                                {!isReachable ? (
                                    <div className="space-y-10 animate-pulse">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-red-600">
                                                <AlertTriangle className="size-4" />
                                                <span className="font-mono text-sm uppercase tracking-[0.3em] font-bold">Unreachable</span>
                                            </div>
                                            <p className="text-[11px] text-neutral-500 font-mono leading-relaxed uppercase tracking-widest">
                                                Required savings rate (£{Math.ceil(monthlyRequirement + existingSavingsRate)}/mo) exceeds your detected structural capacity.
                                            </p>
                                        </div>
                                        
                                        <div className="p-5 bg-red-500/[0.03] border border-red-500/20 space-y-4">
                                            <p className="text-[10px] font-mono text-red-500 uppercase tracking-widest font-bold">Recommendation:</p>
                                            <p className="text-sm font-mono tracking-tighter text-neutral-300">
                                                Extend to <span className="text-red-500 font-bold">{alternateTimeline} months</span> to make this reachable at your current capacity.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-teal-500">
                                                <TrendingUp className="size-4" />
                                                <span className="font-mono text-sm uppercase tracking-[0.3em] font-bold">Reachable via Squeeze</span>
                                            </div>
                                            <p className="text-[11px] text-neutral-500 font-mono leading-relaxed uppercase tracking-widest">
                                                Approving this timeline will distribute a <span className="text-neutral-200">£{monthlyRequirement}</span> monthly squeeze across your selected zones.
                                            </p>
                                        </div>

                                        <div className="space-y-4 border-y border-neutral-900 py-8">
                                            <h4 className="text-[9px] font-mono text-neutral-400 uppercase tracking-[0.4em] font-bold">Planned Squeeze Layout</h4>
                                            {squeezedIds.size > 0 ? (
                                                <div className="space-y-3">
                                                    {ACTIVE_ENVELOPES.filter(e => squeezedIds.has(e.id)).map(e => (
                                                        <div key={e.id} className="flex items-baseline justify-between border-b border-neutral-900/50 pb-2 border-dashed">
                                                            <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500/70">{e.name}</span>
                                                            <span className="text-sm font-mono tracking-tighter text-neutral-100">-£{cutPerEnvelope}</span>
                                                        </div>
                                                    ))}
                                                    <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest italic mt-4 pt-4 border-t border-neutral-900/30">
                                                        Duration: {targetMonths} cycles
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-neutral-600 font-mono uppercase tracking-widest leading-relaxed">
                                                    No behavioral zones toggled. Redirecting full requirement to baseline surplus.
                                                </p>
                                            )}
                                        </div>

                                        <button 
                                            onClick={handleSendToDailyDecisions}
                                            className="w-full bg-teal-600 hover:bg-teal-500 text-teal-50 font-mono text-[10px] font-bold uppercase tracking-[0.4em] py-5 transition-all flex items-center justify-center gap-3"
                                        >
                                            Send cuts to Daily Decisions
                                            <ArrowRight className="size-3" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    )
}
