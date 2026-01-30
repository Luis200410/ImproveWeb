'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { System } from '@/lib/data-store'
import { cn } from '@/lib/utils'
import { ArrowRight, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Playfair_Display } from '@/lib/font-shim'

const playfair = Playfair_Display({ subsets: ['latin'] })

export type SystemStatus = 'operational' | 'warning' | 'error'

interface HubNodeProps {
    system: System
    status?: SystemStatus
    microappCount: number
    className?: string
    delay?: number
}

const statusColors = {
    operational: 'text-emerald-500 bg-emerald-500/20 border-emerald-500/20',
    warning: 'text-amber-500 bg-amber-500/20 border-amber-500/20',
    error: 'text-rose-500 bg-rose-500/20 border-rose-500/20'
}

const statusGradients = {
    operational: 'from-emerald-500 to-teal-500',
    warning: 'from-amber-500 to-orange-500',
    error: 'from-rose-500 to-red-500'
}

export function HubNode({ system, status = 'operational', microappCount, className, delay = 0 }: HubNodeProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay }}
            className={cn("relative group w-64", className)}
        >
            <Link href={`/systems/${system.id}`} className="block relative z-10">
                {/* Main Card */}
                <div className="relative bg-[#2A2A2A] rounded-xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-300 group-hover:-translate-y-1">
                    {/* Top Status Indicator - Small dot */}
                    <div className="absolute top-3 right-3">
                        <div className={cn("w-2 h-2 rounded-full", {
                            'bg-emerald-500': status === 'operational',
                            'bg-amber-500': status === 'warning',
                            'bg-rose-500': status === 'error'
                        })} />
                    </div>

                    {/* Status Badge (if warning/error) */}
                    {status !== 'operational' && (
                        <div className="absolute top-3 right-7">
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", {
                                'text-amber-500 bg-amber-950/30': status === 'warning',
                                'text-rose-500 bg-rose-950/30': status === 'error'
                            })}>
                                {status === 'warning' ? 'WARN' : 'ERROR'}
                            </span>
                        </div>
                    )}

                    {/* Left Accent Bar */}
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b", statusGradients[status])} />

                    <div className="p-5">
                        {/* Icon */}
                        <div className="text-3xl mb-3">
                            {system.icon}
                        </div>

                        {/* Title */}
                        <h3 className={cn(playfair.className, "text-xl font-bold text-white mb-1")}>
                            {system.name}
                        </h3>

                        {/* Subtitle / Count */}
                        <div className="flex items-center justify-between mt-4">
                            <span className="text-xs text-white/40 font-medium">
                                {microappCount} Micro-Apps
                            </span>
                            <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
                        </div>

                        {/* Progress Line */}
                        <div className="mt-3 h-[2px] w-full bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1, delay: delay + 0.5 }}
                                className={cn("h-full bg-gradient-to-r", statusGradients[status])}
                            />
                        </div>
                    </div>
                </div>

                {/* Glow Effect behind */}
                <div className={cn("absolute -inset-4 bg-gradient-to-br opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl -z-10", statusGradients[status])} />
            </Link>
        </motion.div>
    )
}
