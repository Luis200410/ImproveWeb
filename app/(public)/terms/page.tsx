"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  ShieldCheck, 
  CreditCard, 
  RotateCcw, 
  Smartphone, 
  Sparkles, 
  Link2, 
  AlertTriangle, 
  Copy, 
  Check, 
  Trash2, 
  Scale, 
  Mail, 
  ArrowRight,
  CheckCircle2
} from "lucide-react";
import { toast } from "sonner";

export default function TermsOfUsePage() {
  const [copied, setCopied] = useState(false);

  const plainTextDraft = `Improve Terms of Use — Effective October 10, 2026

These terms are between you and IMPROVE ("we") and cover the Improve apps, including Productivity and Second Brain. By using the apps you agree to them and to Apple's Licensed Application End User License Agreement, which also applies.

Plans and subscription
Each app has a Free plan with limits — for example, Productivity Free includes up to 3 habits and 1 Big Four goal, and Second Brain Free includes up to 3 active projects.
Improve is an auto-renewing subscription at $39.99 per month (or the local equivalent shown in the App Store). One subscription unlocks the paid features in every Improve app, including iCloud sync, widgets, calendar scheduling, AI features and Siri shortcuts.
Payment is charged to your Apple ID at confirmation. The subscription renews automatically unless canceled at least 24 hours before the end of the current period. Manage or cancel in iOS Settings ▸ [your name] ▸ Subscriptions.
If you subscribe in one Improve app, the other Improve apps on your devices recognize it. Occasionally you may need to open the app you subscribed in so a renewal can be confirmed.
We may change what each plan includes or the price. Price changes follow Apple's rules and notices.

Your content
You own what you create in the apps. We don't receive it, so we don't claim any rights to it. You're responsible for keeping backups; iCloud sync is a convenience, not a backup guarantee.

App blocking and alarms
Productivity uses Apple's Screen Time and alarm features. They depend on iOS, your permissions and device settings, so blocking and alarms are not guaranteed to work every time. Don't rely on the apps for anything safety-critical, and you can always end a session.

AI features
AI suggestions, plans and summaries are generated automatically on your device and can be wrong. They aren't professional, medical, financial or legal advice.

Connected services
If you connect GitHub, Linear, Notion, Todoist or other services, their terms apply to that use. We aren't responsible for those services.

Acceptable use
Don't reverse-engineer, resell or misuse the apps, or use them to break the law.

Disclaimers and liability
The apps are provided "as is". To the extent the law allows, we aren't liable for indirect or consequential damages or lost data, and our total liability is limited to what you paid us in the 12 months before the claim. Apple has no obligation to provide maintenance or support for the apps and isn't responsible for claims about them.

Ending use
You can stop at any time and delete your data in Settings ▸ Delete Account. Canceling the subscription is done through Apple.

Law and contact
These terms are governed by the laws of Delaware, United States. Questions: support@improve-club.com.`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextDraft);
      setCopied(true);
      toast.success("Terms of Use text copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  return (
    <div className="min-h-screen text-[var(--label)] selection:bg-white/20" style={{ fontFamily: "var(--font-ios)" }}>
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[8%] left-[20%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[45%] right-[15%] w-[40%] h-[35%] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs uppercase tracking-wider text-blue-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
            Improve <span className="text-white/40">Terms of Use</span>
          </h1>

          <p className="text-sm md:text-base text-[var(--label-2)] leading-relaxed max-w-2xl mx-auto">
            These terms are between you and <strong className="text-white">IMPROVE</strong> (&ldquo;we&rdquo;) and cover the Improve apps, including Productivity and Second Brain. By using the apps you agree to them and to Apple&apos;s Licensed Application End User License Agreement (EULA), which also applies.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-[var(--label-3)]">
            <span>Effective: October 10, 2026</span>
            <span>•</span>
            <a href="mailto:support@improve-club.com" className="text-white underline hover:text-blue-400 transition-colors">
              support@improve-club.com
            </a>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-blue-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Plain Text" : "Copy Plain Text"}</span>
            </button>
          </div>
        </div>

        {/* Quick Nav to Privacy & Refund */}
        <div className="access-glass p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[var(--label-2)] text-center sm:text-left">
            Looking for our <strong className="text-white">Zero Data Collection Privacy Policy</strong> or <strong className="text-white">Refund Procedure</strong>?
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/privacy"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy</span>
            </Link>
            <Link
              href="/refund"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Refunds</span>
            </Link>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {/* Section 1: Plans and subscription */}
          <div className="access-glass p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Plans and subscription
              </h2>
            </div>
            
            <div className="space-y-3.5 text-sm text-[var(--label-2)] leading-relaxed">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Free Plans</h4>
                <p>
                  Each app has a Free plan with limits — for example, Productivity Free includes up to 3 habits and 1 Big Four goal, and Second Brain Free includes up to 3 active projects.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Improve Unified Subscription</h4>
                <p>
                  Improve is an auto-renewing subscription at <strong className="text-white">$39.99 per month</strong> (or the local equivalent shown in the App Store). One subscription unlocks the paid features in every Improve app, including iCloud sync, widgets, calendar scheduling, AI features and Siri shortcuts.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Billing & Cancellation</h4>
                <p>
                  Payment is charged to your Apple ID at confirmation. The subscription renews automatically unless canceled at least 24 hours before the end of the current period. Manage or cancel in <strong className="text-white">iOS Settings ▸ [your name] ▸ Subscriptions</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Cross-App Recognition</h4>
                <p>
                  If you subscribe in one Improve app, the other Improve apps on your devices recognize it. Occasionally you may need to open the app you subscribed in so a renewal can be confirmed.
                </p>
              </div>

              <p className="text-xs text-[var(--label-3)] pt-1">
                We may change what each plan includes or the price. Price changes follow Apple&apos;s rules and notices.
              </p>
            </div>
          </div>

          {/* Section 2: Your content */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Your content
              </h2>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              <strong className="text-white">You own what you create in the apps.</strong> We don&apos;t receive it, so we don&apos;t claim any rights to it. You&apos;re responsible for keeping backups; iCloud sync is a convenience, not a backup guarantee.
            </p>
          </div>

          {/* Section 3: App blocking and alarms */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                App blocking and alarms
              </h2>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              Productivity uses Apple&apos;s Screen Time and alarm features. They depend on iOS, your permissions and device settings, so blocking and alarms are not guaranteed to work every time. Don&apos;t rely on the apps for anything safety-critical, and you can always end a session.
            </p>
          </div>

          {/* Section 4: AI features */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                AI features
              </h2>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              AI suggestions, plans and summaries are generated automatically on your device and can be wrong. They aren&apos;t professional, medical, financial or legal advice.
            </p>
          </div>

          {/* Section 5: Connected services */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Link2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Connected services
              </h2>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              If you connect GitHub, Linear, Notion, Todoist or other services, their terms apply to that use. We aren&apos;t responsible for those services.
            </p>
          </div>

          {/* Section 6: Acceptable use */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Acceptable use
              </h2>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              Don&apos;t reverse-engineer, resell or misuse the apps, or use them to break the law.
            </p>
          </div>

          {/* Section 7: Disclaimers and liability */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Disclaimers and liability
              </h2>
            </div>
            <div className="text-sm text-[var(--label-2)] space-y-3 leading-relaxed">
              <p>
                The apps are provided &ldquo;as is&rdquo;. To the extent the law allows, we aren&apos;t liable for indirect or consequential damages or lost data, and our total liability is limited to what you paid us in the 12 months before the claim.
              </p>
              <p>
                Apple has no obligation to provide maintenance or support for the apps and isn&apos;t responsible for claims about them.
              </p>
            </div>
          </div>

          {/* Section 8: Ending use */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Ending use
              </h2>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              You can stop at any time and delete your data in <strong className="text-white">Settings ▸ Delete Account</strong>. Canceling the subscription is done through Apple.
            </p>
          </div>

          {/* Section 9: Law and contact */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Scale className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Law and contact
              </h2>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              These terms are governed by the laws of Delaware, United States. For any questions, contact{" "}
              <a href="mailto:support@improve-club.com" className="text-white underline hover:text-blue-400 transition-colors">
                support@improve-club.com
              </a>.
            </p>
          </div>
        </div>

        {/* Footer Contact Card */}
        <div className="access-glass p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-white">Questions about our Terms of Use?</h4>
            <p className="text-xs text-[var(--label-2)]">
              We are happy to answer any questions about our licensing or policies.
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
