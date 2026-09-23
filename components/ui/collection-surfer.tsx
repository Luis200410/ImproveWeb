"use client";

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  MotionValue,
} from "framer-motion";

export interface CollectionItem {
  id: number;
  image: string;
  title: string;
  subtitle?: string;
  layerNumber?: string;
  badge?: string;
  features?: string[];
}

export type CollectionSurferVariant = "magnetic" | "uplift" | "simple";

// Default items representing the 5 Habit Execution Layers
export const HABIT_LAYERS_ITEMS: CollectionItem[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=2068&auto=format&fit=crop",
    title: "SET IT",
    subtitle: "Apple Calendar EventKit Sync • Drop habits onto a real daily timeline",
    layerNumber: "LAYER 01",
    badge: "Timeline Locking",
    features: ["Bi-directional Sync", "EventKit Native", "Zero Overlap"],
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop",
    title: "PROTECT IT",
    subtitle: "iOS System App Shield • Block distracting apps automatically",
    layerNumber: "LAYER 02",
    badge: "System Shield",
    features: ["Hardware Shield", "Deep Link Guard", "Distraction Zero"],
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=2070&auto=format&fit=crop",
    title: "SYNC IT",
    subtitle: "90-Min Ultradian Wave • Match task intensity to biological energy peaks",
    layerNumber: "LAYER 03",
    badge: "Ultradian Energy",
    features: ["Biological Rhythms", "Peak Energy Match", "-40% Burnout"],
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=2070&auto=format&fit=crop",
    title: "DO IT",
    subtitle: "Focus Timer & Live Write-Back • Zero-lag task checkpoints to Second Brain",
    layerNumber: "LAYER 04",
    badge: "Live Focus",
    features: ["15-Min Sprints", "Second Brain Sync", "Live Checkpoints"],
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=1973&auto=format&fit=crop",
    title: "REVIEW IT",
    subtitle: "On-Device AI Analytics • Daily streak & recovery telemetry",
    layerNumber: "LAYER 05",
    badge: "Private AI",
    features: ["On-Device ML", "Streak Analytics", "Recovery Telemetry"],
  },
];

interface CollectionSurferProps {
  items?: CollectionItem[];
  variant?: CollectionSurferVariant;
  headerKicker?: string;
  headerTitle?: string;
}

