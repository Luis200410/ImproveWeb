'use server'

import { Playfair_Display, Inter } from "@/lib/font-shim";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Navigation } from "@/components/navigation";
import { Check, Sparkles } from "lucide-react";
import { PricingCTA } from "@/components/pricing-cta";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

const tiers = [
    {
        name: "Origin",
        price: "$10",
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
        priceId: null,
        url: "https://buy.stripe.com/00w3cw2hD1Q8bah95n4sE00",
        featured: true
    },
    {
        name: "Momentum",
        price: "$20",
        period: "/month",
        description: "Scale your systems with deeper support",
        features: [
            "Everything in Origin",
            "Priority support",
            "Extended analytics and exports",
            "Early access to new systems",
            "VIP community calls"
        ],
        cta: "Join Momentum",
        priceId: null,
        url: "https://buy.stripe.com/5kQ7sM7BX0M44LTbdv4sE01",
        featured: false
    },
    {
        name: "Praxis",
        price: "$30",
        period: "/month",
        description: "Hands-on guidance and practice loops",
        features: [
            "Everything in Momentum",
            "1:1 monthly check-in",
            "Custom system tuning",
            "Beta access to new microapps",
            "Accountability workflows"
        ],
        cta: "Join Praxis",
        priceId: null,
        url: "https://buy.stripe.com/7sY9AU5tP52kceldlD4sE02",
        featured: false
    }
];

export default async function PricingPage() {
    return (
        <div className="min-h-screen bg-black text-white overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl opacity-30" />
                <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl opacity-20" />
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
                <header className="py-20 px-4 text-center border-b border-white/10">
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
                </header>

                {/* Pricing Cards */}
                <main className="max-w-7xl mx-auto px-6 py-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {tiers.map((tier, index) => (
                            <div key={tier.name} className="relative group">
                                <div className={`absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur ${tier.featured ? 'opacity-50' : ''}`} />

                                <div className={`relative ${tier.featured
                                        ? 'bg-white/10 border-2 border-white/30'
                                        : 'bg-white/5 border border-white/10'
                                    } p-8 group-hover:border-white/40 transition-all duration-500 h-full flex flex-col`}>
                                    {tier.featured && (
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-1 text-xs uppercase tracking-widest font-bold">
                                            Most Popular
                                        </div>
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
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-white/60 flex-shrink-0 mt-0.5" />
                                                <span className={`${inter.className} text-sm text-white/70`}>
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <PricingCTA label={tier.cta} priceId={tier.priceId} url={tier.url} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Final CTA */}
                    <section className="mt-32 text-center bg-white/5 border border-white/10 p-16">
                        <h2 className={`${playfair.className} text-5xl font-bold mb-6 text-white`}>
                            Ready to Begin?
                        </h2>
                        <p className={`${inter.className} text-lg text-white/60 max-w-2xl mx-auto mb-10`}>
                            Join a community of individuals who refuse to settle for mediocrity
                        </p>
                        <Link href="/register">
                            <Button size="lg" className="bg-white text-black hover:bg-white/90 font-serif text-base px-12 py-8 uppercase tracking-widest relative overflow-hidden">
                                <span className="relative z-10">Apply for Membership</span>
                            </Button>
                        </Link>
                    </section>
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
