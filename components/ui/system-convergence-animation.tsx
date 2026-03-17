"use client";

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
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

export function SystemConvergenceAnimation({ onComplete }: { onComplete?: () => void }) {
    const [stage, setStage] = useState<'converging' | 'dashboard'>('converging');
    const [currentTime, setCurrentTime] = useState(0);
    const [hasHydrated, setHasHydrated] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.3 });

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end start"]
    });

    const textOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

    const [hasStarted, setHasStarted] = useState(false);
    const [screenSize, setScreenSize] = useState({ width: 1200, isMobile: false });
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleStart = async () => {
        setHasStarted(true);
        if (audioRef.current) {
            // CRITICAL FOR CHROME: Initiating play() directly in the click event
            // to satisfy User Activation policies, but keeping it silent for the sync delay.
            audioRef.current.volume = 0;
            audioRef.current.muted = false;
            
            try {
                await audioRef.current.play();
                
                // After the 1150ms sync delay, reset to start and make it audible
                setTimeout(() => {
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.volume = 1.0;
                    }
                }, 1150);
            } catch (error) {
                console.error("Chrome blocked audio initialization:", error);
            }
        }
    };

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

    // Master Timer for Auto-Scroll (survives stage changes)
    useEffect(() => {
        if (hasStarted) {
            const scrollTimer = setTimeout(() => {
                onComplete?.();
            }, 30000);
            return () => clearTimeout(scrollTimer);
        }
    }, [hasStarted, onComplete]);

    // Stage & Subtitle Management
    useEffect(() => {
        if (hasStarted && stage === 'converging') {
            // Reveal the dashboard view (icons) at 26.5s
            const revealTimer = setTimeout(() => {
                setStage('dashboard');
            }, 26500);

            const interval = setInterval(() => {
                setCurrentTime(prev => prev + 0.1);
            }, 100);

            return () => {
                clearTimeout(revealTimer);
                clearInterval(interval);
            };
        }
    }, [hasStarted, stage]);

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

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

    // Reverted to the "Great" subtitle timing as requested
    const script = useMemo(() => [
        { time: 0, text: "High achievers", strategy: 'typewriter', color: '#ffffff' },
        { time: 1.5, text: "don't work harder;", strategy: 'blurSlam', color: '#3b82f6' },
        { time: 3.5, text: "THEY OPERATE BETTER.", strategy: 'impactSlam', color: '#ffffff' },
        { time: 5.5, text: "You aren't", strategy: 'typewriter', color: '#ffffff' },
        { time: 6.8, text: "DISORGANIZED.", strategy: 'scramble', color: '#ef4444' },
        { time: 8.5, text: "operating without a system.", strategy: 'blurSlam', color: '#ffffff' },
        { time: 10.2, text: "the digital noise", strategy: 'noise', color: '#3b82f6' },
        { time: 11.5, text: "scattered notes", strategy: 'splitReveal', color: '#ffffff' },
        { time: 12.8, text: "leaking potential...", strategy: 'fadeUp', color: '#ef4444' },
        { time: 14.2, text: "trying to build", strategy: 'typewriter', color: '#ffffff' },
        { time: 15.8, text: "disconnected tools.", strategy: 'blurSlam', color: '#ef4444' },
        { time: 17.5, text: "Tools don't build", strategy: 'splitReveal', color: '#ffffff' },
        { time: 19.0, text: "EXCELLENCE.", strategy: 'goldReveal', color: '#fbbf24' },
        { time: 20.5, text: "SYSTEMS DO.", strategy: 'impactSlam', color: '#3b82f6' }
    ], []);

    const activeSubtitle = useMemo(() => {
        return script.slice().reverse().find(s => currentTime >= s.time);
    }, [currentTime, script]);

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
            className="relative w-full min-h-[600px] md:min-h-[800px] flex items-center justify-center overflow-visible select-none"
        >
            <AnimatePresence>
                {!hasStarted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: "blur(20px)", scale: 1.1 }}
                        className="absolute inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md cursor-pointer"
                        onClick={handleStart}
                    >
                        <div className="relative group/btn flex flex-col items-center">
                            <motion.div
                                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className="absolute -inset-10 border border-white/20 rounded-full blur-xl"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05, boxShadow: "0 0 80px rgba(255,255,255,0.4)" }}
                                whileTap={{ scale: 0.95 }}
                                className={`${bebas.className} relative px-16 py-8 bg-white text-black text-3xl tracking-[0.3em] font-bold rounded-full transition-all duration-500`}
                            >
                                START PITCHING
                            </motion.button>
                            <span className="mt-8 text-white/40 text-[10px] tracking-[0.5em] uppercase font-light">
                                Unlock the cinematic experience
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Kinetic Studio Subtitles (Ultra-Creative & Safe) */}
            <motion.div 
                style={{ opacity: textOpacity }}
                className="absolute top-12 left-0 right-0 h-[30%] px-6 z-[100] flex flex-col items-center justify-start pointer-events-none"
            >
                <AnimatePresence mode="popLayout">
                    {hasStarted && currentTime > 0 && currentTime < 24 && activeSubtitle && (
                        <motion.div
                            key={activeSubtitle.text}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.3 }}
                            className="text-center w-full"
                        >
                            {(() => {
                                switch (activeSubtitle.strategy) {
                                    case 'typewriter':
                                        return (
                                            <motion.div className="flex gap-2 justify-center flex-wrap">
                                                {activeSubtitle.text.split("").map((c, i) => (
                                                    <motion.span
                                                        key={`${activeSubtitle.text}-${i}`}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: i * 0.04 }}
                                                        className={`${bebas.className} text-4xl md:text-7xl font-bold tracking-tight`}
                                                        style={{ color: activeSubtitle.color }}
                                                    >
                                                        {c === " " ? "\u00A0" : c}
                                                    </motion.span>
                                                ))}
                                            </motion.div>
                                        );
                                    case 'blurSlam':
                                        return (
                                            <motion.h2
                                                initial={{ filter: 'blur(20px)', scale: 1.5, opacity: 0 }}
                                                animate={{ filter: 'blur(0px)', scale: 1, opacity: 1 }}
                                                className={`${bebas.className} text-5xl md:text-8xl font-bold tracking-tight italic whitespace-nowrap`}
                                                style={{ color: activeSubtitle.color }}
                                            >
                                                {activeSubtitle.text}
                                            </motion.h2>
                                        );
                                    case 'impactSlam':
                                        return (
                                            <div className="flex flex-col items-center">
                                                <motion.h2
                                                    initial={{ scale: 3, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: 'spring', damping: 10 }}
                                                    className={`${bebas.className} text-6xl md:text-9xl leading-none font-black tracking-tight`}
                                                    style={{ color: activeSubtitle.color }}
                                                >
                                                    {activeSubtitle.text}
                                                </motion.h2>
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: "100%" }}
                                                    className="h-2 md:h-4 mt-2"
                                                    style={{ backgroundColor: activeSubtitle.color }}
                                                />
                                            </div>
                                        );
                                    case 'splitReveal':
                                        return (
                                            <div className="flex gap-4 justify-center flex-wrap">
                                                {activeSubtitle.text.split(" ").map((word, i) => (
                                                    <motion.span
                                                        key={`${activeSubtitle.text}-${word}-${i}`}
                                                        initial={{ x: i % 2 === 0 ? -200 : 200, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        className={`${bebas.className} text-5xl md:text-8xl font-bold uppercase tracking-tight`}
                                                        style={{ color: activeSubtitle.color }}
                                                    >
                                                        {word}
                                                    </motion.span>
                                                ))}
                                            </div>
                                        );
                                    case 'noise':
                                        return (
                                            <div className="relative flex flex-col items-center">
                                                {/* Chromatic Aberration Layers */}
                                                <div className="relative">
                                                    <motion.h2
                                                        animate={{
                                                            x: [0, -4, 4, -2, 0],
                                                            opacity: [1, 0.8, 1, 0.5, 1],
                                                        }}
                                                        transition={{ repeat: Infinity, duration: 0.12 }}
                                                        className={`${bebas.className} text-5xl md:text-8xl font-bold tracking-tight italic text-[#ff0000] mix-blend-screen absolute inset-0`}
                                                    >
                                                        {activeSubtitle.text}
                                                    </motion.h2>
                                                    <motion.h2
                                                        animate={{
                                                            x: [0, 4, -4, 2, 0],
                                                            opacity: [1, 0.5, 1, 0.8, 1],
                                                        }}
                                                        transition={{ repeat: Infinity, duration: 0.1 }}
                                                        className={`${bebas.className} text-5xl md:text-8xl font-bold tracking-tight italic text-[#00ffff] mix-blend-screen absolute inset-0`}
                                                    >
                                                        {activeSubtitle.text}
                                                    </motion.h2>
                                                    <motion.h2
                                                        animate={{
                                                            y: [-1, 1, -2, 0],
                                                        }}
                                                        transition={{ repeat: Infinity, duration: 0.15 }}
                                                        className={`${bebas.className} text-5xl md:text-8xl font-bold tracking-tight italic text-white relative z-10`}
                                                    >
                                                        {activeSubtitle.text}
                                                    </motion.h2>
                                                </div>

                                                {/* Glitch Data Blocks */}
                                                {[...Array(12)].map((_, i) => (
                                                    <motion.div
                                                        key={`block-${i}`}
                                                        initial={{ opacity: 0 }}
                                                        animate={{
                                                            opacity: [0, 0.8, 0, 0.4, 0],
                                                            x: (Math.random() - 0.5) * 600,
                                                            y: (Math.random() - 0.5) * 200,
                                                            width: Math.random() * 100 + 20,
                                                            height: Math.random() * 4 + 1,
                                                        }}
                                                        transition={{
                                                            repeat: Infinity,
                                                            duration: Math.random() * 0.5 + 0.2,
                                                            delay: Math.random() * 1
                                                        }}
                                                        className="absolute bg-white/30 backdrop-blur-sm pointer-events-none"
                                                    />
                                                ))}
                                            </div>
                                        );
                                    case 'goldReveal':
                                        return (
                                            <motion.h2
                                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                                animate={{
                                                    opacity: 1,
                                                    y: 0,
                                                    scale: 1,
                                                    textShadow: "0 0 40px #fbbf24"
                                                }}
                                                transition={{ duration: 0.8, ease: "easeOut" }}
                                                className={`${bebas.className} text-7xl md:text-[11rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-500 to-yellow-900 tracking-tight`}
                                            >
                                                {activeSubtitle.text}
                                            </motion.h2>
                                        );
                                    case 'scramble':
                                        return (
                                            <motion.div className="flex gap-1 justify-center flex-wrap">
                                                {activeSubtitle.text.split("").map((c, i) => (
                                                    <motion.span
                                                        key={`${activeSubtitle.text}-${i}`}
                                                        initial={{
                                                            x: (Math.random() - 0.5) * 400,
                                                            y: (Math.random() - 0.5) * 200,
                                                            rotate: (Math.random() - 0.5) * 180,
                                                            opacity: 0
                                                        }}
                                                        animate={{
                                                            x: 0,
                                                            y: 0,
                                                            rotate: 0,
                                                            opacity: 1
                                                        }}
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 80,
                                                            damping: 12,
                                                            delay: i * 0.03
                                                        }}
                                                        className={`${bebas.className} text-6xl md:text-9xl font-black tracking-tight`}
                                                        style={{ color: activeSubtitle.color }}
                                                    >
                                                        {c === " " ? "\u00A0" : c}
                                                    </motion.span>
                                                ))}
                                            </motion.div>
                                        );
                                    case 'fadeUp':
                                    default:
                                        return (
                                            <motion.h2
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                className={`${bebas.className} text-4xl md:text-7xl font-bold tracking-widest uppercase opacity-80`}
                                                style={{ color: activeSubtitle.color }}
                                            >
                                                {activeSubtitle.text}
                                            </motion.h2>
                                        );
                                }
                            })()}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
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
                                        delay: i * 0.3, // Sped up the "eating" start significantly
                                        duration: 8.5,  // Smooth travel
                                        ease: "easeInOut",
                                        repeat: 2,      // Keep the stream alive until the reveal
                                    }}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-3"
                                >
                                    <div className="p-4 md:p-6 bg-black/60 border border-white/10 rounded-full backdrop-blur-md shadow-xl" style={{ color: app.color }}>
                                        <app.icon size={screenSize.isMobile ? 24 : 32} />
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

            {/* Hidden audio element for browser compliance */}
            <audio
                ref={audioRef}
                src="/Landing.mp3"
                preload="auto"
                className="hidden"
                aria-hidden="true"
                playsInline
            />
        </div>
    );
}
