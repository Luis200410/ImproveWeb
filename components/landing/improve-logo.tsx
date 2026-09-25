"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const LOGO_BARS = [
  { id: "red", color: "#cc0000", d: "M 211 751 L 286 751 L 286 80 L 211 80 Z", slug: "relationships-capital", name: "01 RELATIONSHIPS" },
  { id: "purple", color: "#6f1bd3", d: "M 299 564 L 374 564 L 374 322 L 299 322 Z", slug: "mind-emotions", name: "02 MIND" },
  { id: "magenta", color: "#ff02e8", d: "M 387 944 L 462 944 L 462 322 L 387 322 Z", slug: "execution-productivity", name: "03 PRODUCTIVITY" },
  { id: "blue", color: "#2254f5", d: "M 474 455 L 549 455 L 549 213 L 474 213 Z", slug: "professional-mastery", name: "04 WORK" },
  { id: "green", color: "#43b752", d: "M 561 501 L 636 501 L 636 259 L 561 259 Z", slug: "body-optimization", name: "05 BODY" },
  { id: "orange", color: "#ff6900", d: "M 649 671 L 724 671 L 724 322 L 649 322 Z", slug: "second-brain", name: "06 SECOND BRAIN" },
  { id: "yellow", color: "#efb219", d: "M 738 455 L 813 455 L 813 168 L 738 168 Z", slug: "money-wealth", name: "07 MONEY" },
];

export function AnimatedLogoSvg({
  className = "w-full h-full",
  triggerKey,
  startOffset = -500,
  duration,
  stagger = 0.05,
  startDelay = 0,
  stiffness = 280,
  damping = 20,
  viewBox = "0 0 1024 1024",
  interactive = false,
  onCloseMenu,
  onBarClick,
}: {
  className?: string;
  triggerKey?: string | number | boolean;
  startOffset?: number;
  duration?: number;
  stagger?: number;
  startDelay?: number;
  stiffness?: number;
  damping?: number;
  viewBox?: string;
  interactive?: boolean;
  onCloseMenu?: () => void;
  onBarClick?: (slug: string) => void;
}) {
  return (
    <svg
      key={triggerKey !== undefined ? String(triggerKey) : undefined}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {LOGO_BARS.map((bar, index) => {
        const isBarInteractive = interactive || Boolean(onCloseMenu) || Boolean(onBarClick);
        const pathElement = (
          <motion.path
            key={bar.id}
            fill={bar.color}
            fillRule="evenodd"
            stroke="none"
            d={bar.d}
            initial={{ y: startOffset, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            whileHover={
              isBarInteractive
                ? {
                    y: 24,
                    scaleY: 1.04,
                    filter: "brightness(1.35) drop-shadow(0 15px 25px rgba(255,255,255,0.25))",
                    transition: { duration: 0.25, ease: "easeOut" },
                  }
                : undefined
            }
            whileTap={isBarInteractive ? { scale: 0.95, y: 30 } : undefined}
            transition={
              duration !== undefined
                ? {
                    duration,
                    delay: startDelay + index * stagger,
                    ease: [0.16, 1, 0.3, 1],
                  }
                : {
                    type: "spring",
                    stiffness,
                    damping,
                    delay: startDelay + index * stagger,
                  }
            }
            className={isBarInteractive ? "cursor-pointer transition-colors" : ""}
          >
            <title>{bar.name}</title>
          </motion.path>
        );

        if (isBarInteractive) {
          return (
            <Link
              key={bar.id}
              href={`/apps/${bar.slug}`}
              onClick={() => {
                if (onCloseMenu) onCloseMenu();
                if (onBarClick) onBarClick(bar.slug);
              }}
              aria-label={bar.name}
            >
              {pathElement}
            </Link>
          );
        }

        return pathElement;
      })}
    </svg>
  );
}

interface ImproveLogoProps {
  className?: string;
  small?: boolean;
  hero?: boolean;
}

export function ImproveLogo({ className = "", small = false, hero = false }: ImproveLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className={`relative flex items-center justify-center select-none ${
        small ? 'h-10 w-10' : hero ? 'h-24 w-24' : 'h-16 w-16'
      }`}>
        <AnimatedLogoSvg />
      </div>
    </div>
  );
}
