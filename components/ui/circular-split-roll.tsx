// Built using Hyperiux Vault: https://vault.hyperiux.com
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { APPS_DATA } from "@/lib/apps-data";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

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

const DESKTOP_WIDTH = 1200;
const TABLET_MIN_WIDTH = 768;

const LEFT_DEPTH_MAX = 30;
const RIGHT_DEPTH_MAX = 40;
const DEPTH_MIN = -1;
const DEPTH_MAX = 1;
const Z_INDEX_MIN = 1;

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

function wrapProgress(value: number) {
  let wrappedValue = value % 1;

  if (wrappedValue < 0) {
    wrappedValue += 1;
  }

  return wrappedValue;
}

function getCircularPosition(
  progress: number,
  radiusX: number,
  radiusY: number,
  angleOffset = 0
) {
  const angle = progress * Math.PI * 2 + angleOffset;

  return {
    angle,
    x: Math.sin(angle) * radiusX,
    y: Math.cos(angle) * radiusY,
    verticalDepth: Math.cos(angle),
    horizontalDepth: Math.sin(angle),
  };
}

function getStrength(value: number) {
  return gsap.utils.clamp(
    0,
    1,
    gsap.utils.mapRange(DEPTH_MIN, DEPTH_MAX, 0, 1, value)
  );
}

