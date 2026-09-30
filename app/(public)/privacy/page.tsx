"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  Lock, 
  Database, 
  KeyRound, 
  FileText, 
  Trash2, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  ChevronRight,
  RefreshCw,
  EyeOff,
  HelpCircle,
  Activity,
  Brain,
  Wallet,
  Briefcase,
  Users,
  Compass
} from "lucide-react";
import { APPS_DATA } from "@/lib/apps-data";

const iconMap: Record<string, any> = {
  Activity,
  Brain,
  Wallet,
  Briefcase,
  Users,
  Compass,
  CheckCircle2
};

export default function PrivacyAndConsentPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "plaid" | "terms" | "deletion" | "faq">("privacy");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "plaid" || hash === "financial-consent") setActiveTab("plaid");
      else if (hash === "terms" || hash === "terms-of-service") setActiveTab("terms");
      else if (hash === "deletion" || hash === "revocation") setActiveTab("deletion");
      else if (hash === "faq" || hash === "doubts") setActiveTab("faq");
    }
  }, []);

  const globalFaqs = [
    {
      q: "Does IMPROVE store my personal notes, habits, or bank credentials on a server?",
      a: "No. IMPROVE operates a Zero First-Party Database architecture. Your habit records, reflections, and notes are stored strictly on your local device hardware (protected by Apple Class A encryption) and synchronized directly through your private Apple iCloud container. We never possess, see, or store your passwords or banking logins."
    },
    {
      q: "How does IMPROVE Money connect to banks without storing my financial data?",
      a: "When you link a bank, your credentials are authenticated directly inside Plaid's encrypted dialog. IMPROVE never sees or holds your login credentials. Our Supabase Edge Function acts purely as a stateless, in-memory pass-through bridge to communicate with Plaid. It contains zero database tables, zero user rows, and strictly never logs request payloads, balances, or transactions."
    },
    {
      q: "Do you train AI models on my private journals, thoughts, or budget entries?",
      a: "Never. All AI summarization, reflection prompts, and habit intelligence run 100% on-device using Apple Neural Engine and CoreML. Your unencrypted personal content is never sent to external AI APIs or used to train public machine learning datasets."
    },
    {
      q: "Do you track my location or sell my data to advertising brokers?",
      a: "Never. IMPROVE contains zero advertising SDKs, zero third-party tracking pixels (no Facebook, Google Analytics, or data brokers), and we never request or track your advertising identifier (IDFA)."
    },
    {
      q: "How does Sign in with Apple protect my identity?",
      a: "We authenticate you using Sign in with Apple without capturing your real name or email address. Our edge proxy verifies Apple's cryptographic signature against Apple's public keys (JWKS) and generates a one-way SHA-256 hash of your anonymous Apple subject ID to issue an ephemeral 90-day session token."
    },
    {
      q: "How do I permanently delete my account and revoke third-party permissions?",
      a: "In full compliance with Apple App Store Guideline 5.1.1(v), you can tap 'Delete Account & Revoke Credentials' inside Settings. This immediately severs your Sign in with Apple tokens, invokes Plaid's /item/remove to destroy all bank API tokens, and purges all local data from your device."
    },
    {
      q: "What happens if I lose or change my iPhone?",
      a: "Because your data is synchronized via your private Apple iCloud account, signing in with your Apple ID on a new Apple device automatically restores your encrypted habit streaks and settings without passing through any developer server."
    },
    {
      q: "Can my employer, bank, or insurance provider access my IMPROVE records?",
      a: "No. IMPROVE is a personal consumer application with no corporate administrator portals, employer monitoring integrations, or data sharing with insurers. Your records are completely sovereign to you."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-[var(--label)] selection:bg-white/20 font-sans">
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[5%] left-[20%] w-[50%] h-[40%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] right-[10%] w-[40%] h-[35%] bg-emerald-500/10 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-32 pb-24 space-y-16">
        {/* Header Badge & Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Complete Integrity & User Sovereignty</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white uppercase italic">
            Privacy & <span className="text-white/40">Consent</span>
          </h1>

          <p className="text-sm md:text-base text-[var(--label-2)] leading-relaxed">
            Our architectural commitment: <strong className="text-white">Zero first-party storage</strong>, on-device encryption, ephemeral financial proxying via Plaid, and full compliance with Apple App Store Guidelines.
          </p>

          <div className="pt-2 text-xs font-mono text-[var(--label-3)]">
            Last Updated & Verified: September 30, 2026 • Effective across all IMPROVE Applications
          </div>
        </div>

        {/* 7 Dedicated App Policies Directory */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                <span>Dedicated App Privacy Specifications</span>
              </h3>
              <p className="text-xs text-[var(--label-2)]">
                Every application in the IMPROVE ecosystem features an audited, dedicated privacy policy:
              </p>
            </div>
            <span className="text-xs font-mono text-[var(--label-3)]">7 SYSTEM POLICIES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {APPS_DATA.map((app) => {
              const AppIcon = iconMap[app.iconName] || ShieldCheck;
              return (
                <Link
                  key={app.id}
                  href={`/privacy/${app.slug}`}
                  className="group p-4 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div 
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                        style={{ backgroundColor: `${app.accentHex}20`, color: app.accentHex }}
                      >
                        <AppIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[var(--label-3)] group-hover:text-white transition-colors">
                        {app.number}
                      </span>
                    </div>
                    <div className="font-bold text-white text-xs tracking-wider uppercase group-hover:translate-x-0.5 transition-transform">
                      {app.singleWord}
                    </div>
                    <p className="text-[11px] text-[var(--label-2)] line-clamp-2 leading-relaxed">
                      {app.name}
                    </p>
                  </div>
                  <div className="flex items-center text-[10px] font-mono uppercase tracking-wider text-emerald-400/80 group-hover:text-emerald-400 gap-1">
                    <span>View Policy</span>
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 max-w-3xl mx-auto">
          <button
            onClick={() => setActiveTab("privacy")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              activeTab === "privacy"
                ? "bg-white text-black shadow-lg shadow-white/10 font-bold"
                : "text-[var(--label-2)] hover:text-white"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>General Policy</span>
          </button>

          <button
            onClick={() => setActiveTab("plaid")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              activeTab === "plaid"
                ? "bg-white text-black shadow-lg shadow-white/10 font-bold"
                : "text-[var(--label-2)] hover:text-white"
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Financial Consent (Plaid)</span>
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              activeTab === "faq"
                ? "bg-white text-black shadow-lg shadow-white/10 font-bold"
                : "text-[var(--label-2)] hover:text-white"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Solving Doubts (FAQ)</span>
          </button>

          <button
            onClick={() => setActiveTab("terms")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              activeTab === "terms"
                ? "bg-white text-black shadow-lg shadow-white/10 font-bold"
                : "text-[var(--label-2)] hover:text-white"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Terms of Service</span>
          </button>

          <button
            onClick={() => setActiveTab("deletion")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-medium transition-all ${
              activeTab === "deletion"
                ? "bg-white text-black shadow-lg shadow-white/10 font-bold"
                : "text-[var(--label-2)] hover:text-white"
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Revocation & Rights</span>
          </button>
        </div>

        {/* TAB 1: PRIVACY POLICY */}
        {activeTab === "privacy" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                1. Architectural Privacy by Design
              </h2>
              <div className="text-sm text-[var(--label-2)] space-y-4 leading-relaxed">
                <p>
                  At <strong className="text-white">IMPROVE</strong>, we believe the only truly secure data is data that is never collected. Unlike legacy productivity and personal finance apps that monetize user dossiers, sell transaction histories to data brokers, or use third-party tracking pixels, IMPROVE is built upon a <strong>Zero-Knowledge, Sovereign Architecture</strong>.
                </p>
                <p>
                  We do not operate backend databases for user content. We do not require you to create an account with our servers. Your habit logs, journal reflections, financial summaries, and personal workflows live solely on your own physical hardware and inside your private Apple iCloud container.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                2. Information Collection and Storage
              </h2>
              <div className="space-y-4 text-sm text-[var(--label-2)] leading-relaxed">
                <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    On-Device Storage (Core Data / SwiftData)
                  </h4>
                  <p>
                    All app preferences, category targets, budget rules, transaction categories, and personal tags are stored directly in your device’s local sandbox, protected by iOS Hardware Encryption (Data Protection Class A/B).
                  </p>
                </div>

                <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    Apple iCloud Synchronization (CloudKit)
                  </h4>
                  <p>
                    When sync is active, your data is transferred directly between your Apple devices via Apple CloudKit under your own Apple ID. IMPROVE has no access to your encryption keys, iCloud credentials, or CloudKit container contents.
                  </p>
                </div>

                <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                    Sign in with Apple
                  </h4>
                  <p>
                    We authenticate sessions using Sign in with Apple. Your Apple identity token is verified against Apple’s public JWKS. We calculate a one-way cryptographic SHA-256 hash of your anonymous Apple subject ID to issue an ephemeral session token. We never capture or store your real name, email, or password.
                  </p>
                </div>

                <div className="border border-white/5 p-4 rounded-xl bg-white/[0.01]">
                  <h4 className="font-semibold text-white mb-1 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Zero Analytics & Advertising
                  </h4>
                  <p>
                    We do not embed third-party ad networks, advertising identifiers (IDFA), Facebook SDKs, Google Analytics, or behavior-tracking SDKs. We do not sell, rent, or trade your personal or financial data under any circumstance.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-purple-500 rounded-full" />
                3. On-Device Intelligence
              </h2>
              <p className="text-sm text-[var(--label-2)] leading-relaxed">
                When IMPROVE provides insights, budget alerts, or habit correlation analysis, all model inference and mathematical calculations are executed natively on-device using Apple Neural Engine and CoreML. Your unencrypted financial entries or habits are never sent to external AI providers or server-side LLMs.
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: FINANCIAL CONSENT & PLAID */}
        {activeTab === "plaid" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl border border-emerald-500/20 bg-emerald-500/[0.02] backdrop-blur-md space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-xs uppercase tracking-wider">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Plaid Partner Integration</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Financial Data & Bank Connection Consent
              </h2>
              <p className="text-sm text-[var(--label-2)] leading-relaxed">
                By connecting your financial institution inside <strong className="text-white">IMPROVE Money</strong>, you explicitly authorize IMPROVE and our third-party financial technology provider, <strong className="text-white">Plaid Inc. (&ldquo;Plaid&rdquo;)</strong>, to access, retrieve, and process your financial account information on your behalf.
              </p>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                How Your Financial Data Is Handled (Stateless Proxy Model)
              </h3>
              
              <div className="space-y-4 text-sm text-[var(--label-2)] leading-relaxed">
                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.01] space-y-2">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <span className="text-blue-400 font-mono font-bold">01.</span>
                    Direct Bank Authentication
                  </h4>
                  <p>
                    When linking a bank, your credentials (username, password, MFA codes) are entered directly into Plaid’s encrypted interface. <strong>IMPROVE never sees, transmits, or possesses your bank login credentials.</strong>
                  </p>
                </div>

                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.01] space-y-2">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <span className="text-blue-400 font-mono font-bold">02.</span>
                    The Stateless Edge Proxy
                  </h4>
                  <p>
                    To communicate with Plaid, the app routes requests through a high-performance Supabase Edge Function gateway. This gateway adheres to strict hard rules:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--label-2)]">
                    <li><strong className="text-white">Zero Storage:</strong> No database tables, no Supabase Auth rows, no storage buckets, and no KV caches.</li>
                    <li><strong className="text-white">Zero Sensitive Logging:</strong> The gateway only logs the action name, HTTP status code, and Plaid error code. It strictly never logs payloads, transactions, or account balances.</li>
                    <li><strong className="text-white">In-Memory Only:</strong> Data passes through memory in transient HTTPS streams directly to the iOS app and is never written to disk.</li>
                  </ul>
                </div>

                <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.01] space-y-2">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <span className="text-blue-400 font-mono font-bold">03.</span>
                    Scope of Financial Data Retrieved
                  </h4>
                  <p>
                    IMPROVE Money requests read-only access strictly for:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-[var(--label-2)]">
                    <li>Account information (account name, type, subtype, masked account number).</li>
                    <li>Account balances (current and available balances to compute net worth).</li>
                    <li>Historical and synced transactions (date, amount, merchant name, category).</li>
                  </ul>
                  <p className="pt-2 text-xs text-white/50">
                    IMPROVE Money <strong>does not</strong> initiate payments, move funds, write transfers, or modify your banking records.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-amber-500 rounded-full" />
                Plaid End User Privacy & Legal Terms
              </h3>
              <p className="text-sm text-[var(--label-2)] leading-relaxed">
                By using IMPROVE Money, you acknowledge that Plaid processes and transfers your data in accordance with its own End User Privacy Policy and End User Services Agreement:
              </p>
              <div className="pt-2 flex flex-wrap gap-4">
                <a
                  href="https://plaid.com/legal/#end-user-privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
                >
                  <span>Plaid End User Privacy Policy</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/50" />
                </a>

                <a
                  href="https://plaid.com/legal/#end-user-services-agreement"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-xs font-medium transition-colors"
                >
                  <span>Plaid End User Services Agreement</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white/50" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SOLVING DOUBTS (FAQ) */}
        {activeTab === "faq" && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl border border-blue-500/20 bg-blue-500/[0.02] backdrop-blur-md space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 font-mono text-xs uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Security & Trust Transparency</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Addressing All Security & Privacy Doubts
              </h2>
              <p className="text-sm text-[var(--label-2)] leading-relaxed">
                Clear, direct answers regarding our cryptography, bank connection model, and sovereign data architecture.
              </p>
            </div>

            <div className="space-y-4">
              {globalFaqs.map((faq, idx) => (
                <div 
                  key={idx}
                  className="p-6 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] transition-colors space-y-3"
                >
                  <h3 className="font-bold text-white text-base flex items-start gap-3">
                    <span className="text-blue-400 font-mono font-bold text-xs mt-1">0{idx + 1}.</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs md:text-sm text-[var(--label-2)] pl-6 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: TERMS OF SERVICE */}
        {activeTab === "terms" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                1. Agreement to Terms
              </h2>
              <div className="text-sm text-[var(--label-2)] space-y-4 leading-relaxed">
                <p>
                  These Terms of Service (&ldquo;Terms&rdquo;) constitute a legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;you&rdquo;) and <strong className="text-white">IMPROVE</strong> (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;), governing your access to and use of the IMPROVE iOS mobile applications, website, and associated services.
                </p>
                <p>
                  By downloading, installing, or using any IMPROVE application, you agree to be bound by these Terms and our Privacy & Financial Consent Policy. If you do not agree, you must discontinue use immediately.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-amber-500 rounded-full" />
                2. Financial & Informational Disclaimers
              </h2>
              <div className="text-sm text-[var(--label-2)] space-y-4 leading-relaxed">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed">
                  <strong>CRITICAL FINANCIAL NOTICE:</strong> IMPROVE is a personal organization, productivity, and financial budgeting utility. IMPROVE is <strong>NOT</strong> a bank, financial planner, investment advisor, broker-dealer, tax advisor, or legal firm.
                </div>
                <p>
                  Any charts, ratios, projections, or suggestions provided by the software are for educational, habitual, and informational purposes only. We do not offer personalized investment or tax advice. You are solely responsible for verifying the accuracy of transaction categorization, tax calculations, and investment decisions with your licensed fiduciary or financial professional.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-purple-500 rounded-full" />
                3. Subscriptions & Apple In-App Purchases
              </h2>
              <div className="text-sm text-[var(--label-2)] space-y-4 leading-relaxed">
                <p>
                  Access to premium features across the IMPROVE ecosystem may require an active auto-renewing subscription or lifetime license handled exclusively through Apple In-App Purchases.
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li>Payment is billed to your Apple ID Account upon confirmation of purchase.</li>
                  <li>Subscriptions automatically renew unless auto-renew is cancelled at least 24 hours prior to the end of the current billing cycle.</li>
                  <li>You can manage or cancel your subscriptions at any time via your Apple ID Account Settings.</li>
                </ul>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-6">
              <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-emerald-500 rounded-full" />
                4. Intellectual Property & License
              </h2>
              <div className="text-sm text-[var(--label-2)] space-y-4 leading-relaxed">
                <p>
                  We grant you a non-exclusive, non-transferable, revocable license to use the IMPROVE applications on iOS devices that you own or control, solely for personal, non-commercial purposes in accordance with Apple’s Standard Licensed Application End User License Agreement (EULA).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ACCOUNT DELETION & REVOCATION */}
        {activeTab === "deletion" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            <div className="p-8 rounded-3xl border border-purple-500/20 bg-purple-500/[0.02] backdrop-blur-md space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 font-mono text-xs uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>App Store Guideline 5.1.1(v) Compliant</span>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Account Deletion & Token Revocation
              </h2>
              <p className="text-sm text-[var(--label-2)] leading-relaxed">
                Apple requires all apps that support account creation to provide an easy, complete mechanism to delete the account and revoke third-party credentials. Because IMPROVE stores zero data on its own servers, deleting your data is instantaneous and total.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Option A: Bank Disconnect */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Trash2 className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">1. Disconnect Bank / Plaid Item</h3>
                <p className="text-xs text-[var(--label-2)] leading-relaxed">
                  Inside <strong className="text-white">IMPROVE Money &rarr; Settings &rarr; Connected Institutions</strong>, tap on any institution and select <strong>&ldquo;Unlink & Delete Data&rdquo;</strong>.
                </p>
                <div className="text-xs text-[var(--label-3)] bg-white/[0.02] p-3 rounded-lg border border-white/5 space-y-1">
                  <div className="font-semibold text-white">What happens immediately:</div>
                  <div>• Our edge proxy executes Plaid <code className="text-amber-400 font-mono">/item/remove</code>.</div>
                  <div>• The Plaid access token is permanently destroyed.</div>
                  <div>• All local transaction records and account balances are wiped from your device.</div>
                </div>
              </div>

              {/* Option B: Apple ID Revocation */}
              <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-lg">2. Revoke Sign in with Apple</h3>
                <p className="text-xs text-[var(--label-2)] leading-relaxed">
                  Inside <strong className="text-white">IMPROVE &rarr; Settings &rarr; Account</strong>, tap <strong>&ldquo;Delete Account & Revoke Apple Sign-In&rdquo;</strong>.
                </p>
                <div className="text-xs text-[var(--label-3)] bg-white/[0.02] p-3 rounded-lg border border-white/5 space-y-1">
                  <div className="font-semibold text-white">What happens immediately:</div>
                  <div>• Our gateway sends an authenticated revocation request to Apple&apos;s servers.</div>
                  <div>• Your Apple authorization token is revoked per Guideline 5.1.1(v).</div>
                  <div>• Your 90-day ephemeral session token is instantly discarded.</div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <span className="w-2 h-6 bg-blue-500 rounded-full" />
                How to Revoke from iOS Settings Directly
              </h3>
              <p className="text-sm text-[var(--label-2)] leading-relaxed">
                You can also revoke IMPROVE&apos;s Apple credentials directly at the operating system level at any time:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-xs text-[var(--label-2)]">
                <li>Open the <strong className="text-white">Settings</strong> app on your iPhone or iPad.</li>
                <li>Tap your <strong className="text-white">Apple ID Name</strong> at the top &rarr; <strong className="text-white">Sign-In & Security</strong>.</li>
                <li>Tap <strong className="text-white">Sign in with Apple</strong>.</li>
                <li>Select <strong className="text-white">IMPROVE</strong> from the list of applications.</li>
                <li>Tap <strong className="text-red-400">Stop Using Apple ID</strong>.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Contact Footer Box */}
        <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-base font-bold text-white">Have questions about our security or privacy model?</h4>
            <p className="text-xs text-[var(--label-2)]">
              Our engineering team is directly reachable for any audit, inquiry, or privacy request.
            </p>
          </div>
          <div className="flex gap-4">
            <a
              href="mailto:privacy@improve-club.com"
              className="px-5 py-2.5 rounded-xl border border-white/20 bg-white hover:bg-white/90 text-black text-xs font-bold transition-all shadow-md"
            >
              Contact Privacy Officer
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
