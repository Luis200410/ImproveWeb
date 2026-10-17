"use client";

import React, { useState, useEffect, useRef, HTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Pause, Play, ArrowDown, ArrowRight, ExternalLink } from "lucide-react";

export interface GalleryItem {
  id?: string;
  common: string; // Main title (e.g., "01 · Neural Focus")
  binomial: string; // Subtitle / pillar / category (e.g., "Apple Intelligence • Deep Work")
  photo: {
    url: string;
    text: string;
    pos?: string;
    by: string;
  };
  content?: string; // Written section below the animation
  href?: string; // Direct link (e.g., "/blog/post-slug")
  badge?: string; // Optional custom badge (e.g., "3D Story", "Featured")
  ctaText?: string; // Custom CTA button label
}

interface CircularGalleryProps extends HTMLAttributes<HTMLDivElement> {
  items: GalleryItem[];
  radius?: number;
  autoRotateSpeed?: number;
  onItemSelect?: (item: GalleryItem, index: number) => void;
  onActiveIndexChange?: (index: number, item: GalleryItem) => void;
  activeIndex?: number;
  activeId?: string;
}

export const CircularGallery = React.forwardRef<HTMLDivElement, CircularGalleryProps>(
  (
    {
      items,
      className,
      radius: userRadius,
      autoRotateSpeed = 0.02,
      onItemSelect,
      onActiveIndexChange,
      activeIndex,
      activeId,
      ...props
    },
    ref
  ) => {
    const router = useRouter();
    const [rotation, setRotation] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartX = useRef(0);
    const dragStartRotation = useRef(0);
    const animationFrameRef = useRef<number | null>(null);
    const prevActiveIndexRef = useRef<number | undefined>(undefined);

    // Auto-calculate optimal 3D cylinder radius based on item count if not explicitly provided
    const radius = React.useMemo(() => {
      if (userRadius) return userRadius;
      const count = Math.max(items.length, 3);
      if (count <= 4) return 420;
      if (count <= 6) return 520;
      if (count <= 8) return 620;
      return 720;
    }, [userRadius, items.length]);

    // Ambient auto-rotation when not interacting (pauses when dragging or explicitly paused or only 1 item)
    useEffect(() => {
      if (items.length <= 1) return;

      const autoRotate = () => {
        if (!isPaused && !isDragging) {
          setRotation((prev) => prev + autoRotateSpeed);
        }
        animationFrameRef.current = requestAnimationFrame(autoRotate);
      };

      animationFrameRef.current = requestAnimationFrame(autoRotate);

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }, [isPaused, isDragging, autoRotateSpeed, items.length]);

    // Drag-to-rotate support
    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartRotation.current = rotation;
    };

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartX.current;
      setRotation(dragStartRotation.current + deltaX * 0.4);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Touch support for mobile devices
    const handleTouchStart = (e: React.TouchEvent) => {
      if (e.touches.length === 1) {
        setIsDragging(true);
        dragStartX.current = e.touches[0].clientX;
        dragStartRotation.current = rotation;
      }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - dragStartX.current;
      setRotation(dragStartRotation.current + deltaX * 0.4);
    };

    const anglePerItem = items.length > 0 ? 360 / items.length : 360;

    // Rotate directly to a target card
    const rotateToIndex = (index: number) => {
      const targetAngle = -index * anglePerItem;
      // Find shortest rotation path
      const currentNorm = rotation % 360;
      let diff = (targetAngle - currentNorm) % 360;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      setRotation(rotation + diff);
    };

    // Keep ref to latest onActiveIndexChange callback
    const onActiveIndexChangeRef = useRef(onActiveIndexChange);
    useEffect(() => {
      onActiveIndexChangeRef.current = onActiveIndexChange;
    });

    const lastReportedIndexRef = useRef<number>(-1);

    // Sync external activeIndex if controlled from parent
    useEffect(() => {
      if (
        typeof activeIndex === "number" &&
        activeIndex >= 0 &&
        activeIndex < items.length &&
        prevActiveIndexRef.current !== activeIndex
      ) {
        prevActiveIndexRef.current = activeIndex;
        lastReportedIndexRef.current = activeIndex;
        rotateToIndex(activeIndex);
      }
    }, [activeIndex, items.length]);

    // Calculate current front-most active item
    const currentActiveIndex = React.useMemo(() => {
      if (items.length === 0) return 0;
      const normalizedRotation = (-rotation % 360 + 360) % 360;
      return Math.round(normalizedRotation / anglePerItem) % items.length;
    }, [rotation, anglePerItem, items.length]);

    // Only fire onActiveIndexChange when the integer index actually changes
    useEffect(() => {
      if (
        items.length > 0 &&
        currentActiveIndex >= 0 &&
        currentActiveIndex < items.length &&
        lastReportedIndexRef.current !== currentActiveIndex
      ) {
        lastReportedIndexRef.current = currentActiveIndex;
        onActiveIndexChangeRef.current?.(currentActiveIndex, items[currentActiveIndex]);
      }
    }, [currentActiveIndex, items.length]);

    const handleCardClick = (item: GalleryItem, index: number, isFront: boolean) => {
      rotateToIndex(index);
      if (onItemSelect) {
        onItemSelect(item, index);
      }

      if (item.href) {
        // If it's already front or clicked in focus, navigate
        if (isFront) {
          router.push(item.href);
          return;
        }
      } else {
        // Smooth scroll to single active card section if available
        const element =
          document.getElementById("active-card-section") ||
          (item.id ? document.getElementById(`section-${item.id}`) : null);
        if (element && isFront) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    };

    if (!items || items.length === 0) {
      return null;
    }

    return (
      <div className="relative w-full py-4 select-none" style={{ fontFamily: "var(--font-ios)" }}>
        {/* Interactive 3D Stage */}
        <div
          ref={ref}
          role="region"
          aria-label="Circular 3D Gallery"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
          className={`relative w-full h-[500px] sm:h-[560px] md:h-[620px] flex items-center justify-center cursor-grab active:cursor-grabbing ${
            className || ""
          }`}
          style={{ perspective: "2200px" }}
          {...props}
        >
          <div
            className="relative w-full h-full will-change-transform"
            style={{
              transform: `rotateY(${rotation}deg)`,
              transformStyle: "preserve-3d",
              transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            {items.map((item, i) => {
              const itemAngle = i * anglePerItem;
              const totalRotation = rotation % 360;
              const relativeAngle = (itemAngle + totalRotation + 360) % 360;
              const normalizedAngle = Math.abs(
                relativeAngle > 180 ? 360 - relativeAngle : relativeAngle
              );
              // Front cards are crisp 100%, back cards fade to ~25% (if only 1 item, it's always 100% front)
              const opacity = items.length <= 1 ? 1 : Math.max(0.25, 1 - normalizedAngle / 150);
              const isFront = items.length <= 1 ? true : normalizedAngle < 40;

              return (
                <div
                  key={item.id || item.photo.url || i}
                  role="group"
                  aria-label={item.common}
                  onClick={() => handleCardClick(item, i, isFront)}
                  className="absolute w-[240px] sm:w-[280px] md:w-[320px] h-[340px] sm:h-[400px] md:h-[450px] cursor-pointer group transition-all duration-300"
                  style={{
                    transform: `rotateY(${itemAngle}deg) translateZ(${radius}px)`,
                    left: "50%",
                    top: "50%",
                    marginLeft: "-160px",
                    marginTop: "-225px",
                    opacity: opacity,
                  }}
                >
                  <div
                    className={`relative w-full h-full rounded-[28px] overflow-hidden shadow-2xl transition-all duration-500 border ${
                      isFront
                        ? "border-white/40 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.2)] scale-105"
                        : "border-white/10 opacity-80 group-hover:opacity-100 group-hover:scale-102"
                    } bg-black/60 backdrop-blur-xl`}
                  >
                    {/* Image */}
                    <img
                      src={item.photo.url}
                      alt={item.photo.text}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      style={{ objectPosition: item.photo.pos || "center" }}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none" />

                    {/* Top Pill / Badge */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md border border-white/20 text-white/90">
                          {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hidden sm:inline-block">
                            {item.badge}
                          </span>
                        )}
                      </div>

                      {isFront && (
                        item.href ? (
                          <span className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider bg-white text-black font-bold flex items-center gap-1 shadow-lg pointer-events-auto hover:bg-white/90 transition-all">
                            <span>{item.ctaText || "Read Report"}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold flex items-center gap-1">
                            <span>Focus</span>
                            <ArrowDown className="w-2.5 h-2.5" />
                          </span>
                        )
                      )}
                    </div>

                    {/* Bottom Metadata */}
                    <div className="absolute bottom-0 left-0 w-full p-5 sm:p-6 text-white space-y-1.5">
                      <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-white/60 font-semibold line-clamp-1">
                        {item.binomial}
                      </div>
                      <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight leading-tight line-clamp-2">
                        {item.common}
                      </h3>
                      <div className="flex items-center justify-between pt-1">
                        {item.photo.by && (
                          <p className="text-[10px] text-white/40 truncate max-w-[180px]">
                            Source: {item.photo.by}
                          </p>
                        )}
                        {item.href && isFront && (
                          <span className="text-[10px] font-mono uppercase tracking-wider text-white/70 flex items-center gap-1 group-hover:text-white">
                            <span>Open</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Controls Toolbar */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-3 pt-6 pb-2">
            {/* Previous Card */}
            <button
              type="button"
              onClick={() => setRotation((prev) => prev + anglePerItem)}
              aria-label="Previous card"
              className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Pause / Play Auto-Rotation */}
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? "Resume rotation" : "Pause rotation"}
              className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.12] text-xs text-white/80 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3" />}
              <span className="text-[11px] font-medium">{isPaused ? "Play" : "Pause"}</span>
            </button>

            {/* Next Card */}
            <button
              type="button"
              onClick={() => setRotation((prev) => prev - anglePerItem)}
              aria-label="Next card"
              className="w-9 h-9 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.12] text-white flex items-center justify-center transition-all cursor-pointer active:scale-95"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step Dots Indicator */}
        {items.length > 1 && (
          <div className="flex items-center justify-center gap-1.5 pt-2">
            {items.map((item, idx) => {
              const currentItemIdx =
                Math.round((-rotation / anglePerItem) % items.length + items.length) % items.length;
              const isCurrent = currentItemIdx === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => rotateToIndex(idx)}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    isCurrent
                      ? "w-7 h-1.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.7)]"
                      : "w-1.5 h-1.5 bg-white/20 hover:bg-white/50"
                  }`}
                  aria-label={`Go to card ${idx + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
    );
  }
);

CircularGallery.displayName = "CircularGallery";
