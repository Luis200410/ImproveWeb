'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowRight, HelpCircle, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { dataStore } from '@/lib/data-store'

type Confidence = 'CERTAIN' | 'USUALLY' | 'ONE-TIME'
type Recurrence = 'Every month' | 'Irregular' | 'One-time only'

type IncomeSource = {
    id: string
    description: string
    amount: number
    date: string
    confidence: Confidence
    recurrence: Recurrence
}

type Deposit = {
    id: string
    description: string
    amount: number
    date: string
    suggestedRecurrence: Recurrence
    suggestedConfidence: Confidence
}

const MOCK_DEPOSITS: Deposit[] = [
    { 
        id: 'd1', 
        description: 'ACH-STRIPE-TRANSFER-492', 
        amount: 350.00, 
        date: 'Oct 14',
        suggestedRecurrence: 'Every month',
        suggestedConfidence: 'Always comes in' as any // map to mapping keys later
    },
    { 
        id: 'd2', 
        description: 'VENMO CASHOUT', 
        amount: 85.00, 
        date: 'Oct 12',
        suggestedRecurrence: 'One-time only',
        suggestedConfidence: 'One-time only' as any
    }
]

const MOCK_CLASSIFIED: IncomeSource[] = [
    {
        id: 'c1',
        description: 'ACME CORP PAYROLL',
        amount: 5000,
        date: 'Nov 1',
        confidence: 'CERTAIN',
        recurrence: 'Every month'
    }
]

