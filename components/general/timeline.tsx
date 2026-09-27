"use client";

import {
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  useState,
  useEffect,
  useMemo,
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
  ShieldCheck,
  CheckCircle2
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
  glowColor: string;
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
    italicTitle: "Purpose",
    blockTitle: "PURPOSE",
    subtitle: "WHO YOU ARE / WHAT YOU BELIEVE",
    accentColor: "#FF02E8",
    glowColor: "rgba(255, 2, 232, 0.4)",
    appCard: {
      badge: "PURPOSE",
      icon: Brain,
      title: "Create the habit.",
      items: [
        { label: "Target", value: "Active 90-Day Target", badge: "Linked" },
        { label: "Action", value: "Daily Baseline", badge: "Set" },
        { label: "Focus", value: "1 Goal / 3 Mo", badge: "Optimal" },
      ],
      caption: "Linking a specific daily action directly to your active 90-day target.",
    },
  },
  {
    id: "process",
    stepNumber: "02",
    italicTitle: "Boundary",
    blockTitle: "BOUNDARY",
    subtitle: "WHAT YOU DO",
    accentColor: "#FF9F0A",
    glowColor: "rgba(255, 159, 10, 0.35)",
    appCard: {
      badge: "BOUNDARY",
      icon: Zap,
      title: "Block the noise.",
      items: [
        { label: "Schedule", value: "Exact Time Block", badge: "Locked" },
        { label: "Enforce", value: "Apps Locked Down", badge: "Shield" },
        { label: "State", value: "Zero Friction", badge: "Active" },
      ],
      caption: "IMPROVE strictly enforces the boundary so your routine remains unbroken.",
    },
  },
  {
    id: "outcome",
    stepNumber: "03",
    italicTitle: "Action",
    blockTitle: "ACTION",
    subtitle: "WHAT YOU GET",
    accentColor: "#30D158",
    glowColor: "rgba(48, 209, 88, 0.35)",
    appCard: {
      badge: "ACTION",
      icon: Award,
      title: "Execute the habit.",
      items: [
        { label: "Execution", value: "Pure Action", badge: "Done" },
        { label: "AI Queue", value: "Apple Intelligence", badge: "Live" },
        { label: "Direction", value: "Inside Out", badge: "Flow" },
      ],
      caption: "Apple Intelligence reads your daily queue to keep you in a state of flow.",
    },
  },
];

