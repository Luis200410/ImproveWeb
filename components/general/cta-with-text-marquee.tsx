"use client";

import { cn } from "@/lib/utils";
import { ReactNode, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Dock, DockIcon, DockItem, DockLabel } from '@/components/general/dock';

const dedicatedAppsData = [
  {
    title: "Body Optimization",
    iconSrc: "/Body Logo.svg",
    href: "/apps/body-optimization",
  },
  {
    title: "Second Brain",
    iconSrc: "/Second Brain Logo.svg",
    href: "/apps/second-brain",
  },
  {
    title: "Money & Wealth",
    iconSrc: "/money Logo.svg",
    href: "/apps/money-wealth",
  },
  {
    title: "Work Mastery",
    iconSrc: "/Work Logo.svg",
    href: "/apps/professional-mastery",
  },
  {
    title: "Productivity",
    iconSrc: "/Productivity Logo.svg",
    href: "/apps/productivity",
  },
  {
    title: "Relationships",
    iconSrc: "/RelationShips logo.svg",
    href: "/apps/relationships-capital",
  },
  {
    title: "Mind & Clarity",
    iconSrc: "/mind Logo.svg",
    href: "/apps/mind-emotions",
  },
  {
    title: "Legacy & Fun",
    iconSrc: "/logo.svg",
    href: "/apps/legacy-fun",
  },
];

interface VerticalMarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
  onItemsRef?: (items: HTMLElement[]) => void;
}

function VerticalMarquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 30,
  onItemsRef,
}: VerticalMarqueeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onItemsRef && containerRef.current) {
      const items = Array.from(
        containerRef.current.querySelectorAll(".marquee-item")
      ) as HTMLElement[];
      onItemsRef(items);
    }
  }, [onItemsRef, children]);

  return (
    <div
      ref={containerRef}
      className={cn("group flex flex-col overflow-hidden", className)}
      style={
        {
          "--duration": `${speed}s`,
        } as React.CSSProperties
      }
    >
      <div
        className={cn(
          "flex shrink-0 flex-col animate-marquee-vertical",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "flex shrink-0 flex-col animate-marquee-vertical",
          reverse && "[animation-direction:reverse]",
          pauseOnHover && "group-hover:[animation-play-state:paused]"
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

import type { AppIdentity } from "@/lib/apps-data";

type PlanType = "free" | "ecosystem";

interface PlanDetails {
  id: PlanType;
  name: string;
  badge: string;
  price: string;
  period: string;
  subtitle: string;
  buttonText: string;
  features: string[];
}

interface CTAWithVerticalMarqueeProps {
  app?: AppIdentity;
  accentColor?: string;
}

export default function CTAWithVerticalMarquee({
  app,
  accentColor,
}: CTAWithVerticalMarqueeProps = {}) {
  const brandColor = accentColor || app?.accentHex || "#FF02E8";

  const plans: Record<PlanType, PlanDetails> = {
    free: {
      id: "free",
      name: "Free Core System",
      badge: "Starter",
      price: "FREE",
      period: "forever",
      subtitle: "Essential daily task capture, habits, and focus timer. 100% private, on-device local storage.",
      buttonText: "START FREE CORE SYSTEM →",
      features: [
        "Essential Daily Task Capture",
        "Habit Tracking Basics",
        "Focused Timer & Pomodoro",
        "Apple Calendar Sync",
        "100% Offline Local Storage",
        "Zero Surveillance or Ads",
        "Interconnected Starter Bus",
      ],
    },
    ecosystem: {
      id: "ecosystem",
      name: "Complete Sovereign System",
      badge: "All 7 Pillars",
      price: "$40",
      period: "once for life",
      subtitle: "The complete unified operating system. All 7 pillars permanently interconnected — zero loose subscriptions.",
      buttonText: "OWN THE COMPLETE SYSTEM ($40) →",
      features: [
        "All 7 Interconnected Pillars",
        app ? `Full ${app.name} Native Access` : "Full Native System Engines",
        "Zero Monthly Subscription Rent",
        "0ms Local Relational Bus",
        "On-Device Apple Intelligence",
        "Bi-Directional Knowledge Graph",
        "Lifetime Engine Updates",
        "Family Sharing Included",
        "100% Permanent Data Sovereignty",
      ],
    },
  };
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);

  const planKeys = Object.keys(plans) as PlanType[];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + planKeys.length) % planKeys.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % planKeys.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
  };

  useEffect(() => {
    const marqueeContainer = marqueeRef.current;
    if (!marqueeContainer) return;

    const updateOpacity = () => {
      const items = marqueeContainer.querySelectorAll(".marquee-item");
      const containerRect = marqueeContainer.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemCenterY = itemRect.top + itemRect.height / 2;
        const distance = Math.abs(centerY - itemCenterY);
        const maxDistance = containerRect.height / 2;
        const normalizedDistance = Math.min(distance / maxDistance, 1);

        // Highlight middle item cleanly like screenshot
        const opacity = Math.max(0.2, 1 - normalizedDistance * 0.8);
        (item as HTMLElement).style.opacity = opacity.toString();

        if (normalizedDistance < 0.25) {
          (item as HTMLElement).classList.add("text-white", "font-medium", "scale-105");
          (item as HTMLElement).classList.remove("text-zinc-400", "font-light");
        } else {
          (item as HTMLElement).classList.add("text-zinc-400", "font-light");
          (item as HTMLElement).classList.remove("text-white", "font-medium", "scale-105");
        }
      });
    };

    const animationFrame = () => {
      updateOpacity();
      requestAnimationFrame(animationFrame);
    };

    const frame = requestAnimationFrame(animationFrame);

    return () => cancelAnimationFrame(frame);
  }, [activeIndex]);

  return (
    <div
      id="pricing"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[90vh] bg-transparent text-white flex flex-col items-center justify-between px-6 py-16 overflow-hidden border-t border-white/10 select-none scroll-mt-20"
    >
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-[180px] transition-all duration-700"
        style={{ backgroundColor: brandColor }}
      />

      {/* Main Carousel Container */}
      <div className="w-full max-w-7xl my-auto relative z-10">

        {/* View Slide Track */}
        <div className="relative overflow-hidden w-full">
          <div
            className="flex transition-transform duration-700 ease-in-out w-full"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {planKeys.map((key) => {
              const item = plans[key];
              return (
                <div
                  key={key}
                  className="w-full flex-shrink-0 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center min-w-full px-2"
                >
                  {/* Left Content Column */}
                  <div className="space-y-6 max-w-xl relative">

                    {/* Watermark in app brand color, tailored scaling per plan */}
                    <div className="relative pt-6 pb-2">
                      <div
                        className={cn(
                          "absolute z-0 select-none pointer-events-none font-black tracking-tighter leading-none opacity-100 transition-all duration-500 whitespace-nowrap origin-left",
                          item.id === "free"
                            ? "-top-14 sm:-top-22 md:-top-26 lg:-top-30 -left-1 text-[7rem] sm:text-[11rem] md:text-[14rem] lg:text-[16rem] scale-x-[1.14]"
                            : "-top-14 sm:-top-22 md:-top-26 lg:-top-30 -left-1 text-[7.3rem] sm:text-[11.1rem] md:text-[14.1rem] lg:text-[16.3rem] scale-x-[1.06]"
                        )}
                        style={{
                          color: brandColor,
                          textShadow: `0 0 16px ${brandColor}40`,
                        }}
                      >
                        {item.price}
                      </div>

                      {/* Foreground Title & Subtitle */}
                      <div className="relative z-10 pt-10 sm:pt-16 md:pt-20 lg:pt-22 space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[11px] font-mono text-zinc-300">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                          <span>{item.id === "free" ? "Free Core Foundation • 100% Offline" : "All 7 Pillars Unified • Zero Loose Subscriptions"}</span>
                        </div>

                        <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-none drop-shadow-md whitespace-nowrap">
                          {item.id === "free" ? "Start Free Core" : "Own The System"}
                        </h2>

                        <p className="text-sm md:text-base font-normal text-zinc-300 tracking-normal leading-relaxed pt-1">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Call to Action Button */}
                    <div className="pt-2 relative z-10">
                      <button
                        className="group relative px-7 py-3.5 rounded-full font-bold text-xs md:text-sm tracking-wider uppercase overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl flex items-center justify-center"
                        style={{
                          backgroundColor: brandColor,
                          color: "#FFFFFF",
                          boxShadow: `0 0 25px ${brandColor}60`,
                        }}
                      >
                        <span className="relative z-10 flex items-center space-x-2">
                          <span>{item.buttonText}</span>
                        </span>
                      </button>
                    </div>

                  </div>

                  {/* Right Marquee Column with Features (Left Aligned like reference image) */}
                  <div
                    ref={marqueeRef}
                    className="relative h-[440px] lg:h-[500px] flex items-center justify-start overflow-hidden pl-0 lg:pl-12"
                  >
                    <div className="relative w-full h-full pl-4 sm:pl-6">
                      <VerticalMarquee key={item.id} speed={20} className="h-full">
                        {item.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="text-2xl md:text-3xl lg:text-4xl tracking-tight py-4 text-left marquee-item transition-all duration-300 origin-left px-2"
                          >
                            <span>{feature}</span>
                          </div>
                        ))}
                      </VerticalMarquee>

                      {/* Top gradient vignette */}
                      <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/40 via-black/20 to-transparent z-10" />

                      {/* Bottom gradient vignette */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 via-black/20 to-transparent z-10" />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Bottom Carousel Controls & View Indicator Bar */}
      <div className="w-full max-w-sm mx-auto pt-6 pb-2 z-20 flex flex-col items-center space-y-4">
        {/* Interactive Plan Tabs */}
        <div className="grid grid-cols-2 gap-2 w-full bg-white/[0.03] backdrop-blur-[8px] p-1.5 rounded-xl border border-white/15 shadow-2xl">
          {planKeys.map((key, idx) => {
            const item = plans[key];
            const isActive = activeIndex === idx;
            return (
              <button
                key={key}
                onClick={() => setActiveIndex(idx)}
                className={cn(
                  "relative py-2.5 px-3 rounded-lg text-xs font-semibold transition-all duration-300 flex flex-col items-center justify-center space-y-0.5",
                  isActive
                    ? "bg-white/10 text-white shadow-lg border border-white/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <span>{item.name}</span>
                <span
                  className={cn(
                    "text-[10px] font-bold tracking-tight",
                    isActive ? "" : "text-zinc-500"
                  )}
                  style={{ color: isActive ? brandColor : undefined }}
                >
                  {item.price === "FREE" ? "Free Forever" : "$40 Once For Life"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}