export function IncomeManager({ isDemo }: { isDemo?: boolean }) {
    const [deposits, setDeposits] = useState<Deposit[]>([])
    const [classified, setClassified] = useState<IncomeSource[]>([])
    const [loading, setLoading] = useState(true)
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchIncome = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                try {
                    const [res, storedIncomeActions] = await Promise.all([
                        fetch(`/api/plaid/income-data?userId=${user.id}`),
                        dataStore.getEntries('classified-income', user.id)
                    ]);
                    
                    const data = await res.json();
                    
                    if (data.deposits && data.classified) {
                        let finalDeposits = [...data.deposits]
                        let finalClassified = [...data.classified]

                        // Apply persistent income logic
                        storedIncomeActions.forEach(action => {
                            if (action.data.action === 'dismiss') {
                                finalDeposits = finalDeposits.filter(d => d.id !== action.data.depositId)
                            } else if (action.data.action === 'classify') {
                                const matched = finalDeposits.find(d => d.id === action.data.depositId)
                                if (matched) {
                                    finalDeposits = finalDeposits.filter(d => d.id !== matched.id)
                                    finalClassified.unshift({
                                        id: matched.id,
                                        description: matched.description,
                                        amount: matched.amount,
                                        date: 'NEXT CYCLE',
                                        confidence: action.data.confidence,
                                        recurrence: action.data.recurrence
                                    })
                                }
                            }
                        })
                        
                        setDeposits(finalDeposits);
                        setClassified(finalClassified);
                    }
                } catch (err) {
                    console.error("Error fetching income data:", err);
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchIncome()
    }, [supabase])

    const handleConfirm = async (depositId: string, recurrence: Recurrence, confidence: Confidence) => {
        if (!userId) return;
        
        const deposit = deposits.find(d => d.id === depositId)
        if (!deposit) return

        await dataStore.addEntry(userId, 'classified-income', { action: 'classify', depositId, recurrence, confidence });

        const newItem: IncomeSource = {
            id: `classified-${Date.now()}`,
            description: deposit.description,
            amount: deposit.amount,
            date: 'NEXT CYCLE',
            confidence: confidence,
            recurrence: recurrence
        }

        setDeposits(prev => prev.filter(d => d.id !== depositId))
        setClassified(prev => [newItem, ...prev])
        
        toast.success(`Classified: ${deposit.description}`, {
            description: "This income is now feeding your cash flow projection."
        })
    }

    React.useEffect(() => {
        if (!isDemo) return;
        const timer = setTimeout(() => {
            if (deposits.length > 0) {
                handleConfirm(deposits[0].id, deposits[0].suggestedRecurrence, 'CERTAIN');
            }
        }, 1500);
        return () => clearTimeout(timer);
    }, [isDemo, deposits])

    const handleDismiss = async (depositId: string) => {
        if (!userId) return;
        
        await dataStore.addEntry(userId, 'classified-income', { action: 'dismiss', depositId });
        
        setDeposits(prev => prev.filter(d => d.id !== depositId))
        toast.info("Item dismissed permanently", {
            description: "The system has learned that this transfer type is not income."
        })
    }

    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-700 pb-24">
            
            {loading && (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="size-8 animate-spin text-neutral-800" />
                </div>
            )}
            <p className="text-neutral-600 font-mono text-[10px] uppercase tracking-[0.3em] font-medium border-l border-neutral-800 pl-4">
                Classifying these helps your cash flow forecast know what money is coming.
            </p>

            {/* Section 1: Classified Forward Income (First to build trust) */}
            <div className="space-y-6">
                <div className="font-mono text-[11px] text-neutral-500 uppercase tracking-[0.4em] font-bold">
                    Classified Forward Income
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[10px] uppercase tracking-[0.2em]">
                        <thead>
                            <tr className="text-neutral-500 border-b border-neutral-900">
                                <th className="pb-4 font-normal">Source</th>
                                <th className="pb-4 font-normal">Amount</th>
                                <th className="pb-4 font-normal">Recurrence</th>
                                <th className="pb-4 font-normal text-right">Reliability</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-950">
                            <AnimatePresence>
                                {classified.map(inc => (
                                    <motion.tr 
                                        key={inc.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="text-neutral-300 hover:bg-neutral-900/10"
                                    >
                                        <td className="py-5 font-bold tracking-tight text-neutral-100">{inc.description}</td>
                                        <td className="py-5 text-teal-500 text-xs">£{inc.amount.toLocaleString()}</td>
                                        <td className="py-5 text-neutral-500">{inc.recurrence}</td>
                                        <td className="py-5 text-right">
                                            <span className={`px-2 py-1 border text-[9px] font-bold ${
                                                inc.confidence === 'CERTAIN' ? 'border-teal-500/20 text-teal-500 bg-teal-500/5' :
                                                inc.confidence === 'USUALLY' ? 'border-amber-500/20 text-amber-500 bg-amber-500/5' :
                                                'border-neutral-800 text-neutral-500'
                                            }`}>
                                                {inc.confidence}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="h-px bg-neutral-900" />

            {/* Section 2: Unclassified Surface */}
            <div className="space-y-8">
                <div className="font-mono text-[11px] text-neutral-500 uppercase tracking-[0.4em] font-bold">
                    Plaid found these payments — are they income?
                </div>

                <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {deposits.map(d => (
                            <DepositClassificationCard 
                                key={d.id} 
                                deposit={d} 
                                onConfirm={(r, c) => handleConfirm(d.id, r, c)}
                                onDismiss={() => handleDismiss(d.id)}
                            />
                        ))}
                    </AnimatePresence>
                    {deposits.length === 0 && (
                        <div className="py-12 text-center border border-dashed border-neutral-900">
                            <p className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">No ambiguous deposits found in last 30d Plaid sync.</p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    )
}

function DepositClassificationCard({ deposit, onConfirm, onDismiss }: { deposit: Deposit, onConfirm: (r: Recurrence, c: Confidence) => void, onDismiss: () => void }) {
    const [recurrence, setRecurrence] = useState<Recurrence>(deposit.suggestedRecurrence)
    const [confidence, setConfidence] = useState<Confidence>(deposit.suggestedConfidence as any || 'Always comes in')

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
            className="border border-neutral-900 bg-neutral-950 p-6 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between group hover:border-neutral-800 transition-colors"
        >
            {/* Info */}
            <div className="space-y-2 lg:w-1/3">
                <div className="flex items-center gap-2">
                    <div className="size-1.5 rounded-full bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
                    <span className="font-mono text-xs uppercase tracking-tight text-neutral-200 font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                        {deposit.description}
                    </span>
                </div>
                <div className="text-[10px] text-neutral-600 font-mono tracking-[0.2em] uppercase">
                    Detected {deposit.date}
                </div>
            </div>

            {/* Inputs */}
            <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest block font-bold">How often does this come in?</label>
                    <select 
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                        className="w-full bg-black border border-neutral-800 text-neutral-300 text-[10px] font-mono uppercase tracking-widest px-4 py-3 outline-none focus:border-neutral-600 transition-colors rounded-none appearance-none"
                    >
                        <option value="Every month">Every month</option>
                        <option value="Irregular">Irregular</option>
                        <option value="One-time only">One-time only</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest block font-bold">How reliable is this?</label>
                    <select 
                        value={confidence}
                        onChange={(e) => setConfidence(e.target.value as Confidence)}
                        className="w-full bg-black border border-neutral-800 text-neutral-300 text-[10px] font-mono uppercase tracking-widest px-4 py-3 outline-none focus:border-neutral-600 transition-colors rounded-none appearance-none"
                    >
                        <option value="CERTAIN">Always comes in</option>
                        <option value="USUALLY">Usually comes in</option>
                        <option value="ONE-TIME">One-time only</option>
                    </select>
                </div>
            </div>

            {/* Actions */}
            <div className="lg:w-1/4 flex flex-col items-center gap-3">
                <div className="text-teal-400 font-mono text-xl tracking-tighter font-bold mb-1">
                    +£{deposit.amount.toFixed(2)}
                </div>
                <button 
                    onClick={() => onConfirm(recurrence, confidence)}
                    className="w-full bg-neutral-100 hover:bg-white text-black font-mono text-[10px] font-bold uppercase tracking-[0.2em] py-3.5 transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                >
                    Confirm as income
                </button>
                <button 
                    onClick={onDismiss}
                    className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest hover:text-red-500/70 transition-colors"
                >
                    Not income — dismiss
                </button>
            </div>
        </motion.div>
    )
}
