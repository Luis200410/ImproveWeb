"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  Sparkles, 
  Smartphone, 
  KeyRound, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  Trash2, 
  Users, 
  Layers, 
  ChevronRight,
  EyeOff,
  Cloud,
  Cpu,
  Share2,
  Mail,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { APPS_DATA } from "@/lib/apps-data";

export default function PrivacyPolicyPage() {
  const [copied, setCopied] = useState(false);

  const plainTextDraft = `Improve Privacy Policy — Effective October 10, 2026

This policy covers the Improve apps, including Productivity and Second Brain, made by IMPROVE ("we"). Contact: privacy@improve-club.com.

The short version
We don't collect your data. We have no servers that receive it, we don't track you, we don't show ads, and we don't use analytics or third-party SDKs. Your data stays on your device and, if you subscribe to Improve, in your own private iCloud account, which we can't access.

What the apps store
Account: the identifier, name and email Sign in with Apple provides (the email may be a private relay address).
Productivity: habits, schedules and completions, focus sessions, goals, plans and reviews, the apps you choose to block (as anonymous tokens from Apple — we can't see which apps), and when a blocked app was opened during a session.
Second Brain: projects, tasks, notes, drawings, saved links and files, and Inbox captures, including voice recordings, transcripts and photos.
Settings, subscription status and content created by the on-device AI (Coach conversations, summaries, suggestions).

Where it's stored
On your device. With an Improve subscription, it syncs through Apple's iCloud to your own private database so your devices stay in step. Apple's privacy policy applies to iCloud. On the Free plan nothing syncs.

Artificial intelligence
AI features run on your device with Apple Intelligence. Your text, voice and photos are not sent to us or to any AI provider. Voice is transcribed on your device.

Screen Time
Productivity uses Apple's Screen Time framework to block the apps you choose during your habits. Apple gives the app anonymous tokens rather than app names, and usage reports are drawn by Apple inside a sandbox the app can't read from. We never receive your Screen Time data.

Permissions
The apps ask for Screen Time, alarms, notifications, calendars, reminders, microphone, speech recognition, camera and Face ID only to provide the matching feature. You can change these in iOS Settings at any time.

Services you choose to use
Second Brain can connect to GitHub, Linear, Notion and Todoist if you add your own access token. Requests go directly from your device to that service under its own privacy policy. Your token is stored in your device's Keychain.
When you save or embed a link, the app requests that web page directly so it can show and summarize it on your device.
Productivity looks up public app names and icons from Apple's App Store service.
Purchases are processed by Apple. We never see your payment details.

Sharing
We don't sell, rent or share your personal information, because we don't receive it.

Deleting your data
Settings ▸ Delete Account removes all Improve data from your device and from your iCloud and signs you out. You can also stop using Sign in with Apple for Improve in iOS Settings ▸ [your name] ▸ Sign-In & Security ▸ Sign in with Apple. Deleting the app removes the data stored on that device.

Children
The apps are not directed to children under 13 (or 16 in the EU).

Your rights
Because your data stays under your control, you can view, change, export (Share) or delete it inside the apps at any time. For any question, email privacy@improve-club.com.

Changes
If we change this policy, we'll update the date above and, for significant changes, tell you in the app.`;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(plainTextDraft);
      setCopied(true);
      toast.success("Privacy policy text copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Failed to copy text");
    }
  };

  return (
    <div className="min-h-screen text-[var(--label)] selection:bg-white/20" style={{ fontFamily: "var(--font-ios)" }}>
      {/* Background ambient lighting */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[20%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[35%] bg-emerald-500/10 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-12">
        {/* Header Badge & Title */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero Data Collection • 100% Private</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
            Improve <span className="text-white/40">Privacy Policy</span>
          </h1>

          <p className="text-sm md:text-base text-[var(--label-2)] leading-relaxed max-w-2xl mx-auto">
            This policy covers the Improve apps, including Productivity and Second Brain, made by <strong className="text-white">IMPROVE</strong> (&ldquo;we&rdquo;).
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs text-[var(--label-3)]">
            <span>Effective: October 10, 2026</span>
            <span>•</span>
            <a href="mailto:privacy@improve-club.com" className="text-white underline hover:text-emerald-400 transition-colors">
              privacy@improve-club.com
            </a>
          </div>

          <div className="pt-2">
            <button
              onClick={handleCopyText}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white transition-all active:scale-95 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied Plain Text" : "Copy Plain Text"}</span>
            </button>
          </div>
        </div>

        {/* The Short Version — Hero Box */}
        <div className="access-glass p-8 md:p-10 space-y-4 border border-emerald-500/20 shadow-2xl">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-wider font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>The Short Version</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            We don&apos;t collect your data.
          </h2>
          <p className="text-sm md:text-base text-white/80 leading-relaxed">
            We have no servers that receive it, we don&apos;t track you, we don&apos;t show ads, and we don&apos;t use analytics or third-party SDKs. Your data stays on your device and, if you subscribe to Improve, in your own private iCloud account, which we can&apos;t access.
          </p>
        </div>

        {/* Detailed Policy Sections */}
        <div className="space-y-6">
          {/* Section 1: What the apps store */}
          <div className="access-glass p-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                What the apps store
              </h3>
            </div>
            <div className="space-y-3.5 text-sm text-[var(--label-2)] leading-relaxed">
              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Account</h4>
                <p>The identifier, name and email Sign in with Apple provides (the email may be a private relay address).</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Productivity</h4>
                <p>Habits, schedules and completions, focus sessions, goals, plans and reviews, the apps you choose to block (as anonymous tokens from Apple — we can&apos;t see which apps), and when a blocked app was opened during a session.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">Second Brain</h4>
                <p>Projects, tasks, notes, drawings, saved links and files, and Inbox captures, including voice recordings, transcripts and photos.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
                <h4 className="font-semibold text-white text-xs uppercase tracking-wider">AI & Preferences</h4>
                <p>Settings, subscription status and content created by the on-device AI (Coach conversations, summaries, suggestions).</p>
              </div>
            </div>
          </div>

          {/* Section 2: Where it's stored */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <Cloud className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Where it&apos;s stored
              </h3>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              <strong className="text-white">On your device.</strong> With an Improve subscription, it syncs through Apple&apos;s iCloud to your own private database so your devices stay in step. Apple&apos;s privacy policy applies to iCloud. On the Free plan nothing syncs.
            </p>
          </div>

          {/* Section 3: Artificial intelligence */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Artificial intelligence
              </h3>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              AI features run on your device with <strong className="text-white">Apple Intelligence</strong>. Your text, voice and photos are not sent to us or to any AI provider. Voice is transcribed on your device.
            </p>
          </div>

          {/* Section 4: Screen Time */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Smartphone className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Screen Time
              </h3>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              Productivity uses Apple&apos;s Screen Time framework to block the apps you choose during your habits. Apple gives the app anonymous tokens rather than app names, and usage reports are drawn by Apple inside a sandbox the app can&apos;t read from. We never receive your Screen Time data.
            </p>
          </div>

          {/* Section 5: Permissions */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Permissions
              </h3>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              The apps ask for Screen Time, alarms, notifications, calendars, reminders, microphone, speech recognition, camera and Face ID only to provide the matching feature. You can change these in iOS Settings at any time.
            </p>
          </div>

          {/* Section 6: Services you choose to use */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Services you choose to use
              </h3>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-sm text-[var(--label-2)] leading-relaxed">
              <li>
                <strong className="text-white">External Integrations:</strong> Second Brain can connect to GitHub, Linear, Notion and Todoist if you add your own access token. Requests go directly from your device to that service under its own privacy policy. Your token is stored in your device&apos;s Keychain.
              </li>
              <li>
                <strong className="text-white">Links & Summaries:</strong> When you save or embed a link, the app requests that web page directly so it can show and summarize it on your device.
              </li>
              <li>
                <strong className="text-white">App Metadata:</strong> Productivity looks up public app names and icons from Apple&apos;s App Store service.
              </li>
              <li>
                <strong className="text-white">In-App Purchases:</strong> Purchases are processed by Apple. We never see your payment details.
              </li>
            </ul>
          </div>

          {/* Section 7: Sharing */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Sharing
              </h3>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              We don&apos;t sell, rent or share your personal information, because we don&apos;t receive it.
            </p>
          </div>

          {/* Section 8: Deleting your data */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Deleting your data
              </h3>
            </div>
            <div className="text-sm text-[var(--label-2)] space-y-2 leading-relaxed">
              <p>
                <strong className="text-white">Settings ▸ Delete Account</strong> removes all Improve data from your device and from your iCloud and signs you out.
              </p>
              <p>
                You can also stop using Sign in with Apple for Improve in <strong className="text-white">iOS Settings ▸ [your name] ▸ Sign-In & Security ▸ Sign in with Apple</strong>. Deleting the app removes the data stored on that device.
              </p>
            </div>
          </div>

          {/* Section 9: Children */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Children
              </h3>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              The apps are not directed to children under 13 (or 16 in the EU).
            </p>
          </div>

          {/* Section 10: Your rights */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Your rights
              </h3>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              Because your data stays under your control, you can view, change, export (Share) or delete it inside the apps at any time. For any question, email{" "}
              <a href="mailto:privacy@improve-club.com" className="text-white underline hover:text-emerald-400 transition-colors">
                privacy@improve-club.com
              </a>.
            </p>
          </div>

          {/* Section 11: Changes */}
          <div className="access-glass p-8 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Changes
              </h3>
            </div>
            <p className="text-sm text-[var(--label-2)] leading-relaxed">
              If we change this policy, we&apos;ll update the date above and, for significant changes, tell you in the app.
            </p>
          </div>
        </div>

        {/* Quick Links to Terms and Refund */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/terms"
            className="access-glass p-5 flex items-center justify-between group hover:border-white/20 transition-all"
          >
            <div>
              <div className="text-xs text-[var(--label-3)] uppercase tracking-wider">Related Policy</div>
              <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Terms of Use</div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/refund"
            className="access-glass p-5 flex items-center justify-between group hover:border-white/20 transition-all"
          >
            <div>
              <div className="text-xs text-[var(--label-3)] uppercase tracking-wider">Billing Terms</div>
              <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Refund Policy</div>
            </div>
            <ArrowRight className="w-4 h-4 text-white/40 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Contact Footer Card */}
        <div className="access-glass p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-white">Have questions about your privacy?</h4>
            <p className="text-xs text-[var(--label-2)]">
              Our team is directly reachable for any security or privacy questions.
            </p>
          </div>
          <a
            href="mailto:privacy@improve-club.com"
            className="px-5 py-2.5 rounded-xl border border-white/20 bg-white hover:bg-white/90 text-black text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>privacy@improve-club.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}
