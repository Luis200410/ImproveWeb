"use client";

import { PricingTable, PricingFeature, PricingPlan } from "@/components/blocks/pricing-table";

const features: PricingFeature[] = [
    { name: "Global Cognitive Dashboard", included: "starter" },
    { name: "Integrated Task Protocols", included: "starter" },
    { name: "Basic Support Line", included: "starter" },
    { name: "Advanced System Analytics", included: "pro" },
    { name: "Full Logic Core Access", included: "pro" },
    { name: "Priority Command Support", included: "pro" },
    { name: "Neural Network Integrations", included: "all" },
    { name: "Unlimited Strategic Nodes", included: "all" },
    { name: "24/7 Deepmind Protocol", included: "all" },
];

const plans: PricingPlan[] = [
    {
        name: "Starter",
        level: "starter",
        price: { monthly: 19, yearly: 180 },
    },
    {
        name: "Pro",
        level: "pro",
        price: { monthly: 49, yearly: 480 },
        popular: true,
    },
    {
        name: "Enterprise",
        level: "all",
        price: { monthly: 99, yearly: 990 },
    },
];

export default function PricingPreview() {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black font-sans">
            {/* Background Effects consistent with system pages */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px] opacity-20" />
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-amber-500/10 rounded-full blur-[100px] opacity-20" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            </div>



            <main className="relative pt-40 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24 space-y-6">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <div className="h-px w-12 bg-orange-500/30" />
                            <span className="text-[10px] uppercase tracking-[0.6em] font-black text-white/20">The School of Excellence</span>
                            <div className="h-px w-12 bg-orange-500/30" />
                        </div>
                        <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-white uppercase italic leading-[0.85]">
                            Strategic <span className="text-white/20">Matrix</span>
                        </h1>
                        <p className="text-white/40 text-xs uppercase tracking-[0.5em] font-medium">
                            Authorization Level Selection & System Access
                        </p>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-b from-orange-500/10 to-transparent blur-3xl opacity-20 -z-10" />
                        <PricingTable
                            features={features}
                            plans={plans}
                            defaultPlan="pro"
                            defaultInterval="monthly"
                            onPlanSelect={(plan: string) => console.log("Protocol transition initiated:", plan)}
                        />
                    </div>
                </div>
            </main>

            {/* Footer consistent with Home Page */}
            <footer className="py-12 text-center border-t border-white/5 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/[0.02] via-transparent to-transparent pointer-events-none" />
                <div className="relative z-10 space-y-2">
                    <p className="text-white/20 italic text-[10px] tracking-widest uppercase">
                        "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
                    </p>
                    <p className="text-white/10 text-[8px] uppercase tracking-[0.4em] font-black">
                        — Aristotle
                    </p>
                </div>
            </footer>
        </div>
    );
}

export { PricingPreview }
