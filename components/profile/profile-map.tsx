'use client'

import { motion } from 'framer-motion'
import { Globe, MapPin, Zap } from 'lucide-react'

export function ProfileMap() {
    return (
        <div className="relative w-full h-full min-h-[400px] flex items-center justify-center overflow-hidden bg-[#05090a] rounded-lg border border-white/5">

            {/* Grid Background */}
            <div className="absolute inset-0 z-0 opacity-20">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
            </div>

            {/* Central Globe/Map Visual - Abstract */}
            <div className="relative z-10 w-[80%] h-[80%] opacity-80">
                <WorldMapSvg />
            </div>

            {/* Floating Nodes */}
            <ActiveNode x="30%" y="40%" label="NODE_0x82A (ACTIVE)" delay={0} />
            <ActiveNode x="65%" y="60%" label="NODE_0x11C (STANDBY)" delay={1.5} color="text-white/50" dotColor="bg-white/50" />

            {/* Scan Line */}
            <motion.div
                animate={{ top: ['0%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-[2px] bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-20 pointer-events-none"
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05090a] via-transparent to-transparent z-10" />
        </div>
    )
}

function ActiveNode({ x, y, label, delay, color = "text-amber-500", dotColor = "bg-amber-500" }: { x: string, y: string, label: string, delay: number, color?: string, dotColor?: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.5 }}
            className="absolute z-30 flex items-center gap-2"
            style={{ left: x, top: y }}
        >
            <div className="relative">
                <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />
                <div className={`absolute -inset-1 rounded-full ${dotColor} opacity-30 animate-ping`} />
            </div>
            <div className={`text-[8px] font-mono ${color} bg-black/80 px-2 py-1 border border-white/10 rounded backdrop-blur-sm`}>
                {label}
            </div>
        </motion.div>
    )
}

function WorldMapSvg() {
    return (
        <svg viewBox="0 0 1000 500" className="w-full h-full stroke-white/10 fill-none stroke-[0.5]">
            {/* Abstract representation of world map dots/lines */}
            <path d="M150,100 Q400,50 650,100 T900,150" className="stroke-white/5" />
            <path d="M100,200 Q350,250 600,200 T850,250" className="stroke-white/5" />
            <path d="M200,300 Q450,350 700,300 T950,350" className="stroke-white/5" />

            {/* Connecting Arcs */}
            <motion.path
                d="M320,180 Q500,50 680,250"
                className="stroke-amber-500/30 fill-none"
                strokeDasharray="4 4"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />

            {/* Simplified land masses (dots) */}
            <g className="fill-white/10 stroke-none">
                {[...Array(50)].map((_, i) => (
                    <circle key={i} cx={Math.random() * 900 + 50} cy={Math.random() * 400 + 50} r={Math.random() * 2 + 1} />
                ))}
            </g>
        </svg>
    )
}
