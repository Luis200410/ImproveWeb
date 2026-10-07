"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flame,
  CheckSquare,
  DollarSign,
  FileText,
  Bot,
  Calendar,
  Sun,
  Activity,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Cpu,
  ChevronRight,
  ChevronLeft,
  Pause,
  Play,
  Brain,
  Cloud,
} from "lucide-react";

// =========================================================================
// DATA SPECIFICATIONS
// =========================================================================

interface ChapterMeta {
  id: string;
  number: string;
  letter: string;
  accentColor: string;
  title: string;
  subtitle: string;
  tagline: string;
}

const CHAPTERS: ChapterMeta[] = [
  {
    id: "problem",
    number: "01",
    letter: "I",
    accentColor: "#ef4444",
    title: "THE FRAGMENTATION TRAP",
    subtitle: "Watch apps swarm, fracture & fly off-screen",
    tagline: "12 Subscriptions. Constant Friction. Attention Fractured.",
  },
  {
    id: "ecosystem",
    number: "02",
    letter: "P",
    accentColor: "#ff02e8",
    title: "THE UNIFIED ARCHITECTURE",
    subtitle: "Watch the neural core zoom & relay in 3D",
    tagline: "Everything Syncs Instantly. Zero App-Switching.",
  },
  {
    id: "sanctuary",
    number: "03",
    letter: "O",
    accentColor: "#22c55e",
    title: "THE SOVEREIGN SANCTUARY",
    subtitle: "Watch cloud spyware get blasted off-screen",
    tagline: "Apple Intelligence On-Device. 0 KB/s Cloud Exfiltration.",
  },
  {
    id: "investment",
    number: "04",
    letter: "E",
    accentColor: "#efb219",
    title: "THE SOVEREIGN INVESTMENT",
    subtitle: "Watch the SaaS invoice get sliced in half & ejected",
    tagline: "Own Your Life Operating System for $40 Once.",
  },
];

const ECOSYSTEM_PILLARS = [
  { letter: "I", name: "Relationships", subtitle: "Social Capital", color: "#cc0000", glow: "rgba(204, 0, 0, 0.9)", logo: "/RelationShips logo.svg" },
  { letter: "M", name: "Mind", subtitle: "Mental Clarity", color: "#6f1bd3", glow: "rgba(111, 27, 211, 0.9)", logo: "/mind Logo.svg" },
  { letter: "P", name: "Productivity", subtitle: "Execution Hub", color: "#ff02e8", glow: "rgba(255, 2, 232, 1)", logo: "/Productivity Logo.svg", isCore: true },
  { letter: "R", name: "Work", subtitle: "Career Mastery", color: "#2254f5", glow: "rgba(34, 84, 245, 0.9)", logo: "/Work Logo.svg" },
  { letter: "O", name: "Body", subtitle: "Physical Vitality", color: "#43b752", glow: "rgba(67, 183, 82, 0.9)", logo: "/Body Logo.svg" },
  { letter: "V", name: "Second Brain", subtitle: "Knowledge Hub", color: "#ff6900", glow: "rgba(255, 105, 0, 0.9)", logo: "/Second Brain Logo.svg", isCore: true },
  { letter: "E", name: "Money", subtitle: "Wealth Engine", color: "#efb219", glow: "rgba(239, 178, 25, 1)", logo: "/money Logo.svg" },
];

const FRAGMENTED_TOOLS = [
  { name: "Habit Tracker", cost: "$14/mo", icon: Flame, color: "#ef4444", status: "AUTO-BILLED $14", ejectDir: { x: -750, y: -400, r: -50 } },
  { name: "Budget App", cost: "$15/mo", icon: DollarSign, color: "#f59e0b", status: "SYNC CONFLICT", ejectDir: { x: 750, y: -400, r: 45 } },
  { name: "Task Manager", cost: "$10/mo", icon: CheckSquare, color: "#06b6d4", status: "RATE LIMITED", ejectDir: { x: -800, y: 180, r: -35 } },
  { name: "Notes App", cost: "$12/mo", icon: FileText, color: "#8b5cf6", status: "DATA SILO", ejectDir: { x: 800, y: 220, r: 40 } },
  { name: "AI Assistant", cost: "$20/mo", icon: Bot, color: "#10b981", status: "CLOUD LOGGED", ejectDir: { x: -700, y: 500, r: -55 } },
  { name: "Calendar Tool", cost: "$12/mo", icon: Calendar, color: "#3b82f6", status: "OUT OF SYNC", ejectDir: { x: 700, y: 500, r: 50 } },
  { name: "Fitness App", cost: "$15/mo", icon: Activity, color: "#f97316", status: "AUTO-BILLED $15", ejectDir: { x: -450, y: -550, r: -65 } },
  { name: "Meditation", cost: "$13/mo", icon: Sun, color: "#ec4899", status: "PRICE HIKE +25%", ejectDir: { x: 450, y: -550, r: 60 } },
];

