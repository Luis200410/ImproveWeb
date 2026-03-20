'use client'

import React from 'react'
import { Check, ChevronDown, LayoutGrid } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Entry } from '@/lib/data-store'
import { motion, AnimatePresence } from 'framer-motion'
import { Playfair_Display } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface AreaFilterDropdownProps {
    areas: Entry[]
    selectedAreaId: string | null
    onSelectArea: (id: string | null) => void
}

export function AreaFilterDropdown({ areas, selectedAreaId, onSelectArea }: AreaFilterDropdownProps) {
    const selectedArea = areas.find(a => a.id === selectedAreaId)
    const selectedTitle = selectedAreaId === 'unassigned' ? 'UNASSIGNED' : (selectedArea?.data.title || 'ALL AREAS')

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 bg-[#050505] border border-white/10 hover:border-white/20 px-6 py-2.5 rounded-lg transition-all focus:outline-none group">
                    <LayoutGrid className="w-3 h-3 text-white/40 group-hover:text-emerald-500 transition-colors" />
                    <span className={`${playfair.className} text-[10px] uppercase font-bold tracking-[0.2em] text-white/70 group-hover:text-white`}>
                        {selectedTitle}
                    </span>
                    <ChevronDown className="w-3 h-3 text-white/20 group-hover:text-white/40 transition-colors" />
                </button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent 
                className="w-[280px] bg-[#0A0A0A]/95 backdrop-blur-xl border-white/10 p-2 rounded-xl" 
                align="start"
                sideOffset={8}
            >
                <DropdownMenuLabel className="px-3 py-2 text-[9px] font-mono uppercase tracking-[0.3em] text-white/30">
                    Filter View
                </DropdownMenuLabel>
                
                <DropdownMenuSeparator className="bg-white/5 mx-1" />
                
                <div className="space-y-1 mt-1">
                    {/* All Areas Option */}
                    <DropdownMenuItem
                        onClick={() => onSelectArea(areas[0]?.id || null)}
                        className={`
                            relative flex items-center px-4 py-3 rounded-lg text-[11px] font-bold tracking-widest uppercase cursor-pointer transition-all
                            ${!selectedAreaId || selectedAreaId === areas[0]?.id
                                ? 'bg-white/5 text-white'
                                : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                            }
                        `}
                    >
                        {(!selectedAreaId || selectedAreaId === areas[0]?.id) && (
                            <div className="absolute left-1.5 w-1 h-1 rounded-full bg-emerald-500" />
                        )}
                        <span className={`${playfair.className} pl-1`}>
                            {areas[0]?.data.title || 'PRIMARY DOMAIN'}
                        </span>
                    </DropdownMenuItem>

                    {areas.slice(1).map(area => (
                        <DropdownMenuItem
                            key={area.id}
                            onClick={() => onSelectArea(area.id)}
                            className={`
                                relative flex items-center px-4 py-3 rounded-lg text-[11px] font-bold tracking-widest uppercase cursor-pointer transition-all
                                ${selectedAreaId === area.id
                                    ? 'bg-white/5 text-white'
                                    : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                                }
                            `}
                        >
                            {selectedAreaId === area.id && (
                                <div className="absolute left-1.5 w-1 h-1 rounded-full bg-emerald-500" />
                            )}
                            <span className={`${playfair.className} pl-1`}>
                                {area.data.title || 'UNTITLED AREA'}
                            </span>
                        </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator className="bg-white/5 mx-1" />

                    <DropdownMenuItem
                        onClick={() => onSelectArea('unassigned')}
                        className={`
                            relative flex items-center px-4 py-3 rounded-lg text-[11px] font-bold tracking-widest uppercase cursor-pointer transition-all
                            ${selectedAreaId === 'unassigned'
                                ? 'bg-white/5 text-white'
                                : 'text-white/40 hover:bg-white/[0.03] hover:text-white'
                            }
                        `}
                    >
                        {selectedAreaId === 'unassigned' && (
                            <div className="absolute left-1.5 w-1 h-1 rounded-full bg-emerald-500" />
                        )}
                        <span className={`${playfair.className} pl-1`}>UNASSIGNED</span>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
