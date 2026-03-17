'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bebas_Neue, Playfair_Display } from "@/lib/font-shim";
import { 
    Brain, 
    Inbox, 
    Layers, 
    Zap, 
    ListTodo, 
    BookOpenCheck, 
    NotebookPen,
    RefreshCcw,
    Folder,
    Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bebas = Bebas_Neue({ subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

export function PracticalLabAnimation() {
    const [isMounted, setIsMounted] = useState(false);
    
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const nodes = [
        {
            id: 'projects',
            label: 'Projects',
            icon: Rocket,
            color: 'text-white',
            angle: -90,
            metric: '1 Active',
            subMetric: '0% DONE'
        },
        {
            id: 'tasks',
            label: 'Tasks',
            icon: ListTodo,
            color: 'text-sky-400',
            angle: -30,
            metric: '82 Total',
            subMetric: '2% DONE'
        },
        {
            id: 'notes',
            label: 'Notes',
            icon: NotebookPen,
            color: 'text-purple-400',
            angle: 30,
            metric: '4',
            subMetric: 'Notes'
        },
        {
            id: 'resources',
            label: 'Resources',
            icon: BookOpenCheck,
            color: 'text-amber-400',
            angle: 90,
            metric: 'Library',
            subMetric: 'VIEW'
        },
        {
            id: 'areas',
            label: 'Areas',
            icon: Layers,
            color: 'text-emerald-400',
            angle: 150,
            metric: 'Zones',
            subMetric: 'MANAGE'
        },
        {
            id: 'inbox',
            label: 'Inbox',
            icon: Inbox,
            color: 'text-rose-400',
            angle: 210,
            metric: 'Capture',
            subMetric: 'PROCESS'
        },
    ];

    if (!isMounted) return <section className="min-h-screen bg-black" />;

    return (
        <section className="relative min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center py-12 px-6 -mb-px">
            
            {/* The Dashboard Interface Container (Shrunk horizontally to 1100px) */}
            <div className="w-full max-w-[1100px] flex flex-col">
                
                {/* Header Row: Branding + Stats */}
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-6 gap-6">
                    
                    {/* Branding Left */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-3xl shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                            <Folder className="w-5 h-5 md:w-7 md:h-7 text-amber-500 fill-amber-500/20" />
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-0.5">
                                <h1 className={`${playfair.className} text-2xl md:text-4xl font-bold tracking-tight text-white uppercase`}>
                                    Second Brain
                                </h1>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}>
                                    <RefreshCcw className="w-4 h-4 md:w-5 md:h-5 text-white/20" />
                                </motion.div>
                            </div>
                            <p className="text-white/40 text-[9px] md:text-[10px] uppercase tracking-[0.4em] font-light">
                                Strategic Cognitive Architecture
                            </p>
                        </div>
                    </div>

                    {/* Stats Right */}
                    <div className="grid grid-cols-3 gap-3 w-full xl:w-auto flex-1 xl:max-w-2xl">
                        {/* Productivity */}
                        <div className="p-4 rounded-xl bg-[#080808] border border-white/5 flex flex-col justify-between h-28 shadow-xl">
                            <div className="flex justify-between items-start">
                                <span className="text-[7px] uppercase tracking-[0.2em] text-white/30 font-bold">Productivity</span>
                                <span className="text-xl font-mono text-emerald-400">1.2</span>
                            </div>
                            <div className="flex justify-center gap-2 text-[7px] uppercase tracking-widest text-white/10 mt-3 border-t border-white/5 pt-2">
                                <span>Tasks</span>
                                <span>Projs</span>
                                <span>Unfocus</span>
                            </div>
                        </div>

                        {/* Task Stats */}
                        <div className="p-4 rounded-xl bg-[#080808] border border-white/5 relative overflow-hidden flex items-center gap-4 h-28 shadow-xl">
                            <div className="absolute top-1.5 right-1.5 bg-white/5 px-1.5 py-0.5 rounded text-[7px] font-mono text-white/40">
                                0
                            </div>
                            <div className="relative w-11 h-11 shrink-0">
                                <svg className="w-full h-full rotate-[-90deg]">
                                    <circle cx="22" cy="22" r="19" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-white/5" />
                                    <motion.circle cx="22" cy="22" r="19" stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-amber-500" strokeDasharray="119.3" animate={{ strokeDashoffset: 119.3 * 0.98 }} />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center font-bold text-[10px]">2%</div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[7px] uppercase tracking-[0.2em] text-white/40 mb-0.5">Duration</span>
                                <span className="text-sky-400 font-mono text-[9px] mb-0.5">0.0 HR</span>
                                <div className="pt-1 border-t border-white/5 flex items-center gap-2">
                                    <span className="text-xs font-bold">82</span>
                                    <span className="text-[7px] uppercase tracking-widest text-white/20">Tasks</span>
                                </div>
                            </div>
                        </div>

                        {/* Project Metrics */}
                        <div className="p-4 rounded-xl bg-[#080808] border border-white/5 flex flex-col justify-between h-28 shadow-xl">
                            <h3 className="text-[7px] uppercase tracking-[0.2em] text-white/30 font-bold">Metrics</h3>
                            <div className="space-y-1.5">
                                <div>
                                    <div className="flex justify-between text-[7px] text-white/40 mb-0.5">
                                        <span>Completion</span>
                                        <span className="font-mono">0%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-0" />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-[8px] text-white/40">
                                    <span>Active</span>
                                    <span className="text-white font-bold">1</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Core Map Area (Taller aspect to ensure visibility) */}
                <div className="relative w-full aspect-video bg-[#050505] rounded-[2rem] border border-white/5 overflow-hidden flex items-center justify-center group shadow-inner">
                    
                    {/* Background Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none opacity-30" />
                    
                    {/* Legend Top Left */}
                    <div className="absolute top-6 left-6 flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
                        <span className={`${bebas.className} text-white/20 text-[10px] md:text-xs tracking-[0.3em] uppercase`}>Core Map</span>
                    </div>

                    {/* Central Brain Hub */}
                    <div className="relative z-50">
                        <motion.div
                            animate={{ 
                                scale: [1, 1.05, 1],
                                boxShadow: [
                                    "0 0 30px rgba(245,158,11,0.1)",
                                    "0 0 60px rgba(245,158,11,0.2)",
                                    "0 0 30px rgba(245,158,11,0.1)"
                                ]
                            }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                            className="w-16 h-16 md:w-24 md:h-24 bg-[#0a0a0a] border-2 border-amber-500/20 rounded-full flex items-center justify-center backdrop-blur-3xl relative"
                        >
                            <Brain className="w-7 h-7 md:w-10 md:h-10 text-amber-500" />
                            <div className="absolute inset-[-8px] border border-amber-500/5 rounded-full animate-[spin_15s_linear_infinite]" />
                        </motion.div>
                    </div>

                    {/* Orbiting Satellite Nodes */}
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                    >
                        {nodes.map((node, i) => {
                            const radius = 180; // Significantly reduced radius to fit visibility
                            const x = Math.cos(node.angle * (Math.PI / 180)) * radius;
                            const y = Math.sin(node.angle * (Math.PI / 180)) * radius;

                            return (
                                <motion.div
                                    key={node.id}
                                    className="absolute left-1/2 top-1/2 w-32 h-32 -ml-16 -mt-16 flex flex-col items-center justify-center transform-gpu"
                                    style={{ x, y }}
                                >
                                    <motion.div
                                        animate={{ rotate: -360 }}
                                        transition={{ duration: 180, repeat: Infinity, ease: "linear" }}
                                        className="flex flex-col items-center justify-center gap-2"
                                    >
                                        <div className={cn(
                                            "w-10 h-10 md:w-13 md:h-13 rounded-lg md:rounded-xl flex items-center justify-center border border-white/5 bg-[#0d0d0d] shadow-lg backdrop-blur-xl",
                                        )}>
                                            <node.icon className={cn("w-4 h-4 md:w-5 md:h-5", node.color)} />
                                        </div>
                                        
                                        <div className="flex flex-col items-center text-center">
                                            <span className="text-[7px] md:text-[8px] text-white/20 font-bold tracking-[0.2em] uppercase">{node.label}</span>
                                            <span className={`${bebas.className} text-sm md:text-base text-white tracking-[0.1em] uppercase leading-tight`}>
                                                {node.metric}
                                            </span>
                                            <span className="text-[7px] text-white/10 font-medium tracking-[0.1em] uppercase">{node.subMetric}</span>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            );
                        })}
                    </motion.div>

                    {/* Ambient Gradients */}
                    <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                </div>

                {/* Decorative Terminal Line */}
                <div className="mt-4 flex items-center justify-between text-white/5 text-[7px] uppercase tracking-[0.4em] font-mono italic px-6">
                    <span>Identity: SB-MOD-9941</span>
                    <span>Systems Status: Operational</span>
                </div>
            </div>
        </section>
    );
}

