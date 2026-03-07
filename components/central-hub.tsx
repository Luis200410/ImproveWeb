'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { System } from '@/lib/data-store'
import { SystemStatus } from './hub-node'
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
        return getOrbitalNodes(coreSystems.map(s => ({ id: s.id, system: s })), 320)
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
        <div className="relative w-full h-[600px] lg:min-h-[600px] flex items-center justify-center py-6 overflow-visible">

            {/* Background Radial Glow */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-3xl opacity-50 sm:opacity-100" />
                <div className="absolute w-[450px] h-[450px] border border-white/5 rounded-full opacity-10 sm:opacity-30" />
            </div>

            {/* Universal Dashboard View - Responsive via CSS transform scaling */}
            <div className="w-full h-[600px] absolute flex items-center justify-center scale-[0.6] sm:scale-[0.8] lg:scale-100 transform-gpu transition-transform duration-500 origin-center z-10 pointer-events-auto">
                <RadialOrbitalTimeline timelineData={timelineData} />
            </div>
        </div>
    )
}