export function CollectionSurfer({
  items = HABIT_LAYERS_ITEMS,
  variant = "magnetic",
  headerKicker = "HABIT EXECUTION FRAMEWORK",
  headerTitle = "THE 5 LAYERS OF HABITS",
}: CollectionSurferProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Render exactly the 5 item cards (no duplication)
  const travelDistance = items.length - 1;

  // Track scroll progress within section container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const smoothScroll = useSpring(scrollYProgress, {
    mass: 0.1,
    stiffness: 100,
    damping: 20,
  });

  // Step vector for 3D layout (increased spacing & depth so content is spacious and readable)
  const stepX = 240;
  const stepY = -30;
  const stepZ = -160;

  const x = useTransform(
    smoothScroll,
    [0, 1],
    [0, -travelDistance * stepX]
  );
  const y = useTransform(
    smoothScroll,
    [0, 1],
    [0, -travelDistance * stepY]
  );
  const z = useTransform(
    smoothScroll,
    [0, 1],
    [0, -travelDistance * stepZ]
  );

  const mouseX = useMotionValue(-10000);
  const mouseY = useMotionValue(-10000);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (variant === "simple") return;
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const handleMouseLeave = () => {
    if (variant === "simple") return;
    mouseX.set(-10000);
    mouseY.set(-10000);
  };

  return (
    <div ref={containerRef} className="relative w-full h-[280vh] bg-[#07050A] text-white border-t border-zinc-900">
      {/* Sticky Viewport Container */}
      <div
        className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header Overlay - Positioned safely below top navigation bar */}
        <div className="absolute top-20 sm:top-24 lg:top-28 left-6 sm:left-12 lg:left-16 z-40 pointer-events-none space-y-2">
          <span className="inline-block kicker text-xs sm:text-sm font-bold text-[#FF02E8] tracking-widest uppercase">
            {headerKicker}
          </span>
          <h2 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl tracking-tight text-white uppercase leading-none">
            {headerTitle}
          </h2>
          <p className="text-xs sm:text-sm font-rounded text-zinc-400 max-w-md">
            1. Set It • 2. Protect It • 3. Sync It • 4. Do It • 5. Review It
          </p>
        </div>

        {/* Ambient Glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-[180px]"
          style={{ backgroundColor: "#FF02E8" }}
        />

        {/* 3D Scene Track */}
        <div
          className="absolute inset-0 flex items-center justify-center pt-20"
          style={{
            perspective: "2200px",
            perspectiveOrigin: "15% 45%",
          }}
        >
          <motion.div
            className="relative w-0 h-0"
            style={{
              x,
              y,
              z,
              transformStyle: "preserve-3d",
            }}
          >
            {items.map((item, i) => (
              <Card
                key={item.id}
                item={item}
                i={i}
                totalCount={items.length}
                stepX={stepX}
                stepY={stepY}
                stepZ={stepZ}
                mouseX={mouseX}
                mouseY={mouseY}
                scrollSpring={smoothScroll}
                variant={variant}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function Card({
  item,
  i,
  totalCount,
  stepX,
  stepY,
  stepZ,
  mouseX,
  mouseY,
  scrollSpring,
  variant,
}: {
  item: CollectionItem;
  i: number;
  totalCount: number;
  stepX: number;
  stepY: number;
  stepZ: number;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
  scrollSpring: MotionValue<number>;
  variant: CollectionSurferVariant;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform([mouseX, mouseY, scrollSpring], ([xVal, yVal]) => {
    if (!ref.current || variant === "simple") return 200;
    const xNum = Number(xVal);
    const yNum = Number(yVal);
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dist = Math.sqrt(Math.pow(xNum - centerX, 2) + Math.pow(yNum - centerY, 2));
    return dist;
  });

  const targetScale = useTransform(distance, [0, 400], [1.25, 1]);
  const springScale = useSpring(targetScale, {
    mass: 0.5,
    stiffness: 300,
    damping: 20,
  });

  const targetUplift = useTransform(distance, [0, 400], [-60, 0]);
  const springUplift = useSpring(targetUplift, {
    mass: 0.5,
    stiffness: 300,
    damping: 20,
  });

  const transform = useTransform([springScale, springUplift], ([s, u]) => {
    let scaleValue = 1;
    let upliftValue = 0;

    if (variant === "magnetic") {
      scaleValue = Number(s);
    } else if (variant === "uplift") {
      upliftValue = Number(u);
    }

    const baseX = i * stepX;
    const baseY = i * stepY;
    const baseZ = i * stepZ;

    // Softened rotateY to -18deg so card content faces the user directly
    return `translate3d(${baseX}px, ${baseY + upliftValue}px, ${baseZ}px) rotateY(-18deg) scale(${scaleValue})`;
  });

  const layerNum = item.layerNumber || `LAYER 0${i + 1}`;

  return (
    <motion.div
      ref={ref}
      className="absolute w-[320px] sm:w-[360px] md:w-[400px] h-[440px] sm:h-[480px] bg-neutral-950/95 rounded-2xl border border-zinc-800/90 overflow-hidden shadow-2xl transition-colors duration-500 ease-out group hover:border-[#FF02E8]/60"
      style={{
        transform,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Top Badges Header */}
      <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between">
        <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-zinc-700/80 shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#FF02E8] shadow-[0_0_8px_#FF02E8]" />
          <span className="text-white font-mono text-xs font-bold tracking-wider uppercase">
            {layerNum}
          </span>
        </div>
        {item.badge && (
          <span className="bg-[#FF02E8]/15 backdrop-blur-md px-3 py-1 rounded-full border border-[#FF02E8]/40 text-[#FF02E8] font-rounded text-[11px] font-bold tracking-wide uppercase">
            {item.badge}
          </span>
        )}
      </div>

      {/* Image with Dark Gradient Tint */}
      <div className="relative w-full h-[58%] brightness-90 group-hover:brightness-100 transition-all duration-300">
        <img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
      </div>

      {/* Bottom Content Area */}
      <div className="absolute bottom-0 inset-x-0 h-[46%] bg-neutral-950 p-5 sm:p-6 flex flex-col justify-between z-20 border-t border-zinc-800/60">
        <div className="space-y-1.5">
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-none group-hover:text-[#FF02E8] transition-colors uppercase">
            {item.title}
          </h3>
          {item.subtitle && (
            <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-snug">
              {item.subtitle}
            </p>
          )}
        </div>

        {/* Feature Pills */}
        {item.features && item.features.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {item.features.map((feat, fIdx) => (
              <span
                key={fIdx}
                className="text-[10px] sm:text-[11px] font-mono font-medium px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800"
              >
                {feat}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Subtle Ambient Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF02E8]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </motion.div>
  );
}

export default CollectionSurfer;
