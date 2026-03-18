'use client'

import { useState, useRef, useMemo, useEffect } from 'react'
import { Bebas_Neue } from "@/lib/font-shim";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import { 
    ArrowRight, 
    ChevronDown, 
    Target, 
    Activity, 
    Shield, 
    Cpu, 
    Zap,
    Brain,
    Palette,
    Folder,
    Briefcase,
    DollarSign,
    Heart,
    Play,
} from "lucide-react";
import { ImproveLogo } from "@/components/ui/improve-logo";
import { Menu, MenuItem } from "@/components/ui/navbar-menu";
import { BodySaaSAnimation } from "@/components/ui/body-saas-animation";

const bebas = Bebas_Neue({ subsets: ["latin"] });

const systems = [
    {
        id: "mind",
        icon: Brain,
        name: "Mind & Emotions",
        tagline: "The Inner Citadel",
        description: "Algorithmic emotional resilience and psychological entropy shielding.",
        coreFeature: "Stoic Reflection Frameworks",
        coreDescription: "Construct an unshakeable psychological fortress. Map emotional volatility and anchor your focus through Daily Journaling, Gratitude Logs, and Mood Surveillance.",
        capabilities: ["Volatility Mapping", "Stoic Reflection", "Entropy Shielding", "Clarity Audits"],
        outcome: "Unshakeable Peace",
        stats: [{ label: "Entropy", value: "-80%" }, { label: "Stability", value: "Maximum" }],
        features: ["Daily Journal", "Gratitude Anchors", "Mood Tracking", "Focus Sanctuary"],
        color: "#ffffff"
    },
    {
        id: "body",
        icon: Activity,
        name: "Body",
        tagline: "The Temple of Excellence",
        description: "Biological optimization and physiological surveillance of your physical vessel.",
        coreFeature: "Dynamic Routine Architect",
        coreDescription: "Design industrial-grade training blocks with minimal friction. Map your biological evolution through Routine Builder, Recovery Surveillance, and meticulous Diet logging.",
        capabilities: ["Program Mapping", "Macro Surveillance", "Recovery Orchestration", "Fuel Quality Logging"],
        outcome: "Total Physical Command",
        stats: [{ label: "Capacity", value: "Peak" }, { label: "Readiness", value: "Optimal" }],
        features: ["HRV Tracking", "Metabolic Sync", "Neural Recovery", "Load Balancing"],
        color: "#ffffff"
    },
    {
        id: "money",
        icon: DollarSign,
        name: "Money",
        tagline: "The Architecture of Wealth",
        description: "Institutional-grade liquidity intelligence and wealth orchestration.",
        coreFeature: "Liquidity Radar",
        coreDescription: "A multi-layered financial command center. Track net worth velocity, asset distribution, and cash flow momentum across brokerage, savings, and expense modules.",
        capabilities: ["Velocity Tracking", "Asset Distribution", "Net Worth Mapping", "Institutional Guardrails"],
        outcome: "Architectural Wealth",
        stats: [{ label: "Growth", value: "Exponential" }, { label: "Risk", value: "Minimized" }],
        features: ["Investment Tracking", "Budget Planning", "Income Velocity", "Subscription Shield"],
        color: "#ffffff"
    },
    {
        id: "work",
        icon: Briefcase,
        name: "Work",
        tagline: "The Craft of Mastery",
        description: "Strategic output orchestration and mission-oriented career mastery.",
        coreFeature: "Deep Work Orchestration",
        coreDescription: "Align intensive projects with long-term legacy. Strategic task architecture and time-tracking infrastructure designed for world-class craftsmanship.",
        capabilities: ["Mission Alignment", "Project Triage", "Legacy Tracking", "Strategic Output"],
        outcome: "Craftsman Mastery",
        stats: [{ label: "Impact", value: "High" }, { label: "Focus", value: "Maximum" }],
        features: ["Project Deadlines", "Time Tracking", "Notebook Sync", "Task Compounding"],
        color: "#ffffff"
    },
    {
        id: "productivity",
        icon: Zap,
        name: "Productivity",
        tagline: "The Engine of Achievement",
        description: "Cognitive capture and momentum scaling for the high-performance mind.",
        coreFeature: "Atomic Habit Loops",
        coreDescription: "GTD-powered habit architecture that eliminates decision fatigue. Systematic momentum scaling through Atomic Habits, Pomodoro sessions, and Periodic Reviews.",
        capabilities: ["Atomic Momentum", "Decision Offloading", "Frictionless Capture", "Performance Audits"],
        outcome: "Infinite Momentum",
        stats: [{ label: "Throughput", value: "3x" }, { label: "Clarity", value: "Absolute" }],
        features: ["Habit Tracker", "Pomodoro Engine", "GTD Reviews", "Projection Maps"],
        color: "#ffffff"
    },
    {
        id: "relationships",
        icon: Heart,
        name: "Relationships",
        tagline: "The Network of Influence",
        description: "Social capital repository and intentional connection architecture.",
        coreFeature: "Social Capital Repository",
        coreDescription: "Strategic networking and intentional relationship management. Monitor connection velocity and network health through the Context Vault and Relationship Ledger.",
        capabilities: ["Connection Velocity", "Network Health", "Social Archiving", "Intentional Nudges"],
        outcome: "Strategic Influence",
        stats: [{ label: "Network", value: "Resilient" }, { label: "Depth", value: "Tier 1" }],
        features: ["Contact Directory", "Interaction Logs", "Meeting Triage", "Trust Ledger"],
        color: "#ffffff"
    },
    {
        id: "legacy",
        icon: Palette,
        name: "Legacy & Fun",
        tagline: "The Art of Living",
        description: "Life experience engine and novelty scoring to engineer a life that echoes.",
        coreFeature: "Life Experience Engine",
        coreDescription: "Strategic adventure planning and novelty scoring to maximize memory formation. Orchestrate high-impact experiences through Bucket Lists and Travel Architecture.",
        capabilities: ["Novelty Scoring", "Memory Formation", "Experience Design", "Legacy Mapping"],
        outcome: "Life Without Regret",
        stats: [{ label: "Richness", value: "Compounding" }, { label: "Novelty", value: "Continuous" }],
        features: ["Bucket List", "Travel Planner", "Memory Anchoring", "Joy Optimization"],
        color: "#ffffff"
    },
    {
        id: "second-brain",
        icon: Folder,
        name: "Second Brain",
        tagline: "The Library of Self",
        description: "Relational knowledge graph and externalized genius.",
        coreFeature: "PARA Knowledge Architecture",
        coreDescription: "A multi-layered library of self. Generate non-linear insight from compounding notes, research materials, and relational task synthesis.",
        capabilities: ["PARA Architecture", "Non-linear Insights", "Compounding Wisdom", "Externalized Focus"],
        outcome: "Externalized Genius",
        stats: [{ label: "Retrieval", value: "<100ms" }, { label: "Wisdom", value: "Compounding" }],
        features: ["Note Repository", "Task Synthesis", "Resource Archive", "Inbox Capture"],
        color: "#ffffff"
    }
];

