'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Entry } from '@/lib/data-store'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Edit2, Zap, Droplets, Clock, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

interface DietDetailsSidebarProps {
    entry: Entry | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: () => void
}

function gradeColor(grade: number) {
    if (grade >= 8) return '#22c55e'  // green-500
    if (grade >= 6) return '#eab308'  // yellow-500
    if (grade >= 4) return '#f97316'  // orange-500
    return '#ef4444'                  // red-500
}

function MacroBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
    const pct = Math.min(100, (value / max) * 100)
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs text-white/60 uppercase tracking-widest">
                <span>{label}</span>
                <span className="text-white font-semibold">{Math.round(value)}g</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                />
            </div>
        </div>
    )
}

export function DietDetailsSidebar({ entry, open, onOpenChange, onEdit }: DietDetailsSidebarProps) {
    if (!entry) return null

    const data = entry.data

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:w-[540px] bg-black border-l border-white/10 p-0 flex flex-col h-full !max-w-none">
                <SheetHeader className="p-6 border-b border-white/10 shrink-0 sticky top-0 bg-black/80 backdrop-blur z-10 flex flex-row items-center justify-between">
                    <div>
                        <div className="text-xs uppercase tracking-widest text-emerald-400 mb-1">
                            {data['Meal'] || 'Meal Log'}
                        </div>
                        <SheetTitle className={`${playfair.className} text-3xl text-white m-0`}>
                            {String(data['Plate Build'] || data['Meal'] || 'Untitled Meal')}
                        </SheetTitle>
                    </div>
                    {data['Fuel Grade'] && (
                        <div className={`px-3 py-1.5 rounded-full border font-bold text-sm bg-white/5 border-white/10`}
                            style={{ color: gradeColor(Number(data['Fuel Grade'])) }}>
                            ⚡ {data['Fuel Grade']}/10
                        </div>
                    )}
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                    {/* Header States */}
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10">
                        <div>
                            <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Total Calories</div>
                            <div className={`${inter.className} text-white font-bold text-4xl`}>
                                {data['Calories'] || 0} <span className="text-xl text-white/50 font-normal">kcal</span>
                            </div>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex flex-col items-center justify-center">
                            <Zap className="w-6 h-6 text-emerald-400 mb-0.5" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className={`${playfair.className} text-xl text-white flex items-center gap-2 border-b border-white/10 pb-2`}>
                            <FileText className="w-5 h-5 text-indigo-400" />
                            Macronutrients
                        </h3>
                        <div className="space-y-4 p-5 rounded-xl border border-white/10 bg-white/5">
                            <MacroBar label="Protein" value={Number(data['Protein (g)']) || 0} max={200} color="#22c55e" />
                            <MacroBar label="Carbs" value={Number(data['Carbs (g)']) || 0} max={300} color="#eab308" />
                            <MacroBar label="Fat" value={Number(data['Fats (g)']) || 0} max={100} color="#f97316" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className={`${playfair.className} text-xl text-white flex items-center gap-2 border-b border-white/10 pb-2 pt-4`}>
                            <Droplets className="w-5 h-5 text-sky-400" />
                            Additional Info
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-sky-400 mb-2">
                                    <Droplets className="w-4 h-4" /> Hydration
                                </div>
                                <div className={`${inter.className} text-white font-medium text-lg`}>
                                    {data['Hydration (glasses)'] || 0} glasses
                                </div>
                            </div>
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 mb-2">
                                    <Clock className="w-4 h-4" /> Prep Time
                                </div>
                                <div className={`${inter.className} text-white font-medium text-lg`}>
                                    {data['Prep Time (min)'] || 0} min
                                </div>
                            </div>
                        </div>

                        {(data['Mood After'] || data['Notes']) && (
                            <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-4">
                                {data['Mood After'] && (
                                    <div>
                                        <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Mood After</div>
                                        <div className="text-white text-sm">{data['Mood After']}</div>
                                    </div>
                                )}
                                {data['Notes'] && (
                                    <div className={data['Mood After'] ? 'border-t border-white/10 pt-4' : ''}>
                                        <div className="text-xs uppercase tracking-widest text-white/40 mb-1">Notes</div>
                                        <div className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{data['Notes']}</div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-white/10 bg-black shrink-0">
                    <button
                        onClick={onEdit}
                        className="w-full flex justify-center items-center gap-2 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-lg hover:bg-white/90 transition-colors"
                    >
                        <Edit2 className="w-4 h-4" /> Edit Entry
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
