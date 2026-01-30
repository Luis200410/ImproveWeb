'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { AlertTriangle, Cpu, AlertOctagon } from 'lucide-react'
import { ProjectEntry } from './project-utils'

interface GlobalConstraintsSheetProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    constraints: ProjectEntry[]
    onSelectProject: (id: string) => void
}

export function GlobalConstraintsSheet({ open, onOpenChange, constraints, onSelectProject }: GlobalConstraintsSheetProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col bg-[#080808] border-l border-white/10 z-[100]">

                <SheetTitle className="hidden">Global Constraints</SheetTitle>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex items-center gap-2 text-amber-500">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Constraint Stream</span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                    {constraints.length > 0 ? constraints.map(p => (
                        <div key={p.id}
                            className="p-4 bg-[#0A0A0A] border border-rose-500/20 rounded-lg relative overflow-hidden group hover:border-rose-500/40 transition-colors cursor-pointer"
                            onClick={() => {
                                onSelectProject(p.id)
                                onOpenChange(false) // Close this sheet so the details sheet can open
                            }}
                        >
                            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/50" />
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] font-bold text-rose-500 uppercase">Alert: {p.data.ragStatus === 'Red' ? 'Critical Health' : 'Blocker'}</span>
                                <span className="text-[9px] font-mono text-white/20">ID: {p.id.slice(0, 4)}</span>
                            </div>
                            <div className="text-sm text-white/80 font-medium mb-1">{p.data.title || 'Untitled'}</div>
                            <div className="text-xs text-white/40">
                                {p.data.blockedBy || "Critical resource depletion detected in RAG status."}
                            </div>
                        </div>
                    )) : (
                        <div className="p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-lg">
                            <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                <Cpu className="w-4 h-4" />
                                <span className="text-xs font-bold">SYSTEM OPTIMAL</span>
                            </div>
                            <p className="text-xs text-emerald-500/60">No active constraints detected in the neural lattice.</p>
                        </div>
                    )}
                </div>

            </SheetContent>
        </Sheet>
    )
}
