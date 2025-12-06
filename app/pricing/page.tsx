'use client'

import { Playfair_Display, Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navigation } from "@/components/navigation";
import { Check, Sparkles } from "lucide-react";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

const tiers = [
    {
        name: "Initiate",
        price: "Free",
        description: "Begin your journey toward excellence",
        features: [
            "Access to 3 core systems",
            "Basic tracking & analytics",
            "Mobile & desktop access",
            "Community forum access",
            "Monthly progress reports"
        ],
        cta: "Start Free",
        href: "/register",
        featured: false
    },
    {
        name: "Member",
        price: "$29",
        period: "/month",
        description: "For those committed to systematic growth",
        features: [
            "All 8 systems unlocked",
            "Advanced analytics & insights",
            "Custom views & workflows",
            "Priority support",
            "Weekly coaching emails",
            "Export & backup data",
            "Integration with tools"
        ],
        cta: "Become a Member",
        href: "/register",
        featured: true
    },
    {
        name: "Inner Circle",
        price: "$99",
        period: "/month",
        description: "The pinnacle of personal excellence",
        features: [
            "Everything in Member",
            "1-on-1 monthly coaching call",
            "Exclusive mastermind access",
            "Custom system design",
            "Lifetime updates",
            "VIP community events",
            "Personal accountability partner",
            "Legacy planning tools"
        ],
        cta: "Join Inner Circle",
        href: "/register",
        featured: false
    }
];

export default function PricingPage() {
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
                    className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
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
                    className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"
                />

                <div className="absolute inset-0 opacity-[0.02]">
                    <svg width="100%" height="100%">
                        <defs>
                            <pattern id="pricing-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                                <path d="M 80 0 L 0 0 0 80" fill="none" stroke="white" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#pricing-grid)" />
                    </svg>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10">
                <Navigation />
                <div className="h-20" />

                {/* Header */}
                <motion.header
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="py-20 px-4 text-center border-b border-white/10"
                >
                    <div className="inline-flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-white/60" />
                        <p className="text-xs uppercase tracking-[0.4em] text-white/40">Investment in Excellence</p>
                        <Sparkles className="w-4 h-4 text-white/60" />
                    </div>
                    <h1 className={`${playfair.className} text-6xl md:text-8xl font-medium mb-6 text-white`}>
                        Membership Tiers
                    </h1>
                    <p className={`${inter.className} text-xl text-white/60 max-w-3xl mx-auto font-light leading-relaxed`}>
                        Choose the level of commitment that matches your ambition
                    </p>
                </motion.header>

                {/* Pricing Cards */}
                <main className="max-w-7xl mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -10 }}
                                className="relative group"
                            >
                                <div className={`absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur ${tier.featured ? 'opacity-50' : ''}`} />

                                <div className={`relative ${tier.featured
                                        ? 'bg-white/10 border-2 border-white/30'
                                        : 'bg-white/5 border border-white/10'
                                    } p-8 group-hover:border-white/40 transition-all duration-500 h-full flex flex-col`}>
                                    {tier.featured && (
                                        <motion.div
                                            initial={{ y: -20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-1 text-xs uppercase tracking-widest font-bold"
                                        >
                                            Most Popular
                                        </motion.div>
                                    )}

                                    <div className="text-center mb-8">
                                        <h3 className={`${playfair.className} text-3xl font-bold mb-2 text-white`}>
                                            {tier.name}
                                        </h3>
                                        <p className={`${inter.className} text-sm text-white/50 mb-6`}>
                                            {tier.description}
                                        </p>
                                        <div className="flex items-baseline justify-center gap-1">
                                            <span className={`${playfair.className} text-6xl font-bold text-white`}>
                                                {tier.price}
                                            </span>
                                            {tier.period && (
                                                <span className="text-white/40 text-sm">{tier.period}</span>
                                            )}
                                        </div>
                                    </div>

                                    <ul className="space-y-4 mb-8 flex-1">
                                        {tier.features.map((feature, i) => (
                                            <motion.li
                                                key={feature}
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: 0.5 + i * 0.05 }}
                                                className="flex items-start gap-3"
                                            >
                                                <Check className="w-5 h-5 text-white/60 flex-shrink-0 mt-0.5" />
                                                <span className={`${inter.className} text-sm text-white/70`}>
                                                    {feature}
                                                </span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    <Link href={tier.href} className="block">
                                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                            <Button
                                                className={`w-full font-serif text-sm uppercase tracking-widest transition-all duration-300 relative overflow-hidden ${tier.featured
                                                        ? 'bg-white text-black hover:bg-white/90'
                                                        : 'bg-transparent border border-white text-white hover:bg-white hover:text-black'
                                                    }`}
                                            >
                                                {tier.featured && (
                                                    <motion.div
                                                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                                                        initial={{ x: "-100%" }}
                                                        whileHover={{ x: "100%" }}
                                                        transition={{ duration: 0.6 }}
                                                    />
                                                )}
                                                <span className="relative z-10">{tier.cta}</span>
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Final CTA */}
                    <motion.section
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="mt-32 text-center bg-white/5 border border-white/10 p-16"
                    >
                        <h2 className={`${playfair.className} text-5xl font-bold mb-6 text-white`}>
                            Ready to Begin?
                        </h2>
                        <p className={`${inter.className} text-lg text-white/60 max-w-2xl mx-auto mb-10`}>
                            Join a community of individuals who refuse to settle for mediocrity
                        </p>
                        <Link href="/register">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button size="lg" className="bg-white text-black hover:bg-white/90 font-serif text-base px-12 py-8 uppercase tracking-widest relative overflow-hidden">
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
                    </motion.section>
                </main>

                {/* Footer */}
                <footer className="py-8 text-center border-t border-white/10 mt-20 relative">
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
