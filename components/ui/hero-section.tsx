"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Quote } from "lucide-react";

// Official 7 colors of the IMPROVE ecosystem pillars & logo
export const IMPROVE_COLORS = [
  { letter: "I", color: "#cc0000", name: "Relationships" },
  { letter: "M", color: "#6f1bd3", name: "Mind" },
  { letter: "P", color: "#ff02e8", name: "Productivity" },
  { letter: "R", color: "#2254f5", name: "Work" },
  { letter: "O", color: "#43b752", name: "Body" },
  { letter: "V", color: "#ff6900", name: "Second Brain" },
  { letter: "E", color: "#efb219", name: "Money" },
];

export function ColorfulImprove({ className, glow = true }: { className?: string; glow?: boolean }) {
  return (
    <span className={cn("inline-flex items-center tracking-tight", className)}>
      {IMPROVE_COLORS.map(({ letter, color }, index) => (
        <span
          key={index}
          style={{
            color,
            textShadow: glow ? `0 0 35px ${color}66, 0 0 70px ${color}33` : undefined,
          }}
          className="inline-block transition-transform duration-300 hover:scale-105"
        >
          {letter === "V" ? (
            <AnimatedV color={color} glow={glow} />
          ) : (
            letter
          )}
        </span>
      ))}
    </span>
  );
}

