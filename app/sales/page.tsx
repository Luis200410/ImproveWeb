'use client'

import { useState, useRef } from 'react'
import { Bebas_Neue, Playfair_Display } from "@/lib/font-shim";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { Menu, MenuItem, ProductItem, HoveredLink } from "@/components/ui/navbar-menu";
import { 
    ArrowRight, 
    Sparkles, 
    ChevronDown, 
    Lightbulb, 
    Zap, 
    Target, 
    Activity, 
    Shield, 
    Cpu, 
    UnfoldVertical,
    Command,
    Workflow,
    Layers
} from "lucide-react";

const bebas = Bebas_Neue({ weight: '400', subsets: ["latin"] });
const playfair = Playfair_Display({ subsets: ["latin"] });

const systems = [
    {
        id: "body",
        icon: "🧬",
        name: "Body Optimization",
        tagline: "The Temple of Excellence",
        description: "Biological optimization and physiological surveillance of your physical vessel.",
        coreFeature: "Dynamic Routine Architect",
        coreDescription: "Design industrial-grade training blocks with minimal friction. Map your biological evolution through Routine Builder, Recovery Surveillance, and meticulous Diet logging.",
        capabilities: ["Program Mapping", "Macro Surveillance", "Recovery Orchestration", "Fuel Quality Logging"],
        outcome: "Total Physical Command",
        stats: [{ label: "Capacity", value: "Peak" }, { label: "Readiness", value: "Optimal" }],
        features: ["HRV Tracking", "Metabolic Sync", "Neural Recovery", "Load Balancing"]
    },
    {
        id: "money",
        icon: "📈",
        name: "Money & Wealth System",
        tagline: "The Architecture of Wealth",
        description: "Architecture of abundance and institutional-grade liquidity intelligence.",
        coreFeature: "Liquidity Radar",
        coreDescription: "A multi-layered financial command center. Track net worth velocity, asset distribution, and cash flow momentum across brokerage, savings, and expense modules.",
        capabilities: ["Velocity Tracking", "Asset Distribution", "Net Worth Mapping", "Institutional Guardrails"],
        outcome: "Architectural Wealth",
        stats: [{ label: "Growth", value: "Exponential" }, { label: "Risk", value: "Minimized" }],
        features: ["Investment Tracking", "Budget Planning", "Income Velocity", "Subscription Shield"]
    },
    {
        id: "work",
        icon: "⚔️",
        name: "Professional Work Mastery",
        tagline: "The Craft of Mastery",
        description: "Mission-oriented career mastery and strategic output orchestration.",
        coreFeature: "Deep Work Orchestration",
        coreDescription: "Align intensive projects with long-term legacy. Strategic task architecture and time-tracking infrastructure designed for world-class craftsmanship.",
        capabilities: ["Mission Alignment", "Project Triage", "Legacy Tracking", "Strategic Output"],
        outcome: "Craftsman Mastery",
        stats: [{ label: "Impact", value: "High" }, { label: "Focus", value: "Maximum" }],
        features: ["Project Deadlines", "Time Tracking", "Notebook Sync", "Task Compounding"]
    },
    {
        id: "productivity",
        icon: "⚡",
        name: "Execution & Productivity",
        tagline: "The Engine of Achievement",
        description: "Cognitive capture and momentum scaling for the high-performance mind.",
        coreFeature: "Atomic Habit Loops",
        coreDescription: "GTD-powered habit architecture that eliminates decision fatigue. Systematic momentum scaling through Atomic Habits, Pomodoro sessions, and Periodic Reviews.",
        capabilities: ["Atomic Momentum", "Decision Offloading", "Frictionless Capture", "Performance Audits"],
        outcome: "Infinite Momentum",
        stats: [{ label: "Throughput", value: "3x" }, { label: "Clarity", value: "Absolute" }],
        features: ["Habit Tracker", "Pomodoro Engine", "GTD Reviews", "Projection Maps"]
    },
    {
        id: "relationships",
        icon: "🪐",
        name: "Relationships & Social Capital",
        tagline: "The Network of Influence",
        description: "Social capital repository and intentional connection architecture.",
        coreFeature: "Social Capital Repository",
        coreDescription: "Strategic networking and intentional relationship management. Monitor connection velocity and network health through the Context Vault and Relationship Ledger.",
        capabilities: ["Connection Velocity", "Network Health", "Social Archiving", "Intentional Nudges"],
        outcome: "Strategic Influence",
        stats: [{ label: "Network", value: "Resilient" }, { label: "Depth", value: "Tier 1" }],
        features: ["Contact Directory", "Interaction Logs", "Meeting Triage", "Trust Ledger"]
    },
    {
        id: "mind-emotions",
        icon: "🌑",
        name: "Mind, Emotions & Clarity",
        tagline: "The Inner Citadel",
        description: "Algorithmic emotional resilience and psychological entropy shielding.",
        coreFeature: "Stoic Reflection Frameworks",
        coreDescription: "Construct an unshakeable psychological fortress. Map emotional volatility and anchor your focus through Daily Journaling, Gratitude Logs, and Mood Surveillance.",
        capabilities: ["Volatility Mapping", "Stoic Reflection", "Entropy Shielding", "Clarity Audits"],
        outcome: "Unshakeable Peace",
        stats: [{ label: "Entropy", value: "-80%" }, { label: "Stability", value: "Maximum" }],
        features: ["Daily Journal", "Gratitude Anchors", "Mood Tracking", "Focus Sanctuary"]
    },
    {
        id: "legacy-fun",
        icon: "🎪",
        name: "Legacy & Strategic Fun",
        tagline: "The Art of Living",
        description: "Life experience engine and novelty scoring to engineer a life that echoes.",
        coreFeature: "Life Experience Engine",
        coreDescription: "Strategic adventure planning and novelty scoring to maximize memory formation. Orchestrate high-impact experiences through Bucket Lists and Travel Architecture.",
        capabilities: ["Novelty Scoring", "Memory Formation", "Experience Design", "Legacy Mapping"],
        outcome: "Life Without Regret",
        stats: [{ label: "Richness", value: "Compounding" }, { label: "Novelty", value: "Continuous" }],
        features: ["Bucket List", "Travel Planner", "Memory Anchoring", "Joy Optimization"]
    },
    {
        id: "second-brain",
        icon: "🧠",
        name: "Second Brain & Knowledge",
        tagline: "The Library of Self",
        description: "Relational knowledge graph and externalized genius for non-linear insight.",
        coreFeature: "PARA Knowledge Architecture",
        coreDescription: "A multi-layered library of self. Generate non-linear insight from compounding notes, research materials, and relational task synthesis.",
        capabilities: ["PARA Architecture", "Non-linear Insights", "Compounding Wisdom", "Externalized Focus"],
        outcome: "Externalized Genius",
        stats: [{ label: "Retrieval", value: "<100ms" }, { label: "Wisdom", value: "Compounding" }],
        features: ["Note Repository", "Task Synthesis", "Resource Archive", "Inbox Capture"]
    }
];

