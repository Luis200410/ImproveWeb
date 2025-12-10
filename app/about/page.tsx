'use client'

import { Playfair_Display, Inter } from "@/lib/font-shim";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { Sparkles, Quote } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

export default function AboutPage() {
    const { scrollYProgress } = useScroll();
    const opacity1 = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const opacity2 = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);

    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.15, 0.3, 0.15],
                    }}
                    transition={{
                        duration: 12,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="absolute top-0 right-1/4 w-[700px] h-[700px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.25, 0.1],
                    }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 2
                    }}
                    className="absolute bottom-1/4 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"
                />

                <div className="absolute inset-0 opacity-[0.02]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="about-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#about-grid)" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Navigation />
                <div className="h-20" />

                {/* Hero Header */}
                <motion.header
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="py-32 px-4 text-center relative"
                >
                    <motion.div style={{ opacity: opacity1 }}>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring" }}
                            className="inline-flex items-center gap-2 mb-6"
                        >
                            <Sparkles className="w-4 h-4 text-white/60" />
                            <p className="text-xs uppercase tracking-[0.4em] text-white/40">Our Philosophy</p>
                            <Sparkles className="w-4 h-4 text-white/60" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className={`${playfair.className} text-7xl md:text-9xl font-bold mb-8 text-white relative inline-block`}
                        >
                            The Manifesto
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 1, duration: 1.5 }}
                                className="absolute -bottom-4 left-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
                            />
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className={`${inter.className} text-xl text-white/60 max-w-3xl mx-auto leading-relaxed`}
                        >
                            In an age of distraction, we stand for discipline.<br />
                            In an era of mediocrity, we champion excellence.
                        </motion.p>
                    </motion.div>
                </motion.header>

                {/* Content Sections */}
                <main className="max-w-6xl mx-auto px-6 py-20 space-y-40">
                    {/* The Crisis */}
                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-2xl opacity-30" />

                        <div className="relative bg-white/5 border border-white/10 p-12 md:p-16">
                            <motion.h2
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className={`${playfair.className} text-5xl md:text-6xl font-bold mb-12 text-white`}
                            >
                                The Crisis of Modern Life
                            </motion.h2>

                            <div className="space-y-6 text-lg md:text-xl text-white/70 leading-relaxed">
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.3 }}
                                >
                                    We live in the most prosperous era in human history, yet we are drowning in anxiety,
                                    distraction, and unfulfilled potential.
                                </motion.p>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    whileInView={{ opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                >
                                    The problem is not a lack of information—it's a lack of{" "}
                                    <span className="text-white font-medium italic">systems</span>.
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.5 }}
                                    className="relative bg-white/5 border-l-4 border-white/30 p-8 my-8"
                                >
                                    <Quote className="absolute top-4 left-4 w-8 h-8 text-white/20" />
                                    <p className={`${playfair.className} text-2xl md:text-3xl text-white italic leading-relaxed pl-8`}>
                                        "The mass of men lead lives of quiet desperation."
                                    </p>
                                    <p className={`${inter.className} text-sm text-white/40 mt-4 pl-8`}>— Henry David Thoreau</p>
                                </motion.div>
                            </div>
                        </div>
                    </motion.section>

                    {/* The Solution - Three Pillars */}
                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className={`${playfair.className} text-5xl md:text-6xl font-bold mb-16 text-center text-white`}>
                            The Path Forward
                        </h2>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { title: "Structure", desc: "Clear frameworks that eliminate decision fatigue and create momentum", delay: 0.2 },
                                { title: "Measurement", desc: "Precise tracking that reveals patterns and enables optimization", delay: 0.3 },
                                { title: "Integration", desc: "Holistic approach that recognizes all dimensions of life are interconnected", delay: 0.4 }
                            ].map((pillar, i) => (
                                <motion.div
                                    key={pillar.title}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: pillar.delay }}
                                    whileHover={{ scale: 1.05, y: -10 }}
                                    className="relative group"
                                >
                                    <div className="absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                                    <div className="relative bg-white/5 border border-white/10 p-8 h-full group-hover:border-white/30 transition-all duration-500">
                                        <div className="text-6xl font-bold text-white/10 mb-4">{String(i + 1).padStart(2, '0')}</div>
                                        <h3 className={`${playfair.className} text-3xl font-bold text-white mb-4`}>
                                            {pillar.title}
                                        </h3>
                                        <p className={`${inter.className} text-white/60 leading-relaxed`}>
                                            {pillar.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>

                    {/* Final CTA */}
                    <motion.section
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="text-center py-20 relative"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-white/5 to-transparent blur-3xl" />

                        <div className="relative">
                            <h2 className={`${playfair.className} text-5xl md:text-6xl font-bold mb-8 text-white`}>
                                Join the Inner Circle
                            </h2>

                            <p className={`${inter.className} text-xl text-white/70 max-w-3xl mx-auto mb-6 leading-relaxed`}>
                                We are building a community of individuals who refuse to accept mediocrity.
                            </p>

                            <p className={`${inter.className} text-xl text-white max-w-3xl mx-auto mb-12 leading-relaxed font-medium`}>
                                The question is not whether you're capable of excellence.<br />
                                The question is whether you're willing to commit to the systems that make it inevitable.
                            </p>

                            <Link href="/register">
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button size="lg" className="bg-white text-black hover:bg-white/90 font-serif text-base px-16 py-10 uppercase tracking-widest relative overflow-hidden group">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                            initial={{ x: "-100%" }}
                                            whileHover={{ x: "100%" }}
                                            transition={{ duration: 0.6 }}
                                        />
                                        <span className="relative z-10">Apply for Membership</span>
                                    </Button>
                                </motion.div>
                            </Link>
                        </div>
                    </motion.section>
                </main>

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
