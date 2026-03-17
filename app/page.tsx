'use client'

import Link from "next/link";
import { Bebas_Neue } from "@/lib/font-shim";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import { EightSystemsAccordion } from "@/components/ui/interactive-image-accordion";
import { ImproveLogo } from "@/components/ui/improve-logo";
import Image from "next/image";

const bebas = Bebas_Neue({ subsets: ["latin"] });

const improveWords = [
  { letter: "I", word: "Intentional", description: "Living" },
  { letter: "M", word: "Mastery", description: "Seeking" },
  { letter: "P", word: "Progress", description: "Tracking" },
  { letter: "R", word: "Refinement", description: "Continuous" },
  { letter: "O", word: "Optimization", description: "Personal" },
  { letter: "V", word: "Vision", description: "Driven" },
  { letter: "E", word: "Excellence", description: "Pursuing" },
];

import ScrollExpandMedia from "@/components/ui/scroll-expansion-hero";
import { SystemConvergenceAnimation } from "@/components/ui/system-convergence-animation";
import { CompleteIntegritySection } from "@/components/ui/complete-integrity-section";
import { PotentialBridgeAnimation } from "@/components/ui/potential-bridge-animation";

export default function Home() {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');
  const bridgeRef = useRef<HTMLElement>(null);
  const systemsRef = useRef<HTMLElement>(null);

  const scrollToBridge = () => {
    if (bridgeRef.current) {
      const targetPosition = bridgeRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Asset URLs
  const currentMedia = {
    src: '/logo_final.png',
    background: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
    title: 'IMPROVE Integrity',
    date: 'EST. MMXXIV',
    scrollToExpand: 'SCROLL TO START'
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* 1. Hero: System Convergence Animation */}
      <section className="w-full px-6 pt-12 md:pt-20 pb-0 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <SystemConvergenceAnimation onComplete={scrollToBridge} />
        </div>
      </section>

      {/* 2. The Bridge Animation (Second 34 sequence) */}
      <section ref={bridgeRef} className="w-full px-6 pb-20 pt-20 min-h-screen flex items-center justify-center border-t border-white/5">
        <div className="max-w-4xl mx-auto w-full">
          <PotentialBridgeAnimation />
        </div>
      </section>

      {/* 3. The Eight Systems Preview (Moved Up) */}
      <section ref={systemsRef} className="py-32 px-6 relative border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className={`${bebas.className} text-6xl md:text-7xl font-bold mb-6 text-white`}>
              Eight Systems.<br />The Engines of Progress.
            </h2>
            <p className={`${bebas.className} text-xl text-white/60 max-w-3xl mx-auto mb-8`}>
              The infrastructure of your life, divided into eight optimized engines. This is the hardware for your potential.
            </p>
          </motion.div>

          <div className="mt-8">
            <EightSystemsAccordion />
          </div>
        </div>
      </section>

      <div className="relative z-20 bg-black">
          {/* Why IMPROVE Section */}
          <section id="why" className="relative py-32 px-6">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <h1 className={`${bebas.className} text-6xl md:text-8xl font-bold mb-6 text-white uppercase tracking-tighter`}>
                  Stop Managing Tasks. Start Operating Your Life.
                </h1>
                <h2 className={`${bebas.className} text-xl md:text-2xl text-white/40 mb-8 uppercase tracking-[0.2em] max-w-4xl mx-auto leading-relaxed`}>
                  Most productivity tools fail because they only track to-dos. IMPROVE is the definitive All-in-One Life Operating System and Second Brain designed to turn your daily chaos into a systematic journey toward excellence.
                </h2>
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
                  <Link href="/register">
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bebas text-lg px-12 py-8 uppercase tracking-widest">
                      Install Your Life OS
                    </Button>
                  </Link>
                  <Link href="/sales">
                    <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/10 font-bebas text-lg px-12 py-8 uppercase tracking-widest">
                      Watch the System in Action
                    </Button>
                  </Link>
                </div>
                <div className="mt-4 text-white/20 text-[10px] uppercase tracking-[0.4em]">
                  The Comprehensive "IMPROVE" Life Operating System
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="flex flex-col gap-20 border-t border-white/10 pt-32 mb-32"
              >
                <div className="grid md:grid-cols-2 gap-20 items-center">
                  <div className="space-y-6">
                    <h2 className={`${bebas.className} text-5xl md:text-6xl font-bold text-white uppercase`}>
                      One System. Zero Friction.
                    </h2>
                    <div className="h-1 w-20 bg-white" />
                  </div>
                  <p className={`${bebas.className} text-xl text-white/60 leading-relaxed`}>
                    Why use five different apps when you can run your life on one operating system? IMPROVE replaces your scattered notes, habit trackers, and spreadsheets with a unified technical framework. We bridge the gap between information and action, converting your data into Practical Labs for continuous growth.
                  </p>
                </div>
                
                <div className="w-full">
                  <CompleteIntegritySection />
                </div>
              </motion.div>

                <div className="grid md:grid-cols-2 gap-12">
                {[
                  {
                    title: "Systematic Discipline",
                    desc: "Replace willpower with architecture. Your environment and systems do the heavy lifting for you.",
                    icon: "⚙️"
                  },
                  {
                    title: "Timeless Principles",
                    desc: "Built on wisdom that has guided high achievers for centuries, not fleeting trends.",
                    icon: "📚"
                  },
                  {
                    title: "All-in-One Cortex",
                    desc: "One central command for your body, bank account, and brain. Zero context switching.",
                    icon: "🧠"
                  },
                  {
                    title: "Beautiful Design",
                    desc: "Tools you actually want to use. Industrial elegance meets high-performance functionality.",
                    icon: "✨"
                  }
                ].map((feature, i) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.05, y: -10 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-b from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur" />
                    <div className="relative bg-white/5 border border-white/10 p-8 group-hover:border-white/30 transition-all duration-500">
                      <div className="text-5xl mb-4">{feature.icon}</div>
                      <h3 className={`${bebas.className} text-2xl font-bold text-white mb-3`}>
                        {feature.title}
                      </h3>
                      <p className={`${bebas.className} text-white/60 leading-relaxed`}>
                        {feature.desc}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>


          {/* Social Proof / Authority */}
          <section className="py-32 px-6 relative border-t border-white/10">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <h2 className={`${bebas.className} text-5xl md:text-7xl font-bold text-white mb-6 uppercase tracking-tighter`}>
                  Excellence is not an accident—it's a choice of System.
                </h2>
                <p className={`${bebas.className} text-xl text-white/60 max-w-3xl mx-auto leading-relaxed`}>
                  Built on timeless principles and modern software architecture, IMPROVE is for those who refuse to leave their potential to chance. Join the community of high-achievers who have moved beyond "trying" to systematic winning.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative bg-white/5 border border-white/10 p-16 text-center overflow-hidden"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-2xl opacity-50" />
                <div className="relative">
                  <p className={`${bebas.className} text-4xl md:text-5xl italic text-white/90 mb-8 leading-relaxed`}>
                    "The difference between who you are and who you want to be is what you do."
                  </p>
                  <p className={`${bebas.className} text-white/40 uppercase tracking-widest text-sm`}>
                    — Bill Phillips
                  </p>
                </div>
              </motion.div>
            </div>
          </section>
          {/* Final CTA */}
          <section className="py-16 px-6 relative border-t border-white/10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <h2 className={`${bebas.className} text-6xl md:text-7xl font-bold mb-8 text-white`}>
                  Ready to upgrade your life's hardware?
                </h2>

                <p className={`${bebas.className} text-2xl text-white/70 mb-12 max-w-2xl mx-auto leading-relaxed`}>
                  Join IMPROVE today and get the tools, resources, and practical labs to master all 8 pillars of a well-lived life.
                </p>

                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/register">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="bg-white text-black hover:bg-white/90 font-bebas text-base px-16 py-10 uppercase tracking-widest relative overflow-hidden group">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                          initial={{ x: "-100%" }}
                          whileHover={{ x: "100%" }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative z-10">Start Your Journey to Excellence</span>
                      </Button>
                    </motion.div>
                  </Link>
                  <Link href="/pricing">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="ghost" size="lg" className="font-bebas text-base text-white/80 hover:text-white px-16 py-10 uppercase tracking-widest border border-white/20 hover:border-white/40">
                        View Membership Options
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Footer with fade in */}
          <footer className="py-8 text-center border-t border-white/10 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="relative z-10">
              <p className={`${bebas.className} text-white/30 italic text-sm`}>
                "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
              </p>
              <p className={`${bebas.className} text-white/20 text-xs mt-2 uppercase tracking-widest`}>
                — Aristotle
              </p>
            </div>
          </footer>
        </div>
    </div>
  );
}
