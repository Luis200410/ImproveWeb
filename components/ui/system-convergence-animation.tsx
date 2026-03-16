"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
    Notebook, 
    Calendar, 
    CheckCircle, 
    Table, 
    MessageSquare,
    Activity,
    DollarSign,
    Briefcase,
    Zap,
    Heart,
    Brain,
    Palette,
    Folder,
    ListChecks,
    Apple,
    Moon,
    Target,
    FileText,
    HardDrive,
    Layers,
    Search,
    Timer,
    Compass
} from 'lucide-react';
import { Bebas_Neue } from "@/lib/font-shim";
import Link from 'next/link';
import { InteractiveGlobe } from "@/components/ui/interactive-globe";

const bebas = Bebas_Neue({ subsets: ["latin"] });

const otherApps = [
    { icon: Notebook, label: "Notes", color: "#eab308" },
    { icon: Calendar, label: "Dates", color: "#3b82f6" },
    { icon: CheckCircle, label: "Habits", color: "#22c55e" },
    { icon: Table, label: "Data", color: "#10b981" },
    { icon: MessageSquare, label: "Chat", color: "#ec4899" },
    { icon: ListChecks, label: "Tasks", color: "#f59e0b" },
    { icon: Heart, label: "Pulse", color: "#ef4444" },
    { icon: Apple, label: "Diet", color: "#84cc16" },
    { icon: Moon, label: "Sleep", color: "#6366f1" },
    { icon: Target, label: "Aims", color: "#f43f5e" },
    { icon: FileText, label: "Docs", color: "#3b82f6" },
    { icon: HardDrive, label: "Files", color: "#a1a1aa" },
    { icon: Layers, label: "Apps", color: "#8b5cf6" },
    { icon: Search, label: "Info", color: "#06b6d4" },
    { icon: Timer, label: "Focus", color: "#f97316" },
    { icon: Compass, label: "Goals", color: "#14b8a6" },
];

const improveSystems = [
    { id: 'mind', title: 'MIND & EMOTIONS', icon: Brain, color: '#ffffff' },
    { id: 'legacy', title: 'LEGACY & FUN', icon: Palette, color: '#ffffff' },
    { id: 'second-brain', title: 'SECOND BRAIN', icon: Folder, color: '#ffffff' },
    { id: 'body', title: 'BODY', icon: Activity, color: '#ffffff' },
    { id: 'money', title: 'MONEY', icon: DollarSign, color: '#ffffff' },
    { id: 'work', title: 'WORK', icon: Briefcase, color: '#ffffff' },
    { id: 'productivity', title: 'PRODUCTIVITY', icon: Zap, color: '#ffffff' },
    { id: 'relationships', title: 'RELATIONSHIPS', icon: Heart, color: '#ffffff' },
];