/* AnimatedV component: displays two "I" letters that merge into a single massive thick "I", then drop top outward to form "V" */
function AnimatedV({ color, glow }: { color: string; glow?: boolean }) {
  const [showII, setShowII] = React.useState(true);

  React.useEffect(() => {
    // Lock into final clean V glyph after animation
    const timer = setTimeout(() => setShowII(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!showII) {
    return <>V</>;
  }

  return (
    <span className="inline-flex items-center justify-center relative align-baseline">
      {/* Left I */}
      <span
        className="animate-v-left inline-block"
        style={{
          color,
          textShadow: glow ? `0 0 35px ${color}66, 0 0 70px ${color}33` : undefined,
          transformOrigin: "bottom right",
        }}
      >
        I
      </span>
      {/* Right I */}
      <span
        className="animate-v-right inline-block"
        style={{
          color,
          textShadow: glow ? `0 0 35px ${color}66, 0 0 70px ${color}33` : undefined,
          transformOrigin: "bottom left",
          marginLeft: "-0.22em",
        }}
      >
        I
      </span>

      <style jsx>{`
        @keyframes v-left-stage {
          0% {
            transform: translateX(-0.18em) rotate(0deg);
          }
          /* Phase 1: Slide to center & merge into ONE massive thick "I" */
          35%, 55% {
            transform: translateX(0.11em) rotate(0deg);
          }
          /* Phase 2: Top opens OUTWARD to form left diagonal leg of V (\) */
          100% {
            transform: translateX(-0.02em) rotate(-22deg);
          }
        }
        @keyframes v-right-stage {
          0% {
            transform: translateX(0.18em) rotate(0deg);
          }
          /* Phase 1: Slide to center & merge into ONE massive thick "I" */
          35%, 55% {
            transform: translateX(-0.11em) rotate(0deg);
          }
          /* Phase 2: Top opens OUTWARD to form right diagonal leg of V (/) */
          100% {
            transform: translateX(0.02em) rotate(22deg);
          }
        }
        .animate-v-left {
          animation: v-left-stage 1.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .animate-v-right {
          animation: v-right-stage 1.35s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </span>
  );
}



interface ManifestoStep {
  text: string;
  isBad?: boolean; // Toxic hustle culture quotes colored red
  typeSpeed: number; // ms per char (readable pace)
  pauseAtEnd: number; // ms to pause so the sentence CAN BE READ
  deleteSpeed: number; // ms per char (visible backspacing letter by letter)
  pauseAfterDelete: number; // ms pause on cleared line before next sentence
}

// Pacing & Color Strategy:
// - Lines 1-4: The "bad" toxic phrases colored red so user knows we are rejecting them
// - Line 5: The human truth ("Just be you. Live with purpose.") in calm pure white
// - Final Frame: Snaps directly into the single unified frame of "Use IMPROVE." + copy
const MANIFESTO_STEPS: ManifestoStep[] = [
  {
    text: "Do more. Be more.",
    isBad: true,
    typeSpeed: 45,
    pauseAtEnd: 2200, // 2.2s comfortable reading time
    deleteSpeed: 28, // visible backspacing character-by-character
    pauseAfterDelete: 350,
  },
  {
    text: "10X your life or you're falling behind.",
    isBad: true,
    typeSpeed: 38,
    pauseAtEnd: 2500, // 2.5s comfortable reading time
    deleteSpeed: 24, // visible backspacing
    pauseAfterDelete: 350,
  },
  {
    text: "Sleep when you're dead. Rise and grind.",
    isBad: true,
    typeSpeed: 38,
    pauseAtEnd: 2500, // 2.5s comfortable reading time
    deleteSpeed: 24, // visible backspacing
    pauseAfterDelete: 350,
  },
  {
    text: "Work hard, play hard.",
    isBad: true,
    typeSpeed: 45,
    pauseAtEnd: 2200, // 2.2s comfortable reading time
    deleteSpeed: 28, // visible backspacing
    pauseAfterDelete: 400,
  },
  {
    // Decelerates dramatically: human, calm, deliberate cadence (white text)
    text: "Just be you. Live with purpose.",
    isBad: false,
    typeSpeed: 105,
    pauseAtEnd: 3400, // 3.4s deep breath and absorb the contrast
    deleteSpeed: 32, // gentle visible backspacing
    pauseAfterDelete: 700, // momentary stillness before reveal
  },
];

export interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  onIntroComplete?: () => void;
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, onIntroComplete, ...props }, ref) => {
    // phase: "manifesto" | "final" (single unified final frame)
    const [phase, setPhase] = React.useState<"manifesto" | "final">("manifesto");
    const [stepIndex, setStepIndex] = React.useState(0);
    const [displayText, setDisplayText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Skip handler (immediately advance to final frame)
    const handleSkip = React.useCallback(() => {
      setPhase("final");
      onIntroComplete?.();
    }, [onIntroComplete]);

    // Keyboard listener to skip on Escape
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleSkip();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleSkip]);

    // Typewriter Engine for Manifesto phase
    React.useEffect(() => {
      if (phase !== "manifesto") return;

      const currentStep = MANIFESTO_STEPS[stepIndex];
      const targetText = currentStep.text;
      let timer: NodeJS.Timeout;

      if (!isDeleting) {
        // Typing forward character by character
        if (displayText.length < targetText.length) {
          timer = setTimeout(() => {
            setDisplayText(targetText.slice(0, displayText.length + 1));
          }, currentStep.typeSpeed);
        } else {
          // Finished typing sentence -> PAUSE so user reads it before deleting
          timer = setTimeout(() => {
            setIsDeleting(true);
          }, currentStep.pauseAtEnd);
        }
      } else {
        // Deleting backward character by character (visible backspacing)
        if (displayText.length > 0) {
          timer = setTimeout(() => {
            setDisplayText((prev) => prev.slice(0, -1));
          }, currentStep.deleteSpeed);
        } else {
          // Line completely cleared back to empty
          if (stepIndex < MANIFESTO_STEPS.length - 1) {
            timer = setTimeout(() => {
              setStepIndex((prev) => prev + 1);
              setIsDeleting(false);
            }, currentStep.pauseAfterDelete);
          } else {
            // All 5 lines finished -> Snap straight into the single unified final frame!
            timer = setTimeout(() => {
              setPhase("final");
              onIntroComplete?.();
            }, currentStep.pauseAfterDelete);
          }
        }
      }

      return () => clearTimeout(timer);
    }, [phase, stepIndex, displayText, isDeleting, onIntroComplete]);

    const currentStep = MANIFESTO_STEPS[stepIndex];

    return (
      <section
        ref={ref}
        className={cn("relative w-full flex items-center justify-center overflow-hidden", className)}
        {...props}
      >
        {/* Frame 1: Manifesto Typewriter with Huge Background Quote Symbol */}
        {phase === "manifesto" && (
          <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center text-center px-6">
            {/* Huge background quotation mark with a lot of opacity */}


            {/* The Typing Sentence */}
            <div className="relative z-10 text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight min-h-[1.5em] flex items-center justify-center max-w-5xl mx-auto">
              <span
                className={cn(
                  "transition-colors duration-300",
                  currentStep.isBad
                    ? "text-red-500 drop-shadow-[0_0_35px_rgba(239,68,68,0.7)]"
                    : "text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]"
                )}
              >
                {displayText}
              </span>
              <span
                className={cn(
                  "inline-block w-[3px] h-[1em] ml-2 animate-pulse align-middle",
                  currentStep.isBad
                    ? "bg-red-500 shadow-[0_0_12px_#ef4444]"
                    : "bg-white/90 shadow-[0_0_12px_#ffffff]"
                )}
              />
            </div>

            {/* Subtle skip control */}
            <button
              onClick={handleSkip}
              className="absolute bottom-8 text-xs text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest cursor-pointer"
            >
              Skip
            </button>
          </div>
        )}

        {/* Single Unified Final Frame: Use IMPROVE. + Subhead + Copy */}
        {phase === "final" && (
          <div className="min-h-[80vh] w-full flex flex-col items-center justify-center text-center px-6 py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              {/* Sentence at the top */}
              <p className="text-sm sm:text-base md:text-lg font-medium tracking-[0.25em] uppercase text-zinc-400 mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                Purpose in mind. Intention in motion.
              </p>

              {/* The Headline: Use IMPROVE. (with individual pillar colors) */}
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight mb-6 sm:mb-8 selection:bg-white selection:text-black">

                <ColorfulImprove glow />

              </h1>

              {/* Copy section */}
              <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-normal animate-in fade-in slide-in-from-bottom-4 duration-700">
                IMPROVE is a powerful ecosystem that connects your Knowledge, Finances, Body, Productivity, Work, Relationships and mind, giving you the clarity to act with absolute intention.
              </p>
            </div>
          </div>
        )}
      </section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
