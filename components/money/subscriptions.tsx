'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, ArrowRight, HelpCircle, AlertCircle, RotateCcw, Clock, Calendar, CheckCircle2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { dataStore } from '@/lib/data-store'
import { 
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

type SubscriptionStatus = 'active' | 'review' | 'cancelled' | 'cancellation pending'

type Subscription = {
    id: string
    name: string
    amount: number
    frequency: 'monthly' | 'annually' | 'weekly'
    lastCharge: string
    nextPredicted: string
    status: SubscriptionStatus
    initiatedDate?: string
    nextCheckDate?: string
}

export function Subscriptions({ isDemo }: { isDemo?: boolean }) {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [inQueueIds, setInQueueIds] = useState<Set<string>>(new Set())
    const [pendingDetailSub, setPendingDetailSub] = useState<Subscription | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchSubscriptions = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                try {
                    const [res, pastDecisions, queue] = await Promise.all([
                        fetch(`/api/plaid/subscriptions-data?userId=${user.id}`),
                        dataStore.getMoneyDecisions(user.id),
                        dataStore.getMoneyQueue(user.id)
                    ])
                    
                    const data = await res.json();
                    
                    if (data.subscriptions) {
                        const merged = data.subscriptions.map((s: Subscription) => {
                            const dec = pastDecisions.reverse().find(d => d.decisionId === 'sub-' + s.id)
                            const isQueued = queue.some(q => q.id === 'sub-' + s.id)
                            
                            // Let's resolve the UI state explicitly from your persistent choices overrides
                            if (dec && dec.action === 'edit' && dec.editValue === 'Cancel') {
                                return { ...s, status: 'cancellation pending' }
                            }
                            if (isQueued) {
                                setInQueueIds(prev => new Set([...prev, s.id]))
                            }

                            return s;
                        });
                        setSubscriptions(merged);
                    }
                } catch (err) {
                    console.error("Error fetching subscriptions:", err);
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchSubscriptions()
    }, [supabase])

    // Calculate totals
    const { totalMonthly, pendingRemovalAmount } = useMemo(() => {
        return subscriptions.reduce((acc, sub) => {
            const monthly = sub.frequency === 'monthly' ? sub.amount : 
                           sub.frequency === 'annually' ? sub.amount / 12 : 
                           sub.amount * 4.33

            if (sub.status === 'active') {
                acc.totalMonthly += monthly
            } else if (sub.status === 'cancellation pending') {
                acc.pendingRemovalAmount += monthly
            }
            return acc
        }, { totalMonthly: 0, pendingRemovalAmount: 0 })
    }, [subscriptions])

    const handleReview = async (id: string, name: string) => {
        if (inQueueIds.has(id)) return
        
        setInQueueIds(prev => new Set([...prev, id]))
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return
        
        const sub = subscriptions.find(s => s.id === id)

        try {
            await dataStore.queueMoneyAction(user.id, {
                id: 'sub-' + id,
                title: `Approve: ${name}`,
                amount: sub?.amount || 0,
                type: 'subscription',
                reason: `Do you want to continue your subscription to ${name}? It currently charges £${sub?.amount || 0} ${sub?.frequency}.`
            })
            
            toast.info("Added to Daily Decisions", {
                duration: 2000,
                description: `Analyzing ${name} for next available decision.`
            })
        } catch (e) {
            toast.error("Failed to add to decisions queue.");
        }
    }

    React.useEffect(() => {
        if (!isDemo) return;
        const timer = setTimeout(() => {
            handleReview('2', 'Gym Membership');
        }, 1500);
        return () => clearTimeout(timer);
    }, [isDemo])

    const restoreSubscription = (id: string) => {
        setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status: 'active' } : s))
        setPendingDetailSub(null)
        toast.success("Subscription Restored", {
            description: "The cancellation request has been voided."
        })
    }

    const sortedSubscriptions = useMemo(() => {
        return [...subscriptions].sort((a, b) => b.amount - a.amount)
    }, [subscriptions])

    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in duration-700 pb-24">
            
            {loading && (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="size-8 animate-spin text-neutral-800" />
                </div>
            )}
            <div className="border border-neutral-900 bg-neutral-950/50 p-12 flex flex-col items-center justify-center space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
                
                <div className="text-neutral-500 font-mono text-[10px] uppercase tracking-[0.4em] font-bold text-center">
                    Total Structural Outflow / Month
                </div>
                
                <div className="flex flex-col items-center">
                    <div className="text-6xl font-mono tracking-tighter text-amber-500 font-bold">
                        £{totalMonthly.toFixed(2)}
                    </div>
                    {pendingRemovalAmount > 0 && (
                        <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 mt-2"
                        >
                            <span className="text-[9px] font-mono text-neutral-600 uppercase tracking-widest">
                                Pending removal:
                            </span>
                            <span className="text-[10px] font-mono text-red-500/80 font-bold">
                                -£{pendingRemovalAmount.toFixed(2)}
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* List Header */}
            <div className="space-y-0">
                <div className="grid grid-cols-12 border-b border-neutral-900 pb-5 px-6 font-mono text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">
                    <div className="col-span-4">Subscription</div>
                    <div className="col-span-2 text-right">Monthly Cost</div>
                    <div className="col-span-2 text-right">Frequency</div>
                    <div className="col-span-4 text-right">Next Charge / Priority</div>
                </div>

                {sortedSubscriptions.map(sub => {
                    const isInQueue = inQueueIds.has(sub.id)
                    const isPending = sub.status === 'cancellation pending'
                    
                    return (
                        <div 
                            key={sub.id} 
                            className={`grid grid-cols-12 items-center border-b border-neutral-950 py-7 px-6 hover:bg-neutral-900/10 transition-colors group relative ${isPending ? 'bg-amber-500/[0.01]' : ''}`}
                        >
                            <div className="col-span-4 space-y-1">
                                <div className={`font-mono text-xs uppercase tracking-tight font-medium ${isPending ? 'text-neutral-500/80' : 'text-neutral-200'}`}>
                                    {sub.name}
                                </div>
                                {isPending && (
                                    <div className="flex items-center gap-2">
                                        <div className="size-1 rounded-full bg-amber-500 animate-pulse" />
                                        <span className="text-amber-500/60 font-mono text-[8px] uppercase tracking-widest font-bold">
                                            Cancellation Pending
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="col-span-2 text-right font-mono text-base tracking-tighter text-neutral-400">
                                £{sub.amount.toFixed(2)}
                            </div>
                            
                            <div className="col-span-2 text-right font-mono text-[9px] text-neutral-600 uppercase tracking-widest font-bold">
                                {sub.frequency}
                            </div>
                            
                            <div className="col-span-4 flex items-center justify-end gap-12">
                                <div className="text-right">
                                    {isPending ? (
                                        <div className="flex flex-col items-end">
                                            <span className="text-amber-500/40 font-mono text-[9px] uppercase tracking-widest border border-amber-500/20 px-2 py-0.5 bg-amber-500/5">
                                                PENDING
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-widest">
                                            {sub.nextPredicted}
                                        </span>
                                    )}
                                </div>

                                <div className="w-24 flex justify-end">
                                    {isPending ? (
                                        <button 
                                            onClick={() => setPendingDetailSub(sub)}
                                            className="font-mono text-[9px] uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors border-b border-amber-500/20 hover:border-amber-400"
                                        >
                                            Status
                                        </button>
                                    ) : isInQueue ? (
                                        <span className="font-mono text-[9px] uppercase tracking-widest text-neutral-700 font-bold">
                                            In queue
                                        </span>
                                    ) : (
                                        <button 
                                            onClick={() => handleReview(sub.id, sub.name)}
                                            className="invisible group-hover:visible font-mono text-[9px] uppercase tracking-widest text-neutral-100 bg-neutral-900 border border-neutral-800 px-4 py-2 hover:bg-neutral-800 hover:border-neutral-700 transition-all"
                                        >
                                            Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Status Reconciliation View (Modal) */}
            <Dialog open={!!pendingDetailSub} onOpenChange={(open) => !open && setPendingDetailSub(null)}>
                <DialogContent className="max-w-md bg-black border border-neutral-900 rounded-none p-10 font-mono text-neutral-300">
                    {pendingDetailSub && (
                        <div className="space-y-12">
                            <DialogHeader className="space-y-4">
                                <DialogTitle className="text-xs uppercase tracking-[0.4em] text-neutral-500 font-bold">
                                    Cancellation Status
                                </DialogTitle>
                                <div className="space-y-1">
                                    <h2 className="text-xl uppercase tracking-tight text-neutral-100 font-medium">{pendingDetailSub.name}</h2>
                                    <p className="text-[10px] text-neutral-600 tracking-widest uppercase italic">Diagnostic Verification Pending</p>
                                </div>
                            </DialogHeader>

                            <div className="space-y-8 border-y border-neutral-950 py-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="size-4 text-neutral-700" />
                                        <span className="text-[10px] uppercase tracking-widest text-neutral-500">Initiated</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-300">{pendingDetailSub.initiatedDate}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle2 className="size-4 text-teal-500/50" />
                                        <span className="text-[10px] uppercase tracking-widest text-neutral-500">System Verification</span>
                                    </div>
                                    <span className="text-[10px] text-neutral-300">{pendingDetailSub.nextCheckDate}</span>
                                </div>
                                <p className="text-[9px] text-neutral-600 leading-relaxed uppercase tracking-wider">
                                    The system will verify the cancellation when Plaid reports no further charges after the predicted date ({pendingDetailSub.nextPredicted}).
                                </p>
                            </div>

                            <button 
                                onClick={() => restoreSubscription(pendingDetailSub.id)}
                                className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[10px] font-bold uppercase tracking-[0.3em] py-4 transition-all flex items-center justify-center gap-3 text-neutral-200"
                            >
                                <RotateCcw className="size-3" />
                                Changed my mind — keep it
                            </button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="text-center font-mono text-[9px] uppercase tracking-[0.3em] text-neutral-700 max-w-lg mx-auto leading-relaxed border-t border-neutral-950 pt-12">
                Structural patterns detected via Plaid. Escalations to Daily Decisions are immutable until resolved in queue.
            </div>
        </div>
    )
}
