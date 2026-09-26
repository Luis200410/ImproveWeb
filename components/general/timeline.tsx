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
  ArrowRight, 
  Brain, 
  Zap, 
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Calendar,
  Lock
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

interface DiagramStage {
  id: string;
  italicTitle: string; // "Identity", "Process", "Outcome"
  blockTitle: string;  // "IDENTITY", "PROCESS", "OUTCOME"
  subtitle: string;    // "WHO YOU ARE / WHAT YOU BELIEVE", "WHAT YOU DO", "WHAT YOU GET"
  accentColor: string;
  circleRadius: string;
  circleStyle: string;
  floatingPills: { text: string; top?: string; bottom?: string; left?: string; right?: string }[];
  appCard: {
    badge: string;
    icon: typeof Brain;
    title: string;
    items: { label: string; value: string; badge?: string }[];
    caption: string;
  };
}

const DIAGRAM_STAGES: DiagramStage[] = [
  {
    id: "identity",
    italicTitle: "Identity",
    blockTitle: "IDENTITY",
    subtitle: "WHO YOU ARE / WHAT YOU BELIEVE",
    accentColor: "#FF02E8",
    circleRadius: "w-[48vw] h-[48vw] max-w-[620px] max-h-[620px]",
    circleStyle: "bg-gradient-to-r from-[#FF02E8]/20 via-[#FF02E8]/10 to-transparent border border-[#FF02E8]/40 shadow-[0_0_60px_rgba(255,2,232,0.15)]",
    floatingPills: [
      { text: "I am a morning bird", top: "12%", left: "18%" },
      { text: "I am a training athlete", top: "28%", right: "8%" },
      { text: "I am a non-smoker", bottom: "30%", right: "12%" },
      { text: "I am a reader", bottom: "16%", left: "22%" },
      { text: "I am focused & intentional", bottom: "4%", right: "24%" },
    ],
    appCard: {
      badge: "SECOND BRAIN SUITE",
      icon: Brain,
      title: "Core Identity Blueprint",
      items: [
        { label: "Self-Standard", value: "High-Output Builder", badge: "Active" },
        { label: "Annual Four Bigs", value: "3 of 4 Locked", badge: "Live" },
        { label: "Belief Alignment", value: "100% Solid", badge: "Optimal" },
      ],
      caption: "Every action is a vote for the person you believe you are.",
    },
  },
  {
    id: "process",
    italicTitle: "Process",
    blockTitle: "PROCESS",
    subtitle: "WHAT YOU DO",
    accentColor: "#FF9F0A",
    circleRadius: "w-[68vw] h-[68vw] max-w-[900px] max-h-[900px]",
    circleStyle: "bg-gradient-to-r from-[#FF9F0A]/12 via-[#FF9F0A]/5 to-transparent border border-[#FF9F0A]/30 shadow-[0_0_70px_rgba(255,159,10,0.12)]",
    floatingPills: [
      { text: "Go to bed early", top: "8%", left: "12%" },
      { text: "Bring bags when shopping", top: "18%", left: "28%" },
      { text: "Workout for 20 mins/day", top: "24%", right: "14%" },
      { text: "Eat gums", bottom: "34%", left: "32%" },
      { text: "Read 30 mins/day", bottom: "20%", left: "28%" },
      { text: "Not use phone before bed", bottom: "10%", left: "10%" },
      { text: "Reduce screen time", bottom: "3%", left: "24%" },
      { text: "Read more", bottom: "8%", right: "20%" },
    ],
    appCard: {
      badge: "EXECUTION ENGINE",
      icon: Zap,
      title: "Daily Habit Timeline Sync",
      items: [
        { label: "08:00 AM", value: "Deep Code Sprint • App Shield ON", badge: "Focus" },
        { label: "10:30 AM", value: "Ultradian Energy Break (90m)", badge: "Sync" },
        { label: "02:00 PM", value: "High-Leverage Execution", badge: "EventKit" },
      ],
      caption: "Habits dropped into Apple Calendar as locked time blocks.",
    },
  },
  {
    id: "outcome",
    italicTitle: "Outcome",
    blockTitle: "OUTCOME",
    subtitle: "WHAT YOU GET",
    accentColor: "#30D158",
    circleRadius: "w-[88vw] h-[88vw] max-w-[1200px] max-h-[1200px]",
    circleStyle: "bg-gradient-to-r from-[#30D158]/10 via-[#30D158]/4 to-transparent border border-[#30D158]/25 shadow-[0_0_80px_rgba(48,209,88,0.1)]",
    floatingPills: [
      { text: "Get up early", top: "6%", left: "16%" },
      { text: "Live greener", top: "14%", left: "38%" },
      { text: "Lose weight and get in shape", top: "24%", right: "22%" },
      { text: "Give up smoking", bottom: "28%", left: "34%" },
      { text: "Peak focus & zero burnout", bottom: "12%", right: "18%" },
    ],
    appCard: {
      badge: "PRIVATE TELEMETRY",
      icon: Award,
      title: "Compounding Scoreboard",
      items: [
        { label: "Consistency Score", value: "94% Rolling 30D", badge: "+14%" },
        { label: "Runway Protected", value: "14 Months Zero Risk", badge: "Secure" },
        { label: "Screen-Time Cut", value: "-2.4 hrs / Day Saved", badge: "Shielded" },
      ],
      caption: "Results occur as the inevitable byproduct of identity + process.",
    },
  },
];

