'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Edit2, RotateCw, AlertCircle, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { dataStore } from '@/lib/data-store'

type DecisionType = 'subscription' | 'transfer' | 'envelope' | 'budget'

type QueueItem = {
    id: string
    title: string
    amount: number
    reason: string
    type: DecisionType
    dismissCount?: number
}

export function TodayScreen({ isDemo }: { isDemo?: boolean }) {
    const [queue, setQueue] = useState<QueueItem[]>([])
    const [loading, setLoading] = useState(true)
    const [dismissalMap, setDismissalMap] = useState<Record<string, number>>({})
    const [decisionsMade, setDecisionsMade] = useState(0) 
    const [userId, setUserId] = useState<string | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchDecisions = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserId(user.id)
                try {
                    const [response, pastDecisions, externalQueue] = await Promise.all([
                        fetch(`/api/plaid/budget-data?userId=${user.id}`),
                        dataStore.getMoneyDecisions(user.id),
                        dataStore.getMoneyQueue(user.id)
                    ]);
                    
                    const data = await response.json();
                    
                    // Analytics from DB
                    const currentMonth = new Date().toISOString().substring(0, 7)
                    const monthDecisions = pastDecisions.filter(d => d.createdAt.startsWith(currentMonth) && d.action !== 'remind')
                    setDecisionsMade(monthDecisions.length)

                    const tempDismissalMap: Record<string, number> = {}
                    pastDecisions.forEach(d => {
                        if (d.action === 'remind') {
                            tempDismissalMap[d.decisionId] = (tempDismissalMap[d.decisionId] || 0) + 1
                        }
                    })
                    setDismissalMap(tempDismissalMap)
                    
                    // Filter queue
                    const newQueue: QueueItem[] = [];
                    const todayStr = new Date().toISOString().split('T')[0]
                    
                    if (data.status === 'success') {
                        const isPermResolved = pastDecisions.some(d => d.decisionId === 'trans-pla-1' && (d.action === 'keep' || d.action === 'edit' || d.action === 'cancel'))
                        const isRemindedToday = pastDecisions.some(d => d.decisionId === 'trans-pla-1' && d.action === 'remind' && d.createdAt.startsWith(todayStr))
                        
                        // High balance transfer alert
                        if (data.safeToSpend > 2000 && !isPermResolved && !isRemindedToday) {
                            newQueue.push({
                                id: 'trans-pla-1',
                                title: 'Idle Cash Optimization',
                                amount: Math.floor(data.safeToSpend - 2000),
                                reason: `You have £${data.totalBalances.toLocaleString()} across accounts. Consider moving excess to your designated savings target.`,
                                type: 'transfer'
                            });
                        }
                    }

                    // Append explicit external component escalations to Daily Decisions
                    const unresolvedExternal = externalQueue
                        .filter(q => {
                            const pId = q.entryId || q.id;
                            const isPermResolved = pastDecisions.some(d => d.decisionId === pId && (d.action === 'keep' || d.action === 'edit' || d.action === 'cancel'));
                            const isRemindedToday = pastDecisions.some(d => d.decisionId === pId && d.action === 'remind' && d.createdAt.startsWith(todayStr));
                            return (!isPermResolved && !isRemindedToday);
                        })
                        .map(q => ({
                            id: q.entryId || q.id,
                            title: q.title,
                            amount: q.amount,
                            reason: q.reason,
                            type: q.type
                        }));

                    newQueue.push(...unresolvedExternal);
                    
                    setQueue(newQueue);
                } catch (err) {
                    console.error("Error fetching decisions:", err);
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchDecisions()
    }, [supabase])
    
    // UI states
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editValue, setEditValue] = useState<string | number>('')
    const [bannerVisible, setBannerVisible] = useState(true)

    const currentItem = queue[0]
    const idleCashFactor = currentItem?.type === 'transfer' ? currentItem.amount : 0

    const handleAction = async (action: 'keep' | 'edit' | 'remind') => {
        if (!currentItem || !userId) return

        if (action === 'remind') {
            const count = (dismissalMap[currentItem.id] || 0) + 1
            setDismissalMap(prev => ({ ...prev, [currentItem.id]: count }))
            
            await dataStore.saveMoneyDecision(userId, {
                decisionId: currentItem.id,
                title: currentItem.title,
                amount: currentItem.amount,
                type: currentItem.type,
                action: 'remind'
            })
            
            setQueue(q => q.slice(1))
            return
        }

        if (action === 'keep') {
            await dataStore.saveMoneyDecision(userId, {
                decisionId: currentItem.id,
                title: currentItem.title,
                amount: currentItem.amount,
                type: currentItem.type,
                action: 'keep'
            })
            await dataStore.removeMoneyQueueItem(userId, currentItem.id)
            
            setDecisionsMade(prev => prev + 1)
            setQueue(q => q.slice(1))
            setEditingId(null)
        }

        if (action === 'edit') {
            setEditingId(currentItem.id)
            if (currentItem.type === 'transfer' || currentItem.type === 'budget') setEditValue(currentItem.amount)
        }
    }

    const confirmEdit = async () => {
        if (!currentItem || !userId) return
        
        // Handle Cancel case in subscription specifically to trigger Second Brain
        if (currentItem.type === 'subscription' && editValue === 'Cancel') {
            triggerSecondBrainCancel(currentItem)
        }

        // Handle Goal Trade-offs bridging to structural envelope constraint updates
        if (currentItem.type === 'budget') {
            await dataStore.addEntry(userId, 'envelope-baselines', { amountCut: editValue, originalSqueezeCard: currentItem.id })
            
            // Explicitly resolve cache UUIDs to purge Envelopes cache safely to avoid the deleteEntry error
            try { 
                const envelopeCaches = await dataStore.getEntries('plaid-cache-envelopes', userId)
                for (const row of envelopeCaches) {
                    await dataStore.deleteEntry(row.id)
                }
            } catch (e) {}
        }

        await dataStore.saveMoneyDecision(userId, {
            decisionId: currentItem.id,
            title: currentItem.title,
            amount: currentItem.amount,
            type: currentItem.type,
            action: 'edit',
            editValue: editValue
        })
        await dataStore.removeMoneyQueueItem(userId, currentItem.id)

        setDecisionsMade(prev => prev + 1)
        setQueue(q => q.slice(1))
        setEditingId(null)
    }

    const triggerSecondBrainCancel = (item: QueueItem) => {
        // Mocking Second Brain Inbox Integration
        const creationDay = new Date().toISOString().split('T')[0]
        const deadlineDate = new Date()
        deadlineDate.setDate(deadlineDate.getDate() + 7)
        const deadlineISO = deadlineDate.toISOString().split('T')[0]

        const taskName = `Cancel: ${item.title}`
        
        console.log(`[SECOND BRAIN] Creating task in Inbox: ${taskName} (Deadline: ${deadlineISO})`)
        
        // Final task payload including name, cost, link, and the newly added deadline
        const inboxPayload = {
            note: `${taskName}\nCost: £${item.amount}\nService Link: https://www.google.com/search?q=cancel+${item.title.replace(' ', '+')}\nOriginally Surface: ${new Date().toLocaleDateString()}`,
            date: creationDay,
            deadline: deadlineISO,
            processed: false
        }
        // In a real app we'd call: dataStore.addEntry(userId, 'inbox-sb', inboxPayload)
        toast.success(`Second Brain synchronized: ${taskName}`, {
            description: `A task with a deadline of ${new Date(deadlineISO).toLocaleDateString()} has been added to your Inbox.`
        })
    }

    useEffect(() => {
        if (!isDemo || !currentItem) return;
        
        const timer1 = setTimeout(() => {
            // Pulse effect simulated via simple timeout
            const btn = document.getElementById('keep-it-btn');
            if (btn) {
                btn.classList.add('scale-110', 'bg-teal-400');
                setTimeout(() => btn.classList.remove('scale-110', 'bg-teal-400'), 200);
            }
        }, 1500)

        const timer2 = setTimeout(() => {
            handleAction('keep');
        }, 2000)

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        }
    }, [isDemo, currentItem?.id])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 animate-in fade-in duration-700">
                <Loader2 className="size-8 animate-spin text-neutral-800" />
            </div>
        )
    }

    if (!currentItem) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] text-neutral-500 animate-in fade-in zoom-in-95 duration-700">
                <div className="mb-4 p-4 rounded-full border border-neutral-800 bg-neutral-900/40">
                    <Check className="w-8 h-8 text-neutral-700" />
                </div>
                <div className="text-sm font-mono uppercase tracking-[0.2em] mb-2 font-medium">Structure Synchronized</div>
                <div className="text-xs text-neutral-600">Zero pending financial decisions.</div>
                
                <div className="mt-24 text-[10px] font-mono uppercase tracking-widest text-neutral-600">
                    {decisionsMade} decisions made this month
                </div>
            </div>
        )
    }

    // Check friction log condition (simplified returns after 3 consecutive)
    const consecutiveDismissals = dismissalMap[currentItem.id] || 0
    const isSimplified = consecutiveDismissals >= 3

    return (
        <div className="max-w-3xl mx-auto pt-8 space-y-12 pb-24">
            
            {/* Idle Cash Banner */}
            <AnimatePresence>
                {bannerVisible && idleCashFactor > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center justify-between border-b border-teal-500/20 bg-teal-500/5 px-6 py-4"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
                            <span className="text-teal-400 font-mono text-sm uppercase tracking-wide">
                                £{idleCashFactor} above buffer — move £300 to savings?
                            </span>
                        </div>
                        <button 
                            onClick={() => setBannerVisible(false)}
                            className="text-teal-400 border border-teal-500/40 hover:bg-teal-500/10 px-6 py-2 text-xs font-mono uppercase tracking-widest transition-all bg-black/40"
                        >
                            Confirm
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decision Card Container */}
            <div className="relative">
                <motion.div 
                    layout
                    className={`border border-neutral-800 bg-[#0A0A0A] overflow-hidden transition-all duration-500 ${editingId ? 'ring-1 ring-teal-500/30' : ''}`}
                >
                    <div className="p-12 flex flex-col items-center text-center space-y-8">
                        {/* Header Area */}
                        <div className="space-y-2">
                            <div className="text-neutral-500 font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
                                {currentItem.type} {isSimplified && <span className="text-amber-500 ml-2">(FRICTION RE-ROUTE)</span>}
                            </div>
                            <h2 className="text-3xl text-neutral-100 font-bebas tracking-wider uppercase">
                                {isSimplified ? `REVIEW: ${currentItem.title}` : currentItem.title}
                            </h2>
                        </div>

                        {/* Amount - Anchored */}
                        <div className="text-6xl font-mono text-neutral-200 tracking-tighter">
                            £{currentItem.amount.toFixed(2)}
                        </div>

                        {/* Context Line */}
                        <p className="text-neutral-400 text-lg font-light max-w-lg leading-relaxed italic border-l border-neutral-800 pl-4">
                            {isSimplified 
                                ? "Simplified: You've skipped this 3 times. Should we automate or ignore?" 
                                : currentItem.reason}
                        </p>

                        {!editingId ? (
                            /* Primary Action Block */
                            <div className="flex flex-col items-center gap-8 w-full">
                                <div className="flex items-center gap-6 w-full max-w-sm">
                                    <button 
                                        onClick={() => handleAction('edit')}
                                        className="flex-1 py-4 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-600 transition-all font-mono text-[11px] uppercase tracking-widest bg-neutral-900/20"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        id="keep-it-btn"
                                        onClick={() => handleAction('keep')}
                                        className="flex-1 py-4 bg-teal-600 hover:bg-teal-500 text-teal-50 shadow-lg shadow-teal-900/20 transition-all font-mono text-[11px] uppercase tracking-widest font-bold"
                                    >
                                        Keep it
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={() => handleAction('remind')}
                                    className="text-neutral-600 hover:text-neutral-400 font-mono text-[10px] uppercase tracking-widest transition-colors flex items-center gap-2"
                                >
                                    <RotateCw className="w-3 h-3" />
                                    Remind me tomorrow
                                </button>
                            </div>
                        ) : (
                            /* Editing State Display */
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="w-full pt-8 border-t border-neutral-800/50 space-y-8"
                            >
                                {currentItem.type === 'subscription' && (
                                    <div className="flex flex-wrap items-center justify-center gap-3">
                                        {['Keep it', 'Cancel', 'Downgrade', 'Remind 30d'].map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => setEditValue(opt)}
                                                className={`px-4 py-2 text-[10px] font-mono uppercase tracking-widest border transition-all ${editValue === opt ? 'border-teal-500 bg-teal-500/10 text-neutral-100' : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'}`}
                                            >
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {currentItem.type === 'transfer' && (
                                    <div className="max-w-xs mx-auto space-y-3">
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-mono italic text-lg whitespace-nowrap">£</span>
                                            <input 
                                                type="number" 
                                                value={editValue as number}
                                                onChange={(e) => setEditValue(parseFloat(e.target.value))}
                                                className="w-full bg-black border border-neutral-700 py-4 pl-10 pr-4 text-center text-4xl font-mono text-neutral-100 focus:outline-none focus:border-teal-500 transition-colors"
                                            />
                                        </div>
                                        <div className="text-[10px] font-mono uppercase text-neutral-600 tracking-widest">
                                            Market suggest: £{currentItem.amount}
                                        </div>
                                    </div>
                                )}

                                {currentItem.type === 'envelope' && (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex bg-neutral-900 border border-neutral-800 p-1">
                                            {['Update my normal pace', 'Ignore this cycle'].map(opt => (
                                                <button
                                                    key={opt}
                                                    onClick={() => setEditValue(opt)}
                                                    className={`px-6 py-3 text-[10px] font-mono uppercase tracking-widest transition-all ${editValue === opt ? 'bg-black text-neutral-100' : 'text-neutral-500 hover:text-neutral-300'}`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-center gap-4 pt-4">
                                    <button 
                                        onClick={() => setEditingId(null)}
                                        className="px-8 py-3 text-neutral-500 hover:text-neutral-300 font-mono text-[11px] uppercase tracking-widest"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={confirmEdit}
                                        className="px-8 py-3 bg-neutral-100 text-black hover:bg-white transition-all font-mono text-[11px] uppercase tracking-widest font-bold"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
                
                {/* Visual Stack Indicator for queue depth */}
                {queue.length > 1 && (
                    <div className="absolute top-4 -right-2 -z-10 w-full h-full border border-neutral-900 bg-neutral-900/20 translate-y-3" />
                )}
            </div>

            {/* Support Info */}
            <div className="flex flex-col items-center space-y-2">
                <div className="text-neutral-600 font-mono text-[11px] uppercase tracking-[0.3em] font-medium">
                    {queue.length - 1} items remaining in queue
                </div>
                <div className="text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-700">
                    {decisionsMade} decisions made this month
                </div>
            </div>
        </div>
    )
}
