'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ChevronDown, Activity, LayoutGrid } from 'lucide-react'
import { AreaEntry } from './area-utils'
import { Playfair_Display } from '@/lib/font-shim'
import { Input } from '@/components/ui/input'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface AreaDetailsSidebarProps {
    area: AreaEntry | null
    onClose: () => void
    onUpdate: (area: AreaEntry, updates: Partial<AreaEntry['data']>) => void
}

export function AreaDetailsSidebar({ area, onClose, onUpdate }: AreaDetailsSidebarProps) {
    if (!area) return null

    return (
        <Sheet open={!!area} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-[#080808] border-l border-white/10 z-[100]">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.2em] mb-2 font-bold flex items-center gap-2">
                        <LayoutGrid className="w-3 h-3 text-purple-500" />
                        Area Context
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
                            {area.data.icon || '🪐'}
                        </div>
                        <SheetTitle className={`${playfair.className} text-2xl text-white leading-tight`}>{area.data.title}</SheetTitle>
                    </div>

                    <div className="flex gap-2 mb-2">
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${area.data.ragStatus === 'Red' ? 'border-rose-500 text-rose-500 bg-rose-500/10' :
                                area.data.ragStatus === 'Amber' ? 'border-amber-500 text-amber-500 bg-amber-500/10' :
                                    'border-emerald-500 text-emerald-500 bg-emerald-500/10'
                            }`}>
                            Health: {area.data.ragStatus || 'Green'}
                        </span>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                    <CollapsibleSection title="Core Definitions" defaultOpen>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">High Level Goal</label>
                                <Input
                                    className="bg-white/5 border-white/10 text-white"
                                    value={area.data.goal || ''}
                                    onChange={(e) => onUpdate(area, { goal: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-white/40 uppercase tracking-widest">Icon</label>
                                <Input
                                    className="bg-white/5 border-white/10 text-white w-20 text-center"
                                    value={area.data.icon || ''}
                                    onChange={(e) => onUpdate(area, { icon: e.target.value })}
                                    maxLength={2}
                                />
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* Placeholder for future analytics */}
                    <CollapsibleSection title="Domain Analytics" defaultOpen>
                        <div className="p-4 rounded border border-white/5 bg-white/[0.02]">
                            <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
                                <Activity className="w-4 h-4" />
                                <span>Activity Stream</span>
                            </div>
                            <p className="text-white/20 text-xs text-center py-4">
                                No activity recorded for this domain yet.
                            </p>
                        </div>
                    </CollapsibleSection>
                </div>

            </SheetContent>
        </Sheet>
    )
}

function CollapsibleSection({ title, count, children, defaultOpen = false }: { title: string, count?: number, children: React.ReactNode, defaultOpen?: boolean }) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="space-y-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-white/40 hover:text-white group transition-colors"
            >
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-bold">
                    <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
                    {title}
                </div>
                {count !== undefined && <span className="text-[10px] font-mono bg-white/5 px-1.5 rounded text-white/30 group-hover:text-white/50">{count}</span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
