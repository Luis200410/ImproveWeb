'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Bebas_Neue } from "@/lib/font-shim";
import { Target, PenLine, Database, Sparkles, Box, Activity, Layers, Zap } from 'lucide-react';

const bebas = Bebas_Neue({ subsets: ["latin"] });

interface PassiveDataAnimationProps {
    activeTime?: number;
}

export function PassiveDataAnimation({ activeTime = 0 }: PassiveDataAnimationProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.3 });
    const [isMounted, setIsMounted] = useState(false);
    const [screenSize, setScreenSize] = useState({ isMobile: false, width: 1200 });

    useEffect(() => {
        setIsMounted(true);
        const handleResize = () => {
            setScreenSize({
                isMobile: window.innerWidth < 768,
                width: window.innerWidth
            });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Timing Constants
    const STAGE_0_START = 52;
    const STAGE_1_START = 55;
    const STAGE_2_START = 56.5;

    const stage = useMemo(() => {
        if (activeTime >= STAGE_2_START) return 2;
        if (activeTime >= STAGE_1_START) return 1;
        if (activeTime >= STAGE_0_START) return 0;
        if (isInView) return 0; // Fallback for manual scroll or early visibility
        return -1;
    }, [activeTime, isInView]);

    const stages = [
        { title: "Data Becomes Active", color: "rgba(59, 130, 246, 0.4)" },
        { title: "Goal Setting", color: "rgba(239, 68, 68, 0.4)" },
        { title: "Insight Capture", color: "rgba(245, 158, 11, 0.4)" }
    ];

    const isVisible = stage !== -1;

    return (
        <section 
            ref={containerRef} 
            className="relative min-h-[70vh] md:min-h-screen py-12 md:py-24 overflow-hidden bg-black flex flex-col items-center justify-center -mb-px"
        >
            {/* Cinematic Particle Background */}
            <div className="absolute inset-0 pointer-events-none">
                {isMounted && [...Array(30)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: `${Math.random() * 100}%`, y: `${Math.random() * 100}%` }}
                        animate={{ 
                            opacity: [0, 0.2, 0],
                            scale: [0.5, 1.5, 0.5],
                            y: [0, -100] 
                        }}
                        transition={{ duration: 10 + Math.random() * 10, repeat: Infinity }}
                        className="absolute w-1 h-1 bg-white rounded-full blur-[2px]"
                    />
                ))}
            </div>

            {/* Stage-specific Glow */}
            <motion.div 
                animate={{ 
                    background: isVisible ? `radial-gradient(circle at 50% 50%, ${stages[stage].color} 0%, transparent 70%)` : 'none',
                    opacity: isVisible ? 0.3 : 0
                }}
                className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
            />

            <AnimatePresence>
                {isVisible && (
                    <div className="relative z-10 w-full max-w-6xl px-6 flex flex-col items-center gap-8 md:gap-12" style={{ perspective: 3000 }}>
                        
                        {/* 3D Visual Hub */}
                        <div className="w-full h-[250px] md:h-[400px] relative flex items-center justify-center transform-gpu">
                            <AnimatePresence mode="wait">
                                {stage === 0 && (
                                    <motion.div
                                        key="gathering-master"
                                        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                        className="relative w-full h-full flex items-center justify-center transform-gpu"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <div className="relative z-50 flex items-center justify-center" style={{ transformStyle: 'preserve-3d' }}>
                                            <div className="p-5 md:p-8 bg-blue-500/10 rounded-2xl md:rounded-3xl border border-blue-400/40 shadow-[0_0_60px_rgba(59,130,246,0.2)] backdrop-blur-3xl">
                                                <Database className="w-16 h-16 md:w-32 md:h-32 text-blue-400 filter drop-shadow(0 0 30px #3b82f6)" />
                                            </div>
                                        </div>

                                        {/* Minimal Data Particles */}
                                        {isMounted && [...Array(20)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ z: 1000, opacity: 0, x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600 }}
                                                animate={{ z: 0, opacity: [0, 1, 0] }}
                                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                                                className="absolute w-0.5 h-6 bg-blue-400/30 rounded-full"
                                            />
                                        ))}
                                    </motion.div>
                                )}

                                {stage === 1 && (
                                    <motion.div
                                        key="goal-master"
                                        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                        className="relative w-full h-full flex items-center justify-center transform-gpu"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <div className="relative flex items-center justify-center transform-gpu" style={{ transformStyle: 'preserve-3d' }}>
                                            <div className="p-5 md:p-8 bg-red-500/10 rounded-2xl md:rounded-3xl border border-red-400/40 shadow-[0_0_60px_rgba(239,68,68,0.2)] backdrop-blur-3xl">
                                                <Target className="w-16 h-16 md:w-32 md:h-32 text-red-500 filter drop-shadow(0 0 30px rgba(239, 68, 68, 0.8))" />
                                            </div>
                                            
                                            {/* Kinetic Arrow */}
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
                                                <motion.div
                                                    initial={{ x: -800, opacity: 0 }}
                                                    animate={{ x: 0, opacity: [0, 1, 1, 0] }}
                                                    transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 1.5 }}
                                                    className="relative flex items-center"
                                                >
                                                    <div className="w-[300px] h-[2px] bg-gradient-to-r from-transparent via-red-500 to-white" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {stage === 2 && (
                                    <motion.div
                                        key="insight-master"
                                        initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                                        exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                                        transition={{ duration: 0.6, ease: "easeInOut" }}
                                        className="relative w-full h-full flex flex-col items-center justify-center transform-gpu"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        <div className="relative w-[300px] md:w-[450px] h-[180px] md:h-[280px] bg-white/[0.03] rounded-2xl md:rounded-3xl border border-white/10 backdrop-blur-3xl p-6 md:p-8 overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
                                            {/* Grid */}
                                            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] bg-[size:20px_20px]" />
                                            
                                            <div className="space-y-3 relative z-10">
                                                {[...Array(4)].map((_, i) => (
                                                    <motion.div 
                                                        key={i}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "70%" }}
                                                        transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, repeatDelay: 1 }}
                                                        className="h-0.5 bg-amber-500/20 rounded-full"
                                                    />
                                                ))}
                                            </div>

                                            <motion.div
                                                animate={{ 
                                                    x: [0, 150, 0, 100, 0],
                                                    y: [0, 20, 40, 60, 0],
                                                    rotateZ: [20, 35, 20]
                                                }}
                                                transition={{ duration: 3, repeat: Infinity }}
                                                className="absolute top-4 left-4"
                                            >
                                                <PenLine className="w-12 h-12 md:w-20 md:h-20 text-amber-500 filter drop-shadow(0 0 15px #f59e0b)" />
                                            </motion.div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Centered Title Overlay */}
                        <div className="h-[120px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={stage}
                                    initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
                                    transition={{ duration: 0.5 }}
                                    className="flex flex-col items-center"
                                >
                                    <h2 className={`${bebas.className} text-4xl md:text-7xl font-bold text-white uppercase tracking-[0.1em] text-center whitespace-nowrap`}>
                                         {stages[stage].title}
                                     </h2>
                                    <motion.div 
                                        initial={{ width: 0, opacity: 0 }}
                                        animate={{ width: screenSize.isMobile ? 120 : 300, opacity: 1 }}
                                        transition={{ delay: 0.3, duration: 1 }}
                                        className="h-1 bg-gradient-to-r from-transparent via-white/40 to-transparent mt-4 md:mt-8"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </section>
    );
}
