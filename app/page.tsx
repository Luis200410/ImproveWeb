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

export default function Home() {
  const [mediaType, setMediaType] = useState<'video' | 'image'>('image');

  // Asset URLs
  const currentMedia = {
    src: '/logo final.png',
    background: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
    title: 'IMPROVE Integrity',
    date: 'EST. MMXXIV',
    scrollToExpand: 'SCROLL TO START'
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {/* SEO Headline */}
      <h1 className="sr-only">
        IMPROVE — Complete Integrity | All-In-One Self-Improvement & Personal Mastery System
      </h1>



      <ScrollExpandMedia
        mediaType={mediaType}
        mediaSrc={currentMedia.src}
        bgImageSrc={currentMedia.background}
        title={currentMedia.title}
        date={currentMedia.date}
        scrollToExpand={currentMedia.scrollToExpand}
        textBlend
      >
        <div className="relative z-20 bg-black pt-20">
          {/* Why IMPROVE Section */}
          <section className="py-32 px-6 relative">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <h2 className={`${bebas.className} text-6xl md:text-7xl font-bold mb-6 text-white`}>
                  Why IMPROVE?
                </h2>
                <p className={`${bebas.className} text-xl text-white/60 max-w-3xl mx-auto`}>
                  Excellence is the byproduct of Complete Integrity. Manage every dimension of your human experience.
                </p>
                <div className="mt-4 text-white/20 text-[10px] uppercase tracking-[0.4em]">
                  The Comprehensive "IMPROVE" Operating System
                </div>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-12">
                {[
                  {
                    title: "Holistic Integration",
                    desc: "Most productivity systems focus on one area. IMPROVE covers all eight pillars of a well-lived life.",
                    icon: "🎯"
                  },
                  {
                    title: "Timeless Principles",
                    desc: "Built on wisdom that has guided high achievers for centuries, not fleeting trends.",
                    icon: "📚"
                  },
                  {
                    title: "Measurable Progress",
                    desc: "Track what matters with precision. What gets measured gets improved.",
                    icon: "📊"
                  },
                  {
                    title: "Beautiful Design",
                    desc: "Tools you actually want to use. Elegance and functionality in perfect harmony.",
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

          {/* The Eight Systems Preview */}
          <section className="py-32 px-6 relative border-t border-white/10">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center mb-20"
              >
                <h2 className={`${bebas.className} text-6xl md:text-7xl font-bold mb-6 text-white`}>
                  Eight Systems.<br />One Life.
                </h2>
                <p className={`${bebas.className} text-xl text-white/60 max-w-3xl mx-auto mb-8`}>
                  Systematize your pursuit of Complete Integrity.
                </p>
                <Link href="/sales">
                  <Button variant="ghost" className="text-white/60 hover:text-white border border-white/20 hover:border-white/40">
                    Explore The Complete System →
                  </Button>
                </Link>
              </motion.div>

              <div className="mt-8">
                <EightSystemsAccordion />
              </div>
            </div>
          </section>

          {/* Social Proof / Stats */}
          <section className="py-32 px-6 relative">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative bg-white/5 border border-white/10 p-16 text-center"
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
                  Your Move
                </h2>

                <p className={`${bebas.className} text-2xl text-white/70 mb-6 leading-relaxed`}>
                  You can continue as you are—hoping, wishing, trying.
                </p>

                <p className={`${bebas.className} text-2xl text-white mb-12 leading-relaxed font-medium`}>
                  Or you can adopt the operating system for Complete Integrity.
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
                        <span className="relative z-10">Start Your Journey</span>
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
      </ScrollExpandMedia>
    </div>
  );
}