export interface TimelineProps {
  sectionTitle?: string;
  title?: string;
  periodLabel?: string;
  activeColor?: string;
}

export default function Timeline({
  sectionTitle = "Block The Noise",
}: TimelineProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useGSAP(() => {
    const section = sectionRef.current;
    const slider = sliderRef.current;

    if (!section || !slider) return;

    const isMobile = window.innerWidth < 768;
    const lineWidth = isMobile ? "92%" : "98%";

    const getScrollDistance = () => {
      const dist = slider.scrollWidth - window.innerWidth;
      return dist > 0 ? dist + (isMobile ? 120 : 250) : 2200;
    };

    const pinDuration = Math.max(3000, getScrollDistance() + 1200);

    if (reducedMotion) {
      gsap.set(".timeline-axis-line", { width: lineWidth });
      DIAGRAM_STAGES.forEach((stage) => {
        gsap.set(`.stage-group-${stage.id}`, { opacity: 1 });
        gsap.set(`.stage-pill-${stage.id}`, { opacity: 1, scale: 1 });
      });
      gsap.set(".terminal-inside-out", { opacity: 1, x: 0 });
      return;
    }

    // Set initial states
    DIAGRAM_STAGES.forEach((stage) => {
      gsap.set(`.stage-group-${stage.id}`, { opacity: 0.2, scale: 0.94 });
      gsap.set(`.stage-pill-${stage.id}`, { opacity: 0, scale: 0.8 });
      gsap.set(`.circle-layer-${stage.id}`, { opacity: 0.3, scale: 0.92 });
    });
    gsap.set(".terminal-inside-out", { opacity: 0, x: -30 });

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

    // 2. Horizontal timeline axis expansion
    masterTl.to(
      ".timeline-axis-line",
      {
        width: lineWidth,
        duration: 0.85,
        ease: "none",
      },
      0
    );

    // 3. Staggered reveal of each stage, its concentric circle, and pills
    const total = DIAGRAM_STAGES.length;
    DIAGRAM_STAGES.forEach((stage, idx) => {
      const progress = (idx / total) * 0.7 + 0.05;

      // Circle illumination
      masterTl.to(
        `.circle-layer-${stage.id}`,
        {
          opacity: 1,
          scale: 1,
          duration: 0.12,
          ease: "power2.out",
        },
        progress
      );

      // Stage card & titles
      masterTl.to(
        `.stage-group-${stage.id}`,
        {
          opacity: 1,
          scale: 1,
          duration: 0.14,
          ease: "power2.out",
        },
        progress + 0.03
      );

      // Floating belief/habit pills
      masterTl.to(
        `.stage-pill-${stage.id}`,
        {
          opacity: 1,
          scale: 1,
          duration: 0.12,
          stagger: 0.02,
          ease: "back.out(1.5)",
        },
        progress + 0.05
      );
    });

    // 4. Terminal Arrow reveal
    masterTl.to(
      ".terminal-inside-out",
      {
        opacity: 1,
        x: 0,
        duration: 0.12,
        ease: "power2.out",
      },
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
      {/* Pinned Section Title: "Block The Noise" in exact massive headline size */}
      <div className="absolute top-16 sm:top-20 md:top-24 left-0 right-0 z-30 text-center pointer-events-none px-4 sm:px-8">
        <h2 className="title-huge text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.90] max-w-5xl mx-auto">
          {sectionTitle}
        </h2>
      </div>

      {/* GSAP Horizontal Track Container */}
      <div className="h-screen w-full flex items-center overflow-hidden relative pt-32 sm:pt-40 md:pt-44">
        <div
          ref={sliderRef}
          className="flex h-[75vh] max-h-[720px] w-[340vw] max-[768px]:w-[880vw] items-center px-[8vw] will-change-transform relative"
        >
          {/* ══════════ THE HORIZONTAL TIMELINE ARROW (FROM DIAGRAM) ══════════ */}
          <div className="absolute left-[8vw] right-[6vw] top-[46%] -translate-y-1/2 flex items-center pointer-events-none z-20">
            {/* Leftmost Black/Glowing Origin Dot */}
            <div className="relative size-4 sm:size-5 rounded-full bg-black border-2 border-white shadow-[0_0_15px_rgba(255,2,232,0.8)] shrink-0">
              <span className="absolute inset-0 rounded-full bg-[#FF02E8] animate-ping opacity-75" />
            </div>

            {/* Expanding Horizontal Black/Glowing Axis Line */}
            <div
              className="h-[3px] w-[0%] timeline-axis-line shrink-0"
              style={{
                backgroundColor: "#FFFFFF",
                boxShadow: "0 0 12px rgba(255,255,255,0.8), 0 0 24px rgba(255,2,232,0.5)",
              }}
            />

            {/* Terminal Arrowhead with label "CHANGE FROM THE INSIDE OUT" */}
            <div className="terminal-inside-out flex items-center gap-3 shrink-0 pl-4 opacity-0">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/25 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                <span className="font-heading font-black text-xs sm:text-sm tracking-widest uppercase text-white whitespace-nowrap">
                  CHANGE FROM THE INSIDE OUT
                </span>
                <ArrowRight className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* ══════════ THE 3 CONCENTRIC STAGES ACROSS THE TRACK ══════════ */}
          <div className="flex h-full w-full items-center gap-[16vw] max-[768px]:gap-[40vw] pl-[4vw]">
            {DIAGRAM_STAGES.map((stage) => {
              const IconComp = stage.appCard.icon;

              return (
                <div
                  key={stage.id}
                  className={`stage-group-${stage.id} relative flex flex-col justify-between w-[72vw] max-w-[880px] min-w-[340px] max-[768px]:w-[84vw] h-[68vh] max-h-[640px] p-6 sm:p-8 rounded-3xl bg-neutral-950/80 backdrop-blur-2xl border border-zinc-800/90 shadow-2xl transition-all duration-300 z-10 group`}
                >
                  {/* Concentric Circle Halo Layer from Diagram (Nested expanding spheres) */}
                  <div
                    className={`circle-layer-${stage.id} absolute -left-12 -top-12 ${stage.circleRadius} ${stage.circleStyle} rounded-full pointer-events-none -z-10`}
                  />

                  {/* Floating Belief / Process / Outcome Pills from Diagram */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    {stage.floatingPills.map((pill, pIdx) => (
                      <span
                        key={pIdx}
                        className={`stage-pill-${stage.id} absolute inline-flex items-center text-[10px] sm:text-xs font-rounded font-medium px-3 py-1 rounded-full bg-black/85 text-zinc-200 border border-zinc-700/80 shadow-md backdrop-blur-md transition-all duration-300 pointer-events-auto hover:scale-105 hover:border-white hover:text-white`}
                        style={{
                          top: pill.top,
                          bottom: pill.bottom,
                          left: pill.left,
                          right: pill.right,
                        }}
                      >
                        {pill.text}
                      </span>
                    ))}
                  </div>

                  {/* Top Header: Elegant Italic Script + Massive Block Title (MATCHING SECTION TITLE SIZE) */}
                  <div className="space-y-1 z-10">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-white/90">
                        {stage.italicTitle}
                      </span>
                      <span
                        className="text-[10px] font-mono font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full border"
                        style={{
                          color: stage.accentColor,
                          backgroundColor: `${stage.accentColor}15`,
                          borderColor: `${stage.accentColor}40`,
                        }}
                      >
                        {stage.id.toUpperCase()}
                      </span>
                    </div>

                    {/* Massive Block Title: exact same size as the section title */}
                    <h3 className="title-huge text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.90]">
                      {stage.blockTitle}
                    </h3>

                    {/* Subtitle from Diagram (e.g. WHO YOU ARE / WHAT YOU BELIEVE) */}
                    <p className="font-heading font-black text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase text-zinc-300 pt-1">
                      {stage.subtitle}
                    </p>
                  </div>

                  {/* Center Line Cross-Section Anchor Marker */}
                  <div className="relative py-2 flex items-center gap-3 z-10">
                    <div
                      className="size-3.5 rounded-full border-2 border-white"
                      style={{ backgroundColor: stage.accentColor }}
                    />
                    <div className="h-px w-24 bg-white/30" />
                    <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
                      CORE LAYER
                    </span>
                  </div>

                  {/* In-App Interface Preview Card (Shows the app at this stage) */}
                  <div className="relative p-4 sm:p-5 rounded-2xl bg-black/75 border border-zinc-800/90 backdrop-blur-xl z-10 space-y-3 shadow-xl">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="size-7 rounded-lg flex items-center justify-center text-white"
                          style={{ backgroundColor: `${stage.accentColor}25` }}
                        >
                          <IconComp className="size-4" style={{ color: stage.accentColor }} />
                        </div>
                        <div>
                          <p className="text-[9px] font-mono uppercase tracking-wider text-zinc-400">
                            {stage.appCard.badge}
                          </p>
                          <h4 className="font-heading font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                            {stage.appCard.title}
                          </h4>
                        </div>
                      </div>

                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#30D158]">
                        <span className="size-1.5 rounded-full bg-[#30D158] animate-pulse" />
                        LIVE APP
                      </span>
                    </div>

                    {/* App Telemetry Metrics Grid */}
                    <div className="grid grid-cols-3 gap-2">
                      {stage.appCard.items.map((item, mIdx) => (
                        <div
                          key={mIdx}
                          className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-1"
                        >
                          <p className="text-[9px] sm:text-[10px] font-mono uppercase text-zinc-400 truncate">
                            {item.label}
                          </p>
                          <p className="text-xs sm:text-sm font-bold text-white truncate">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Caption quote */}
                    <p className="text-[10px] sm:text-[11px] font-mono text-zinc-400 italic truncate pt-0.5">
                      "{stage.appCard.caption}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