function shapeFocus(strength: number, start = 0.42, power = 2.8) {
  const normalized = gsap.utils.clamp(0, 1, (strength - start) / (1 - start));
  return Math.pow(normalized, power);
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

interface CircularSplitRollCompProps {
  /** Optional background override. Falls back to dark theme. */
  background?: string;
  /** Optional title color override. Falls back to text color. */
  titleColor?: string;
  sectionHeight?: number;
  leftRadiusX?: number;
  leftRadiusY?: number;
  rightRadiusX?: number;
  rightRadiusY?: number;
  imageCardWidth?: number;
  imageCardHeight?: number;
  titleSize?: string;
  pinSpacing?: boolean;
  scrub?: number;
  textCenterScale?: number;
  textSideScale?: number;
  textCenterOpacity?: number;
  textSideOpacity?: number;
  imageCenterScale?: number;
  imageSideScale?: number;
  imageCenterOpacity?: number;
  imageSideOpacity?: number;
  textFocusStart?: number;
  textFocusPower?: number;
  imageFocusStart?: number;
  imageFocusPower?: number;
  leftAngleOffset?: number;
  rightAngleOffset?: number;
  focusPhase?: number;
  leftDepthMax?: number;
  rightDepthMax?: number;
  columnSpreadVw?: number;
  columnOffsetPx?: number;
  gridImageClassName?: string;
  gridCardClassName?: string;
  gridTitleClassName?: string;
  items?: CircularSplitRollItem[];
  className?: string;
}

function CircularSplitRollComp({
  items = defaultItems,
  className = "",
  background = "var(--bg)",
  titleColor = "var(--label)",
  sectionHeight = 260,

  leftRadiusX = 220,
  leftRadiusY = 220,
  rightRadiusX = 400,
  rightRadiusY = 400,

  imageCardWidth = 240,
  imageCardHeight = 260,
  titleSize = "clamp(24px, 2.5vw, 48px)",

  pinSpacing = true,
  scrub = 1.2,

  textCenterScale = 1,
  textSideScale = 0.68,
  textCenterOpacity = 1,
  textSideOpacity = 0.18,

  imageCenterScale = 1,
  imageSideScale = 0.58,
  imageCenterOpacity = 1,
  imageSideOpacity = 0.14,

  textFocusStart = 0.42,
  textFocusPower = 2.6,
  imageFocusStart = 0.45,
  imageFocusPower = 3.2,

  leftAngleOffset = Math.PI,
  rightAngleOffset = 0,
  focusPhase = 6,
  leftDepthMax = 30,
  rightDepthMax = 40,
  columnSpreadVw = 5,
  columnOffsetPx = 500,

  gridImageClassName = "",
  gridCardClassName = "",
  gridTitleClassName = "",
}: CircularSplitRollCompProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);
  const progressRef = useRef(0);
  const reducedMotion = usePrefersReducedMotion();

  const safeItems = useMemo(() => {
    return items.map((item, index) => {
      const fallbackApp = APPS_DATA[index % APPS_DATA.length];
      return {
        id: item.id ?? index,
        slug: item.slug ?? fallbackApp?.slug ?? "execution-productivity",
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

  useEffect(() => {
    if (!rootRef.current || !stickyRef.current) return;

    const mm = gsap.matchMedia();

    mm.add("(min-width: 769px)", () => {
      const ctx = gsap.context(() => {
        const leftNodes = gsap.utils.toArray(
          ".circular-scroll-showcase__left-item"
        ) as HTMLElement[];
        const rightNodes = gsap.utils.toArray(
          ".circular-scroll-showcase__right-item"
        ) as HTMLElement[];

        const total = safeItems.length;

        if (!total) return;

        gsap.set([...leftNodes, ...rightNodes], { opacity: 1 });

        const render = (scrollProgress: number) => {
          progressRef.current = scrollProgress;

          const width =
            typeof window !== "undefined" ? window.innerWidth : DESKTOP_WIDTH;

          let factor = 1;

          if (width < DESKTOP_WIDTH && width >= TABLET_MIN_WIDTH) {
            factor = width / DESKTOP_WIDTH;
          }

          const leftRadiusScaledX = leftRadiusX * factor;
          const leftRadiusScaledY = leftRadiusY * factor;
          const rightRadiusScaledX = rightRadiusX * factor;
          const rightRadiusScaledY = rightRadiusY * factor;

          if (rootRef.current) {
            rootRef.current.style.setProperty(
              "--css-card-width",
              `${imageCardWidth * factor}px`
            );

            rootRef.current.style.setProperty(
              "--css-card-height",
              `${imageCardHeight * factor}px`
            );
          }

          leftNodes.forEach((node, index) => {
            const localProgress = wrapProgress(
              (index - scrollProgress * (total - 1) + focusPhase) / total
            );

            const position = getCircularPosition(
              localProgress,
              leftRadiusScaledX,
              leftRadiusScaledY,
              leftAngleOffset
            );

            const rawStrength = getStrength(position.horizontalDepth);
            const focusStrength = shapeFocus(
              rawStrength,
              textFocusStart,
              textFocusPower
            );

            const scale = gsap.utils.interpolate(
              textSideScale,
              textCenterScale,
              focusStrength
            );

            const opacity = gsap.utils.interpolate(
              textSideOpacity,
              textCenterOpacity,
              focusStrength
            );

            const zIndex = Math.round(
              gsap.utils.interpolate(Z_INDEX_MIN, leftDepthMax, focusStrength)
            );

            gsap.set(node, {
              x: position.x,
              y: position.y,
              scale,
              opacity,
              zIndex,
              transformOrigin: "50% 50%",
            });
          });

          rightNodes.forEach((node, index) => {
            const localProgress = wrapProgress(
              (index - scrollProgress * (total - 1) + focusPhase) / total
            );

            const position = getCircularPosition(
              localProgress,
              rightRadiusScaledX,
              rightRadiusScaledY,
              rightAngleOffset
            );

            const rawStrength = getStrength(-position.horizontalDepth);
            const focusStrength = shapeFocus(
              rawStrength,
              imageFocusStart,
              imageFocusPower
            );

            const scale = gsap.utils.interpolate(
              imageSideScale,
              imageCenterScale,
              focusStrength
            );

            const opacity = gsap.utils.interpolate(
              imageSideOpacity,
              imageCenterOpacity,
              focusStrength
            );

            const zIndex = Math.round(
              gsap.utils.interpolate(Z_INDEX_MIN, rightDepthMax, focusStrength)
            );

            gsap.set(node, {
              x: position.x,
              y: position.y,
              scale,
              opacity,
              zIndex,
              transformOrigin: "50% 50%",
            });
          });
        };

        render(0);

        const scrollTrigger = ScrollTrigger.create({
          trigger: rootRef.current,
          start: "top top",
          end: `+=${sectionHeight}%`,
          pin: stickyRef.current,
          scrub,
          pinSpacing,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            render(self.progress);
          },
        });

        const onResize = () => {
          render(progressRef.current);
          scrollTrigger.refresh();
        };

        window.addEventListener("resize", onResize);

        return () => {
          window.removeEventListener("resize", onResize);
          scrollTrigger.kill();
        };
      }, rootRef);

      return () => ctx.revert();
    });

    return () => mm.revert();
  }, [
    safeItems,
    scrub,
    pinSpacing,
    sectionHeight,
    leftRadiusX,
    leftRadiusY,
    rightRadiusX,
    rightRadiusY,
    imageCardWidth,
    imageCardHeight,
    textCenterScale,
    textSideScale,
    textCenterOpacity,
    textSideOpacity,
    imageCenterScale,
    imageSideScale,
    imageCenterOpacity,
    imageSideOpacity,
    textFocusStart,
    textFocusPower,
    imageFocusStart,
    imageFocusPower,
    leftAngleOffset,
    rightAngleOffset,
    focusPhase,
    leftDepthMax,
    rightDepthMax,
  ]);

  return (
    <section
      ref={rootRef}
      className={`relative min-h-screen w-full overflow-clip ${className}`}
      style={{
        "--css-title-size": titleSize,
        "--css-card-width": `${imageCardWidth}px`,
        "--css-card-height": `${imageCardHeight}px`,
        background,
        color: titleColor,
      } as React.CSSProperties}
    >
      {/* 3D Roll Carousel Section */}
      <div
        ref={stickyRef}
        aria-hidden="false"
        className={`relative h-screen w-full overflow-hidden ${reducedMotion ? "hidden" : "max-[1025px]:hidden"}`}
      >
        <div className="relative mx-auto flex h-full w-full">
          {/* Left Titles Roll */}
          <div
            className="relative flex h-full w-[50vw] items-center justify-center"
            style={{ transform: `translateX(calc(${columnSpreadVw}vw - ${columnOffsetPx}px))` }}
          >
            <div className="relative h-[78vh]">
              {safeItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/apps/${item.slug}`}
                  className="circular-scroll-showcase__left-item pointer-events-auto absolute left-1/2 top-1/2 w-full origin-center whitespace-nowrap text-center text-(length:--css-title-size,clamp(24px,2.5vw,48px)) font-black uppercase leading-none tracking-tight opacity-0 will-change-[transform,opacity] transition-colors cursor-pointer group"
                >
                  <span
                    className="text-xs font-mono font-bold mr-3 align-middle transition-colors"
                    style={{ color: item.accentHex }}
                  >
                    {item.number}
                  </span>
                  <span
                    className="transition-colors group-hover:text-[var(--hover-accent)]"
                    style={{ "--hover-accent": item.accentHex } as React.CSSProperties}
                  >
                    {item.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Image Cards Roll */}
          <div
            className="relative flex h-full w-[50vw] items-center justify-center"
            style={{ transform: `translateX(calc(${columnOffsetPx}px - ${columnSpreadVw}vw))` }}
          >
            <div className="relative h-[78vh]">
              {safeItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/apps/${item.slug}`}
                  className="circular-scroll-showcase__right-item pointer-events-auto absolute left-1/2 top-1/2 ml-[calc(var(--css-card-width,240px)*-0.5)] mt-[calc(var(--css-card-height,260px)*-0.5)] h-(--css-card-height,260px) w-(--css-card-width,240px) origin-center opacity-0 will-change-[transform,opacity] cursor-pointer group"
                >
                  <div
                    className="relative h-full w-full overflow-hidden rounded-[24px] bg-[#0c0a14] border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.8),0_8px_20px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-all duration-300 flex items-center justify-center p-4"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = item.accentHex;
                      e.currentTarget.style.boxShadow = `0 0 35px ${item.accentHex}66, 0 30px 60px rgba(0,0,0,0.9)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                      e.currentTarget.style.boxShadow = "0 30px 60px rgba(0,0,0,0.8), 0 8px 20px rgba(0,0,0,0.5)";
                    }}
                  >
                    <img
                      src={item.logoUrl}
                      alt={item.alt}
                      className="pointer-events-none block h-full w-full select-none object-contain transition-transform duration-300 group-hover:scale-105"
                      draggable="false"
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Fallback Grid View for Mobile/Small Displays */}
      <div className={`w-full px-5 py-16 max-md:px-4 max-md:py-12 ${reducedMotion ? "block" : "sr-only max-[1025px]:not-sr-only max-[1025px]:block"}`}>
        <div className="max-w-4xl mx-auto text-center space-y-4 mb-10">
          <span className="kicker text-[#FF02E8]">Ecosystem Selector</span>
          <h2 className="title-huge text-3xl sm:text-5xl font-black uppercase text-white">The 8 Integrated Applications</h2>
        </div>
        <div className="mx-auto grid w-full max-w-5xl grid-cols-2 sm:grid-cols-4 gap-5 max-md:gap-4">
          {safeItems.map((item) => (
            <Link
              key={item.id}
              href={`/apps/${item.slug}`}
              className={`w-full group cursor-pointer ${gridCardClassName}`}
            >
              <div
                className={`relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#0c0a14] border border-white/15 p-4 flex items-center justify-center shadow-xl transition-all duration-300 ${gridImageClassName}`}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.accentHex;
                  e.currentTarget.style.boxShadow = `0 0 25px ${item.accentHex}66`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <img
                  src={item.logoUrl}
                  alt={item.alt}
                  className="block h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
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

export interface CircularSplitRollProps
  extends Omit<
    CircularSplitRollCompProps,
    "leftRadiusX" | "leftRadiusY" | "rightRadiusX" | "rightRadiusY" | "imageCardWidth" | "imageCardHeight"
  > {
  radius?: number;
  cardSize?: number;
  leftRadiusX?: number;
  leftRadiusY?: number;
  rightRadiusX?: number;
  rightRadiusY?: number;
  imageCardWidth?: number;
  imageCardHeight?: number;
}

export default function CircularSplitRoll({
  items = defaultItems,
  radius = 500,
  cardSize = 240,
  sectionHeight = 450,
  scrub = 1.5,
  leftRadiusX,
  leftRadiusY,
  rightRadiusX,
  rightRadiusY,
  imageCardWidth,
  imageCardHeight,
  ...rest
}: CircularSplitRollProps) {
  return (
    <CircularSplitRollComp
      items={items}
      sectionHeight={sectionHeight}
      scrub={scrub}
      leftRadiusX={leftRadiusX ?? radius}
      leftRadiusY={leftRadiusY ?? radius}
      rightRadiusX={rightRadiusX ?? radius}
      rightRadiusY={rightRadiusY ?? radius}
      imageCardWidth={imageCardWidth ?? cardSize}
      imageCardHeight={imageCardHeight ?? (cardSize + 20)}
      {...rest}
    />
  );
}
