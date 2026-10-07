"use client";

import * as React from "react";
import { useState, useId, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Slot } from "@radix-ui/react-slot";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { Eye, EyeOff, AlertCircle, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { login, signup } from "@/app/(public)/login/actions";
import { AnimatedLogoSvg } from "@/components/landing/improve-logo";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TypewriterProps {
  text: string | string[];
  speed?: number;
  cursor?: string;
  loop?: boolean;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
}

export function Typewriter({
  text,
  speed = 100,
  cursor = "|",
  loop = false,
  deleteSpeed = 50,
  delay = 1500,
  className,
}: TypewriterProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [textArrayIndex, setTextArrayIndex] = useState(0);

  const textArray = Array.isArray(text) ? text : [text];
  const currentText = textArray[textArrayIndex] || "";

  useEffect(() => {
    if (!currentText) return;

    const timeout = setTimeout(
      () => {
        if (!isDeleting) {
          if (currentIndex < currentText.length) {
            setDisplayText((prev) => prev + currentText[currentIndex]);
            setCurrentIndex((prev) => prev + 1);
          } else if (loop) {
            setTimeout(() => setIsDeleting(true), delay);
          }
        } else {
          if (displayText.length > 0) {
            setDisplayText((prev) => prev.slice(0, -1));
          } else {
            setIsDeleting(false);
            setCurrentIndex(0);
            setTextArrayIndex((prev) => (prev + 1) % textArray.length);
          }
        }
      },
      isDeleting ? deleteSpeed : speed,
    );

    return () => clearTimeout(timeout);
  }, [
    currentIndex,
    isDeleting,
    currentText,
    loop,
    speed,
    deleteSpeed,
    delay,
    displayText,
    text,
  ]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">{cursor}</span>
    </span>
  );
}

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-300"
);

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-zinc-200 active:scale-[0.99] font-semibold shadow-lg shadow-white/10",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-zinc-800 bg-zinc-950/80 text-zinc-200 hover:bg-zinc-900 hover:text-white hover:border-zinc-700",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-zinc-900 hover:text-white",
        link: "text-zinc-300 underline-offset-4 hover:underline hover:text-white p-0 h-auto font-normal",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-md px-6",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm text-white shadow-sm shadow-black/10 transition-all placeholder:text-zinc-500 focus:border-white/30 focus:bg-white/[0.07] focus:ring-1 focus:ring-white/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, label, ...props }, ref) => {
    const id = useId();
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => setShowPassword((prev) => !prev);
    return (
      <div className="grid w-full items-center gap-2">
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input id={id} type={showPassword ? "text" : "password"} className={cn("pe-10", className)} ref={ref} {...props} />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 end-0 flex h-full w-10 items-center justify-center text-zinc-400 hover:text-white transition-colors focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

function SignInForm({ errorMessage }: { errorMessage?: string | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await login(formData);
        });
      }}
      autoComplete="on"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Sign in to your account</h1>
        <p className="text-balance text-sm text-zinc-400">Enter your email below to access your sovereign workspace</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg border border-red-500/30 bg-red-950/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="current-password" placeholder="••••••••" />
        <Button type="submit" variant="default" className="mt-2 h-11 text-black bg-white hover:bg-zinc-200" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing In...
            </span>
          ) : (
            "Sign In"
          )}
        </Button>
      </div>
    </form>
  );
}

function SignUpForm({ errorMessage }: { errorMessage?: string | null }) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await signup(formData);
        });
      }}
      autoComplete="on"
      className="flex flex-col gap-6"
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Create an account</h1>
        <p className="text-balance text-sm text-zinc-400">Initialize your 7 interconnected pillars in under 60 seconds</p>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg border border-red-500/30 bg-red-950/30 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" placeholder="John Doe" required autoComplete="name" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required autoComplete="email" />
        </div>
        <PasswordInput name="password" label="Password" required autoComplete="new-password" placeholder="Create a strong password" />
        <Button type="submit" variant="default" className="mt-2 h-11 text-black bg-white hover:bg-zinc-200" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Initializing Account...
            </span>
          ) : (
            "Sign Up"
          )}
        </Button>
      </div>
    </form>
  );
}

function AuthFormContainer({
  isSignIn,
  onToggle,
  errorMessage,
}: {
  isSignIn: boolean;
  onToggle: () => void;
  errorMessage?: string | null;
}) {
  return (
    <div className="mx-auto grid w-full max-w-[360px] gap-4">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local Vault</span>
        </div>
      </div>

      {isSignIn ? <SignInForm errorMessage={errorMessage} /> : <SignUpForm errorMessage={errorMessage} />}

      <div className="text-center text-sm text-zinc-400 pt-1">
        {isSignIn ? "Don't have an account?" : "Already have an account?"}{" "}
        <Button variant="link" className="pl-1 text-white hover:text-white font-medium" onClick={onToggle}>
          {isSignIn ? "Sign up" : "Sign in"}
        </Button>
      </div>

      <div className="relative text-center text-xs my-2 after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-white/10">
        <span className="relative z-10 px-3 text-zinc-400 uppercase tracking-wider text-[11px] font-medium bg-[#07050A]/70 backdrop-blur-md rounded-full py-0.5 border border-white/5">
          Or continue with
        </span>
      </div>

      <Button
        variant="outline"
        type="button"
        onClick={() => {
          console.log("UI: Google button clicked");
          alert("Google sign-in is managed on-device via your Apple or local credentials.");
        }}
        className="w-full h-11 border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 text-zinc-200"
      >
        <img
          src="https://cdn.21st.dev/assets/mirror/38/38146bfd9eff6dbf0d74771f2e625c70d87d3770e0d080dbb6e50db1d5403f46.svg"
          alt="Google icon"
          className="mr-2 h-4 w-4"
        />
        Continue with Google
      </Button>

      <p className="text-[11px] text-center text-zinc-500 pt-2">
        100% On-device privacy • Zero telemetry surveillance
      </p>
    </div>
  );
}