// =========================================================================
// KINETIC TEXT WITH ZOOM PUNCH
// =========================================================================
function ZoomingHeadline({
  badge,
  badgeColor,
  statusText,
  titlePrefix,
  zoomWord,
  titleSuffix,
  subtitle,
}: {
  badge: string;
  badgeColor: string;
  statusText?: string;
  titlePrefix?: string;
  zoomWord: string;
  titleSuffix?: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.04, y: -10 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-1.5"
    >
      <div className="flex items-center gap-2">
        <span
          className="px-2.5 py-0.5 rounded-full border font-mono text-[11px] font-bold uppercase tracking-wider"
          style={{ backgroundColor: `${badgeColor}20`, borderColor: `${badgeColor}40`, color: badgeColor }}
        >
          {badge}
        </span>
        {statusText && (
          <span className="text-zinc-500 font-mono text-[11px] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: badgeColor }} />
            {statusText}
          </span>
        )}
      </div>

      <div className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase leading-snug">
        {titlePrefix && <span>{titlePrefix} </span>}
        <motion.span
          initial={{ scale: 0.65, opacity: 0 }}
          animate={{ scale: [0.65, 1.2, 1], opacity: 1 }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block drop-shadow-[0_0_25px_currentColor]"
          style={{ color: badgeColor }}
        >
          {zoomWord}
        </motion.span>
        {titleSuffix && <span> {titleSuffix}</span>}
      </div>

      <p className="text-xs sm:text-sm font-mono text-zinc-400 max-w-2xl">
        {subtitle}
      </p>
    </motion.div>
  );
}

// =========================================================================
// ODOMETER COUNTER
// =========================================================================
function KineticOdometer({
  target,
  prefix = "",
  suffix = "",
  duration = 1400,
}: {
  target: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [val, setVal] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    let animId: number;

    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setVal(Math.floor(eased * target));

      if (progress < 1) {
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

// =========================================================================
// SCENE 1: THE FRAGMENTATION TRAP
// =========================================================================
function MotionSceneOne() {
  const [beat, setBeat] = useState(0);

  // Slower, more deliberate cinematic pacing
  useEffect(() => {
    const t1 = setTimeout(() => setBeat(1), 1800);  // Cards swarm in, morning card flies off
    const t2 = setTimeout(() => setBeat(2), 5200);  // Laser slice: cards expelled off-screen
    const t3 = setTimeout(() => setBeat(3), 8800);  // Mega zoom punch into -$1,764 burn
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="ultra-glass-panel relative w-full min-h-[600px] overflow-hidden flex flex-col justify-between p-6 sm:p-8 border border-red-500/30 shadow-2xl">
      {/* Background Volumetric Pulse */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-red-600/30 blur-[130px] pointer-events-none"
      />

      {/* TOP: Dynamic Headline with Kinetic Zoom Punch */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((b) => (
              <button
                key={b}
                onClick={() => setBeat(b)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  beat === b ? "w-6 bg-red-500 shadow-[0_0_8px_#ef4444]" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
                title={`Jump to Beat ${b + 1}`}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            Beat {beat + 1} of 4 • Fragmentation Analysis
          </span>
        </div>

        <AnimatePresence mode="wait">
          {beat === 0 && (
            <ZoomingHeadline
              key="h1-0"
              badge="01 • THE MORNING CONFLICT"
              badgeColor="#ef4444"
              statusText="7:00 AM • UNIFIED INTENTION"
              titlePrefix="You Wake Up Ready To"
              zoomWord="CONQUER THE DAY"
              titleSuffix="With High Clarity"
              subtitle="Everything starts with a calm, focused intention. Until you unlock your screen."
            />
          )}
          {beat === 1 && (
            <ZoomingHeadline
              key="h1-1"
              badge="01 • SUBSCRIPTION OVERFLOW"
              badgeColor="#ef4444"
              statusText="12 APPS ACTIVE"
              titlePrefix="Then"
              zoomWord="12 DISCONNECTED APPS"
              titleSuffix="Demand Your Immediate Attention"
              subtitle="Habits in one app. Finances in another. Tasks in a third. Your focus is instantly scattered."
            />
          )}
          {beat === 2 && (
            <ZoomingHeadline
              key="h1-2"
              badge="01 • THE COGNITIVE FRACTURE"
              badgeColor="#ef4444"
              statusText="FRACTURE LASER ARMED"
              titlePrefix="Tool Switching Shreds Your Flow:"
              zoomWord="23 MINUTES LOST"
              titleSuffix="Per Switch"
              subtitle="Your brain exhausts its cognitive budget just remembering where critical information lives."
            />
          )}
          {beat === 3 && (
            <ZoomingHeadline
              key="h1-3"
              badge="01 • THE COMPILED BLEED"
              badgeColor="#ef4444"
              statusText="ANNUAL SUMMATION"
              titlePrefix="You Are Paying"
              zoomWord="-$1,764 EVERY YEAR"
              titleSuffix="Just To Manage Chaos"
              subtitle="Zero compounded equity. Zero unified intelligence. Perpetual recurring price hikes."
            />
          )}
        </AnimatePresence>
      </div>

      {/* CENTER STAGE: Physical Influx & Dramatic Off-Screen Ejections */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-4 z-10 overflow-visible">
        {/* BEAT 0: Peaceful Morning Card (Flies Off-Screen on Beat 1) */}
        <AnimatePresence>
          {beat === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                x: -800, // FLIES HARD OFF-SCREEN TO THE LEFT
                y: -120,
                rotate: -45,
                scale: 0.25,
                opacity: 0,
                transition: { duration: 0.8, ease: "easeIn" },
              }}
              className="p-6 rounded-3xl border border-white/15 bg-white/[0.03] backdrop-blur-[8px] flex flex-col items-center gap-3 text-center shadow-2xl max-w-sm absolute"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/15 backdrop-blur-[6px] flex items-center justify-center">
                <Sun className="w-8 h-8 text-amber-400 animate-spin" style={{ animationDuration: "14s" }} />
              </div>
              <div className="font-mono text-sm font-bold text-white">7:00 AM • Single Clear Intention</div>
              <p className="text-xs text-zinc-400 font-mono">
                Everything is quiet and calm... until your subscription suite wakes up.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BEAT 1 & 2: 8 Subscription Cards Influx -> Half Fly Off-Screen! */}
        {beat >= 1 && beat <= 2 && (
          <div className="w-full max-w-2xl relative">
            {/* Red Laser Crack Beam that triggers the card ejection */}
            {beat === 2 && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{
                  scaleX: 1,
                  opacity: [0, 1, 0.9],
                  boxShadow: ["0 0 0px #ef4444", "0 0 45px #ef4444", "0 0 15px #ef4444"],
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[3px] bg-red-500 z-30 pointer-events-none"
              />
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
              {FRAGMENTED_TOOLS.map((tool, idx) => {
                const Icon = tool.icon;
                const isEjected = beat === 2 && idx % 2 === 0;

                return (
                  <motion.div
                    key={tool.name}
                    initial={{
                      opacity: 0,
                      x: idx % 2 === 0 ? -500 : 500, // Flying in from outer screen boundaries
                      y: idx < 4 ? -400 : 400,
                      scale: 0.2,
                      rotate: idx % 2 === 0 ? -30 : 30,
                    }}
                    animate={
                      isEjected
                        ? {
                            // CARD FLIES OFF-SCREEN!
                            x: tool.ejectDir.x,
                            y: tool.ejectDir.y,
                            rotate: tool.ejectDir.r,
                            scale: 0.25,
                            opacity: 0,
                          }
                        : {
                            opacity: 1,
                            x: 0,
                            y: beat === 2 ? (idx % 2 === 0 ? -12 : 12) : 0,
                            scale: beat === 2 ? 1.05 : 1,
                            rotate: beat === 2 ? (idx % 2 === 0 ? -6 : 6) : 0,
                          }
                    }
                    transition={{
                      delay: isEjected ? 0.08 * idx : idx * 0.08,
                      duration: isEjected ? 0.85 : 0.7,
                      ease: isEjected ? "easeIn" : [0.34, 1.4, 0.64, 1],
                    }}
                    className="p-3.5 rounded-2xl border border-red-500/30 bg-white/[0.03] backdrop-blur-[8px] flex flex-col justify-between space-y-2 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${tool.color}25`, border: `1px solid ${tool.color}60` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: tool.color }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-red-400 bg-red-950/90 px-2 py-0.5 rounded border border-red-500/40">
                        {tool.cost}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-mono font-bold text-white block truncate">
                        {tool.name}
                      </span>
                      <div className="flex items-center gap-1 mt-1 text-[9px] font-mono text-red-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping shrink-0" />
                        <span className="truncate">{tool.status}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* BEAT 3: DRAMATIC CAMERA ZOOM PUNCH INTO THE FINANCIAL BURNOUT */}
        {beat === 3 && (
          <motion.div
            initial={{ scale: 0.15, opacity: 0, y: 120 }}
            animate={{ scale: [0.15, 1.25, 1], opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="p-6 sm:p-8 rounded-3xl border-2 border-red-500 bg-gradient-to-br from-red-950/80 via-black to-zinc-950 backdrop-blur-2xl flex flex-col items-center text-center shadow-[0_0_80px_rgba(239,68,68,0.5)] max-w-lg w-full relative z-20"
          >
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY }}
              className="absolute inset-0 rounded-3xl border border-red-500 pointer-events-none"
            />

            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/60 flex items-center justify-center mb-3">
              <AlertTriangle className="w-8 h-8 text-red-400 animate-bounce" />
            </div>

            <div className="text-xs font-mono font-bold text-red-300 uppercase tracking-widest mb-1">
              COMPOUNDED ANNUAL SUBSCRIPTION LOSS
            </div>

            <div className="text-4xl sm:text-6xl font-black font-mono text-red-400 drop-shadow-[0_0_25px_rgba(239,68,68,1)] my-2">
              -<KineticOdometer target={1764} prefix="$" suffix="/yr" duration={1400} />
            </div>

            <p className="text-xs sm:text-sm font-mono text-zinc-300 max-w-sm mt-1">
              12 disconnected tools. 23 minutes lost per context switch. Zero compounding equity.
            </p>
          </motion.div>
        )}
      </div>

      {/* BOTTOM STAGE: Real-time Attention Meter */}
      <div className="relative z-10 pt-2 border-t border-red-500/20">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-red-400" />
            <span className="text-zinc-400">Cognitive Focus State:</span>
            <span className="text-white font-bold">
              {beat >= 2 ? "19% (Attention Shredded)" : "100% Focused"}
            </span>
          </div>

          <button
            onClick={() => setBeat((b) => (b + 1) % 4)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 hover:bg-red-900/60 transition-all cursor-pointer text-[11px]"
          >
            <span>Next Beat ({beat + 1}/4)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
function MotionSceneTwo() {
  const [beat, setBeat] = useState(0);
  const [focusedPillar, setFocusedPillar] = useState(2); // Focus on Productivity

  // Slower, more deliberate pacing
  useEffect(() => {
    const t1 = setTimeout(() => setBeat(1), 1800);  // Radial expansion
    const t2 = setTimeout(() => setBeat(2), 5200);  // Focused pillar mega-punch
    const t3 = setTimeout(() => setBeat(3), 8800);  // Unified bus lock
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const active = ECOSYSTEM_PILLARS[focusedPillar];

  // Exact coordinates for a balanced 7-pillar celestial constellation:
  // Center is (340, 160), Radius R = 115
  const PILLAR_COORDS = [
    { x: 340, y: 45, labelX: 340, labelY: 16, anchor: "middle" },      // 0: Relationships (Top / 12 o'clock)
    { x: 432, y: 88, labelX: 476, labelY: 88, anchor: "start" },       // 1: Mind (Top-Right)
    { x: 454, y: 186, labelX: 498, labelY: 186, anchor: "start" },     // 2: Productivity (Right)
    { x: 390, y: 264, labelX: 412, labelY: 300, anchor: "start" },     // 3: Work (Bottom-Right)
    { x: 290, y: 264, labelX: 268, labelY: 300, anchor: "end" },       // 4: Body (Bottom-Left)
    { x: 226, y: 186, labelX: 182, labelY: 186, anchor: "end" },       // 5: Second Brain (Left)
    { x: 248, y: 88, labelX: 204, labelY: 88, anchor: "end" },        // 6: Money (Top-Left)
  ];

  return (
    <div className="ultra-glass-panel relative w-full min-h-[600px] overflow-hidden flex flex-col justify-between p-6 sm:p-8 border border-fuchsia-500/30 shadow-2xl">
      {/* Background Volumetric Magenta Flare */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-fuchsia-600/30 blur-[130px] pointer-events-none"
      />

      {/* TOP: Dynamic Headline with Kinetic Zoom Punch */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((b) => (
              <button
                key={b}
                onClick={() => setBeat(b)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  beat === b ? "w-6 bg-fuchsia-500 shadow-[0_0_8px_#ff02e8]" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
                title={`Jump to Beat ${b + 1}`}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            Beat {beat + 1} of 4 • Unified Core Architecture
          </span>
        </div>

        <AnimatePresence mode="wait">
          {beat === 0 && (
            <ZoomingHeadline
              key="h2-0"
              badge="02 • SYSTEMIC GENESIS"
              badgeColor="#ff02e8"
              statusText="IGNITING NEURAL CORE"
              titlePrefix="What If Your Entire Life Shared"
              zoomWord="ONE NERVOUS SYSTEM?"
              titleSuffix=""
              subtitle="One underlying relational database syncing habits, projects, finances, and journal."
            />
          )}
          {beat === 1 && (
            <ZoomingHeadline
              key="h2-1"
              badge="02 • THE 7 SACRED PILLARS"
              badgeColor="#ff02e8"
              statusText="RADIAL EXPANSION"
              titlePrefix="The"
              zoomWord="7 SOVEREIGN PILLARS"
              titleSuffix="Launch Into Orbit"
              subtitle="Relationships. Mind. Productivity. Work. Body. Second Brain. Money."
            />
          )}
          {beat === 2 && (
            <ZoomingHeadline
              key={`h2-2-${focusedPillar}`}
              badge="02 • INSTANTANEOUS CAUSAL RELAY"
              badgeColor={active.color}
              statusText={`LIVE: ${active.name.toUpperCase()}`}
              titlePrefix="Deep Zoom Punch:"
              zoomWord={active.name.toUpperCase()}
              titleSuffix="Syncs Real-Time State"
              subtitle="Update a habit streak, and your calendar, daily tasks & budget adapt in 0ms."
            />
          )}
          {beat === 3 && (
            <ZoomingHeadline
              key="h2-3"
              badge="02 • UNIFIED CLARITY"
              badgeColor="#ff02e8"
              statusText="0MS LATENCY LOCKED"
              titlePrefix="Zero App-Switching:"
              zoomWord="ZERO COPY-PASTING"
              titleSuffix="Ever Again"
              subtitle="Everything operates as one living, compounding life operating system."
            />
          )}
        </AnimatePresence>
      </div>

      {/* CENTER STAGE: Majestic 7-Pillar Radial Orbital Architecture */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-3 z-10">
        <div className="w-full max-w-[680px] relative">
          <svg className="w-full h-auto overflow-visible select-none" viewBox="0 0 680 340" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="scene2ReactorGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur1" />
                <feGaussianBlur stdDeviation="2" result="blur2" />
                <feMerge>
                  <feMergeNode in="blur1" />
                  <feMergeNode in="blur2" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="orbitalConduitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ff02e8" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#efb219" />
              </linearGradient>
            </defs>

            {/* Circular Orbital Guide Tracks */}
            <circle cx="340" cy="160" r="115" stroke="rgba(255,2,232,0.18)" strokeWidth="1.5" strokeDasharray="6 8" fill="none" />
            <circle cx="340" cy="160" r="65" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="3 6" fill="none" />

            {/* Heptagonal Constellation Perimeter Lines Connecting Adjacent Pillars */}
            <g stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" strokeDasharray="4 6" fill="none">
              {PILLAR_COORDS.map((coord, i) => {
                const next = PILLAR_COORDS[(i + 1) % PILLAR_COORDS.length];
                return (
                  <line
                    key={`hept-${i}`}
                    x1={coord.x}
                    y1={coord.y}
                    x2={next.x}
                    y2={next.y}
                  />
                );
              })}
            </g>

            {/* Radial Laser Conduits from Central Core (340, 160) to Each Pillar */}
            {ECOSYSTEM_PILLARS.map((p, idx) => {
              const pos = PILLAR_COORDS[idx];
              const isTarget = focusedPillar === idx && beat >= 2;

              return (
                <g key={`conduit-${p.letter}`}>
                  <line
                    x1="340"
                    y1="160"
                    x2={pos.x}
                    y2={pos.y}
                    stroke={isTarget ? p.color : "rgba(255,255,255,0.08)"}
                    strokeWidth={isTarget ? 3.5 : 1}
                    filter={isTarget ? "url(#scene2ReactorGlow)" : undefined}
                  />

                  {/* Flowing Data Laser Packet along the radial ray */}
                  {isTarget && (
                    <motion.circle
                      r="6"
                      fill="#ffffff"
                      filter="url(#scene2ReactorGlow)"
                      initial={{ cx: 340, cy: 160 }}
                      animate={{ cx: pos.x, cy: pos.y }}
                      transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                    />
                  )}
                </g>
              );
            })}

            {/* Central Fusion Reactor Core physically locked at (340, 160) */}
            <g transform="translate(340, 160)">
              <motion.g
                animate={{
                  scale: beat === 0 ? [0.3, 1.6, 1] : [1, 1.12, 1],
                }}
                transition={{
                  duration: beat === 0 ? 1.0 : 2.5,
                  repeat: beat === 0 ? 0 : Number.POSITIVE_INFINITY,
                  ease: "easeOut",
                }}
              >
                {/* Expanding Shockwaves */}
                <motion.circle
                  r="32"
                  fill="none"
                  stroke="#ff02e8"
                  strokeWidth="2"
                  animate={{ r: [16, 55], opacity: [0.9, 0] }}
                  transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                />
                <circle r="22" fill="#ff02e8" opacity="0.9" filter="url(#scene2ReactorGlow)" />
                <circle r="11" fill="#ffffff" />
                <text x="0" y="3.5" textAnchor="middle" fill="#000000" fontSize="8" fontWeight="bold" fontFamily="monospace">
                  CORE
                </text>
              </motion.g>
            </g>

            {/* The 7 Sacred Pillars Arranged in Radial Orbit */}
            {ECOSYSTEM_PILLARS.map((p, idx) => {
              const pos = PILLAR_COORDS[idx];
              const isFocused = focusedPillar === idx && beat >= 2;
              const isOther = beat >= 2 && !isFocused;

              return (
                <g key={p.letter} transform={`translate(${pos.x}, ${pos.y})`}>
                  <motion.g
                    onClick={() => {
                      setFocusedPillar(idx);
                      setBeat(2);
                    }}
                    className="cursor-pointer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{
                      opacity: beat >= 1 ? (isOther ? 0.45 : 1) : 0,
                      scale: beat >= 1 ? (isFocused ? 1.35 : isOther ? 0.9 : 1) : 0,
                    }}
                    transition={{
                      delay: idx * 0.08,
                      duration: 0.7,
                      ease: [0.34, 1.4, 0.64, 1],
                    }}
                  >
                    {/* Glowing Target Aura for active pillar */}
                    {isFocused && (
                      <motion.circle
                        r="34"
                        fill="none"
                        stroke={p.color}
                        strokeWidth="3"
                        animate={{ r: [22, 46], opacity: [1, 0] }}
                        transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY }}
                      />
                    )}

                    {/* Circular Node Plate */}
                    <circle
                      r="22"
                      fill="#000000"
                      stroke={isFocused ? p.color : "rgba(255,255,255,0.25)"}
                      strokeWidth={isFocused ? 3.5 : 1.5}
                      filter={isFocused ? "url(#scene2ReactorGlow)" : undefined}
                    />

                    {/* Centered SVG Logo */}
                    <image
                      href={p.logo}
                      x="-16"
                      y="-16"
                      width="32"
                      height="32"
                      preserveAspectRatio="xMidYMid meet"
                      style={{
                        filter: isFocused
                          ? `drop-shadow(0 0 16px ${p.glow}) drop-shadow(0 0 6px ${p.color})`
                          : "drop-shadow(0 0 4px rgba(255,255,255,0.2))",
                      }}
                    />

                    {/* Pillar Letter Badge */}
                    <g transform="translate(14, -14)">
                      <circle r="8" fill={p.color} />
                      <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold" fontFamily="monospace">
                        {p.letter}
                      </text>
                    </g>

                    {/* Pillar Label Name in Constellation */}
                    <text
                      x={pos.labelX - pos.x}
                      y={pos.labelY - pos.y}
                      textAnchor={pos.anchor as any}
                      fill={isFocused ? p.color : "#a1a1aa"}
                      fontSize="10"
                      fontWeight={isFocused ? "bold" : "normal"}
                      fontFamily="monospace"
                    >
                      {p.name}
                    </text>
                  </motion.g>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Zoomed Telemetry Inspector Card */}
        <motion.div
          key={`telemetry-${active.letter}`}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg mt-3 p-4 rounded-2xl border border-white/15 bg-white/[0.03] backdrop-blur-[8px] flex items-center justify-between shadow-2xl"
          style={{
            borderColor: `${active.color}70`,
            boxShadow: `0 0 35px ${active.color}35`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-base text-white shrink-0 shadow-lg"
              style={{ backgroundColor: active.color }}
            >
              {active.letter}
            </div>
            <div className="text-left">
              <div className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <span>{active.name}</span>
                <span className="text-[11px] text-zinc-400">• {active.subtitle}</span>
              </div>
              <div className="text-[11px] font-mono text-zinc-300 mt-0.5">
                {active.name === "Productivity" && "Daily execution hub → 0ms sync with Second Brain notes & Work tasks"}
                {active.name === "Body" && "Workout logged → Routine timer closes → Updates recovery score in Mind"}
                {active.name === "Money" && "Expense entered → Deducted from budget → Linked to Work projects"}
                {active.name === "Relationships" && "Social check-in logged → Schedules next meeting in Productivity calendar"}
                {active.name === "Mind" && "Reflection written → Tracks daily mindfulness streak across the system"}
                {active.name === "Work" && "Deliverable shipped → Updates client invoice & revenue targets in Money"}
                {active.name === "Second Brain" && "Insight captured → Linked to Work tasks & personal Mind journal"}
              </div>
            </div>
          </div>

          <div className="text-right shrink-0 pl-3 border-l border-white/10">
            <span className="text-[10px] font-mono text-zinc-500 uppercase block">Bus Relay</span>
            <span className="text-xs font-mono font-bold" style={{ color: active.color }}>
              0.12 ms • LIVE
            </span>
          </div>
        </motion.div>
      </div>

      {/* BOTTOM STAGE: Architecture Controls */}
      <div className="relative z-10 pt-2 border-t border-fuchsia-500/20">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="text-zinc-400">
            Click any of the 7 orbital pillars to test instantaneous 3D zoom & bus routing
          </div>

          <button
            onClick={() => setBeat((b) => (b + 1) % 4)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-fuchsia-950/80 border border-fuchsia-500/40 text-fuchsia-300 hover:bg-fuchsia-900/60 transition-all cursor-pointer text-[11px]"
          >
            <span>Next Beat ({beat + 1}/4)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SCENE 3: THE SOVEREIGN SANCTUARY
// =========================================================================
function MotionSceneThree() {
  const [beat, setBeat] = useState(0);

  // Slower, more deliberate pacing
  useEffect(() => {
    const t1 = setTimeout(() => setBeat(1), 1800);  // Chip slams, cloud FLIES OFF SCREEN!
    const t2 = setTimeout(() => setBeat(2), 5200);  // Vaults dock
    const t3 = setTimeout(() => setBeat(3), 8800);  // Deflection blast
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="ultra-glass-panel relative w-full min-h-[600px] overflow-hidden flex flex-col justify-between p-6 sm:p-8 border border-emerald-500/30 shadow-2xl">
      {/* Background Volumetric Green Flare */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-600/30 blur-[130px] pointer-events-none"
      />

      {/* TOP: Dynamic Headline with Kinetic Zoom Punch */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((b) => (
              <button
                key={b}
                onClick={() => setBeat(b)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  beat === b ? "w-6 bg-emerald-500 shadow-[0_0_8px_#22c55e]" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
                title={`Jump to Beat ${b + 1}`}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            Beat {beat + 1} of 4 • Local Hardware Defense
          </span>
        </div>

        <AnimatePresence mode="wait">
          {beat === 0 && (
            <ZoomingHeadline
              key="h3-0"
              badge="03 • THE CLOUD INVASION"
              badgeColor="#22c55e"
              statusText="SURVEILLANCE DETECTED"
              titlePrefix="Other Apps Ingest Your Life In"
              zoomWord="THIRD-PARTY CLOUDS"
              titleSuffix="Without Your Consent"
              subtitle="External servers training proprietary models on your personal journals and finances."
            />
          )}
          {beat === 1 && (
            <ZoomingHeadline
              key="h3-1"
              badge="03 • APPLE SILICON SLAM"
              badgeColor="#22c55e"
              statusText="M-CHIP ENGAGED"
              titlePrefix="Apple Silicon Slams The Door:"
              zoomWord="CLOUD SPYWARE EXPELLED"
              titleSuffix="Off Your Screen"
              subtitle="Your data is permanently air-gapped inside your machine's on-device secure enclave."
            />
          )}
          {beat === 2 && (
            <ZoomingHeadline
              key="h3-2"
              badge="03 • ZERO-KNOWLEDGE DOCKING"
              badgeColor="#22c55e"
              statusText="4 VAULTS ENCRYPTED"
              titlePrefix="4 Sacred Vaults"
              zoomWord="DOCK INTO LOCAL SILICON"
              titleSuffix="At Hardware Speeds"
              subtitle="Finances, Journal, Routines, and Second Brain stored in local, self-hosted SQLite."
            />
          )}
          {beat === 3 && (
            <ZoomingHeadline
              key="h3-3"
              badge="03 • ABSOLUTE SOVEREIGNTY"
              badgeColor="#22c55e"
              statusText="DEFENSE 100% SECURE"
              titlePrefix="Forcefield Armed:"
              zoomWord="0.00 KB/S EXFILTRATION"
              titleSuffix="Guaranteed Forever"
              subtitle="External tracking probes shattered on impact. Your digital mind remains completely yours."
            />
          )}
        </AnimatePresence>
      </div>

      {/* CENTER STAGE: Chip Slam + Cloud Expelled Off-Screen + Deflections */}
      <div className="relative flex-1 flex flex-col items-center justify-center my-2 z-10">
        {/* BEAT 0: Cloud Spyware Card (GETS EXPELLED OFF-SCREEN ON BEAT 1!) */}
        <AnimatePresence>
          {beat === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{
                // BLASTED HARD OFF THE TOP-RIGHT OF THE SCREEN!
                x: 850,
                y: -650,
                rotate: 65,
                scale: 0.1,
                opacity: 0,
                transition: { duration: 0.8, ease: "easeIn" },
              }}
              className="p-6 rounded-3xl border border-red-500/40 bg-white/[0.03] backdrop-blur-[8px] flex flex-col items-center gap-3 text-center shadow-[0_0_50px_rgba(239,68,68,0.2)] max-w-sm absolute z-30"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-950/60 border border-red-500 flex items-center justify-center">
                <Cloud className="w-8 h-8 text-red-400 animate-pulse" />
              </div>
              <div className="font-mono text-sm font-bold text-white">Cloud AI & Data Broker Ingestion</div>
              <p className="text-xs text-zinc-400 font-mono">
                Third-party servers training on your personal journal, finances, and habits.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BEAT 1, 2, 3: Apple Silicon & Air-Gapped Forcefield */}
        {beat >= 1 && (
          <div className="w-full max-w-[650px] relative">
            <svg className="w-full h-auto overflow-visible select-none" viewBox="0 0 650 190" preserveAspectRatio="xMidYMid meet">
              <defs>
                <filter id="scene3ShieldGlow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Hexagonal Forcefield Arc with Zoom Surge */}
              {beat >= 2 && (
                <motion.g
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: [0.3, 1.2, 1], opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: "325px 95px" }}
                >
                  <path d="M 60 50 Q 325 -20 590 50" fill="none" stroke="rgba(34, 197, 94, 0.2)" strokeWidth="12" />
                  <motion.path
                    d="M 60 50 Q 325 -20 590 50"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="4"
                    strokeDasharray="12 12"
                    animate={{ strokeDashoffset: [0, -48] }}
                    transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    filter="url(#scene3ShieldGlow)"
                  />
                </motion.g>
              )}

              {/* Surveillance Probes: Fly in from outside, strike shield, get DEFLECTED OFF-SCREEN! */}
              {beat >= 3 && (
                <g>
                  {/* Left Probe */}
                  <motion.line
                    x1="120"
                    y1="-30"
                    x2="190"
                    y2="28"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, ease: "easeIn" }}
                  />
                  <motion.circle
                    cx="190"
                    cy="28"
                    r="6"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    initial={{ r: 4, opacity: 1 }}
                    animate={{ r: 28, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                    filter="url(#scene3ShieldGlow)"
                  />

                  {/* Right Probe */}
                  <motion.line
                    x1="530"
                    y1="-30"
                    x2="460"
                    y2="28"
                    stroke="#ef4444"
                    strokeWidth="3"
                    strokeDasharray="6 6"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.25, ease: "easeIn" }}
                  />
                  <motion.circle
                    cx="460"
                    cy="28"
                    r="6"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    initial={{ r: 4, opacity: 1 }}
                    animate={{ r: 28, opacity: 0 }}
                    transition={{ duration: 0.8, delay: 0.85, ease: "easeOut" }}
                    filter="url(#scene3ShieldGlow)"
                  />
                </g>
              )}

              {/* Motherboard Bus */}
              <line x1="80" y1="95" x2="570" y2="95" stroke="rgba(34,197,94,0.15)" strokeWidth="3" />
              <motion.line
                x1="80"
                y1="95"
                x2="570"
                y2="95"
                stroke="#22c55e"
                strokeWidth="2.5"
                strokeDasharray="8 10"
                animate={{ strokeDashoffset: [0, -36] }}
                transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                filter="url(#scene3ShieldGlow)"
              />

              {/* Central Apple Silicon Chip: Slams Down from Above! */}
              <motion.g
                transform="translate(325, 95)"
                initial={{ y: -450, scale: 2.5 }}
                animate={{ y: 0, scale: 1 }}
                transition={{ duration: 0.75, ease: [0.34, 1.4, 0.64, 1] }}
              >
                <rect
                  x="-22"
                  y="-22"
                  width="44"
                  height="44"
                  rx="10"
                  fill="#052e16"
                  stroke="#22c55e"
                  strokeWidth="2.5"
                  filter="url(#scene3ShieldGlow)"
                />
                <text x="0" y="5" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace">
                  M-CHIP
                </text>
              </motion.g>

              {/* 4 Private Vaults Flying In From Left & Right */}
              {[
                { name: "Finances", color: "#eab308", x: 90, fromX: -350 },
                { name: "Journal", color: "#a855f7", x: 210, fromX: -250 },
                { name: "Routines", color: "#22c55e", x: 440, fromX: 250 },
                { name: "Second Brain", color: "#f97316", x: 560, fromX: 350 },
              ].map((vault, i) => (
                <motion.g
                  key={vault.name}
                  initial={{ opacity: 0, x: vault.fromX }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.12, duration: 0.65, ease: [0.34, 1.4, 0.64, 1] }}
                  transform={`translate(${vault.x}, 95)`}
                >
                  <circle r="20" fill="#000000" stroke={vault.color} strokeWidth="2.5" filter="url(#scene3ShieldGlow)" />
                  <circle r="7" fill={vault.color} />
                  <text x="0" y="38" textAnchor="middle" fill="#d4d4d8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    {vault.name}
                  </text>
                </motion.g>
              ))}
            </svg>
          </div>
        )}

        {/* Live Telemetry Banner */}
        <div className="w-full max-w-lg mt-2 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-xs font-mono text-emerald-300 shadow-xl">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Air-Gapped: Outbound Cloud Leak Rate = 0.00 KB/s</span>
          </div>
        </div>
      </div>

      {/* BOTTOM STAGE: Controls */}
      <div className="relative z-10 pt-2 border-t border-emerald-500/20">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-zinc-400">
            100% On-Device Neural Processing • AES-256-GCM Hardware Vault
          </span>

          <button
            onClick={() => setBeat((b) => (b + 1) % 4)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60 transition-all cursor-pointer text-[11px]"
          >
            <span>Next Beat ({beat + 1}/4)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// SCENE 4: THE SOVEREIGN INVESTMENT
// =========================================================================
function MotionSceneFour() {
  const [beat, setBeat] = useState(0);
  const [horizon, setHorizon] = useState<1 | 3 | 5>(3);

  const oldSaaS = 180 * 12 * horizon;
  const sovereignCost = 40;
  const savedCash = oldSaaS - sovereignCost;

  // Slower, more deliberate pacing
  useEffect(() => {
    const t1 = setTimeout(() => setBeat(1), 1800);  // Invoice sliced & ejected
    const t2 = setTimeout(() => setBeat(2), 5200);  // Golden Medallion mega-zoom
    const t3 = setTimeout(() => setBeat(3), 8800);  // Retained capital explodes
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div className="ultra-glass-panel relative w-full min-h-[600px] overflow-hidden flex flex-col justify-between p-6 sm:p-8 border border-amber-500/30 shadow-2xl">
      {/* Background Volumetric Gold Flare */}
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-600/30 blur-[130px] pointer-events-none"
      />

      {/* TOP: Dynamic Headline with Kinetic Zoom Punch */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3].map((b) => (
              <button
                key={b}
                onClick={() => setBeat(b)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  beat === b ? "w-6 bg-amber-400 shadow-[0_0_8px_#efb219]" : "w-1.5 bg-zinc-700 hover:bg-zinc-500"
                }`}
                title={`Jump to Beat ${b + 1}`}
              />
            ))}
          </div>

          <span className="text-[11px] font-mono text-zinc-500">
            Beat {beat + 1} of 4 • Lifetime Equity Calculator
          </span>
        </div>

        <AnimatePresence mode="wait">
          {beat === 0 && (
            <ZoomingHeadline
              key="h4-0"
              badge="04 • THE SAAS RENTAL TRAP"
              badgeColor="#efb219"
              statusText="10-YEAR ESTIMATION"
              titlePrefix="The Subscription Economy Wants You To"
              zoomWord="RENT YOUR OWN LIFE"
              titleSuffix="Forever"
              subtitle="$180 every month compounding relentlessly into over $10,800 every single decade."
            />
          )}
          {beat === 1 && (
            <ZoomingHeadline
              key="h4-1"
              badge="04 • SUBSCRIPTION EJECTION"
              badgeColor="#efb219"
              statusText="INVOICE EXTINGUISHED"
              titlePrefix="Laser Guillotine Slice:"
              zoomWord="$10,800 EXPELLED"
              titleSuffix="Off Your Life For Good"
              subtitle="No monthly charges. No held-hostage data. No sudden price hikes."
            />
          )}
          {beat === 2 && (
            <ZoomingHeadline
              key="h4-2"
              badge="04 • SOVEREIGN LICENSE UNLOCKED"
              badgeColor="#efb219"
              statusText="LIFETIME ACCESS"
              titlePrefix="Own The Entire Platform:"
              zoomWord="$40 ONCE FOR LIFE"
              titleSuffix="Perpetual Access"
              subtitle="All 7 pillars. Zero cloud dependency. Free local updates forever."
            />
          )}
          {beat === 3 && (
            <ZoomingHeadline
              key="h4-3"
              badge="04 • COMPOUNDING CAPITAL"
              badgeColor="#22c55e"
              statusText="EQUITY SECURED"
              titlePrefix="Retain An Extra"
              zoomWord={`+$${savedCash.toLocaleString()}`}
              titleSuffix="In Your Bank Account"
              subtitle="The single highest-ROI investment in your personal productivity and wealth."
            />
          )}
        </AnimatePresence>
      </div>

      {/* CENTER STAGE: Invoice Sliced & Ejected Off-Screen + Sovereign Medallion Zoom Punch */}
      <div className="relative flex-1 flex flex-col justify-center my-3 z-10 space-y-4">
        {/* BEAT 0 & 1: THE INVOICE GETS SLICED IN HALF AND EXPELLED OFF-SCREEN! */}
        {beat <= 1 && (
          <div className="relative flex flex-col items-center justify-center py-6">
            {/* Top Half of Invoice (Flies UP off-screen!) */}
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={
                beat === 1
                  ? {
                      y: -700, // FLIES OFF THE TOP!
                      x: -300,
                      rotate: -35,
                      opacity: 0,
                    }
                  : { y: 0, opacity: 1 }
              }
              transition={{ duration: 0.8, ease: "easeIn" }}
              className="w-full max-w-md p-4 rounded-t-2xl border-t border-x border-red-500 bg-red-950/80 backdrop-blur-md text-center"
            >
              <div className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                SaaS Subscription Rental Invoice
              </div>
              <div className="text-3xl sm:text-4xl font-black font-mono text-red-300">
                $10,800.00 DUE
              </div>
            </motion.div>

            {/* Slicing Laser Beam */}
            {beat === 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1, boxShadow: "0 0 35px #ef4444" }}
                transition={{ duration: 0.45 }}
                className="w-full max-w-lg h-[3px] bg-red-500 z-30"
              />
            )}

            {/* Bottom Half of Invoice (Flies DOWN off-screen!) */}
            <motion.div
              initial={{ y: 0, opacity: 1 }}
              animate={
                beat === 1
                  ? {
                      y: 700, // FLIES OFF THE BOTTOM!
                      x: 300,
                      rotate: 35,
                      opacity: 0,
                    }
                  : { y: 0, opacity: 1 }
              }
              transition={{ duration: 0.8, ease: "easeIn" }}
              className="w-full max-w-md p-4 rounded-b-2xl border-b border-x border-red-500 bg-red-950/80 backdrop-blur-md text-center"
            >
              <div className="text-[11px] font-mono text-zinc-400">
                Recurring monthly charges indefinitely • Zero equity retained
              </div>
            </motion.div>
          </div>
        )}

        {/* BEAT 2 & 3: GOLDEN MEDALLION MEGA-ZOOM & WEALTH ENGINE */}
        {beat >= 2 && (
          <div className="space-y-4">
            {/* Horizon Selector */}
            <div className="flex items-center justify-between bg-white/[0.03] backdrop-blur-[8px] p-2 rounded-2xl border border-amber-500/30 max-w-md mx-auto w-full">
              <span className="text-xs font-mono text-zinc-400 px-2 font-bold uppercase">
                Horizon:
              </span>
              <div className="flex items-center gap-1.5">
                {([1, 3, 5] as const).map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setHorizon(yr)}
                    className={`px-3.5 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      horizon === yr
                        ? "bg-amber-400 text-black shadow-lg scale-105"
                        : "text-zinc-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {yr} Year{yr > 1 ? "s" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Center Stage: Sovereign Medallion with Camera Mega-Zoom */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
              {/* Left: SaaS Strikethrough */}
              <div className="p-4 rounded-2xl border border-red-500/30 bg-red-950/25 space-y-1.5 text-left relative overflow-hidden">
                <span className="text-[10px] font-mono uppercase text-red-400 font-bold block">
                  {horizon}-Year SaaS Bleed
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-red-400/80 line-through">
                  $<KineticOdometer target={oldSaaS} duration={1000} />
                </div>
                <p className="text-[11px] text-zinc-400">
                  Recurring subscription rent permanently extinguished.
                </p>
              </div>

              {/* Center: Golden 3D Medallion Zoom Punch */}
              <div className="flex flex-col items-center justify-center text-center py-1 relative">
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 2.3, 1], opacity: 1 }}
                  transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                  className="w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.8)] border-2 border-amber-200 text-black font-black font-mono text-3xl relative z-10 overflow-hidden cursor-pointer"
                >
                  $40
                  <span className="text-[8px] font-mono uppercase tracking-widest text-black/90 font-bold -mt-1">
                    LIFETIME
                  </span>
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 pointer-events-none"
                  />
                </motion.div>
                <span className="text-xs font-mono font-bold text-amber-300 mt-2 uppercase tracking-wider">
                  One-Time Sovereign License
                </span>
              </div>

              {/* Right: Retained Capital Burst */}
              <div className="p-4 rounded-2xl border border-emerald-500/40 bg-emerald-950/25 space-y-1.5 text-left relative overflow-hidden">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  Retained Capital
                </span>
                <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-300 drop-shadow-[0_0_15px_rgba(34,197,94,0.8)]">
                  +<KineticOdometer target={savedCash} prefix="$" duration={1100} />
                </div>
                <p className="text-[11px] text-zinc-300">
                  100% of this money remains in your bank account forever.
                </p>
              </div>
            </div>

            {/* 2 Unified Options: Free Core vs Complete Sovereign System */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3 text-left">
                <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-[8px] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-white">$0 Free Core</span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">Starter</span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono leading-relaxed">
                      Daily tasks, habits & focus timer. 100% offline & forever free.
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-zinc-500">
                    Always Free Foundation
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-400/60 bg-amber-400/10 shadow-[0_0_20px_rgba(245,158,11,0.25)] flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-bold text-amber-300">$40 Complete System</span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold border border-amber-400/30">Unified</span>
                    </div>
                    <p className="text-[10px] text-zinc-200 font-mono leading-relaxed">
                      All 7 interconnected pillars unified. Zero loose subscriptions.
                    </p>
                  </div>
                  <div className="mt-2 pt-2 border-t border-amber-400/20 text-[9px] font-mono text-amber-300/80 flex items-center justify-between">
                    <span>One-Time Sovereign License</span>
                    <span className="text-amber-300 font-bold">0ms Sync</span>
                  </div>
                </div>
              </div>

              <div className="text-center py-0.5">
                <span className="text-[10px] font-mono text-zinc-400 tracking-wide">
                  ⚡ All 7 systems are permanently interconnected — we do not sell loose fragmented apps.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM STAGE: Call To Action */}
      <div className="relative z-10 pt-3 border-t border-amber-500/20 flex items-center justify-between">
        <span className="text-[11px] font-mono text-zinc-400">
          Single investment • No recurring credit card charges
        </span>
        <button className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-400 text-black font-mono text-xs font-bold uppercase hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(239,178,25,0.6)] cursor-pointer">
          <span>CLAIM SOVEREIGN ACCESS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// =========================================================================
// MAIN EXPORT: STORY SECTION
// =========================================================================
export function StorySection() {
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  // Slower, more spacious 13-second duration per chapter
  const STEP_DURATION = 13000;

  // Rock-solid deterministic wall-clock timer that strictly advances 0 -> 1 -> 2 -> 3 -> 0
  useEffect(() => {
    if (!isAutoPlaying) {
      setProgress(0);
      return;
    }

    setProgress(0);
    const startTime = Date.now();
    let isCancelled = false;

    const interval = setInterval(() => {
      if (isCancelled) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / STEP_DURATION) * 100, 100);
      setProgress(pct);

      if (elapsed >= STEP_DURATION) {
        clearInterval(interval);
        if (!isCancelled) {
          setDirection(1);
          setActiveStep((curr) => (curr + 1) % CHAPTERS.length);
        }
      }
    }, 50);

    return () => {
      isCancelled = true;
      clearInterval(interval);
    };
  }, [isAutoPlaying, activeStep]);

  const selectStep = (idx: number) => {
    if (idx === activeStep) return;
    setDirection(idx > activeStep ? 1 : -1);
    setActiveStep(idx);
    setProgress(0);
  };

  const goNext = () => {
    setDirection(1);
    setActiveStep((curr) => (curr + 1) % CHAPTERS.length);
    setProgress(0);
  };

  const goPrev = () => {
    setDirection(-1);
    setActiveStep((curr) => (curr - 1 + CHAPTERS.length) % CHAPTERS.length);
    setProgress(0);
  };

  const current = CHAPTERS[activeStep];

  return (
    <div className="relative w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-transparent text-white select-none overflow-hidden">
      {/* Background Chromatic Radial Aura */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 w-[850px] h-[650px] rounded-full blur-[220px] opacity-25 transition-colors duration-1000 -z-10"
        style={{ backgroundColor: current.accentColor }}
      />

      <div className="relative w-full max-w-5xl mx-auto space-y-6 z-10">
        
        {/* ========================================================= */}
        {/* TOP: 4-STEP SELECTOR TABS WITH DYNAMIC PROGRESS BARS      */}
        {/* ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CHAPTERS.map((chap, idx) => {
            const isActive = activeStep === idx;
            return (
              <button
                key={chap.id}
                onClick={() => selectStep(idx)}
                className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer overflow-hidden ${
                  isActive
                    ? "bg-white/[0.06] backdrop-blur-[8px] shadow-2xl"
                    : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04] backdrop-blur-[6px]"
                }`}
                style={{
                  borderColor: isActive ? chap.accentColor : undefined,
                  boxShadow: isActive ? `0 0 30px ${chap.accentColor}30` : undefined,
                }}
              >
                {/* Active Dynamic Progress Line */}
                {isActive && (
                  <div
                    className="absolute top-0 left-0 h-[2.5px] transition-all"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: chap.accentColor,
                      boxShadow: `0 0 10px ${chap.accentColor}`,
                    }}
                  />
                )}

                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className="text-xs font-mono font-bold"
                    style={{ color: isActive ? chap.accentColor : "#71717a" }}
                  >
                    0{idx + 1}
                  </span>
                  <span
                    className="w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold"
                    style={{
                      backgroundColor: isActive ? `${chap.accentColor}25` : "rgba(255,255,255,0.05)",
                      color: isActive ? chap.accentColor : "#a1a1aa",
                    }}
                  >
                    {chap.letter}
                  </span>
                </div>

                <div className="text-xs sm:text-sm font-bold text-white truncate">
                  {chap.title}
                </div>
                <div className="text-[10px] font-mono text-zinc-400 truncate">
                  {chap.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* MAIN STAGE: HIGH-OCTANE CHOREOGRAPHED MOTION VIEWPORT    */}
        {/* ========================================================= */}
        <div className="relative">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={`scene-${activeStep}`}
              custom={direction}
              initial={{
                opacity: 0,
                x: direction * 50,
                scale: 0.93,
                filter: "blur(12px)",
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: "blur(0px)",
              }}
              exit={{
                opacity: 0,
                x: direction * -50,
                scale: 1.06,
                filter: "blur(12px)",
              }}
              transition={{
                duration: 0.65,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full"
            >
              {activeStep === 0 && <MotionSceneOne />}
              {activeStep === 1 && <MotionSceneTwo />}
              {activeStep === 2 && <MotionSceneThree />}
              {activeStep === 3 && <MotionSceneFour />}
            </motion.div>
          </AnimatePresence>

          {/* Under-Stage Control Bar: Explicit Step Tracker & Navigation */}
          <div className="flex items-center justify-between mt-4 px-1">
            <button
              onClick={goPrev}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/10 text-xs font-mono text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back (Step {((activeStep + 3) % 4) + 1})</span>
            </button>

            {/* Center: Step indicators & Autoplay Status */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-black/60 hover:bg-white/10 text-[11px] font-mono text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                {isAutoPlaying ? (
                  <>
                    <Pause className="w-3 h-3 text-emerald-400" />
                    <span>Auto-Play: ON</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 text-amber-400" />
                    <span>Auto-Play: OFF</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                {CHAPTERS.map((c, i) => (
                  <button
                    key={c.id}
                    onClick={() => selectStep(i)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeStep === i ? "w-8" : "w-2 bg-white/20 hover:bg-white/40"
                    }`}
                    style={{
                      backgroundColor: activeStep === i ? current.accentColor : undefined,
                    }}
                    title={`Go to Step ${i + 1}: ${c.title}`}
                  />
                ))}
              </div>

              <span className="text-[11px] font-mono font-bold text-zinc-400">
                Step {activeStep + 1} of 4
              </span>
            </div>

            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl font-mono text-xs font-bold text-black transition-all hover:scale-105 active:scale-95 shadow-md cursor-pointer"
              style={{ backgroundColor: current.accentColor }}
            >
              <span>Next (Step {((activeStep + 1) % 4) + 1})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