// Reusable Kinetic Text Components
const ImpactSlam = ({ text, color = "#ffffff", delay = 0, isMobile = false }: { text: string; color?: string; delay?: number; isMobile?: boolean }) => (
    <motion.h2
        initial={{ scale: 3, opacity: 0, filter: 'blur(20px)' }}
        whileInView={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: 'easeOut', delay }}
        className={`${bebas.className} font-black tracking-tighter text-center leading-[0.85] w-full`}
        style={{ color, fontSize: isMobile ? '4rem' : '8rem' }}
    >
        {text.includes('\n') ? text.split('\n').map((l, i) => <div key={i}>{l}</div>) : text}
    </motion.h2>
);

const BlurSlam = ({ text, color = "#ffffff", delay = 0 }: { text: string; color?: string; delay?: number }) => (
    <div className="flex flex-col items-center">
        {text.split('\n').map((line, idx) => (
            <motion.h2
                key={idx}
                initial={{ filter: 'blur(20px)', scale: 1.5, opacity: 0 }}
                whileInView={{ filter: 'blur(0px)', scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, type: 'spring', damping: 10, delay: delay + (idx * 0.1) }}
                className={`${bebas.className} text-4xl md:text-8xl font-bold tracking-tight italic text-center leading-[0.9] md:leading-[0.85] w-full`}
                style={{ color }}
            >
                {line}
            </motion.h2>
        ))}
    </div>
);

const GoldReveal = ({ text, delay = 0 }: { text: string; delay?: number }) => (
    <motion.h2
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        whileInView={{
            opacity: 1,
            y: 0,
            scale: 1,
            textShadow: "0 0 40px #fbbf24"
        }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut", delay }}
        className={`${bebas.className} text-5xl md:text-[8rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-yellow-500 to-yellow-900 tracking-tight text-center`}
    >
        {text}
    </motion.h2>
);

const Typewriter = ({ text, color = "#ffffff", delay = 0 }: { text: string; color?: string; delay?: number }) => (
    <motion.div className="flex gap-2 justify-center flex-wrap">
        {text.split("").map((c, i) => (
            <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: delay + (i * 0.04) }}
                className={`${bebas.className} text-xl md:text-5xl font-bold tracking-tight`}
                style={{ color }}
            >
                {c === " " ? "\u00A0" : c}
            </motion.span>
        ))}
    </motion.div>
);

