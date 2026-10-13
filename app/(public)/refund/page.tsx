"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  RotateCcw, 
  ExternalLink, 
  Smartphone, 
  Clock, 
  Copy, 
  Check, 
  Mail, 
  ShieldCheck, 
  FileText,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

export default function RefundPolicyPage() {
  const [copied, setCopied] = useState(false);

  const plainTextDraft = `Refunds

Improve subscriptions are sold and billed by Apple through the App Store, so Apple handles all refunds. We can't issue refunds directly or see your payment details.

To request a refund, go to reportaproblem.apple.com, sign in with your Apple ID, choose the Improve purchase and select "Request a refund". Apple usually replies within 48 hours.

To stop future charges, cancel in iOS Settings ▸ [your name] ▸ Subscriptions at least 24 hours before your renewal date. You keep Improve until the end of the period you paid for.

Questions about a charge? Email support@improve-club.com and we'll help however we can.`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextDraft);
      setCopied(true);
      toast.success("Refund policy text copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  return (
    <div className="min-h-screen text-[var(--label)] selection:bg-white/20" style={{ fontFamily: "var(--font-ios)" }}>
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[20%] w-[50%] h-[40%] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-[45%] right-[15%] w-[40%] h-[35%] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs uppercase tracking-wider text-amber-400">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Apple App Store Billing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
            Refunds
          </h1>

          <p className="text-sm md:text-base text-[var(--label-2)] leading-relaxed max-w-2xl mx-auto">
            Improve subscriptions are sold and billed by Apple through the App Store, so Apple handles all refunds. We can&apos;t issue refunds directly or see your payment details.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-[var(--label-3)]">
            <span>Effective: October 10, 2026</span>
            <span>•</span>
            <a href="mailto:support@improve-club.com" className="text-white underline hover:text-amber-400 transition-colors">
              support@improve-club.com
            </a>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Plain Text" : "Copy Plain Text"}</span>
            </button>
          </div>
        </div>

        {/* Core Steps Cards */}
        <div className="space-y-6">
          {/* Step 1: Requesting a refund */}
          <div className="access-glass p-8 space-y-4 border border-blue-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ExternalLink className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                To request a refund
              </h2>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              Go to{" "}
              <a 
                href="https://reportaproblem.apple.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white font-semibold underline hover:text-blue-400 transition-colors inline-flex items-center gap-1"
              >
                <span>reportaproblem.apple.com</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              , sign in with your Apple ID, choose the Improve purchase and select <strong className="text-white">&ldquo;Request a refund&rdquo;</strong>.
            </p>
            <div className="flex items-center gap-2 text-xs text-blue-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Apple usually replies within 48 hours.</span>
            </div>
          </div>

          {/* Step 2: Stop future charges */}
          <div className="access-glass p-8 space-y-4 border border-amber-500/20">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                To stop future charges
              </h2>
            </div>
            <div className="space-y-3 text-sm text-[var(--label-2)] leading-relaxed">
              <p>
                Cancel in <strong className="text-white">iOS Settings ▸ [your name] ▸ Subscriptions</strong> at least 24 hours before your renewal date.
              </p>
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-xs text-white/80">
                You keep Improve until the end of the period you paid for. Deleting the app does not cancel an active App Store subscription.
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links to Terms and Privacy */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/privacy"
            className="access-glass p-5 flex items-center justify-between group hover:border-white/20 transition-all"
          >
            <div>
              <div className="text-xs text-[var(--label-3)] uppercase tracking-wider">Privacy Standards</div>
              <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Privacy Policy</div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/terms"
            className="access-glass p-5 flex items-center justify-between group hover:border-white/20 transition-all"
          >
            <div>
              <div className="text-xs text-[var(--label-3)] uppercase tracking-wider">Service Agreement</div>
              <div className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Terms of Use</div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Contact Footer Card */}
        <div className="access-glass p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-white">Questions about a charge?</h4>
            <p className="text-xs text-[var(--label-2)]">
              Email us and we&apos;ll help however we can.
            </p>
          </div>
          <a
            href="mailto:support@improve-club.com"
            className="px-5 py-2.5 rounded-xl border border-white/20 bg-white hover:bg-white/90 text-black text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>support@improve-club.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