export function SystemConvergenceAnimation() {
    const [stage, setStage] = useState<'converging' | 'dashboard'>('converging');
    const [hasHydrated, setHasHydrated] = useState(false);
    const containerRef = useRef(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.3 });

    const [screenSize, setScreenSize] = useState({ width: 1200, isMobile: false });

    useEffect(() => {
        const handleResize = () => {
            setScreenSize({
                width: window.innerWidth,
                isMobile: window.innerWidth < 768
            });
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        setHasHydrated(true);
    }, []);

    useEffect(() => {
        if (isInView && hasHydrated) {
            const timer = setTimeout(() => {
                setStage('dashboard');
            }, 5500);
            return () => clearTimeout(timer);
        }
    }, [isInView, hasHydrated]);

    // More aggressive responsive dimensions for mobile
    const globeSize = screenSize.isMobile 
        ? Math.min(screenSize.width - 80, 320) // Leave space for nodes
        : 580;
    
    // Ensure the orbit + node width fits within the screen
    const orbitalRadius = screenSize.isMobile 
        ? globeSize * 0.52 
        : 280;

    const convergeXOffset = screenSize.isMobile ? 800 : 2600;
    const convergeYOffset = screenSize.isMobile ? 600 : 1400;

    // Generate stable random positions after hydration to avoid mismatch
    const appPositions = useMemo(() => {
        return otherApps.map((_, i) => ({
            x: ((Math.sin(i * 12345) + 1) / 2 - 0.5) * convergeXOffset,
            y: ((Math.cos(i * 54321) + 1) / 2 - 0.5) * convergeYOffset,
        }));
    }, [convergeXOffset, convergeYOffset]);

    const globeMarkers = useMemo(() => {
        return improveSystems.map((sys, i) => ({
            lat: (i * 45) - 90,
            lng: (i * 45) - 180,
            label: sys.title,
            id: sys.id
        }));
    }, []);

    return (
        <div 
            ref={containerRef}
            className="relative w-full min-h-[600px] md:min-h-[800px] flex items-center justify-center overflow-visible"
        >
            {/* Unified Background Globe */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-all duration-1000">
                <motion.div 
                    animate={{ 
                        scale: stage === 'converging' ? 0.6 : 0.75,
                        opacity: 1,
                    }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                    className="relative"
                >
                    {/* Core Ambient Glow */}
                    <div className="absolute inset-0 bg-blue-500/10 blur-[150px] rounded-full animate-pulse" />
                    
                    {/* Transformation Flash Effect */}
                    <AnimatePresence>
                        {stage === 'dashboard' && (
                            <motion.div
                                initial={{ opacity: 1, scale: 0.5 }}
                                animate={{ opacity: 0, scale: 2.5 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="absolute inset-0 bg-blue-400 rounded-full blur-[60px] z-50 pointer-events-none"
                            />
                        )}
                    </AnimatePresence>

                    <InteractiveGlobe 
                        size={globeSize} 
                        markers={stage === 'dashboard' ? globeMarkers : []}
                        dotColor="#3b82f6"
                        autoRotateSpeed={stage === 'converging' ? 0.015 : 0.002}
                    />
                    
                    {/* Convergence Rings */}
                    <AnimatePresence>
                        {stage === 'converging' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center"
                            >
                                <div className="absolute w-[120%] h-[120%] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
                                <div className="absolute w-[150%] h-[150%] border border-white/[0.02] rounded-full animate-[spin_30s_linear_infinite_reverse]" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                {stage === 'converging' ? (
                    <motion.div 
                        key="converging"
                        exit={{ 
                            opacity: 1,
                            scale: 0.8,
                            filter: "brightness(2.5)",
                            transition: { duration: 0.5 }
                        }}
                        className="absolute inset-0 z-20"
                    >
                        {/* App Icon Streams */}
                        <div className="absolute inset-0 overflow-hidden">
                            {hasHydrated && otherApps.map((app, i) => (
                                <motion.div
                                    key={`converge-${i}`}
                                    initial={{ 
                                        x: appPositions[i].x, 
                                        y: appPositions[i].y,
                                        opacity: 0,
                                        scale: 0.8,
                                    }}
                                    animate={isInView ? { 
                                        x: 0, 
                                        y: 0,
                                        opacity: [0, 1, 1, 0.8],
                                        scale: [1, 0.7, 0.3, 0],
                                    } : {}}
                                    transition={{ 
                                        delay: i * 0.12, 
                                        duration: 3.2, 
                                        ease: [0.34, 1.56, 0.64, 1],
                                        repeat: 1,
                                    }}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3"
                                >
                                    <div className="p-3 md:p-4 bg-black/60 border border-white/10 rounded-full backdrop-blur-md shadow-xl" style={{ color: app.color }}>
                                        <app.icon size={screenSize.isMobile ? 18 : 22} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="dashboard"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 1.2 }}
                        className="absolute inset-0 flex flex-col items-center z-30 pointer-events-none"
                    >
                        {/* Orbital System Hub */}
                        <div className="relative w-full h-full flex items-center justify-center pointer-events-auto">
                            {/* Visual Orbital Ring */}
                            <div 
                                className="absolute border border-white/[0.05] rounded-full pointer-events-none" 
                                style={{ width: orbitalRadius * 2, height: orbitalRadius * 2 }}
                            />
                            
                            {/* System Nodes */}
                            {improveSystems.map((system, i) => {
                                // Position MIND at top left (~10 o'clock)
                                const angle = (i * 360) / 8 - 120;
                                const radius = orbitalRadius; 
                                const rad = (angle * Math.PI) / 180;
                                const x = radius * Math.cos(rad);
                                const y = radius * Math.sin(rad);

                                return (
                                    <Link 
                                        key={system.id} 
                                        href={`/sales#${system.id}`}
                                        className="absolute group/node"
                                        style={{ transform: `translate(${x}px, ${y}px)` }}
                                    >
                                        <motion.div
                                            initial={{ scale: 0, opacity: 0, rotate: -30 }}
                                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                            transition={{ delay: 0.6 + i * 0.08, type: "spring", stiffness: 100, damping: 15 }}
                                            className="relative flex flex-col items-center"
                                        >
                                            {/* Glow effect matches screenshot */}
                                            <div className="absolute inset-0 bg-white/[0.03] blur-3xl rounded-full scale-[2.5] group-hover/node:bg-white/[0.08] transition-all duration-700" />
                                            
                                            <div className="relative w-9 h-9 md:w-14 md:h-14 bg-black/90 border border-white/20 rounded-full flex items-center justify-center transition-all duration-500 group-hover/node:border-white/50 group-hover/node:scale-110 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
                                                <system.icon size={screenSize.isMobile ? 16 : 22} className="text-white opacity-90" />
                                            </div>
                                            
                                            <div className="mt-2 md:mt-4 text-center">
                                                <span className={`${bebas.className} text-white/40 text-[8px] md:text-[11px] tracking-[0.15em] md:tracking-[0.3em] font-medium group-hover/node:text-white transition-all duration-300`}>
                                                    {system.title}
                                                </span>
                                            </div>
                                        </motion.div>
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
