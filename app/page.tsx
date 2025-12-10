'use client'

import Link from "next/link";
import { Playfair_Display, Inter } from "@/lib/font-shim";
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect } from "react";
import { Navigation } from "@/components/navigation";

const playfair = Playfair_Display({ subsets: ["latin"] });
const inter = Inter({ subsets: ["latin"] });

const improveWords = [
  { letter: "I", word: "Intentional", description: "Living" },
  { letter: "M", word: "Mastery", description: "Seeking" },
  { letter: "P", word: "Progress", description: "Tracking" },
  { letter: "R", word: "Refinement", description: "Continuous" },
  { letter: "O", word: "Optimization", description: "Personal" },
  { letter: "V", word: "Vision", description: "Driven" },
  { letter: "E", word: "Excellence", description: "Pursuing" },
];

export default function Home() {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % improveWords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl"
        />

        {/* Geometric Grid */}
        <div className="absolute inset-0 opacity-[0.03]">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Animated Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <motion.line
            x1="0" y1="20%"
            x2="100%" y2="20%"
            stroke="white"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          />
          <motion.line
            x1="0" y1="60%"
            x2="100%" y2="60%"
            stroke="white"
            strokeWidth="1"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: 1 }}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Navigation />

        {/* Spacer */}
        <div className="h-20" />

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 min-h-[90vh] relative">
          <motion.div style={{ opacity, scale }} className="max-w-7xl space-y-12 relative z-10">
            {/* Subtitle with animated underline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="relative inline-block"
            >
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-white/50">
                Est. 2025 • The School of Excellence
              </p>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 1 }}
                className="h-px bg-gradient-to-r from-transparent via-white/50 to-transparent mt-2"
              />
            </motion.div>

            {/* Main IMPROVE Title with stagger animation */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
                className={`${playfair.className} text-8xl md:text-[12rem] lg:text-[16rem] font-bold leading-none tracking-tighter relative`}
              >
                {improveWords.map((item, index) => (
                  <motion.span
                    key={item.letter}
                    initial={{ opacity: 0, y: 50, rotateX: -90 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{
                      delay: 0.7 + index * 0.1,
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{
                      scale: 1.1,
                      color: "rgba(255,255,255,0.6)",
                      transition: { duration: 0.2 }
                    }}
                    className="inline-block cursor-default relative"
                    style={{
                      textShadow: "0 0 40px rgba(255,255,255,0.1)"
                    }}
                  >
                    {item.letter}
                    {/* Glowing effect on hover */}
                    <motion.span
                      className="absolute inset-0 blur-xl opacity-0"
                      whileHover={{ opacity: 0.5 }}
                    >
                      {item.letter}
                    </motion.span>
                  </motion.span>
                ))}
              </motion.div>

              {/* Animated Word Meaning with slide transition */}
              <div className="h-32 flex flex-col items-center justify-center relative overflow-hidden">
                <motion.div
                  key={currentWordIndex}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute"
                >
                  <motion.p
                    className={`${inter.className} text-sm uppercase tracking-[0.3em] text-white/40 mb-2`}
                    initial={{ letterSpacing: "0.1em" }}
                    animate={{ letterSpacing: "0.3em" }}
                    transition={{ duration: 0.5 }}
                  >
                    {improveWords[currentWordIndex].description}
                  </motion.p>
                  <p className={`${playfair.className} text-5xl md:text-6xl font-light italic text-white/90 relative`}>
                    {improveWords[currentWordIndex].word}
                    <motion.span
                      className="absolute -bottom-2 left-0 h-px bg-gradient-to-r from-white/0 via-white/50 to-white/0"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.3, duration: 0.8 }}
                    />
                  </p>
                </motion.div>
              </div>
            </div>

            {/* Description with reveal animation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-white/5 via-white/10 to-white/5 blur-xl opacity-50" />
              <p className={`${inter.className} text-lg md:text-xl text-white/60 max-w-3xl mx-auto leading-relaxed font-light relative z-10 px-8 py-6`}>
                A heritage-inspired operating system for the ambitious.
                <br className="hidden md:block" />
                Master your body, wealth, work, relationships, mind, and legacy.
              </p>
            </motion.div>

            {/* CTA Buttons with hover effects */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="pt-12 flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Link href="/register">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    size="lg"
                    className="relative bg-white text-black hover:bg-white/90 font-serif text-base px-12 py-8 min-w-[240px] shadow-2xl uppercase tracking-widest overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.6 }}
                    />
                    <span className="relative z-10">Apply for Access</span>
                  </Button>
                </motion.div>
              </Link>
              <Link href="/about">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="ghost"
                    size="lg"
                    className="relative font-serif text-base hover:bg-white/5 text-white/80 hover:text-white px-12 py-8 uppercase tracking-widest border border-white/20 hover:border-white/40 transition-all duration-300 group overflow-hidden"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/5"
                      initial={{ scale: 0, opacity: 0 }}
                      whileHover={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    />
                    <span className="relative z-10">Our Manifesto</span>
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator with pulse */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 1 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-xs uppercase tracking-widest text-white/30">Scroll</span>
              <motion.div
                className="w-px h-16 bg-gradient-to-b from-transparent via-white/40 to-transparent relative"
              >
                <motion.div
                  className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-white/60 to-transparent"
                  animate={{ y: [0, 32, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        </main>

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
              <h2 className={`${playfair.className} text-6xl md:text-7xl font-bold mb-6 text-white`}>
                Why IMPROVE?
              </h2>
              <p className={`${inter.className} text-xl text-white/60 max-w-3xl mx-auto`}>
                Because excellence is not accidental—it's systematic
              </p>
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
                    <h3 className={`${playfair.className} text-2xl font-bold text-white mb-3`}>
                      {feature.title}
                    </h3>
                    <p className={`${inter.className} text-white/60 leading-relaxed`}>
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
              <h2 className={`${playfair.className} text-6xl md:text-7xl font-bold mb-6 text-white`}>
                Eight Systems.<br />One Life.
              </h2>
              <p className={`${inter.className} text-xl text-white/60 max-w-3xl mx-auto mb-8`}>
                Every dimension of human excellence, systematized
              </p>
              <Link href="/sales">
                <Button variant="ghost" className="text-white/60 hover:text-white border border-white/20 hover:border-white/40">
                  Explore The Complete System →
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: "💪", name: "Body", tagline: "Physical Excellence" },
                { icon: "💰", name: "Money", tagline: "Financial Mastery" },
                { icon: "💼", name: "Work", tagline: "Professional Growth" },
                { icon: "⚡", name: "Productivity", tagline: "Peak Performance" },
                { icon: "❤️", name: "Relationships", tagline: "Deep Connections" },
                { icon: "🧠", name: "Mind", tagline: "Mental Clarity" },
                { icon: "🎨", name: "Legacy", tagline: "Meaningful Life" },
                { icon: "🗂️", name: "Knowledge", tagline: "Wisdom Building" }
              ].map((system, i) => (
                <motion.div
                  key={system.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="relative group cursor-pointer"
                >
                  <div className="absolute -inset-1 bg-gradient-to-b from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
                  <div className="relative bg-white/5 border border-white/10 p-6 text-center group-hover:border-white/30 transition-all duration-300">
                    <div className="text-4xl mb-3">{system.icon}</div>
                    <div className={`${playfair.className} text-lg font-bold text-white mb-1`}>
                      {system.name}
                    </div>
                    <div className={`${inter.className} text-xs text-white/40`}>
                      {system.tagline}
                    </div>
                  </div>
                </motion.div>
              ))}
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
                <p className={`${playfair.className} text-4xl md:text-5xl italic text-white/90 mb-8 leading-relaxed`}>
                  "The difference between who you are and who you want to be is what you do."
                </p>
                <p className={`${inter.className} text-white/40 uppercase tracking-widest text-sm`}>
                  — Bill Phillips
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-32 px-6 relative border-t border-white/10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className={`${playfair.className} text-6xl md:text-7xl font-bold mb-8 text-white`}>
                Your Move
              </h2>

              <p className={`${inter.className} text-2xl text-white/70 mb-6 leading-relaxed`}>
                You can continue as you are—hoping, wishing, trying.
              </p>

              <p className={`${inter.className} text-2xl text-white mb-12 leading-relaxed font-medium`}>
                Or you can adopt a system designed to make excellence inevitable.
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/register">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button size="lg" className="bg-white text-black hover:bg-white/90 font-serif text-base px-16 py-10 uppercase tracking-widest relative overflow-hidden group">
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
                    <Button variant="ghost" size="lg" className="font-serif text-base text-white/80 hover:text-white px-16 py-10 uppercase tracking-widest border border-white/20 hover:border-white/40">
                      View Membership Options
                    </Button>
                  </motion.div>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer with fade in */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="py-8 text-center border-t border-white/10 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="relative z-10">
            <p className={`${playfair.className} text-white/30 italic text-sm`}>
              "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
            </p>
            <p className={`${inter.className} text-white/20 text-xs mt-2 uppercase tracking-widest`}>
              — Aristotle
            </p>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
