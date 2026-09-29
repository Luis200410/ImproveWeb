"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useInView } from "framer-motion";
import {
  Flame,
  CheckSquare,
  DollarSign,
  FileText,
  Bot,
  Cloud,
  Sun,
  Activity,
  Headphones,
  BookOpen,
  Bookmark,
  Calendar,
  Zap,
  AlertTriangle,
  Check,
  ArrowRight,
  Sparkles,
  Tag,
} from "lucide-react";

export interface StoryChapter {
  id: string;
  number: string;
  letter: string;
  accentColor: string;
  title: string;
  subtitle: string;
  explanation: {
    summary: string;
    details: string[];
    callouts?: {
      title: string;
      body: string;
      badge?: string;
    }[];
    pricing?: {
      plan: string;
      price: string;
      billing: string;
      badge?: string;
      features: string[];
      highlighted?: boolean;
    }[];
  };
}

export const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: "problem",
    number: "01",
    letter: "I",
    accentColor: "#ef4444", // Letter 'I' (Red)
    title: "The Problem",
    subtitle: "The Cost of Fragmentation",
    explanation: {
      summary:
        "Right now, your life is likely split across a dozen different subscriptions. Your habits live in one tool, your budget in another, and your daily tasks are lost somewhere in between.",
      details: [
        "This fragmentation does not just drain your wallet—it breaks your focus. When your systems are disconnected, your goals become disconnected.",
      ],
      callouts: [
        {
          title: "The Hidden Tax on Focus",
          body: "Context switching between 5-10 single-purpose apps drains mental bandwidth and creates friction before you even begin working.",
          badge: "Fragmented Reality",
        },
        {
          title: "Subscription Fatigue",
          body: "Paying $10-$20/month for separate habit trackers, note apps, and budget tools costs hundreds of dollars every single year.",
          badge: "Financial Drain",
        },
      ],
    },
  },
  {
    id: "ecosystem",
    number: "02",
    letter: "P",
    accentColor: "#ff02e8", // Letter 'P' (Magenta)
    title: "The Ecosystem",
    subtitle: "Everything in Alignment",
    explanation: {
      summary:
        "IMPROVE replaces isolated tools with a single, conscious ecosystem built on seven pillars: Second Brain (Knowledge & School), Money, Productivity, Body, Work, Mind, and Relationships.",
      details: [
        "These are not separate silos. They are deeply interconnected.",
        "Your Second Brain and Productivity apps act as the central nervous system, automatically routing data exactly where it needs to go.",
        "How it breathes together: When you start your daily exercise habit, you do not need to switch apps to find your routine. Productivity syncs seamlessly with the Body app, surfacing your exact exercises right next to your habit timer.",
        "Conscious Control: The system is designed as a constant meditation on who you are and where you are going. It handles the friction of organization so your mind is free to focus on execution.",
      ],
      callouts: [
        {
          title: "Central Nervous System",
          body: "Second Brain + Productivity automatically route your knowledge, habits, and tasks directly to the right pillar without manual triage.",
          badge: "Automated Routing",
        },
        {
          title: "Zero-Friction Habit Sync",
          body: "When you start an exercise routine, your workout surfaces directly inside your habit timer. No app switching required.",
          badge: "Breathes Together",
        },
      ],
    },
  },
  {
    id: "sanctuary",
    number: "03",
    letter: "O",
    accentColor: "#22c55e", // Letter 'O' (Green)
    title: "The Sanctuary",
    subtitle: "Total Privacy & Local Intelligence",
    explanation: {
      summary:
        "Absolute control over your life requires absolute control over your data. IMPROVE is built as a closed, local system.",
      details: [
        "By leveraging on-device frameworks like Apple Intelligence and Siri, the ecosystem gives you powerful, frictionless data capture without the hidden costs of external AI bills.",
        "There are no third-party databases analyzing your habits. There is no one selling your information. Your finances, your thoughts, and your routines remain strictly yours. Fast, intelligent, and completely private.",
      ],
      callouts: [
        {
          title: "On-Device Neural Processing",
          body: "Leveraging Apple Intelligence & local neural engines directly on your machine for zero-latency indexing.",
          badge: "100% Local",
        },
        {
          title: "Zero Data-Harvesting",
          body: "Your private financial figures, journal thoughts, and intimate routines never touch a centralized advertising server.",
          badge: "Sovereignty",
        },
      ],
    },
  },
  {
    id: "investment",
    number: "04",
    letter: "E",
    accentColor: "#efb219", // Letter 'E' (Gold)
    title: "The Investment",
    subtitle: "System Over Subscriptions",
    explanation: {
      summary:
        "True clarity shouldn't require managing—and paying for—a chaotic web of single-purpose apps.",
      details: [
        "You can build your system a la carte, selecting individual IMPROVE modules for $7 each. But the true power of the platform is unlocked in the unified ecosystem.",
        "For $40, you gain access to the entire IMPROVE suite. All seven pillars seamlessly communicating with one another, plus the local AI tools to frictionlessly populate your data and build your Second Brain—with zero recurring external AI fees. Stop paying for fragmentation and data-harvesting. Invest in total alignment.",
      ],
      pricing: [
        {
          plan: "A La Carte Modules",
          price: "$7",
          billing: "per module / one-time",
          badge: "Modular",
          features: [
            "Pick individual pillars as you need them",
            "Standalone lifetime access per app",
            "Local offline storage",
          ],
          highlighted: false,
        },
        {
          plan: "The Complete Ecosystem",
          price: "$40",
          billing: "entire 7-pillar suite / one-time",
          badge: "Maximum Value",
          features: [
            "All 7 interconnected IMPROVE pillars",
            "Central nervous system automatic data routing",
            "Local on-device AI tools with zero recurring fees",
            "Lifetime updates & continuous ecosystem alignment",
          ],
          highlighted: true,
        },
      ],
    },
  },
];

const SUBSCRIPTION_APPS = [
  { name: "Habits", price: "$14/mo", icon: Flame, color: "#f87171", border: "border-red-500/30", bg: "bg-red-950/20" },
  { name: "Tasks", price: "$10/mo", icon: CheckSquare, color: "#fb7185", border: "border-rose-500/30", bg: "bg-rose-950/20" },
  { name: "Budget", price: "$15/mo", icon: DollarSign, color: "#fbbf24", border: "border-amber-500/30", bg: "bg-amber-950/20" },
  { name: "Notes", price: "$12/mo", icon: FileText, color: "#38bdf8", border: "border-sky-500/30", bg: "bg-sky-950/20" },
  { name: "AI Chat", price: "$20/mo", icon: Bot, color: "#34d399", border: "border-emerald-500/30", bg: "bg-emerald-950/20" },
  { name: "Storage", price: "$10/mo", icon: Cloud, color: "#a78bfa", border: "border-violet-500/30", bg: "bg-violet-950/20" },
  { name: "Mind", price: "$13/mo", icon: Sun, color: "#f472b6", border: "border-pink-500/30", bg: "bg-pink-950/20" },
  { name: "Workout", price: "$12/mo", icon: Activity, color: "#fb923c", border: "border-orange-500/30", bg: "bg-orange-950/20" },
  { name: "Music", price: "$11/mo", icon: Headphones, color: "#4ade80", border: "border-green-500/30", bg: "bg-green-950/20" },
  { name: "Journal", price: "$8/mo", icon: BookOpen, color: "#60a5fa", border: "border-blue-500/30", bg: "bg-blue-950/20" },
  { name: "Reading", price: "$10/mo", icon: Bookmark, color: "#c084fc", border: "border-purple-500/30", bg: "bg-purple-950/20" },
  { name: "Calendar", price: "$12/mo", icon: Calendar, color: "#e879f9", border: "border-fuchsia-500/30", bg: "bg-fuchsia-950/20" },
];

interface TypewriterStep {
  text: string;
  typeSpeed?: number;
  pauseAtEnd?: number;
  deleteSpeed?: number;
  pauseAfterDelete?: number;
}

const TYPEWRITER_STEPS: TypewriterStep[] = [
  {
    // Step 0: "Right now, your life is likely split across a dozen different subscriptions."
    // Shows the 12 Animated Subscription Squares!
    text: "Right now, your life is likely split across a dozen different subscriptions.",
    typeSpeed: 30,
    pauseAtEnd: 2400,
    deleteSpeed: 16,
    pauseAfterDelete: 350,
  },
  {
    // Step 1: "Your habits live in one tool."
    // Habit Tool card enters on the left immediately when this sentence is called!
    text: "Your habits live in one tool.",
    typeSpeed: 30,
    pauseAtEnd: 2000,
    deleteSpeed: 16,
    pauseAfterDelete: 350,
  },
  {
    // Step 2: "Your budget in another."
    // Budget App card enters on the right immediately when this sentence is called!
    text: "Your budget in another.",
    typeSpeed: 30,
    pauseAtEnd: 2000,
    deleteSpeed: 16,
    pauseAfterDelete: 350,
  },
  {
    // Step 3: "And your daily tasks are lost somewhere in between."
    // Task List card drops into the middle immediately when this sentence is called!
    text: "And your daily tasks are lost somewhere in between.",
    typeSpeed: 30,
    pauseAtEnd: 2200,
    deleteSpeed: 16,
    pauseAfterDelete: 400,
  },
  {
    // Step 4: Consequence 1
    text: "This fragmentation does not just drain your wallet—it breaks your focus.",
    typeSpeed: 28,
    pauseAtEnd: 2400,
    deleteSpeed: 16,
    pauseAfterDelete: 380,
  },
  {
    // Step 5: Consequence 2
    text: "When your systems are disconnected, your goals become disconnected.",
    typeSpeed: 28,
    pauseAtEnd: 2800,
    deleteSpeed: 16,
    pauseAfterDelete: 600,
  },
];

