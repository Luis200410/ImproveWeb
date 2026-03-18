'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bebas_Neue } from "@/lib/font-shim";
import { 
    Activity, 
    Zap, 
    Target, 
    Shield, 
    Flame, 
    Droplet,
    Dna,
    Clock,
    Scale,
    TrendingUp,
    HeartPulse,
    ChevronRight,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bebas = Bebas_Neue({ subsets: ["latin"] });

interface BodySaaSAnimationProps {
    activeTime?: number;
}

const microApps = [
    {
        id: 'routine',
        title: 'Routine Builder',
        description: 'Industrial-grade training architecture.',
        icon: Activity,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        accentColor: '#3b82f6'
    },
    {
        id: 'fuel',
        title: 'Fuel Surveillance',
        description: 'High-precision macro orchestration.',
        icon: Flame,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        accentColor: '#f97316'
    },
    {
        id: 'recovery',
        title: 'Recovery Sync',
        description: 'HRV and neural readiness monitoring.',
        icon: HeartPulse,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        accentColor: '#10b981'
    },
    {
        id: 'vitals',
        title: 'Biomarker Scan',
        description: 'Real-time physiological audit.',
        icon: Search,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        accentColor: '#a855f7'
    }
];

export function BodySaaSAnimation({ activeTime = 0 }: BodySaaSAnimationProps) {
    const [step, setStep] = useState<'grid' | 'zoom-routine' | 'zoom-fuel' | 'zoom-recovery' | 'zoom-vitals'>('grid');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sequence timing (if using activeTime)
    useEffect(() => {
        if (activeTime === 0) return;
        
        if (activeTime < 5) setStep('grid');
        else if (activeTime < 10) setStep('zoom-routine');
        else if (activeTime < 15) setStep('zoom-fuel');
        else if (activeTime < 20) setStep('zoom-recovery');
        else if (activeTime < 25) setStep('zoom-vitals');
        else setStep('grid');
    }, [activeTime]);

    // Auto-play demo if no activeTime provided
    useEffect(() => {
        if (activeTime !== 0) return;
        
        const interval = setInterval(() => {
            setStep(prev => {
                const stages: typeof step[] = ['grid', 'zoom-routine', 'zoom-fuel', 'zoom-recovery', 'zoom-vitals'];
                const currentIndex = stages.indexOf(prev);
                return stages[(currentIndex + 1) % stages.length];
            });
        }, 8000);

        return () => clearInterval(interval);
    }, [activeTime]);

    if (!isMounted) return <div className="min-h-[600px] w-full bg-black rounded-[3rem]" />;

    return (
        <div className="relative w-full max-w-6xl aspect-[16/10] bg-black border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl group selection:bg-blue-500/30">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 w-full h-12 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-8 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    </div>
                    <span className={`${bebas.className} text-[10px] tracking-[0.3em] text-white/20 uppercase`}>
                        IMPROVE / BODY / CORE_v1.0
                    </span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <span className="text-[8px] font-black tracking-widest text-white/40 uppercase">System Active</span>
                    </div>
                    <Clock className="w-3 h-3 text-white/20" />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {step === 'grid' && (
                    <motion.div 
                        key="grid"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        className="absolute inset-0 p-12 pt-24 grid grid-cols-2 gap-8 h-full"
                    >
                        {microApps.map((app, i) => (
                            <motion.div
                                key={app.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={cn(
                                    "relative p-8 rounded-[2.5rem] border border-white/5 bg-[#080808] flex flex-col justify-between group overflow-hidden transition-all duration-500",
                                    "hover:border-white/20 hover:bg-[#0c0c0c]"
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <div className={cn("p-6 rounded-2xl", app.bgColor)}>
                                        <app.icon className={cn("w-8 h-8", app.color)} />
                                    </div>
                                    <div className="p-3 bg-white/5 rounded-xl">
                                        <ChevronRight className="w-4 h-4 text-white/20" />
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <h4 className={`${bebas.className} text-4xl tracking-tighter text-white uppercase`}>
                                        {app.title}
                                    </h4>
                                    <p className="text-sm text-white/40 font-light leading-relaxed">
                                        {app.description}
                                    </p>
                                </div>

                                {/* Mini Chart/Visual per card */}
                                <div className="absolute right-0 bottom-0 w-1/2 h-1/2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                                    <app.icon className="w-full h-full -rotate-12 translate-x-1/4 translate-y-1/4" />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {step === 'zoom-routine' && (
                    <motion.div 
                        key="routine"
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 p-12 pt-24 bg-[#050505] flex flex-col"
                    >
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <h3 className={`${bebas.className} text-7xl md:text-9xl leading-none text-white`}>ROUTINE BUILDER</h3>
                                <p className="text-blue-500 font-bold tracking-[0.4em] uppercase text-xs mt-4">Training Architecture Protocol</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-center min-w-[100px]">
                                    <span className="block text-[8px] text-white/30 uppercase tracking-widest mb-1">Weekly Volume</span>
                                    <span className="font-mono text-xl text-blue-400">14.2 hr</span>
                                </div>
                                <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-center min-w-[100px]">
                                    <span className="block text-[8px] text-blue-500/50 uppercase tracking-widest mb-1">Intensity</span>
                                    <span className="font-mono text-xl text-blue-400">92%</span>
                                </div>
                            </div>
                        </div>

                        {/* Calendar/Grid Visual */}
                        <div className="flex-1 grid grid-cols-7 gap-4">
                            {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, i) => (
                                <div key={day} className="flex flex-col gap-4 group">
                                    <span className="text-[10px] font-black text-white/20 tracking-widest text-center">{day}</span>
                                    <motion.div 
                                        initial={{ height: 0 }}
                                        animate={{ height: i % 2 === 0 ? '60%' : '80%' }}
                                        className={cn(
                                            "w-full rounded-2xl relative overflow-hidden",
                                            i % 2 === 0 ? "bg-blue-500/20 border border-blue-500/30" : "bg-white/5 border border-white/10"
                                        )}
                                    >
                                        <div className="absolute top-4 left-4">
                                            <Activity className={cn("w-4 h-4", i % 2 === 0 ? "text-blue-400" : "text-white/20")} />
                                        </div>
                                    </motion.div>
                                    {i % 2 === 0 && (
                                        <div className="p-3 bg-white/5 border border-white/5 rounded-xl">
                                             <div className="h-1 w-full bg-blue-500/40 rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}

                {step === 'zoom-fuel' && (
                    <motion.div 
                        key="fuel"
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 p-12 pt-24 bg-[#050505] flex gap-12"
                    >
                        <div className="w-1/3 flex flex-col justify-center gap-8">
                             <div className="space-y-2">
                                <h3 className={`${bebas.className} text-8xl leading-none text-white`}>FUEL</h3>
                                <p className="text-orange-500 font-bold tracking-[0.4em] uppercase text-xs">Macro Surveillance</p>
                            </div>
                            
                            <div className="space-y-6">
                                {[
                                    { label: 'Protein', color: 'bg-blue-500', value: 185, target: 200 },
                                    { label: 'Carbs', color: 'bg-orange-500', value: 240, target: 300 },
                                    { label: 'Fats', color: 'bg-yellow-500', value: 65, target: 80 }
                                ].map((m) => (
                                    <div key={m.label} className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-white/40">{m.label}</span>
                                            <span className="text-white">{m.value}g / {m.target}g</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(m.value/m.target) * 100}%` }}
                                                className={cn("h-full", m.color)} 
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Large Circular Macro Chart */}
                        <div className="flex-1 flex items-center justify-center relative">
                            <svg className="w-3/4 aspect-square rotate-[-90deg]">
                                <circle cx="50%" cy="50%" r="40%" stroke="rgba(255,255,255,0.05)" strokeWidth="40" fill="none" />
                                <motion.circle 
                                    cx="50%" cy="50%" r="40%" stroke="#f97316" strokeWidth="42" fill="none" 
                                    strokeDasharray="100 100" 
                                    initial={{ strokeDashoffset: 100 }}
                                    animate={{ strokeDashoffset: 25 }}
                                    className="drop-shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className={`${bebas.className} text-8xl md:text-9xl text-white`}>82%</span>
                                <span className="text-[10px] font-black tracking-[0.5em] text-orange-500/50 uppercase">Daily Optimization</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'zoom-recovery' && (
                    <motion.div 
                        key="recovery"
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 p-12 pt-24 bg-[#050505] flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-16">
                            <div className="space-y-2">
                                <h3 className={`${bebas.className} text-8xl leading-none text-white`}>RECOVERY</h3>
                                <p className="text-emerald-500 font-bold tracking-[0.4em] uppercase text-xs">Neural Readiness Sync</p>
                            </div>
                            <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl text-right">
                                <span className="block text-[10px] text-emerald-500/50 font-black tracking-widest uppercase mb-2">Readiness Score</span>
                                <span className={`${bebas.className} text-7xl text-emerald-400`}>94</span>
                            </div>
                        </div>

                        {/* HRV Waveform Animation */}
                        <div className="flex-1 relative flex items-center overflow-hidden">
                            <svg width="100%" height="200" className="opacity-40">
                                <motion.path
                                    d="M 0 100 Q 50 50 100 100 T 200 100 T 300 100 T 400 100 T 500 100 T 600 100 T 700 100 T 800 100 T 900 100 T 1000 100"
                                    fill="none"
                                    stroke="#10b981"
                                    strokeWidth="3"
                                    animate={{
                                        d: [
                                            "M 0 100 Q 50 20 100 100 T 200 100 T 300 180 T 400 100 T 500 20 T 600 100 T 700 180 T 800 100 T 900 20 T 1000 100",
                                            "M 0 100 Q 50 180 100 100 T 200 100 T 300 20 T 400 100 T 500 180 T 600 100 T 700 20 T 800 100 T 900 180 T 1000 100",
                                            "M 0 100 Q 50 20 100 100 T 200 100 T 300 180 T 400 100 T 500 20 T 600 100 T 700 180 T 800 100 T 900 20 T 1000 100"
                                        ]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-around px-12 pointer-events-none">
                                {[1,2,3,4,5].map(i => (
                                    <div key={i} className="flex flex-col items-center gap-4">
                                        <div className="h-32 w-0.5 bg-white/5 relative">
                                            <motion.div 
                                                animate={{ top: ['20%', '80%', '20%'] }}
                                                transition={{ duration: 3, delay: i * 0.4, repeat: Infinity }}
                                                className="absolute left-[-4px] w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" 
                                            />
                                        </div>
                                        <span className="text-[8px] font-mono text-white/20">RMSSD {70 + i * 5}ms</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'zoom-vitals' && (
                    <motion.div 
                        key="vitals"
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 p-12 pt-24 bg-[#050505] flex flex-col"
                    >
                         <div className="flex justify-between items-center mb-16">
                            <div className="space-y-2 text-left">
                                <h3 className={`${bebas.className} text-8xl leading-none text-white`}>VITALS</h3>
                                <p className="text-purple-500 font-bold tracking-[0.4em] uppercase text-xs">Biomarker Surveillance Audit</p>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-mono text-white/40">
                                <span className="animate-pulse">SCANNING...</span>
                                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
                                    <Dna className="w-5 h-5 text-purple-400" />
                                    <span className="text-white font-bold">DNA-0094-X</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-2 gap-12">
                             {/* Vitals Data Grid */}
                            <div className="space-y-6">
                                {[
                                    { label: 'Blood Glucose', value: '88 mg/dL', status: 'Stable', color: 'text-emerald-400' },
                                    { label: 'Cortisol', value: '12.4 μg/dL', status: 'Optimal', color: 'text-emerald-400' },
                                    { label: 'Free Testosterone', value: '24.2 ng/dL', status: 'Rising', color: 'text-blue-400' },
                                    { label: 'Body Fat %', value: '11.4%', status: 'Drifting', color: 'text-orange-400' }
                                ].map((stat, i) => (
                                    <motion.div 
                                        key={stat.label}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="p-6 bg-white/5 border border-white/5 rounded-[2rem] flex justify-between items-center group hover:bg-white/10 transition-colors"
                                    >
                                        <div className="space-y-1">
                                            <span className="text-[10px] text-white/20 font-black tracking-widest uppercase">{stat.label}</span>
                                            <p className={`${bebas.className} text-3xl text-white`}>{stat.value}</p>
                                        </div>
                                        <div className={cn("px-4 py-1.5 rounded-full bg-black/50 text-[8px] font-black tracking-widest uppercase", stat.color)}>
                                            {stat.status}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Scanning Humanoid Visual */}
                            <div className="relative flex items-center justify-center bg-purple-500/5 rounded-[3rem] border border-white/5 overflow-hidden">
                                <Activity className="w-1/2 h-1/2 text-purple-500/10 absolute animate-pulse" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black" />
                                
                                {/* Scanning Horizontal Bar */}
                                <motion.div 
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                    className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent z-10 shadow-[0_0_20px_#a855f7]"
                                />

                                <div className="relative z-20 text-center space-y-4">
                                    <div className="p-8 rounded-full border border-purple-500/20 bg-black/50 backdrop-blur-md">
                                        <Target className="w-12 h-12 text-purple-400 animate-[spin_10s_linear_infinite]" />
                                    </div>
                                    <p className="font-mono text-[10px] text-purple-400/60 uppercase tracking-[0.5em]">System Audit in Progress</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Explanatory Overlay (Bottom Label) */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="px-8 py-3 bg-white/10 backdrop-blur-2xl border border-white/10 rounded-full flex items-center gap-6"
                    >
                        <span className="text-[10px] font-black text-blue-500 tracking-widest uppercase">
                            Analysis: {step.split('-')[1]?.toUpperCase() || 'CORE OVERVIEW'}
                        </span>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-xs text-white/60 font-medium whitespace-nowrap">
                            {step === 'grid' && "Initialize systemic body surveillance."}
                            {step === 'zoom-routine' && "Architect industrial training blocks."}
                            {step === 'zoom-fuel' && "Synchronize metabolic fuel orchestration."}
                            {step === 'zoom-recovery' && "Audit neural and physiological readiness."}
                            {step === 'zoom-vitals' && "Execute deep biomarker surveillance."}
                        </span>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
