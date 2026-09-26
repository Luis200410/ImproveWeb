"use client";

import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Zap, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  Brain, 
  Clock,
  Target,
  Flame,
  Award
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function useGSAP(
  callback: () => void | (() => void),
  options?: {
    dependencies?: unknown[];
    scope?: { current: Element | null } | Element | null;
  }
) {
  const deps = options?.dependencies ?? [];
  const scope = options?.scope;
  const ctxRef = useRef<gsap.Context | null>(null);
  const cleanupRef = useRef<(() => void) | undefined>(undefined);

  useLayoutEffect(() => {
    const el =
      scope && typeof scope === "object" && "current" in scope
        ? scope.current
        : (scope as Element | null);
    ctxRef.current = gsap.context(() => {}, el ?? undefined);
    return () => {
      cleanupRef.current?.();
      cleanupRef.current = undefined;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    if (!ctxRef.current) return;
    cleanupRef.current?.();
    const ret = ctxRef.current.add(callback);
    cleanupRef.current = typeof ret === "function" ? ret : undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
  mediaQueryList.addEventListener("change", callback);
  return () => mediaQueryList.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.(REDUCED_MOTION_QUERY)?.matches ?? false;
}

function getServerReducedMotionSnapshot() {
  return false;
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getServerReducedMotionSnapshot
  );
}

export interface BehaviorStage {
  id: string;
  stageNumber: string;
  title: string;
  subtitle: string;
  kicker: string;
  description: string;
  accentColor: string;
  floatingBubbles: string[];
  appMockup: {
    suiteBadge: string;
    icon: typeof Brain;
    cardTitle: string;
    metrics: { label: string; value: string; badge?: string }[];
    quote: string;
  };
}

const BEHAVIOR_STAGES: BehaviorStage[] = [
  {
    id: "identity",
    stageNumber: "STAGE 01",
    title: "Identity",
    subtitle: "WHO YOU ARE • WHAT YOU BELIEVE",
    kicker: "THE CORE ENGINE",
    description:
      "True behavior change is identity change. When your self-image aligns with your standard, action requires zero forced willpower. You simply act in accordance with who you believe you are.",
    accentColor: "#FF02E8",
    floatingBubbles: [
      "I am an athlete",
      "I am a morning bird",
      "I am a reader",
      "I am a non-smoker",
      "I am focused & intentional",
    ],
    appMockup: {
      suiteBadge: "SECOND BRAIN • IDENTITY MATRIX",
      icon: Brain,
      cardTitle: "Core Identity Blueprint",
      metrics: [
        { label: "Standard", value: "Relentless Focus", badge: "Active" },
        { label: "Annual 4 Bigs", value: "3 of 4 Locked", badge: "Locked" },
        { label: "Belief Alignment", value: "100%", badge: "Optimal" },
      ],
      quote: "Every action is a vote for the type of person you wish to become.",
    },
  },
  {
    id: "process",
    stageNumber: "STAGE 02",
    title: "Process",
    subtitle: "WHAT YOU DO • DAILY REPEATABLE SYSTEMS",
    kicker: "THE EXECUTION BRIDGE",
    description:
      "You do not rise to the level of your goals. You fall to the level of your systems. Improve turns identity into daily Apple Calendar timeline blocks, hardware app shields, and 90-minute ultradian energy waves.",
    accentColor: "#FF9F0A",
    floatingBubbles: [
      "Workout for 20 mins/day",
      "Read 30 mins/day",
      "Screen-Time Shield Active",
      "Not use phone before bed",
      "90-Min Focus Wave",
      "Go to bed early",
    ],
    appMockup: {
      suiteBadge: "EXECUTION SUITE • EVENTKIT SYNC",
      icon: Zap,
      cardTitle: "Daily Execution Timeline",
      metrics: [
        { label: "08:00 AM", value: "Deep Code Sprint • Shield ON", badge: "Focus" },
        { label: "10:30 AM", value: "Ultradian Energy Break", badge: "Wave" },
        { label: "02:00 PM", value: "High-Leverage Execution", badge: "Sync" },
      ],
      quote: "Habits dropped straight into Apple Calendar as real blocks of time.",
    },
  },
  {
    id: "outcome",
    stageNumber: "STAGE 03",
    title: "Outcome",
    subtitle: "WHAT YOU GET • CHANGE FROM THE INSIDE OUT",
    kicker: "THE INEVITABLE BYPRODUCT",
    description:
      "Outcomes are never the starting point. They are the compounding byproduct of your identity and your process. Master the core, and the scoreboard takes care of itself.",
    accentColor: "#30D158",
    floatingBubbles: [
      "Lose weight & get in shape",
      "Get up early naturally",
      "94% Habit Consistency",
      "Zero Willpower Fatigue",
      "45-Day Deep Work Streak",
      "Financial Runway Protected",
    ],
    appMockup: {
      suiteBadge: "PRIVATE TELEMETRY • VERIFIED METRICS",
      icon: Award,
      cardTitle: "Compounding Scoreboard",
      metrics: [
        { label: "Consistency Score", value: "94% Rolling 30D", badge: "+12%" },
        { label: "Runway Protected", value: "14 Months Zero Risk", badge: "Safe" },
        { label: "Screen-Time Cut", value: "-2.4 hrs / Day", badge: "Saved" },
      ],
      quote: "Change happens from the inside out — permanent, effortless, and automated.",
    },
  },
];

export type TimelineProps = {
  sectionTitle?: string;
  title?: string;
  periodLabel?: string;
  textColor?: string;
  mutedTextColor?: string;
  activeColor?: string;
  backgroundColor?: string;
};

export default function Timeline({
  sectionTitle = "Block The Noise",
  title = "BEHAVIORAL ARCHITECTURE",
  periodLabel = "CHANGE FROM THE INSIDE OUT",
  activeColor = "#FF02E8",
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const wholeSliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(() => {
    const section = sectionRef.current;
    const slider = wholeSliderRef.current;

    if (!section || !slider) return;

    const isMobile = window.innerWidth < 768;
    const lineWidth = isMobile ? "92%" : "98%";

    const getScrollDistance = () => {
      const dist = slider.scrollWidth - window.innerWidth;
      return dist > 0 ? dist + (isMobile ? 120 : 200) : 1800;
    };

    const pinDuration = Math.max(2800, getScrollDistance() + 1000);

    if (reducedMotion) {
      gsap.set(".journey-line", { width: lineWidth });
      BEHAVIOR_STAGES.forEach((stage) => {
        gsap.set(`.stage-${stage.id}`, { opacity: 1, y: 0 });
        gsap.set(`.jd-${stage.id}`, { scale: 1 });
        gsap.set(`.jl-${stage.id}`, { scaleY: 1 });
      });
      return;
    }

    // Initialize item states
    BEHAVIOR_STAGES.forEach((stage) => {
      gsap.set(`.stage-${stage.id}`, { opacity: 0, y: 35 });
      gsap.set(`.jd-${stage.id}`, { scale: 0 });
      gsap.set(`.jl-${stage.id}`, { scaleY: 0, transformOrigin: "top top" });
      gsap.set(`.bubble-${stage.id}`, { opacity: 0, scale: 0.8 });
    });
    gsap.set(".terminal-arrow", { opacity: 0, x: -20 });

    const masterTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        start: "top top",
        end: `+=${pinDuration}`,
        scrub: 1.1,
        invalidateOnRefresh: true,
      },
      defaults: { ease: "none" },
    });

    // 1. Horizontal track movement
    masterTl.to(
      slider,
      {
        x: () => -getScrollDistance(),
        duration: 0.85,
        ease: "none",
      },
      0
    );

    // 2. Continuous horizontal progress line
    masterTl.to(
      ".journey-line",
      {
        width: lineWidth,
        duration: 0.85,
        ease: "none",
      },
      0
    );

    // 3. Staggered reveals of the 3 stages
    const total = BEHAVIOR_STAGES.length;
    BEHAVIOR_STAGES.forEach((stage, index) => {
      const progress = (index / total) * 0.72 + 0.04;

      // Connecting vertical node & line
      masterTl.to(
        `.jd-${stage.id}`,
        { scale: 1, duration: 0.08, ease: "back.out(1.8)" },
        progress
      );
      masterTl.to(
        `.jl-${stage.id}`,
        { scaleY: 1, duration: 0.1, ease: "power2.out" },
        progress + 0.02
      );

      // Stage card & typography
      masterTl.to(
        `.stage-${stage.id}`,
        { opacity: 1, y: 0, duration: 0.14, ease: "power2.out" },
        progress + 0.04
      );

      // Floating belief bubbles
      masterTl.to(
        `.bubble-${stage.id}`,
        { opacity: 1, scale: 1, duration: 0.12, stagger: 0.02, ease: "back.out(1.5)" },
        progress + 0.06
      );
    });

    // 4. Reveal terminal arrow at the end
    masterTl.to(
      ".terminal-arrow",
      { opacity: 1, x: 0, duration: 0.12, ease: "power2.out" },
      0.82
    );

    // 5. Final pause at end for reading
    masterTl.to({}, { duration: 0.15 });

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, { dependencies: [reducedMotion], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="behavioral-architecture"
      className="w-full h-screen relative overflow-hidden bg-[#050308] text-white border-t border-zinc-900"
    >
      {/* Top Header Section */}
      <div className="absolute top-16 sm:top-20 md:top-24 left-0 right-0 z-20 text-center pointer-events-none px-4 sm:px-8 space-y-2">
        <span className="inline-block kicker text-xs sm:text-sm font-bold text-[#FF02E8] tracking-widest uppercase">
          {sectionTitle}
        </span>
        <h2 className="title-huge text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.90] max-w-5xl mx-auto">
          {title}
        </h2>
        <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-zinc-400">
          {periodLabel}
        </p>
      </div>

      {/* Background Concentric Glow Rings representing Inside-Out Transformation */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-25">
        <div className="absolute w-[350px] h-[350px] rounded-full border border-[#FF02E8]/40 animate-pulse" />
        <div className="absolute w-[700px] h-[700px] rounded-full border border-[#FF9F0A]/30" />
        <div className="absolute w-[1100px] h-[1100px] rounded-full border border-[#30D158]/20" />
        <div className="absolute w-[600px] h-[600px] rounded-full bg-[#FF02E8]/10 blur-[140px]" />
      </div>

      {/* Horizontal GSAP Slider Container */}
      <div className="h-screen w-full flex items-center overflow-hidden relative pt-40 sm:pt-48 md:pt-52">
        <div
          ref={wholeSliderRef}
          className="flex h-[72vh] max-h-[680px] w-[310vw] max-[768px]:w-[800vw] items-center px-[6vw] will-change-transform relative"
        >
          {/* Continuous Central Horizontal Axis Line */}
          <div className="absolute left-[6vw] right-[6vw] top-[48%] -translate-y-1/2 flex items-center pointer-events-none z-10">
            {/* Start Node */}
            <div className="relative size-3.5 sm:size-4 rounded-full bg-[#FF02E8] shadow-[0_0_15px_#FF02E8] shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#FF02E8] animate-ping opacity-75" />
            </div>

            {/* Expanding Horizontal Line */}
            <div
              className="h-[2px] w-[0%] journey-line shrink-0"
              style={{
                backgroundColor: activeColor,
                boxShadow: `0 0 16px ${activeColor}, 0 0 4px ${activeColor}`,
              }}
            />

            {/* Terminal Arrow: "CHANGE FROM THE INSIDE OUT" */}
            <div className="terminal-arrow flex items-center gap-3 shrink-0 pl-4 opacity-0">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#30D158]/15 border border-[#30D158]/40 shadow-[0_0_20px_rgba(48,209,88,0.4)]">
                <span className="w-2 h-2 rounded-full bg-[#30D158] shadow-[0_0_8px_#30D158] animate-pulse" />
                <span className="font-heading font-extrabold text-xs sm:text-sm tracking-wider uppercase text-white">
                  CHANGE FROM THE INSIDE OUT
                </span>
                <ArrowRight className="w-4 h-4 text-[#30D158]" />
              </div>
            </div>
          </div>

          {/* 3 Staggered Stages along the Axis */}
          <div className="flex h-full w-full items-center gap-[18vw] max-[768px]:gap-[40vw] pl-[4vw]">
            {BEHAVIOR_STAGES.map((stage) => {
              const IconComp = stage.appMockup.icon;

              return (
                <div
                  key={stage.id}
                  className={`stage-${stage.id} relative flex flex-col justify-between w-[64vw] max-w-[780px] min-w-[320px] max-[768px]:w-[80vw] h-[64vh] max-h-[580px] p-6 sm:p-8 rounded-3xl bg-neutral-950/85 backdrop-blur-2xl border border-zinc-800 shadow-2xl transition-all duration-300 hover:border-[#FF02E8]/50 group`}
                >
                  {/* Vertical Connection Line to Horizontal Axis */}
                  <div className="absolute left-8 top-[-36px] bottom-0 w-px pointer-events-none z-20">
                    <div
                      className={`size-3.5 -translate-x-1/2 rounded-full jd-${stage.id} shadow-lg`}
                      style={{
                        backgroundColor: stage.accentColor,
                        boxShadow: `0 0 12px ${stage.accentColor}`,
                      }}
                    />
                    <div
                      className={`w-[2px] h-[36px] -translate-x-1/2 jl-${stage.id}`}
                      style={{
                        backgroundColor: stage.accentColor,
                        boxShadow: `0 0 8px ${stage.accentColor}`,
                      }}
                    />
                  </div>

                  {/* Stage Top Bar: Stage Number + Kicker */}
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-3 py-1 rounded-full text-[11px] font-mono font-bold tracking-wider uppercase border"
                        style={{
                          color: stage.accentColor,
                          backgroundColor: `${stage.accentColor}15`,
                          borderColor: `${stage.accentColor}40`,
                        }}
                      >
                        {stage.stageNumber}
                      </span>
                      <span className="text-xs font-bold tracking-widest uppercase text-zinc-400">
                        {stage.kicker}
                      </span>
                    </div>

                    <span
                      className="text-xs font-mono font-bold tracking-wide uppercase px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-300"
                    >
                      {stage.appMockup.suiteBadge}
                    </span>
                  </div>

                  {/* Main Editorial Typography matching the diagram */}
                  <div className="space-y-2 z-10">
                    <h3 className="text-4xl sm:text-6xl md:text-7xl font-serif italic tracking-wide text-white leading-none">
                      {stage.title}
                    </h3>
                    <p className="font-heading font-black text-xs sm:text-sm md:text-base tracking-[0.18em] uppercase text-zinc-300">
                      {stage.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl">
                      {stage.description}
                    </p>
                  </div>

                  {/* Floating Belief & Habit Bubbles from Diagram */}
                  <div className="flex flex-wrap gap-2 z-10 py-1">
                    {stage.floatingBubbles.map((bubble, bIdx) => (
                      <span
                        key={bIdx}
                        className={`bubble-${stage.id} inline-flex items-center text-[10px] sm:text-xs font-rounded font-medium px-3 py-1 rounded-full bg-zinc-900/90 text-zinc-300 border border-zinc-700/80 shadow-sm transition-all duration-300 hover:scale-105 hover:text-white hover:border-[#FF02E8]`}
                      >
                        {bubble}
                      </span>
                    ))}
                  </div>

                  {/* Interactive App UI Preview Card */}
                  <div className="relative p-4 sm:p-5 rounded-2xl bg-black/60 border border-zinc-800/90 backdrop-blur-md z-10 space-y-3">
                    <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="size-7 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: `${stage.accentColor}25` }}
                        >
                          <IconComp className="size-4" style={{ color: stage.accentColor }} />
                        </div>
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                          {stage.appMockup.cardTitle}
                        </h4>
                      </div>

                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#30D158]">
                        <span className="size-1.5 rounded-full bg-[#30D158] animate-pulse" />
                        LIVE NATIVE
                      </span>
                    </div>

                    {/* App Telemetry Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {stage.appMockup.metrics.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 space-y-1"
                        >
                          <p className="text-[10px] font-mono uppercase text-zinc-400 truncate">
                            {m.label}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-white truncate">
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Footer Insight Quote */}
                    <div className="pt-1 flex items-center justify-between text-[11px] font-mono text-zinc-400">
                      <span className="italic truncate text-zinc-300">
                        "{stage.appMockup.quote}"
                      </span>
                    </div>
                  </div>

                  {/* Ambient Stage Corner Glow */}
                  <div
                    className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full blur-[80px] opacity-15 pointer-events-none"
                    style={{ backgroundColor: stage.accentColor }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