function BrokenFocusStage({ isGoalsStep }: { isGoalsStep?: boolean }) {
  return (
    <motion.div
      key={isGoalsStep ? "goals-stage" : "focus-stage"}
      initial={{ opacity: 0, y: 15, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-3 pt-1"
    >
      {/* Top Banner Alert */}
      <div className="flex items-center justify-between px-1 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-red-400 font-bold uppercase tracking-wider text-[11px]">
            {isGoalsStep ? "Systems Severed • Goals Disconnected" : "Flow State Compromised • Focus Broken"}
          </span>
        </div>
        <div className="text-zinc-400 text-[11px]">
          Cognitive Tax: <span className="text-red-400 font-bold">{isGoalsStep ? "Zero Alignment" : "Critical Overload"}</span>
        </div>
      </div>

      {/* Main 3-Column Broken Focus Stage */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
        {/* Left Card: 23 min to regain focus */}
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="p-4 rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-md flex flex-col justify-between relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-red-300">Attention Residue</span>
              <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1">
              23 min
            </div>
            <p className="text-xs text-zinc-400 leading-snug">
              Average time required to regain deep flow after an app switch.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-red-400/80 mt-3 pt-2 border-t border-red-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span>Constant mental triage</span>
          </div>
        </motion.div>

        {/* Center Card: The Fracturing Focus Reticle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="p-4 rounded-2xl border border-red-500/40 bg-black/40 backdrop-blur-md flex flex-col items-center justify-center text-center relative overflow-hidden ring-1 ring-red-500/20 shadow-[0_0_35px_rgba(239,68,68,0.18)]"
        >
          {/* Subtle radial glow */}
          <div className="absolute inset-0 bg-radial from-red-600/15 via-transparent to-transparent pointer-events-none" />

          {/* Fractured Reticle Visual */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center my-1">
            {/* Left shattered half */}
            <motion.div
              animate={{
                x: [-2, -6, -3, -7, -3],
                rotate: [-2, -6, -3, -5, -2],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-0 w-1/2 h-full overflow-hidden flex items-center justify-end pr-0.5 border-r border-red-500/60"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-red-500/50 flex items-center justify-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-red-400/60 border-dashed" />
              </div>
            </motion.div>

            {/* Right shattered half */}
            <motion.div
              animate={{
                x: [2, 6, 3, 7, 3],
                rotate: [2, 6, 3, 5, 2],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-0 w-1/2 h-full overflow-hidden flex items-center justify-start pl-0.5"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-red-500/50 flex items-center justify-center -ml-8 sm:-ml-10">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-red-400/60 border-dashed" />
              </div>
            </motion.div>

            {/* Center jagged lightning crack */}
            <motion.div
              animate={{ opacity: [0.6, 1, 0.4, 0.9, 0.6] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="relative z-10"
            >
              <Zap className="w-8 h-8 sm:w-9 sm:h-9 text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
            </motion.div>
          </div>

          <span className="text-[11px] font-mono font-bold text-red-400 tracking-wider uppercase mt-1">
            {isGoalsStep ? "Systems Disconnected" : "Focus Shattered"}
          </span>
          <span className="text-[9px] font-mono text-zinc-500">
            {isGoalsStep ? "Disconnected data breaks execution" : "Siloed apps shatter deep flow"}
          </span>
        </motion.div>

        {/* Right Card: -40% Mental Bandwidth */}
        <motion.div
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.08 }}
          className="p-4 rounded-2xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-md flex flex-col justify-between relative overflow-hidden"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-rose-300">Cognitive Tax</span>
              <Activity className="w-4 h-4 text-rose-400 animate-pulse" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-white mb-1">
              -40%
            </div>
            <p className="text-xs text-zinc-400 leading-snug">
              Drop in productivity caused by managing siloed tools.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-rose-400/80 mt-3 pt-2 border-t border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Manual double-entry fatigue</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function ChapterOneAnimatedContent({ accentColor, active }: { accentColor: string; active: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [showHabits, setShowHabits] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [showTasks, setShowTasks] = useState(false);

  // Instantly trigger each respective card as soon as its sentence is called!
  useEffect(() => {
    if (stepIndex === 0) {
      setShowHabits(false);
      setShowBudget(false);
      setShowTasks(false);
    } else if (stepIndex === 1) {
      setShowHabits(true);
    } else if (stepIndex === 2) {
      setShowBudget(true);
    } else if (stepIndex === 3) {
      setShowTasks(true);
    }
  }, [stepIndex]);

  // Reset when active changes (when scrolling away / changing chapter)
  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setDisplayText("");
      setIsDeleting(false);
      setShowHabits(false);
      setShowBudget(false);
      setShowTasks(false);
    }
  }, [active]);

  // Main typing and backspacing loop
  useEffect(() => {
    if (!active) return;

    const currentStep = TYPEWRITER_STEPS[stepIndex];
    if (!currentStep) return;

    const targetText = currentStep.text;
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Forward typing
      if (displayText.length < targetText.length) {
        timer = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, currentStep.typeSpeed || 28);
      } else {
        // Sentence fully typed out: pause to read, then start backspacing (delete animation)
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, currentStep.pauseAtEnd || 1800);
      }
    } else {
      // Visible backspacing letter-by-letter
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, currentStep.deleteSpeed || 16);
      } else {
        // Fully backspaced: pause briefly then advance to next sentence or loop back
        timer = setTimeout(() => {
          setStepIndex((prev) => (prev + 1) % TYPEWRITER_STEPS.length);
          setIsDeleting(false);
        }, currentStep.pauseAfterDelete || 350);
      }
    }

    return () => clearTimeout(timer);
  }, [active, stepIndex, displayText, isDeleting]);

  return (
    <div className="space-y-6">
      {/* Typewritten Line: Types out and backspaces letter-by-letter one sentence at a time */}
      <div className="min-h-[4.8em] sm:min-h-[3.6em] flex items-center">
        <p className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {stepIndex === 0 && (
            <span>
              {displayText
                .split(/(split across a dozen different subscriptions)/g)
                .map((part, i) =>
                  part === "split across a dozen different subscriptions" ? (
                    <span
                      key={i}
                      className="font-semibold drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                      style={{ color: accentColor }}
                    >
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
            </span>
          )}

          {stepIndex === 1 && (
            <span className="text-red-400 font-semibold">{displayText}</span>
          )}

          {stepIndex === 2 && (
            <span className="text-amber-400 font-semibold">{displayText}</span>
          )}

          {stepIndex === 3 && (
            <span className="text-rose-400 font-semibold">{displayText}</span>
          )}

          {stepIndex === 4 && (
            <span>
              {displayText
                .replace("drain your wallet", "§DRAIN§")
                .replace("breaks your focus", "§FOCUS§")
                .split(/(§DRAIN§|§FOCUS§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§DRAIN§") {
                    return <strong key={idx} className="text-white font-bold">drain your wallet</strong>;
                  }
                  if (chunk === "§FOCUS§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold underline decoration-red-500/50 underline-offset-4"
                        style={{ color: accentColor }}
                      >
                        breaks your focus
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          {stepIndex === 5 && (
            <span>
              {displayText
                .split(/(disconnected)/g)
                .map((part, i) =>
                  part === "disconnected" ? (
                    <span
                      key={i}
                      className="font-semibold drop-shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                      style={{ color: accentColor }}
                    >
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
            </span>
          )}

          <span
            className="inline-block w-[2px] h-[1em] ml-1 align-middle animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        </p>
      </div>

      {/* Dynamic Visual Stage: Step 0 shows the 12 Squares, Steps 1-5 show the 3 Cards */}
      <div className="relative min-h-[170px]">
        <AnimatePresence mode="wait">
          {stepIndex === 0 ? (
            <motion.div
              key="squares-grid"
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-3 pt-1"
            >
              {/* Header status badge for the 12 apps */}
              <div className="flex items-center justify-between px-1 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 font-bold uppercase tracking-wider text-[11px]">
                    12 Isolated Subscriptions
                  </span>
                </div>
                <div className="text-zinc-400 text-[11px]">
                  Recurring Cost: <span className="text-white font-bold">$147/month</span>
                </div>
              </div>

              {/* 12 Animated Squares Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
                {SUBSCRIPTION_APPS.map((app, i) => {
                  const Icon = app.icon;
                  return (
                    <motion.div
                      key={app.name}
                      initial={{ opacity: 0, scale: 0.7, y: 15 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, i % 2 === 0 ? -3 : 3, 0],
                      }}
                      transition={{
                        opacity: { duration: 0.35, delay: i * 0.03 },
                        scale: { duration: 0.4, delay: i * 0.03, ease: [0.34, 1.4, 0.64, 1] },
                        y: { duration: 2.5 + (i % 3) * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.08 },
                      }}
                      className={`p-2.5 sm:p-3 rounded-2xl border ${app.border} ${app.bg} backdrop-blur-md relative flex flex-col items-center justify-between text-center group hover:scale-105 transition-all overflow-hidden shadow-lg`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: app.color }} />
                        <span className="text-[9px] font-mono font-bold text-red-300 bg-red-500/20 px-1 py-0.2 rounded border border-red-500/30">
                          {app.price}
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs font-mono font-semibold text-white truncate w-full mt-0.5">
                        {app.name}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono tracking-tight">
                        Disconnected
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : stepIndex === 4 || stepIndex === 5 ? (
            <BrokenFocusStage isGoalsStep={stepIndex === 5} />
          ) : (
            <motion.div
              key="cards-stage"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1"
            >
              {/* 1. Habit Tool (Left column) */}
              <div className="sm:col-start-1">
                <AnimatePresence>
                  {showHabits && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="p-5 rounded-2xl border border-red-500/30 bg-red-950/20 backdrop-blur-sm relative overflow-hidden h-full flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono font-bold text-white">Habit Tool</span>
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                            $14/mo
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 mb-4">Streaks trapped in a silo.</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span>No link to Daily Tasks</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 2. Task List (Middle column: Appears in step 3 and sits in the center!) */}
              <div className="sm:col-start-2">
                <AnimatePresence>
                  {showTasks ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.82, y: -18 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.55, ease: [0.34, 1.4, 0.64, 1] }}
                      className="p-5 rounded-2xl border border-rose-500/35 bg-rose-950/25 backdrop-blur-sm relative overflow-hidden h-full flex flex-col justify-between ring-1 ring-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.18)]"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono font-bold text-white">Task List</span>
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            $10/mo
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 mb-4">Deadlines lost in the shuffle.</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-rose-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                        <span>Manual Double-Entry</span>
                      </div>
                    </motion.div>
                  ) : showBudget ? (
                    /* Subtle dashed placeholder spot while waiting for "lost somewhere in between" */
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hidden sm:flex h-full min-h-[130px] rounded-2xl border border-dashed border-white/10 items-center justify-center p-4 text-center"
                    >
                      <span className="text-[11px] font-mono text-zinc-600 uppercase tracking-widest">
                        lost somewhere in between...
                      </span>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>

              {/* 3. Budget App (Right column: Appears in step 2!) */}
              <div className="sm:col-start-3">
                <AnimatePresence>
                  {showBudget && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="p-5 rounded-2xl border border-amber-500/30 bg-amber-950/20 backdrop-blur-sm relative overflow-hidden h-full flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono font-bold text-white">Budget App</span>
                          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            $12/mo
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-400 mb-4">Expenses split from life goals.</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span>Isolated Database</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
const ECOSYSTEM_PILLARS = [
  {
    letter: "I",
    name: "Relationships",
    subtitle: "Social Capital",
    color: "#cc0000",
    glowColor: "rgba(204, 0, 0, 0.6)",
    logoSrc: "/RelationShips logo.svg",
    xCoord: 50,
  },
  {
    letter: "M",
    name: "Mind",
    subtitle: "Mental Clarity",
    color: "#6f1bd3",
    glowColor: "rgba(111, 27, 211, 0.6)",
    logoSrc: "/mind Logo.svg",
    xCoord: 150,
  },
  {
    letter: "P",
    name: "Productivity",
    subtitle: "Execution Engine",
    color: "#ff02e8",
    glowColor: "rgba(255, 2, 232, 0.7)",
    logoSrc: "/Productivity Logo.svg",
    xCoord: 250,
    isNervousSystem: true,
  },
  {
    letter: "R",
    name: "Work",
    subtitle: "Mastery",
    color: "#2254f5",
    glowColor: "rgba(34, 84, 245, 0.6)",
    logoSrc: "/Work Logo.svg",
    xCoord: 350,
  },
  {
    letter: "O",
    name: "Body",
    subtitle: "Physical Health",
    color: "#43b752",
    glowColor: "rgba(67, 183, 82, 0.6)",
    logoSrc: "/Body Logo.svg",
    xCoord: 450,
  },
  {
    letter: "V",
    name: "Second Brain",
    subtitle: "Knowledge Vault",
    color: "#ff6900",
    glowColor: "rgba(255, 105, 0, 0.7)",
    logoSrc: "/Second Brain Logo.svg",
    xCoord: 550,
    isNervousSystem: true,
  },
  {
    letter: "E",
    name: "Money",
    subtitle: "Wealth & Freedom",
    color: "#efb219",
    glowColor: "rgba(239, 178, 25, 0.6)",
    logoSrc: "/money Logo.svg",
    xCoord: 650,
  },
];

const INTERCONNECT_SEGMENTS = [
  { id: "seg-0", x1: 50, x2: 150, gradId: "segGrad-0", color1: "#cc0000", color2: "#6f1bd3" },
  { id: "seg-1", x1: 150, x2: 250, gradId: "segGrad-1", color1: "#6f1bd3", color2: "#ff02e8" },
  { id: "seg-2", x1: 250, x2: 350, gradId: "segGrad-2", color1: "#ff02e8", color2: "#2254f5" },
  { id: "seg-3", x1: 350, x2: 450, gradId: "segGrad-3", color1: "#2254f5", color2: "#43b752" },
  { id: "seg-4", x1: 450, x2: 550, gradId: "segGrad-4", color1: "#43b752", color2: "#ff6900" },
  { id: "seg-5", x1: 550, x2: 650, gradId: "segGrad-5", color1: "#ff6900", color2: "#efb219" },
];

const CORE_CONDUITS = [
  { d: "M 50 68 Q 160 145 350 145", color: "#cc0000" },
  { d: "M 150 68 Q 230 145 350 145", color: "#6f1bd3" },
  { d: "M 250 68 L 350 145", color: "#ff02e8" },
  { d: "M 350 68 L 350 145", color: "#2254f5" },
  { d: "M 450 68 L 350 145", color: "#43b752" },
  { d: "M 550 68 L 350 145", color: "#ff6900" },
  { d: "M 650 68 Q 540 145 350 145", color: "#efb219" },
];

const CHAPTER_TWO_STEPS: TypewriterStep[] = [
  {
    // Beat 0: The Architecture Declaration (First frame: ONLY text appears, nothing below)
    text: "IMPROVE replaces isolated tools with a single, conscious ecosystem built on seven pillars:",
    typeSpeed: 48,
    pauseAtEnd: 2600,
    deleteSpeed: 20,
    pauseAfterDelete: 450,
  },
  {
    // Beat 1: The 7 Logos emerge slowly one by one as typed
    text: "Relationships, Mind, Productivity, Work, Body, Second Brain, and Money.",
    typeSpeed: 54,
    pauseAtEnd: 3200,
    deleteSpeed: 20,
    pauseAfterDelete: 450,
  },
  {
    // Beat 2: Interconnections appear one by one like a reactor!
    text: "These are not separate silos. They are deeply interconnected.",
    typeSpeed: 48,
    pauseAtEnd: 3600,
    deleteSpeed: 20,
    pauseAfterDelete: 450,
  },
  {
    // Beat 3: Central Nervous System active routing
    text: "Your Second Brain and Productivity apps act as the central nervous system, automatically routing data exactly where it needs to go.",
    typeSpeed: 44,
    pauseAtEnd: 3200,
    deleteSpeed: 20,
    pauseAfterDelete: 450,
  },
  {
    // Beat 4: Zero-friction Habit Sync
    text: "When you start an exercise in Productivity, your workout surfaces directly inside Body. Zero app switching required.",
    typeSpeed: 44,
    pauseAtEnd: 3200,
    deleteSpeed: 20,
    pauseAfterDelete: 450,
  },
  {
    // Beat 5: Total Alignment
    text: "Conscious Control: One unified system designed for who you are and where you are going.",
    typeSpeed: 44,
    pauseAtEnd: 3400,
    deleteSpeed: 20,
    pauseAfterDelete: 600,
  },
];

function ChapterTwoAnimatedContent({ accentColor, active }: { accentColor: string; active: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleNodesCount, setVisibleNodesCount] = useState(0);
  const [connectedSegmentsCount, setConnectedSegmentsCount] = useState(0);

  // Reveal the 7 logo apps slowly one by one in exact order to spell IMPROVE as their names are typed!
  useEffect(() => {
    if (stepIndex === 0) {
      setVisibleNodesCount(0);
    } else if (stepIndex === 1) {
      let count = 0;
      if (displayText.includes("Relationships")) count = 1;
      if (displayText.includes("Mind")) count = 2;
      if (displayText.includes("Productivity")) count = 3;
      if (displayText.includes("Work")) count = 4;
      if (displayText.includes("Body")) count = 5;
      if (displayText.includes("Second Brain")) count = 6;
      if (displayText.includes("Money")) count = 7;

      // Once revealed, nodes stay visible even while backspacing!
      setVisibleNodesCount((prev) => Math.max(prev, count));
    } else {
      // Step 2 onwards: All 7 apps remain permanently on screen!
      setVisibleNodesCount(7);
    }
  }, [stepIndex, displayText]);

  // Animate interconnections ONE BY ONE during Step 2 ("deeply interconnected")!
  useEffect(() => {
    if (stepIndex < 2) {
      setConnectedSegmentsCount(0);
    } else if (stepIndex === 2) {
      // Connect segments 0 to 5 one by one (1-6), then conduits to core (7), then core ignition (8)!
      setConnectedSegmentsCount(1);
      const timers: NodeJS.Timeout[] = [];
      for (let i = 2; i <= 8; i++) {
        timers.push(
          setTimeout(() => {
            setConnectedSegmentsCount(i);
          }, (i - 1) * 440)
        );
      }
      return () => timers.forEach(clearTimeout);
    } else {
      // Step 3 onwards: all interconnections remain fully charged
      setConnectedSegmentsCount(8);
    }
  }, [stepIndex]);

  // Reset when active changes
  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setDisplayText("");
      setIsDeleting(false);
      setVisibleNodesCount(0);
      setConnectedSegmentsCount(0);
    }
  }, [active]);

  // Main typing and backspacing loop
  useEffect(() => {
    if (!active) return;

    const currentStep = CHAPTER_TWO_STEPS[stepIndex];
    if (!currentStep) return;

    const targetText = currentStep.text;
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Forward typing
      if (displayText.length < targetText.length) {
        timer = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, currentStep.typeSpeed || 28);
      } else {
        // Sentence fully typed out: pause to read, then start backspacing
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, currentStep.pauseAtEnd || 2200);
      }
    } else {
      // Visible backspacing letter-by-letter
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, currentStep.deleteSpeed || 16);
      } else {
        // Fully backspaced: pause briefly then advance to next sentence or loop back
        timer = setTimeout(() => {
          setStepIndex((prev) => (prev + 1) % CHAPTER_TWO_STEPS.length);
          setIsDeleting(false);
        }, currentStep.pauseAfterDelete || 350);
      }
    }

    return () => clearTimeout(timer);
  }, [active, stepIndex, displayText, isDeleting]);

  // Reactor state flags
  const isReactorActive = stepIndex >= 2;
  const isNervousSystemActive = stepIndex === 3;
  const isHabitSyncActive = stepIndex === 4;
  const isTotalAlignment = stepIndex === 5;

  return (
    <div className="space-y-6">
      {/* Typewritten Line: Types out and backspaces letter-by-letter one sentence at a time */}
      <div className="min-h-[4.8em] sm:min-h-[3.6em] flex items-center">
        <p className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {stepIndex === 0 && (
            <span>
              {displayText
                .split(/(single, conscious ecosystem)/g)
                .map((part, i) =>
                  part === "single, conscious ecosystem" ? (
                    <span
                      key={i}
                      className="font-semibold drop-shadow-[0_0_12px_rgba(255,2,232,0.5)]"
                      style={{ color: accentColor }}
                    >
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
            </span>
          )}

          {stepIndex === 1 && (
            <span>
              {displayText
                .split(/(Relationships|Mind|Productivity|Work|Body|Second Brain|Money)/g)
                .map((part, i) => {
                  const pillar = ECOSYSTEM_PILLARS.find((p) => p.name === part);
                  if (pillar) {
                    return (
                      <span
                        key={i}
                        className="font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
                        style={{ color: pillar.color }}
                      >
                        {part}
                      </span>
                    );
                  }
                  return <span key={i}>{part}</span>;
                })}
            </span>
          )}

          {stepIndex === 2 && (
            <span>
              {displayText
                .split(/(deeply interconnected)/g)
                .map((part, i) =>
                  part === "deeply interconnected" ? (
                    <span
                      key={i}
                      className="font-bold underline decoration-fuchsia-500/60 underline-offset-4 drop-shadow-[0_0_16px_rgba(255,2,232,0.7)]"
                      style={{ color: accentColor }}
                    >
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
            </span>
          )}

          {stepIndex === 3 && (
            <span>
              {displayText
                .replace("central nervous system", "§NERVOUS§")
                .replace("automatically routing data", "§ROUTING§")
                .split(/(§NERVOUS§|§ROUTING§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§NERVOUS§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold underline decoration-fuchsia-500/50 underline-offset-4 drop-shadow-[0_0_12px_rgba(255,2,232,0.6)]"
                        style={{ color: "#ff02e8" }}
                      >
                        central nervous system
                      </span>
                    );
                  }
                  if (chunk === "§ROUTING§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_12px_rgba(255,105,0,0.6)]"
                        style={{ color: "#ff6900" }}
                      >
                        automatically routing data
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          {stepIndex === 4 && (
            <span>
              {displayText
                .replace("Productivity", "§PROD§")
                .replace("Body", "§BODY§")
                .replace("Zero app switching required", "§ZERO§")
                .split(/(§PROD§|§BODY§|§ZERO§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§PROD§") {
                    return (
                      <span key={idx} className="font-bold" style={{ color: "#ff02e8" }}>
                        Productivity
                      </span>
                    );
                  }
                  if (chunk === "§BODY§") {
                    return (
                      <span key={idx} className="font-bold" style={{ color: "#43b752" }}>
                        Body
                      </span>
                    );
                  }
                  if (chunk === "§ZERO§") {
                    return (
                      <strong key={idx} className="text-white font-bold drop-shadow-[0_0_12px_rgba(255,255,255,0.5)]">
                        Zero app switching required
                      </strong>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          {stepIndex === 5 && (
            <span>
              {displayText
                .replace("Conscious Control", "§CONSCIOUS§")
                .replace("One unified system", "§UNIFIED§")
                .split(/(§CONSCIOUS§|§UNIFIED§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§CONSCIOUS§" || chunk === "§UNIFIED§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_12px_rgba(255,2,232,0.6)]"
                        style={{ color: accentColor }}
                      >
                        {chunk === "§CONSCIOUS§" ? "Conscious Control" : "One unified system"}
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          <span
            className="inline-block w-[2px] h-[1em] ml-1 align-middle animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        </p>
      </div>

      {/* Frame 1: Nothing appears below the text. When stepIndex >= 1: Logo stage fades in */}
      <AnimatePresence>
        {stepIndex >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-[190px] sm:min-h-[220px] rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/70 backdrop-blur-xl p-4 sm:p-6 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex items-center justify-center"
          >
            {/* Ambient radial glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-25 blur-3xl transition-opacity duration-700"
              style={{
                background: isReactorActive
                  ? "radial-gradient(circle at 50% 50%, #ff02e8 0%, #ff6900 35%, transparent 70%)"
                  : "radial-gradient(circle at 50% 50%, #ffffff10 0%, transparent 60%)",
              }}
            />

            {/* Interconnection Lines & Reactor Core SVG Canvas */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 700 180"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="reactorGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                {INTERCONNECT_SEGMENTS.map((seg) => (
                  <linearGradient key={seg.gradId} id={seg.gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={seg.color1} stopOpacity="1" />
                    <stop offset="100%" stopColor={seg.color2} stopOpacity="1" />
                  </linearGradient>
                ))}
              </defs>

              {/* 1. Sequential Inter-Node Horizontal Connections (One by One) */}
              {INTERCONNECT_SEGMENTS.map((seg, sIdx) => {
                if (connectedSegmentsCount <= sIdx) return null;
                return (
                  <g key={seg.id}>
                    {/* Background faint line */}
                    <line
                      x1={seg.x1}
                      y1="60"
                      x2={seg.x2}
                      y2="60"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="2"
                    />
                    {/* Glowing plasma laser segment drawing in smoothly */}
                    <motion.line
                      x1={seg.x1}
                      y1="60"
                      x2={seg.x2}
                      y2="60"
                      stroke={`url(#${seg.gradId})`}
                      strokeWidth="3"
                      strokeDasharray="8 10"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1, strokeDashoffset: [0, -36] }}
                      transition={{
                        pathLength: { duration: 0.45, ease: "easeOut" },
                        strokeDashoffset: { duration: 1.2, repeat: Infinity, ease: "linear" },
                      }}
                      filter="url(#reactorGlow)"
                    />
                  </g>
                );
              })}

              {/* 2. Central Nervous System Overhead Arc: Productivity (250) <-> Second Brain (550) */}
              {connectedSegmentsCount >= 6 && (
                <g>
                  <path
                    d="M 250 38 Q 400 -18 550 38"
                    fill="none"
                    stroke="rgba(255, 2, 232, 0.2)"
                    strokeWidth="2"
                  />
                  <motion.path
                    d="M 250 38 Q 400 -18 550 38"
                    fill="none"
                    stroke={isNervousSystemActive ? "#ff02e8" : "rgba(255, 2, 232, 0.6)"}
                    strokeWidth={isNervousSystemActive ? "3.5" : "2"}
                    strokeDasharray="8 10"
                    animate={{ strokeDashoffset: [0, -36] }}
                    transition={{
                      duration: isNervousSystemActive ? 0.8 : 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    filter="url(#reactorGlow)"
                  />
                </g>
              )}

              {/* 3. Habit & Workout Sync Under-Arc: Productivity (250) <-> Body (450) */}
              {connectedSegmentsCount >= 6 && (
                <g>
                  <path
                    d="M 250 82 Q 350 140 450 82"
                    fill="none"
                    stroke="rgba(67, 183, 82, 0.2)"
                    strokeWidth="2"
                  />
                  <motion.path
                    d="M 250 82 Q 350 140 450 82"
                    fill="none"
                    stroke={isHabitSyncActive ? "#43b752" : "rgba(67, 183, 82, 0.6)"}
                    strokeWidth={isHabitSyncActive ? "3.5" : "2"}
                    strokeDasharray="8 10"
                    animate={{ strokeDashoffset: [0, -36] }}
                    transition={{
                      duration: isHabitSyncActive ? 0.8 : 1.5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    filter="url(#reactorGlow)"
                  />
                </g>
              )}

              {/* 4. Conduits streaming from all 7 nodes down to Central Fusion Core */}
              {connectedSegmentsCount >= 7 && (
                <g>
                  {CORE_CONDUITS.map((cond, cIdx) => (
                    <motion.path
                      key={cIdx}
                      d={cond.d}
                      fill="none"
                      stroke={cond.color}
                      strokeWidth="1.8"
                      strokeOpacity="0.75"
                      strokeDasharray="6 8"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1, strokeDashoffset: [0, -28] }}
                      transition={{
                        pathLength: { duration: 0.5, ease: "easeOut" },
                        strokeDashoffset: { duration: 1.5, repeat: Infinity, ease: "linear" },
                      }}
                    />
                  ))}
                </g>
              )}

              {/* 5. Central Fusion Reactor Core at (350, 140) */}
              {connectedSegmentsCount >= 8 && (
                <g transform="translate(350, 140)">
                  {/* Expanding reactor pulse wave */}
                  <motion.circle
                    r="30"
                    fill="none"
                    stroke="#ff02e8"
                    strokeWidth="1.5"
                    animate={{ r: [10, 42], opacity: [0.8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                  {/* Rotating outer ring */}
                  <motion.circle
                    r="22"
                    fill="none"
                    stroke="rgba(255, 2, 232, 0.6)"
                    strokeWidth="2"
                    strokeDasharray="6 6"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Rotating inner ring */}
                  <motion.circle
                    r="14"
                    fill="none"
                    stroke="rgba(255, 105, 0, 0.8)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Glowing core diode */}
                  <circle r="6" fill="#ffffff" filter="url(#reactorGlow)" />
                </g>
              )}
            </svg>

            {/* 7 Logo Nodes: Just the Logos, nothing else! Appearing slowly one by one */}
            <div className="grid grid-cols-7 gap-2 sm:gap-4 md:gap-6 relative z-10 w-full items-center">
              {ECOSYSTEM_PILLARS.map((pillar, idx) => {
                const isVisible = visibleNodesCount > idx;
                const isHighlighted =
                  (isNervousSystemActive && pillar.isNervousSystem) ||
                  (isHabitSyncActive && (pillar.letter === "P" || pillar.letter === "O")) ||
                  isTotalAlignment;

                return (
                  <div key={pillar.letter} className="flex flex-col items-center justify-center">
                    <AnimatePresence>
                      {isVisible && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3, y: 28 }}
                          animate={{
                            opacity: 1,
                            scale: isHighlighted ? 1.12 : 1,
                            y: 0,
                          }}
                          exit={{ opacity: 0, scale: 0.3 }}
                          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                          className="relative flex items-center justify-center"
                        >
                          {/* Frosted Glass Logo Pod: ONLY the Logo, Nothing Else */}
                          <div
                            className={`w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl border flex items-center justify-center bg-black/75 backdrop-blur-md relative overflow-hidden transition-all shadow-xl ${
                              isHighlighted ? "ring-2 shadow-[0_0_30px]" : ""
                            }`}
                            style={{
                              borderColor: isReactorActive ? `${pillar.color}90` : "rgba(255,255,255,0.18)",
                              boxShadow:
                                isHighlighted || isReactorActive
                                  ? `0 0 25px ${pillar.glowColor}`
                                  : undefined,
                            }}
                          >
                            {/* Ambient inner color glow */}
                            <div
                              className="absolute inset-0 opacity-20 pointer-events-none"
                              style={{ backgroundColor: pillar.color }}
                            />

                            {/* App Logo SVG */}
                            <img
                              src={pillar.logoSrc}
                              alt={pillar.name}
                              className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 object-contain relative z-10 drop-shadow-md select-none pointer-events-none"
                            />

                            {/* Reactor Active Beacon Ping */}
                            {isReactorActive && (
                              <motion.div
                                className="absolute inset-0 rounded-2xl sm:rounded-3xl border pointer-events-none"
                                style={{ borderColor: pillar.color }}
                                animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.9, 0.4] }}
                                transition={{ duration: 2.2, repeat: Infinity, delay: idx * 0.25 }}
                              />
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CHAPTER_THREE_STEPS: TypewriterStep[] = [
  {
    // Beat 0: The Sovereign Declaration (First frame: ONLY text appears, nothing below)
    text: "Absolute control over your life requires absolute control over your data. IMPROVE is built as a closed, local system.",
    typeSpeed: 48,
    pauseAtEnd: 2600,
    deleteSpeed: 20,
    pauseAfterDelete: 450,
  },
  {
    // Beat 1: On-device neural processing & Apple Intelligence
    text: "By leveraging on-device frameworks like Apple Intelligence and Siri, data is processed directly on your machine with zero external AI bills.",
    typeSpeed: 48,
    pauseAtEnd: 3200,
    deleteSpeed: 20,
    pauseAfterDelete: 450,
  },
  {
    // Beat 2: Zero third-party databases / active threat deflection shield
    text: "There are no third-party databases analyzing your habits. There is no one selling your information.",
    typeSpeed: 48,
    pauseAtEnd: 3200,
    deleteSpeed: 20,
    pauseAfterDelete: 450,
  },
  {
    // Beat 3: Impenetrable local sanctuary
    text: "Your finances, your thoughts, and your routines remain strictly yours. Fast, intelligent, and completely private.",
    typeSpeed: 46,
    pauseAtEnd: 3400,
    deleteSpeed: 20,
    pauseAfterDelete: 600,
  },
];

const SANCTUARY_ENCLAVES = [
  {
    id: "finances",
    name: "Finances",
    subtitle: "Encrypted Ledger",
    color: "#eab308",
    glowColor: "rgba(234, 179, 8, 0.6)",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V6m0 8v2m0-10C6.477 6 2 10.477 2 16s4.477 10 10 10 10-4.477 10-10S17.523 6 12 6z" />
      </svg>
    ),
  },
  {
    id: "thoughts",
    name: "Thoughts",
    subtitle: "Private Journal",
    color: "#a855f7",
    glowColor: "rgba(168, 85, 247, 0.6)",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: "neural-core",
    isCore: true,
    name: "Neural Core",
    subtitle: "Apple Intelligence",
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.8)",
    icon: (
      <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 9h6v6H9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
      </svg>
    ),
  },
  {
    id: "routines",
    name: "Routines",
    subtitle: "Habit Engine",
    color: "#22c55e",
    glowColor: "rgba(34, 197, 94, 0.6)",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    id: "knowledge",
    name: "Knowledge",
    subtitle: "Local Second Brain",
    color: "#f97316",
    glowColor: "rgba(249, 115, 22, 0.6)",
    icon: (
      <svg className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
];

function ChapterThreeAnimatedContent({ accentColor, active }: { accentColor: string; active: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [visibleEnclavesCount, setVisibleEnclavesCount] = useState(0);

  // Stagger in the enclaves in Step 1
  useEffect(() => {
    if (stepIndex === 0) {
      setVisibleEnclavesCount(0);
    } else if (stepIndex === 1) {
      setVisibleEnclavesCount(1);
      const timers: NodeJS.Timeout[] = [];
      for (let i = 2; i <= 5; i++) {
        timers.push(
          setTimeout(() => {
            setVisibleEnclavesCount(i);
          }, (i - 1) * 320)
        );
      }
      return () => timers.forEach(clearTimeout);
    } else {
      setVisibleEnclavesCount(5);
    }
  }, [stepIndex]);

  // Reset when active changes
  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setDisplayText("");
      setIsDeleting(false);
      setVisibleEnclavesCount(0);
    }
  }, [active]);

  // Main typing and backspacing loop
  useEffect(() => {
    if (!active) return;

    const currentStep = CHAPTER_THREE_STEPS[stepIndex];
    if (!currentStep) return;

    const targetText = currentStep.text;
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Forward typing
      if (displayText.length < targetText.length) {
        timer = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, currentStep.typeSpeed || 46);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, currentStep.pauseAtEnd || 2800);
      }
    } else {
      // Visible backspacing letter-by-letter
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, currentStep.deleteSpeed || 20);
      } else {
        timer = setTimeout(() => {
          setStepIndex((prev) => (prev + 1) % CHAPTER_THREE_STEPS.length);
          setIsDeleting(false);
        }, currentStep.pauseAfterDelete || 450);
      }
    }

    return () => clearTimeout(timer);
  }, [active, stepIndex, displayText, isDeleting]);

  // Sanctuary state flags
  const isNeuralActive = stepIndex >= 1;
  const isShieldActive = stepIndex >= 2;
  const isVaultLocked = stepIndex === 3;

  return (
    <div className="space-y-6">
      {/* Typewritten Line: Types out and backspaces letter-by-letter one sentence at a time */}
      <div className="min-h-[4.8em] sm:min-h-[3.6em] flex items-center">
        <p className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {stepIndex === 0 && (
            <span>
              {displayText
                .split(/(closed, local system)/g)
                .map((part, i) =>
                  part === "closed, local system" ? (
                    <span
                      key={i}
                      className="font-semibold drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                      style={{ color: accentColor }}
                    >
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
            </span>
          )}

          {stepIndex === 1 && (
            <span>
              {displayText
                .replace("Apple Intelligence and Siri", "§AI§")
                .replace("zero external AI bills", "§BILLS§")
                .split(/(§AI§|§BILLS§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§AI§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold underline decoration-emerald-500/50 underline-offset-4 drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]"
                        style={{ color: accentColor }}
                      >
                        Apple Intelligence and Siri
                      </span>
                    );
                  }
                  if (chunk === "§BILLS§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]"
                        style={{ color: "#06b6d4" }}
                      >
                        zero external AI bills
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          {stepIndex === 2 && (
            <span>
              {displayText
                .replace("no third-party databases", "§NODB§")
                .replace("no one selling your information", "§NOSELL§")
                .split(/(§NODB§|§NOSELL§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§NODB§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold underline decoration-emerald-500/60 underline-offset-4 drop-shadow-[0_0_14px_rgba(34,197,94,0.7)]"
                        style={{ color: accentColor }}
                      >
                        no third-party databases
                      </span>
                    );
                  }
                  if (chunk === "§NOSELL§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_14px_rgba(34,197,94,0.7)]"
                        style={{ color: accentColor }}
                      >
                        no one selling your information
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          {stepIndex === 3 && (
            <span>
              {displayText
                .replace("strictly yours", "§YOURS§")
                .replace("completely private", "§PRIVATE§")
                .split(/(§YOURS§|§PRIVATE§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§YOURS§" || chunk === "§PRIVATE§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_16px_rgba(34,197,94,0.8)]"
                        style={{ color: accentColor }}
                      >
                        {chunk === "§YOURS§" ? "strictly yours" : "completely private"}
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          <span
            className="inline-block w-[2px] h-[1em] ml-1 align-middle animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        </p>
      </div>

      {/* Frame 1: Nothing appears below the text. When stepIndex >= 1: Sanctuary Neural Shield fades in */}
      <AnimatePresence>
        {stepIndex >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-[190px] sm:min-h-[220px] rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/75 backdrop-blur-xl p-4 sm:p-6 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex items-center justify-center"
          >
            {/* Ambient radial glow */}
            <div
              className="pointer-events-none absolute inset-0 opacity-25 blur-3xl transition-opacity duration-700"
              style={{
                background: isVaultLocked
                  ? "radial-gradient(circle at 50% 50%, #22c55e 0%, #10b981 35%, transparent 70%)"
                  : isShieldActive
                  ? "radial-gradient(circle at 50% 50%, #22c55e 0%, #06b6d4 35%, transparent 70%)"
                  : "radial-gradient(circle at 50% 50%, #ffffff10 0%, transparent 60%)",
              }}
            />

            {/* Neural Circuitry & Threat Deflection Shield SVG Canvas */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 700 180"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <filter id="sanctuaryGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <linearGradient id="neuralLineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.8" />
                </linearGradient>

                <linearGradient id="threatVectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="1" />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* 1. Closed-Loop Local Neural Conduits connecting Enclaves to Core (x=350, y=60) */}
              {isNeuralActive && (
                <g>
                  {/* Left bus: Finances (100) -> Thoughts (220) -> Core (350) */}
                  <line x1="100" y1="60" x2="350" y2="60" stroke="rgba(34,197,94,0.15)" strokeWidth="2" />
                  <motion.line
                    x1="100"
                    y1="60"
                    x2="350"
                    y2="60"
                    stroke="url(#neuralLineGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="6 8"
                    animate={{ strokeDashoffset: [0, -28] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    filter="url(#sanctuaryGlow)"
                  />

                  {/* Right bus: Knowledge (600) -> Routines (480) -> Core (350) */}
                  <line x1="350" y1="60" x2="600" y2="60" stroke="rgba(34,197,94,0.15)" strokeWidth="2" />
                  <motion.line
                    x1="350"
                    y1="60"
                    x2="600"
                    y2="60"
                    stroke="url(#neuralLineGrad)"
                    strokeWidth="2.5"
                    strokeDasharray="6 8"
                    animate={{ strokeDashoffset: [0, 28] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
                    filter="url(#sanctuaryGlow)"
                  />
                </g>
              )}

              {/* 2. Active Threat Deflection Shield (Step 2 & 3) */}
              {isShieldActive && (
                <g>
                  {/* Hexagonal Forcefield Perimeter Arc */}
                  <motion.path
                    d="M 80 24 Q 350 -16 620 24"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="3"
                    strokeDasharray="10 8"
                    animate={{ strokeDashoffset: [0, -36] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    filter="url(#sanctuaryGlow)"
                  />
                  <path
                    d="M 80 24 Q 350 -16 620 24"
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.25)"
                    strokeWidth="8"
                  />

                  {/* Incoming external tracker threat 1 striking from top-left */}
                  <motion.line
                    x1="160"
                    y1="-15"
                    x2="230"
                    y2="10"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="4 6"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Deflection Impact Spark 1 */}
                  <motion.circle
                    cx="230"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    animate={{ r: [3, 16], opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeOut" }}
                  />

                  {/* Incoming external tracker threat 2 striking from top-right */}
                  <motion.line
                    x1="540"
                    y1="-15"
                    x2="470"
                    y2="10"
                    stroke="#ef4444"
                    strokeWidth="2.5"
                    strokeDasharray="4 6"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Deflection Impact Spark 2 */}
                  <motion.circle
                    cx="470"
                    cy="10"
                    r="8"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                    animate={{ r: [3, 16], opacity: [1, 0] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeOut", delay: 0.3 }}
                  />

                  {/* Shield Status Badge in SVG */}
                  <text
                    x="350"
                    y="14"
                    textAnchor="middle"
                    fill="#22c55e"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    letterSpacing="1.5"
                  >
                    ● 100% LOCAL SHIELD • ZERO DATA LEAKAGE
                  </text>
                </g>
              )}

              {/* 3. Central Cryptographic Vault Lock Rings at (350, 60) */}
              {isVaultLocked && (
                <g transform="translate(350, 60)">
                  {/* Expanding cryptographic security radar pulse */}
                  <motion.circle
                    r="32"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="1.5"
                    animate={{ r: [16, 48], opacity: [0.8, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                  {/* Rotating security cipher ring */}
                  <motion.circle
                    r="24"
                    fill="none"
                    stroke="rgba(34, 197, 94, 0.7)"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  />
                  {/* Counter-rotating cipher ring */}
                  <motion.circle
                    r="16"
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.8)"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    animate={{ rotate: -360 }}
                    transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  />
                </g>
              )}
            </svg>

            {/* 5 Enclaves: 4 Local Vaults + Central On-Device Neural Core */}
            <div className="grid grid-cols-5 gap-2 sm:gap-4 md:gap-6 relative z-10 w-full items-center">
              {SANCTUARY_ENCLAVES.map((enc, idx) => {
                const isVisible = visibleEnclavesCount > idx;
                const isHighlight = isVaultLocked || (isShieldActive && enc.isCore);

                return (
                  <div key={enc.id} className="flex flex-col items-center justify-center">
                    <AnimatePresence>
                      {isVisible && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.3, y: 28 }}
                          animate={{
                            opacity: 1,
                            scale: isHighlight ? 1.08 : 1,
                            y: 0,
                          }}
                          exit={{ opacity: 0, scale: 0.3 }}
                          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                          className="relative flex flex-col items-center justify-center"
                        >
                          {/* Frosted Enclave Pod */}
                          <div
                            className={`w-13 h-13 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-2xl sm:rounded-3xl border flex items-center justify-center bg-black/75 backdrop-blur-md relative overflow-hidden transition-all shadow-xl ${
                              isHighlight ? "ring-2 shadow-[0_0_30px]" : ""
                            }`}
                            style={{
                              borderColor: isShieldActive ? `${enc.color}90` : "rgba(255,255,255,0.18)",
                              boxShadow:
                                isHighlight || isShieldActive
                                  ? `0 0 25px ${enc.glowColor}`
                                  : undefined,
                            }}
                          >
                            {/* Ambient inner glow */}
                            <div
                              className="absolute inset-0 opacity-20 pointer-events-none"
                              style={{ backgroundColor: enc.color }}
                            />

                            {/* Enclave Icon */}
                            <div className="relative z-10 drop-shadow-md">
                              {enc.icon}
                            </div>

                            {/* Lock Ping in Step 3 */}
                            {isVaultLocked && (
                              <motion.div
                                className="absolute inset-0 rounded-2xl sm:rounded-3xl border pointer-events-none"
                                style={{ borderColor: enc.color }}
                                animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.9, 0.4] }}
                                transition={{ duration: 2.2, repeat: Infinity, delay: idx * 0.25 }}
                              />
                            )}
                          </div>

                          {/* Minimal Label below */}
                          <span className="text-[10px] sm:text-xs font-mono font-bold text-white mt-2 truncate max-w-[85px] sm:max-w-none block text-center">
                            {enc.name}
                          </span>
                          <span className="hidden sm:block text-[9px] font-mono text-zinc-400 truncate max-w-[85px] sm:max-w-none text-center">
                            {enc.subtitle}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CHAPTER_FOUR_STEPS: TypewriterStep[] = [
  {
    text: "True clarity shouldn't require managing—and paying for—a chaotic web of single-purpose subscriptions.",
    typeSpeed: 46,
    deleteSpeed: 18,
    pauseAtEnd: 3000,
    pauseAfterDelete: 500,
  },
  {
    text: "Start with our Free Core: fundamental focus timers, habits, and daily planning without paying a single dollar.",
    typeSpeed: 46,
    deleteSpeed: 18,
    pauseAtEnd: 3200,
    pauseAfterDelete: 450,
  },
  {
    text: "Need specific superpowers? Pick individual IMPROVE pillars a la carte for just $7 each with lifetime access.",
    typeSpeed: 46,
    deleteSpeed: 18,
    pauseAtEnd: 3200,
    pauseAfterDelete: 450,
  },
  {
    text: "For $40, unlock the entire IMPROVE ecosystem: all 7 pillars interconnected, zero recurring AI bills, and lifetime alignment.",
    typeSpeed: 46,
    deleteSpeed: 18,
    pauseAtEnd: 3400,
    pauseAfterDelete: 500,
  },
];

interface MiniCtaPlan {
  id: string;
  name: string;
  price: string;
  buttonText: string;
  features: string[];
}

const MINI_CTA_PLANS: MiniCtaPlan[] = [
  {
    id: "free",
    name: "Free Plan",
    price: "FREE",
    buttonText: "LEAVE THE NOISE BEHIND →",
    features: [
      "Basic Focus Timer",
      "Daily Task Lists",
      "Habit Tracking Basics",
      "Essential Reminders",
      "Single Device Access",
      "Community Support",
    ],
  },
  {
    id: "each_app",
    name: "Each App",
    price: "$7",
    buttonText: "UNLOCK ANY APP →",
    features: [
      "Pick Any 1 Individual Improve App",
      "Productivity App Pro ($7/mo)",
      "Body Optimization Pro ($7/mo)",
      "Second Brain Pro ($7/mo)",
      "Money & Wealth Pro ($7/mo)",
      "Work Mastery Pro ($7/mo)",
      "Mind & Clarity Pro ($7/mo)",
      "Relationships Pro ($7/mo)",
      "Full iOS System App Blocker",
      "Apple Calendar Two-Way Sync",
      "Biological Energy Tracking",
    ],
  },
  {
    id: "ecosystem",
    name: "Improve Ecosystem",
    price: "$40",
    buttonText: "ACCESS WHOLE ECOSYSTEM →",
    features: [
      "All 8+ Premium Improve Apps",
      "Productivity App Pro",
      "Fitness & Habit Suite Pro",
      "Mindfulness & Journaling Pro",
      "Finance & Budgeting Pro",
      "Real-time Cloud Sync",
      "Priority 24/7 Support",
      "Family Sharing Included",
    ],
  },
];

function MiniVerticalMarquee({
  children,
  speed = 18,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  return (
    <div
      className={`group flex flex-col overflow-hidden ${className || ""}`}
      style={{ "--duration": `${speed}s` } as React.CSSProperties}
    >
      <div className="flex shrink-0 flex-col animate-marquee-vertical group-hover:[animation-play-state:paused]">
        {children}
      </div>
      <div
        className="flex shrink-0 flex-col animate-marquee-vertical group-hover:[animation-play-state:paused]"
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

function ChapterFourAnimatedContent({ accentColor, active }: { accentColor: string; active: boolean }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [manualPlanIdx, setManualPlanIdx] = useState<number | null>(null);

  // Sync selected plan with typewriter step, unless manually clicked for that step
  useEffect(() => {
    setManualPlanIdx(null);
  }, [stepIndex]);

  const activePlanIdx =
    manualPlanIdx !== null
      ? manualPlanIdx
      : stepIndex === 1
      ? 0
      : stepIndex === 2
      ? 1
      : stepIndex === 3
      ? 2
      : 0;

  // Reset when active state toggles
  useEffect(() => {
    if (!active) {
      setStepIndex(0);
      setDisplayText("");
      setIsDeleting(false);
      setManualPlanIdx(null);
    }
  }, [active]);

  // Main typing and backspacing loop
  useEffect(() => {
    if (!active) return;

    const currentStep = CHAPTER_FOUR_STEPS[stepIndex];
    if (!currentStep) return;

    const targetText = currentStep.text;
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Forward typing
      if (displayText.length < targetText.length) {
        timer = setTimeout(() => {
          setDisplayText(targetText.slice(0, displayText.length + 1));
        }, currentStep.typeSpeed || 46);
      } else {
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, currentStep.pauseAtEnd || 3000);
      }
    } else {
      // Backspacing letter-by-letter
      if (displayText.length > 0) {
        timer = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, currentStep.deleteSpeed || 18);
      } else {
        timer = setTimeout(() => {
          setStepIndex((prev) => (prev + 1) % CHAPTER_FOUR_STEPS.length);
          setIsDeleting(false);
        }, currentStep.pauseAfterDelete || 450);
      }
    }

    return () => clearTimeout(timer);
  }, [active, stepIndex, displayText, isDeleting]);

  return (
    <div className="space-y-6">
      {/* Typewritten Line: Types out and backspaces letter-by-letter */}
      <div className="min-h-[4.8em] sm:min-h-[3.6em] flex items-center">
        <p className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
          {stepIndex === 0 && (
            <span>
              {displayText
                .split(/(chaotic web of single-purpose subscriptions)/g)
                .map((part, i) =>
                  part === "chaotic web of single-purpose subscriptions" ? (
                    <span
                      key={i}
                      className="font-semibold text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                    >
                      {part}
                    </span>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
            </span>
          )}

          {stepIndex === 1 && (
            <span>
              {displayText
                .replace("Free Core", "§FREE§")
                .replace("without paying a single dollar", "§DOLLAR§")
                .split(/(§FREE§|§DOLLAR§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§FREE§" || chunk === "§DOLLAR§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold underline decoration-amber-400/50 underline-offset-4 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                        style={{ color: accentColor }}
                      >
                        {chunk === "§FREE§" ? "Free Core" : "without paying a single dollar"}
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          {stepIndex === 2 && (
            <span>
              {displayText
                .replace("a la carte", "§ALACARTE§")
                .replace("$7 each", "§SEVEN§")
                .replace("lifetime access", "§LIFETIME§")
                .split(/(§ALACARTE§|§SEVEN§|§LIFETIME§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§ALACARTE§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold underline decoration-amber-400/60 underline-offset-4 drop-shadow-[0_0_14px_rgba(245,158,11,0.7)]"
                        style={{ color: accentColor }}
                      >
                        a la carte
                      </span>
                    );
                  }
                  if (chunk === "§SEVEN§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_14px_rgba(245,158,11,0.8)]"
                        style={{ color: accentColor }}
                      >
                        $7 each
                      </span>
                    );
                  }
                  if (chunk === "§LIFETIME§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_14px_rgba(34,197,94,0.7)] text-emerald-400"
                      >
                        lifetime access
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          {stepIndex === 3 && (
            <span>
              {displayText
                .replace("$40", "§FORTY§")
                .replace("entire IMPROVE ecosystem", "§ECOSYSTEM§")
                .replace("zero recurring AI bills", "§NOBILLS§")
                .replace("lifetime alignment", "§ALIGN§")
                .split(/(§FORTY§|§ECOSYSTEM§|§NOBILLS§|§ALIGN§)/g)
                .map((chunk, idx) => {
                  if (chunk === "§FORTY§" || chunk === "§ECOSYSTEM§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_16px_rgba(245,158,11,0.8)]"
                        style={{ color: accentColor }}
                      >
                        {chunk === "§FORTY§" ? "$40" : "entire IMPROVE ecosystem"}
                      </span>
                    );
                  }
                  if (chunk === "§NOBILLS§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold drop-shadow-[0_0_14px_rgba(6,182,212,0.8)] text-cyan-400"
                      >
                        zero recurring AI bills
                      </span>
                    );
                  }
                  if (chunk === "§ALIGN§") {
                    return (
                      <span
                        key={idx}
                        className="font-bold text-white underline decoration-amber-400 underline-offset-4"
                      >
                        lifetime alignment
                      </span>
                    );
                  }
                  return chunk;
                })}
            </span>
          )}

          <span
            className="inline-block w-[2px] h-[1em] ml-1 align-middle animate-pulse"
            style={{ backgroundColor: accentColor }}
          />
        </p>
      </div>

      {/* Frame 1: Nothing appears below the text. When stepIndex >= 1: Scaled-Down Productivity CTA reveals */}
      <AnimatePresence>
        {stepIndex >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative select-none pt-2"
          >
            {/* Sliding Carousel Track: Exact smooth sliding animation as Productivity CTA */}
            <div className="relative overflow-hidden w-full z-10">
              <div
                className="flex transition-transform duration-700 ease-in-out w-full"
                style={{ transform: `translateX(-${activePlanIdx * 100}%)` }}
              >
                {MINI_CTA_PLANS.map((item) => (
                  <div
                    key={item.id}
                    className="w-full flex-shrink-0 grid grid-cols-1 md:grid-cols-2 gap-6 items-center min-w-full px-1"
                  >
                    {/* Left Column: Watermark + Title + Subtitle + Button */}
                    <div className="space-y-4 relative max-w-xl">
                      <div className="relative pt-6 pb-2">
                        {/* Watermark in #FF02E8 */}
                        <div
                          className="absolute z-0 select-none pointer-events-none font-black tracking-tighter leading-none text-[#FF02E8] drop-shadow-[0_0_12px_rgba(255,2,232,0.25)] opacity-100 whitespace-nowrap origin-left -top-6 sm:-top-8 -left-1 text-7xl sm:text-8xl md:text-9xl transition-all duration-500"
                        >
                          {item.price}
                        </div>

                        <div className="relative z-10 pt-8 sm:pt-10 space-y-1.5">
                          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
                            Outgrow The Chaos
                          </h3>
                          <p className="text-xs sm:text-sm font-normal text-zinc-300 leading-relaxed">
                            {item.id === "each_app"
                              ? "Pick any individual IMPROVE app for $7/mo. Full OS-level power & sync."
                              : item.id === "free"
                              ? "Fix your foundation. Essential focus and habit tracking tools."
                              : "Unlimited access to all premium apps across the entire Improve product line."}
                          </p>
                        </div>
                      </div>

                      {/* Call to Action Button */}
                      <div className="pt-1 relative z-10">
                        <button
                          className="group relative px-6 py-2.5 rounded-full font-bold text-xs tracking-wider uppercase overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center text-white"
                          style={{
                            backgroundColor: "#FF02E8",
                            boxShadow: "0 0 20px rgba(255, 2, 232, 0.6)",
                          }}
                        >
                          <span>{item.buttonText}</span>
                        </button>
                      </div>
                    </div>

                    {/* Right Column: Clean Vertical Marquee */}
                    <div className="relative h-[160px] flex items-center justify-start overflow-hidden">
                      <div className="relative w-full h-full pl-2 sm:pl-4">
                        <MiniVerticalMarquee key={item.id} speed={18} className="h-full">
                          {item.features.map((feature, fIdx) => (
                            <div
                              key={fIdx}
                              className="text-base sm:text-lg tracking-tight py-2 text-left transition-all duration-300 origin-left text-zinc-300 hover:text-white"
                            >
                              <span>{feature}</span>
                            </div>
                          ))}
                        </MiniVerticalMarquee>

                        {/* Top gradient vignette */}
                        <div className="pointer-events-none absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#07050A] via-[#07050A]/80 to-transparent z-10" />

                        {/* Bottom gradient vignette */}
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#07050A] via-[#07050A]/80 to-transparent z-10" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Switching Tabs with Name + Price/mo - Exactly like Productivity CTA */}
            <div className="mt-5 pt-4 border-t border-zinc-900 grid grid-cols-3 gap-2 relative z-10">
              {MINI_CTA_PLANS.map((plan, idx) => {
                const isActive = activePlanIdx === idx;
                return (
                  <button
                    key={plan.id}
                    onClick={() => setManualPlanIdx(idx)}
                    className={`relative py-2.5 px-2 rounded-lg text-xs font-semibold transition-all duration-300 flex flex-col items-center justify-center space-y-0.5 ${
                      isActive
                        ? "bg-zinc-800 text-white shadow-lg border border-zinc-700"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"
                    }`}
                  >
                    <span>{plan.name}</span>
                    <span
                      className={`text-[10px] font-bold tracking-tight ${
                        isActive ? "text-[#FF02E8]" : "text-zinc-500"
                      }`}
                    >
                      {plan.price === "FREE" ? "Free" : `${plan.price}/mo`}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StorySection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isFrameInView = useInView(containerRef, { amount: 0.25 });

  // Mouse position for magnetic effect on the large background number
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  // Transform for parallax on the large number
  const numberX = useTransform(x, [-200, 200], [-20, 20]);
  const numberY = useTransform(y, [-200, 200], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  };

  const goNext = () => setActiveIndex((prev) => (prev + 1) % STORY_CHAPTERS.length);
  const goPrev = () => setActiveIndex((prev) => (prev - 1 + STORY_CHAPTERS.length) % STORY_CHAPTERS.length);

  // Arrow key navigation when section is in view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFrameInView) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFrameInView]);

  const current = STORY_CHAPTERS[activeIndex];

  return (
    <div className="relative flex items-center justify-center min-h-[90vh] py-20 sm:py-24 px-6 overflow-hidden select-none bg-black text-white">
      {/* Background ambient radial glow matching active section color */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[160px] opacity-15 transition-colors duration-1000 -z-10"
        style={{ backgroundColor: current.accentColor }}
      />

      <div
        ref={containerRef}
        className="relative w-full max-w-5xl mx-auto z-10"
        onMouseMove={handleMouseMove}
      >
        {/* Oversized index number - positioned to bleed off left edge with parallax, taking the section letter color */}
        <motion.div
          className="absolute -left-8 sm:-left-12 top-1/3 -translate-y-1/2 text-[18rem] sm:text-[24rem] md:text-[28rem] font-black select-none pointer-events-none leading-none tracking-tighter -z-10"
          style={{ x: numberX, y: numberY }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
              animate={{ opacity: 0.22, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="block font-mono"
              style={{
                color: current.accentColor,
                textShadow: `0 0 100px ${current.accentColor}55`,
              }}
            >
              {current.number}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        {/* Main content - asymmetric layout from the pasted frame */}
        <div className="relative flex flex-col md:flex-row">
          
          {/* Left column - vertical text & progress bar */}
          <div className="flex md:flex-col items-center justify-between md:justify-center pr-0 md:pr-12 md:border-r border-white/10 mb-6 md:mb-0">
            <motion.span
              className="text-xs font-mono text-zinc-400 tracking-widest uppercase hidden md:block"
              style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              IMPROVE • 0{activeIndex + 1}
            </motion.span>

            {/* Progress line (horizontal on mobile, vertical on desktop) */}
            <div className="relative h-1.5 md:h-36 w-24 md:w-[2px] bg-white/10 my-2 md:mt-8 overflow-hidden rounded-full">
              {/* Mobile horizontal fill */}
              <motion.div
                className="md:hidden absolute top-0 left-0 h-full"
                animate={{
                  width: `${((activeIndex + 1) / STORY_CHAPTERS.length) * 100}%`,
                  backgroundColor: current.accentColor,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              {/* Desktop vertical fill */}
              <motion.div
                className="hidden md:block absolute top-0 left-0 w-full origin-top"
                animate={{
                  height: `${((activeIndex + 1) / STORY_CHAPTERS.length) * 100}%`,
                  backgroundColor: current.accentColor,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>

          {/* Center - Top Half (Headers & Controls) + Bottom Half (Reactive Copy without container) */}
          <div className="flex-1 pl-0 md:pl-12 py-2 sm:py-6">
            
            {/* Top Half: Larger Title, Subtitle, and Sliding Hover Navigation Buttons */}
            <div className="flex items-start justify-between flex-wrap gap-6 mb-8 sm:mb-10 pb-6 border-b border-white/10">
              <div className="flex-1 min-w-[280px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35 }}
                  >
                    {/* LARGER TEXT: The Main Title */}
                    <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-none mb-3 drop-shadow-[0_2px_15px_rgba(0,0,0,0.9)]">
                      {current.title}
                    </h2>

                    {/* Subtitle in the letter's accent color */}
                    <h3
                      className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]"
                      style={{ color: current.accentColor }}
                    >
                      {current.subtitle}
                    </h3>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Navigation with the exact sliding hover effect from the pasted frame */}
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <motion.button
                  onClick={goPrev}
                  className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/20 bg-white/[0.03] hover:bg-white/10 flex items-center justify-center overflow-hidden transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Previous chapter"
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-white group-hover:text-black transition-colors"
                  >
                    <path
                      d="M10 12L6 8L10 4"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>

                <motion.button
                  onClick={goNext}
                  className="group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/20 bg-white/[0.03] hover:bg-white/10 flex items-center justify-center overflow-hidden transition-colors cursor-pointer"
                  whileTap={{ scale: 0.95 }}
                  aria-label="Next chapter"
                >
                  <motion.div
                    className="absolute inset-0 bg-white"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="relative z-10 text-white group-hover:text-black transition-colors"
                  >
                    <path
                      d="M6 4L10 8L6 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              </div>
            </div>

            {/* Bottom Half: Detailed Reactive Copy (NO CONTAINER BOX so background shows through) */}
            <div className="relative w-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-6"
                >
                  {/* CHAPTER 01 gets the dedicated Typewriter & Fragmentation Animation */}
                  {activeIndex === 0 ? (
                    <ChapterOneAnimatedContent
                      accentColor={current.accentColor}
                      active={isFrameInView && activeIndex === 0}
                    />
                  ) : activeIndex === 1 ? (
                    /* CHAPTER 02 gets the dedicated Typewriter, 7-App IMPROVE Assembly & Reactor Fusion Core */
                    <ChapterTwoAnimatedContent
                      accentColor={current.accentColor}
                      active={isFrameInView && activeIndex === 1}
                    />
                  ) : activeIndex === 2 ? (
                    /* CHAPTER 03 gets the dedicated Typewriter, On-Device Neural Intelligence & Sanctuary Vault */
                    <ChapterThreeAnimatedContent
                      accentColor={current.accentColor}
                      active={isFrameInView && activeIndex === 2}
                    />
                  ) : activeIndex === 3 ? (
                    /* CHAPTER 04 gets the dedicated Typewriter & Scaled-Down Productivity CTA Pricing Showcase */
                    <ChapterFourAnimatedContent
                      accentColor={current.accentColor}
                      active={isFrameInView && activeIndex === 3}
                    />
                  ) : (
                    <>
                      {/* Summary Lead for other chapters */}
                      <p className="text-lg sm:text-xl md:text-2xl text-white font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                        {current.explanation.summary}
                      </p>

                      {/* Detailed Explanation Paragraphs */}
                      <div className="space-y-3.5 text-zinc-300 text-sm sm:text-base md:text-lg leading-relaxed font-normal">
                        {current.explanation.details.map((paragraph, pIdx) => (
                          <p key={pIdx}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Callout Cards for other chapters (Ultra-Clean Glass so Background shows through) */}
                  {activeIndex > 3 && current.explanation.callouts && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      {current.explanation.callouts.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm"
                        >
                          {c.badge && (
                            <span
                              className="text-[11px] font-mono font-bold uppercase tracking-wider block mb-1.5"
                              style={{ color: current.accentColor }}
                            >
                              {c.badge}
                            </span>
                          )}
                          <h4 className="text-base sm:text-lg font-bold text-white mb-1.5">
                            {c.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-zinc-300 font-normal leading-relaxed">
                            {c.body}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pricing Cards for later chapters if any */}
                  {activeIndex > 3 && current.explanation.pricing && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      {current.explanation.pricing.map((p, pIdx) => (
                        <div
                          key={pIdx}
                          className={`p-5 rounded-2xl border transition-all backdrop-blur-sm ${
                            p.highlighted
                              ? "border-amber-400/50 bg-amber-400/[0.05] shadow-[0_0_35px_rgba(234,179,8,0.15)]"
                              : "border-white/10 bg-white/[0.02]"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                              {p.plan}
                            </span>
                            {p.badge && (
                              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                {p.badge}
                              </span>
                            )}
                          </div>

                          <div className="flex items-baseline gap-2 mb-3">
                            <span className="text-3xl sm:text-4xl font-black text-white">{p.price}</span>
                            <span className="text-xs text-zinc-400 font-mono">{p.billing}</span>
                          </div>

                          <ul className="space-y-1.5 text-xs text-zinc-300 font-normal">
                            {p.features.map((f, fIdx) => (
                              <li key={fIdx} className="flex items-center gap-2">
                                <span
                                  className="w-1.5 h-1.5 rounded-full"
                                  style={{ backgroundColor: p.highlighted ? "#facc15" : "#a1a1aa" }}
                                />
                                {f}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Bottom ticker from the pasted frame - subtle repeating chapter titles */}
        <div className="overflow-hidden opacity-[0.08] pointer-events-none mt-12 sm:mt-16">
          <motion.div
            className="flex whitespace-nowrap text-5xl sm:text-6xl font-bold tracking-tight text-white font-mono"
            animate={{ x: [0, -1000] }}
            transition={{ duration: 25, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            {[...Array(8)].map((_, i) => (
              <span key={i} className="mx-8">
                {STORY_CHAPTERS.map((t) => t.title).join(" • ")} •
              </span>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
}
