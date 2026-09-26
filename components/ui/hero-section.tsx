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

export function ColorfulImprove({
  className,
  glow = false,
  onComplete,
}: {
  className?: string;
  glow?: boolean;
  onComplete?: () => void;
}) {
  const [animationDone, setAnimationDone] = React.useState(false);

  const handleVComplete = React.useCallback(() => {
    setAnimationDone(true);
    onComplete?.();
  }, [onComplete]);

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
          {letter === "V" && !animationDone ? (
            <AnimatedV color={color} glow={glow} onComplete={handleVComplete} />
          ) : (
            letter
          )}
        </span>
      ))}
    </span>
  );
}

/* AnimatedV component: 1) II comes together, 2) the bars fall all the way into V, 3) the V */
function AnimatedV({
  color,
  glow,
  onComplete,
}: {
  color: string;
  glow?: boolean;
  onComplete?: () => void;
}) {
  // Step 1: "II" (0s - 1.0s) -> Step 2: "bars" (1.0s - 2.5s) -> Step 3: "V" (2.5s+)
  const [step, setStep] = React.useState<"II" | "bars" | "V">("II");

  React.useEffect(() => {
    // At 1.0s, transition from held II to the falling bars
    const t1 = setTimeout(() => setStep("bars"), 1000);
    // At 2.5s, the bars have fully fallen into V, seamlessly lock to V
    const t2 = setTimeout(() => {
      setStep("V");
      onComplete?.();
    }, 2500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onComplete]);

  return (
    <span className="relative inline-block">
      {/* 
        The real in-flow V: 
        Guarantees 100% perfect font baseline, cap height, width, and line height with 'O' and 'E'.
        Fades in progressively right as the bars complete their fall.
      */}
      <span
        className="transition-opacity duration-300 ease-out"
        style={{
          color,
          textShadow: glow ? `0 0 35px ${color}66, 0 0 70px ${color}33` : undefined,
          opacity: step === "V" ? 1 : 0,
        }}
      >
        V
      </span>

      {/* STEP 1: Two 'I' letters coming together into 'II' in the center */}
      {step === "II" && (
        <span
          className="absolute inset-0 flex justify-center pointer-events-none select-none"
          aria-hidden="true"
        >
          {/* Left I */}
          <span
            className="animate-clap-left absolute"
            style={{ color, fontStyle: "normal" }}
          >
            I
          </span>

          {/* Right I */}
          <span
            className="animate-clap-right absolute"
            style={{ color, fontStyle: "normal" }}
          >
            I
          </span>
        </span>
      )}

      {/* STEP 2: The bars that FALL all the way until forming the complete V */}
      {(step === "bars" || step === "V") && (
        <span
          className={cn(
            "absolute inset-0 pointer-events-none select-none transition-opacity duration-300",
            step === "V" ? "opacity-0" : "opacity-100"
          )}
          aria-hidden="true"
        >
          {/* Left bar: falls all the way into the left leg of V */}
          <span
            className="animate-bar-fall-left absolute inset-0"
            style={{
              color,
              clipPath: "polygon(0 0, 50.5% 0, 50.5% 100%, 0 100%)",
              transformOrigin: "50% 88%",
            }}
          >
            V
          </span>

          {/* Right bar: falls all the way into the right leg of V */}
          <span
            className="animate-bar-fall-right absolute inset-0"
            style={{
              color,
              clipPath: "polygon(49.5% 0, 100% 0, 100% 100%, 49.5% 100%)",
              transformOrigin: "50% 88%",
            }}
          >
            V
          </span>
        </span>
      )}

      <style jsx>{`
        /* STEP 1: II coming together and holding */
        @keyframes clap-left {
          0% {
            transform: translateX(-0.24em);
          }
          45%, 100% {
            transform: translateX(-0.04em);
          }
        }
        @keyframes clap-right {
          0% {
            transform: translateX(0.24em);
          }
          45%, 100% {
            transform: translateX(0.04em);
          }
        }
        .animate-clap-left {
          animation: clap-left 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .animate-clap-right {
          animation: clap-right 1s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        /* STEP 2: The bars that FALL all the way into the V */
        @keyframes bar-fall-left {
          0% {
            transform: translateX(-0.015em) rotate(16deg);
            opacity: 1;
          }
          100% {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
          }
        }
        @keyframes bar-fall-right {
          0% {
            transform: translateX(0.015em) rotate(-16deg);
            opacity: 1;
          }
          100% {
            transform: translateX(0) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-bar-fall-left {
          animation: bar-fall-left 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .animate-bar-fall-right {
          animation: bar-fall-right 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
      `}</style>
    </span>
  );
}

interface SubheadSegment {
  text: string;
  isKey: boolean;
}

const SUBHEAD_SEGMENTS: SubheadSegment[] = [
  { text: "ONE", isKey: true },
  { text: " powerful ", isKey: false },
  { text: "Ecosystem", isKey: true },
  { text: " that connects your ", isKey: false },
  { text: "Knowledge", isKey: true },
  { text: ", ", isKey: false },
  { text: "Finances", isKey: true },
  { text: ", ", isKey: false },
  { text: "Body", isKey: true },
  { text: ", ", isKey: false },
  { text: "Productivity", isKey: true },
  { text: ", ", isKey: false },
  { text: "Work", isKey: true },
  { text: ", ", isKey: false },
  { text: "Relationships", isKey: true },
  { text: " and ", isKey: false },
  { text: "Mind", isKey: true },
  { text: ", giving you the ", isKey: false },
  { text: "Clarity", isKey: true },
  { text: " to act with ", isKey: false },
  { text: "Absolute Intention", isKey: true },
  { text: ".", isKey: false },
];

/* Subhead below IMPROVE typed out smoothly with key words progressively bolded */
function TypewriterSubhead({ start }: { start: boolean }) {
  const [charCount, setCharCount] = React.useState(0);
  const [isFinished, setIsFinished] = React.useState(false);

  const fullLength = React.useMemo(() => {
    return SUBHEAD_SEGMENTS.reduce((sum, seg) => sum + seg.text.length, 0);
  }, []);

  React.useEffect(() => {
    if (!start) return;

    // Small pause after V completes before typewriter starts typing
    const delay = setTimeout(() => {
      const timer = setInterval(() => {
        setCharCount((prev) => {
          if (prev < fullLength) {
            return prev + 1;
          }
          clearInterval(timer);
          setIsFinished(true);
          return prev;
        });
      }, 22);

      return () => clearInterval(timer);
    }, 350);

    return () => clearTimeout(delay);
  }, [start, fullLength]);

  let charsRemaining = charCount;

  return (
    <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed max-w-3xl mx-auto font-normal min-h-[4.5em] animate-in fade-in slide-in-from-bottom-4 duration-700">
      {SUBHEAD_SEGMENTS.map((seg, idx) => {
        if (charsRemaining <= 0) return null;
        const visibleChars = Math.min(charsRemaining, seg.text.length);
        charsRemaining -= visibleChars;
        const visibleText = seg.text.slice(0, visibleChars);

        return (
          <span
            key={idx}
            className={cn(
              seg.isKey ? "font-bold text-white transition-colors duration-300" : "text-zinc-400 font-normal"
            )}
          >
            {visibleText}
          </span>
        );
      })}
      {!isFinished && charCount > 0 && (
        <span className="inline-block w-[2px] h-[1em] ml-1 bg-white animate-pulse align-middle" />
      )}
    </p>
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
    text: "Do more, be more",
    isBad: true,
    typeSpeed: 45,
    pauseAtEnd: 2200, // 2.2s comfortable reading time
    deleteSpeed: 28, // visible backspacing character-by-character
    pauseAfterDelete: 350,
  },
  {
    text: "10X your life or you're falling behind",
    isBad: true,
    typeSpeed: 38,
    pauseAtEnd: 2500, // 2.5s comfortable reading time
    deleteSpeed: 24, // visible backspacing
    pauseAfterDelete: 350,
  },
  {
    text: "Sleep when you're dead, rise and grind",
    isBad: true,
    typeSpeed: 38,
    pauseAtEnd: 2500, // 2.5s comfortable reading time
    deleteSpeed: 24, // visible backspacing
    pauseAfterDelete: 350,
  },
  {
    text: "Work hard, play hard",
    isBad: true,
    typeSpeed: 45,
    pauseAtEnd: 2200, // 2.2s comfortable reading time
    deleteSpeed: 28, // visible backspacing
    pauseAfterDelete: 400,
  },
  {
    // Frame 5: First human truth in calm pure white
    text: "Just Be You",
    isBad: false,
    typeSpeed: 95,
    pauseAtEnd: 2400, // 2.4s to absorb
    deleteSpeed: 30, // gentle visible backspacing
    pauseAfterDelete: 450,
  },
  {
    // Frame 6: Second human truth in calm pure white
    text: "Live With Purpose",
    isBad: false,
    typeSpeed: 95,
    pauseAtEnd: 2600, // 2.6s deep breath before reveal
    deleteSpeed: 30, // gentle visible backspacing
    pauseAfterDelete: 700, // momentary stillness before IMPROVE reveal
  },
];

export interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  onIntroComplete?: () => void;
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  ({ className, onIntroComplete, ...props }, ref) => {
    // phase: "manifesto" | "final" (single unified final frame)
    const [phase, setPhase] = React.useState<"manifesto" | "final">("manifesto");
    const [headlineComplete, setHeadlineComplete] = React.useState(false);
    const [stepIndex, setStepIndex] = React.useState(0);
    const [displayText, setDisplayText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);

    // Fallback timer to ensure subhead progressive bolding starts even on direct navigation/hot-reload
    React.useEffect(() => {
      if (phase === "final") {
        const timer = setTimeout(() => setHeadlineComplete(true), 2700);
        return () => clearTimeout(timer);
      }
    }, [phase]);

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

        {/* Single Unified Final Frame: Top sentence + IMPROVE + Typed subhead */}
        {phase === "final" && (
          <div className="min-h-[80vh] w-full flex flex-col items-center justify-center text-center px-6 py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
              {/* Top sentence that stays */}
              <p className="text-sm sm:text-base md:text-lg font-medium tracking-[0.25em] uppercase text-zinc-400 mb-4 sm:mb-6 animate-in fade-in slide-in-from-top-4 duration-700">
                Purpose in mind. Intention in motion.
              </p>

              {/* The Headline: IMPROVE (with individual pillar colors) */}
              <h1 className="text-6xl sm:text-8xl md:text-9xl font-black tracking-tight mb-6 sm:mb-8 selection:bg-white selection:text-black">
                <ColorfulImprove glow={false} onComplete={() => setHeadlineComplete(true)} />
              </h1>

              {/* Typed subhead below IMPROVE with progressive bolding of key words */}
              <TypewriterSubhead start={headlineComplete} />
            </div>
          </div>
        )}
      </section>
    );
  }
);

HeroSection.displayName = "HeroSection";

export { HeroSection };
