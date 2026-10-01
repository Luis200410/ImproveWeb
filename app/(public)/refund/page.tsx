"use client";

import React from "react";
import Link from "next/link";
import { 
  RotateCcw, 
  CreditCard, 
  Apple, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  ArrowLeft, 
  FileText, 
  ShieldCheck,
  Clock,
  Mail
} from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-black text-[var(--label)] selection:bg-white/20" style={{ fontFamily: "var(--font-ios)" }}>
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[20%] w-[50%] h-[40%] bg-amber-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-[45%] right-[15%] w-[40%] h-[35%] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono uppercase tracking-wider text-amber-400">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Fair & Transparent Billing</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
            Refund & <span className="text-white/40">Cancellation</span>
          </h1>

          <p className="text-sm md:text-base text-[var(--label-2)] leading-relaxed max-w-2xl mx-auto">
            Clear, honest terms regarding subscriptions, cancellations, and refund eligibility across the IMPROVE ecosystem.
          </p>

          <div className="text-xs font-mono text-[var(--label-3)]">
            Effective Date: September 30, 2026 • Version 2.1
          </div>
        </div>

        {/* Quick Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mb-2">
              <Apple className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">App Store In-App Purchases</h3>
            <p className="text-xs text-[var(--label-2)] leading-relaxed">
              Managed and refunded directly by Apple per Apple Media Services Terms.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">14-Day Web Guarantee</h3>
            <p className="text-xs text-[var(--label-2)] leading-relaxed">
              Direct website purchases (Stripe) qualify for a full 14-day money-back guarantee.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2">
              <RotateCcw className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-white text-sm">Cancel Anytime</h3>
            <p className="text-xs text-[var(--label-2)] leading-relaxed">
              No locked contracts. Cancel anytime via your Apple ID Settings with a single tap.
            </p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-8 text-sm text-[var(--label-2)] leading-relaxed">
          {/* Section 1: iOS Purchases */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-6 bg-blue-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white tracking-tight">
                1. iOS In-App Purchases (App Store)
              </h2>
            </div>
            <div className="space-y-4">
              <p>
                Subscriptions or one-time purchases initiated through any of our iOS applications (including <strong className="text-white">IMPROVE Money</strong>, <strong className="text-white">IMPROVE Habits</strong>, or <strong className="text-white">IMPROVE Second Brain</strong>) are processed directly by Apple via StoreKit.
              </p>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs leading-relaxed">
                <strong>IMPORTANT APPLE POLICY:</strong> Third-party developers (including IMPROVE) do not have technical or legal access to your payment card details or the authority to issue refunds directly on Apple&apos;s behalf. All App Store refund decisions are handled exclusively by Apple.
              </div>
            </div>

            <div className="pt-2 space-y-3">
              <h3 className="font-semibold text-white text-sm">
                How to Request an App Store Refund from Apple:
              </h3>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-[var(--label-2)]">
                <li>
                  Go to Apple&apos;s official refund portal:{" "}
                  <a
                    href="https://reportaproblem.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white underline hover:text-blue-400 font-mono inline-flex items-center gap-1"
                  >
                    <span>reportaproblem.apple.com</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Sign in with the <strong className="text-white">Apple ID</strong> used to make the purchase.</li>
                <li>Under <em>&ldquo;What can we help you with?&rdquo;</em>, select <strong className="text-white">&ldquo;Request a refund&rdquo;</strong>.</li>
                <li>Choose the reason that best describes your request, select <strong className="text-white">IMPROVE</strong> from your purchased items, and submit.</li>
              </ol>
              <p className="text-xs text-[var(--label-3)]">
                Apple generally reviews and provides an outcome within 24 to 48 hours.
              </p>
            </div>
          </div>

          {/* Section 2: Direct Website Purchases */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-6 bg-emerald-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white tracking-tight">
                2. Direct Web Purchases (14-Day Guarantee)
              </h2>
            </div>
            <div className="space-y-4">
              <p>
                If you purchased an IMPROVE membership, license, or lifetime access pass directly on our website (<strong className="text-white">improve-club.com</strong>) processed via Stripe:
              </p>
              <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01] space-y-2">
                <div className="font-semibold text-white flex items-center gap-2 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>14-Day Unconditional Money-Back Guarantee</span>
                </div>
                <p className="text-xs text-[var(--label-2)]">
                  If you are not completely satisfied with your web membership for any reason within 14 days of your initial purchase date, email us at{" "}
                  <a href="mailto:billing@improve-club.com" className="text-white underline font-mono">
                    billing@improve-club.com
                  </a>{" "}
                  with your receipt or purchase email address. We will issue a 100% full refund back to your original payment method, no questions asked.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Subscription Auto-Renewal & Cancellation */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-2 h-6 bg-amber-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white tracking-tight">
                3. Auto-Renewal & How to Cancel
              </h2>
            </div>
            <div className="space-y-4">
              <p>
                Recurring subscriptions renew automatically at the end of each billing cycle (monthly or annually) unless canceled at least <strong className="text-white">24 hours</strong> before the renewal date.
              </p>
              
              <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 space-y-2">
                <h4 className="font-semibold text-white text-xs">How to Cancel on iPhone or iPad:</h4>
                <ol className="list-decimal pl-5 space-y-1.5 text-xs text-[var(--label-2)]">
                  <li>Open the <strong className="text-white">Settings</strong> app on your device.</li>
                  <li>Tap your <strong className="text-white">Apple ID Name</strong> at the top.</li>
                  <li>Tap <strong className="text-white">Subscriptions</strong>.</li>
                  <li>Find and tap <strong className="text-white">IMPROVE</strong>.</li>
                  <li>Tap <strong className="text-rose-400">Cancel Subscription</strong>.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed space-y-1">
                <strong>IMPORTANT NOTE ON DELETING THE APP:</strong>
                <p>
                  In accordance with Apple App Store rules, deleting the app from your iPhone or deleting your local account <strong>does NOT automatically cancel</strong> your active Apple subscription. You must cancel the subscription in your Apple ID Settings to stop future renewals.
                </p>
              </div>
            </div>
          </div>

          {/* Section 4: What Happens When You Cancel */}
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-2 h-6 bg-purple-500 rounded-full" />
              <h2 className="text-2xl font-bold text-white tracking-tight">
                4. Access Following Cancellation
              </h2>
            </div>
            <p>
              When you cancel a subscription, your premium features remain fully unlocked until the conclusion of your current paid billing period. After this date, your subscription will not renew, and your account will automatically transition to the basic tier without charging your card.
            </p>
          </div>
        </div>

        {/* Contact Footer */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-white">Need assistance with a purchase or billing question?</h4>
            <p className="text-xs text-[var(--label-2)]">
              Our support team answers all billing inquiries within 24 hours.
            </p>
          </div>
          <a
            href="mailto:billing@improve-club.com"
            className="px-5 py-2.5 rounded-xl border border-white/20 bg-white hover:bg-white/90 text-black text-xs font-bold transition-all shadow-md flex items-center gap-2"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact Billing Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
