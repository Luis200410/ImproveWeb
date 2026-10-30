"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bebas_Neue } from "@/lib/font-shim";
import {
  Flame,
  Repeat2,
  Flag,
  CheckCircle2,
  FileText,
  Paperclip,
  ListChecks,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Users,
  Brain,
  Zap,
  Briefcase,
  Heart,
  Library,
  Check,
  Ban,
  Star,
  Pause,
  Archive,
} from "lucide-react";

const bebas = Bebas_Neue({ subsets: ["latin"] });

// 13 sequential cinematic beats — unified finale inside the real Micro-Tasks frame
type Beat =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

interface BreakdownTask {
  id: string;
  title: string;
  dateLabel: string;
  dateType: "today" | "flag";
  priority: "Mid" | "High";
}

const BREAKDOWN_TASKS: BreakdownTask[] = [
  {
    id: "t1",
    title: "Filter Out Non-Viable or Low-ROI Projects",
    dateLabel: "Today",
    dateType: "today",
    priority: "Mid",
  },
  {
    id: "t2",
    title: "Define Core Technical Blueprint for App A",
    dateLabel: "Oct 21",
    dateType: "flag",
    priority: "High",
  },
  {
    id: "t3",
    title: "Rank Apps by User Impact & Business Value",
    dateLabel: "Oct 22",
    dateType: "flag",
    priority: "High",
  },
  {
    id: "t4",
    title: "Define Core Technical Blueprint for App B",
    dateLabel: "Oct 23",
    dateType: "flag",
    priority: "High",
  },
];

// Screenshot 1 (Latest): Real Micro-Tasks inside the Task Detail view ("Unit 2 descriptive statistics")
const MICRO_TASKS_LIST: string[] = [
  "Organize data into a structured table using Excel or Google Sheets",
  "Calculate mean using the AVERAGE function in Excel or Google Sheets",
  "Compute median by sorting data and selecting the middle value in Excel or Google Sheets",
  "Find mode by identifying the most frequent value in the organized dataset",
  "Create a frequency distribution table to display data counts per category",
];

// The 6 Colored Area Selection Cards
const AREA_OPTIONS = [
  {
    id: "relationships",
    name: "Relationships",
    sub: "Area",
    bg: "#D90B0B",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Users,
    selected: false,
  },
  {
    id: "mind",
    name: "Mind",
    sub: "Area",
    bg: "#6F1BD3",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Brain,
    selected: false,
  },
  {
    id: "productivity",
    name: "Productivity",
    sub: "Area",
    bg: "#FF02E8",
    iconBg: "rgba(255,255,255,0.25)",
    icon: Zap,
    selected: false,
  },
  {
    id: "work",
    name: "Work",
    sub: "Area",
    bg: "#2254F5",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Briefcase,
    selected: false,
  },
  {
    id: "body",
    name: "Body",
    sub: "Area",
    bg: "#43B752",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Heart,
    selected: false,
  },
  {
    id: "second-brain",
    name: "Second Brain",
    sub: "Area",
    bg: "#FF6900",
    iconBg: "rgba(255,255,255,0.24)",
    icon: Library,
    selected: true,
  },
];

// The Productivity Habit Selector Popover (with AI Auto-Match at the top)
const HABIT_OPTIONS = [
  {
    id: "no-habit",
    name: "No habit",
    sub: "Let the scheduler match",
    bg: "#1F1F22",
    iconBg: "rgba(255,255,255,0.12)",
    icon: Ban,
    isAiMatch: true,
  },
  {
    id: "cooking",
    name: "Cooking time",
    sub: "Relationships · 60 min",
    bg: "#D90B0B",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Users,
    isAiMatch: false,
  },
  {
    id: "creator",
    name: "Connect with your creator",
    sub: "Mind · 55 min",
    bg: "#6F1BD3",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Brain,
    isAiMatch: false,
  },
  {
    id: "shredded",
    name: "Get shredded",
    sub: "Body · 30 min",
    bg: "#43B752",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Heart,
    isAiMatch: false,
  },
  {
    id: "breakfast",
    name: "Breakfast",
    sub: "Body · 30 min",
    bg: "#43B752",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Heart,
    isAiMatch: false,
  },
  {
    id: "ready",
    name: "Get ready to go",
    sub: "Relationships · 5 min",
    bg: "#D90B0B",
    iconBg: "rgba(255,255,255,0.22)",
    icon: Users,
    isAiMatch: false,
  },
];

// October 2026 Monthly Calendar Grid
const OCTOBER_2026_CELLS: (number | null)[] = [
  null,
  null,
  null,
  null,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  26,
  27,
  28,
  29,
  30,
  31,
];

