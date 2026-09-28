// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APPS_DATA } from "@/lib/apps-data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// 7 brand ecosystem colors corresponding to I-M-P-R-O-V-E
export const IMPROVE_LETTERS = [
  { letter: "I", color: "#cc0000", name: "Relationships" },
  { letter: "M", color: "#6f1bd3", name: "Mind" },
  { letter: "P", color: "#ff02e8", name: "Productivity" },
  { letter: "R", color: "#2254f5", name: "Work" },
  { letter: "O", color: "#43b752", name: "Body" },
  { letter: "V", color: "#ff6900", name: "Second Brain" },
  { letter: "E", color: "#efb219", name: "Money" },
];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

/**
 * Typewriter tagline component that animates character-by-character
 * when the corresponding app becomes active in the scroll showcase.
 */
function TypewriterTagline({
  text,
  active,
  accentColor = "#FF02E8",
}: {
  text: string;
  active: boolean;
  accentColor?: string;
}) {
  const [displayText, setDisplayText] = useState("");

  useEffect(() => {
    if (!active || !text) {
      setDisplayText("");
      return;
    }

    setDisplayText("");
    let currentIdx = 0;
    const speed = 22; // ms per character

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx <= text.length) {
        setDisplayText(text.slice(0, currentIdx));
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, active]);

  if (!active || !text) return null;

  return (
    <div className="mt-4 flex items-center justify-center min-h-[2em] max-w-md mx-auto">
      <p className="text-xs sm:text-sm md:text-base font-mono font-medium tracking-normal text-white/80 select-text">
        {displayText}
        <span
          className="inline-block w-[3px] h-[1em] ml-1.5 animate-pulse align-middle"
          style={{ backgroundColor: accentColor }}
        />
      </p>
    </div>
  );
}

export interface CircularSplitRollItem {
  id?: string | number;
  slug?: string;
  title?: string;
  number?: string;
  tagline?: string;
  logoUrl?: string;
  accentHex?: string;
  image?: string;
  alt?: string;
}

const defaultItems: CircularSplitRollItem[] = APPS_DATA.map((app) => ({
  id: app.id,
  slug: app.slug,
  title: app.singleWord,
  number: app.number,
  tagline: app.tagline,
  logoUrl: app.logoUrl,
  accentHex: app.accentHex,
  image: app.imageUrl,
  alt: app.name,
}));

export interface CircularSplitRollProps {
  items?: CircularSplitRollItem[];
  sectionHeight?: number; // % of viewport height to pin (default 380)
  scrub?: number | boolean; // scrub damping (default 0.9)
  cardWidth?: number;
  cardHeight?: number;
  className?: string;
  onActiveChange?: (index: number, isRolling: boolean) => void;
}

