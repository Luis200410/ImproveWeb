import { motion, AnimatePresence } from 'framer-motion'
import { Entry } from '@/lib/data-store'
import { Plus, Edit, Trash2, Droplets, Zap, Clock, Utensils, Calendar, ArrowRight } from 'lucide-react'
import { Playfair_Display, Inter } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })
import { MacroRingsPanel } from './macro-rings-panel'
import { HydrationQuickLog } from './hydration-quick-log'

interface DietDashboardProps {
    entries: Entry[]
    userId: string
    onEditEntry: (entry: Entry) => void
    onDeleteEntry: (id: string) => void
    onScanMeal: () => void
    onManualLog: () => void
    onUpdate: () => void
}

export function DietDashboard({ entries, userId, onEditEntry, onDeleteEntry, onScanMeal, onManualLog, onUpdate }: DietDashboardProps) {

    // Helper to format date consistently
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

    // Separate today's meals from history
    const todayEntries = entries.filter(e => {
        const dStr = String(e.data['Date'] || e.createdAt || '')
        return isToday(dStr)
    })

    const pastEntries = entries.filter(e => {
        const dStr = String(e.data['Date'] || e.createdAt || '')
        return !isToday(dStr)
    })

    // Sort today's entries by time (assuming createdAt or Date dictates order)
    todayEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    pastEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return (
        <div className="space-y-12 pb-24">
            
            {/* Top Level Macro Rings */}
            <div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 mb-6 mt-4"
                >
                    <h2 className={`${playfair.className} text-2xl font-bold text-white flex items-center gap-3`}>
                        <Zap className="w-5 h-5 text-emerald-400" /> Daily Analytics
                    </h2>
                    <div className="h-px bg-white/10 flex-1" />
                </motion.div>
                
                <MacroRingsPanel entries={entries} userId={userId} />
            </div>

            {/* Today's Timeline */}
            <div>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <h2 className={`${playfair.className} text-2xl font-bold text-white flex items-center gap-3`}>
                        <Clock className="w-5 h-5 text-sky-400" /> Today's Logs
                    </h2>
                    <div className="flex gap-2 ml-auto">
                        <button onClick={onManualLog} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white/50 hover:text-white transition border border-white/10 hover:border-white/30 rounded-lg">
                            Manual Log
                        </button>
                        <button onClick={onScanMeal} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-[10px] font-bold uppercase tracking-widest transition flex items-center gap-1.5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                            <Utensils className="w-3.5 h-3.5" /> Scan
                        </button>
                    </div>
                </motion.div>

                {/* Hydration quick log injection */}
                <div className="mb-10">
                    <HydrationQuickLog userId={userId} onUpdate={onUpdate} />
                </div>

                {todayEntries.length === 0 ? (
                    <div className="text-center py-16 bg-white/[0.02] border border-white/10 rounded-3xl">
                        <Utensils className="w-8 h-8 text-white/20 mx-auto mb-4" />
                        <h4 className={`${playfair.className} text-xl text-white`}>No meals logged today</h4>
                        <p className="text-white/40 text-sm mt-2">Scan your first meal to start tracking your macros.</p>
                    </div>
                ) : (
                    <div className="relative border-l border-white/10 ml-4 md:ml-8 pl-8 md:pl-12 space-y-10">
                        {todayEntries.map((entry, i) => (
                            <motion.div
                                key={entry.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="relative group"
                            >
                                {/* Timeline Node */}
                                <div className="absolute -left-[41px] md:-left-[57px] top-4 w-4 h-4 rounded-full bg-black border-2 border-emerald-500/50 group-hover:border-emerald-400 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.5)] transition" />
                                
                                <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6 hover:bg-white/[0.04] transition group-hover:border-white/20 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    
                                    {/* Left Content */}
                                    <div className="space-y-3 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-white/60 uppercase tracking-widest">
                                                {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-white/50 uppercase tracking-widest">
                                                {entry.data['Meal']}
                                            </span>
                                            {Number(entry.data['Fuel Grade']) > 0 && (
                                                <span className={`text-[10px] px-2 py-0.5 rounded border font-medium uppercase tracking-widest ${
                                                    Number(entry.data['Fuel Grade']) >= 8 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'
                                                    : Number(entry.data['Fuel Grade']) >= 5 ? 'border-amber-500/30 text-amber-400 bg-amber-500/10'
                                                    : 'border-rose-500/30 text-rose-400 bg-rose-500/10'
                                                }`}>
                                                    Grade: {entry.data['Fuel Grade']}/10
                                                </span>
                                            )}
                                        </div>

                                        <h3 className={`${playfair.className} text-2xl md:text-3xl text-white`}>
                                            {String(entry.data['Plate Build'] || entry.data['Meal'] || 'Unnamed Meal')}
                                        </h3>

                                        {/* Hydration specifically flagged */}
                                        {Number(entry.data['Hydration (glasses)']) > 0 && (
                                            <div className="flex items-center gap-1.5 text-xs text-sky-400/80">
                                                <Droplets className="w-3.5 h-3.5 text-sky-400" />
                                                Included {entry.data['Hydration (glasses)']} glasses of water
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Macros Dashboard */}
                                    <div className="shrink-0 flex items-center gap-6">
                                        <div className="flex flex-col items-center">
                                            <span className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Kcal</span>
                                            <span className="text-3xl font-mono text-emerald-300 font-bold">{entry.data['Calories'] || 0}</span>
                                        </div>
                                        
                                        <div className="h-12 w-px bg-white/10" />
                                        
                                        <div className="flex gap-4 text-center">
                                            <div>
                                                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Pro</div>
                                                <div className="text-xl font-mono text-white/80">{entry.data['Protein (g)'] || 0}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Crb</div>
                                                <div className="text-xl font-mono text-white/80">{entry.data['Carbs (g)'] || 0}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Fat</div>
                                                <div className="text-xl font-mono text-white/80">{entry.data['Fats (g)'] || 0}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Reveal */}
                                    <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => onEditEntry(entry)} className="p-2 text-white/40 hover:text-white transition rounded-lg hover:bg-white/10">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => onDeleteEntry(entry.id)} className="p-2 text-white/40 hover:text-rose-400 transition rounded-lg hover:bg-rose-500/10">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Past History Grid */}
            {pastEntries.length > 0 && (
                <div>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center gap-4 mb-8 mt-16"
                    >
                        <h2 className={`${playfair.className} text-xl font-bold text-white flex items-center gap-3 opacity-60`}>
                            <Calendar className="w-4 h-4" /> Log History
                        </h2>
                        <div className="h-px bg-white/10 flex-1 opacity-60" />
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {pastEntries.slice(0, 8).map(entry => (
                            <div key={entry.id} className="group border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition p-5 rounded-2xl relative">
                                <div className="flex justify-between items-start mb-3">
                                    <p className="text-[10px] uppercase tracking-widest text-white/30">
                                        {new Date(entry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}
                                    </p>
                                    <p className="text-[10px] uppercase font-mono text-white/30">{entry.data['Calories']} kcal</p>
                                </div>
                                <h4 className={`${playfair.className} text-lg text-white/80 line-clamp-1`}>{String(entry.data['Plate Build'] || entry.data['Meal'] || 'Unnamed')}</h4>
                                
                                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                                    <button onClick={() => onDeleteEntry(entry.id)} className="p-1.5 hover:text-rose-400 text-white/20 transition"><Trash2 className="w-3 h-3" /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
