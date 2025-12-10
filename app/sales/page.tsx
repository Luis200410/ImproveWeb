'use client'

import { useState } from 'react'
import { Playfair_Display, Inter } from "@/lib/font-shim";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { ArrowRight, Sparkles, ChevronDown, Lightbulb, Zap, Target } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

const systems = [
    {
        id: "body",
        icon: "💪",
        name: "Body",
        tagline: "The Temple of Excellence",
        philosophy: "Your body is not merely a vessel—it is the foundation upon which all achievement rests. The ancients understood this: mens sana in corpore sano. A sound mind in a sound body.",
        description: "In an age of sedentary decline, we return to the wisdom of disciplined physicality. This system transforms your relationship with your body from neglect to reverence, from weakness to strength, from chaos to order.",
        microapps: [
            { name: "Exercise Tracker", purpose: "Chronicle every training session, every rep, every mile. Build an unbreakable record of physical discipline." },
            { name: "Nutrition Log", purpose: "Fuel is strategy. Track what you consume with the precision of an elite athlete optimizing performance." },
            { name: "Sleep & Rest", purpose: "Recovery is where growth happens. Monitor sleep quality and rest patterns to maximize regeneration." }
        ],
        outcome: "Transform from someone who 'tries to stay healthy' to someone who commands their physical vessel with authority and intention."
    },
    {
        id: "money",
        icon: "💰",
        name: "Money",
        tagline: "The Architecture of Wealth",
        philosophy: "Money is not the root of evil—the lack of systematic thinking about money is. Wealth is not luck. It is the inevitable result of disciplined financial architecture.",
        description: "This system rejects the poverty mindset of 'budgeting' and embraces the abundance mindset of wealth engineering. Every dollar has a purpose. Every expense is intentional. Every investment is strategic.",
        microapps: [
            { name: "Budget Planner", purpose: "Design your financial month like an architect designs a building—with precision, purpose, and vision." },
            { name: "Expense Tracker", purpose: "Awareness precedes control. Track every outflow to eliminate waste and redirect resources toward growth." },
            { name: "Income Tracker", purpose: "Measure and celebrate every revenue stream. What gets measured gets multiplied." }
        ],
        outcome: "Evolve from financial anxiety to financial mastery. From paycheck-to-paycheck to wealth accumulation. From scarcity to abundance."
    },
    {
        id: "work",
        icon: "💼",
        name: "Work",
        tagline: "The Craft of Mastery",
        philosophy: "Work is not a curse—it is the primary arena for self-actualization. Your career is not what you do for money; it is how you contribute your unique genius to the world.",
        description: "This system transforms work from drudgery to calling, from obligation to opportunity. It is built for those who refuse to be cogs in someone else's machine and instead choose to become masters of their craft.",
        microapps: [
            { name: "Project Manager", purpose: "Orchestrate complex initiatives with the precision of a conductor leading a symphony." },
            { name: "Time Tracker", purpose: "Time is the only truly scarce resource. Track it with the reverence it deserves." }
        ],
        outcome: "Transition from employee mindset to craftsman mindset. From trading time for money to creating value that compounds."
    },
    {
        id: "productivity",
        icon: "⚡",
        name: "Productivity",
        tagline: "The Engine of Achievement",
        philosophy: "Productivity is not about doing more—it is about doing what matters with unwavering focus. It is the difference between motion and progress, between busy and effective.",
        description: "Built on GTD principles and refined for the modern age, this system is your command center for personal effectiveness. It eliminates the mental overhead of 'what should I do next?' and replaces it with clarity and momentum.",
        microapps: [
            { name: "Task Manager", purpose: "Capture, clarify, organize, and execute. Transform mental chaos into systematic action." },
            { name: "Habit Tracker", purpose: "Habits are the compound interest of self-improvement. Build them deliberately, track them religiously." }
        ],
        outcome: "Move from reactive to proactive. From overwhelmed to in control. From scattered to focused."
    },
    {
        id: "relationships",
        icon: "❤️",
        name: "Relationships",
        tagline: "The Network of Influence",
        philosophy: "You are the average of the five people you spend the most time with. Your relationships are not accidents—they are investments that either appreciate or depreciate.",
        description: "This system brings intentionality to the most important aspect of human existence: connection. It transforms relationships from happenstance to strategy, from neglect to cultivation.",
        microapps: [
            { name: "Contact Manager", purpose: "Maintain a living database of the people who matter. Remember details. Show you care." },
            { name: "Interaction Log", purpose: "Document meaningful conversations and connections. Build relationship equity over time." }
        ],
        outcome: "Cultivate a network of deep, meaningful relationships. Become someone people want to know, trust, and support."
    },
    {
        id: "mind-emotions",
        icon: "🧠",
        name: "Mind & Emotions",
        tagline: "The Inner Citadel",
        philosophy: "The quality of your life is determined by the quality of your thoughts. Your mind is either your greatest asset or your worst enemy—there is no middle ground.",
        description: "This system is your sanctuary for mental and emotional well-being. It combines ancient wisdom (Stoicism, meditation) with modern psychology to create unshakeable inner peace.",
        microapps: [
            { name: "Daily Journal", purpose: "Externalize your thoughts. Process your experiences. Gain clarity through reflection." },
            { name: "Gratitude Log", purpose: "Rewire your brain for abundance. What you appreciate, appreciates." },
            { name: "Mood Tracker", purpose: "Understand your emotional patterns. Identify triggers. Optimize your mental state." }
        ],
        outcome: "Achieve emotional sovereignty. Master your inner world. Become unshakeable in the face of external chaos."
    },
    {
        id: "legacy-fun",
        icon: "🎨",
        name: "Legacy & Fun",
        tagline: "The Art of Living",
        philosophy: "Life is not meant to be endured—it is meant to be savored. Legacy is not what you leave behind; it is what you experience while you're here.",
        description: "This system ensures you don't reach the end of your life with regrets. It balances achievement with enjoyment, ambition with adventure, productivity with play.",
        microapps: [
            { name: "Bucket List", purpose: "Define your dreams. Track your adventures. Live a life worth remembering." },
            { name: "Travel Planner", purpose: "The world is vast and you have one life. Plan journeys that expand your perspective." }
        ],
        outcome: "Live fully. Experience deeply. Create memories that outlast you."
    },
    {
        id: "second-brain",
        icon: "🗂️",
        name: "Second Brain",
        tagline: "The Library of Self",
        philosophy: "Your brain is for having ideas, not storing them. A second brain is your external cognitive system—a place where knowledge compounds and insights emerge.",
        description: "Built on the PARA method (Projects, Areas, Resources, Archives), this system is your personal knowledge management infrastructure. It ensures nothing valuable is ever lost.",
        microapps: [
            { name: "Projects", purpose: "Active initiatives with deadlines. The things you're building right now." },
            { name: "Areas", purpose: "Ongoing responsibilities. The domains you maintain over time." },
            { name: "Resources", purpose: "Reference materials. Your personal library of wisdom." },
            { name: "Quick Capture", purpose: "Inbox for fleeting thoughts. Never lose an idea again." }
        ],
        outcome: "Build a compounding knowledge base. Connect ideas across time. Think better, create more."
    }
];