export default function SalesPage() {
    const [expandedSystem, setExpandedSystem] = useState<string | null>(null)
    const [activeFunctionality, setActiveFunctionality] = useState<string>(systems[0].id)
    const containerRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({ target: containerRef })
    
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    
    return (
        <div 
            className="min-h-screen bg-black text-white overflow-x-hidden selection:bg-white/30 relative" 
            ref={containerRef}
        >
            {/* Premium Background Engine */}
            <div className="fixed inset-0 z-0">
                <SpiralAnimation />
                <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                <motion.div
                        style={{ y: backgroundY }}
                        className="absolute inset-0 opacity-40"
                    >
                        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-white/10 rounded-full blur-[160px] animate-pulse" />
                        <div className="absolute bottom-[10%] right-[-5%] w-[40%] h-[50%] bg-white/5 rounded-full blur-[140px]" />
                    </motion.div>
                    
                    {/* Noise and Grid Overlays */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-150 contrast-125" />
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <svg width="100%" height="100%">
                            <pattern id="sales-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                            <rect width="100%" height="100%" fill="url(#sales-grid)" />
                        </svg>
                    </div>
                </div>

            <div className="relative z-10">
                {/* Hero Section: The Sales Machine */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.5 }}
                    className="relative py-40 px-6 overflow-hidden flex flex-col items-center justify-center min-h-[90vh]"
                >
                    <div className="max-w-6xl mx-auto text-center space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl"
                        >
                            <Cpu className="w-4 h-4 text-white/60 animate-spin-slow" />
                            <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white/40">Improve High-Performance OS</span>
                        </motion.div>

                        <h1 className={`${playfair.className} text-7xl md:text-[10rem] font-bold tracking-tighter leading-[0.85] text-white`}>
                            Automate <br />
                            <span className="text-white/20 italic">Human</span> <br />
                            Excellence.
                        </h1>

                        <p className={`${bebas.className} text-xl md:text-3xl text-white/60 max-w-3xl mx-auto leading-relaxed tracking-widest px-4`}>
                            The world's first integrated operating system for the biological, financial, and cognitive self.
                        </p>

                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-12">
                            <Link href="/register">
                                <Button size="lg" className="h-20 px-12 bg-white text-black hover:bg-white/90 rounded-none font-black uppercase tracking-[0.3em] text-xs transition-all hover:scale-105 active:scale-95 shadow-2xl">
                                    Initialize System
                                </Button>
                            </Link>
                            <Link href="#showcase" className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/5 transition-all">
                                    <ChevronDown className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                                </div>
                                <span className={`${bebas.className} text-sm uppercase tracking-[0.4em] font-black text-white/40 group-hover:text-white transition-colors`}>Explore the machine</span>
                            </Link>
                        </div>
                    </div>

                    {/* Background Decorative Text */}
                    <div className="absolute bottom-0 left-0 w-full overflow-hidden whitespace-nowrap opacity-[0.02] select-none pointer-events-none translate-y-1/2">
                        <div className={`${bebas.className} text-[25vw] leading-none uppercase tracking-tighter`}>
                            SYSTEMS ARCHITECTURE - PHASE ONE ACTIVE
                        </div>
                    </div>
                </motion.section>

                {/* System Core Functionality Showcase */}
                <section id="showcase" className="py-40 px-6 border-t border-white/5 relative bg-black">
                    <div className="max-w-7xl mx-auto space-y-24">
                        <div className="text-center space-y-6">
                            <h2 className={`${playfair.className} text-6xl font-bold tracking-tight text-white`}>
                                System Core <br />
                                <span className="text-white/20 italic text-4xl">Functionality.</span>
                            </h2>
                            <div className="w-20 h-1 bg-white mx-auto" />
                        </div>

                        {/* System Selection Menu - Sticky Navigation */}
                        <div className="sticky top-[100px] w-full flex justify-center z-[90] py-6 px-4 bg-black/60 backdrop-blur-xl border-y border-white/5 shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                            <Menu setActive={(item) => item && setActiveFunctionality(item)}>
                                {systems.map((s) => (
                                    <MenuItem 
                                        key={s.id}
                                        setActive={setActiveFunctionality}
                                        active={activeFunctionality} 
                                        item={s.id}
                                        label={s.name}
                                    />
                                ))}
                            </Menu>
                        </div>

                        <div className="max-w-5xl mx-auto pt-12 pb-24 relative z-10">

                                {/* Right: The Animation Machine (User Pastes Here) */}
                                <div className="min-h-[700px] flex flex-col justify-center gap-12">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeFunctionality}
                                            initial={{ opacity: 0, scale: 0.98, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98, y: 15 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="w-full rounded-[2.5rem] bg-white text-black shadow-[0_40px_100px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20"
                                        >
                                            {(() => {
                                                const s = systems.find(sys => sys.id === activeFunctionality) || systems[0];
                                                return (
                                                    <div className="p-10 md:p-16 space-y-12">
                                                        {/* Single Window Header */}
                                                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                                            <div className="space-y-6 max-w-2xl">
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-6xl drop-shadow-md">{s.icon}</span>
                                                                    <div className="h-1 w-12 bg-orange-500 rounded-full" />
                                                                    <span className="text-xs font-bold tracking-[0.4em] text-neutral-400 uppercase">System Active</span>
                                                                </div>
                                                                <h2 className={`${playfair.className} text-6xl md:text-8xl font-black tracking-tighter leading-none`}>
                                                                    {s.name}
                                                                </h2>
                                                                <p className="text-2xl text-neutral-500 leading-relaxed font-light">
                                                                    {s.description}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-4">
                                                                {(s.stats || []).map((stat: any, i: number) => (
                                                                    <div key={i} className="px-8 py-6 bg-neutral-900 text-white rounded-3xl min-w-[140px] text-center shadow-xl">
                                                                        <p className="text-[10px] uppercase tracking-[0.2em] opacity-40 mb-1">{stat.label}</p>
                                                                        <p className="text-2xl font-black font-mono tracking-tighter">{stat.value}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Core Feature Highlight */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                                                            <div className="space-y-8">
                                                                <div className="p-8 bg-neutral-50 rounded-[2rem] border border-neutral-100 shadow-inner group hover:border-orange-200 transition-colors">
                                                                    <div className="flex items-center gap-3 mb-4">
                                                                        <Zap className="w-5 h-5 text-orange-500" />
                                                                        <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Core Architecture</p>
                                                                    </div>
                                                                    <h3 className="text-2xl font-bold text-neutral-900 mb-4">{s.coreFeature}</h3>
                                                                    <p className="text-lg text-neutral-600 leading-relaxed">
                                                                        {s.coreDescription}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-6 p-4">
                                                                    <div className="flex -space-x-4">
                                                                        {[1, 2, 3, 4].map(i => (
                                                                            <div key={i} className="w-12 h-12 rounded-full bg-neutral-200 border-4 border-white flex items-center justify-center text-[10px] font-bold">U{i}</div>
                                                                        ))}
                                                                    </div>
                                                                    <p className="text-sm font-medium text-neutral-500 tracking-tight">
                                                                        <span className="text-black font-bold">1,240+</span> machines active in this sector
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-8">
                                                                <div className="space-y-4">
                                                                    <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Technical Capabilities</p>
                                                                    <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                                                                        {(s.capabilities || []).map((cap: string, i: number) => (
                                                                            <div key={i} className="flex items-center gap-3 text-neutral-800 group cursor-default">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500 group-hover:scale-150 transition-transform" />
                                                                                <span className="text-sm font-bold tracking-tight">{cap}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="pt-8 border-t border-neutral-100 space-y-4">
                                                                    <p className="text-xs font-bold tracking-widest text-neutral-400 uppercase">Current Deployment</p>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {(s.features || []).map((f: string, i: number) => (
                                                                            <span key={i} className="px-4 py-2 bg-neutral-100 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-600 hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer">
                                                                                {f}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Footer Action */}
                                                        <div className="pt-12 border-t border-neutral-100 flex flex-col md:flex-row items-center justify-between gap-8">
                                                            <div className="text-center md:text-left">
                                                                <p className="text-[10px] font-bold tracking-[0.3em] text-neutral-400 uppercase mb-2">Final Objective</p>
                                                                <div className="flex items-center gap-4">
                                                                    <span className={`${playfair.className} text-4xl md:text-5xl font-black text-black uppercase tracking-tighter`}>
                                                                        {s.outcome}
                                                                    </span>
                                                                    <div className="hidden md:block h-px w-24 bg-neutral-200" />
                                                                </div>
                                                            </div>
                                                            <motion.button
                                                                whileHover={{ scale: 1.02, x: 5 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                className="group flex items-center gap-6 px-10 py-6 bg-black text-white rounded-full font-black text-xs tracking-[0.4em] uppercase transition-all shadow-2xl hover:bg-neutral-800"
                                                            >
                                                                Initialize System
                                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </motion.div>
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </section>


                    {/* Closing CTA */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="py-60 px-6 text-center relative overflow-hidden border-t border-white/5"
                    >
                        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
                            <h2 className={`${playfair.className} text-7xl md:text-9xl font-bold text-white tracking-tighter`}>
                                Own Your <br />
                                <span className="text-white/20 italic">Reality.</span>
                            </h2>

                            <p className={`${bebas.className} text-2xl text-white/40 leading-relaxed max-w-2xl mx-auto`}>
                                The threshold of human potential is a design choice. <br />
                                Will you build a legacy, or just a history?
                            </p>

                            <Link href="/pricing" className="inline-block">
                                <Button size="lg" className="h-20 px-20 bg-white text-black hover:bg-white/90 rounded-none font-black uppercase tracking-[0.5em] text-sm shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                                    Select Membership Level
                                </Button>
                            </Link>
                        </div>
                    </motion.section>

                    {/* Minimal Footer */}
                    <footer className="py-20 px-6 border-t border-white/5 text-center">
                        <div className="max-w-6xl mx-auto flex flex-col items-center gap-8">
                            <div className={`${playfair.className} text-3xl font-bold text-white/20`}>IMPROVE</div>
                            <p className={`${bebas.className} text-white/10 uppercase tracking-[0.8em] text-[10px]`}>
                                Autonomous Human Operating System — v1.0.4
                            </p>
                            <div className="flex gap-10 text-[10px] uppercase tracking-widest font-black text-white/20">
                                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                                <Link href="#" className="hover:text-white transition-colors">Neural Sync</Link>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
    );
}