export default function CircularSplitRoll({
  items = defaultItems,
  sectionHeight = 380,
  scrub = 0.9,
  cardWidth = 210,
  cardHeight = 230,
  className = "",
  onActiveChange,
}: CircularSplitRollProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRollActive, setIsRollActive] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  const onActiveChangeRef = useRef(onActiveChange);
  useEffect(() => {
    onActiveChangeRef.current = onActiveChange;
  });

  const safeItems = useMemo(() => {
    return items.map((item, index) => {
      const fallbackApp = APPS_DATA[index % APPS_DATA.length];
      return {
        id: item.id ?? index,
        slug: item.slug ?? fallbackApp?.slug ?? "productivity",
        title: item.title ?? fallbackApp?.singleWord ?? `Item ${index + 1}`,
        number: item.number ?? `0${index + 1}`,
        tagline: item.tagline ?? fallbackApp?.tagline ?? "",
        logoUrl: item.logoUrl ?? fallbackApp?.logoUrl ?? "/logo.svg",
        accentHex: item.accentHex ?? fallbackApp?.accentHex ?? "#FF02E8",
        image: item.image ?? fallbackApp?.imageUrl ?? "",
        alt: item.alt ?? item.title ?? `Item ${index + 1}`,
      };
    });
  }, [items]);

  const total = safeItems.length;

  // Jump to specific app when dot indicator is clicked
  const scrollToItem = useCallback(
    (index: number) => {
      if (!scrollTriggerRef.current || total <= 1) return;
      const st = scrollTriggerRef.current;
      const targetProgress = index / (total - 1);
      const scrollPos = st.start + targetProgress * (st.end - st.start);
      window.scrollTo({ top: scrollPos, behavior: "smooth" });
    },
    [total]
  );

  useEffect(() => {
    if (!rootRef.current || !stickyRef.current || total === 0) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 640px)", () => {
      const ctx = gsap.context(() => {
        const leftNodes = gsap.utils.toArray(
          ".circular-scroll-showcase__left-item"
        ) as HTMLElement[];
        const rightNodes = gsap.utils.toArray(
          ".circular-scroll-showcase__right-item"
        ) as HTMLElement[];

        gsap.set([...leftNodes, ...rightNodes], { opacity: 1 });

        // Expanded vertical spacing so central position has generous breathing room from top and bottom
        const radiusY = Math.min(Math.max(window.innerHeight * 0.35, 205), 255);
        // Dynamic horizontal arc: items curve in from the sides into center stage
        const arcX = Math.min(window.innerWidth * 0.11, 130);

        const currentActiveIndexRef = { current: 0 };

        /**
         * Render wheel at given progress (0.0 to 1.0)
         * At progress = 0: Item 0 (01 RELATIONSHIPS) is centered
         * At progress = 1: Item 6 (07 MONEY) is centered
         */
        const render = (progress: number, isAct = false) => {
          const clampedProgress = gsap.utils.clamp(0, 1, progress);
          const currentVirtualIndex = clampedProgress * (total - 1);
          const nearestIndex = Math.round(currentVirtualIndex);
          currentActiveIndexRef.current = nearestIndex;
          setActiveIndex(nearestIndex);
          onActiveChangeRef.current?.(nearestIndex, isAct);

          // Update Left Column (BIIIIIIG Titles - Coming from top-left, centering, exiting to bottom-left)
          leftNodes.forEach((node, index) => {
            const diff = index - currentVirtualIndex;

            // Wrap around wheel for items beyond range
            let wrappedDiff = diff % total;
            if (wrappedDiff > total / 2) wrappedDiff -= total;
            if (wrappedDiff < -total / 2) wrappedDiff += total;

            const angle = (wrappedDiff / total) * Math.PI * 2;
            const y = Math.sin(angle) * radiusY;
            const depth = Math.cos(angle); // 1.0 = center front, 0 = 90deg side, <0 = back

            const isVisible = depth > -0.15;
            const focus = Math.max(0, depth);
            const scale = gsap.utils.interpolate(0.66, 1.0, Math.pow(focus, 1.8));
            const opacity = isVisible
              ? gsap.utils.interpolate(0.08, 1.0, Math.pow(focus, 2.4))
              : 0;
            // Arcs from top-left into center, and curves back out to bottom-left (horizontally straight)
            const x = - Math.pow(1 - focus, 0.82) * arcX * 1.85;
            const zIndex = Math.round(depth * 50 + 50);

            gsap.set(node, {
              xPercent: -50,
              yPercent: -50,
              x,
              y,
              scale,
              opacity,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              zIndex,
              pointerEvents: isVisible && focus > 0.6 ? "auto" : "none",
            });
          });

          // Update Right Column (Cards - Coming from top-right, centering, exiting to bottom-right, horizontally straight)
          rightNodes.forEach((node, index) => {
            const diff = index - currentVirtualIndex;

            let wrappedDiff = diff % total;
            if (wrappedDiff > total / 2) wrappedDiff -= total;
            if (wrappedDiff < -total / 2) wrappedDiff += total;

            const angle = (wrappedDiff / total) * Math.PI * 2;
            const y = Math.sin(angle) * radiusY;
            const depth = Math.cos(angle);

            const isVisible = depth > -0.15;
            const focus = Math.max(0, depth);
            const scale = gsap.utils.interpolate(0.64, 1.0, Math.pow(focus, 1.7));
            const opacity = isVisible
              ? gsap.utils.interpolate(0.06, 1.0, Math.pow(focus, 2.2))
              : 0;
            // Arcs from top-right into center, and curves back out to bottom-right (horizontally straight)
            const x = Math.pow(1 - focus, 0.82) * arcX * 1.7;
            const zIndex = Math.round(depth * 50 + 50);

            gsap.set(node, {
              xPercent: -50,
              yPercent: -50,
              x,
              y,
              scale,
              opacity,
              rotateZ: 0,
              rotateX: 0,
              rotateY: 0,
              zIndex,
              pointerEvents: isVisible && focus > 0.6 ? "auto" : "none",
            });

            // Active card glow enhancement
            const cardInner = node.querySelector(".card-inner-box") as HTMLElement | null;
            if (cardInner) {
              const item = safeItems[index];
              if (focus > 0.85) {
                cardInner.style.borderColor = `${item.accentHex}dd`;
                cardInner.style.boxShadow = `0 0 35px ${item.accentHex}55, 0 16px 36px rgba(0,0,0,0.85)`;
              } else {
                cardInner.style.borderColor = "rgba(255, 255, 255, 0.12)";
                cardInner.style.boxShadow = "0 8px 20px rgba(0,0,0,0.5)";
              }
            }
          });
        };

        // Initial render at item 0 (Relationships centered)
        render(0);

        // Native smooth ScrollTrigger with continuous scrub without snap fighting
        const st = ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: `+=${sectionHeight}%`,
          pin: stickyRef.current,
          pinSpacing: true,
          scrub: typeof scrub === "number" ? scrub : 0.8,
          invalidateOnRefresh: true,
          onToggle: (self) => {
            const isAct = self.isActive;
            setIsRollActive(isAct);
            onActiveChangeRef.current?.(currentActiveIndexRef.current, isAct);
          },
          onUpdate: (self) => {
            const isAct = self.isActive;
            setIsRollActive(isAct);
            render(self.progress, isAct);
          },
        });

        scrollTriggerRef.current = st;

        const onResize = () => {
          if (st) {
            render(st.progress);
            st.refresh();
          }
        };

        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          st.kill();
          scrollTriggerRef.current = null;
        };
      }, rootRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [safeItems, total, sectionHeight, scrub]);

  return (
    <section
      ref={rootRef}
      className={`relative min-h-screen w-full select-none overflow-hidden ${className}`}
      style={{
        "--css-card-width": `${cardWidth}px`,
        "--css-card-height": `${cardHeight}px`,
      } as React.CSSProperties}
    >
      {/* 3D Roll Carousel Section for Desktop / Tablet */}
      <div
        ref={stickyRef}
        className={`relative h-screen w-full overflow-hidden flex flex-col justify-between items-center ${
          reducedMotion ? "hidden" : "max-sm:hidden"
        }`}
      >
        {/* Spacious Two-Column Showcase - Perfectly sized to fit in ONE frame */}
        <div className="relative mx-auto flex h-full w-full max-w-[94vw] 2xl:max-w-[1440px] items-center justify-between px-6 sm:px-12 pt-26 pb-8">
          {/* Left Column: BIIIIIIG App Titles with Typewriter Taglines */}
          <div className="relative flex h-full w-[48%] items-center justify-center">
            <div className="relative h-[65vh] w-full flex items-center justify-center">
              {safeItems.map((item, idx) => (
                <Link
                  key={item.id}
                  href={`/apps/${item.slug}`}
                  className="circular-scroll-showcase__left-item absolute left-1/2 top-1/2 w-full origin-center whitespace-nowrap text-center will-change-[transform,opacity] transition-colors cursor-pointer group"
                >
                  {/* App Title - Perfectly scaled */}
                  <div className="flex items-center justify-center gap-2.5 sm:gap-3">
                    <span
                      className="text-xs sm:text-sm md:text-base font-mono font-bold align-middle transition-colors"
                      style={{ color: item.accentHex }}
                    >
                      {item.number}
                    </span>
                    <span
                      className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black uppercase tracking-tight transition-colors group-hover:text-[var(--hover-accent)]"
                      style={
                        {
                          "--hover-accent": item.accentHex,
                          color: idx === activeIndex ? "#FFFFFF" : undefined,
                        } as React.CSSProperties
                      }
                    >
                      {item.title}
                    </span>
                  </div>

                  {/* Letters below title with Typewriter animation */}
                  <TypewriterTagline
                    text={item.tagline}
                    active={idx === activeIndex}
                    accentColor={item.accentHex}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Right Column: Cards with LITERALLY JUST THE LOGO IMAGE (smaller to fit in one frame) */}
          <div className="relative flex h-full w-[48%] items-center justify-center">
            <div className="relative h-[65vh] w-full flex items-center justify-center">
              {safeItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/apps/${item.slug}`}
                  className="circular-scroll-showcase__right-item absolute left-1/2 top-1/2 h-(--css-card-height,230px) w-(--css-card-width,210px) origin-center will-change-[transform,opacity] cursor-pointer group"
                >
                  {/* Clean Container: LITERALLY JUST THE IMAGE */}
                  <div
                    className="card-inner-box relative h-full w-full overflow-hidden rounded-[24px] bg-[#0c0a14]/95 border border-white/15 shadow-[0_16px_36px_rgba(0,0,0,0.6)] backdrop-blur-2xl group-hover:scale-105 transition-all duration-300 flex items-center justify-center p-6"
                  >
                    <img
                      src={item.logoUrl}
                      alt={item.alt}
                      className="pointer-events-none block max-h-[75%] max-w-[75%] select-none object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]"
                      draggable="false"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Step Dots Indicator (Bottom Center) */}
        <div className="absolute bottom-4 sm:bottom-5 left-0 right-0 z-30 flex justify-center items-center gap-2.5">
          {safeItems.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                onClick={() => scrollToItem(idx)}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? "w-8 h-2 opacity-100 shadow-[0_0_12px_currentColor]"
                    : "w-2 h-2 opacity-30 hover:opacity-70 bg-white"
                }`}
                style={{
                  backgroundColor: isActive ? item.accentHex : undefined,
                  color: isActive ? item.accentHex : undefined,
                }}
                aria-label={`Jump to ${item.title}`}
              />
            );
          })}
        </div>
      </div>

      {/* Responsive Grid View for Mobile / Small Displays */}
      <div
        className={`w-full px-5 py-12 max-sm:px-4 max-sm:py-8 ${
          reducedMotion ? "block" : "hidden max-sm:block"
        }`}
      >

        <div className="mx-auto grid w-full max-w-md grid-cols-1 sm:grid-cols-2 gap-4">
          {safeItems.map((item) => (
            <Link
              key={item.id}
              href={`/apps/${item.slug}`}
              className="w-full group cursor-pointer"
            >
              <div
                className="relative aspect-[16/9] w-full overflow-hidden rounded-[20px] bg-[#0c0a14] border border-white/15 p-4 flex items-center justify-center shadow-xl transition-all duration-300 hover:border-white/40"
                style={{
                  boxShadow: `0 0 0 1px ${item.accentHex}22`,
                }}
              >
                <img
                  src={item.logoUrl}
                  alt={item.alt}
                  className="block h-full max-h-14 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                  draggable="false"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