export default function SalesPage() {
    const [expandedSystem, setExpandedSystem] = useState<string | null>(null)

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-1/4 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.1, 1, 1.1],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                    }}
                    className="absolute bottom-1/3 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"
                />

                <div className="absolute inset-0 opacity-[0.02]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="sales-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#sales-grid)" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Navigation />
                <div className="h-20" />

                {/* Hero Section */}
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="py-32 px-4 text-center border-b border-white/10"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="max-w-5xl mx-auto"
                    >
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <Sparkles className="w-5 h-5 text-white/60" />
                            <p className="text-xs uppercase tracking-[0.4em] text-white/40">The Complete System</p>
                            <Sparkles className="w-5 h-5 text-white/60" />
                        </div>

                        <h1 className={`${playfair.className} text-7xl md:text-9xl font-bold mb-8 text-white leading-none`}>
                            Eight Systems.<br />
                            One Life.<br />
                            <span className="italic text-white/80">Infinite Potential.</span>
                        </h1>

                        <p className={`${inter.className} text-xl md:text-2xl text-white/70 max-w-4xl mx-auto font-light leading-relaxed mb-6`}>
                            Most people stumble through life reacting to whatever comes their way.
                        </p>

                        <p className={`${inter.className} text-xl md:text-2xl text-white max-w-4xl mx-auto font-medium leading-relaxed mb-12`}>
                            You are not most people.
                        </p>

                        <Link href="/register">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="lg" className="bg-white text-black hover:bg-white/90 font-serif text-base px-16 py-10 uppercase tracking-widest relative overflow-hidden">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                        initial={{ x: "-100%" }}
                                        whileHover={{ x: "100%" }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    <span className="relative z-10">Begin Your Transformation</span>
                                </Button>
                            </motion.div>
                        </Link>
                    </motion.div>
                </motion.section>

                {/* The Eight Systems - Expandable Cards */}
                <section className="py-20 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className={`${playfair.className} text-6xl font-bold mb-6 text-white`}>
                                The Eight Pillars
                            </h2>
                            <p className={`${inter.className} text-xl text-white/60 max-w-3xl mx-auto mb-4`}>
                                Click any system to reveal its philosophy, microapps, and outcomes
                            </p>
                        </div>

                        <div className="space-y-4">
                            {systems.map((system, index) => {
                                const isExpanded = expandedSystem === system.id

                                return (
                                    <motion.div
                                        key={system.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.05 }}
                                        layout
                                        className="relative group"
                                    >
                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />

                                        <div className="relative bg-white/5 border border-white/10 group-hover:border-white/30 transition-all duration-500 overflow-hidden">
                                            {/* Compact Header - Always Visible */}
                                            <button
                                                onClick={() => setExpandedSystem(isExpanded ? null : system.id)}
                                                className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-colors duration-300"
                                            >
                                                <div className="flex items-center gap-6">
                                                    <motion.span
                                                        whileHover={{ scale: 1.2, rotate: 10 }}
                                                        className="text-5xl"
                                                    >
                                                        {system.icon}
                                                    </motion.span>
                                                    <div className="text-left">
                                                        <h3 className={`${playfair.className} text-3xl font-bold text-white mb-1`}>
                                                            {system.name}
                                                        </h3>
                                                        <p className={`${playfair.className} text-lg italic text-white/60`}>
                                                            {system.tagline}
                                                        </p>
                                                    </div>
                                                </div>

                                                <motion.div
                                                    animate={{ rotate: isExpanded ? 180 : 0 }}
                                                    transition={{ duration: 0.3 }}
                                                    className="p-3 bg-white/10 border border-white/20"
                                                >
                                                    <ChevronDown className="w-6 h-6 text-white" />
                                                </motion.div>
                                            </button>

                                            {/* Expanded Content */}
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.4, ease: "easeInOut" }}
                                                        className="overflow-hidden border-t border-white/10"
                                                    >
                                                        <div className="p-8 space-y-8">
                                                            {/* Philosophy */}
                                                            <motion.div
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.1 }}
                                                                className="bg-white/5 border-l-4 border-white/30 p-6"
                                                            >
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Lightbulb className="w-5 h-5 text-white/60" />
                                                                    <h4 className={`${playfair.className} text-xl font-bold text-white`}>
                                                                        The Philosophy
                                                                    </h4>
                                                                </div>
                                                                <p className={`${inter.className} text-white/80 leading-relaxed italic`}>
                                                                    {system.philosophy}
                                                                </p>
                                                            </motion.div>

                                                            {/* Description */}
                                                            <motion.div
                                                                initial={{ x: -20, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: 0.2 }}
                                                            >
                                                                <p className={`${inter.className} text-white/70 leading-relaxed text-lg`}>
                                                                    {system.description}
                                                                </p>
                                                            </motion.div>

                                                            {/* Microapps Grid */}
                                                            <motion.div
                                                                initial={{ y: 20, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                transition={{ delay: 0.3 }}
                                                            >
                                                                <div className="flex items-center gap-2 mb-4">
                                                                    <Zap className="w-5 h-5 text-white/60" />
                                                                    <h4 className={`${playfair.className} text-xl font-bold text-white`}>
                                                                        Included Microapps
                                                                    </h4>
                                                                </div>
                                                                <div className="grid md:grid-cols-2 gap-4">
                                                                    {system.microapps.map((microapp, i) => (
                                                                        <motion.div
                                                                            key={microapp.name}
                                                                            initial={{ scale: 0.9, opacity: 0 }}
                                                                            animate={{ scale: 1, opacity: 1 }}
                                                                            transition={{ delay: 0.4 + i * 0.05 }}
                                                                            className="bg-white/5 border border-white/10 p-4 hover:bg-white/10 transition-all duration-300"
                                                                        >
                                                                            <div className="flex items-start gap-2 mb-2">
                                                                                <ArrowRight className="w-4 h-4 text-white/40 flex-shrink-0 mt-1" />
                                                                                <p className={`${inter.className} text-white font-medium text-sm`}>
                                                                                    {microapp.name}
                                                                                </p>
                                                                            </div>
                                                                            <p className={`${inter.className} text-white/60 text-xs leading-relaxed ml-6`}>
                                                                                {microapp.purpose}
                                                                            </p>
                                                                        </motion.div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>

                                                            {/* Outcome */}
                                                            <motion.div
                                                                initial={{ y: 20, opacity: 0 }}
                                                                animate={{ y: 0, opacity: 1 }}
                                                                transition={{ delay: 0.5 }}
                                                                className="bg-gradient-to-r from-white/10 to-transparent border-l-4 border-white/50 p-6"
                                                            >
                                                                <div className="flex items-center gap-2 mb-3">
                                                                    <Target className="w-5 h-5 text-white" />
                                                                    <h4 className={`${playfair.className} text-xl font-bold text-white`}>
                                                                        The Outcome
                                                                    </h4>
                                                                </div>
                                                                <p className={`${inter.className} text-white leading-relaxed font-medium text-lg`}>
                                                                    {system.outcome}
                                                                </p>
                                                            </motion.div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="py-32 px-6 border-t border-white/10 text-center"
                >
                    <div className="max-w-4xl mx-auto">
                        <h2 className={`${playfair.className} text-6xl md:text-7xl font-bold mb-8 text-white`}>
                            The Choice Is Yours
                        </h2>

                        <p className={`${inter.className} text-2xl text-white/70 leading-relaxed mb-6`}>
                            You can continue as you are—hoping, wishing, trying.
                        </p>

                        <p className={`${inter.className} text-2xl text-white leading-relaxed mb-12 font-medium`}>
                            Or you can adopt a system designed to make excellence inevitable.
                        </p>

                        <Link href="/pricing">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="lg" className="bg-white text-black hover:bg-white/90 font-serif text-lg px-16 py-10 uppercase tracking-widest relative overflow-hidden">
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                        initial={{ x: "-100%" }}
                                        whileHover={{ x: "100%" }}
                                        transition={{ duration: 0.6 }}
                                    />
                                    <span className="relative z-10">View Membership Options</span>
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </motion.section>

                {/* Footer */}
                <footer className="py-8 text-center border-t border-white/10 relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="relative z-10">
                        <p className={`${playfair.className} text-white/30 italic text-sm`}>
                            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                        </p>
                        <p className={`${inter.className} text-white/20 text-xs mt-2 uppercase tracking-widest`}>
                            — Aristotle
                        </p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
