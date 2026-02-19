'use client'

import { motion } from 'framer-motion'
import { Cpu, Code, Database, Globe } from 'lucide-react'
import { Inter } from '@/lib/font-shim'

const inter = Inter({ subsets: ['latin'] })

export function ExpertModules() {
    const skills = [
        { icon: Cpu, label: 'System Logic', level: 92 },
        { icon: ShieldCheck, label: 'Cryptography', level: 88 },
        { icon: Network, label: 'Node Topology', level: 74 },
        { icon: Database, label: 'Data Flow V2', level: 98 },
    ]

    return (
        <div className="space-y-4">
            <h3 className="text-amber-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-6">
                Expertise Logic
            </h3>

            <div className="grid gap-3">
                {skills.map((skill, i) => (
                    <motion.div
                        key={skill.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="group relative bg-[#0A0A0A] border border-white/10 hover:border-amber-500/30 p-3 rounded-lg flex items-center gap-4 transition-all overflow-hidden"
                    >
                        {/* Progress Background */}
                        <div
                            className="absolute inset-0 bg-white/5 origin-left transition-transform duration-1000 ease-out z-0"
                            style={{ transform: `scaleX(${skill.level / 100})` }}
                        />

                        <div className="relative z-10 p-2 bg-black/40 rounded border border-white/10 text-amber-500 group-hover:text-amber-400 group-hover:border-amber-500/50 transition-colors">
                            <skill.icon className="w-4 h-4" />
                        </div>

                        <div className="relative z-10 flex-1 flex justify-between items-center">
                            <span className={`${inter.className} text-[10px] uppercase tracking-widest text-white/70 font-bold`}>
                                {skill.label}
                            </span>
                            <span className="text-[9px] font-mono text-white/30 group-hover:text-white/60 transition-colors">
                                {skill.level}%
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

import { ShieldCheck, Network } from 'lucide-react'