// 7 Interconnected Apps Showcase Data
const APPS_ECOSYSTEM = [
  { id: "relationships", name: "Relationships", logo: "/RelationShips logo.svg", color: "#cc0000" },
  { id: "mind", name: "Mind", logo: "/mind Logo.svg", color: "#6f1bd3" },
  { id: "productivity", name: "Productivity", logo: "/Productivity Logo.svg", color: "#ff02e8" },
  { id: "work", name: "Work", logo: "/Work Logo.svg", color: "#2254f5" },
  { id: "body", name: "Body", logo: "/Body Logo.svg", color: "#43b752" },
  { id: "second-brain", name: "Second Brain", logo: "/Second Brain Logo.svg", color: "#ff6900" },
  { id: "money", name: "Money", logo: "/money Logo.svg", color: "#efb219" },
];

const appContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.85,
      staggerChildren: 0.14,
    },
  },
};

const appItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.7,
    filter: "blur(6px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 280,
      damping: 20,
    },
  },
};

/**
 * Desktop Brand Showcase:
 * 1. Uses the exact header animation (AnimatedLogoSvg cascading bars)
 * 2. The 7 apps' logos come in ONE BY ONE in a single row
 * 3. 100% transparent so the circuit background animation travels cleanly behind
 */
function ImproveBrandShowcase({ isSignIn }: { isSignIn: boolean }) {
  return (
    <div className="relative h-full w-full overflow-hidden flex flex-col items-center justify-center p-8 lg:p-12 select-none bg-transparent">

      {/* CENTER STAGE:
          1. EXACT HEADER ANIMATION FOR IMPROVE LOGO (NO PINK SHADOW)
          2. THE 7 APPS IN A SINGLE ROW BY THEMSELVES (NO CONTAINER BOXES, NO DUPLICATE LABELS) COMING IN ONE BY ONE */}
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center text-center space-y-12 my-auto py-6 px-4">
        {/* Main Header Animated Logo: Free-floating (NO PINK SHADOW) */}
        <div className="relative flex flex-col items-center">
          {/* Exact Header Animation: AnimatedLogoSvg with cascading bars */}
          <div className="relative w-52 h-52 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-72 lg:h-72 flex items-center justify-center select-none">
            <AnimatedLogoSvg
              triggerKey={isSignIn ? "auth-signin" : "auth-signup"}
              duration={1.2}
              stagger={0.35}
              startDelay={0.2}
              startOffset={-650}
              viewBox="190 60 644 904"
              interactive={true}
              className="w-full h-full cursor-pointer"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-6 text-center space-y-1.5"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-[0.2em] text-white">
              IMPROVE
            </h2>
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-zinc-400 font-medium">
              7 Interconnected Pillars · Sovereign Operating System
            </p>
          </motion.div>
        </div>

        {/* 7 App Logos Coming In ONE BY ONE — All in a Single Row, Apps by Themselves (Big & Readable) */}
        <div className="w-full flex flex-col items-center">
          <motion.div
            key={isSignIn ? "apps-in-signin" : "apps-in-signup"}
            variants={appContainerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-row flex-nowrap items-center justify-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5 xl:gap-3 w-full max-w-full"
          >
            {APPS_ECOSYSTEM.map((app) => (
              <motion.div
                key={app.id}
                variants={appItemVariants}
                whileHover={{ y: -8, scale: 1.2 }}
                whileTap={{ scale: 0.95 }}
                className="group relative flex items-center justify-center transition-all cursor-pointer select-none shrink-0"
                title={app.name}
              >
                {/* Pure App Vector Logo — Substantially Bigger, Floating Freely */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={app.logo}
                    alt={`${app.name} Logo`}
                    className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)] mix-blend-screen"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export interface AuthContentProps {
  image?: {
    src?: string;
    alt?: string;
  };
  quote?: {
    text?: string;
    author?: string;
  };
}

export interface AuthUIProps {
  initialIsSignIn?: boolean;
  signInContent?: AuthContentProps;
  signUpContent?: AuthContentProps;
}

export function AuthUI({
  initialIsSignIn = true,
}: AuthUIProps) {
  const [isSignIn, setIsSignIn] = useState(initialIsSignIn);
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("error");

  const toggleForm = () => {
    const nextState = !isSignIn;
    setIsSignIn(nextState);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", nextState ? "/login" : "/register");
    }
  };

  return (
    <div className="relative w-full min-h-screen text-white md:grid md:grid-cols-2 overflow-hidden bg-transparent">
      <style>{`
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none;
        }
      `}</style>

      {/* Left Column: Interactive Form inside Transparent Glass Container */}
      <div className="relative z-10 flex min-h-screen items-center justify-center p-4 sm:p-6 md:p-8 lg:p-12">
        {/* Transparent Glass Container — Background Animation Directly Visible Through */}
        <div className="w-full max-w-[420px] rounded-[32px] border border-white/[0.14] bg-white/[0.02] backdrop-blur-[6px] p-6 sm:p-8 md:p-9 shadow-2xl shadow-black/40">
          <AuthFormContainer isSignIn={isSignIn} onToggle={toggleForm} errorMessage={errorMessage} />
        </div>
      </div>

      {/* Right Column: Custom Brand Visual Showcase */}
      <div className="hidden md:block relative z-10 border-l border-white/[0.08]">
        <ImproveBrandShowcase isSignIn={isSignIn} />
      </div>
    </div>
  );
}
