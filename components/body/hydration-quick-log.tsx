'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/utils/supabase/client'
import { Droplets, Plus, Minus } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────
   Helper: local timezone YYYY-MM-DD
   ───────────────────────────────────────────────────────────────────────── */
function toLocalIso(d: Date): string {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

export function HydrationQuickLog({ userId, onUpdate }: { userId: string, onUpdate?: () => void }) {
    const supabase = createClient()
    const [glasses, setGlasses] = useState(0)
    const [entryId, setEntryId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const todayStr = useMemo(() => toLocalIso(new Date()), [])

    const load = useCallback(async () => {
        // Find existing hydration entry for today
        const { data } = await supabase
            .from('entries')
            .select('*')
            .eq('user_id', userId)
            .eq('microapp_id', 'diet')

        if (data && data.length > 0) {
            // Find the exact one matching todayStr
            const todayEntry = data.find(e => {
                const dList = String(e.data?.['Date'] || e.created_at || '');
                const isHydration = e.data?.['Type'] === 'hydration';
                return dList.startsWith(todayStr) && isHydration;
            });
            if (todayEntry) {
                setEntryId(todayEntry.id)
                setGlasses(Number(todayEntry.data['Hydration (glasses)'] || 0))
                return
            }
        }
    }, [userId, supabase, todayStr])

    useEffect(() => {
        load()
    }, [load])

    const updateHydration = async (delta: number) => {
        if (saving) return
        setSaving(true)
        const nextVal = Math.max(0, glasses + delta)
        setGlasses(nextVal)

        if (entryId) {
            // Update
            await supabase
                .from('entries')
                .update({
                    data: {
                        Type: 'hydration', // explicitly tag it
                        Date: todayStr,
                        'Meal': 'Hydration Log',
                        'Hydration (glasses)': nextVal.toString()
                    }
                })
                .eq('id', entryId)
        } else {
            // Insert
            const { data } = await supabase
                .from('entries')
                .insert({
                    user_id: userId,
                    microapp_id: 'diet',
                    data: {
                        Type: 'hydration',
                        Date: todayStr,
                        'Meal': 'Hydration Log',
                        'Hydration (glasses)': nextVal.toString()
                    }
                })
                .select()
                .single()
            if (data) {
                setEntryId(data.id)
            }
        }
        setSaving(false)
        if (onUpdate) onUpdate()
    }

    return (
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/[0.03] p-6 shadow-[0_4px_20px_rgba(14,165,233,0.05)]">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400">
                    <Droplets className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-white font-semibold">Hydration Tracker</h3>
                    <p className="text-[10px] uppercase tracking-[0.1em] text-white/40">Daily Goal: 8-10 glasses</p>
                </div>
            </div>

            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 rounded-xl p-3">
                <button
                    onClick={() => updateHydration(-1)}
                    disabled={glasses === 0 || saving}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/60 disabled:opacity-30 transition"
                >
                    <Minus className="w-4 h-4" />
                </button>

                <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl font-mono font-bold text-white">{glasses}</span>
                    <span className="text-xs text-white/30">/8</span>
                </div>

                <button
                    onClick={() => updateHydration(1)}
                    disabled={saving}
                    className="w-10 h-10 flex items-center justify-center rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 transition"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            <div className="mt-4 flex gap-[2px]">
                {Array.from({ length: 8 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full ${i < glasses ? 'bg-sky-400' : 'bg-white/10'}`}
                        animate={{ backgroundColor: i < glasses ? '#38bdf8' : 'rgba(255,255,255,0.1)' }}
                        transition={{ duration: 0.3 }}
                    />
                ))}
            </div>
        </div>
    )
}
