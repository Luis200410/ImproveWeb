import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  getAppPrivacyProfile, 
  APPS_PRIVACY_PROFILES, 
  APPS_DATA 
} from "@/lib/apps-data";
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft, 
  ExternalLink, 
  HelpCircle, 
  Trash2, 
  Layers, 
  ChevronRight,
  Activity,
  Brain,
  Wallet,
  Briefcase,
  Users,
  Compass
} from "lucide-react";

interface AppPrivacyPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const iconMap: Record<string, any> = {
  Activity,
  Brain,
  Wallet,
  Briefcase,
  Users,
  Compass,
  CheckCircle2,
};

export async function generateStaticParams() {
  return [
    { slug: "relationships-capital" },
    { slug: "relationships" },
    { slug: "mind-emotions" },
    { slug: "mind" },
    { slug: "productivity" },
    { slug: "professional-mastery" },
    { slug: "work" },
    { slug: "body-optimization" },
    { slug: "body" },
    { slug: "second-brain" },
    { slug: "money-wealth" },
    { slug: "money" },
  ];
}

export default async function AppPrivacyPage({ params }: AppPrivacyPageProps) {
  const { slug } = await params;
  const profile = getAppPrivacyProfile(slug);

  if (!profile) {
    notFound();
  }

  const AppIcon = iconMap[profile.iconName] || ShieldCheck;

  return (
    <div className="min-h-screen bg-black text-[var(--label)] selection:bg-white/20" style={{ fontFamily: "var(--font-ios)" }}>
      {/* Dynamic Background Tint based on App Brand Color */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute top-[8%] left-[20%] w-[55%] h-[45%] rounded-full blur-[160px] opacity-15"
          style={{ backgroundColor: profile.accentHex }}
        />
        <div className="absolute top-[50%] right-[10%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-32 pb-24 space-y-14">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[var(--label-2)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>General Privacy Hub</span>
          </Link>

          <div className="flex items-center gap-2 text-xs font-mono text-[var(--label-3)]">
            <span>APP SPECIFICATION</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-bold" style={{ color: profile.accentHex }}>
              {profile.singleWord}
            </span>
          </div>
        </div>

        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div 
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono uppercase tracking-wider"
            style={{ 
              borderColor: `${profile.accentHex}40`, 
              backgroundColor: `${profile.accentHex}15`,
              color: profile.accentHex
            }}
          >
            <AppIcon className="w-3.5 h-3.5" />
            <span>{profile.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
            {profile.appName} <span className="text-white/40">Privacy</span>
          </h1>

          <p className="text-sm md:text-base text-[var(--label-2)] leading-relaxed">
            {profile.summary}
          </p>

          <div className="pt-2 text-xs font-mono text-[var(--label-3)]">
            Dedicated App Store & Plaid Policy • Last Audited: September 30, 2026
          </div>
        </div>

        {/* Ecosystem App Switcher Dock */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--label-3)] mb-2 px-2 text-center">
            Switch to Another Dedicated App Policy:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href="/privacy"
              className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
            >
              General Hub
            </Link>
            {APPS_DATA.map((app) => {
              const isActive = app.slug === profile.appSlug;
              return (
                <Link
                  key={app.id}
                  href={`/privacy/${app.slug}`}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white text-black font-bold shadow-md shadow-white/10"
                      : "border border-white/5 bg-white/[0.02] text-[var(--label-2)] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-60 mr-1.5">{app.number}</span>
                  <span>{app.singleWord}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 1. Device Permissions Requested */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
            <span className="w-2 h-5 rounded-full" style={{ backgroundColor: profile.accentHex }} />
            1. Permissions Requested & Purpose
          </h2>
          <div className="space-y-4">
            {profile.permissionsRequired.map((perm, idx) => (
              <div 
                key={idx}
                className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-semibold text-white text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{perm.name}</span>
                    {perm.isOptional && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white/70">
                        OPTIONAL
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--label-2)]">
                    {perm.purpose}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Data Comparison Grid: What is Handled vs What is NEVER Collected */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Handled Locally */}
          <div className="p-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.02] space-y-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Data Handled Strictly On-Device & iCloud</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--label-2)]">
              {profile.dataHandledLocally.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-mono font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Data Never Collected */}
          <div className="p-6 rounded-3xl border border-rose-500/20 bg-rose-500/[0.02] space-y-4">
            <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
              <XCircle className="w-5 h-5" />
              <span>Data NEVER Collected, Uploaded, or Shared</span>
            </div>
            <ul className="space-y-2.5 text-xs text-[var(--label-2)]">
              {profile.dataNeverCollected.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-mono font-bold">✕</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3. Special App Specific Sections (Plaid for Money, HealthKit for Body) */}
        {profile.appSlug === "money-wealth" && (
          <div className="p-8 rounded-3xl border border-amber-500/30 bg-amber-500/[0.03] backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-400" />
              <span>Plaid Financial Consent & Stateless Gateway Disclosures</span>
            </h3>
            <p className="text-xs text-[var(--label-2)] leading-relaxed">
              When linking bank accounts in IMPROVE Money, your credentials are encrypted directly by Plaid Inc. Our edge gateway executes Plaid API actions in-memory with zero persistence: no databases, no caching, and no logs of your bank balances, transactions, or account numbers.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <a
                href="https://plaid.com/legal/#end-user-privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-300 underline hover:text-white transition-colors"
              >
                <span>Plaid End User Privacy Policy</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://plaid.com/legal/#end-user-services-agreement"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-amber-300 underline hover:text-white transition-colors"
              >
                <span>Plaid End User Services Agreement</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {profile.appSlug === "body-optimization" && (
          <div className="p-8 rounded-3xl border border-green-500/30 bg-green-500/[0.03] backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-400" />
              <span>Apple HealthKit Privacy Guarantee</span>
            </h3>
            <p className="text-xs text-[var(--label-2)] leading-relaxed">
              In full accordance with Apple HealthKit Developer Guidelines, IMPROVE Body never sells, monetizes, or shares health metrics with marketing firms, advertisers, or insurance brokers. All sleep, recovery velocity, and HRV synthesis happens directly on your device.
            </p>
          </div>
        )}

        {profile.appSlug === "productivity" && (
          <div className="p-8 rounded-3xl border border-fuchsia-500/30 bg-fuchsia-500/[0.03] backdrop-blur-md space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-fuchsia-400" />
              <span>Screen Time & Family Controls Privacy Sandbox</span>
            </h3>
            <p className="text-xs text-[var(--label-2)] leading-relaxed">
              App blocking uses Apple’s native Family Controls framework. iOS provides opaque tokens to shield apps during habit routines. IMPROVE cannot view your browsing habits, screen contents, or list of installed apps.
            </p>
          </div>
        )}

        {/* 4. Dedicated App FAQs (Solving User Doubts) */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-blue-400" />
              <span>Common Questions & Privacy Doubts for {profile.appName}</span>
            </h2>
            <span className="text-xs font-mono text-[var(--label-3)]">
              {profile.faqs.length} Answers
            </span>
          </div>

          <div className="space-y-4">
            {profile.faqs.map((faq, idx) => (
              <div 
                key={idx}
                className="p-5 rounded-2xl border border-white/5 bg-white/[0.01] space-y-2"
              >
                <h4 className="font-semibold text-white text-sm">
                  {faq.question}
                </h4>
                <p className="text-xs text-[var(--label-2)] leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Account Deletion & Data Rights */}
        <div className="p-8 rounded-3xl border border-purple-500/20 bg-purple-500/[0.02] backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
            <Trash2 className="w-4 h-4" />
            <span>App Store Guideline 5.1.1(v) — Complete Data Revocation</span>
          </div>
          <p className="text-xs text-[var(--label-2)] leading-relaxed">
            Because {profile.appName} stores zero user records on central servers, you possess absolute deletion authority. Tapping <strong>&ldquo;Clear App Data&rdquo;</strong> in Settings immediately wipes local SwiftData stores and purges any connected tokens.
          </p>
        </div>

        {/* Contact Footer */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[var(--label-2)] text-center sm:text-left">
            Need specific compliance verification or have questions regarding {profile.appName}?
          </div>
          <a
            href="mailto:privacy@improve-club.com"
            className="px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors"
          >
            Contact Privacy Officer
          </a>
        </div>
      </div>
    </div>
  );
}
