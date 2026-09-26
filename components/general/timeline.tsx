"use client";

import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  useState,
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
  Lock,
  Layers,
  Sparkles
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
  stepNumber: string;
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
    stepNumber: "01",
    italicTitle: "Identity",
    blockTitle: "IDENTITY",
    subtitle: "WHO YOU ARE / WHAT YOU BELIEVE",
    accentColor: "#FF02E8",
    circleRadius: "w-[48vw] h-[48vw] max-w-[620px] max-h-[620px]",
    circleStyle: "bg-gradient-to-r from-[#FF02E8]/20 via-[#FF02E8]/10 to-transparent border border-[#FF02E8]/40 shadow-[0_0_60px_rgba(255,2,232,0.15)]",
    floatingPills: [
      { text: "I am a morning bird", top: "12%", left: "18%" },
      { text: "I am a training athlete", top: "26%", right: "8%" },
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
    stepNumber: "02",
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
    stepNumber: "03",
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

/**
 * High-definition, scalable vector diagram reproducing the authentic
 * concentric inside-out behavioral transformation model from James Clear.
 * Mutually tangent on the left at the origin dot, with horizontal axis cutting through.
 */
function GeneralDiagramGraphic() {
  return (
    <div className="w-full h-full flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none">
      {/* Top Header inside canvas */}
      <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2 sm:pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#E11D48] animate-pulse" />
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-zinc-700">
            THE GENERAL FRAMEWORK • THREE LAYERS OF BEHAVIOR CHANGE
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
          <span>PART 1: THE OVERVIEW</span>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-800 font-semibold">ONE-BY-ONE DETAILS FOLLOW →</span>
        </div>
      </div>

      {/* Main SVG Diagram Container */}
      <div className="relative w-full flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[380px] my-1 sm:my-2 overflow-hidden">
        <svg
          viewBox="0 0 1000 520"
          className="w-full h-full max-h-[460px] object-contain"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Concentric diagram of Identity, Process, and Outcome"
        >
          <defs>
            {/* Soft pink stippled radial gradient for Identity */}
            <radialGradient id="identityFill" cx="42%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.55" />
              <stop offset="60%" stopColor="#FB7185" stopOpacity="0.38" />
              <stop offset="90%" stopColor="#F43F5E" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#E11D48" stopOpacity="0.08" />
            </radialGradient>

            {/* Subtle rose/cream wash for Process */}
            <radialGradient id="processFill" cx="38%" cy="50%" r="60%">
              <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.22" />
              <stop offset="65%" stopColor="#FECDD3" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFF1F2" stopOpacity="0.02" />
            </radialGradient>

            {/* Arrow marker for horizontal line */}
            <marker
              id="axisArrowhead"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#18181B" />
            </marker>

            {/* Subtle stipple / grain texture overlay pattern */}
            <pattern id="stippleTexture" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="0.75" fill="#E11D48" opacity="0.18" />
              <circle cx="5" cy="5" r="0.6" fill="#FB7185" opacity="0.15" />
            </pattern>
          </defs>

          {/* ══════════ CONCENTRIC CIRCLES (TANGENT ON LEFT AT X=90, Y=260) ══════════ */}
          
          {/* Faint Outer Guide Ripples */}
          <ellipse cx="490" cy="260" rx="400" ry="250" fill="none" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 4" />
          <ellipse cx="440" cy="260" rx="350" ry="235" fill="none" stroke="#E5E7EB" strokeWidth="1" />

          {/* 1. OUTCOME CIRCLE (Largest) */}
          <ellipse
            cx="400"
            cy="260"
            rx="310"
            ry="220"
            fill="rgba(255, 255, 255, 0.45)"
            stroke="#D1D5DB"
            strokeWidth="1.2"
          />

          {/* 2. PROCESS CIRCLE (Middle) */}
          <ellipse
            cx="315"
            cy="260"
            rx="225"
            ry="185"
            fill="url(#processFill)"
            stroke="#FB7185"
            strokeOpacity="0.35"
            strokeWidth="1.2"
          />
          {/* Texture wash */}
          <ellipse
            cx="315"
            cy="260"
            rx="225"
            ry="185"
            fill="url(#stippleTexture)"
            opacity="0.5"
          />

          {/* 3. IDENTITY CIRCLE (Innermost - vibrant pink/rose fill) */}
          <ellipse
            cx="235"
            cy="260"
            rx="145"
            ry="145"
            fill="url(#identityFill)"
            stroke="#E11D48"
            strokeOpacity="0.55"
            strokeWidth="1.6"
          />
          <ellipse
            cx="235"
            cy="260"
            rx="145"
            ry="145"
            fill="url(#stippleTexture)"
            opacity="0.75"
          />

          {/* ══════════ HORIZONTAL TIMELINE AXIS & ARROW ══════════ */}
          {/* Tangent Origin Dot at left edge */}
          <circle cx="90" cy="260" r="5" fill="#18181B" />

          {/* Solid Black Axis Line slicing across */}
          <line
            x1="90"
            y1="260"
            x2="905"
            y2="260"
            stroke="#18181B"
            strokeWidth="1.75"
            markerEnd="url(#axisArrowhead)"
          />

          {/* Terminal label at the arrow: "CHANGE FROM THE INSIDE OUT" */}
          <text
            x="715"
            y="245"
            fill="#18181B"
            fontSize="12.5"
            fontWeight="600"
            letterSpacing="1.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            CHANGE FROM THE INSIDE OUT
          </text>

          {/* ══════════ AXIS TITLES & SUBTITLES ══════════ */}

          {/* IDENTITY */}
          <text
            x="235"
            y="238"
            textAnchor="middle"
            fill="#18181B"
            fontSize="32"
            fontStyle="italic"
            fontFamily="Georgia, Cambria, 'Times New Roman', serif"
          >
            Identity
          </text>
          <text
            x="235"
            y="280"
            textAnchor="middle"
            fill="#18181B"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            WHO YOU ARE
          </text>
          <text
            x="235"
            y="295"
            textAnchor="middle"
            fill="#18181B"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            WHAT YOU BELIEVE
          </text>

          {/* PROCESS */}
          <text
            x="455"
            y="238"
            textAnchor="middle"
            fill="#18181B"
            fontSize="32"
            fontStyle="italic"
            fontFamily="Georgia, Cambria, 'Times New Roman', serif"
          >
            Process
          </text>
          <text
            x="455"
            y="280"
            textAnchor="middle"
            fill="#18181B"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            WHAT YOU DO
          </text>

          {/* OUTCOME */}
          <text
            x="615"
            y="238"
            textAnchor="middle"
            fill="#18181B"
            fontSize="32"
            fontStyle="italic"
            fontFamily="Georgia, Cambria, 'Times New Roman', serif"
          >
            Outcome
          </text>
          <text
            x="615"
            y="280"
            textAnchor="middle"
            fill="#18181B"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            WHAT YOU GET
          </text>

          {/* ══════════ SCATTERED FLOATING THOUGHTS & HABITS (EXACT TO IMAGE) ══════════ */}

          {/* Top Outer / Outcome labels */}
          <text x="310" y="48" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            Get up early
          </text>
          <text x="475" y="78" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            Live greener
          </text>
          <text x="590" y="148" textAnchor="start" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            <tspan x="590" dy="0">Lose weight and</tspan>
            <tspan x="590" dy="16">get in shape</tspan>
          </text>
          <text x="580" y="375" textAnchor="start" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            Give up smoking
          </text>

          {/* Process ring labels (Top) */}
          <text x="255" y="125" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            <tspan x="255" dy="0">Go to bed</tspan>
            <tspan x="255" dy="16">early</tspan>
          </text>
          <text x="380" y="190" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            <tspan x="380" dy="0">Bring bags</tspan>
            <tspan x="380" dy="16">when shopping</tspan>
          </text>
          <text x="440" y="218" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            <tspan x="440" dy="0">Workout for</tspan>
            <tspan x="440" dy="16">20 mins/day</tspan>
          </text>

          {/* Identity inner labels */}
          <text x="225" y="180" textAnchor="middle" fill="#27272A" fontSize="12.5" fontWeight="500" fontFamily="system-ui, sans-serif">
            <tspan x="225" dy="0">I am a</tspan>
            <tspan x="225" dy="16">morning bird</tspan>
          </text>
          <text x="330" y="222" textAnchor="middle" fill="#27272A" fontSize="12.5" fontWeight="500" fontFamily="system-ui, sans-serif">
            <tspan x="330" dy="0">I am an</tspan>
            <tspan x="330" dy="16">training athele</tspan>
          </text>
          <text x="240" y="360" textAnchor="middle" fill="#27272A" fontSize="12.5" fontWeight="500" fontFamily="system-ui, sans-serif">
            I am a reader
          </text>
          <text x="310" y="315" textAnchor="middle" fill="#27272A" fontSize="12.5" fontWeight="500" fontFamily="system-ui, sans-serif">
            I am a non-smoker
          </text>

          {/* Process ring labels (Bottom) */}
          <text x="425" y="338" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            Eat gums
          </text>
          <text x="365" y="392" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            <tspan x="365" dy="0">Read</tspan>
            <tspan x="365" dy="16">30 mins/day</tspan>
          </text>
          <text x="275" y="432" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            <tspan x="275" dy="0">Not use phone</tspan>
            <tspan x="275" dy="16">before bed</tspan>
          </text>
          <text x="335" y="482" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            Reduce screen time
          </text>
          <text x="465" y="460" textAnchor="middle" fill="#3F3F46" fontSize="12" fontFamily="system-ui, sans-serif">
            Read more
          </text>
        </svg>
      </div>

      {/* Bottom Footer inside canvas */}
      <div className="flex items-center justify-between border-t border-zinc-200/80 pt-2 sm:pt-3 text-[10px] sm:text-xs font-mono text-zinc-500 shrink-0">
        <div className="flex items-center gap-2">
          <Layers className="size-3.5 text-zinc-400" />
          <span>Core Insight: Outcomes are lagging indicators. Transformation starts at Identity.</span>
        </div>
        <div className="flex items-center gap-1.5 text-zinc-900 font-bold">
          <span>Scroll to explore Step-by-Step</span>
          <ArrowRight className="size-3.5 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

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

    const getScrollDistance = () => {
      const dist = slider.scrollWidth - window.innerWidth;
      return dist > 0 ? dist + (isMobile ? 120 : 280) : 2600;
    };

    const pinDuration = Math.max(3400, getScrollDistance() + 1400);

    if (reducedMotion) {
      DIAGRAM_STAGES.forEach((stage) => {
        gsap.set(`.stage-group-${stage.id}`, { opacity: 1 });
        gsap.set(`.stage-pill-${stage.id}`, { opacity: 1, scale: 1 });
      });
      return;
    }

    // Set initial states for detail stages
    DIAGRAM_STAGES.forEach((stage) => {
      gsap.set(`.stage-group-${stage.id}`, { opacity: 0.35, scale: 0.96 });
      gsap.set(`.stage-pill-${stage.id}`, { opacity: 0, scale: 0.8 });
    });

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

    // 1. Horizontal track movement: starts at Overview Diagram (Slide 0), scrolls to Steps 1, 2, 3
    masterTl.to(
      slider,
      {
        x: () => -getScrollDistance(),
        duration: 1,
        ease: "none",
      },
      0
    );

    // 2. Sequential illumination of each step card as it scrolls into focus
    const total = DIAGRAM_STAGES.length;
    DIAGRAM_STAGES.forEach((stage, idx) => {
      // Offset so the first slide (Overview) is enjoyed first
      const progress = 0.28 + (idx / total) * 0.62;

      // Stage card reveal
      masterTl.to(
        `.stage-group-${stage.id}`,
        {
          opacity: 1,
          scale: 1,
          duration: 0.12,
          ease: "power2.out",
        },
        progress
      );

      // Floating pills reveal
      masterTl.to(
        `.stage-pill-${stage.id}`,
        {
          opacity: 1,
          scale: 1,
          duration: 0.1,
          stagger: 0.02,
          ease: "back.out(1.5)",
        },
        progress + 0.03
      );
    });

    // 3. Final reading pause
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
      {/* ══════════ PINNED SECTION TITLE: "Block The Noise" ══════════ */}
      {/* Sized with exact massive headline size */}
      <div className="absolute top-12 sm:top-16 md:top-20 left-0 right-0 z-30 text-center pointer-events-none px-4 sm:px-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-2 shadow-lg">
          <Sparkles className="size-3.5 text-[#FF02E8]" />
          <span className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-zinc-300">
            NEURO-ARCHITECTURE OF PERFORMANCE
          </span>
        </div>
        <h2 className="title-huge text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.90] max-w-5xl mx-auto">
          {sectionTitle}
        </h2>
      </div>

      {/* ══════════ GSAP HORIZONTAL TRACK ══════════ */}
      <div className="h-screen w-full flex items-center overflow-hidden relative pt-28 sm:pt-36 md:pt-40">
        <div
          ref={sliderRef}
          className="flex h-[76vh] max-h-[720px] w-max items-center px-[6vw] gap-8 sm:gap-12 md:gap-16 will-change-transform relative"
        >
          {/* ═══════════════════════════════════════════════════════════
              PART 1: THE GENERAL DIAGRAM (EXACT IMAGE VISUAL)
              When the frame appears to the user, they see this first!
              ═══════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col justify-between w-[88vw] max-w-[1140px] min-w-[340px] h-[70vh] max-h-[660px] rounded-3xl bg-[#FAF7F2] text-zinc-900 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] border border-white/20 overflow-hidden shrink-0 z-10">
            <GeneralDiagramGraphic />
          </div>

          {/* ═══════════════════════════════════════════════════════════
              PART 2: ONE BY ONE DEEP-DIVE APP SHOWCASE STEPS
              As the user continues scrolling, explain each step by step!
              Title size for each card strictly matches the section title!
              ═══════════════════════════════════════════════════════════ */}
          {DIAGRAM_STAGES.map((stage) => {
            const IconComp = stage.appCard.icon;

            return (
              <div
                key={stage.id}
                className={`stage-group-${stage.id} relative flex flex-col justify-between w-[78vw] max-w-[880px] min-w-[340px] max-[768px]:w-[86vw] h-[70vh] max-h-[660px] p-6 sm:p-8 md:p-10 rounded-3xl bg-neutral-950/85 backdrop-blur-2xl border border-zinc-800/90 shadow-2xl transition-all duration-300 shrink-0 z-10 group overflow-hidden`}
              >
                {/* Concentric Halo Ring */}
                <div
                  className={`absolute -left-16 -top-16 ${stage.circleRadius} ${stage.circleStyle} rounded-full pointer-events-none -z-10`}
                />

                {/* Floating Belief / Process / Outcome Pills */}
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

                {/* Top Header: Step Indicator + Serif Italic Script + Massive Block Title */}
                <div className="space-y-1.5 z-10">
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
                      STEP {stage.stepNumber} • {stage.id.toUpperCase()}
                    </span>
                  </div>

                  {/* Massive Block Title: EXACT SAME SIZE AS SECTION TITLE */}
                  <h3 className="title-huge text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.90]">
                    {stage.blockTitle}
                  </h3>

                  {/* Subtitle from Diagram (e.g. WHO YOU ARE / WHAT YOU BELIEVE) */}
                  <p className="font-heading font-black text-xs sm:text-sm md:text-base tracking-[0.2em] uppercase text-zinc-300 pt-1">
                    {stage.subtitle}
                  </p>
                </div>

                {/* Center Line Cross-Section Anchor Marker */}
                <div className="relative py-1 flex items-center gap-3 z-10">
                  <div
                    className="size-3.5 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: stage.accentColor }}
                  />
                  <div className="h-px w-24 bg-white/30" />
                  <span className="text-[11px] font-mono tracking-widest uppercase text-zinc-400">
                    DEEP-DIVE ARCHITECTURE
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
    </section>
  );
}
