'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { System } from '@/lib/data-store'
import { HubNode, SystemStatus } from './hub-node'
import RadialOrbitalTimeline from '@/components/ui/radial-orbital-timeline'
import { Playfair_Display } from '@/lib/font-shim'
import { cn } from '@/lib/utils'
import { Power, LayoutGrid } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface CentralHubProps {
    systems: System[]
    systemStatuses: Record<string, SystemStatus>
}

export function CentralHub({ systems, systemStatuses }: CentralHubProps) {
    const [isSystemOnline, setIsSystemOnline] = useState(true)
    const coreSystems = systems

    // Calculate node orbital positions
    const getOrbitalNodes = (items: any[], radius: number) => {
        return items.map((item, idx) => {
            const total = items.length
            const angleStep = 360 / total
            const angle = -90 + (idx * angleStep)
            const rad = angle * (Math.PI / 180)
            const x = Math.cos(rad) * radius
            const y = Math.sin(rad) * radius

            return {
                ...item,
                angle,
                initialX: x,
                initialY: y
            }
        })
    }

    const systemNodes = useMemo(() => {
        return getOrbitalNodes(coreSystems.map(s => ({ id: s.id, system: s })), 460)
    }, [coreSystems])

    const timelineData = useMemo(() => {
        return coreSystems.map((sys, i) => {
            const stat = systemStatuses[sys.id] === 'operational' ? 'completed'
                : systemStatuses[sys.id] === 'warning' ? 'in-progress'
                    : 'pending';

            return {
                id: i + 1,
                title: sys.name,
                date: 'System Online',
                content: sys.description,
                category: sys.id,
                icon: () => <span className="text-lg leading-none">{sys.icon}</span>,
                rawIcon: sys.icon,
                relatedIds: i > 0 ? [i] : [],
                status: stat as any,
                energy: sys.microapps.length * 20
            };
        });
    }, [coreSystems, systemStatuses]);

    return (
        <div className="relative w-full min-h-[900px] flex items-center justify-center py-10 overflow-visible">

            {/* Background Radial Glow */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl" />
                <div className="absolute w-[600px] h-[600px] border border-white/5 rounded-full opacity-30" />
            </div>

            {/* Desktop Dashboard View using mixed component */}
            <div className="hidden lg:flex w-full h-full absolute inset-0 items-center justify-center">
                <RadialOrbitalTimeline timelineData={timelineData} />
            </div>

            {/* Mobile Stack */}
            <div className="lg:hidden absolute inset-0 overflow-y-auto px-6 py-20 pointer-events-auto flex flex-col gap-6 items-center">
                {/* Mobile Header Card */}
                <div className="w-full max-w-sm bg-[#f8f8f2] rounded-3xl p-8 border-4 border-[#fffffa]/10 mb-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-[#D4AF37]/20 rounded-xl flex items-center justify-center text-[#D4AF37]">
                            <LayoutGrid className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-bold mb-1">
                                Main Hub
                            </div>
                            <h1 className={cn(playfair.className, "text-xl font-bold text-black leading-tight")}>
                                Central Intelligence
                            </h1>
                        </div>
                    </div>
                    <div className="w-full flex items-center justify-between border-t border-black/10 pt-4">
                        <span className="text-[10px] text-black/40 font-medium">System Status</span>
                        <span className="text-[10px] text-emerald-600 font-bold tracking-wider">OPTIMAL</span>
                    </div>
                </div>

                {coreSystems.map((sys, idx) => (
                    <HubNode
                        key={sys.id}
                        system={sys}
                        status={systemStatuses[sys.id]}
                        microappCount={sys.microapps.length}
                        className="w-full max-w-sm"
                    />
                ))}
            </div>
        </div>
    )
}


