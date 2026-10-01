"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  FileText, 
  ShieldCheck, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  AlertCircle 
} from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-black text-[var(--label)] selection:bg-white/20" style={{ fontFamily: "var(--font-ios)" }}>
      {/* Background Glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[45%] h-[40%] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[50%] right-[15%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[130px]" />
      </div>

      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono uppercase tracking-wider text-blue-400">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
            Terms of <span className="text-white/40">Service</span>
          </h1>

          <p className="text-sm md:text-base text-[var(--label-2)] leading-relaxed max-w-2xl mx-auto">
            Please read these terms carefully before accessing or using any application within the IMPROVE ecosystem.
          </p>

          <div className="text-xs font-mono text-[var(--label-3)]">
            Effective Date: September 30, 2026 • Version 2.0
          </div>
        </div>

        {/* Quick Nav to Privacy & Financial Consent */}
        <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[var(--label-2)] text-center sm:text-left">
            Looking for our <strong className="text-white">Zero-Knowledge Privacy Policy</strong> or <strong className="text-white">Plaid Financial Data Consent</strong>?
          </div>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-black font-semibold text-xs hover:bg-white/90 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>View Privacy & Consent Policy</span>
          </Link>
        </div>

        {/* Terms Sections */}
        <div className="space-y-8 text-sm text-[var(--label-2)] leading-relaxed">
          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-5 bg-blue-500 rounded-full" />
              1. Acceptance of Terms
            </h2>
            <p>
              By downloading, installing, or interacting with any IMPROVE software, mobile applications (including <strong className="text-white">IMPROVE Money</strong>, <strong className="text-white">IMPROVE Habits</strong>, and <strong className="text-white">IMPROVE Daily</strong>), or web services, you agree to comply with and be legally bound by these Terms of Service. If you do not agree to these terms, do not access or use the services.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-5 bg-amber-500 rounded-full" />
              2. Financial Disclaimers (Not Financial Advice)
            </h2>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs leading-relaxed space-y-2">
              <div className="font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                NO FINANCIAL ADVICE OR FIDUCIARY DUTY
              </div>
              <p>
                IMPROVE Money is a personal financial tracking and organization utility. IMPROVE is not a licensed financial advisor, broker-dealer, banker, or certified public accountant.
              </p>
            </div>
            <p>
              All insights, budget indicators, net worth projections, and categorization rules generated within the application are strictly for organizational and habitual tracking purposes. You must consult a qualified certified financial planner, tax professional, or accountant before making significant financial commitments or investment choices.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-5 bg-emerald-500 rounded-full" />
              3. Plaid Bank Connectivity & Third-Party Terms
            </h2>
            <p>
              When utilizing financial synchronization features in IMPROVE Money, you authorize Plaid Inc. to retrieve data from your financial institutions. You acknowledge that Plaid&apos;s retrieval and treatment of your banking credentials and account information is governed by the{" "}
              <a 
                href="https://plaid.com/legal/#end-user-privacy-policy" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white underline hover:text-emerald-400 transition-colors"
              >
                Plaid End User Privacy Policy
              </a>
              {" "}and{" "}
              <a 
                href="https://plaid.com/legal/#end-user-services-agreement" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-white underline hover:text-emerald-400 transition-colors"
              >
                End User Services Agreement
              </a>.
            </p>
            <p>
              IMPROVE operates a stateless proxy bridge that never persists your banking credentials, account numbers, or transaction logs on any first-party server.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-5 bg-purple-500 rounded-full" />
              4. In-App Purchases, Billing, and Subscriptions
            </h2>
            <p>
              All subscriptions, recurring memberships, and lifetime access purchases are processed via Apple In-App Purchases (StoreKit).
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Billing is applied directly to your Apple ID upon purchase confirmation.</li>
              <li>Subscriptions renew automatically unless disabled at least 24 hours before the conclusion of the billing term.</li>
              <li>You may cancel or manage subscriptions at any time via your device’s Apple ID Settings.</li>
              <li>Refund requests must be submitted directly to Apple in accordance with Apple Media Services Terms and Conditions.</li>
            </ul>
          </div>

          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-5 bg-rose-500 rounded-full" />
              5. Account Termination & Data Deletion
            </h2>
            <p>
              In accordance with Apple App Store Guideline 5.1.1(v), you may initiate total account revocation and data deletion directly within the app settings at any time. Unlinking your bank disconnects the Plaid item immediately, destroys associated API access tokens, and wipes all local cached data.
            </p>
          </div>

          <div className="p-8 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md space-y-4">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <span className="w-2 h-5 bg-cyan-500 rounded-full" />
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted under applicable law, IMPROVE, its creators, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, goodwill, or banking interruptions resulting from your access to or inability to use the service.
            </p>
          </div>
        </div>

        {/* Footer Contact */}
        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02] text-center space-y-2">
          <div className="text-xs text-[var(--label-2)]">
            Questions regarding these Terms of Service?
          </div>
          <div>
            <a href="mailto:legal@improve-club.com" className="text-xs font-mono text-white underline hover:text-blue-400">
              legal@improve-club.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
