'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { 
    Sheet, 
    SheetContent, 
    SheetHeader, 
    SheetTitle, 
    SheetDescription,
    SheetClose
} from "@/components/ui/sheet"
import { 
    ChevronRight, 
    AlertCircle, 
    CheckCircle2, 
    Clock, 
    ArrowRightLeft,
    TrendingUp,
    Check,
    Loader2
} from 'lucide-react'
import { toast } from 'sonner'

type Transaction = {
    id: string
    merchant: string
    amount: number
    date: string
    category: string
}

type Envelope = {
    id: string
    name: string
    paceStatus: 'Fast' | 'On track' | 'Slow'
    velocity: number // e.g., 1.8 for 1.8x
    currentSpent: number
    daysInCycle: number
    usualPacePerWeek: number
    transactions: Transaction[]
}

export function Envelopes({ isDemo }: { isDemo?: boolean }) {
    const [selectedEnv, setSelectedEnv] = useState<Envelope | null>(null)
    const [envelopes, setEnvelopes] = useState<Envelope[]>([])
    const [loading, setLoading] = useState(true)
    const [movingTx, setMovingTx] = useState<Transaction | null>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchEnvelopes = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                try {
                    const response = await fetch(`/api/plaid/envelopes-data?userId=${user.id}`);
                    const data = await response.json();
                    if (data.envelopes) setEnvelopes(data.envelopes);
                } catch (err) {
                    console.error("Error fetching envelopes:", err);
                } finally {
                    setLoading(false)
                }
            }
        }
        fetchEnvelopes()
    }, [supabase])

    const handleMoveSubmit = async (targetEnvName: string) => {
        if (!movingTx || !selectedEnv) return
        
        try {
            toast.loading("Re-routing merchant logic...", { id: 'move-toast' });
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            
            const res = await fetch('/api/plaid/envelopes-data', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    merchant: movingTx.merchant,
                    targetEnvelope: targetEnvName
                })
            })
            
            const result = await res.json()
            if (result.status === 'success') {
                toast.success(`Merchant "${movingTx.merchant}" successfully migrated to ${targetEnvName}`, { id: 'move-toast' });
                setMovingTx(null);
                
                // Re-hydrate the screen
                setLoading(true);
                const response = await fetch(`/api/plaid/envelopes-data?userId=${user.id}`);
                const data = await response.json();
                if (data.envelopes) {
                    setEnvelopes(data.envelopes);
                    // refresh current sheet details if it's open
                    setSelectedEnv(data.envelopes.find((e: any) => e.name === selectedEnv.name) || null);
                }
            } else {
                throw new Error("API Failure");
            }
        } catch (e) {
            toast.error("Failed to commit routing definition.", { id: 'move-toast' });
        } finally {
            setLoading(false);
        }
    }

    const handleEscalate = (env: Envelope) => {
        toast.success(`Escalated ${env.name} to Daily Decisions`, {
            description: "A card has been created in your queue to address this spending pace."
        })
        setSelectedEnv(null)
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20 max-w-5xl mx-auto">
            
            {loading && (
                <div className="flex items-center justify-center p-20">
                    <Loader2 className="size-8 animate-spin text-neutral-800" />
                </div>
            )}
            <div className="space-y-4">
                <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.4em] font-bold">
                    Behavioral Spending Zones
                </div>
                <p className="text-neutral-500 font-mono text-xs uppercase leading-relaxed max-w-2xl tracking-widest">
                    Diagnostic view of spending rhythms derived from 90 days of Plaid history. 
                    These are not budgets. They are velocity markers.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {envelopes.map(env => (
                    <EnvelopeCard 
                        key={env.id} 
                        envelope={env} 
                        onClick={() => setSelectedEnv(env)} 
                    />
                ))}
            </div>

            {/* Drill-down Sheet */}
            <Sheet open={!!selectedEnv} onOpenChange={(open) => !open && setSelectedEnv(null)}>
                <SheetContent className="bg-black border-neutral-900 w-full sm:max-w-md p-0 overflow-y-auto border-l">
                    {selectedEnv && (
                        <div className="h-full flex flex-col">
                            <div className="p-8 space-y-12">
                                <SheetHeader>
                                    <div className="font-mono text-[9px] text-neutral-500 uppercase tracking-[0.3em] font-bold mb-2">Diagnostic Detail</div>
                                    <SheetTitle className="text-3xl font-mono text-neutral-100 uppercase tracking-tighter">
                                        {selectedEnv.name}
                                    </SheetTitle>
                                </SheetHeader>

                                {/* Reason Section */}
                                <div className="space-y-4 p-6 bg-neutral-900/30 border border-neutral-800">
                                    <div className="flex items-center gap-2 font-mono text-[10px] text-teal-500 uppercase tracking-widest font-bold">
                                        <TrendingUp className="size-3" />
                                        Calculated rhythm
                                    </div>
                                    <p className="font-mono text-sm text-neutral-300 leading-relaxed tracking-tight lowercase">
                                        You've spent £{selectedEnv.currentSpent} in {selectedEnv.daysInCycle} days. 
                                        Your usual pace is £{selectedEnv.usualPacePerWeek} per week. 
                                        You're running about {selectedEnv.velocity}× {selectedEnv.velocity >= 1 ? 'faster' : 'slower'} than normal this cycle.
                                    </p>
                                </div>

                                {/* Transaction Evidence */}
                                <div className="space-y-6">
                                    <div className="font-mono text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold">Evidence in current cycle</div>
                                    <div className="divide-y divide-neutral-900 border-y border-neutral-900">
                                        {selectedEnv.transactions.map(t => (
                                            <div key={t.id} className="group relative divide-y divide-transparent border-y border-transparent transition-all">
                                                <button 
                                                    onClick={() => setMovingTx(movingTx?.id === t.id ? null : t)}
                                                    className={`w-full py-4 flex items-center justify-between text-left hover:bg-neutral-900/40 transition-colors px-2 ${movingTx?.id === t.id ? 'bg-neutral-900' : ''}`}
                                                >
                                                    <div className="space-y-1">
                                                        <div className="text-neutral-200 font-mono text-xs uppercase tracking-wide">{t.merchant}</div>
                                                        <div className="text-neutral-600 font-mono text-[9px] uppercase tracking-widest">
                                                            {new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-neutral-400 font-mono text-xs italic">-£{t.amount.toFixed(2)}</div>
                                                        <ArrowRightLeft className={`size-3 transition-colors ${movingTx?.id === t.id ? 'text-teal-500' : 'text-neutral-800 group-hover:text-teal-500'}`} />
                                                    </div>
                                                </button>
                                                
                                                {/* Route Selector Dropdown UI */}
                                                {movingTx?.id === t.id && (
                                                    <div className="bg-black border border-neutral-900 p-4 m-2 animate-in slide-in-from-top-2">
                                                        <div className="font-mono text-[9px] text-neutral-500 uppercase tracking-widest mb-3">Re-route merchant to:</div>
                                                        <div className="flex flex-wrap gap-2">
                                                            {envelopes.map(e => e.name !== selectedEnv.name ? (
                                                                <button 
                                                                    key={e.name}
                                                                    onClick={() => handleMoveSubmit(e.name)}
                                                                    className="px-3 py-1.5 border border-neutral-800 text-neutral-400 hover:text-white hover:border-teal-500/50 bg-neutral-900/20 font-mono text-[10px] uppercase tracking-widest transition-colors"
                                                                >
                                                                    {e.name}
                                                                </button>
                                                            ) : null)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="text-[10px] font-mono text-neutral-600 uppercase italic">
                                        Tap a transaction to move it to a different envelope.
                                    </div>
                                </div>
                            </div>

                            {/* Action Footer */}
                            <div className="mt-auto p-8 border-t border-neutral-900 bg-[#0A0A0A]">
                                <button 
                                    onClick={() => handleEscalate(selectedEnv)}
                                    className="w-full py-4 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-[0.2em] font-bold hover:bg-white/90 transition-colors"
                                >
                                    Add to Daily Decisions
                                </button>
                                <div className="mt-4 text-[9px] font-mono text-neutral-600 text-center uppercase tracking-widest">
                                    Escalate for manual adjustment or temporary ceiling
                                </div>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

function EnvelopeCard({ envelope, onClick }: { envelope: Envelope, onClick: () => void }) {
    const isNormal = envelope.paceStatus === 'On track'

    return (
        <button 
            onClick={onClick}
            className="group relative flex flex-col bg-neutral-900/10 border border-neutral-900 p-8 hover:border-neutral-800 transition-all duration-300 text-left overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-4">
                {isNormal && (
                    <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[8px] text-teal-600 uppercase tracking-widest">Perfect Pace</span>
                        <div className="size-1.5 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.6)]" />
                    </div>
                )}
            </div>

            <div className="space-y-8 flex-1">
                <div className="font-mono text-[10px] text-neutral-600 uppercase tracking-[0.4em] font-bold group-hover:text-neutral-400 transition-colors">
                    {envelope.name}
                </div>

                {/* Pace Gauge Visualization (Half-Circle) */}
                <div className="relative h-24 flex items-end justify-center">
                    <svg className="w-40 h-20 overflow-visible" viewBox="0 0 100 50">
                        {/* Background Track */}
                        <path 
                            d="M 10 50 A 40 40 0 0 1 90 50" 
                            fill="none" 
                            stroke="#171717" 
                            strokeWidth="4" 
                        />
                        {/* Indicator Shadow Track */}
                        <path 
                            d="M 10 50 A 40 40 0 0 1 90 50" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="1.5" 
                            className={`${
                                envelope.paceStatus === 'Fast' ? 'text-amber-500/10' :
                                envelope.paceStatus === 'Slow' ? 'text-teal-500/10' : 'text-neutral-800'
                            }`}
                        />
                        
                        {/* The Indicator Needle (Absolute Coordinate Calculation for 100% Hub Stability) */}
                        {(() => {
                            const angle = (Math.min(2, envelope.velocity) - 1) * 90
                            const angleRad = (angle - 90) * (Math.PI / 180)
                            const x2 = 50 + 35 * Math.cos(angleRad)
                            const y2 = 50 + 35 * Math.sin(angleRad)
                            const color = envelope.paceStatus === 'Fast' ? '#f59e0b' :
                                         envelope.paceStatus === 'Slow' ? '#14b8a6' : '#525252'
                            
                            return (
                                <>
                                    <motion.line
                                        x1="50" y1="50"
                                        initial={{ x2: 50, y2: 15 }}
                                        animate={{ x2, y2 }}
                                        stroke={color}
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                                    />
                                    <circle cx="50" cy="50" r="3" fill="#262626" />
                                </>
                            )
                        })()}
                    </svg>
                    
                    <div className="absolute bottom-0 inset-x-0 flex justify-between px-4 text-[8px] font-mono text-neutral-700 uppercase tracking-widest">
                        <span>Slow</span>
                        <span>Fast</span>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-neutral-900 pt-6">
                    <div className={`font-mono text-[10px] uppercase tracking-widest font-bold ${
                        envelope.paceStatus === 'Fast' ? 'text-amber-500' :
                        envelope.paceStatus === 'Slow' ? 'text-teal-500' : 'text-neutral-400'
                    }`}>
                        {envelope.paceStatus} PACE
                    </div>
                    <ChevronRight className="size-3 text-neutral-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                </div>
            </div>
        </button>
    )
}