export default function SalesPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [activeSystemId, setActiveSystemId] = useState<string>(systems[0].id);
    const [showDemo, setShowDemo] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset demo state when switching systems
    useEffect(() => {
        setShowDemo(false);
    }, [activeSystemId]);

    const activeSystem = useMemo(() => 
        systems.find(s => s.id === activeSystemId) || systems[0],
    [activeSystemId]);

    return (
        <div 
            className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-white/30" 
            ref={containerRef}
        >
            {/* Background Polish */}
            <div className="fixed inset-0 z-0 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.03)_0%,_transparent_70%)]" />
            
            {/* Grid Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0">
                <svg width="100%" height="100%">
                    <pattern id="sales-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="white" strokeWidth="0.5" />
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#sales-grid)" />
                </svg>
            </div>

            <div className="relative z-10">
                {/* 1. KINETIC INTRO HERO */}
                <section className="min-h-screen flex flex-col items-center justify-center p-6 gap-24 py-32">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center gap-12"
                    >
                        <ImproveLogo hero className="mb-[-50px] md:mb-[-100px]" />
                        
                        <div className="space-y-4">
                            <ImpactSlam text="THE MASTER SYSTEM" color="#ffffff" isMobile={isMobile} />
                            <BlurSlam text="AUTOMATE HUMAN EXCELLENCE" color="#3b82f6" delay={0.4} />
                            <GoldReveal text="INFINITE POTENTIAL" delay={0.8} />
                            <Typewriter text="v1.0.4 CORE ARCHITECTURE DEPLOYED" color="rgba(255,255,255,0.4)" delay={1.4} />
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 2.5 }}
                            className="flex flex-col items-center mt-12"
                        >
                             <Link href="/register">
                                <Button size="lg" className="h-16 md:h-24 md:px-20 bg-white text-black hover:bg-neutral-200 rounded-none font-black uppercase tracking-[0.4em] text-xs md:text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_80px_rgba(255,255,255,0.2)]">
                                    Initialize My Journey
                                </Button>
                            </Link>
                            <span className="mt-8 text-white/20 text-[10px] tracking-[0.5em] uppercase font-light animate-bounce">
                                Explore the infrastructure
                            </span>
                        </motion.div>
                    </motion.div>
                </section>

                {/* 2. INTERACTIVE SYSTEM SHOWCASE (THE RESTORED ANIMATION) */}
                <section id="showcase" className="py-24 md:py-40 px-6 border-t border-white/5 relative">
                    <div className="max-w-7xl mx-auto space-y-16 md:space-y-32">
                        <div className="text-center">
                            <ImpactSlam text="THE EIGHT DIMENSIONS" color="#ffffff" isMobile={isMobile} />
                            <Typewriter text="SELECT A MODULE TO EXPLORE" color="#3b82f6" delay={0.2} />
                        </div>

                        {/* Sticky Navigation Menu */}
                        <div className="sticky top-24 z-50 flex justify-center py-4">
                            <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full p-2">
                                <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[90vw] md:max-w-none">
                                    {systems.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setActiveSystemId(s.id)}
                                            className={`px-4 md:px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                                activeSystemId === s.id 
                                                ? 'bg-white text-black scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]' 
                                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            {s.name}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>

                        {/* Content Switcher */}
                        <div className="max-w-6xl mx-auto min-h-[650px] flex items-center justify-center relative">
                            <AnimatePresence mode="wait">
                                {showDemo && activeSystemId === 'body' ? (
                                    <motion.div
                                        key="body-demo"
                                        initial={{ opacity: 0, scale: 1.1, filter: 'blur(30px)' }}
                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, scale: 0.9, filter: 'blur(30px)' }}
                                        className="w-full relative"
                                    >
                                        <BodySaaSAnimation />
                                        <button 
                                            onClick={() => setShowDemo(false)}
                                            className="absolute top-4 right-8 z-[60] bg-white/10 hover:bg-white/20 text-white/40 hover:text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Return to Specs
                                        </button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={activeSystemId}
                                        initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                        transition={{ duration: 0.5, ease: "circOut" }}
                                        className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-center"
                                    >
                                        {/* Left Side: Large Icon & Title */}
                                        <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-8">
                                            <div className="p-8 md:p-12 bg-white/5 border border-white/10 rounded-[3rem] shadow-2xl relative group">
                                                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
                                                <activeSystem.icon size={isMobile ? 64 : 120} className="text-white relative z-10" />
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <p className="text-blue-500 font-bold tracking-[0.5em] uppercase text-xs">
                                                    {activeSystem.tagline}
                                                </p>
                                                <h3 className={`${bebas.className} text-6xl md:text-[8rem] font-black leading-none tracking-tighter`}>
                                                    {activeSystem.name}
                                                </h3>
                                                <p className="text-xl md:text-3xl text-white/40 leading-relaxed max-w-xl font-light">
                                                    {activeSystem.description}
                                                </p>

                                                {activeSystemId === 'body' && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setShowDemo(true)}
                                                        className="mt-8 flex items-center gap-3 bg-blue-500 text-black px-8 py-4 rounded-full font-black uppercase tracking-widest text-xs hover:bg-blue-400 transition-all shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                                                    >
                                                        <Play className="w-4 h-4" />
                                                        Test System Drive
                                                    </motion.button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Right Side: Features & Stats Grid */}
                                        <div className="space-y-12">
                                            {/* Core Architecture Box */}
                                            <div className="p-8 md:p-12 bg-white text-black rounded-[3rem] space-y-6 shadow-[0_50px_100px_rgba(0,0,0,0.5)]">
                                                <div className="flex items-center gap-3">
                                                    <Zap className="w-5 h-5 text-blue-600" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Core Architecture</span>
                                                </div>
                                                <h4 className="text-2xl md:text-3xl font-bold">{activeSystem.coreFeature}</h4>
                                                <p className="text-lg md:text-xl text-neutral-600 leading-relaxed italic font-serif">
                                                    "{activeSystem.coreDescription}"
                                                </p>
                                            </div>

                                            {/* Capabilties & Outcome */}
                                            <div className="grid grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Capabilities</p>
                                                    <ul className="space-y-3">
                                                        {activeSystem.capabilities.map((cap, idx) => (
                                                            <li key={idx} className="flex items-center gap-3 text-sm font-bold text-white/60">
                                                                <div className="w-1 h-1 bg-blue-500 rounded-full" />
                                                                {cap}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-4">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Outcome</p>
                                                    <p className={`${bebas.className} text-3xl md:text-5xl text-blue-400 leading-none`}>
                                                        {activeSystem.outcome}
                                                    </p>
                                                    <div className="pt-4 border-t border-white/5 space-y-2">
                                                        {activeSystem.stats.map((stat, idx) => (
                                                            <div key={idx} className="flex justify-between items-center text-[10px] font-bold group">
                                                                <span className="text-white/20 uppercase tracking-widest group-hover:text-white/40 transition-colors">{stat.label}</span>
                                                                <span className="text-white font-mono">{stat.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Functional Modules */}
                                            <div className="flex flex-wrap gap-2 pt-8 border-t border-white/5">
                                                {activeSystem.features.map((f, idx) => (
                                                    <span key={idx} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all cursor-crosshair">
                                                        {f}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </section>

                {/* 3. FINAL CINEMATIC CALL */}
                <section className="min-h-screen py-60 px-6 text-center relative overflow-hidden flex flex-col items-center justify-center border-t border-white/5">
                    <div className="max-w-5xl mx-auto space-y-12 relative z-10 w-full">
                        <ImpactSlam text="OWN YOUR REALITY" color="#ffffff" isMobile={isMobile} />
                        <BlurSlam text="SYSTEMS OVER LUCK" color="rgba(255,255,255,0.2)" delay={0.3} />
                        
                        <div className="py-20 flex flex-col items-center gap-12">
                            <Link href="/pricing" className="w-full md:w-auto">
                                <Button size="lg" className="h-24 w-full md:px-24 bg-white text-black hover:bg-neutral-200 rounded-none font-black uppercase tracking-[0.6em] text-xs md:text-sm shadow-[0_0_100px_rgba(255,255,255,0.1)] transition-all hover:scale-105">
                                    SELECT MEMBERSHIP LEVEL
                                </Button>
                            </Link>
                            
                            <p className={`${bebas.className} text-xl md:text-3xl text-white/40 leading-relaxed max-w-2xl mx-auto tracking-widest px-4`}>
                                THE THRESHOLD OF HUMAN POTENTIAL <br />
                                IS A DESIGN CHOICE.
                            </p>
                        </div>
                    </div>

                    {/* Background Decorative Text (Large) */}
                    <div className="absolute bottom-10 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.02] select-none pointer-events-none">
                        <div className={`${bebas.className} text-[20vw] leading-none uppercase tracking-tighter`}>
                             IMPROVE INTEGRITY ARCHITECTURE MMXXIV
                        </div>
                    </div>
                </section>

                {/* 4. MINIMAL FOOTER */}
                <footer className="py-20 px-6 border-t border-white/5 text-center bg-black/80 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
                         <ImproveLogo small className="opacity-40" />
                        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] uppercase tracking-[0.4em] font-black text-white/20">
                            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Infrastructure</Link>
                            <Link href="/terms" className="hover:text-white transition-colors">Protocol Agreements</Link>
                            <Link href="/login" className="hover:text-white transition-colors">Neural Credentials</Link>
                        </div>
                        <p className={`${bebas.className} text-white/5 uppercase tracking-[0.8em] text-[10px]`}>
                            Autonomous Human Operating System — CORE v1.0.4
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
