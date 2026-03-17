'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Bebas_Neue } from "@/lib/font-shim";
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const bebas = Bebas_Neue({ subsets: ["latin"] });

export function EvolutionCtaAnimation({ activeTime = 0 }: { activeTime?: number }) {
    const [phase, setPhase] = useState<'drift' | 'evolution' | 'none'>('none');
    
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
    
    // Trigger phases based on time or scroll
    useEffect(() => {
        if (activeTime >= 72) {
            setPhase('evolution');
        } else if (activeTime >= 70 || isInView) {
            setPhase('drift');
        }
    }, [activeTime, isInView]);

    const driftText = "will I continue to drift??";

    return (
        <section 
            ref={containerRef}
            className="relative min-h-screen bg-black flex flex-col items-center justify-center overflow-hidden py-0 -mb-px"
        >
            <AnimatePresence mode="wait">
                {phase === 'drift' && (
                    <motion.div
                        key="drift-phase"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ 
                            y: 200, 
                            opacity: 0, 
                            rotate: 5,
                            transition: { duration: 1.2, ease: "easeIn" } 
                        }}
                        className="relative flex flex-col items-center"
                    >
                        <motion.h2 
                            initial={{ color: "#ffffff" }}
                            animate={{ color: "#ef4444" }}
                            transition={{ delay: 0.8, duration: 0.4 }} // Snap to red slightly before 1:12
                            className={`${bebas.className} text-4xl md:text-8xl font-bold uppercase tracking-[0.05em] md:tracking-[0.1em] text-center px-6`}
                        >
                            {driftText}
                        </motion.h2>
                        
                        {/* Red Strikethrough Line */}
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: "105%" }}
                            transition={{ delay: 0.8, duration: 0.6, ease: "easeInOut" }}
                            className="absolute top-1/2 left-[-2.5%] h-2 md:h-4 bg-red-600 z-10"
                        />
                    </motion.div>
                )}

                {phase === 'evolution' && (
                    <motion.div
                        key="evolution-phase"
                        className="flex flex-col items-center w-full"
                    >
                        {/* Letter by letter evolution text - Split into two parts for mobile wrapping */}
                        <div className="flex flex-col md:flex-row items-center justify-center px-6 mb-0">
                            {/* Part 1: will I initiate my */}
                            <div className="flex flex-wrap justify-center">
                                {"will I initiate my".split("").map((char, i) => (char === " " ? (
                                    <span key={i} className="w-2 md:w-8" />
                                ) : (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{ 
                                            delay: i * 0.04, 
                                            duration: 0.5,
                                            ease: "easeOut"
                                        }}
                                        className={`${bebas.className} text-4xl md:text-8xl font-black text-green-500 uppercase tracking-[0.05em] md:tracking-[0.1em]`}
                                    >
                                        {char}
                                    </motion.span>
                                )))}
                            </div>
                            
                            {/* Desktop Spacer */}
                            <span className="hidden md:inline-block w-8" />

                            {/* Part 2: evolution? */}
                            <div className="flex flex-wrap justify-center">
                                {"evolution?".split("").map((char, i) => (char === " " ? (
                                    <span key={i} className="w-2 md:w-8" />
                                ) : (
                                    <motion.span
                                        key={i + 17} // Offset for delay consistency
                                        initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        transition={{ 
                                            delay: (i + 17) * 0.04, 
                                            duration: 0.5,
                                            ease: "easeOut"
                                        }}
                                        className={`${bebas.className} text-4xl md:text-8xl font-black text-green-500 uppercase tracking-[0.05em] md:tracking-[0.1em]`}
                                    >
                                        {char}
                                    </motion.span>
                                )))}
                            </div>
                        </div>

                        {/* Logo appearing below (at 75s / 1:15) */}
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ 
                                delay: 3, // 75s - 72s = 3s delay
                                duration: 1.5, 
                                ease: "easeOut" 
                            }}
                            className="flex flex-col items-center gap-0"
                        >
                            <div className="relative w-64 h-64 md:w-[450px] md:h-[450px]">
                                <Image
                                    src="/logo_final.png"
                                    alt="IMPROVE Logo"
                                    fill
                                    className="object-contain filter drop-shadow(0 0 60px rgba(255,255,255,0.2))"
                                />
                            </div>

                            <Link href="/sales">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ 
                                        delay: 7, // 79s - 72s = 7s delay from phase start
                                        duration: 0.8 
                                    }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="group relative flex flex-col items-center gap-0"
                                >
                                    <div className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-[0.3em] text-sm md:text-base flex items-center gap-3 transition-all duration-300 hover:bg-green-500 hover:text-white border border-transparent">
                                        Learn more about the systems
                                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                                    </div>
                                    <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </motion.div>
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Ambient Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-green-500/5 via-transparent to-transparent pointer-events-none" />
        </section>
    );
}
