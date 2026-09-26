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
  Sparkles,
  Layers,
  ChevronRight,
  Maximize2
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
      { text: "I am an training athele", top: "26%", right: "8%" },
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
 * 100% Code-based conversion of the user's reference image:
 * Pixel-calibrated 1024x551 coordinate space matching media_1790463766825.png.
 * Features:
 * - Mutually tangent concentric circles sharing the left origin dot (●).
 * - Soft stippled rose/coral shading on Identity and Process.
 * - Central horizontal axis with terminal arrow and "CHANGE FROM THE INSIDE OUT".
 * - Authentic serif cursive script for Identity, Process, Outcome.
 * - Bold uppercase subtitles: WHO YOU ARE / WHAT YOU BELIEVE, WHAT YOU DO, WHAT YOU GET.
 * - All 16 scattered thoughts and habits in their exact places.
 */
function ExactBehavioralDiagram({ onSelectStage }: { onSelectStage?: (id: string) => void }) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center select-none bg-[#FAF8F5] relative overflow-hidden rounded-3xl p-2 sm:p-4 md:p-6 shadow-2xl border border-zinc-200/90">
      <svg
        viewBox="0 0 1024 551"
        className="w-full h-auto max-h-[580px] object-contain drop-shadow-sm"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Authentic Stippled Noise Filter */}
          <filter id="stippleFilter" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" result="noise" />
            <feColorMatrix
              type="matrix"
              values="
                1 0 0 0 0
                0 0.2 0 0 0
                0 0 0.35 0 0
                0 0 0 0.45 0"
              result="colorNoise"
            />
            <feComposite in="SourceGraphic" in2="colorNoise" operator="in" />
          </filter>

          {/* Identity Circular Gradient (Soft warm pink with stippled edges) */}
          <radialGradient id="identityRadial" cx="48%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#FFE4E6" stopOpacity="0.75" />
            <stop offset="85%" stopColor="#FDA4AF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.35" />
          </radialGradient>

          {/* Process Circular Gradient */}
          <radialGradient id="processRadial" cx="44%" cy="50%" r="54%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#FFF1F2" stopOpacity="0.35" />
            <stop offset="90%" stopColor="#FFE4E6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0.1" />
          </radialGradient>

          {/* Fine Stipple Texture Pattern Overlay */}
          <pattern id="stippleDots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.75" fill="#E11D48" opacity="0.25" />
            <circle cx="6" cy="6" r="0.6" fill="#F43F5E" opacity="0.2" />
          </pattern>

          {/* Terminal Arrowhead marker */}
          <marker
            id="diagramArrowhead"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6.5"
            markerHeight="6.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#18181B" />
          </marker>
        </defs>

        {/* ══════════ CONCENTRIC CIRCLES (ALL TANGENT ON LEFT AT X=95, Y=270) ══════════ */}

        {/* Outer Ripple Concentric Guide Arcs */}
        <ellipse cx="585" cy="270" rx="490" ry="390" fill="none" stroke="#EAE6DF" strokeWidth="1" />
        <ellipse cx="485" cy="270" rx="390" ry="315" fill="none" stroke="#EAE6DF" strokeWidth="1" strokeDasharray="3 3" />

        {/* 1. OUTCOME REGION (Outer Circle) */}
        <ellipse
          cx="395"
          cy="270"
          rx="300"
          ry="260"
          fill="rgba(255, 255, 255, 0.35)"
          stroke="#D8D3CA"
          strokeWidth="1.2"
          className="transition-all duration-300 hover:stroke-zinc-500 cursor-pointer"
          onClick={() => onSelectStage?.("outcome")}
        />

        {/* 2. PROCESS REGION (Middle Ellipse) */}
        <ellipse
          cx="315"
          cy="270"
          rx="220"
          ry="205"
          fill="url(#processRadial)"
          stroke="#FB7185"
          strokeOpacity="0.4"
          strokeWidth="1.4"
          className="transition-all duration-300 hover:stroke-rose-500 cursor-pointer"
          onClick={() => onSelectStage?.("process")}
        />
        <ellipse
          cx="315"
          cy="270"
          rx="220"
          ry="205"
          fill="url(#stippleDots)"
          opacity="0.4"
          pointerEvents="none"
        />

        {/* 3. IDENTITY REGION (Inner Circle - pink/rose stippled glow) */}
        <ellipse
          cx="240"
          cy="270"
          rx="145"
          ry="145"
          fill="url(#identityRadial)"
          stroke="#E11D48"
          strokeOpacity="0.65"
          strokeWidth="1.8"
          className="transition-all duration-300 hover:stroke-rose-600 hover:drop-shadow-md cursor-pointer"
          onClick={() => onSelectStage?.("identity")}
        />
        <ellipse
          cx="240"
          cy="270"
          rx="145"
          ry="145"
          fill="url(#stippleDots)"
          opacity="0.75"
          pointerEvents="none"
        />

        {/* ══════════ HORIZONTAL TIMELINE ARROW (CROSSING THROUGH ALL LAYERS) ══════════ */}
        {/* Origin Tangent Dot (●) */}
        <circle cx="95" cy="270" r="5" fill="#18181B" />

        {/* Solid Black Axis Line */}
        <line
          x1="95"
          y1="270"
          x2="895"
          y2="270"
          stroke="#18181B"
          strokeWidth="1.8"
          markerEnd="url(#diagramArrowhead)"
        />

        {/* Terminal Label: "CHANGE FROM THE INSIDE OUT" */}
        <text
          x="705"
          y="256"
          fill="#18181B"
          fontSize="12"
          fontWeight="500"
          letterSpacing="1.5"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          CHANGE FROM THE INSIDE OUT
        </text>

        {/* ══════════ THREE CORE STAGE LABELS ON AXIS ══════════ */}

        {/* IDENTITY */}
        <g
          className="cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => onSelectStage?.("identity")}
        >
          <text
            x="240"
            y="254"
            textAnchor="middle"
            fill="#18181B"
            fontSize="34"
            fontStyle="italic"
            fontFamily="Georgia, Cambria, 'Times New Roman', serif"
          >
            Identity
          </text>
          <text
            x="240"
            y="288"
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
            x="240"
            y="302"
            textAnchor="middle"
            fill="#18181B"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            WHAT YOU BELIEVE
          </text>
        </g>

        {/* PROCESS */}
        <g
          className="cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => onSelectStage?.("process")}
        >
          <text
            x="455"
            y="254"
            textAnchor="middle"
            fill="#18181B"
            fontSize="34"
            fontStyle="italic"
            fontFamily="Georgia, Cambria, 'Times New Roman', serif"
          >
            Process
          </text>
          <text
            x="455"
            y="290"
            textAnchor="middle"
            fill="#18181B"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            WHAT YOU DO
          </text>
        </g>

        {/* OUTCOME */}
        <g
          className="cursor-pointer transition-transform duration-200 hover:scale-105"
          onClick={() => onSelectStage?.("outcome")}
        >
          <text
            x="618"
            y="254"
            textAnchor="middle"
            fill="#18181B"
            fontSize="34"
            fontStyle="italic"
            fontFamily="Georgia, Cambria, 'Times New Roman', serif"
          >
            Outcome
          </text>
          <text
            x="618"
            y="290"
            textAnchor="middle"
            fill="#18181B"
            fontSize="11.5"
            fontWeight="900"
            letterSpacing="0.8"
            fontFamily="system-ui, -apple-system, sans-serif"
          >
            WHAT YOU GET
          </text>
        </g>

        {/* ══════════ EXACT SCATTERED LABELS (ZERO OVERLAPS) ══════════ */}

        {/* 1. Get up early (Top apex) */}
        <text x="308" y="22" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          Get up early
        </text>

        {/* 2. Live greener (Top-mid outcome) */}
        <text x="475" y="48" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          Live greener
        </text>

        {/* 3. Lose weight and get in shape (Upper right outcome) */}
        <text x="588" y="138" textAnchor="start" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          <tspan x="588" dy="0">Lose weight and</tspan>
          <tspan x="588" dy="16">get in shape</tspan>
        </text>

        {/* 4. Go to bed early (Process upper left) */}
        <text x="265" y="80" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          <tspan x="265" dy="0">Go to bed</tspan>
          <tspan x="265" dy="16">early</tspan>
        </text>

        {/* 5. Bring bags when shopping (Process top center) */}
        <text x="370" y="115" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          <tspan x="370" dy="0">Bring bags</tspan>
          <tspan x="370" dy="16">when shopping</tspan>
        </text>

        {/* 6. Workout for 20 mins/day (Process top right - safely above Process) */}
        <text x="435" y="180" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          <tspan x="435" dy="0">Workout for</tspan>
          <tspan x="435" dy="16">20 mins/day</tspan>
        </text>

        {/* 7. I am a morning bird (Identity top left) */}
        <text x="235" y="145" textAnchor="middle" fill="#18181B" fontSize="12.5" fontWeight="500" fontFamily="system-ui, sans-serif">
          <tspan x="235" dy="0">I am a</tspan>
          <tspan x="235" dy="17">a morning bird</tspan>
        </text>

        {/* 8. I am an training athele (Identity top right) */}
        <text x="335" y="205" textAnchor="middle" fill="#18181B" fontSize="12.5" fontWeight="500" fontFamily="system-ui, sans-serif">
          <tspan x="335" dy="0">I am an</tspan>
          <tspan x="335" dy="17">training athele</tspan>
        </text>

        {/* 9. Eat gums (Under line between Identity and Process) */}
        <text x="420" y="355" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          Eat gums
        </text>

        {/* 10. I am a non-smoker (Identity lower right - safely spaced below) */}
        <text x="312" y="340" textAnchor="middle" fill="#18181B" fontSize="12.5" fontWeight="500" fontFamily="system-ui, sans-serif">
          <tspan x="312" dy="0">I am a</tspan>
          <tspan x="312" dy="17">non-smoker</tspan>
        </text>

        {/* 11. I am a reader (Identity lower left) */}
        <text x="245" y="390" textAnchor="middle" fill="#18181B" fontSize="12.5" fontWeight="500" fontFamily="system-ui, sans-serif">
          I am a reader
        </text>

        {/* 12. Read 30 mins/day (Process lower center) */}
        <text x="360" y="425" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          <tspan x="360" dy="0">Read</tspan>
          <tspan x="360" dy="16">30 mins/day</tspan>
        </text>

        {/* 13. Not use phone before bed (Process lower left) */}
        <text x="280" y="470" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          <tspan x="280" dy="0">Not use phone</tspan>
          <tspan x="280" dy="16">before bed</tspan>
        </text>

        {/* 14. Reduce screen time (Process bottom center) */}
        <text x="330" y="530" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          Reduce screen time
        </text>

        {/* 15. Read more (Process bottom right) */}
        <text x="465" y="505" textAnchor="middle" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          Read more
        </text>

        {/* 16. Give up smoking (Outcome lower right) */}
        <text x="582" y="395" textAnchor="start" fill="#374151" fontSize="12" fontFamily="system-ui, sans-serif">
          Give up smoking
        </text>
      </svg>
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

  const scrollToStage = (stageId: string) => {
    const slider = sliderRef.current;
    if (!slider) return;
    const targetEl = slider.querySelector(`.stage-group-${stageId}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  };

  useGSAP(() => {
    const section = sectionRef.current;
    const slider = sliderRef.current;

    if (!section || !slider) return;

    const isMobile = window.innerWidth < 768;

    const getScrollDistance = () => {
      const dist = slider.scrollWidth - window.innerWidth;
      return dist > 0 ? dist + (isMobile ? 120 : 320) : 2800;
    };

    const pinDuration = Math.max(3600, getScrollDistance() + 1500);

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
      // Offset so the first slide (Overview Diagram) is enjoyed first
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
      {/* Sized with exact massive headline size requested */}
      <div className="absolute top-12 sm:top-16 md:top-20 left-0 right-0 z-30 text-center pointer-events-none px-4 sm:px-8">
        <h2 className="title-huge text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[0.90] max-w-5xl mx-auto">
          {sectionTitle}
        </h2>
      </div>

      {/* ══════════ GSAP HORIZONTAL TRACK ══════════ */}
      <div className="h-screen w-full flex items-center overflow-hidden relative pt-24 sm:pt-32 md:pt-36">
        <div
          ref={sliderRef}
          className="flex h-[78vh] max-h-[740px] w-max items-center px-[5vw] gap-8 sm:gap-12 md:gap-16 will-change-transform relative"
        >
          {/* ═══════════════════════════════════════════════════════════
              PART 1: THE GENERAL DIAGRAM (EXACT IMAGE VISUAL AS CODE)
              When the frame appears to the user, they see this first!
              Exact image conversion: warm cream canvas, concentric rings,
              horizontal arrow, all thoughts and labels.
              ═══════════════════════════════════════════════════════════ */}
          <div className="relative flex flex-col justify-center w-[92vw] max-w-[1300px] min-w-[340px] h-[74vh] max-h-[700px] shrink-0 z-10 mr-6 sm:mr-16 md:mr-24">
            <ExactBehavioralDiagram onSelectStage={scrollToStage} />
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
                className={`stage-group-${stage.id} relative flex flex-col justify-between w-[78vw] max-w-[880px] min-w-[340px] max-[768px]:w-[86vw] h-[72vh] max-h-[680px] p-6 sm:p-8 md:p-10 rounded-3xl bg-neutral-950/85 backdrop-blur-2xl border border-zinc-800/90 shadow-2xl transition-all duration-300 shrink-0 z-10 group overflow-hidden`}
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