function CardTypewriter({
  text,
  active,
  accentColor = "#FF02E8",
  keyPhrases = [],
}: {
  text: string;
  active: boolean;
  accentColor?: string;
  keyPhrases?: string[];
}) {
  const [charCount, setCharCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const parsedSegments = useMemo(() => {
    if (!text) return [];
    if (keyPhrases.length === 0) return [{ text, isKey: false }];
    const regex = new RegExp(
      `(${keyPhrases.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`,
      "g"
    );
    const parts = text.split(regex);
    return parts.filter(Boolean).map((part) => ({
      text: part,
      isKey: keyPhrases.includes(part),
    }));
  }, [text, keyPhrases]);

  const fullLength = useMemo(() => {
    return parsedSegments.reduce((sum, seg) => sum + seg.text.length, 0);
  }, [parsedSegments]);

  useEffect(() => {
    if (!active) {
      setCharCount(0);
      setIsFinished(false);
      return;
    }

    let timer: NodeJS.Timeout;
    const timeout = setTimeout(() => {
      timer = setInterval(() => {
        setCharCount((prev) => {
          if (prev < fullLength) {
            return prev + 1;
          }
          clearInterval(timer);
          setIsFinished(true);
          return prev;
        });
      }, 13);
    }, 120);

    return () => {
      clearTimeout(timeout);
      if (timer) clearInterval(timer);
    };
  }, [active, fullLength]);

  let charsRemaining = charCount;

  return (
    <p className="text-[8px] sm:text-[8.5px] leading-relaxed text-zinc-300 font-normal min-h-[44px]">
      {parsedSegments.map((seg, idx) => {
        if (charsRemaining <= 0) return null;
        const visibleChars = Math.min(charsRemaining, seg.text.length);
        charsRemaining -= visibleChars;
        const visibleText = seg.text.slice(0, visibleChars);

        return (
          <span
            key={idx}
            className={seg.isKey ? "font-bold text-white transition-colors duration-200" : "text-zinc-300"}
          >
            {visibleText}
          </span>
        );
      })}
      {!isFinished && active && (
        <span
          className="inline-block w-1 h-2 ml-0.5 align-middle rounded-sm animate-pulse"
          style={{ backgroundColor: accentColor }}
        />
      )}
    </p>
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
  const zoomStageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [activeStep, setActiveStep] = useState<number>(0);

  useGSAP(() => {
    const section = sectionRef.current;
    const stage = zoomStageRef.current;
    if (!section || !stage) return;

    if (reducedMotion) {
      gsap.set(".card-zoom-layer", { opacity: 0, scale: 0.85, pointerEvents: "none" });
      return;
    }

    // Set initial states
    gsap.set(".card-zoom-layer", { opacity: 0, scale: 0.85, pointerEvents: "none" });
    gsap.set(".overview-labels-group", { opacity: 1 });
    gsap.set(".diagram-axis-line", { strokeOpacity: 1 });
    gsap.set(".ring-identity", { stroke: "#FF02E8", strokeOpacity: 0.85, strokeWidth: 2 });
    gsap.set(".ring-process", { stroke: "#FF9F0A", strokeOpacity: 0.5, strokeWidth: 1.6 });
    gsap.set(".ring-outcome", { stroke: "#30D158", strokeOpacity: 0.4, strokeWidth: 1.4 });

    const pinDuration = 4500;

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
        onUpdate: (self) => {
          const p = self.progress;
          if (p < 0.06) {
            setActiveStep(0);
          } else if (p < 0.36) {
            setActiveStep(1);
          } else if (p < 0.67) {
            setActiveStep(2);
          } else {
            setActiveStep(3);
          }
        },
      },
      defaults: { ease: "power2.inOut" },
    });

    // Initial frame pause
    masterTl.to({}, { duration: 0.08 });

    // ═════════════════════════════════════════════════════════════════
    // STEP 1: ZOOM INTO THE FIRST RING (IDENTITY)
    // On the first scroll, zoom the camera right into the Identity ring!
    // Inside that ring is where the first card lives!
    // ═════════════════════════════════════════════════════════════════
    masterTl
      // 1. Camera zoom in & focus on Identity center (cx=240, cy=270)
      .to(
        stage,
        {
          scale: 2.2,
          xPercent: 26.5,
          yPercent: 2.5,
          duration: 0.35,
        },
        "step1"
      )
      // Fade out overview clutter so the card and ring shine
      .to(
        ".overview-labels-group",
        {
          opacity: 0,
          duration: 0.2,
        },
        "step1+=0.05"
      )
      // Dim axis line so it doesn't distract
      .to(
        ".diagram-axis-line",
        {
          strokeOpacity: 0.2,
          duration: 0.2,
        },
        "step1+=0.05"
      )
      // Illuminate Identity Ring with glowing neon
      .to(
        ".ring-identity",
        {
          stroke: "#FF02E8",
          strokeWidth: 3.5,
          strokeOpacity: 1,
          filter: "drop-shadow(0 0 25px #FF02E8)",
          duration: 0.2,
        },
        "step1+=0.1"
      )
      // Reveal Card 1 (Identity) INSIDE THE RING
      .to(
        ".card-identity",
        {
          opacity: 1,
          scale: 1,
          pointerEvents: "auto",
          duration: 0.25,
        },
        "step1+=0.15"
      )

      // Hold Identity card for reading
      .to({}, { duration: 0.35 })

      // ═════════════════════════════════════════════════════════════════
      // STEP 2: PAN TO PROCESS RING (CARD 2 LIVES INSIDE PROCESS)
      // ═════════════════════════════════════════════════════════════════
      // Hide Card 1
      .to(
        ".card-identity",
        {
          opacity: 0,
          scale: 0.85,
          pointerEvents: "none",
          duration: 0.15,
        },
        "step2"
      )
      // Pan camera to Process ring center
      .to(
        stage,
        {
          scale: 2.1,
          xPercent: 5.5,
          yPercent: 2.5,
          duration: 0.35,
        },
        "step2"
      )
      // Dim Identity ring
      .to(
        ".ring-identity",
        {
          strokeWidth: 2,
          strokeOpacity: 0.35,
          filter: "none",
          duration: 0.2,
        },
        "step2"
      )
      // Illuminate Process Ring
      .to(
        ".ring-process",
        {
          stroke: "#FF9F0A",
          strokeWidth: 3.5,
          strokeOpacity: 1,
          filter: "drop-shadow(0 0 25px #FF9F0A)",
          duration: 0.2,
        },
        "step2+=0.1"
      )
      // Reveal Card 2 (Process) INSIDE THE RING
      .to(
        ".card-process",
        {
          opacity: 1,
          scale: 1,
          pointerEvents: "auto",
          duration: 0.25,
        },
        "step2+=0.15"
      )

      // Hold Process card for reading
      .to({}, { duration: 0.35 })

      // ═════════════════════════════════════════════════════════════════
      // STEP 3: PAN TO OUTCOME RING (CARD 3 LIVES INSIDE OUTCOME)
      // ═════════════════════════════════════════════════════════════════
      // Hide Card 2
      .to(
        ".card-process",
        {
          opacity: 0,
          scale: 0.85,
          pointerEvents: "none",
          duration: 0.15,
        },
        "step3"
      )
      // Pan camera to Outcome ring center
      .to(
        stage,
        {
          scale: 2.0,
          xPercent: -10.5,
          yPercent: 2.5,
          duration: 0.35,
        },
        "step3"
      )
      // Dim Process ring
      .to(
        ".ring-process",
        {
          strokeWidth: 1.6,
          strokeOpacity: 0.3,
          filter: "none",
          duration: 0.2,
        },
        "step3"
      )
      // Illuminate Outcome Ring
      .to(
        ".ring-outcome",
        {
          stroke: "#30D158",
          strokeWidth: 3.5,
          strokeOpacity: 1,
          filter: "drop-shadow(0 0 25px #30D158)",
          duration: 0.2,
        },
        "step3+=0.1"
      )
      // Reveal Card 3 (Outcome) INSIDE THE RING
      .to(
        ".card-outcome",
        {
          opacity: 1,
          scale: 1,
          pointerEvents: "auto",
          duration: 0.25,
        },
        "step3+=0.15"
      )

      // Final reading pause
      .to({}, { duration: 0.3 });

    const handleResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, { dependencies: [reducedMotion], scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="behavioral-architecture"
      className="w-full h-screen relative overflow-hidden bg-[#050308] text-white border-t border-zinc-900 select-none flex flex-col justify-between items-center py-4 sm:py-6 md:py-8"
    >
      {/* ══════════ SECTION TITLE: "Block The Noise" (FITS FIRST FRAME) ══════════ */}
      <div className="w-full text-center px-4 pt-2 sm:pt-4 z-30 pointer-events-none shrink-0">
        <h2 className="title-huge text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white leading-none drop-shadow-[0_0_35px_rgba(255,2,232,0.25)]">
          {sectionTitle}
        </h2>
      </div>

      {/* ══════════ THE CINEMATIC CAMERA ZOOM STAGE (DARK THEME) ══════════ */}
      <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden px-2 sm:px-4">
        <div
          ref={zoomStageRef}
          className="relative w-[92vw] max-w-[1080px] aspect-[1024/551] max-h-[58vh] flex items-center justify-center will-change-transform origin-center transition-shadow"
        >
          {/* ════════════════════════════════════════════════════════════
              1. THE EXACT 3 CONCENTRIC RINGS (MATCHING PRODUCTIVITY PALETTE)
              No white box: seamless deep dark luxury with glowing neon rings
              No grey rings: strictly 3 rings (Identity, Process, Outcome)
              ════════════════════════════════════════════════════════════ */}
          <svg
            viewBox="0 0 1024 551"
            className="w-full h-full object-contain pointer-events-none"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Electric Magenta Radial Glow for Identity */}
              <radialGradient id="darkIdentityGlow" cx="48%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF02E8" stopOpacity="0.28" />
                <stop offset="60%" stopColor="#FF02E8" stopOpacity="0.14" />
                <stop offset="85%" stopColor="#FF02E8" stopOpacity="0.04" />
                <stop offset="100%" stopColor="#050308" stopOpacity="0" />
              </radialGradient>

              {/* Amber/Rose Radial Glow for Process */}
              <radialGradient id="darkProcessGlow" cx="44%" cy="50%" r="54%">
                <stop offset="0%" stopColor="#FF9F0A" stopOpacity="0.15" />
                <stop offset="70%" stopColor="#FF9F0A" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#050308" stopOpacity="0" />
              </radialGradient>

              {/* Terminal Arrowhead marker in glowing white */}
              <marker
                id="whiteArrowhead"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6.5"
                markerHeight="6.5"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FFFFFF" />
              </marker>

              {/* Stipple pattern with glowing pink particles */}
              <pattern id="darkStipple" width="10" height="10" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="0.85" fill="#FF02E8" opacity="0.35" />
                <circle cx="7" cy="8" r="0.65" fill="#FFFFFF" opacity="0.25" />
              </pattern>
            </defs>

            {/* ══════════ THE ONLY 3 CONCENTRIC RINGS (TANGENT ON LEFT AT X=95, Y=270) ══════════ */}

            {/* 1. OUTCOME RING (Emerald Glow) */}
            <ellipse
              cx="395"
              cy="270"
              rx="300"
              ry="255"
              fill="rgba(48, 209, 88, 0.03)"
              className="ring-outcome transition-all duration-300"
              stroke="#30D158"
              strokeWidth="1.4"
              strokeOpacity="0.45"
            />

            {/* 2. PROCESS RING (Amber Glow) */}
            <ellipse
              cx="315"
              cy="270"
              rx="220"
              ry="205"
              fill="url(#darkProcessGlow)"
              className="ring-process transition-all duration-300"
              stroke="#FF9F0A"
              strokeWidth="1.6"
              strokeOpacity="0.6"
            />
            <ellipse
              cx="315"
              cy="270"
              rx="220"
              ry="205"
              fill="url(#darkStipple)"
              opacity="0.3"
            />

            {/* 3. IDENTITY RING (Electric Magenta Glow) */}
            <ellipse
              cx="240"
              cy="270"
              rx="145"
              ry="145"
              fill="url(#darkIdentityGlow)"
              className="ring-identity transition-all duration-300"
              stroke="#FF02E8"
              strokeWidth="2"
              strokeOpacity="0.85"
            />
            <ellipse
              cx="240"
              cy="270"
              rx="145"
              ry="145"
              fill="url(#darkStipple)"
              opacity="0.6"
            />

            {/* ══════════ HORIZONTAL TIMELINE ARROW (WHITE/GLOWING AXIS) ══════════ */}
            {/* Origin Tangent Dot (●) with pulse aura */}
            <circle cx="95" cy="270" r="5" fill="#FFFFFF" />
            <circle cx="95" cy="270" r="10" fill="none" stroke="#FF02E8" strokeWidth="1.5" opacity="0.6" />

            {/* Solid White Glowing Axis Line */}
            <line
              className="diagram-axis-line transition-all duration-300"
              x1="95"
              y1="270"
              x2="895"
              y2="270"
              stroke="#FFFFFF"
              strokeWidth="2"
              markerEnd="url(#whiteArrowhead)"
              style={{ filter: "drop-shadow(0 0 8px rgba(255, 2, 232, 0.4))" }}
            />

            {/* Terminal Label: "CHANGE FROM THE INSIDE OUT" */}
            <text
              x="705"
              y="256"
              fill="#FFFFFF"
              fontSize="12.5"
              fontWeight="600"
              letterSpacing="1.8"
              fontFamily="system-ui, -apple-system, sans-serif"
              style={{ filter: "drop-shadow(0 0 10px rgba(255, 255, 255, 0.4))" }}
            >
              CHANGE FROM THE INSIDE OUT
            </text>

            {/* ══════════ OVERVIEW TEXT LABELS (FADE AS ZOOM ACTIVATES) ══════════ */}
            <g className="overview-labels-group transition-opacity duration-300">
              {/* Purpose on Axis */}
              <text
                x="240"
                y="254"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="34"
                fontStyle="italic"
                fontFamily="Georgia, Cambria, 'Times New Roman', serif"
              >
                Purpose
              </text>
              <text
                x="240"
                y="288"
                textAnchor="middle"
                fill="#F4F4F5"
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
                fill="#E4E4E7"
                fontSize="11.5"
                fontWeight="900"
                letterSpacing="0.8"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                WHAT YOU BELIEVE
              </text>

              {/* Boundary on Axis */}
              <text
                x="455"
                y="254"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="34"
                fontStyle="italic"
                fontFamily="Georgia, Cambria, 'Times New Roman', serif"
              >
                Boundary
              </text>
              <text
                x="455"
                y="290"
                textAnchor="middle"
                fill="#F4F4F5"
                fontSize="11.5"
                fontWeight="900"
                letterSpacing="0.8"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                WHAT YOU DO
              </text>

              {/* Action on Axis */}
              <text
                x="618"
                y="254"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="34"
                fontStyle="italic"
                fontFamily="Georgia, Cambria, 'Times New Roman', serif"
              >
                Action
              </text>
              <text
                x="618"
                y="290"
                textAnchor="middle"
                fill="#F4F4F5"
                fontSize="11.5"
                fontWeight="900"
                letterSpacing="0.8"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                WHAT YOU GET
              </text>

              {/* 16 Authentic Scattered Labels */}
              <text x="308" y="24" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                Get up early
              </text>
              <text x="475" y="48" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                Live greener
              </text>
              <text x="588" y="138" textAnchor="start" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                <tspan x="588" dy="0">Lose weight and</tspan>
                <tspan x="588" dy="16">get in shape</tspan>
              </text>
              <text x="265" y="80" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                <tspan x="265" dy="0">Go to bed</tspan>
                <tspan x="265" dy="16">early</tspan>
              </text>
              <text x="370" y="115" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                <tspan x="370" dy="0">Bring bags</tspan>
                <tspan x="370" dy="16">when shopping</tspan>
              </text>
              <text x="435" y="180" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                <tspan x="435" dy="0">Workout for</tspan>
                <tspan x="435" dy="16">20 mins/day</tspan>
              </text>
              <text x="235" y="145" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif">
                <tspan x="235" dy="0">I am a</tspan>
                <tspan x="235" dy="17">a morning bird</tspan>
              </text>
              <text x="335" y="205" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif">
                <tspan x="335" dy="0">I am an</tspan>
                <tspan x="335" dy="17">training athele</tspan>
              </text>
              <text x="420" y="355" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                Eat gums
              </text>
              <text x="312" y="340" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif">
                <tspan x="312" dy="0">I am a</tspan>
                <tspan x="312" dy="17">non-smoker</tspan>
              </text>
              <text x="245" y="390" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="500" fontFamily="system-ui, sans-serif">
                I am a reader
              </text>
              <text x="360" y="425" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                <tspan x="360" dy="0">Read</tspan>
                <tspan x="360" dy="16">30 mins/day</tspan>
              </text>
              <text x="280" y="470" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                <tspan x="280" dy="0">Not use phone</tspan>
                <tspan x="280" dy="16">before bed</tspan>
              </text>
              <text x="330" y="525" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                Reduce screen time
              </text>
              <text x="465" y="505" textAnchor="middle" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                Read more
              </text>
              <text x="582" y="395" textAnchor="start" fill="#A1A1AA" fontSize="11.5" fontFamily="system-ui, sans-serif">
                Give up smoking
              </text>
            </g>
          </svg>

          {/* ════════════════════════════════════════════════════════════
              2. THE EMBEDDED STAGE CARDS (COMPACT & LIVING INSIDE EACH RING)
              Inside titles: Create the habit, Block the noise, Execute the habit
              ════════════════════════════════════════════════════════════ */}

          {/* ── CARD 1: LIVES INSIDE THE FIRST RING (PURPOSE) ── */}
          <div
            className="card-zoom-layer card-identity absolute left-[23.4%] top-[49%] -translate-x-1/2 -translate-y-1/2 w-[225px] sm:w-[240px] p-3 rounded-2xl bg-[#08050D]/95 border border-[#FF02E8]/70 shadow-[0_0_40px_rgba(255,2,232,0.45)] backdrop-blur-md z-20 flex flex-col gap-2 pointer-events-none"
          >
            <div>
              <h4 className="text-[12px] font-bold tracking-tight text-white leading-tight">
                Create the habit.
              </h4>
            </div>

            {/* Typewriter Copy */}
            <CardTypewriter
              text="When you create a habit in IMPROVE, you are defining your baseline. You aren't just making a list; you are linking a specific daily action directly to your active 90-day target—one hyper-focused goal every three months—to define who you are becoming."
              active={activeStep === 1}
              accentColor="#FF02E8"
              keyPhrases={["IMPROVE", "active 90-day target", "one hyper-focused goal", "baseline"]}
            />

            {/* App Image Slot */}
            <div className="w-full aspect-[16/10] rounded-xl bg-black/90 border border-dashed border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-inner">
              <span className="text-[7.5px] font-mono tracking-widest uppercase text-zinc-500">
                App Image
              </span>
            </div>
          </div>

          {/* ── CARD 2: LIVES INSIDE THE SECOND RING (BOUNDARY) ── */}
          <div
            className="card-zoom-layer card-process absolute left-[44.5%] top-[49%] -translate-x-1/2 -translate-y-1/2 w-[225px] sm:w-[240px] p-3 rounded-2xl bg-[#08050D]/95 border border-[#FF9F0A]/70 shadow-[0_0_40px_rgba(255,159,10,0.45)] backdrop-blur-md z-20 flex flex-col gap-2 pointer-events-none"
          >
            <div>
              <h4 className="text-[12px] font-bold tracking-tight text-white leading-tight">
                Block the noise.
              </h4>
            </div>

            {/* Typewriter Copy */}
            <CardTypewriter
              text="This is where your system defends you. You schedule the exact time block for the habit and select the apps to lock down. When the time arrives, IMPROVE strictly enforces the boundary, eliminating friction and distractions so your routine remains unbroken."
              active={activeStep === 2}
              accentColor="#FF9F0A"
              keyPhrases={["IMPROVE", "strictly enforces", "apps to lock down", "boundary", "eliminating friction"]}
            />

            {/* App Image Slot */}
            <div className="w-full aspect-[16/10] rounded-xl bg-black/90 border border-dashed border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-inner">
              <span className="text-[7.5px] font-mono tracking-widest uppercase text-zinc-500">
                App Image
              </span>
            </div>
          </div>

          {/* ── CARD 3: LIVES INSIDE THE THIRD RING (ACTION) ── */}
          <div
            className="card-zoom-layer card-outcome absolute left-[60.5%] top-[49%] -translate-x-1/2 -translate-y-1/2 w-[225px] sm:w-[240px] p-3 rounded-2xl bg-[#08050D]/95 border border-[#30D158]/70 shadow-[0_0_40px_rgba(48,209,88,0.45)] backdrop-blur-md z-20 flex flex-col gap-2 pointer-events-none"
          >
            <div>
              <h4 className="text-[12px] font-bold tracking-tight text-white leading-tight">
                Execute the habit.
              </h4>
            </div>

            {/* Typewriter Copy */}
            <CardTypewriter
              text="You execute the tasks in front of you. As you work, Apple Intelligence reads your daily queue—if more tasks exist for that specific habit, it seamlessly surfaces them to keep you in a state of flow."
              active={activeStep === 3}
              accentColor="#30D158"
              keyPhrases={["Apple Intelligence", "daily queue", "specific habit", "state of flow"]}
            />

            {/* App Image Slot */}
            <div className="w-full aspect-[16/10] rounded-xl bg-black/90 border border-dashed border-zinc-800 flex items-center justify-center overflow-hidden relative shadow-inner">
              <span className="text-[7.5px] font-mono tracking-widest uppercase text-zinc-500">
                App Image
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
