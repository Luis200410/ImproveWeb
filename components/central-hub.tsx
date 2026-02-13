'use client'

import { motion, useMotionValue, useTransform } from 'framer-motion'
import { System } from '@/lib/data-store'
import { HubNode, SystemStatus } from './hub-node'
import { Playfair_Display } from '@/lib/font-shim'
import { cn } from '@/lib/utils'
import { LayoutGrid } from 'lucide-react'
import { useEffect, useState, useMemo } from 'react'

const playfair = Playfair_Display({ subsets: ['latin'] })

interface CentralHubProps {
    systems: System[]
    systemStatuses: Record<string, SystemStatus>
}

export function CentralHub({ systems, systemStatuses }: CentralHubProps) {
    // User requested all systems, so we use the full list.
    const coreSystems = systems

    // Initialize motion values for each system
    // We use useMemo to ensure value stability across renders
    const nodes = useMemo(() => {
        return coreSystems.map((sys, idx) => {
            const total = coreSystems.length
            const angleStep = 360 / total
            const angle = -90 + (idx * angleStep)
            const radius = 460
            const rad = angle * (Math.PI / 180)
            const x = Math.cos(rad) * radius
            const y = Math.sin(rad) * radius

            return {
                id: sys.id,
                system: sys,
                x: new MotionValueWrapper(x), // Use our wrapper or direct 0 and animate to pos?
                // Actually framer works best if we initialize with x/y
                // But wait, drag uses transform. If we set 'style={{x,y}}' it's transform.
                initialX: x,
                initialY: y
            }
        })
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

                {/* Central Node */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-20 w-80 h-64 bg-[#f8f8f2] rounded-3xl shadow-[0_0_100px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center p-8 border-4 border-[#fffffa]/10"
                >
                    <div className="w-16 h-16 bg-[#D4AF37]/20 rounded-2xl flex items-center justify-center mb-4 text-[#D4AF37]">
                        <LayoutGrid className="w-8 h-8" />
                    </div>

                    <div className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-bold mb-1">
                        Main Hub
                    </div>
                    <h1 className={cn(playfair.className, "text-3xl font-bold text-black text-center leading-tight mb-6")}>
                        Central<br />Intelligence
                    </h1>

                    <div className="w-full flex items-center justify-between border-t border-black/10 pt-4">
                        <span className="text-[10px] text-black/40 font-medium">System Status</span>
                        <span className="text-[10px] text-emerald-600 font-bold tracking-wider">OPTIMAL</span>
                    </div>

                    <div className="absolute -inset-4 rounded-[2.5rem] border border-[#D4AF37]/30 opacity-50 pointer-events-none" />
                </motion.div>

                {/* Connector Lines Layer */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    <defs>
                        <linearGradient id="connector-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
                            <stop offset="50%" stopColor="rgba(255,255,255,0.15)" />
                            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                    </defs>
                    <g style={{ transform: 'translate(500px, 500px)' }}>
                        {nodes.map((node, idx) => (
                            <motion.line
                                key={idx}
                                x1={0}
                                y1={0}
                                x2={node.initialX}
                                y2={node.initialY}
                                stroke="url(#connector-grad)"
                                strokeWidth="1"
                                strokeDasharray="4 4"
                            />
                        ))}
                    </g>
                </svg>

                {/* Orbiting Nodes */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                    <div className="w-full h-full relative">
                        {nodes.map((node, idx) => (
                            <NodeCluster
                                key={node.id}
                                system={node.system}
                                status={systemStatuses[node.id]}
                                initialX={node.initialX}
                                initialY={node.initialY}
                                delay={0.2 + (idx * 0.1)}
                            />
                        ))}
                    </div>
                </div>

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

// Wrapper class to satisfy TS if needed, though we will just replace with hooks in sub-component
class MotionValueWrapper {
    value: number;
    constructor(v: number) { this.value = v }
}


function NodeCluster({ system, status, initialX, initialY, delay }: { system: System, status: any, initialX: number, initialY: number, delay: number }) {
    const x = useMotionValue(initialX)
    const y = useMotionValue(initialY)

    return (
        <>
            {/* The Line - rendered into a portal? No, absolute positioning works if z-index is managed. 
                Wait, SVG lines inside a div need to be an SVG element. 
                We can just render a DIV line that transforms. Or use SVG for the line.
                Actually, putting the SVG line HERE relative to the main container center (0,0) is tricky because 
                NodeCluster is mounted in the loop. 
                
                Workaround: Render the line as a 1px div that calculates rotation/width based on x,y.
                Line connects (0,0) to (x,y).
            */}
            <ConnectorLine x={x} y={y} />

            <motion.div
                style={{ x, y }}
                drag
                dragMomentum={false}
                dragElastic={0.1}
                whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
                className="absolute left-1/2 top-1/2 pointer-events-auto cursor-grab"
            >
                {/* Center the node visually on its point */}
                <div className="-translate-x-1/2 -translate-y-1/2">
                    <HubNode
                        system={system}
                        status={status}
                        microappCount={system.microapps.length}
                        delay={delay}
                        className="w-60"
                    />
                </div>
            </motion.div>
        </>
    )
}

function ConnectorLine({ x, y }: { x: any, y: any }) {
    // We need to transform x/y motion values into width/rotation.
    // Framer motion's useTransform is perfect for this.

    const distance = useTransform([x, y], ([latestX, latestY]: any) => {
        return Math.sqrt(latestX ** 2 + latestY ** 2)
    })

    const angle = useTransform([x, y], ([latestX, latestY]: any) => {
        return Math.atan2(latestY, latestX) * (180 / Math.PI)
    })

    return (
        <motion.div
            className="absolute left-1/2 top-1/2 h-px bg-white/20 origin-left -z-10 pointer-events-none"
            style={{
                width: distance,
                rotate: angle, // using 'rotate' shortcut in framer motion style
                // Line starts at 0,0 (center)
            }}
        >
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        </motion.div>
    )
}
