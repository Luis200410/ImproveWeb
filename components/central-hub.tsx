'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { System } from '@/lib/data-store'
import { HubNode, SystemStatus } from './hub-node'
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

    return (
        <div className="relative w-full min-h-[900px] flex items-center justify-center py-10 overflow-visible">

            {/* Background Radial Glow */}
            <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                <div className="w-[800px] h-[800px] bg-white/[0.02] rounded-full blur-3xl" />
                <div className="absolute w-[600px] h-[600px] border border-white/5 rounded-full opacity-30" />
            </div>

            {/* Scalable Container for Radial Layout - Desktop Only */}
            <div className="hidden lg:flex relative w-[1000px] h-[1000px] scale-[0.55] md:scale-[0.7] lg:scale-[0.85] xl:scale-100 transition-transform duration-500 items-center justify-center">

                {/* Central Node - Power Button */}
                <motion.button
                    onClick={() => setIsSystemOnline(!isSystemOnline)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={cn(
                        "relative z-20 w-32 h-32 rounded-full flex flex-col items-center justify-center border-4 outline-none transition-all duration-500 shadow-2xl overflow-visible",
                        isSystemOnline
                            ? "bg-[#0a0a0a] border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.3)]"
                            : "bg-[#111] border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.2)]"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {isSystemOnline ? (
                            <motion.div
                                key="online"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center"
                            >
                                <Power className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                <span className="mt-2 text-[10px] uppercase font-bold tracking-widest text-emerald-500/80">Online</span>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="offline"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="flex flex-col items-center"
                            >
                                <Power className="w-10 h-10 text-red-500/50 drop-shadow-[0_0_10px_rgba(239,68,68,0.2)]" />
                                <span className="mt-2 text-[10px] uppercase font-bold tracking-widest text-red-500/50">Standby</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {isSystemOnline && (
                        <div className="absolute inset-[-20%] rounded-full border border-emerald-500/20 animate-[spin_10s_linear_infinite]" />
                    )}
                </motion.button>

                {/* Orbiting Systems Layer (Visible only when online) */}
                <AnimatePresence>
                    {isSystemOnline && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                            className="absolute inset-0 pointer-events-none z-10"
                        >
                            <motion.div
                                className="w-full h-full relative"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                            >
                                {/* Nodes */}
                                {systemNodes.map((node, idx) => (
                                    <motion.div
                                        key={node.id}
                                        className="absolute left-1/2 top-1/2 pointer-events-auto"
                                        style={{ x: node.initialX, y: node.initialY }}
                                    >
                                        <motion.div
                                            // Counter-rotate to keep upright
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                                            className="-translate-x-1/2 -translate-y-1/2"
                                        >
                                            <HubNode
                                                system={node.system}
                                                status={systemStatuses[node.id]}
                                                microappCount={node.system.microapps.length}
                                                delay={0.2 + (idx * 0.1)}
                                                className="w-60 hover:scale-105 transition-transform"
                                            />
                                        </motion.div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>


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


