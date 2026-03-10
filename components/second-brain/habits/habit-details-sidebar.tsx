'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Entry } from '@/lib/data-store'
import { Bebas_Neue } from '@/lib/font-shim'
import { Edit2, RefreshCw, Calendar, Target, Zap, Heart, CheckCircle2, Award } from 'lucide-react'
import { getLifeArea } from '@/lib/life-areas'

const bebas = Bebas_Neue({ subsets: ['latin'] })

interface HabitDetailsSidebarProps {
    entry: Entry | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: () => void
}

export function HabitDetailsSidebar({ entry, open, onOpenChange, onEdit }: HabitDetailsSidebarProps) {
    if (!entry) return null

    const data = entry.data

    const DetailItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string | number }) => (
        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="p-2 rounded-lg bg-white/10 text-white mt-0.5">
                <Icon className="w-4 h-4" />
            </div>
            <div>
                <div className="text-xs uppercase tracking-widest text-white/40 mb-1">{label}</div>
                <div className="text-white text-sm font-bebas">{value}</div>
            </div>
        </div>
    )

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] bg-black border-l border-white/10 p-0 flex flex-col h-full !max-w-none">
                <SheetHeader className="p-6 border-b border-white/10 shrink-0 sticky top-0 bg-black/80 backdrop-blur z-10 flex flex-row items-center justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 mb-1">
                            {(() => { const area = getLifeArea(data['Life Area'] || data['Category']); return area ? `${area.emoji} ${area.label}` : (data['Life Area'] || data['Category'] || 'General'); })()}
                        </div>
                        <SheetTitle className={`${bebas.className} text-3xl text-white m-0`}>
                            {String(data['Habit Name'] || 'Untitled')}
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Header States */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 flex flex-col items-center justify-center text-center">
                            <div className="text-4xl mb-2">🔥</div>
                            <div className="text-emerald-400 font-bold text-2xl font-bebas">{data['Streak'] || 0}</div>
                            <div className="text-xs uppercase tracking-widest text-emerald-400/60 mt-1">Current Streak</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
                            <div className="text-4xl mb-2">⏱️</div>
                            <div className="text-white font-bold text-2xl font-bebas">
                                {(parseInt(data['preHabitDuration'] || 0) + parseInt(data['duration'] || 30) + parseInt(data['rewardDuration'] || 0))}m
                            </div>
                            <div className="text-xs uppercase tracking-widest text-white/40 mt-1">Total Time</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className={`${bebas.className} text-xl text-white flex items-center gap-2 border-b border-white/10 pb-1`}>
                            <RefreshCw className="w-5 h-5 text-indigo-400" />
                            Scheduling
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem
                                icon={Calendar}
                                label="Frequency"
                                value={data['frequency'] === 'daily' ? 'Every Day' : (data['repeatDays']?.join(', ') || 'Not Set')}
                            />
                            <DetailItem
                                icon={RefreshCw}
                                label="Time"
                                value={data['Time'] || 'Variable (Check Timeline)'}
                            />
                        </div>

                        <h3 className={`${bebas.className} text-xl text-white flex items-center gap-2 border-b border-white/10 pb-1 pt-4`}>
                            <Zap className="w-5 h-5 text-amber-400" />
                            Habit Chain
                        </h3>
                        <div className="flex flex-col items-center">
                            <div className="text-[10px] uppercase tracking-widest text-cyan-400 mb-2">Pre-Habit Sequence</div>
                            <svg viewBox="0 0 24 40" className="w-6 h-10 overflow-visible mb-2">
                                <defs>
                                    <linearGradient id="chain-grad-top" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#ffffff" />
                                    </linearGradient>
                                </defs>
                                <g stroke="url(#chain-grad-top)" fill="none" strokeWidth="2.5">
                                    <rect x="9" y="0" width="6" height="14" rx="3" />
                                    <rect x="9" y="10" width="6" height="14" rx="3" />
                                    <rect x="9" y="20" width="6" height="14" rx="3" />
                                    <rect x="9" y="30" width="6" height="14" rx="3" />
                                </g>
                            </svg>

                            <div className="w-full flex flex-col gap-1 p-4 bg-white/5 rounded-xl border border-white/10 text-center relative z-10 shadow-lg shadow-black/50">
                                <div className="text-[10px] uppercase tracking-widest text-white/50">Core Habit</div>
                                <div className="text-white text-lg font-bold font-bebas">{data['duration'] || 30}m</div>
                            </div>

                            <svg viewBox="0 0 24 40" className="w-6 h-10 overflow-visible mt-2 mb-2">
                                <defs>
                                    <linearGradient id="chain-grad-bottom" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ffffff" />
                                        <stop offset="100%" stopColor="#f59e0b" />
                                    </linearGradient>
                                </defs>
                                <g stroke="url(#chain-grad-bottom)" fill="none" strokeWidth="2.5">
                                    <rect x="9" y="0" width="6" height="14" rx="3" />
                                    <rect x="9" y="10" width="6" height="14" rx="3" />
                                    <rect x="9" y="20" width="6" height="14" rx="3" />
                                    <rect x="9" y="30" width="6" height="14" rx="3" />
                                </g>
                            </svg>
                            <div className="text-[10px] uppercase tracking-widest text-amber-500 mt-2">Post-Habit Sequence</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className={`${bebas.className} text-xl text-white flex items-center gap-2 border-b border-white/10 pb-1`}>
                            <Target className="w-5 h-5 text-cyan-400" />
                            The Loop
                        </h3>
                        <div className="space-y-3">
                            {data['Cue'] && (
                                <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                                    <div className="text-xs uppercase tracking-widest text-cyan-400 mb-1">1. Cue (Make it Obvious)</div>
                                    <div className="text-white text-sm">{data['Cue']}</div>
                                </div>
                            )}
                            {data['Craving'] && (
                                <div className="p-4 rounded-xl border border-purple-500/20 bg-purple-500/5">
                                    <div className="text-xs uppercase tracking-widest text-purple-400 mb-1">2. Craving (Make it Attractive)</div>
                                    <div className="text-white text-sm">{data['Craving']}</div>
                                </div>
                            )}
                            {data['Response'] && (
                                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                                    <div className="text-xs uppercase tracking-widest text-emerald-400 mb-1">3. Response (Make it Easy)</div>
                                    <div className="text-white text-sm">{data['Response']}</div>
                                </div>
                            )}
                            {data['Reward'] && (
                                <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                                    <div className="text-xs uppercase tracking-widest text-amber-400 mb-1">4. Reward (Make it Satisfying)</div>
                                    <div className="text-white text-sm">{data['Reward']}</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black shrink-0">
                    <button
                        onClick={onEdit}
                        className="w-full flex justify-center items-center gap-2 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-white/90 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" /> Edit Habit
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
