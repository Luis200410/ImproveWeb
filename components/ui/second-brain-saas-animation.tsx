'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bebas_Neue } from "@/lib/font-shim";
import {
    Brain,
    Layers,
    Rocket,
    ListTodo,
    NotebookPen,
    BookOpenCheck,
    Inbox,
    Archive,
    ChevronRight,
    Clock,
    Zap,
    Target,
    Shield,
    ArrowRight,
    ArrowDown,
    CheckCircle2,
    FolderOpen,
    Sparkles,
    Lock,
    Trash2,
    RotateCcw,
    Gauge,
    Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';

const bebas = Bebas_Neue({ subsets: ["latin"] });

interface SecondBrainSaaSAnimationProps {
    activeTime?: number;
}

const microApps = [
    {
        id: 'areas',
        title: 'Areas',
        description: 'Persistent domains of responsibility.',
        icon: Layers,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        accentColor: '#10b981'
    },
    {
        id: 'projects',
        title: 'Projects',
        description: 'Surgical initiatives with finish lines.',
        icon: Rocket,
        color: 'text-indigo-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
        accentColor: '#6366f1'
    },
    {
        id: 'tasks',
        title: 'Tasks',
        description: 'Granular execution milestones.',
        icon: ListTodo,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        accentColor: '#f59e0b'
    },
    {
        id: 'notes',
        title: 'Notes',
        description: 'Internal wisdom converted to DNA.',
        icon: NotebookPen,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        accentColor: '#a855f7'
    },
    {
        id: 'resources',
        title: 'Resources',
        description: 'Curated intelligence library.',
        icon: BookOpenCheck,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        accentColor: '#3b82f6'
    },
    {
        id: 'inbox',
        title: 'Inbox',
        description: 'High-velocity frictionless capture.',
        icon: Inbox,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10',
        borderColor: 'border-rose-500/20',
        accentColor: '#f43f5e'
    },
    {
        id: 'archive',
        title: 'Archive',
        description: 'Secured mission history vault.',
        icon: Archive,
        color: 'text-cyan-500',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'border-cyan-500/20',
        accentColor: '#06b6d4'
    },
];

// Phase 1 overlay texts for Area step
const areaOverlayTexts: Record<number, string> = {
    2: 'You define the structure',
    3: 'You set the parameters',
};

// Narrative phrases for Phase 2 — each gets highlighted at its timestamp
const narrativePhrases = [
    { id: 'chaos', text: 'Organizational Chaos', color: 'text-red-400' },           // 0
    { id: 'floats', text: 'floats', color: 'text-red-400/70' },                     // 1
    { id: 'anchored', text: 'everything is anchored', color: 'text-emerald-400' },  // 2
    { id: 'defined', text: 'Area defined entirely by you', color: 'text-emerald-400' }, // 3
    { id: 'mastery', text: 'long-term mastery', color: 'text-amber-400' },          // 4
    { id: 'framework', text: 'structural framework', color: 'text-emerald-400' },   // 5
    { id: 'context', text: 'ultimate context', color: 'text-amber-400' },           // 6
    { id: 'architecture', text: 'your unique architecture', color: 'text-emerald-400' }, // 7
    { id: 'shape', text: 'your life takes shape', color: 'text-emerald-400' },        // 8
    { id: 'action', text: 'deploy targeted action', color: 'text-indigo-400' },        // 9
];

interface AreaStepProps {
    areaTextIndex: number | null;
    areaHighlightIndex: number | null;
    areaPhase: number;
    narrativeHighlight: number | null;
    showProjectCard: boolean;
}

function AreaStep({ areaTextIndex, areaHighlightIndex, areaPhase, narrativeHighlight, showProjectCard }: AreaStepProps) {
    const areaCards = [
        { name: 'Business Empire', projects: 12, color: 'border-emerald-500/30 bg-emerald-500/5', glowColor: 'rgba(16,185,129,0.3)' },
        { name: 'Personal Craft', projects: 8, color: 'border-blue-500/30 bg-blue-500/5', glowColor: 'rgba(59,130,246,0.3)' },
        { name: 'Lifelong Mission', projects: 5, color: 'border-purple-500/30 bg-purple-500/5', glowColor: 'rgba(168,85,247,0.3)' },
    ];

    return (
        <motion.div
            key="areas"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 p-4 md:p-8 lg:p-12 pt-16 md:pt-20 lg:pt-24 bg-[#050505] flex flex-col"
        >
            <AnimatePresence mode="wait">
                {/* ── PHASE 1: Card View ── */}
                {areaPhase === 0 && (
                    <motion.div
                        key="area-cards-phase"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col flex-1"
                    >
                        <div className="flex justify-between items-end mb-4 md:mb-8">
                            <div>
                                <h3 className={`${bebas.className} text-5xl md:text-7xl lg:text-9xl leading-none text-white transition-all duration-500 ${areaTextIndex === 0 ? 'drop-shadow-[0_0_30px_rgba(16,185,129,0.6)]' : ''}`}>AREA</h3>
                                <p className={`font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs mt-2 md:mt-4 transition-all duration-500 ${areaTextIndex === 1 ? 'text-emerald-400 scale-105' : 'text-emerald-500'}`}>Parent Container Protocol</p>
                            </div>
                            <div className="flex gap-2 md:gap-4">
                                <div className="p-2 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/10 text-center min-w-[60px] md:min-w-[100px]">
                                    <span className="block text-[7px] md:text-[8px] text-white/30 uppercase tracking-widest mb-1">Domains</span>
                                    <span className="font-mono text-base md:text-xl text-emerald-400">∞</span>
                                </div>
                                <div className="p-2 md:p-4 bg-emerald-500/10 rounded-xl md:rounded-2xl border border-emerald-500/20 text-center min-w-[60px] md:min-w-[100px]">
                                    <span className="block text-[7px] md:text-[8px] text-emerald-500/50 uppercase tracking-widest mb-1">Framework</span>
                                    <span className="font-mono text-base md:text-xl text-emerald-400">PARA</span>
                                </div>
                            </div>
                        </div>

                        {/* Area Cards */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                            {areaCards.map((area, i) => {
                                const isHighlighted = areaHighlightIndex === i;
                                return (
                                    <motion.div
                                        key={area.name}
                                        initial={{ y: 40, opacity: 0 }}
                                        animate={{
                                            y: isHighlighted ? -8 : 0,
                                            opacity: 1,
                                            scale: isHighlighted ? 1.03 : 1,
                                        }}
                                        transition={isHighlighted
                                            ? { duration: 0.4, type: "spring", damping: 12 }
                                            : { delay: i * 0.2, type: "spring" }
                                        }
                                        className={cn("rounded-2xl md:rounded-[2rem] border p-4 md:p-8 flex flex-col justify-between transition-all duration-300", area.color)}
                                        style={isHighlighted ? {
                                            boxShadow: `0 0 40px ${area.glowColor}, 0 10px 30px rgba(0,0,0,0.5)`,
                                        } : undefined}
                                    >
                                        <div className="space-y-2 md:space-y-4">
                                            <FolderOpen className={cn("w-6 h-6 md:w-8 md:h-8 transition-all duration-300", isHighlighted ? 'text-white/80' : 'text-white/40')} />
                                            <h4 className={`${bebas.className} text-2xl md:text-4xl text-white`}>{area.name}</h4>
                                            <p className="text-xs md:text-sm text-white/30">Persistent domain of responsibility</p>
                                        </div>
                                        <div className="flex items-center justify-between mt-4 md:mt-6 pt-3 md:pt-4 border-t border-white/5">
                                            <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-white/20">{area.projects} Projects</span>
                                            <ChevronRight className="w-4 h-4 text-white/20" />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Phase 1 overlay text */}
                        <div className="mt-3 md:mt-6 min-h-[36px] md:min-h-[44px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {areaTextIndex !== null && areaTextIndex >= 2 && areaOverlayTexts[areaTextIndex] && (
                                    <motion.p
                                        key={`area-overlay-${areaTextIndex}`}
                                        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                                        transition={{ duration: 0.5 }}
                                        className={`${bebas.className} text-lg md:text-2xl lg:text-3xl tracking-tight text-center text-emerald-400`}
                                    >
                                        {areaOverlayTexts[areaTextIndex]}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* ── PHASE 2: Animated Narrative View ── */}
                {areaPhase === 1 && (
                    <motion.div
                        key="area-narrative-phase"
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                        {/* Background grid that reveals on "structural framework" (index 5) */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: narrativeHighlight !== null && narrativeHighlight >= 5 ? 0.15 : 0 }}
                            transition={{ duration: 1.5 }}
                            className="absolute inset-0 pointer-events-none"
                        >
                            <div className="w-full h-full bg-[linear-gradient(rgba(16,185,129,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />
                        </motion.div>

                        {/* Floating chaos particles — visible during chaos phase, anchor during anchored phase */}
                        {Array.from({ length: 12 }).map((_, i) => {
                            const isAnchored = narrativeHighlight !== null && narrativeHighlight >= 2;
                            const isChaos = narrativeHighlight !== null && narrativeHighlight >= 0 && narrativeHighlight < 2;
                            // Chaotic positions
                            const chaosX = ['-120%', '80%', '-60%', '150%', '-40%', '100%', '-90%', '130%', '-20%', '70%', '-110%', '160%'][i];
                            const chaosY = ['-80%', '60%', '120%', '-50%', '90%', '-120%', '40%', '100%', '-90%', '130%', '20%', '-60%'][i];
                            // Anchored grid positions (3x4 grid around center)
                            const anchorX = `${(i % 4) * 80 - 120}px`;
                            const anchorY = `${Math.floor(i / 4) * 60 - 60}px`;

                            return (
                                <motion.div
                                    key={`particle-${i}`}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{
                                        opacity: isChaos || isAnchored ? (isAnchored ? 0.8 : 0.5) : 0,
                                        scale: isChaos || isAnchored ? 1 : 0,
                                        x: isAnchored ? anchorX : chaosX,
                                        y: isAnchored ? anchorY : chaosY,
                                        rotate: isAnchored ? 0 : (i * 47) % 360,
                                    }}
                                    transition={isAnchored
                                        ? { duration: 0.8, type: "spring", damping: 15, delay: i * 0.05 }
                                        : { duration: 2, repeat: isChaos ? Infinity : 0, repeatType: "reverse" as const, delay: i * 0.1 }
                                    }
                                    className="absolute left-1/2 top-1/2 z-0"
                                >
                                    <div className={cn(
                                        "w-3 h-3 md:w-4 md:h-4 rounded-sm border transition-all duration-700",
                                        isAnchored
                                            ? "border-emerald-500/50 bg-emerald-500/10"
                                            : "border-red-500/30 bg-red-500/5"
                                    )} />
                                </motion.div>
                            );
                        })}

                        {/* Center Area Container — materializes on "defined entirely by you" (index 3) */}
                        <AnimatePresence>
                            {narrativeHighlight !== null && narrativeHighlight >= 3 && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, borderColor: 'rgba(16,185,129,0)' }}
                                    animate={{ scale: 1, opacity: 1, borderColor: 'rgba(16,185,129,0.5)' }}
                                    transition={{ duration: 0.8, type: "spring", damping: 12 }}
                                    className="relative z-10 w-48 h-32 md:w-72 md:h-44 rounded-2xl md:rounded-3xl border-2 bg-emerald-500/5 backdrop-blur-sm flex flex-col items-center justify-center mb-4 md:mb-6"
                                    style={{
                                        boxShadow: narrativeHighlight >= 6
                                            ? '0 0 60px rgba(245,158,11,0.3), 0 0 120px rgba(16,185,129,0.15)'
                                            : '0 0 40px rgba(16,185,129,0.2), 0 0 80px rgba(16,185,129,0.1)',
                                    }}
                                >
                                    <FolderOpen className="w-6 h-6 md:w-8 md:h-8 text-emerald-400 mb-2" />
                                    <span className={`${bebas.className} text-xl md:text-3xl text-white`}>YOUR AREA</span>
                                    <span className="text-[8px] md:text-[10px] text-emerald-400/60 tracking-widest uppercase font-bold mt-1">Defined by you</span>

                                    {/* Mastery progress bar — shows on "long-term mastery" (index 4) */}
                                    <AnimatePresence>
                                        {narrativeHighlight >= 4 && (
                                            <motion.div
                                                initial={{ width: 0, opacity: 0 }}
                                                animate={{ width: '70%', opacity: 1 }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                className="absolute bottom-3 md:bottom-4 left-[15%] h-1 md:h-1.5 rounded-full bg-gradient-to-r from-emerald-500 via-amber-500 to-amber-400"
                                                style={{
                                                    boxShadow: '0 0 12px rgba(245,158,11,0.5)',
                                                }}
                                            />
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Connecting lines from particles to container — on "structural framework" (index 5) */}
                        <AnimatePresence>
                            {narrativeHighlight !== null && narrativeHighlight >= 5 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.4 }}
                                    transition={{ duration: 1 }}
                                    className="absolute inset-0 z-0 pointer-events-none"
                                >
                                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                        {[20, 35, 50, 65, 80].map((x, i) => (
                                            <motion.line
                                                key={`vline-${i}`}
                                                x1={x} y1="10" x2={x} y2="90"
                                                stroke="rgba(16,185,129,0.2)"
                                                strokeWidth="0.15"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                            />
                                        ))}
                                        {[25, 40, 55, 70].map((y, i) => (
                                            <motion.line
                                                key={`hline-${i}`}
                                                x1="10" y1={y} x2="90" y2={y}
                                                stroke="rgba(16,185,129,0.2)"
                                                strokeWidth="0.15"
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                                            />
                                        ))}
                                    </svg>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Text overlays — each appears at its timestamp */}
                        <div className="relative z-20 min-h-[40px] md:min-h-[50px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {narrativeHighlight !== null && (
                                    <motion.p
                                        key={`narr-${narrativeHighlight}`}
                                        initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
                                        transition={{ duration: 0.5 }}
                                        className={`${bebas.className} text-xl md:text-3xl lg:text-4xl tracking-tight text-center ${narrativePhrases[narrativeHighlight]?.color || 'text-white'}`}
                                        style={{
                                            textShadow: '0 0 20px currentColor',
                                        }}
                                    >
                                        {narrativePhrases[narrativeHighlight]?.text}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* "Ultimate context" convergence ring — on index 6 */}
                        <AnimatePresence>
                            {narrativeHighlight !== null && narrativeHighlight >= 6 && narrativeHighlight < 9 && (
                                <motion.div
                                    initial={{ scale: 2.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 0.6 }}
                                    transition={{ duration: 1.2, type: "spring", damping: 10 }}
                                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 rounded-full border border-amber-500/30 pointer-events-none z-0"
                                    style={{
                                        boxShadow: '0 0 60px rgba(245,158,11,0.15), inset 0 0 60px rgba(245,158,11,0.05)',
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        {/* Projects micro-app card — slides in from left at 1:25 */}
                        <AnimatePresence>
                            {showProjectCard && (
                                <motion.div
                                    initial={{ x: '-100vw', opacity: 0, rotate: -5 }}
                                    animate={{ x: 0, opacity: 1, rotate: 0 }}
                                    exit={{ x: '100vw', opacity: 0 }}
                                    transition={{ duration: 1, type: "spring", damping: 14 }}
                                    className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 md:gap-4 px-5 md:px-8 py-3 md:py-5 rounded-2xl md:rounded-3xl border-2 border-indigo-500/40 bg-[#0A0A0A]/90 backdrop-blur-sm"
                                    style={{
                                        boxShadow: '0 0 50px rgba(99,102,241,0.3), 0 10px 40px rgba(0,0,0,0.5)',
                                    }}
                                >
                                    <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center">
                                        <Rocket className="w-5 h-5 md:w-7 md:h-7 text-indigo-400" />
                                    </div>
                                    <div>
                                        <span className={`${bebas.className} text-lg md:text-2xl text-white block`}>PROJECTS</span>
                                        <span className="text-[8px] md:text-[10px] text-indigo-400/70 tracking-widest uppercase font-bold">Micro-App</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-indigo-400 ml-2" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// Helper component for narrative highlighted words
function NarrativeWord({ active, phrase }: { active: boolean; phrase: typeof narrativePhrases[number] }) {
    return (
        <span className={cn(
            "transition-all duration-500 font-bold",
            active ? `${phrase.color} drop-shadow-[0_0_12px_currentColor]` : 'text-white/20'
        )}>
            {phrase.text}
        </span>
    );
}

// Project highlight texts
const projectTexts: Record<number, { text: string; color: string }> = {
    0: { text: 'Project', color: 'text-indigo-400' },
    1: { text: 'clear objective and a definitive finish line', color: 'text-amber-400' },
    2: { text: 'integrated AI to reverse-engineer', color: 'text-indigo-400' },
    3: { text: 'exact milestones and resources required', color: 'text-indigo-400' },
    4: { text: 'current state', color: 'text-white' },
    // Phase 2
    5: { text: 'Project cannot exist in a vacuum', color: 'text-red-400' },
    6: { text: 'tethered to its Parent Area', color: 'text-emerald-400' },
    7: { text: 'Velocity, not just activity', color: 'text-indigo-400' },
    8: { text: "doesn't move the needle", color: 'text-amber-400' },
    9: { text: 'no place in your Project Engine', color: 'text-red-400' },
};

function ProjectStep({ projectPhase, projectHighlight }: { projectPhase: number; projectHighlight: number | null }) {
    const kanbanCols = [
        { title: '/INBOX', items: ['Market Analysis', 'Brand Identity'], color: 'text-white/50', accent: 'bg-white/5', barColor: 'bg-white/20' },
        { title: '/ACTIVE', items: ['SaaS Launch', 'Revenue Model', 'Content Pipeline'], color: 'text-amber-500', accent: 'bg-amber-500/5', barColor: 'bg-amber-500' },
        { title: '/DONE', items: ['MVP Build', 'Beta Testing'], color: 'text-emerald-500', accent: 'bg-emerald-500/5', barColor: 'bg-emerald-500' },
    ];

    return (
        <motion.div
            key="projects"
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="absolute inset-0 p-4 md:p-8 lg:p-12 pt-16 md:pt-20 lg:pt-24 bg-[#050505] flex flex-col"
        >
            <AnimatePresence mode="wait">
                {/* ── PHASE 1: Kanban + AI (1:33 - 1:55) ── */}
                {projectPhase === 0 && (
                    <motion.div
                        key="project-kanban"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col flex-1"
                    >
                        <div className="flex justify-between items-start mb-4 md:mb-8">
                            <div className="space-y-1 md:space-y-2">
                                <h3 className={`${bebas.className} text-5xl md:text-7xl lg:text-9xl leading-none text-white transition-all duration-500 ${projectHighlight === 0 ? 'drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]' : ''}`}>PROJECTS</h3>
                                <p className="text-indigo-500 font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs">AI Reverse-Engineer Protocol</p>
                            </div>
                            <div className="flex gap-2 md:gap-4">
                                <div className="p-2 md:p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl md:rounded-2xl text-center">
                                    <span className="block text-[7px] md:text-[8px] text-indigo-500/50 font-black tracking-widest uppercase mb-1">Velocity</span>
                                    <span className={`${bebas.className} text-2xl md:text-4xl text-indigo-400`}>92%</span>
                                </div>
                            </div>
                        </div>

                        {/* Kanban Board */}
                        <div className="flex-1 grid grid-cols-3 gap-2 md:gap-6 relative">
                            {kanbanCols.map((col, ci) => (
                                <div key={col.title} className="flex flex-col gap-2 md:gap-4">
                                    <div className="flex items-center gap-2 md:gap-3 pb-2 md:pb-3 border-b border-white/5">
                                        <span className={cn("text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em]", col.color)}>{col.title}</span>
                                        <span className="bg-white/5 px-1.5 md:px-2 py-0.5 rounded text-[8px] md:text-[10px] font-mono text-white/40">{col.items.length}</span>
                                    </div>
                                    {col.items.map((item, ii) => (
                                        <motion.div
                                            key={item}
                                            initial={{ x: -20, opacity: 0 }}
                                            animate={{
                                                x: 0,
                                                opacity: 1,
                                                scale: projectHighlight === 1 ? 1.02 : 1,
                                            }}
                                            transition={{ delay: ci * 0.15 + ii * 0.1 }}
                                            className={cn("p-3 md:p-5 rounded-xl md:rounded-2xl border border-white/5 space-y-2 md:space-y-3 transition-all duration-500", col.accent)}
                                            style={projectHighlight === 1 ? {
                                                boxShadow: '0 0 20px rgba(99,102,241,0.15)',
                                            } : undefined}
                                        >
                                            <span className="text-[10px] md:text-sm font-bold text-white">{item}</span>
                                            <div className="h-1 md:h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${projectHighlight !== null && projectHighlight >= 1 ? 30 + (ci * 25) + (ii * 10) : 0}%` }}
                                                    transition={{ duration: 1.5, delay: ci * 0.2 }}
                                                    className={cn("h-full rounded-full", col.barColor)}
                                                />
                                            </div>
                                            <div className="items-center gap-2 hidden md:flex">
                                                <Target className="w-3 h-3 text-white/20" />
                                                <span className="text-[9px] text-white/20 font-mono">Area: Business</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ))}

                            {/* AI Sparkle overlay — at highlight 2 */}
                            <AnimatePresence>
                                {projectHighlight !== null && projectHighlight >= 2 && projectHighlight < 5 && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
                                    >
                                        <div className="bg-[#050505]/80 backdrop-blur-sm rounded-3xl border border-indigo-500/30 p-6 md:p-10 flex flex-col items-center gap-3 md:gap-4"
                                            style={{ boxShadow: '0 0 60px rgba(99,102,241,0.2)' }}
                                        >
                                            <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-indigo-400" />
                                            <span className={`${bebas.className} text-xl md:text-3xl text-white`}>AI REVERSE-ENGINEER</span>
                                            <div className="flex gap-2">
                                                {['Goal', 'Milestones', 'Resources', 'Timeline'].map((label, i) => (
                                                    <motion.div
                                                        key={label}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: 0.3 + i * 0.15 }}
                                                        className="px-2 md:px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20"
                                                    >
                                                        <span className="text-[8px] md:text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{label}</span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Phase 1 text overlay */}
                        <div className="mt-3 md:mt-4 min-h-[36px] md:min-h-[44px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {projectHighlight !== null && projectTexts[projectHighlight] && projectHighlight < 5 && (
                                    <motion.p
                                        key={`proj-${projectHighlight}`}
                                        initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -10, filter: 'blur(6px)' }}
                                        transition={{ duration: 0.5 }}
                                        className={`${bebas.className} text-lg md:text-2xl lg:text-3xl tracking-tight text-center ${projectTexts[projectHighlight].color}`}
                                        style={{ textShadow: '0 0 20px currentColor' }}
                                    >
                                        {projectTexts[projectHighlight].text}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* ── PHASE 2: Links, Velocity, Deletion (1:56 - 2:12) ── */}
                {projectPhase === 1 && (
                    <motion.div
                        key="project-links"
                        initial={{ opacity: 0, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, filter: 'blur(10px)' }}
                        transition={{ duration: 0.8 }}
                        className="flex-1 flex flex-col items-center justify-center relative overflow-hidden"
                    >
                        {/* Area ↔ Project linking animation — at highlight 6 */}
                        <AnimatePresence>
                            {projectHighlight !== null && projectHighlight >= 6 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.6 }}
                                    className="flex items-center gap-4 md:gap-8 mb-6 md:mb-10"
                                >
                                    {/* Area logo */}
                                    <motion.div
                                        initial={{ x: -100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.6, type: 'spring' }}
                                        className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
                                        style={{ boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}
                                    >
                                        <Layers className="w-6 h-6 md:w-9 md:h-9 text-emerald-400" />
                                    </motion.div>

                                    {/* Connecting line */}
                                    <motion.div className="flex items-center gap-1">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '60px' }}
                                            transition={{ duration: 0.8, delay: 0.4 }}
                                            className="h-0.5 bg-gradient-to-r from-emerald-500 to-indigo-500"
                                        />
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.8 }}
                                        >
                                            <Link2 className="w-4 h-4 md:w-5 md:h-5 text-white/50" />
                                        </motion.div>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: '60px' }}
                                            transition={{ duration: 0.8, delay: 0.4 }}
                                            className="h-0.5 bg-gradient-to-r from-indigo-500 to-indigo-400"
                                        />
                                    </motion.div>

                                    {/* Project logo */}
                                    <motion.div
                                        initial={{ x: 100, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ duration: 0.6, type: 'spring' }}
                                        className="w-14 h-14 md:w-20 md:h-20 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center"
                                        style={{ boxShadow: '0 0 30px rgba(99,102,241,0.2)' }}
                                    >
                                        <Rocket className="w-6 h-6 md:w-9 md:h-9 text-indigo-400" />
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Velocity Gauge — at highlight 7 */}
                        <AnimatePresence>
                            {projectHighlight !== null && projectHighlight >= 7 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.6, type: 'spring' }}
                                    className="relative mb-6 md:mb-8"
                                >
                                    <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-indigo-500/20 bg-[#0A0A0A] flex items-center justify-center relative overflow-hidden">
                                        {/* Gauge fill arc */}
                                        <motion.div
                                            initial={{ rotate: -90 }}
                                            animate={{ rotate: projectHighlight >= 8 ? 90 : 45 }}
                                            transition={{ duration: 1.5, type: 'spring', damping: 10 }}
                                            className="absolute inset-2 rounded-full"
                                            style={{
                                                background: `conic-gradient(from -90deg, rgba(99,102,241,0.6) 0deg, rgba(245,158,11,0.6) 180deg, transparent 180deg)`,
                                                mask: 'radial-gradient(transparent 55%, black 56%)',
                                                WebkitMask: 'radial-gradient(transparent 55%, black 56%)',
                                            }}
                                        />
                                        {/* Needle */}
                                        <motion.div
                                            initial={{ rotate: -90 }}
                                            animate={{ rotate: projectHighlight >= 8 ? 60 : 0 }}
                                            transition={{ duration: 1.2, type: 'spring', damping: 8 }}
                                            className="absolute w-0.5 md:w-1 h-12 md:h-20 bg-gradient-to-t from-amber-500 to-transparent origin-bottom left-1/2 -translate-x-1/2 bottom-1/2"
                                            style={{ transformOrigin: 'bottom center' }}
                                        />
                                        <div className="flex flex-col items-center z-10">
                                            <Gauge className="w-6 h-6 md:w-8 md:h-8 text-indigo-400 mb-1" />
                                            <span className={`${bebas.className} text-xl md:text-3xl text-white`}>92%</span>
                                            <span className="text-[7px] md:text-[9px] text-indigo-400/60 tracking-widest uppercase font-bold">Velocity</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Project deletion animation — at highlight 9 */}
                        <AnimatePresence>
                            {projectHighlight !== null && projectHighlight >= 9 && (
                                <motion.div
                                    initial={{ opacity: 1, x: 0, rotate: 0 }}
                                    animate={{
                                        opacity: [1, 1, 1, 0],
                                        x: [0, -5, 5, -3, 3, 0, 0, 200],
                                        rotate: [0, -2, 2, -1, 1, 0, 0, 15],
                                        scale: [1, 1, 1, 0.8],
                                    }}
                                    transition={{ duration: 2, times: [0, 0.15, 0.3, 1] }}
                                    className="flex items-center gap-3 px-5 py-3 md:px-8 md:py-4 rounded-2xl border border-red-500/30 bg-red-500/5"
                                >
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                    <span className={`${bebas.className} text-lg md:text-xl text-red-400`}>INACTIVE PROJECT</span>
                                    <span className="text-[8px] text-red-400/50 uppercase tracking-wider">Removed</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Phase 2 text overlay */}
                        <div className="mt-4 md:mt-6 min-h-[40px] md:min-h-[50px] flex items-center justify-center relative z-20">
                            <AnimatePresence mode="wait">
                                {projectHighlight !== null && projectHighlight >= 5 && projectTexts[projectHighlight] && (
                                    <motion.p
                                        key={`proj2-${projectHighlight}`}
                                        initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -12, filter: 'blur(8px)' }}
                                        transition={{ duration: 0.5 }}
                                        className={`${bebas.className} text-xl md:text-3xl lg:text-4xl tracking-tight text-center ${projectTexts[projectHighlight].color}`}
                                        style={{ textShadow: '0 0 20px currentColor' }}
                                    >
                                        {projectTexts[projectHighlight].text}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

type AnimStep = 'cortex' | 'zoom-areas' | 'zoom-projects' | 'zoom-tasks' | 'zoom-notes-resources' | 'zoom-inbox' | 'zoom-archive' | 'lockdown';

export function SecondBrainSaaSAnimation({ activeTime = 0 }: SecondBrainSaaSAnimationProps) {
    const [step, setStep] = useState<AnimStep>('cortex');
    const [isMounted, setIsMounted] = useState(false);
    const [highlightedAppIndex, setHighlightedAppIndex] = useState<number | null>(null);
    const [highlightedTextIndex, setHighlightedTextIndex] = useState<number | null>(null);
    const [visibleSubWords, setVisibleSubWords] = useState<number[]>([]);
    const [areaTextIndex, setAreaTextIndex] = useState<number | null>(null);
    const [areaHighlightIndex, setAreaHighlightIndex] = useState<number | null>(null);
    const [areaPhase, setAreaPhase] = useState(0);
    const [narrativeHighlight, setNarrativeHighlight] = useState<number | null>(null);
    const [showProjectCard, setShowProjectCard] = useState(false);
    const [projectPhase, setProjectPhase] = useState(0);
    const [projectHighlight, setProjectHighlight] = useState<number | null>(null);
    const animStartRef = useRef<number>(0);

    useEffect(() => {
        setIsMounted(true);
        animStartRef.current = Date.now();
    }, []);

    // Micro-app highlight timings synced with audio (seconds from start)
    const highlightTimings = useMemo(() => [
        { index: 0, time: 12.5 },  // Areas
        { index: 1, time: 13.5 },  // Projects
        { index: 2, time: 15 },    // Tasks
        { index: 3, time: 16 },    // Notes
        { index: 4, time: 17 },    // Resources
        { index: 5, time: 18 },    // Inbox
        { index: 6, time: 19 },    // Archive
    ], []);

    // Schedule micro-app highlights AND text reveals when cortex step is active
    useEffect(() => {
        if (step !== 'cortex') {
            setHighlightedAppIndex(null);
            setHighlightedTextIndex(null);
            setVisibleSubWords([]);
            return;
        }

        const timeouts: NodeJS.Timeout[] = [];

        // Text timings: "UNIFIED DIGITAL CORTEX" at 2s, "Seven Micro-Apps" at 10s, "One Intellectual Fortress" at 25s
        timeouts.push(setTimeout(() => setHighlightedTextIndex(0), 2000));

        // Sub-words: "capture" at 5s, "process" at 6s, "secure" at 7s
        timeouts.push(setTimeout(() => setVisibleSubWords([0]), 5000));
        timeouts.push(setTimeout(() => setVisibleSubWords([0, 1]), 6000));
        timeouts.push(setTimeout(() => setVisibleSubWords([0, 1, 2]), 7000));

        // Clear sub-words before "Seven Micro-Apps" appears
        timeouts.push(setTimeout(() => { setHighlightedTextIndex(1); setVisibleSubWords([]); }, 10000));
        timeouts.push(setTimeout(() => setHighlightedTextIndex(2), 25000));
        timeouts.push(setTimeout(() => setHighlightedTextIndex(3), 27000));

        // Micro-app highlight timings
        highlightTimings.forEach(({ index, time }: { index: number; time: number }) => {
            const timeout = setTimeout(() => {
                setHighlightedAppIndex(index);
            }, time * 1000);
            timeouts.push(timeout);
        });

        // Clear app highlight after last app (at ~20.5s)
        timeouts.push(setTimeout(() => {
            setHighlightedAppIndex(null);
        }, 20500));

        return () => {
            timeouts.forEach(t => clearTimeout(t));
            setHighlightedAppIndex(null);
            setHighlightedTextIndex(null);
            setVisibleSubWords([]);
        };
    }, [step, highlightTimings]);

    // Schedule area text + card highlights when zoom-areas step is active
    useEffect(() => {
        if (step !== 'zoom-areas') {
            setAreaTextIndex(null);
            setAreaHighlightIndex(null);
            setAreaPhase(0);
            setNarrativeHighlight(null);
            setShowProjectCard(false);
            return;
        }

        const timeouts: NodeJS.Timeout[] = [];

        // ── PHASE 1: Cards view (30s - 52s abs = 0-22s relative) ──
        // "AREA" title glow at 33s abs = 3s rel
        timeouts.push(setTimeout(() => setAreaTextIndex(0), 3000));
        // "Parent Container Protocol" highlight at 35s abs = 5s rel
        timeouts.push(setTimeout(() => setAreaTextIndex(1), 5000));
        // "You define the structure" overlay at 44s abs = 14s rel
        timeouts.push(setTimeout(() => { setAreaTextIndex(2); }, 14000));
        // Card highlights: Business Empire 47s, Personal Craft 48s, Lifelong Mission 49s
        timeouts.push(setTimeout(() => { setAreaHighlightIndex(0); setAreaTextIndex(null); }, 17000));
        timeouts.push(setTimeout(() => setAreaHighlightIndex(1), 18000));
        timeouts.push(setTimeout(() => setAreaHighlightIndex(2), 19000));
        // "You set the parameters" at 50s abs = 20s rel
        timeouts.push(setTimeout(() => { setAreaHighlightIndex(null); setAreaTextIndex(3); }, 20000));

        // ── PHASE 2: Narrative view (52s - 74s abs = 22s-44s relative) ──
        // Transition to narrative at 52s abs = 22s rel
        timeouts.push(setTimeout(() => {
            setAreaTextIndex(null);
            setAreaPhase(1);
        }, 22000));
        // "Organizational Chaos" at 54s abs = 24s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(0), 24000));
        // "floats" at 56s abs = 26s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(1), 26000));
        // "everything is anchored" at 59s abs = 29s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(2), 29000));
        // "Area defined entirely by you" at 1:01 abs = 31s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(3), 31000));
        // "long-term mastery" at 1:07 abs = 37s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(4), 37000));
        // "structural framework" at 1:09 abs = 39s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(5), 39000));
        // "ultimate context" at 1:12 abs = 42s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(6), 42000));

        // ── PHASE 2 continued: Transition to Projects (1:15 - 1:33 abs = 45-63s relative) ──
        // "your unique architecture" at 1:15 abs = 45s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(7), 45000));
        // "your life takes shape" at 1:18 abs = 48s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(8), 48000));
        // "deploy targeted action" at 1:22 abs = 52s rel
        timeouts.push(setTimeout(() => setNarrativeHighlight(9), 52000));
        // Projects micro-app card slides in at 1:25 abs = 55s rel
        timeouts.push(setTimeout(() => setShowProjectCard(true), 55000));

        return () => {
            timeouts.forEach(t => clearTimeout(t));
            setAreaTextIndex(null);
            setAreaHighlightIndex(null);
            setAreaPhase(0);
            setNarrativeHighlight(null);
            setShowProjectCard(false);
        };
    }, [step]);

    // Schedule project highlights when zoom-projects step is active
    useEffect(() => {
        if (step !== 'zoom-projects') {
            setProjectPhase(0);
            setProjectHighlight(null);
            return;
        }

        const timeouts: NodeJS.Timeout[] = [];

        // ── PHASE 1: Kanban (1:33 - 1:55 abs = 0-22s relative) ──
        // "Project" title glow at 1:35 abs = 2s rel
        timeouts.push(setTimeout(() => setProjectHighlight(0), 2000));
        // Progress bars animate + "clear objective" at 1:39 = 6s rel
        timeouts.push(setTimeout(() => setProjectHighlight(1), 6000));
        // AI reverse-engineer overlay at 1:45 = 12s rel
        timeouts.push(setTimeout(() => setProjectHighlight(2), 12000));
        // "exact milestones" at 1:51 = 18s rel
        timeouts.push(setTimeout(() => setProjectHighlight(3), 18000));
        // "current state" at 1:55 = 22s rel
        timeouts.push(setTimeout(() => setProjectHighlight(4), 22000));

        // ── PHASE 2: Links & Velocity (1:56 - 2:12 abs = 23-39s relative) ──
        // Transition to Phase 2 at 1:56 = 23s rel
        timeouts.push(setTimeout(() => {
            setProjectPhase(1);
            setProjectHighlight(5);
        }, 23000));
        // Area↔Project linking at 2:00 = 27s rel
        timeouts.push(setTimeout(() => setProjectHighlight(6), 27000));
        // Velocity gauge at 2:06 = 33s rel
        timeouts.push(setTimeout(() => setProjectHighlight(7), 33000));
        // "doesn't move the needle" velocimeter at 2:09 = 36s rel
        timeouts.push(setTimeout(() => setProjectHighlight(8), 36000));
        // Project deletion at 2:12 = 39s rel... but let's give it time before step change
        timeouts.push(setTimeout(() => setProjectHighlight(9), 39000));

        return () => {
            timeouts.forEach(t => clearTimeout(t));
            setProjectPhase(0);
            setProjectHighlight(null);
        };
    }, [step]);

    // Sequence timing (if using activeTime from video)
    useEffect(() => {
        if (activeTime === 0) return;

        if (activeTime < 30) setStep('cortex');
        else if (activeTime < 93) setStep('zoom-areas');
        else if (activeTime < 132) setStep('zoom-projects');
        else if (activeTime < 145) setStep('zoom-tasks');
        else if (activeTime < 165) setStep('zoom-notes-resources');
        else if (activeTime < 185) setStep('zoom-inbox');
        else if (activeTime < 210) setStep('zoom-archive');
        else setStep('lockdown');
    }, [activeTime]);

    // Auto-play demo if no activeTime provided
    useEffect(() => {
        if (activeTime !== 0) return;

        // Custom durations per step (in ms)
        const stageDurations: { step: AnimStep; duration: number }[] = [
            { step: 'cortex', duration: 30000 },
            { step: 'zoom-areas', duration: 63000 },
            { step: 'zoom-projects', duration: 39000 },
            { step: 'zoom-tasks', duration: 7000 },
            { step: 'zoom-notes-resources', duration: 7000 },
            { step: 'zoom-inbox', duration: 7000 },
            { step: 'zoom-archive', duration: 7000 },
            { step: 'lockdown', duration: 7000 },
        ];

        let currentIndex = 0;
        let timeout: NodeJS.Timeout;

        const scheduleNext = () => {
            const current = stageDurations[currentIndex];
            timeout = setTimeout(() => {
                currentIndex = (currentIndex + 1) % stageDurations.length;
                setStep(stageDurations[currentIndex].step);
                scheduleNext();
            }, current.duration);
        };

        scheduleNext();

        return () => clearTimeout(timeout);
    }, [activeTime]);

    if (!isMounted) return <div className="min-h-[400px] md:min-h-[600px] w-full bg-black rounded-2xl md:rounded-[3rem]" />;

    return (
        <div className="relative w-full max-w-6xl min-h-[500px] md:min-h-[600px] lg:aspect-[16/10] bg-black border border-white/10 rounded-2xl md:rounded-[3rem] overflow-hidden shadow-2xl group selection:bg-amber-500/30">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

            {/* Status Bar */}
            <div className="absolute top-0 left-0 w-full h-10 md:h-12 border-b border-white/5 bg-black/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 z-50">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                        <div className="w-2 h-2 rounded-full bg-green-500/50" />
                    </div>
                    <span className={`${bebas.className} text-[8px] md:text-[10px] tracking-[0.3em] text-white/20 uppercase hidden sm:block`}>
                        IMPROVE / SECOND BRAIN / CORTEX_v1.0
                    </span>
                </div>
                <div className="flex items-center gap-4 md:gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-[7px] md:text-[8px] font-black tracking-widest text-white/40 uppercase">Neural Active</span>
                    </div>
                    <Clock className="w-3 h-3 text-white/20 hidden sm:block" />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* ═══ STEP 1: THE GOD-VIEW CORTEX (0:00 - 0:30) ═══ */}
                {step === 'cortex' && (
                    <motion.div
                        key="cortex"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                        className="absolute inset-0 p-4 md:p-8 pt-16 md:pt-20 flex flex-col items-center justify-center"
                    >
                        {/* Central Brain Node */}
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.8, type: "spring" }}
                            className="relative z-10 mb-6 md:mb-8"
                        >
                            <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-[#1A1A1A] border-2 border-amber-500/50 flex items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.3)]">
                                <Brain className="w-10 h-10 md:w-14 md:h-14 text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" />
                            </div>
                            <motion.div
                                animate={{ scale: [1, 1.3, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-full border border-amber-500/20"
                            />
                        </motion.div>

                        {/* Orbiting Micro-Apps */}
                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2 md:gap-3 w-full max-w-3xl px-2">
                            {microApps.map((app, i) => {
                                const isHighlighted = highlightedAppIndex === i;
                                return (
                                    <motion.div
                                        key={app.id}
                                        initial={{ opacity: 0, y: 30, scale: 0 }}
                                        animate={{
                                            opacity: 1,
                                            y: isHighlighted ? -12 : 0,
                                            scale: isHighlighted ? 1.15 : 1,
                                        }}
                                        transition={isHighlighted
                                            ? { duration: 0.3, type: "spring", damping: 12, stiffness: 200 }
                                            : { delay: 0.5 + i * 0.15, type: "spring", damping: 12 }
                                        }
                                        className="flex flex-col items-center gap-1 md:gap-2 group"
                                    >
                                        <div
                                            className={cn(
                                                "w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border bg-[#0A0A0A] flex items-center justify-center transition-all duration-300",
                                                isHighlighted
                                                    ? `border-white/40 scale-110`
                                                    : "border-white/10 shadow-lg"
                                            )}
                                            style={isHighlighted ? {
                                                boxShadow: `0 0 30px ${app.accentColor}50, 0 0 60px ${app.accentColor}25, 0 8px 25px rgba(0,0,0,0.5)`,
                                                borderColor: `${app.accentColor}80`,
                                            } : undefined}
                                        >
                                            <app.icon className={cn("w-4 h-4 md:w-6 md:h-6 transition-all duration-300", app.color, isHighlighted && "drop-shadow-lg")} />
                                        </div>
                                        <span className={cn(
                                            "text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all duration-300",
                                            isHighlighted ? "text-white" : "text-white/30"
                                        )}>{app.title}</span>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Timed Subtitle Text — synced with audio */}
                        <div className="mt-6 md:mt-10 text-center min-h-[80px] md:min-h-[100px] flex items-center justify-center">
                            <AnimatePresence mode="wait">
                                {/* "UNIFIED DIGITAL CORTEX" + sub-words — appears at 2s */}
                                {highlightedTextIndex === 0 && (
                                    <motion.div
                                        key="text-cortex"
                                        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                                        transition={{ duration: 0.6 }}
                                        className="flex flex-col items-center gap-2 md:gap-3"
                                    >
                                        <p className={`${bebas.className} text-2xl md:text-4xl lg:text-5xl text-white tracking-tight`}>
                                            UNIFIED DIGITAL CORTEX
                                        </p>
                                        {/* Sub-words: capture, process, secure */}
                                        <div className="flex items-center gap-2 md:gap-4">
                                            {['capture', 'process', 'secure'].map((word, idx) => (
                                                <AnimatePresence key={word}>
                                                    {visibleSubWords.includes(idx) && (
                                                        <motion.span
                                                            initial={{ opacity: 0, y: 10, scale: 0.8 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            transition={{ duration: 0.4, type: 'spring', damping: 15 }}
                                                            className={`${bebas.className} text-lg md:text-2xl lg:text-3xl text-amber-500 tracking-wide`}
                                                        >
                                                            {word}{idx < 2 && <span className="text-white/20 ml-2 md:ml-4">·</span>}
                                                        </motion.span>
                                                    )}
                                                </AnimatePresence>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                {/* "Seven Micro-Apps" — appears at 10s */}
                                {highlightedTextIndex === 1 && (
                                    <motion.p
                                        key="text-microapps"
                                        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                                        transition={{ duration: 0.6 }}
                                        className={`${bebas.className} text-xl md:text-3xl lg:text-4xl text-amber-500 tracking-tight`}
                                    >
                                        Seven Micro-Apps
                                    </motion.p>
                                )}
                                {/* "One Intellectual Fortress" — appears at 25s */}
                                {highlightedTextIndex === 2 && (
                                    <motion.p
                                        key="text-fortress"
                                        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                                        transition={{ duration: 0.6 }}
                                        className={`${bebas.className} text-2xl md:text-4xl lg:text-5xl text-white tracking-tight`}
                                    >
                                        One Intellectual Fortress
                                    </motion.p>
                                )}
                                {/* "Total Cognitive Mastery" — appears at 27s */}
                                {highlightedTextIndex === 3 && (
                                    <motion.p
                                        key="text-mastery"
                                        initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
                                        transition={{ duration: 0.6 }}
                                        className={`${bebas.className} text-2xl md:text-4xl lg:text-5xl text-amber-500 tracking-tight`}
                                    >
                                        Total Cognitive Mastery
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}

                {/* ═══ STEP 2: AREAS — THE FOUNDATION (0:30 - 1:33) ═══ */}
                {step === 'zoom-areas' && (
                    <AreaStep areaTextIndex={areaTextIndex} areaHighlightIndex={areaHighlightIndex} areaPhase={areaPhase} narrativeHighlight={narrativeHighlight} showProjectCard={showProjectCard} />
                )}

                {/* ═══ STEP 3: PROJECTS — THE ENGINE (1:33 - 2:12) ═══ */}
                {step === 'zoom-projects' && (
                    <ProjectStep projectPhase={projectPhase} projectHighlight={projectHighlight} />
                )}

                {/* ═══ STEP 4: TASKS — THE EXECUTION LAYER (1:45 - 2:25) ═══ */}
                {step === 'zoom-tasks' && (
                    <motion.div
                        key="tasks"
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 p-4 md:p-8 lg:p-12 pt-16 md:pt-20 lg:pt-24 bg-[#050505] flex flex-col md:flex-row gap-4 md:gap-8 lg:gap-12"
                    >
                        <div className="md:w-2/5 flex flex-col justify-center gap-4 md:gap-8">
                            <div className="space-y-1 md:space-y-2">
                                <h3 className={`${bebas.className} text-5xl md:text-7xl lg:text-8xl leading-none text-white`}>TASKS</h3>
                                <p className="text-amber-500 font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs">Execution Layer Protocol</p>
                            </div>

                            {/* AI Micro-task Breakdown */}
                            <div className="space-y-2 md:space-y-4">
                                <div className="flex items-center gap-2 mb-2 md:mb-4">
                                    <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-400" />
                                    <span className="text-[8px] md:text-[10px] font-black tracking-widest text-amber-400/60 uppercase">AI Micro-Task Breakdown</span>
                                </div>
                                {[
                                    { task: 'Research competitor pricing', time: '5 min', done: true },
                                    { task: 'Draft landing page copy', time: '5 min', done: true },
                                    { task: 'Set up analytics dashboard', time: '5 min', done: false },
                                    { task: 'Configure payment gateway', time: '5 min', done: false },
                                    { task: 'A/B test signup flow', time: '5 min', done: false },
                                ].map((t, i) => (
                                    <motion.div
                                        key={t.task}
                                        initial={{ x: -30, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.12 }}
                                        className={cn(
                                            "flex items-center gap-2 md:gap-4 p-2.5 md:p-4 rounded-lg md:rounded-xl border transition-all",
                                            t.done
                                                ? "border-emerald-500/20 bg-emerald-500/5"
                                                : "border-white/5 bg-white/[0.02]"
                                        )}
                                    >
                                        <CheckCircle2 className={cn("w-4 h-4 md:w-5 md:h-5 shrink-0", t.done ? "text-emerald-400" : "text-white/10")} />
                                        <span className={cn("text-[10px] md:text-sm flex-1", t.done ? "text-white/40 line-through" : "text-white font-medium")}>{t.task}</span>
                                        <span className="text-[8px] md:text-[10px] font-mono text-white/20 hidden sm:block">{t.time}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Live Velocity Panel */}
                        <div className="flex-1 flex flex-col gap-4 md:gap-6 justify-center">
                            <div className="p-4 md:p-8 bg-[#0A0A0A] rounded-2xl md:rounded-[2.5rem] border border-white/5 space-y-4 md:space-y-6">
                                <div className="text-center space-y-1 md:space-y-2">
                                    <span className="text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.5em] text-amber-500/50 uppercase">Real-Time Velocity</span>
                                    <div className={`${bebas.className} text-6xl md:text-8xl lg:text-9xl text-white leading-none`}>40%</div>
                                </div>
                                <div className="h-3 md:h-4 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '40%' }}
                                        transition={{ duration: 2, ease: "circOut" }}
                                        className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full relative"
                                    >
                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:20px_20px]" />
                                    </motion.div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 md:gap-4 pt-3 md:pt-4 border-t border-white/5">
                                    {[
                                        { label: 'Done', value: '2/5', color: 'text-emerald-400' },
                                        { label: 'In Progress', value: '1', color: 'text-amber-400' },
                                        { label: 'Remaining', value: '2', color: 'text-white/40' },
                                    ].map(s => (
                                        <div key={s.label} className="text-center">
                                            <span className="block text-[7px] md:text-[8px] font-black tracking-widest text-white/20 uppercase mb-1">{s.label}</span>
                                            <span className={cn("font-mono text-sm md:text-lg", s.color)}>{s.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="items-center justify-center gap-3 text-[8px] md:text-[10px] font-black tracking-widest text-white/15 uppercase hidden md:flex">
                                <Zap className="w-3 h-3" />
                                <span>Every Checkmark Pulses Through the System</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ STEP 5: NOTES & RESOURCES — KNOWLEDGE ENGINE (2:25 - 2:45) ═══ */}
                {step === 'zoom-notes-resources' && (
                    <motion.div
                        key="notes-resources"
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 p-4 md:p-8 lg:p-12 pt-16 md:pt-20 lg:pt-24 bg-[#050505] flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-12"
                    >
                        {/* Resources Side */}
                        <div className="md:w-[45%] flex flex-col">
                            <div className="mb-4 md:mb-8 space-y-1 md:space-y-2">
                                <h3 className={`${bebas.className} text-3xl md:text-5xl lg:text-6xl leading-none text-white`}>RESOURCES</h3>
                                <p className="text-blue-500 font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[9px] md:text-xs">Intelligence Library</p>
                            </div>
                            <div className="flex-1 space-y-2 md:space-y-4">
                                {[
                                    { title: 'Atomic Habits — James Clear', type: 'Book', ai: true },
                                    { title: 'Y Combinator Startup School', type: 'Course', ai: true },
                                    { title: 'Naval Ravikant Almanack', type: 'PDF', ai: false },
                                ].map((r, i) => (
                                    <motion.div
                                        key={r.title}
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.15 }}
                                        className="p-3 md:p-5 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02] flex items-center gap-3 md:gap-4 group hover:bg-white/5 transition-all"
                                    >
                                        <BookOpenCheck className="w-4 h-4 md:w-5 md:h-5 text-blue-400 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <span className="text-[10px] md:text-sm font-bold text-white block truncate">{r.title}</span>
                                            <span className="block text-[8px] md:text-[9px] text-white/20 font-mono uppercase mt-0.5 md:mt-1">{r.type}</span>
                                        </div>
                                        {r.ai && (
                                            <div className="px-1.5 md:px-2 py-0.5 md:py-1 bg-amber-500/10 rounded-full flex items-center gap-1 shrink-0">
                                                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-amber-400" />
                                                <span className="text-[7px] md:text-[8px] font-black text-amber-400 tracking-widest hidden sm:block">AI DIGEST</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Arrow Connection */}
                        <div className="flex md:flex-col items-center justify-center gap-3 md:gap-6 py-2 md:py-0">
                            <motion.div
                                animate={{ x: [0, 8, 0], y: [0, 0, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="hidden md:block"
                            >
                                <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-amber-500/40" />
                            </motion.div>
                            <motion.div
                                animate={{ y: [0, 8, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="md:hidden"
                            >
                                <ArrowDown className="w-6 h-6 text-amber-500/40" />
                            </motion.div>
                            <span className="text-[7px] md:text-[8px] font-black tracking-widest text-amber-500/30 uppercase md:[writing-mode:vertical-lr] md:rotate-180">
                                AI Distills
                            </span>
                        </div>

                        {/* Notes Side */}
                        <div className="md:w-[45%] flex flex-col">
                            <div className="mb-4 md:mb-8 space-y-1 md:space-y-2">
                                <h3 className={`${bebas.className} text-3xl md:text-5xl lg:text-6xl leading-none text-white`}>NOTES</h3>
                                <p className="text-purple-500 font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[9px] md:text-xs">Wisdom Repository</p>
                            </div>
                            <div className="flex-1 space-y-2 md:space-y-4">
                                {[
                                    { title: 'Key Principles: Habit Formation', tags: ['Psychology', 'Growth'], lines: 4 },
                                    { title: 'Startup Playbook: GTM Strategy', tags: ['Business', 'Revenue'], lines: 6 },
                                    { title: 'Wealth Compounding Framework', tags: ['Finance', 'Strategy'], lines: 3 },
                                ].map((n, i) => (
                                    <motion.div
                                        key={n.title}
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.3 + i * 0.15 }}
                                        className="p-3 md:p-5 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02] space-y-2 md:space-y-3"
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <span className="text-[10px] md:text-sm font-bold text-white">{n.title}</span>
                                            <NotebookPen className="w-3 h-3 md:w-4 md:h-4 text-purple-400 shrink-0" />
                                        </div>
                                        {/* Fake text lines */}
                                        <div className="space-y-1 md:space-y-1.5 hidden sm:block">
                                            {Array.from({ length: n.lines }).map((_, li) => (
                                                <div key={li} className="h-1 rounded-full bg-white/5" style={{ width: `${60 + Math.random() * 35}%` }} />
                                            ))}
                                        </div>
                                        <div className="flex gap-1.5 md:gap-2">
                                            {n.tags.map(tag => (
                                                <span key={tag} className="text-[7px] md:text-[8px] px-1.5 md:px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold tracking-widest uppercase">{tag}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ STEP 6: INBOX — CAPTURE ENGINE (2:45 - 3:05) ═══ */}
                {step === 'zoom-inbox' && (
                    <motion.div
                        key="inbox"
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 p-4 md:p-8 lg:p-12 pt-16 md:pt-20 lg:pt-24 bg-[#050505] flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-4 md:mb-12">
                            <div className="space-y-1 md:space-y-2">
                                <h3 className={`${bebas.className} text-5xl md:text-7xl lg:text-8xl leading-none text-white`}>INBOX</h3>
                                <p className="text-rose-500 font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs">Rapid Capture Protocol</p>
                            </div>
                            <div className="p-2 md:p-4 bg-rose-500/10 rounded-xl md:rounded-2xl border border-rose-500/20 text-center">
                                <span className="block text-[7px] md:text-[8px] text-rose-500/50 font-black tracking-widest uppercase mb-1">Unprocessed</span>
                                <span className={`${bebas.className} text-2xl md:text-4xl text-rose-400`}>7</span>
                            </div>
                        </div>

                        {/* Incoming Items Animation */}
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                            <div className="space-y-2 md:space-y-4">
                                <span className="text-[9px] md:text-[10px] font-black tracking-widest text-white/15 uppercase">Incoming Stream</span>
                                {[
                                    { text: '"Call mentor about Q2 projections"', type: 'Thought', icon: Brain },
                                    { text: 'https://ycombinator.com/startup-ideas', type: 'Link', icon: BookOpenCheck },
                                    { text: '"Review quarterly goals before Friday"', type: 'Task Idea', icon: ListTodo },
                                    { text: '"Morning routine is slipping — fix it"', type: 'Personal', icon: Shield },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.text}
                                        initial={{ x: -60, opacity: 0, scale: 0.8 }}
                                        animate={{ x: 0, opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.2, type: "spring", damping: 15 }}
                                        className="p-3 md:p-5 rounded-xl md:rounded-2xl border border-rose-500/10 bg-rose-500/[0.03] flex items-start gap-3 md:gap-4"
                                    >
                                        <item.icon className="w-4 h-4 md:w-5 md:h-5 text-rose-400 shrink-0 mt-0.5" />
                                        <div className="min-w-0">
                                            <p className="text-[10px] md:text-sm text-white/80 italic truncate">{item.text}</p>
                                            <span className="text-[8px] md:text-[9px] font-mono text-rose-400/40 uppercase mt-0.5 md:mt-1 block">{item.type}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Triage Visualization */}
                            <div className="flex flex-col items-center justify-center bg-white/[0.01] rounded-2xl md:rounded-[2.5rem] border border-white/5 p-4 md:p-8 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 via-transparent to-transparent" />
                                <div className="relative z-10 text-center space-y-4 md:space-y-6">
                                    <Inbox className="w-10 h-10 md:w-16 md:h-16 text-rose-500/20 mx-auto" />
                                    <div className="space-y-2 md:space-y-3">
                                        <p className={`${bebas.className} text-xl md:text-3xl text-white/80`}>NOTHING IS LOST</p>
                                        <p className="text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.4em] text-white/20 uppercase">
                                            Everything is triaged
                                        </p>
                                    </div>
                                    <div className="flex gap-2 md:gap-3 justify-center flex-wrap">
                                        {['Categorize', 'Link', 'Execute'].map(action => (
                                            <span key={action} className="px-2.5 md:px-4 py-1.5 md:py-2 bg-white/5 border border-white/10 rounded-full text-[8px] md:text-[9px] font-black tracking-widest text-white/30 uppercase">
                                                {action}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ STEP 7: ARCHIVE — THE VAULT (3:05 - 3:30) ═══ */}
                {step === 'zoom-archive' && (
                    <motion.div
                        key="archive"
                        initial={{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }}
                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="absolute inset-0 p-4 md:p-8 lg:p-12 pt-16 md:pt-20 lg:pt-24 bg-[#050505] flex flex-col"
                    >
                        <div className="flex justify-between items-start mb-6 md:mb-16">
                            <div className="space-y-1 md:space-y-2">
                                <h3 className={`${bebas.className} text-5xl md:text-7xl lg:text-8xl leading-none text-white`}>ARCHIVE</h3>
                                <p className="text-cyan-500 font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase text-[10px] md:text-xs">Mission History Vault</p>
                            </div>
                            <div className="flex items-center gap-2 md:gap-4">
                                <div className="p-2 md:p-3 bg-white/5 border border-white/10 rounded-lg md:rounded-xl flex items-center gap-1.5 md:gap-2">
                                    <Lock className="w-3 h-3 md:w-4 md:h-4 text-cyan-400" />
                                    <span className="text-[8px] md:text-[10px] font-black tracking-widest text-white/40 uppercase">Secured</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
                            {/* Archived Items */}
                            <div className="space-y-2 md:space-y-4">
                                <span className="text-[9px] md:text-[10px] font-black tracking-widest text-white/15 uppercase">Completed Missions</span>
                                {[
                                    { name: 'Q1 Revenue Sprint', type: 'Project', date: 'Mar 2026' },
                                    { name: 'MVP Launch Phase 1', type: 'Project', date: 'Feb 2026' },
                                    { name: 'Brand Guidelines v2', type: 'Note', date: 'Jan 2026' },
                                    { name: 'Competitive Analysis', type: 'Resource', date: 'Dec 2025' },
                                ].map((item, i) => (
                                    <motion.div
                                        key={item.name}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: i * 0.12 }}
                                        className="p-3 md:p-5 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-between group hover:bg-white/5 transition-all"
                                    >
                                        <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                            <Archive className="w-4 h-4 md:w-5 md:h-5 text-cyan-400/40 shrink-0" />
                                            <div className="min-w-0">
                                                <span className="text-[10px] md:text-sm font-bold text-white/60 block truncate">{item.name}</span>
                                                <span className="block text-[8px] md:text-[9px] text-white/20 font-mono">{item.type} · {item.date}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1.5 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <button className="p-1.5 md:p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 transition-colors">
                                                <RotateCcw className="w-2.5 h-2.5 md:w-3 md:h-3 text-cyan-400" />
                                            </button>
                                            <button className="p-1.5 md:p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors">
                                                <Trash2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-400" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Vault Visualization */}
                            <div className="flex flex-col items-center justify-center bg-cyan-500/[0.02] rounded-2xl md:rounded-[2.5rem] border border-cyan-500/10 relative overflow-hidden p-6 md:p-0 min-h-[200px]">
                                <motion.div
                                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute inset-0 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent"
                                />
                                <div className="relative z-10 text-center space-y-4 md:space-y-6">
                                    <Shield className="w-12 h-12 md:w-20 md:h-20 text-cyan-500/20 mx-auto" />
                                    <p className={`${bebas.className} text-2xl md:text-4xl text-white/60`}>YOUR DATA<br />SERVES YOU</p>
                                    <p className="text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] text-cyan-400/40 uppercase max-w-[200px] mx-auto">
                                        Master Architect Control: Purge or Reassign
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ═══ STEP 8: BRAND LOCKDOWN (3:30 - 3:45) ═══ */}
                {step === 'lockdown' && (
                    <motion.div
                        key="lockdown"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 flex flex-col items-center justify-center bg-[#030303]"
                    >
                        {/* Pulse Ring */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: [0, 2, 0] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
                            className="absolute w-40 h-40 md:w-64 md:h-64 rounded-full border border-amber-500/10"
                        />

                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring", damping: 10 }}
                            className="relative z-10 text-center space-y-6 md:space-y-8 px-4"
                        >
                            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto rounded-full bg-[#1A1A1A] border border-amber-500/40 flex items-center justify-center shadow-[0_0_60px_rgba(245,158,11,0.2)]">
                                <Brain className="w-8 h-8 md:w-10 md:h-10 text-amber-500" />
                            </div>

                            <div className="space-y-3 md:space-y-4">
                                <p className={`${bebas.className} text-4xl md:text-6xl lg:text-7xl text-white tracking-tight`}>
                                    SECOND BRAIN
                                </p>
                                <p className="text-[8px] md:text-[10px] font-black tracking-[0.4em] md:tracking-[0.6em] text-white/20 uppercase">
                                    by IMPROVE
                                </p>
                            </div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.5 }}
                                className="flex items-center gap-2 md:gap-3 justify-center"
                            >
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] md:text-[10px] font-black tracking-[0.3em] md:tracking-[0.5em] text-emerald-500/60 uppercase">
                                    System: Fully Operational
                                </span>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
