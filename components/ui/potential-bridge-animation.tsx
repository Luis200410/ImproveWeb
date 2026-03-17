"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { Bebas_Neue } from "@/lib/font-shim";
import { LucideIcon } from 'lucide-react';

const bebas = Bebas_Neue({ subsets: ["latin"] });

export function PotentialBridgeAnimation() {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, amount: 0.3 });

    return (
        <section ref={containerRef} className="relative w-full py-24 overflow-visible bg-transparent">
            <div className="max-w-4xl mx-auto px-6">
                
                {/* Section Title */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-24"
                >
                    <h2 className={`${bebas.className} text-5xl md:text-7xl font-bold text-white uppercase tracking-tight`}>
                        Bridge The Gap
                    </h2>
                    <div className="w-12 h-1 bg-blue-500 mx-auto mt-4" />
                </motion.div>

                <div className="relative flex items-center justify-between h-[250px] md:h-[300px]">
                    
                    {/* The Visual "Gap" / Chasm Effect */}
                    <div className="absolute inset-0 flex justify-center items-center opacity-20 pointer-events-none">
                        <div className="w-px h-full bg-gradient-to-b from-transparent via-white/40 to-transparent blur-sm" />
                    </div>

                    {/* The Bridge Engine */}
                    <div className="absolute top-1/2 left-0 w-full -translate-y-1/2 px-12 md:px-20 overflow-visible">
                        <div className="relative w-full h-[4px]">
                            {/* The Infrastructure (Structural Lines) */}
                            <svg className="absolute inset-0 w-full h-32 -translate-y-1/2 overflow-visible" preserveAspectRatio="none">
                                <motion.path
                                    d="M 0 64 Q 50 10, 100 64 T 200 64 T 300 64 T 400 64"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="0.5"
                                    strokeOpacity="0.1"
                                    initial={{ pathLength: 0 }}
                                    animate={isInView ? { pathLength: 1 } : {}}
                                    transition={{ duration: 2, ease: "easeInOut" }}
                                />
                                {/* Bottom Support Cable */}
                                <motion.path
                                    d="M 0 64 Q 200 120, 400 64"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeOpacity="0.2"
                                    initial={{ pathLength: 0 }}
                                    animate={isInView ? { pathLength: 1 } : {}}
                                    transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
                                />
                            </svg>

                            {/* Main Laser Bridge Beam */}
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={isInView ? { width: "100%" } : {}}
                                transition={{ duration: 1.5, ease: "circIn" }}
                                className="absolute top-0 h-full bg-gradient-to-r from-white/10 via-blue-500 to-white/10 shadow-[0_0_20px_rgba(59,130,246,0.5)] z-10"
                            />
                            
                            {/* Moving Energy Particles */}
                            {[...Array(3)].map((_, i) => (
                                <motion.div 
                                    key={i}
                                    animate={isInView ? { 
                                        left: ["-10%", "110%"],
                                        opacity: [0, 1, 0]
                                    } : {}}
                                    transition={{ 
                                        duration: 2, 
                                        repeat: Infinity, 
                                        ease: "linear",
                                        delay: i * 0.7
                                    }}
                                    className="absolute top-1/2 -translate-y-1/2 w-24 h-[1px] bg-white blur-sm z-20"
                                />
                            ))}

                            {/* The Label */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-12 z-30">
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                                    transition={{ delay: 1 }}
                                    className="bg-black/80 backdrop-blur-md px-4 py-1 border border-blue-500/30 rounded-full flex items-center gap-2"
                                >
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                    <span className={`${bebas.className} text-[10px] md:text-xs text-blue-400 tracking-[0.4em] uppercase whitespace-nowrap`}>
                                        Systematic Connection Active
                                    </span>
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Point A: Who You Are */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="w-20 h-20 md:w-24 md:h-24 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-md bg-black/50 relative">
                            <span className={`${bebas.className} text-white/20 text-3xl`}>A</span>
                            <div className="absolute -inset-2 border border-white/5 rounded-full" />
                        </div>
                        <div className="absolute -bottom-16 flex flex-col items-center w-max">
                            <span className={`${bebas.className} text-white/30 text-[10px] tracking-[0.3em] uppercase mb-1`}>Initial State</span>
                            <span className={`${bebas.className} text-xl md:text-2xl text-white uppercase`}>Who you are</span>
                        </div>
                    </motion.div>

                    {/* Point B: What You Can Become */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="relative z-10 flex flex-col items-center"
                    >
                        <div className="w-20 h-20 md:w-24 md:h-24 border-2 border-blue-500 rounded-full flex items-center justify-center backdrop-blur-md bg-blue-500/10 shadow-[0_0_50px_rgba(59,130,246,0.3)] relative">
                            <span className={`${bebas.className} text-white text-3xl animate-pulse`}>B</span>
                            
                            {/* Orbital Spinner for Point B */}
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-3 border border-blue-500/20 border-dashed rounded-full"
                            />
                        </div>
                        <div className="absolute -bottom-16 flex flex-col items-center w-max">
                            <span className={`${bebas.className} text-blue-400 text-[10px] tracking-[0.3em] uppercase mb-1`}>Ultimate Potential</span>
                            <span className={`${bebas.className} text-xl md:text-2xl text-white uppercase`}>What you are becoming</span>
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
