'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { getAppBySlug } from '@/lib/apps-data';

// ═════════════════════════════════════════════════════════════════════════
// 7 BRAND ECOSYSTEM PILLAR COLORS (MATCHING IMPROVE RECTANGULAR LOGO)
// ═════════════════════════════════════════════════════════════════════════
export const LOGO_PILLAR_COLORS = [
  '#CC0000', // 01 Relationships (Crimson)
  '#6F1BD3', // 02 Mind (Purple)
  '#FF02E8', // 03 Productivity (Electric Magenta)
  '#2254F5', // 04 Work (Electric Blue)
  '#43B752', // 05 Body (Emerald Green)
  '#FF6900', // 06 Second Brain (Amber Orange)
  '#EFB219', // 07 Wealth (Radiant Gold)
];

export interface CircuitBackgroundProps {
  /** Explicit mode override: 'landing' (multi-color) | 'app' (monochrome) | 'auto' */
  mode?: 'landing' | 'app' | 'auto';
  /** Custom single color for app pages (e.g. '#FF02E8') */
  appColor?: string;
  /** Custom list of colors for multi-color mode */
  multiColors?: string[];
  /** Bar thickness in px (default 24px, matching logo bar proportions) */
  barThickness?: number;
  /** Opacity multiplier of the background (0.0 to 1.0, default 1.0) */
  opacity?: number;
  /** Total number of folding bars on screen (default: 18 on landing, 12 on app pages) */
  snakeCount?: number;
  /** Custom className */
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

interface FoldingBar {
  id: number;
  color: string;
  // Ordered polyline: points[0] is tail, points[points.length - 1] is head
  points: Point[];
  direction: { dx: number; dy: number }; // Strictly orthogonal: (1,0), (-1,0), (0,1), (0,-1)
  speed: number;                        // px per second
  thickness: number;                    // Width of this bar
  targetLength: number;                 // Total length of the bar in px
  currentLength: number;                // Current length (grows on entrance)
  distanceSinceTurn: number;            // px traveled since last 90° fold
  minStraightDist: number;              // px to travel before allowing next fold
  spawnDelay: number;                   // Staggered entrance delay
  active: boolean;
  opacity: number;
  fadingOut: boolean;
  age: number;
  lifespan: number;
}

export function CircuitBackground({
  mode = 'auto',
  appColor,
  multiColors = LOGO_PILLAR_COLORS,
  barThickness = 24,
  opacity = 1.0,
  snakeCount,
  className = '',
}: CircuitBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pathname = usePathname();

  // Determine active brand colors based on route or props
  const activeTheming = useMemo(() => {
    let resolvedMode = mode;
    if (resolvedMode === 'auto') {
      if (!pathname || pathname === '/' || pathname === '') {
        resolvedMode = 'landing';
      } else if (pathname.startsWith('/apps/')) {
        resolvedMode = 'app';
      } else {
        resolvedMode = 'landing';
      }
    }

    if (resolvedMode === 'landing') {
      return {
        isLanding: true,
        colors: multiColors,
        primaryColor: multiColors[2],
      };
    }

    // App mode: resolve single color for the specific app
    let singleColor = appColor;
    if (!singleColor && pathname?.startsWith('/apps/')) {
      const slug = pathname.split('/')[2];
      const app = getAppBySlug(slug);
      if (app?.accentHex) {
        singleColor = app.accentHex;
      }
    }

    const finalColor = singleColor || '#FF02E8';
    return {
      isLanding: false,
      colors: [finalColor],
      primaryColor: finalColor,
    };
  }, [mode, pathname, appColor, multiColors]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const mouse = { x: -1000, y: -1000, active: false };
    let bars: FoldingBar[] = [];

    // Strictly orthogonal cardinal directions: NO DIAGONALS
    const DIRS = [
      { dx: 1, dy: 0 },  // RIGHT
      { dx: 0, dy: 1 },  // DOWN
      { dx: -1, dy: 0 }, // LEFT
      { dx: 0, dy: -1 }, // UP
    ];

    /**
     * Creates a folding bar entering perpendicularly from one of the 4 screen borders.
     * Starts with zero length at the edge and grows as it slithers into view.
     */
    function createBar(index: number, initialDelay: number): FoldingBar {
      const colors = activeTheming.colors;
      const color = activeTheming.isLanding ? colors[index % colors.length] : colors[0];

      // Spawn from one of 4 edges: 0=TOP, 1=RIGHT, 2=BOTTOM, 3=LEFT
      const edge = Math.floor(Math.random() * 4);
      let startX = 0;
      let startY = 0;
      let dir = DIRS[0];

      const margin = 40;
      if (edge === 0) {
        // Enters from TOP moving DOWN
        startX = margin + Math.random() * Math.max(100, width - margin * 2);
        startY = -10;
        dir = { dx: 0, dy: 1 };
      } else if (edge === 1) {
        // Enters from RIGHT moving LEFT
        startX = width + 10;
        startY = margin + Math.random() * Math.max(100, height - margin * 2);
        dir = { dx: -1, dy: 0 };
      } else if (edge === 2) {
        // Enters from BOTTOM moving UP
        startX = margin + Math.random() * Math.max(100, width - margin * 2);
        startY = height + 10;
        dir = { dx: 0, dy: -1 };
      } else {
        // Enters from LEFT moving RIGHT
        startX = -10;
        startY = margin + Math.random() * Math.max(100, height - margin * 2);
        dir = { dx: 1, dy: 0 };
      }

      // Initial points: tail and head start at the same entering point
      const initialPoints: Point[] = [
        { x: startX, y: startY },
        { x: startX, y: startY },
      ];

      return {
        id: index,
        color,
        points: initialPoints,
        direction: dir,
        speed: 95 + Math.random() * 45, // 95 - 140 px/s smooth, deliberate glide
        thickness: barThickness,
        targetLength: 200 + Math.random() * 180, // 200px - 380px continuous solid bar
        currentLength: 0,
        distanceSinceTurn: 0,
        minStraightDist: 90 + Math.random() * 180, // travels 90-270px before folding
        spawnDelay: initialDelay,
        active: false,
        opacity: 0,
        fadingOut: false,
        age: 0,
        lifespan: 22 + Math.random() * 14, // 22 - 36s lifespan
      };
    }

    /**
     * Initializes multiple bars with staggered arrival delays.
     * They trickle onto the canvas one by one instead of appearing all at once.
     */
    function initBars() {
      if (width === 0 || height === 0) return;
      bars = [];

      // Support many folding bars (default: 18 on landing, 12 on app pages)
      const count = snakeCount ?? (activeTheming.isLanding ? 18 : 12);
      // Stagger interval so they steadily enter over time
      const STAGGER_INTERVAL = 1.3;

      for (let i = 0; i < count; i++) {
        const delay = i === 0 ? 0.2 : i * STAGGER_INTERVAL;
        bars.push(createBar(i, delay));
      }
    }

    function handleResize() {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx!.scale(dpr, dpr);

      initBars();
    }

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.active = false;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    let isTabVisible = true;
    const handleVisibility = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let lastTime = performance.now();

    function render(now: number) {
      animationFrameId = requestAnimationFrame(render);
      if (!isTabVisible || width === 0 || height === 0) return;

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx!.clearRect(0, 0, width, height);

      // ═════════════════════════════════════════════════════════════════
      // 1. UPDATE & DRAW FOLDING BARS (SOLID CONTINUOUS LOGO BARS)
      // ═════════════════════════════════════════════════════════════════
      bars.forEach((bar, idx) => {
        // Handle staggered entrance delay (they never appear all at once)
        if (bar.spawnDelay > 0) {
          bar.spawnDelay -= delta;
          return;
        }

        bar.active = true;
        bar.age += delta;

        // Smooth fade-in as it enters
        if (!bar.fadingOut && bar.opacity < 1.0) {
          bar.opacity = Math.min(1.0, bar.opacity + delta * 1.1);
        }

        // Check if lifespan reached -> begin smooth fade-out
        if (bar.age > bar.lifespan && !bar.fadingOut) {
          bar.fadingOut = true;
        }

        if (bar.fadingOut) {
          bar.opacity = Math.max(0, bar.opacity - delta * 0.7);
          // Once fully faded, respawn from an edge after a creative staggered delay
          if (bar.opacity <= 0) {
            bars[idx] = createBar(idx, 1.2 + Math.random() * 4.0);
            return;
          }
        }

        const moveDist = bar.speed * delta;
        bar.distanceSinceTurn += moveDist;

        // 1. ADVANCE HEAD (points[points.length - 1])
        const head = bar.points[bar.points.length - 1];
        head.x += bar.direction.dx * moveDist;
        head.y += bar.direction.dy * moveDist;

        // 2. ADVANCE TAIL (points[0]) IF BAR REACHED FULL TARGET LENGTH
        if (bar.currentLength < bar.targetLength) {
          bar.currentLength = Math.min(bar.targetLength, bar.currentLength + moveDist);
        } else {
          // Pull tail forward by moveDist along the polyline path
          let remainingTrim = moveDist;
          while (remainingTrim > 0 && bar.points.length >= 2) {
            const p0 = bar.points[0];
            const p1 = bar.points[1];
            const segDx = p1.x - p0.x;
            const segDy = p1.y - p0.y;
            const segLen = Math.hypot(segDx, segDy);

            if (segLen <= remainingTrim) {
              // Tail passed corner point p1 -> remove p0
              remainingTrim -= segLen;
              bar.points.shift();
            } else {
              // Move p0 towards p1
              const ratio = remainingTrim / segLen;
              p0.x += segDx * ratio;
              p0.y += segDy * ratio;
              remainingTrim = 0;
            }
          }
        }

        // 3. FOLDING LOGIC: 90° ORTHOGONAL TURNS (NO CURVES, NO DIAGONALS)
        const wallMargin = 55;
        const approachingWall =
          (head.x < wallMargin && bar.direction.dx < 0) ||
          (head.x > width - wallMargin && bar.direction.dx > 0) ||
          (head.y < wallMargin && bar.direction.dy < 0) ||
          (head.y > height - wallMargin && bar.direction.dy > 0);

        const canTurnNaturally = bar.distanceSinceTurn > bar.minStraightDist;

        if (approachingWall || (canTurnNaturally && Math.random() < 0.035)) {
          // Available 90° perpendicular turns
          const perpTurns: { dx: number; dy: number }[] = [];
          if (bar.direction.dx !== 0) {
            // Currently moving horizontally -> can turn UP or DOWN
            perpTurns.push({ dx: 0, dy: 1 });
            perpTurns.push({ dx: 0, dy: -1 });
          } else {
            // Currently moving vertically -> can turn LEFT or RIGHT
            perpTurns.push({ dx: 1, dy: 0 });
            perpTurns.push({ dx: -1, dy: 0 });
          }

          // Filter out turns that immediately head into a nearby wall
          const safeTurns = perpTurns.filter((d) => {
            if (d.dx < 0 && head.x < wallMargin) return false;
            if (d.dx > 0 && head.x > width - wallMargin) return false;
            if (d.dy < 0 && head.y < wallMargin) return false;
            if (d.dy > 0 && head.y > height - wallMargin) return false;
            return true;
          });

          const chosenTurn =
            safeTurns.length > 0
              ? safeTurns[Math.floor(Math.random() * safeTurns.length)]
              : perpTurns[Math.floor(Math.random() * perpTurns.length)];

          if (chosenTurn) {
            bar.direction = chosenTurn;
            bar.distanceSinceTurn = 0;
            bar.minStraightDist = 100 + Math.random() * 200; // Next straight run distance

            // Add new corner fold point at exact head position
            bar.points.push({ x: head.x, y: head.y });
          }
        }

        // 4. DRAW CONTINUOUS SOLID FOLDING BAR (NO SQUARES, NO CURVES, NO SHADOWS)
        if (bar.points.length < 2) return;

        // Interactive mouse proximity boost
        let mouseBoost = 0;
        if (mouse.active) {
          const currentHead = bar.points[bar.points.length - 1];
          const dist = Math.hypot(currentHead.x - mouse.x, currentHead.y - mouse.y);
          if (dist < 180) {
            mouseBoost = (1 - dist / 180) * 0.35;
          }
        }

        // Clear, bold contrast for background presence without washing out foreground text
        const finalAlpha = Math.min(1.0, (0.42 + mouseBoost) * bar.opacity);

        ctx!.save();
        ctx!.beginPath();

        // Move to tail
        ctx!.moveTo(bar.points[0].x, bar.points[0].y);

        // Line to every folding corner point through to the head
        for (let i = 1; i < bar.points.length; i++) {
          ctx!.lineTo(bar.points[i].x, bar.points[i].y);
        }

        // STRICT LOGO GEOMETRY:
        // - lineCap = 'butt': flat rectangular cut ends (exactly like IMPROVE logo bars)
        // - lineJoin = 'miter': razor-sharp 90° folding corners (NO rounded arcs)
        // - NO shadows, NO squares/beads
        ctx!.lineCap = 'butt';
        ctx!.lineJoin = 'miter';
        ctx!.miterLimit = 10;
        ctx!.lineWidth = bar.thickness;
        ctx!.strokeStyle = bar.color;
        ctx!.globalAlpha = finalAlpha;
        ctx!.stroke();

        ctx!.restore();
      });
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [activeTheming, barThickness, snakeCount]);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      style={{ opacity }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
}

export default CircuitBackground;
