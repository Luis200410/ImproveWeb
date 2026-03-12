'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Entry } from '@/lib/data-store'
import { Plus, Edit, Trash2, Wind, HeartPulse, Brain, BatteryCharging, Zap } from 'lucide-react'
import { Playfair_Display, Inter } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface Props {
    entries: Entry[]
    userId: string
    onEditEntry: (entry: Entry) => void
    onDeleteEntry: (id: string) => void
    onManualLog: () => void
}

export function RecoveryDashboard({ entries, userId, onEditEntry, onDeleteEntry, onManualLog }: Props) {
    const toLocalIso = (d: Date) => {
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, '0')
        const dd = String(d.getDate()).padStart(2, '0')
        return `${yyyy}-${mm}-${dd}`
    }

    const todayStr = toLocalIso(new Date())

    const isToday = (dStr: string) => {
        if (!dStr) return false;
        if (!dStr.includes('T')) {
            return dStr.startsWith(todayStr);
        }
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return false;
        return toLocalIso(d) === todayStr;
    }

    const todayEntries = entries.filter(e => {
        const dStr = String(e.data['Date'] || e.createdAt || '')
        return isToday(dStr)
    })

    const pastEntries = entries.filter(e => {
        const dStr = String(e.data['Date'] || e.createdAt || '')
        return !isToday(dStr)
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    const getIcon = (modality: string) => {
        switch (modality?.toLowerCase()) {
            case 'breathwork': return <Wind className="w-5 h-5 text-sky-400" />
            case 'nap': return <BatteryCharging className="w-5 h-5 text-indigo-400" />
            case 'mind': return <Brain className="w-5 h-5 text-purple-400" />
            case 'contrast':
            case 'cold / heat': return <HeartPulse className="w-5 h-5 text-rose-400" />
            default: return <HeartPulse className="w-5 h-5 text-emerald-400" />
        }
    }

    return (
        <div className="space-y-12 pb-24">
            
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-4 mb-6 mt-4"
            >
                <h2 className={`${playfair.className} text-3xl font-bold text-white flex items-center gap-3`}>
                    <BatteryCharging className="w-6 h-6 text-sky-400" /> Output Readiness
                </h2>
                <div className="flex gap-2 ml-auto">
                    <button onClick={onManualLog} className="px-5 py-2 hover:bg-white text-white hover:text-black border border-white/20 rounded-lg text-xs font-bold uppercase tracking-widest transition flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                        <Plus className="w-4 h-4" /> Log Session
                    </button>
                </div>
            </motion.div>

            {todayEntries.length === 0 ? (
                <div className="relative group overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.02] p-10 md:p-14 text-center">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                        <BatteryCharging className="w-8 h-8 text-sky-400/50" />
                    </div>
                    <h3 className={`${playfair.className} text-3xl font-bold text-white mb-3 relative z-10`}>No Recovery Logged</h3>
                    <p className={`${inter.className} text-white/40 max-w-sm mx-auto mb-8 text-sm leading-relaxed relative z-10`}>
                        Take a moment to reset your nervous system. Whether it's 5 minutes of breathing or 30 minutes of mobility.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {todayEntries.map((entry, i) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.1 }}
                            className="relative group border border-white/10 rounded-3xl bg-white/[0.04] p-8 overflow-hidden"
                        >
                            <div className="absolute -top-12 -right-12 w-40 h-40 bg-sky-500/10 blur-[60px] pointer-events-none" />
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10">
                                        {getIcon(String(entry.data['Modality']))}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-xl">{String(entry.data['Modality'] || 'Recovery')}</h3>
                                        <p className="text-[10px] uppercase tracking-widest text-sky-400 mt-0.5">
                                            {String(entry.data['Focus Area'] || 'General Focus')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-mono text-white font-bold">{entry.data['Readiness (1-10)'] || '-'}</div>
                                    <div className="text-[10px] uppercase tracking-widest text-white/30">Readiness</div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-3 gap-2 bg-black/40 rounded-2xl p-4 border border-white/5 relative z-10">
                                <div className="text-center border-r border-white/5">
                                    <div className="text-xs uppercase tracking-widest text-white/30 mb-1">Time</div>
                                    <div className="text-white font-medium">{entry.data['Duration (min)'] || 0}m</div>
                                </div>
                                <div className="text-center border-r border-white/5">
                                    <div className="text-xs uppercase tracking-widest text-white/30 mb-1">Intensity</div>
                                    <div className="text-white font-medium">{entry.data['Intensity'] || 'Low'}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-xs uppercase tracking-widest text-white/30 mb-1">Sleep</div>
                                    <div className="text-white font-medium">{entry.data['Sleep Hours'] ? `${entry.data['Sleep Hours']}h` : '—'}</div>
                                </div>
                            </div>

                            {entry.data['Notes'] && (
                                <p className="mt-5 text-sm text-white/50 leading-relaxed italic relative z-10">
                                    "{entry.data['Notes']}"
                                </p>
                            )}

                            {/* Actions overlay */}
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <button onClick={() => onEditEntry(entry)} className="p-2 bg-black/50 text-white/60 hover:text-white transition rounded-lg border border-white/10 backdrop-blur-md">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => onDeleteEntry(entry.id)} className="p-2 bg-black/50 text-white/60 hover:text-rose-400 transition rounded-lg border border-white/10 backdrop-blur-md hover:border-rose-500/30">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {pastEntries.length > 0 && (
                <div className="mt-16">
                    <h3 className={`${playfair.className} text-xl text-white/50 mb-6 flex items-center gap-2`}>
                        <Wind className="w-4 h-4" /> Session History
                    </h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {pastEntries.map(entry => (
                            <div key={entry.id} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col group relative">
                                <p className="text-[10px] font-mono text-white/30 tracking-widest mb-1.5 flex justify-between">
                                    {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                                    <span className={Number(entry.data['Readiness (1-10)']) >= 8 ? 'text-emerald-400' : 'text-white/40'}>
                                        {entry.data['Readiness (1-10)'] ? `${entry.data['Readiness (1-10)']}/10` : ''}
                                    </span>
                                </p>
                                <h4 className="text-sm font-semibold text-white/80">{String(entry.data['Modality'] || 'Recovery')}</h4>
                                <p className="text-xs text-white/40">{entry.data['Duration (min)']} min · {String(entry.data['Focus Area'] || 'General')}</p>
                                
                                <button onClick={() => onDeleteEntry(entry.id)} className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-white/40 hover:text-rose-400 transition">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
