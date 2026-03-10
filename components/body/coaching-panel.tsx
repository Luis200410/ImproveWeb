import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Zap, Sparkles, TrendingUp, TrendingDown, Target, Activity, ShieldCheck, CheckCircle2, Wind, HeartPulse } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    userId: string
}

export function CoachingPanel({ userId }: Props) {
    const [coaching, setCoaching] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [lastCoached, setLastCoached] = useState<string | null>(null)

    const fetchCoaching = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/ai/coaching', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to fetch coaching session')
            setCoaching(data.coaching)
            setLastCoached(new Date().toLocaleTimeString())
        } catch (err: any) {
            setError(err.message || 'Something went wrong.')
        } finally {
            setLoading(false)
        }
    }, [userId])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden"
        >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/8 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">AI Coaching · 15s Session</span>
                </div>
                {lastCoached && !loading && (
                    <span className="text-[9px] text-white/20">Last review: {lastCoached}</span>
                )}
            </div>

            <div className="p-5 space-y-4">
                {!coaching && !loading && !error && (
                    <div className="text-center py-4 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/15 flex items-center justify-center mx-auto">
                            <Sparkles className="w-6 h-6 text-white/30" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-white/80">Get Your 15-Second Action Plan</p>
                            <p className="text-[10px] text-white/30 max-w-[220px] mx-auto">AI analyzes your recent workout, nutrition, and recovery logs vs your identity goals.</p>
                        </div>
                        <Button
                            onClick={fetchCoaching}
                            className="w-full bg-emerald-500/90 hover:bg-emerald-500 text-black font-bold h-11 text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                        >
                            Analyze Now
                        </Button>
                    </div>
                )}

                {loading && (
                    <div className="py-10 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                        <div className="text-center space-y-1">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 animate-pulse">Syncing performance data</p>
                            <p className="text-[9px] text-white/20">Reviewing diet quality · strength trends · recovery state</p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 space-y-3">
                        <p className="text-xs text-rose-300/80 leading-relaxed font-medium">"{error}"</p>
                        <Button
                            onClick={fetchCoaching}
                            variant="outline"
                            className="w-full h-9 text-[10px] uppercase tracking-widest border-rose-500/20 text-rose-300 hover:bg-rose-500/10"
                        >
                            Retry Session
                        </Button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {coaching && !loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                        >
                            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.04] relative group">
                                <div className="absolute -left-1 top-4 bottom-4 w-1 bg-emerald-500/50 rounded-full" />
                                <div className="text-sm text-white/80 leading-relaxed prose prose-invert prose-sm max-w-none 
                                    prose-p:text-white/80 prose-li:text-white/75 prose-strong:text-emerald-400 prose-ul:pl-4 prose-li:my-1">
                                    <pre className="whitespace-pre-wrap font-sans text-sm">
                                        {coaching}
                                    </pre>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    onClick={fetchCoaching}
                                    variant="outline"
                                    className="border-white/15 text-white/60 hover:bg-white/10 h-10 text-[10px] uppercase tracking-widest"
                                >
                                    <Activity className="w-3.5 h-3.5 mr-2" /> Refresh
                                </Button>
                                <Button
                                    onClick={() => setCoaching(null)}
                                    variant="outline"
                                    className="border-white/15 text-white/60 hover:bg-white/10 h-10 text-[10px] uppercase tracking-widest"
                                >
                                    Done
                                </Button>
                            </div>

                            {/* Privacy confirmation */}
                            <div className="flex items-center justify-center gap-2 text-[10px] text-white/25 uppercase tracking-widest border-t border-white/8 pt-3">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/50" />
                                Metadata only · 100% private
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