// Exact 4-pointed Apple Intelligence / Second Brain Sparkle SVG
function FourPointStar({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M32 6C33.4 22.8 41.2 30.6 58 32C41.2 33.4 33.4 41.2 32 58C30.6 41.2 22.8 33.4 6 32C22.8 30.6 30.6 22.8 32 6Z"
        fill="#FF6900"
        stroke="#FF5500"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Huge kinetic background typography & subtitle for each beat of the release video
const BEAT_COPY: Record<
  Beat,
  { bgWord: string; kicker: string; headline: string }
> = {
  0: {
    bgWord: "PROJECT",
    kicker: "PROJECT ARCHITECTURE",
    headline: "Define the objective.",
  },
  1: {
    bgWord: "COMMITMENT",
    kicker: "COMMITMENT LEVEL",
    headline: "Set the project commitment intensity.",
  },
  2: {
    bgWord: "STATUS",
    kicker: "PROJECT LIFECYCLE STATUS",
    headline: "Active, Completed, Paused, or Archived.",
  },
  3: {
    bgWord: "LIFE AREA",
    kicker: "TAG 01 · SOVEREIGN LIFE AREA",
    headline: "Anchor the project to its Life Area.",
  },
  4: {
    bgWord: "AI HABIT",
    kicker: "TAG 02 · PRODUCTIVITY HABIT MATCH",
    headline: "Attach a Productivity Habit — or let AI match it.",
  },
  5: {
    bgWord: "DEADLINE",
    kicker: "TAG 03 · TARGET FINISH LINE",
    headline: "Lock your target date on the monthly calendar.",
  },
  6: {
    bgWord: "CONTEXT",
    kicker: "3 NOTES · 5 RESOURCES · 3/3 TASKS",
    headline: "Every note, file, and milestone lives inside.",
  },
  7: {
    bgWord: "REVERSE",
    kicker: "ON-DEVICE APPLE INTELLIGENCE",
    headline: "One tap triggers AI Reverse-Engineering.",
  },
  8: {
    bgWord: "STEP 01",
    kicker: "AUTO-SCHEDULED · TODAY · MID PRIORITY",
    headline: "Filter Out Non-Viable or Low-ROI Projects.",
  },
  9: {
    bgWord: "PRIORITY",
    kicker: "TASK PRIORITY LEVEL · HIGH / MID / LOW",
    headline: "Assign High, Mid, or Low priority to any task.",
  },
  10: {
    bgWord: "STEP 03",
    kicker: "AUTO-SCHEDULED · OCT 22 · HIGH PRIORITY",
    headline: "Rank Apps by User Impact & Business Value.",
  },
  11: {
    bgWord: "STEP 04",
    kicker: "AUTO-SCHEDULED · OCT 23 · HIGH PRIORITY",
    headline: "Define Core Technical Blueprint for App B.",
  },
  12: {
    bgWord: "MICRO-TASKS",
    kicker: "ATOMIC MICRO-STEPS · LIVE PROGRESS SYNC",
    headline: "Check off micro-tasks and watch progress fill to 100%.",
  },
};

export function SecondBrainReverseEngineerMotion() {
  const [beat, setBeat] = useState<Beat>(0);
  const [typedSubtitle, setTypedSubtitle] = useState<string>("");
  const [completedMicroTasks, setCompletedMicroTasks] = useState<number>(0);
  const [viewport, setViewport] = useState<"mobile" | "tablet" | "desktop">("desktop");

  useEffect(() => {
    const updateViewport = () => {
      const w = window.innerWidth;
      if (w < 640) setViewport("mobile");
      else if (w < 1024) setViewport("tablet");
      else setViewport("desktop");
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Typewriter effect for the bottom subtitle while the card is showing
  useEffect(() => {
    const fullText = BEAT_COPY[beat].headline;
    setTypedSubtitle("");
    let i = 0;
    const interval = setInterval(() => {
      i += 1;
      setTypedSubtitle(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(interval);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [beat]);

  // Seamless continuous release-video sequence across all 13 beats — unhurried pace for clear reading
  useEffect(() => {
    const durations: Record<Beat, number> = {
      0: 3800, // 0: Project Card Overview ("Statistics")
      1: 4200, // 1: Project Card -> Red Flame clicked -> Commitment Status Popover
      2: 4200, // 2: Project Card -> Yellow Ring clicked -> Card Status Popover
      3: 4500, // 3: Project Card -> Tag 1 ("Second...") opens Area Popover
      4: 4700, // 4: Project Card -> Tag 2 ("Statistics") opens Habit Popover ("No habit - Let scheduler match")
      5: 4500, // 5: Project Card -> Tag 3 ("Oct 30") opens October 2026 Calendar Popover
      6: 4000, // 6: Project Card -> Zoom to Telemetry row (All done, 3 Notes, 5 Resources, 3/3 Tasks, 100% bar)
      7: 4200, // 7: Cut to Giant White AI Sparkle Trigger Button + Tap shockwave
      8: 3800, // 8: Breakdown Card — Zoom on Task 1 ("Today" / "Mid")
      9: 4400, // 9: Breakdown Card — Task 2 ("Oct 21") + Priority Level Popover opens ("High ✓", "Mid", "Low")
      10: 3800, // 10: Breakdown Card — Camera glides to Task 3 ("Oct 22" / "High")
      11: 3800, // 11: Breakdown Card — Camera glides to Task 4 ("Oct 23" / "High")
      12: 6000, // 12: Unified Micro-Tasks Frame ("Unit 2 descriptive statistics" + Micro-tasks ticking off from 0/10 0% -> 10/10 100%)
    };

    const timer = setTimeout(() => {
      setBeat((prev) => ((prev + 1) % 13) as Beat);
    }, durations[beat]);

    return () => clearTimeout(timer);
  }, [beat]);

  // Animate the real Micro-Tasks checking off one by one and driving the progress bar from 0% to 100% in Beat 12
  useEffect(() => {
    if (beat !== 12) {
      setCompletedMicroTasks(0);
      return;
    }

    const t1 = setTimeout(() => setCompletedMicroTasks(1), 800);
    const t2 = setTimeout(() => setCompletedMicroTasks(2), 1600);
    const t3 = setTimeout(() => setCompletedMicroTasks(3), 2400);
    const t4 = setTimeout(() => setCompletedMicroTasks(4), 3200);
    const t5 = setTimeout(() => setCompletedMicroTasks(5), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [beat]);

  // Camera rig for Scene 1 (Beats 0–6: Project Card + All 5 Anchored Popovers in the EXACT SAME SCENE)
  const getProjectSceneCamera = (b: Beat) => {
    const isMob = viewport === "mobile";
    const isTab = viewport === "tablet";
    const xMult = isMob ? 0 : isTab ? 0.6 : 1;
    const yMult = isMob ? 0.55 : isTab ? 0.8 : 1;

    switch (b) {
      case 0:
        return { scale: isMob ? 1 : 1.08, x: 0, y: 0, rotateX: 4, rotateY: -2 };
      case 1:
        return {
          scale: isMob ? 0.98 : 1.12,
          x: -55 * xMult,
          y: -55 * yMult,
          rotateX: 2,
          rotateY: -3,
        };
      case 2:
        return {
          scale: isMob ? 0.96 : 1.06,
          x: -70 * xMult,
          y: -85 * yMult,
          rotateX: 2,
          rotateY: -3,
        };
      case 3:
        return {
          scale: isMob ? 0.92 : 0.9,
          x: 18 * xMult,
          y: -155 * yMult,
          rotateX: 2,
          rotateY: 2,
        };
      case 4:
        return {
          scale: isMob ? 0.92 : 0.9,
          x: 0,
          y: -155 * yMult,
          rotateX: 2,
          rotateY: 0,
        };
      case 5:
        return {
          scale: isMob ? 0.92 : 0.9,
          x: -18 * xMult,
          y: -145 * yMult,
          rotateX: 2,
          rotateY: -2,
        };
      case 6:
        return {
          scale: isMob ? 1.04 : isTab ? 1.18 : 1.32,
          x: -15 * xMult,
          y: -65 * yMult,
          rotateX: 0,
          rotateY: -2,
        };
      default:
        return { scale: 1, x: 0, y: 0, rotateX: 0, rotateY: 0 };
    }
  };

  // Camera zoom & vertical tracking for the Breakdown List scene (Beats 8, 9, 10, 11)
  const getBreakdownCamera = (b: Beat) => {
    const isMob = viewport === "mobile";
    const isTab = viewport === "tablet";
    const yMult = isMob ? 0.45 : isTab ? 0.75 : 1;
    const baseScale = isMob ? 1.0 : isTab ? 1.1 : 1.18;

    switch (b) {
      case 8:
        return { scale: baseScale, y: 175 * yMult, rotateX: 2 };
      case 9:
        return { scale: isMob ? 0.98 : 1.12, y: 20 * yMult, rotateX: 1 };
      case 10:
        return { scale: baseScale, y: -55 * yMult, rotateX: -1 };
      case 11:
        return { scale: baseScale, y: -170 * yMult, rotateX: -2 };
      default:
        return { scale: 1, y: 0, rotateX: 0 };
    }
  };

  const activeCopy = BEAT_COPY[beat];
  const microTaskPercent = Math.round((completedMicroTasks / 5) * 100);
  const microTaskRatio = `${completedMicroTasks * 2}/10`;

  return (
    <section className="w-full py-6 sm:py-10 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header Outside Container — Dynamic Beat Title */}
        <div className="mb-3 sm:mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2 sm:gap-4 px-1">
          <div>
            <p className="kicker text-[#FF6900] mb-1">
              AI REVERSE-ENGINEERING & MICRO-TASK ENGINE
            </p>
            <div className="min-h-[32px] sm:min-h-[48px] flex items-center">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={`outside-title-${beat}`}
                  initial={{ opacity: 0, y: -8, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 8, filter: "blur(6px)" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display text-2xl sm:text-4xl md:text-5xl font-black uppercase tracking-[0.06em] text-white leading-none text-left"
                >
                  {activeCopy.bgWord}
                </motion.h3>
              </AnimatePresence>
            </div>
          </div>
          <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.2em] text-white/45">
            {String(beat + 1).padStart(2, "0")} / 13 · {activeCopy.kicker}
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            OUR GLOBAL ACCESS-GLASS CONTAINER (FITS IN ONE FRAME)
           ═══════════════════════════════════════════════════════════════════ */}
        <div
          className="access-glass relative w-full min-h-[540px] sm:min-h-[600px] md:min-h-[640px] overflow-hidden flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none"
          style={{ perspective: "1800px" }}
        >
          {/* Ambient Volumetric Orange Glow */}
          <motion.div
            animate={{
              scale: beat === 7 ? [1, 1.35, 1] : 1,
              opacity: beat === 7 ? 0.26 : 0.12,
            }}
            transition={{ duration: 2, ease: "easeInOut" }}
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[520px] h-[300px] sm:h-[420px] bg-[#FF6900] rounded-full blur-[120px] sm:blur-[150px]"
          />

          {/* ═══════════════════════════════════════════════════════════════════
              MAIN STAGE: 3D UI CARD STAGE (ALWAYS PRESENT)
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="relative z-10 w-full flex-1 flex items-center justify-center py-2 sm:py-4">
            <AnimatePresence mode="wait">
              {/* ─────────────────────────────────────────────────────────────
                  SCENE 1 (BEATS 0–6): THE PROJECT CARD + ALL 5 ANCHORED POPOVERS
                 ───────────────────────────────────────────────────────────── */}
                    {beat <= 6 && (
                      <motion.div
                        key="scene-project-card-with-popovers"
                        initial={{ opacity: 0, scale: 0.84, filter: "blur(16px)" }}
                        animate={{
                          opacity: 1,
                          filter: "blur(0px)",
                  ...getProjectSceneCamera(beat),
                }}
                exit={{ opacity: 0, scale: 1.2, filter: "blur(18px)" }}
                transition={{
                  type: "spring",
                  stiffness: 80,
                  damping: 18,
                  mass: 0.9,
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative w-full max-w-[660px]"
              >
                {/* THE PROJECT CARD */}
                <div className="w-full rounded-[28px] sm:rounded-[36px] bg-[#1C1C1E] border border-white/10 p-5 sm:p-10 shadow-[0_35px_100px_rgba(0,0,0,0.95)] relative">
                  {/* Row 1: Project Name ("Statistics") + Commitment Flame & Status Target Ring Badges */}
                  <motion.div
                    animate={{
                      opacity: beat === 6 ? 0.3 : 1,
                    }}
                    className="flex items-center justify-between gap-3 sm:gap-4 relative z-30"
                  >
                    <h3 className="text-3xl sm:text-6xl font-bold text-white tracking-tight leading-none">
                      Statistics
                    </h3>

                    <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                      {/* Red Flame Circle Badge (Commitment Status Trigger) */}
                      <motion.div
                        animate={{
                          scale: beat === 1 ? [1, 0.9, 1.12, 1] : 1,
                          opacity: beat === 2 ? 0.45 : 1,
                        }}
                        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#E04F4F] flex items-center justify-center transition-all ${
                          beat === 1
                            ? "ring-[3px] ring-white/80 shadow-[0_0_32px_rgba(224,79,79,0.9)]"
                            : "shadow-lg"
                        }`}
                      >
                        <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white" />
                      </motion.div>

                      {/* Yellow Target Ring Circle Badge (Card Status Trigger) */}
                      <motion.div
                        animate={{
                          scale: beat === 2 ? [1, 0.9, 1.12, 1] : 1,
                          opacity: beat === 1 ? 0.45 : 1,
                        }}
                        className={`w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-[#F2C72C] flex items-center justify-center transition-all ${
                          beat === 2
                            ? "ring-[3px] ring-white/80 shadow-[0_0_36px_rgba(242,199,44,0.95)]"
                            : "shadow-[0_0_28px_rgba(242,199,44,0.65)]"
                        }`}
                      >
                        <div className="w-4 h-4 sm:w-6 sm:h-6 rounded-full border-[4px] sm:border-[5px] border-white" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Row 2: The 3 Orange Tag Pills (Area, Habit, Deadline) */}
                  <motion.div
                    animate={{
                      opacity: beat === 1 || beat === 2 || beat === 6 ? 0.3 : 1,
                    }}
                    className="relative flex flex-wrap items-center gap-2 sm:gap-4 mt-5 sm:mt-8 z-30"
                  >
                    {/* Pill 1: Area ("Second...") */}
                    <motion.div
                      animate={{
                        scale: beat === 3 ? [1, 0.92, 1.06, 1] : 1,
                        opacity: beat === 4 || beat === 5 ? 0.55 : 1,
                      }}
                      className={`px-3.5 sm:px-6 py-2 sm:py-3 rounded-[14px] sm:rounded-[18px] bg-[#FF6900] text-white font-semibold text-xs sm:text-xl flex items-center gap-1.5 sm:gap-2.5 transition-all ${
                        beat === 3
                          ? "ring-2 ring-white shadow-[0_0_30px_rgba(255,105,0,0.85)]"
                          : "shadow-md"
                      }`}
                    >
                      <Repeat2 className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
                      <span>Second...</span>
                    </motion.div>

                    {/* Pill 2: Attached Habit ("Statistics") */}
                    <motion.div
                      animate={{
                        scale: beat === 4 ? [1, 0.92, 1.06, 1] : 1,
                        opacity: beat === 3 || beat === 5 ? 0.55 : 1,
                      }}
                      className={`px-3.5 sm:px-6 py-2 sm:py-3 rounded-[14px] sm:rounded-[18px] bg-[#FF6900] text-white font-semibold text-xs sm:text-xl flex items-center gap-1.5 sm:gap-2.5 transition-all ${
                        beat === 4
                          ? "ring-2 ring-white shadow-[0_0_30px_rgba(255,105,0,0.85)]"
                          : "shadow-md"
                      }`}
                    >
                      <Repeat2 className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.5]" />
                      <span>Statistics</span>
                    </motion.div>

                    {/* Pill 3: Deadline ("Oct 30") */}
                    <motion.div
                      animate={{
                        scale: beat === 5 ? [1, 0.92, 1.06, 1] : 1,
                        opacity: beat === 3 || beat === 4 ? 0.55 : 1,
                      }}
                      className={`px-3.5 sm:px-6 py-2 sm:py-3 rounded-[14px] sm:rounded-[18px] bg-[#FF6900] text-white font-semibold text-xs sm:text-xl flex items-center gap-1.5 sm:gap-2.5 transition-all ${
                        beat === 5
                          ? "ring-2 ring-white shadow-[0_0_30px_rgba(255,105,0,0.85)]"
                          : "shadow-md"
                      }`}
                    >
                      <Flag className="w-4 h-4 sm:w-6 sm:h-6 stroke-[2.2]" />
                      <span>Oct 30</span>
                    </motion.div>
                  </motion.div>

                  {/* Row 3 & 4: Notes (3), Resources (5), Tasks (3/3), 100% + Progress Bar */}
                  <motion.div
                    animate={{
                      opacity: beat >= 1 && beat <= 5 ? 0.25 : 1,
                      scale: beat === 6 ? 1.04 : 1,
                    }}
                    className="mt-6 sm:mt-9"
                  >
                    <div className="flex items-center justify-between gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 sm:gap-2.5">
                        <CheckCircle2 className="w-5 h-5 sm:w-7 sm:h-7 text-[#FF6900] shrink-0" />
                        <span className="text-sm sm:text-2xl font-semibold text-[#8E8E93]">
                          All done
                        </span>
                      </div>

                      <div className="flex items-center gap-3 sm:gap-6">
                        <div className="flex items-center gap-1 sm:gap-2 text-[#8E8E93] text-xs sm:text-xl font-medium">
                          <FileText
                            className={`w-4 h-4 sm:w-6 sm:h-6 ${
                              beat === 6 ? "text-white" : ""
                            }`}
                          />
                          <span className={beat === 6 ? "text-white font-bold" : ""}>
                            3
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-[#8E8E93] text-xs sm:text-xl font-medium">
                          <Paperclip
                            className={`w-4 h-4 sm:w-6 sm:h-6 ${
                              beat === 6 ? "text-white" : ""
                            }`}
                          />
                          <span className={beat === 6 ? "text-white font-bold" : ""}>
                            5
                          </span>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 text-[#8E8E93] text-xs sm:text-xl font-medium">
                          <ListChecks
                            className={`w-4 h-4 sm:w-6 sm:h-6 ${
                              beat === 6 ? "text-white" : ""
                            }`}
                          />
                          <span className={beat === 6 ? "text-white font-bold" : ""}>
                            3/3
                          </span>
                        </div>
                        <span className="text-2xl sm:text-5xl font-bold text-[#FF6900] tracking-tight">
                          100%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 sm:h-3.5 rounded-full bg-white/10 mt-3 sm:mt-4 overflow-hidden">
                      <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.75, ease: "easeOut" }}
                        className="h-full rounded-full bg-[#FF6900] shadow-[0_0_20px_#FF6900]"
                      />
                    </div>
                  </motion.div>

                  {/* ═══════════════════════════════════════════════════════════
                      ANCHORED DROPDOWN POPOVERS ON THE PROJECT CARD
                     ═══════════════════════════════════════════════════════════ */}
                  <AnimatePresence mode="wait">
                    {/* ── POPOVER A (BEAT 1): COMMITMENT STATUS POPOVER ── */}
                    {beat === 1 && (
                      <motion.div
                        key="popover-commitment"
                        initial={{ opacity: 0, y: -12, scale: 0.88 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.88 }}
                        transition={{
                          type: "spring",
                          stiffness: 140,
                          damping: 18,
                        }}
                        className="absolute right-[58px] sm:right-[102px] top-[68px] sm:top-[104px] z-40 rounded-[32px] sm:rounded-[36px] bg-[#0B0B0D]/95 border border-white/15 p-2.5 sm:p-3 shadow-[0_30px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col items-center gap-2.5 sm:gap-3"
                      >
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ delay: 0.25, duration: 0.5 }}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#E04F4F] ring-[3px] ring-white flex items-center justify-center shadow-[0_0_25px_rgba(224,79,79,0.75)]"
                        >
                          <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white" />
                        </motion.div>

                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#F2B718] flex items-center justify-center shadow-md">
                          <Star className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white" />
                        </div>

                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#787880] flex items-center justify-center shadow-md">
                          <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border-[3px] border-white" />
                        </div>
                      </motion.div>
                    )}

                    {/* ── POPOVER B (BEAT 2): CARD LIFECYCLE STATUS POPOVER ── */}
                    {beat === 2 && (
                      <motion.div
                        key="popover-card-status"
                        initial={{ opacity: 0, y: -12, scale: 0.88 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.88 }}
                        transition={{
                          type: "spring",
                          stiffness: 140,
                          damping: 18,
                        }}
                        className="absolute right-[12px] sm:right-[28px] top-[68px] sm:top-[104px] z-40 rounded-[32px] sm:rounded-[36px] bg-[#0B0B0D]/95 border border-white/15 p-2.5 sm:p-3 shadow-[0_30px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col items-center gap-2.5 sm:gap-3"
                      >
                        <motion.div
                          initial={{ scale: 0.8 }}
                          animate={{ scale: [1, 1.08, 1] }}
                          transition={{ delay: 0.25, duration: 0.5 }}
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-[#F2C72C] ring-[3px] ring-white flex items-center justify-center shadow-[0_0_28px_rgba(242,199,44,0.85)]"
                        >
                          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-[4.5px] sm:border-[5.5px] border-white" />
                        </motion.div>

                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#43B752] flex items-center justify-center shadow-md">
                          <Check className="w-5 h-5 sm:w-7 sm:h-7 text-white stroke-[3]" />
                        </div>

                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#E04F4F] flex items-center justify-center shadow-md">
                          <Pause className="w-5 h-5 sm:w-7 sm:h-7 text-white fill-white" />
                        </div>

                        <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-[#FF6900] flex items-center justify-center shadow-md">
                          <Archive className="w-5 h-5 sm:w-7 sm:h-7 text-white stroke-[2.2]" />
                        </div>
                      </motion.div>
                    )}

                    {/* ── POPOVER C (BEAT 3): LIFE AREA SELECTOR ── */}
                    {beat === 3 && (
                      <motion.div
                        key="popover-area"
                        initial={{ opacity: 0, y: -14, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.92 }}
                        transition={{
                          type: "spring",
                          stiffness: 130,
                          damping: 18,
                        }}
                        className="absolute left-1/2 -translate-x-1/2 sm:left-8 sm:translate-x-0 top-[130px] sm:top-[196px] z-40 w-[calc(100%-24px)] max-w-[330px] sm:w-[370px] sm:max-w-none rounded-[26px] sm:rounded-[30px] bg-[#0B0B0D]/95 border border-white/15 p-2.5 sm:p-3 shadow-[0_35px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col gap-1.5 sm:gap-2"
                      >
                        {AREA_OPTIONS.map((area, idx) => {
                          const Icon = area.icon;
                          return (
                            <motion.div
                              key={area.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                scale: area.selected ? [1, 1.03, 1] : 1,
                              }}
                              transition={{
                                delay: idx * 0.04,
                                scale: { delay: 0.45, duration: 0.5 },
                              }}
                              style={{ backgroundColor: area.bg }}
                              className={`w-full rounded-[15px] sm:rounded-[18px] px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-between shadow-md ${
                                area.selected
                                  ? "ring-2 ring-white shadow-[0_0_25px_rgba(255,105,0,0.65)]"
                                  : "opacity-90"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3">
                                <div
                                  style={{ backgroundColor: area.iconBg }}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] sm:rounded-[12px] flex items-center justify-center text-white shrink-0"
                                >
                                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                                </div>
                                <div className="text-left leading-tight">
                                  <div className="text-xs sm:text-base font-bold text-white">
                                    {area.name}
                                  </div>
                                  <div className="text-[10px] sm:text-[11px] text-white/80 font-medium">
                                    {area.sub}
                                  </div>
                                </div>
                              </div>

                              {area.selected && (
                                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[3]" />
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* ── POPOVER D (BEAT 4): PRODUCTIVITY HABIT SELECTOR + AI AUTO-MATCH ── */}
                    {beat === 4 && (
                      <motion.div
                        key="popover-habit"
                        initial={{ opacity: 0, y: -14, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.92 }}
                        transition={{
                          type: "spring",
                          stiffness: 130,
                          damping: 18,
                        }}
                        className="absolute left-1/2 -translate-x-1/2 top-[130px] sm:top-[196px] z-40 w-[calc(100%-24px)] max-w-[340px] sm:w-[390px] sm:max-w-none rounded-[26px] sm:rounded-[30px] bg-[#0B0B0D]/95 border border-white/15 p-2.5 sm:p-3 shadow-[0_35px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col gap-1.5 sm:gap-2"
                      >
                        {HABIT_OPTIONS.map((habit, idx) => {
                          const Icon = habit.icon;
                          return (
                            <motion.div
                              key={habit.id}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{
                                opacity: 1,
                                x: 0,
                                scale: habit.isAiMatch ? [1, 1.03, 1] : 1,
                              }}
                              transition={{
                                delay: idx * 0.04,
                                scale: { delay: 0.4, duration: 0.55 },
                              }}
                              style={{ backgroundColor: habit.bg }}
                              className={`w-full rounded-[15px] sm:rounded-[18px] px-3 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-between shadow-md ${
                                habit.isAiMatch
                                  ? "ring-2 ring-[#FF6900] shadow-[0_0_25px_rgba(255,105,0,0.45)]"
                                  : "opacity-95"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                <div
                                  style={{ backgroundColor: habit.iconBg }}
                                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-[10px] sm:rounded-[12px] flex items-center justify-center text-white shrink-0"
                                >
                                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                                </div>
                                <div className="text-left leading-tight min-w-0">
                                  <div className="text-xs sm:text-base font-bold text-white truncate">
                                    {habit.name}
                                  </div>
                                  <div className="text-[10px] sm:text-[11px] text-white/80 font-medium truncate">
                                    {habit.sub}
                                  </div>
                                </div>
                              </div>

                              {habit.isAiMatch && (
                                <span className="px-2 py-0.5 rounded-full bg-[#FF6900]/20 border border-[#FF6900]/50 text-[#FF6900] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0 ml-1">
                                  AI Match
                                </span>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}

                    {/* ── POPOVER E (BEAT 5): OCTOBER 2026 MONTHLY CALENDAR DEADLINE ── */}
                    {beat === 5 && (
                      <motion.div
                        key="popover-calendar"
                        initial={{ opacity: 0, y: -14, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.92 }}
                        transition={{
                          type: "spring",
                          stiffness: 130,
                          damping: 18,
                        }}
                        className="absolute left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 top-[130px] sm:top-[196px] z-40 w-[calc(100%-24px)] max-w-[330px] sm:w-[360px] sm:max-w-none rounded-[26px] sm:rounded-[30px] bg-[#0B0B0D]/95 border border-white/15 p-4 sm:p-5 shadow-[0_35px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col gap-2.5 sm:gap-3.5"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-sm sm:text-lg font-bold text-white">
                            <span>October 2026</span>
                            <ChevronRight className="w-4 h-4 text-[#FF6900] stroke-[2.5]" />
                          </div>
                          <div className="flex items-center gap-3 text-[#FF6900]">
                            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                          </div>
                        </div>

                        <div className="grid grid-cols-7 text-center text-[9px] sm:text-[10px] font-bold tracking-wider text-[#8E8E93] uppercase">
                          <span>SUN</span>
                          <span>MON</span>
                          <span>TUE</span>
                          <span>WED</span>
                          <span>THU</span>
                          <span>FRI</span>
                          <span>SAT</span>
                        </div>

                        <div className="grid grid-cols-7 gap-y-1 sm:gap-y-1.5 text-center items-center">
                          {OCTOBER_2026_CELLS.map((day, i) => {
                            if (day === null) {
                              return <div key={`empty-${i}`} className="h-7 sm:h-8" />;
                            }
                            const isToday19 = day === 19;
                            const isTarget30 = day === 30;

                            return (
                              <div
                                key={day}
                                className="flex items-center justify-center h-7 sm:h-8"
                              >
                                <motion.div
                                  animate={
                                    isTarget30
                                      ? { scale: [0.8, 1.18, 1] }
                                      : { scale: 1 }
                                  }
                                  transition={{
                                    delay: isTarget30 ? 0.35 : 0,
                                    duration: 0.45,
                                  }}
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-medium ${
                                    isTarget30
                                      ? "bg-white text-black font-bold shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                                      : isToday19
                                      ? "bg-[#2C1808] text-[#FF6900] font-semibold"
                                      : "text-white"
                                  }`}
                                >
                                  {day}
                                </motion.div>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs sm:text-sm font-semibold">
                          <span className="text-[#FF3B30]">Clear</span>
                          <span className="text-[#FF6900] font-bold">Done</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                SCENE 2 (BEAT 7): THE AI REVERSE-ENGINEER TRIGGER BUTTON SOLO
               ───────────────────────────────────────────────────────────── */}
            {beat === 7 && (
              <motion.div
                key="scene-ai-button"
                initial={{ opacity: 0, scale: 0.5, filter: "blur(20px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, scale: 2.1, filter: "blur(24px)" }}
                transition={{
                  type: "spring",
                  stiffness: 110,
                  damping: 15,
                }}
                className="relative flex flex-col items-center justify-center"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: [0.8, 2.2], opacity: [0.8, 0] }}
                  transition={{
                    duration: 1.4,
                    delay: 0.55,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute w-48 h-32 sm:w-64 sm:h-44 rounded-[44px] border-2 border-[#FF6900]"
                />
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: [0.8, 2.8], opacity: [0.5, 0] }}
                  transition={{
                    duration: 1.4,
                    delay: 0.75,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="absolute w-48 h-32 sm:w-64 sm:h-44 rounded-[44px] border border-[#FF6900]/60"
                />

                <motion.div
                  animate={{
                    scale: [1, 1.08, 0.86, 1.06, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    times: [0, 0.25, 0.45, 0.7, 1],
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="w-48 h-32 sm:w-64 sm:h-44 rounded-[42px] sm:rounded-[52px] bg-white border-[5px] border-[#141414] shadow-[0_0_90px_rgba(255,105,0,0.6),0_25px_60px_rgba(0,0,0,0.9)] flex items-center justify-center relative z-10"
                >
                  <motion.div
                    animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.18, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <FourPointStar className="w-20 h-20 sm:w-28 sm:h-28" />
                  </motion.div>
                </motion.div>
              </motion.div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                SCENE 3 (BEATS 8, 9, 10, 11): THE AI TASK BREAKDOWN CARD
                + TASK PRIORITY LEVEL POPOVER ("High ✓", "Mid", "Low") ON BEAT 9
               ───────────────────────────────────────────────────────────── */}
            {beat >= 8 && beat <= 11 && (
              <motion.div
                key="scene-breakdown-list"
                initial={{ opacity: 0, scale: 0.85, filter: "blur(18px)" }}
                animate={{
                  opacity: 1,
                  filter: "blur(0px)",
                  ...getBreakdownCamera(beat),
                }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(16px)" }}
                transition={{
                  type: "spring",
                  stiffness: 90,
                  damping: 19,
                  mass: 0.85,
                }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative w-full max-w-[680px]"
              >
                <div className="w-full rounded-[36px] bg-[#1C1C1E] border border-white/10 shadow-[0_35px_100px_rgba(0,0,0,0.95)] overflow-visible divide-y divide-white/[0.08] relative">
                  {BREAKDOWN_TASKS.map((task, idx) => {
                    const activeTaskIndex = beat - 8;
                    const isFocused = idx === activeTaskIndex;

                    return (
                      <motion.div
                        key={task.id}
                        animate={{
                          opacity: isFocused ? 1 : 0.28,
                          backgroundColor: isFocused
                            ? "rgba(255, 105, 0, 0.06)"
                            : "rgba(28, 28, 30, 0)",
                        }}
                        transition={{ duration: 0.35 }}
                        className="p-6 sm:p-7 flex flex-col gap-4 relative"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-lg sm:text-2xl font-medium text-white tracking-tight">
                            {task.title}
                          </span>

                          <div
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full border-[2.5px] border-[#FF6900] shrink-0 transition-transform duration-300 ${
                              isFocused
                                ? "scale-110 shadow-[0_0_15px_rgba(255,105,0,0.5)]"
                                : ""
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between relative">
                          <div className="flex items-center gap-10 sm:gap-20">
                            {task.dateType === "today" ? (
                              <div className="px-4 py-1.5 rounded-[13px] bg-[#FF6900] text-white text-sm sm:text-base font-semibold flex items-center gap-2 shadow-md">
                                <Calendar className="w-4 h-4 stroke-[2.3]" />
                                <span>{task.dateLabel}</span>
                              </div>
                            ) : (
                              <div className="px-4 py-1.5 rounded-[13px] bg-black/60 border-[1.5px] border-[#FF6900] text-white text-sm sm:text-base font-semibold flex items-center gap-2">
                                <Flag className="w-4 h-4 text-white stroke-[2]" />
                                <span>{task.dateLabel}</span>
                              </div>
                            )}

                            {/* Priority Badge + Anchored Priority Level Popover on Task 2 (Beat 9) */}
                            <div className="relative">
                              {task.priority === "Mid" ? (
                                <div className="px-4 py-1.5 rounded-[13px] bg-[#E5B822] text-white text-sm sm:text-base font-semibold">
                                  Mid
                                </div>
                              ) : (
                                <motion.div
                                  animate={{
                                    scale:
                                      beat === 9 && idx === 1
                                        ? [1, 0.92, 1.08, 1]
                                        : 1,
                                  }}
                                  className={`px-4 py-1.5 rounded-[13px] bg-[#E05252] text-white text-sm sm:text-base font-semibold ${
                                    beat === 9 && idx === 1
                                      ? "ring-2 ring-white shadow-[0_0_24px_rgba(224,82,82,0.8)]"
                                      : ""
                                  }`}
                                >
                                  High
                                </motion.div>
                              )}

                              {/* ── TASK PRIORITY LEVEL POPOVER ── */}
                              <AnimatePresence>
                                {beat === 9 && idx === 1 && (
                                  <motion.div
                                    key="popover-priority-level"
                                    initial={{
                                      opacity: 0,
                                      y: -10,
                                      scale: 0.88,
                                    }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -8, scale: 0.88 }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 140,
                                      damping: 18,
                                    }}
                                    className="absolute left-1/2 -translate-x-1/2 top-11 z-50 w-[190px] sm:w-[210px] rounded-[26px] bg-[#0B0B0D]/95 border border-white/15 p-3 shadow-[0_30px_80px_rgba(0,0,0,0.95)] backdrop-blur-2xl flex flex-col gap-2.5"
                                  >
                                    <motion.div
                                      initial={{ scale: 0.92 }}
                                      animate={{ scale: [1, 1.04, 1] }}
                                      transition={{
                                        delay: 0.25,
                                        duration: 0.45,
                                      }}
                                      className="w-full py-2.5 rounded-[14px] bg-[#E05252] ring-2 ring-white text-white font-bold text-base flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(224,82,82,0.65)]"
                                    >
                                      <span>High</span>
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    </motion.div>

                                    <div className="w-full py-2.5 rounded-[14px] bg-[#E5B822] text-white font-bold text-base flex items-center justify-center shadow-md">
                                      Mid
                                    </div>

                                    <div className="w-full py-2.5 rounded-[14px] bg-[#2D7FF9] text-white font-bold text-base flex items-center justify-center shadow-md">
                                      Low
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>

                          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6900] stroke-[2.5]" />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ─────────────────────────────────────────────────────────────
                SCENE 4 (BEAT 12): UNIFIED MICRO-TASKS + LIVE PROGRESS BAR
                (Exact Screenshot 1 style: "Unit 2 descriptive statistics" task card
                 + granular Micro-Tasks list where checking off each micro-task
                 live-fills the orange progress bar from 0% to 100%)
               ───────────────────────────────────────────────────────────── */}
            {beat === 12 && (
              <motion.div
                key="scene-micro-tasks-live-progress"
                initial={{ opacity: 0, scale: 0.86, filter: "blur(18px)" }}
                animate={{
                  opacity: 1,
                  scale: 0.94,
                  y: -10,
                  filter: "blur(0px)",
                }}
                exit={{ opacity: 0, scale: 1.08, filter: "blur(18px)" }}
                transition={{
                  type: "spring",
                  stiffness: 90,
                  damping: 18,
                }}
                className="w-full max-w-[660px] flex flex-col gap-3.5"
              >
                {/* Top Task Header Card ("Unit 2 descriptive statistics") */}
                <div className="w-full rounded-[32px] bg-[#1C1C1E] border border-white/10 p-5 sm:p-6 shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl sm:text-4xl font-bold text-white leading-[1.08] tracking-tight max-w-md">
                      Unit 2 descriptive statistics
                    </h3>

                    <div className="flex items-center gap-2.5 shrink-0">
                      {/* High Priority Pill */}
                      <div className="px-4 py-1.5 rounded-[16px] bg-[#E05252] text-white font-bold text-sm sm:text-base shadow-[0_0_20px_rgba(224,82,82,0.5)]">
                        High
                      </div>
                      {/* Green Check Circle */}
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#43B752] shadow-[0_0_20px_rgba(67,183,82,0.5)] flex items-center justify-center">
                        <Check className="w-5 h-5 text-white stroke-[3]" />
                      </div>
                    </div>
                  </div>

                  {/* 3 Orange Pills: Second..., Statistics, Sep 16 */}
                  <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-4">
                    <div className="px-4 py-1.5 rounded-[14px] bg-[#FF6900] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                      <Repeat2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Second...</span>
                    </div>
                    <div className="px-4 py-1.5 rounded-[14px] bg-[#FF6900] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                      <Repeat2 className="w-4 h-4 stroke-[2.5]" />
                      <span>Statistics</span>
                    </div>
                    <div className="px-4 py-1.5 rounded-[14px] bg-[#FF6900] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                      <Flag className="w-4 h-4 stroke-[2.2]" />
                      <span>Sep 16</span>
                    </div>
                  </div>

                  {/* Next Micro-task Preview + 0 Notes, 0 Resources, Live 0/10 -> 10/10, 0% -> 100% */}
                  <div className="flex items-center justify-between gap-2 mt-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF6900] shrink-0" />
                      <span className="text-xs sm:text-sm font-medium text-white truncate">
                        {completedMicroTasks >= 5
                          ? "All micro-tasks completed"
                          : "Collect raw data from U..."}
                      </span>
                    </div>

                    <div className="flex items-center gap-3.5 shrink-0">
                      <span className="text-xs sm:text-sm text-[#8E8E93] flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> 0
                      </span>
                      <span className="text-xs sm:text-sm text-[#8E8E93] flex items-center gap-1">
                        <Paperclip className="w-3.5 h-3.5" /> 0
                      </span>
                      <span className="text-xs sm:text-sm text-[#8E8E93] flex items-center gap-1 font-semibold">
                        <ListChecks className="w-3.5 h-3.5" /> {microTaskRatio}
                      </span>
                      <span className="text-xl sm:text-3xl font-bold text-[#FF6900] min-w-[60px] text-right">
                        {microTaskPercent}%
                      </span>
                    </div>
                  </div>

                  {/* Live Animated Progress Bar (0% -> 100%) */}
                  <div className="w-full h-2.5 rounded-full bg-white/10 mt-3 overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: `${microTaskPercent}%` }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="h-full rounded-full bg-[#FF6900] shadow-[0_0_18px_#FF6900]"
                    />
                  </div>
                </div>

                {/* Bottom Card: The Granular Micro-Tasks List Checking Off Live */}
                <div className="w-full rounded-[32px] bg-[#1C1C1E] border border-white/10 divide-y divide-white/[0.08] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
                  {MICRO_TASKS_LIST.map((mTask, i) => {
                    const isChecked = completedMicroTasks > i;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="px-6 py-3 sm:py-3.5 flex items-center justify-between gap-4"
                      >
                        <span
                          className={`text-xs sm:text-sm font-normal leading-snug transition-all duration-300 ${
                            isChecked
                              ? "text-white/35 line-through"
                              : "text-white/95"
                          }`}
                        >
                          {mTask}
                        </span>
                        <div
                          className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[2.2px] border-[#FF6900] flex items-center justify-center shrink-0 transition-all duration-300 ${
                            isChecked
                              ? "bg-[#FF6900] shadow-[0_0_14px_rgba(255,105,0,0.65)]"
                              : "bg-transparent"
                          }`}
                        >
                          {isChecked && (
                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black stroke-[3]" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* ═══════════════════════════════════════════════════════════════════
              BOTTOM SUBTITLE — TYPEWRITER TEXT WHILE CARD IS SHOWING
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="relative z-30 w-full flex justify-center pt-3 pb-1 min-h-[36px] items-center pointer-events-none">
            <p className="text-xs sm:text-base md:text-lg text-white/90 font-medium tracking-wide text-center max-w-2xl leading-snug">
              {typedSubtitle}
              <span className="inline-block w-[2px] h-[1em] bg-[#FF6900] ml-1 align-middle animate-pulse" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
