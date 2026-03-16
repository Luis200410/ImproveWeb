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
        name: "Body",
        tagline: "The Temple of Excellence",
        description: "Biological optimization and physiological surveillance of your physical vessel.",
        coreFeature: "Tactical HUD & Biometric Radar",
        coreDescription: "Real-time surveillance of your biological state. Deploy the Identity Radar to scan biometrics, track Fuel Quality Heatmaps, and monitor your physiological Identity Horizon.",
        capabilities: ["Biometric Surveillance", "Fuel Quality Analysis", "Recovery Orchestration", "Macro Scanning"],
        outcome: "Total Physical Command",
        stats: [{ label: "Efficiency", value: "+42%" }, { label: "Recovery", value: "Optimal" }],
        features: ["HRV Tracking", "Metabolic Sync", "Neural Recovery", "Load Balancing"]
    },
    {
        id: "money",
        icon: "📈",
        name: "Money",
        tagline: "The Architecture of Wealth",
        description: "Architecture of abundance and institutional-grade liquidity intelligence.",
        coreFeature: "Liquidity Intelligence Engine",
        coreDescription: "A Plaid-integrated financial command center. Track net worth velocity, asset distribution, and cash flow momentum with institutional-grade precision.",
        capabilities: ["Velocity Tracking", "Asset Distribution", "Flow Mapping", "Institutional Guardrails"],
        outcome: "Architectural Wealth",
        stats: [{ label: "Growth", value: "Exponential" }, { label: "Risk", value: "Minimized" }],
        features: ["Liquidity Radar", "Velocity Scoring", "Yield Optimization", "Tax Shielding"]
    },
    {
        id: "work",
        icon: "⚔️",
        name: "Work",
        tagline: "The Craft of Mastery",
        description: "Mission-oriented career mastery and strategic output orchestration.",
        coreFeature: "Deep Work Orchestration",
        coreDescription: "Align every project with long-term career legacy. Mission-critical task management designed for high-stakes deep work sessions.",
        capabilities: ["Mission Alignment", "Deep Work Timers", "Legacy Tracking", "Strategic Output"],
        outcome: "Craftsman Mastery",
        stats: [{ label: "Impact", value: "High" }, { label: "Focus", value: "Uninterrupted" }],
        features: ["Deep Work Shield", "Cognitive Load Map", "Legacy Alignment", "Skill Compounding"]
    },
    {
        id: "productivity",
        icon: "⚡",
        name: "Productivity",
        tagline: "The Engine of Achievement",
        description: "Cognitive capture and momentum scaling for the high-performance mind.",
        coreFeature: "Cognitive Capture Engine",
        coreDescription: "GTD-powered task architecture that eliminates decision fatigue. Systematic offloading of every cognitive load into a frictionless momentum loop.",
        capabilities: ["Atomic Habit Loops", "Decision Offloading", "Frictionless Capture", "Momentum Analysis"],
        outcome: "Infinite Momentum",
        stats: [{ label: "Throughput", value: "3x" }, { label: "Clarity", value: "Absolute" }],
        features: ["Inbox Zero Protocol", "Mental Offload", "Flow State Sync", "Decision Engines"]
    },
    {
        id: "relationships",
        icon: "🪐",
        name: "Relationships",
        tagline: "The Network of Influence",
        description: "Social capital repository and intentional connection to leverage your network.",
        coreFeature: "Social Capital Repository",
        coreDescription: "Strategic networking and intentional relationship management. Monitor connection velocity and network health across all social tiers.",
        capabilities: ["Connection Velocity", "Network Health", "Social Archiving", "Intentional Nudges"],
        outcome: "Strategic Influence",
        stats: [{ label: "Network", value: "Resilient" }, { label: "Depth", value: "Tier 1" }],
        features: ["Alumni Mapping", "Connection Velocity", "Trust Architect", "Network Health"]
    },
    {
        id: "mind-emotions",
        icon: "🌑",
        name: "Mind & Emotions",
        tagline: "The Inner Citadel",
        description: "The Inner Citadel and algorithmic emotional resilience against external entropy.",
        coreFeature: "The Inner Citadel",
        coreDescription: "Stoic reflection frameworks and emotional volatility mapping. Construct an unshakeable psychological fortress against external entropy.",
        capabilities: ["Volatility Mapping", "Stoic Reflection", "Entropy Shielding", "Clarity Audits"],
        outcome: "Unshakeable Peace",
        stats: [{ label: "Entropy", value: "-80%" }, { label: "Stability", value: "Maximum" }],
        features: ["Stoic Reflection", "Mood Volatility Map", "Focus Sanctuary", "Thought Defrag"]
    },
    {
        id: "legacy-fun",
        icon: "🎪",
        name: "Legacy & Fun",
        tagline: "The Art of Living",
        description: "Life experience engine and novelty scoring to engineering a life that echoes.",
        coreFeature: "Life Experience Engine",
        coreDescription: "Strategic adventure planning and novelty scoring to maximize memory formation. Engineering a life that echoes through time.",
        capabilities: ["Novelty Scoring", "Memory Formation", "Experience Design", "Legacy Mapping"],
        outcome: "Life Without Regret",
        stats: [{ label: "Richness", value: "Compounding" }, { label: "Novelty", value: "Continuous" }],
        features: ["Novelty Scoring", "Adventure Planner", "Memory Anchoring", "Joy Optimization"]
    },
    {
        id: "second-brain",
        icon: "🧠",
        name: "Second Brain",
        tagline: "The Library of Self",
        description: "Relational knowledge graph and externalized genius for non-linear insight.",
        coreFeature: "Relational Knowledge Graph",
        coreDescription: "A PARA-organized library of self. Non-linear insight generation from compounding notes and externalized intelligence.",
        capabilities: ["PARA Architecture", "Non-linear Insights", "Compounding Wisdom", "Externalized Focus"],
        outcome: "Externalized Genius",
        stats: [{ label: "Retrieval", value: "<100ms" }, { label: "Wisdom", value: "Compounding" }],
        features: ["PARA Infrastructure", "Zettelkasten Sync", "Compound Insight", "Archive Mining"]
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

                        {/* Main System Navigation using the premium Menu component */}
                        <div className="relative w-full flex justify-center z-40">
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

                            <div className="max-w-5xl mx-auto">

                                {/* Right: The Animation Machine (User Pastes Here) */}
                                <div className="min-h-[700px] flex flex-col justify-center gap-12">
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={activeFunctionality}
                                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                            transition={{ duration: 0.4, ease: "easeOut" }}
                                            className="w-full rounded-[2rem] bg-white text-black shadow-2xl shadow-white/5 overflow-hidden border border-white/20"
                                        >
                                            {(() => {
                                                const s = systems.find(sys => sys.id === activeFunctionality) || systems[0];
                                                return (
                                                    <div className="grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
                                                        {/* Left Panel: Primary Focus */}
                                                        <div className="md:col-span-5 p-10 bg-neutral-50 flex flex-col justify-between border-r border-neutral-200">
                                                            <div>
                                                                <div className="flex items-center gap-3 mb-8">
                                                                    <span className="text-4xl">{s.icon}</span>
                                                                    <span className="text-xs font-bold tracking-[0.3em] text-neutral-400 uppercase">System Intelligence</span>
                                                                </div>
                                                                <h2 className={`${playfair.className} text-5xl font-bold mb-6 leading-tight`}>
                                                                    {s.name}
                                                                </h2>
                                                                <p className="text-xl text-neutral-600 leading-relaxed font-light">
                                                                    {s.description}
                                                                </p>
                                                            </div>

                                                            <div className="mt-12 space-y-6">
                                                                <div className="p-6 bg-white rounded-2xl border border-neutral-200 shadow-sm">
                                                                    <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-2">Core Feature</p>
                                                                    <p className="text-lg font-bold text-neutral-900">{(s as any).coreFeature}</p>
                                                                </div>
                                                                <div className="flex gap-4">
                                                                    {((s as any).stats || []).map((stat: any, i: number) => (
                                                                        <div key={i} className="flex-1 p-4 bg-black text-white rounded-2xl">
                                                                            <p className="text-[10px] uppercase tracking-tighter opacity-50">{stat.label}</p>
                                                                            <p className="text-xl font-bold font-mono">{stat.value}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Right Panel: Capabilities & Impact */}
                                                        <div className="md:col-span-7 p-12 bg-white flex flex-col justify-between">
                                                            <div>
                                                                <div className="flex items-center gap-2 mb-8">
                                                                    <div className="h-0.5 w-6 bg-orange-500" />
                                                                    <span className="text-xs font-bold tracking-widest uppercase">System Capabilities</span>
                                                                </div>
                                                                
                                                                <div className="grid grid-cols-1 gap-8">
                                                                    <div>
                                                                        <p className="text-sm font-medium text-neutral-400 mb-4">Functional Deployment</p>
                                                                        <p className="text-lg text-neutral-800 leading-relaxed italic border-l-4 border-orange-500 pl-6 py-2 bg-orange-50/30">
                                                                            "{(s as any).coreDescription}"
                                                                        </p>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        {((s as any).capabilities || []).map((cap: string, i: number) => (
                                                                            <div key={i} className="flex items-center gap-3 text-neutral-700">
                                                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                                                                <span className="text-sm font-medium">{cap}</span>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div className="mt-12 pt-8 border-t border-neutral-100 flex items-end justify-between">
                                                                <div>
                                                                    <p className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase mb-1">Mission Outcome</p>
                                                                    <p className={`${playfair.className} text-3xl font-bold text-black uppercase tracking-tighter`}>
                                                                        {s.outcome}
                                                                    </p>
                                                                </div>
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }}
                                                                    whileTap={{ scale: 0.95 }}
                                                                    className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-sm tracking-wider hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20"
                                                                >
                                                                    INITIALIZE
                                                                </motion.button>
                                                            </div>
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
