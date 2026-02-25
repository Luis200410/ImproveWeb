'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Entry } from '@/lib/data-store'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Edit2, RefreshCw, Calendar, Target, Zap, Heart, CheckCircle2, Award } from 'lucide-react'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

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
                <div className={`${inter.className} text-white text-sm`}>{value}</div>
            </div>
        </div>
    )

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] bg-black border-l border-white/10 p-0 flex flex-col h-full !max-w-none">
                <SheetHeader className="p-6 border-b border-white/10 shrink-0 sticky top-0 bg-black/80 backdrop-blur z-10 flex flex-row items-center justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 mb-1">
                            {data['Category'] || 'General'}
                        </div>
                        <SheetTitle className={`${playfair.className} text-3xl text-white m-0`}>
                            {String(data['Habit Name'] || 'Untitled')}
                        </SheetTitle>
                    </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Header States */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 border border-emerald-500/30 flex flex-col items-center justify-center text-center">
                            <div className="text-4xl mb-2">🔥</div>
                            <div className={`${inter.className} text-emerald-400 font-bold text-2xl`}>{data['Streak'] || 0}</div>
                            <div className="text-xs uppercase tracking-widest text-emerald-400/60 mt-1">Current Streak</div>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center">
                            <div className="text-4xl mb-2">⏱️</div>
                            <div className={`${inter.className} text-white font-bold text-2xl`}>{data['duration'] || 30}m</div>
                            <div className="text-xs uppercase tracking-widest text-white/40 mt-1">Session Target</div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className={`${playfair.className} text-xl text-white flex items-center gap-2 border-b border-white/10 pb-2`}>
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
                    </div>

                    <div className="space-y-4">
                        <h3 className={`${playfair.className} text-xl text-white flex items-center gap-2 border-b border-white/10 pb-2`}>
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
