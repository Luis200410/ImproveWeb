"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  FileText,
  PenTool,
  Grid,
  Maximize2,
  Mic,
  Code2,
  Command,
  Search,
  Download,
  Inbox,
  FolderSync,
  Layers,
  LayoutDashboard,
  Zap,
  Shield,
  Brain,
  Cloud,
  Calendar,
  Share2,
  Smartphone,
  Sliders,
  Infinity as InfinityIcon,
  HelpCircle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

interface FeatureItem {
  name: string;
  category: "notes" | "capture" | "ai" | "sync" | "calendar";
  description: string;
  free: boolean | string;
  improve: boolean | string;
  badge?: string;
  highlight?: boolean;
}

const SECOND_BRAIN_FEATURES: FeatureItem[] = [
  // Notes & Canvas
  {
    name: "Unlimited Rich Text Notes",
    category: "notes",
    description: "Full formatting with A1–A6 headings, bold, italics, checklists, callouts, and multi-color highlights.",
    free: "Unlimited (A1–A6, bold, lists, highlights)",
    improve: "Unlimited (A1–A6, bold, lists, highlights)",
  },
  {
    name: "Apple Pencil Handwriting Anywhere",
    category: "notes",
    description: "Write anywhere on the page with Apple Pencil (iPad), with fluid low-latency rendering visible on iPhone and Mac.",
    free: true,
    improve: true,
    badge: "iPad / Mac / iPhone",
  },
  {
    name: "Auto Pencil & Keyboard Switch",
    category: "notes",
    description: "Seamlessly switch between stylus and typing. Double-tap anywhere on the canvas to place a cursor and type.",
    free: true,
    improve: true,
  },
  {
    name: "Custom Paper Backgrounds",
    category: "notes",
    description: "Toggle note canvases between blank white/dark, college-ruled lines, or precision dot grid.",
    free: "Blank, lines or grid",
    improve: "Blank, lines or grid",
  },
  {
    name: "Full Screen Note with Left Column",
    category: "notes",
    description: "Distraction-free workspace with dedicated left inspector (metadata, linked tasks, microtasks, resources). Opens in a new window on iPadOS/macOS.",
    free: true,
    improve: true,
    badge: "Multi-Window Native",
  },
  {
    name: "Embedded Voice Notes & On-Device Transcript",
    category: "notes",
    description: "Record voice notes directly inside the note's left column with instant, private on-device transcription.",
    free: true,
    improve: true,
    badge: "100% On-Device",
  },
  {
    name: "Media, Code Blocks & LaTeX Math",
    category: "notes",
    description: "Embed inline photos, syntax-highlighted code blocks, rich web link embeds, and formatted LaTeX math formulas.",
    free: true,
    improve: true,
  },
  {
    name: "“/” Slash Command Menu & Shortcuts",
    category: "notes",
    description: "Type “/” anywhere to trigger formatting, blocks, and tasks, with full hardware keyboard navigation.",
    free: true,
    improve: true,
  },
  {
    name: "Instant Search (Text, Titles & Transcripts)",
    category: "notes",
    description: "Search across typed text, note headings, and audio transcriptions in real time.",
    free: true,
    improve: true,
  },
  {
    name: "Export to Vector PDF",
    category: "notes",
    description: "Share any complete note, handwriting canvas, and media attachments as a clean PDF.",
    free: true,
    improve: true,
  },

  // Inbox & Capture
  {
    name: "Universal Inbox Capture",
    category: "capture",
    description: "Zero-friction capture for typed text, voice memos, web links, photos, files, system Share Sheet, and iPad handwriting.",
    free: true,
    improve: true,
    badge: "Zero-Friction",
  },
  {
    name: "Manual Filing & Asset Preservation",
    category: "capture",
    description: "Captures filed into notes preserve all media intact (audio recording, original photo, ink strokes, attached files).",
    free: true,
    improve: true,
  },
  {
    name: "Life Areas & Project Management",
    category: "capture",
    description: "Organize across the 7 Sovereign Life Categories with tasks, microtasks, priority tags, due dates, and archive.",
    free: "All 7 Life Areas • Up to 3 Active Projects",
    improve: "All 7 Life Areas • Unlimited Active Projects",
    highlight: true,
  },
  {
    name: "In-App Dashboard Widget Board",
    category: "capture",
    description: "Customizable high-level summary board. Long-press and drag to rearrange metrics, active habits, and recent notes.",
    free: true,
    improve: true,
  },
  {
    name: "Siri Quick Capture",
    category: "capture",
    description: "Instantly drop ideas into your Second Brain Inbox using Siri hands-free voice commands.",
    free: true,
    improve: true,
  },
  {
    name: "Private by Design (Local Silicon)",
    category: "capture",
    description: "All notes, voice transcripts, and OCR stay strictly inside your physical device sandbox. Nothing is ever sent to external cloud servers.",
    free: "100% Local AI",
    improve: "100% Local AI + Private iCloud",
    badge: "Zero Cloud Scraping",
  },

  // Improve Superpowers (AI, Sync & Scheduling)
  {
    name: "Autonomous On-Device AI Triage & Tagging",
    category: "ai",
    description: "Local Apple Intelligence reads captured items, assigns life categories, generates smart tags, and flags duplicate ideas.",
    free: false,
    improve: "Smart sorting, categorization & deduplication",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "AI Note Summarization & Key Points",
    category: "ai",
    description: "Generates bulleted key takeaways in the note's left column and marks key contextual passages across the page.",
    free: false,
    improve: "Instant bullet summaries & highlight markers",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "AI Reverse-Engineering & Action Plans",
    category: "ai",
    description: "Converts high-level goals and project outcomes into structured micro-step task sequences automatically.",
    free: false,
    improve: "Splits projects & macro targets into micro-steps",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "Handwriting-to-Text OCR & Handwriting Summaries",
    category: "ai",
    description: "Index your Apple Pencil handwriting into searchable text. On-device AI reads handwritten notes to generate summaries.",
    free: false,
    improve: "Full handwriting search + AI handwriting reading",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "Seamless Multi-Device iCloud Sync",
    category: "sync",
    description: "Instant encrypted synchronization across iPhone, iPad, and Mac, including merged handwriting strokes between devices.",
    free: "Local on-device database",
    improve: "Bidirectional iCloud sync across iPhone, iPad & Mac",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "Calendar Day Board & AI Task Pacing",
    category: "calendar",
    description: "Interactive day board with drag-to-schedule calendar bridging. On-device AI spreads work across days and automatically re-plans missed sessions.",
    free: false,
    improve: "Day board, drag-to-schedule & adaptive re-planning",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "Goals ⇄ Projects Bridge with Productivity",
    category: "calendar",
    description: "Connect your Second Brain projects directly to the Productivity companion app. Focus timers check off sub-steps with live write-back.",
    free: false,
    improve: "Bi-directional bridge + live timer sub-step sync",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "Apple Home & Lock Screen Widgets",
    category: "sync",
    description: "Monitor active habits, quick capture buttons, and day board tasks directly from your iOS Home & Lock screens.",
    free: false,
    improve: "Interactive Lock & Home Screen widget board",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "Siri & Shortcuts Suite (All 10 Actions)",
    category: "sync",
    description: "Deep iOS automation integration covering all 10 system shortcuts actions for automated routines.",
    free: "Quick Capture only",
    improve: "All 10 Deep System Shortcuts Actions",
    badge: "Improve Superpower",
    highlight: true,
  },
  {
    name: "Unlimited Active Projects",
    category: "capture",
    description: "Scale your execution with zero limits on concurrent active project trees and milestone roadmaps.",
    free: "Up to 3 active projects",
    improve: "Unlimited active projects",
    badge: "Improve Superpower",
    highlight: true,
  },
];

export function SecondBrainTierComparison() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "matrix">("cards");

  const categories = [
    { id: "all", label: "All Features" },
    { id: "notes", label: "Notes & Pencil" },
    { id: "capture", label: "Inbox & Projects" },
    { id: "ai", label: "On-Device AI" },
    { id: "calendar", label: "Calendar & Day Board" },
    { id: "sync", label: "Sync & Widgets" },
  ];

  const filteredFeatures = SECOND_BRAIN_FEATURES.filter((f) => {
    if (activeCategory === "all") return true;
    return f.category === activeCategory;
  });

  return (
    <section className="relative w-full py-20 px-4 sm:px-6 md:px-8 text-white overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] md:w-[900px] h-[350px] bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-mono uppercase tracking-[0.25em]">
            <Brain className="w-3.5 h-3.5" />
            <span>Second Brain · Tier Specification</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight uppercase leading-none">
            Free <span className="text-white/40">vs</span> <span className="text-amber-400">Improve</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
            Start with an uncompromised, private-by-design knowledge workstation for zero dollars. Upgrade to Improve for autonomous on-device AI, cross-device handwriting sync, and intelligent calendar scheduling.
          </p>

          {/* Toggle View Options */}
          <div className="pt-2 flex items-center justify-center gap-2">
            <div className="p-1 bg-white/[0.04] border border-white/10 rounded-xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === "cards"
                    ? "bg-amber-500 text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Plan Overview Cards
              </button>
              <button
                type="button"
                onClick={() => setViewMode("matrix")}
                className={`px-4 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all cursor-pointer ${
                  viewMode === "matrix"
                    ? "bg-amber-500 text-black font-bold shadow-md"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                Full Feature Matrix ({SECOND_BRAIN_FEATURES.length})
              </button>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            MODE 1: SIDE-BY-SIDE TIER CARDS
           ══════════════════════════════════════════════════════════ */}
        {viewMode === "cards" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* FREE TIER CARD */}
            <div className="rounded-[32px] border border-white/10 bg-white/[0.02] backdrop-blur-xl p-8 sm:p-10 flex flex-col justify-between space-y-8 relative hover:border-white/20 transition-all">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-neutral-400">
                      Tier 01 · Permanent Base
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                      Free Core
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-black text-white">$0</span>
                    <span className="text-[10px] block font-mono text-neutral-400 uppercase">Forever</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed font-light">
                  A complete, private-by-design digital notepad and PARA organizer with Apple Pencil ink, audio transcription, and life areas. No account, no credit card, no cloud rent.
                </p>

                {/* Free Capabilities List */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neutral-400 font-bold block">
                    What’s Included For Free:
                  </span>

                  <ul className="space-y-3 text-xs text-neutral-300">
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Unlimited Rich Text Notes:</strong> A1–A6 headings, bold, lists, and multi-color highlights.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Apple Pencil Handwriting:</strong> Write anywhere on the page (iPad); rendered seamlessly on iPhone and Mac.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Auto Stylus & Typing Switch:</strong> Switch automatically; double-tap anywhere to type.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Custom Paper Styles:</strong> Blank, ruled lines, or dot grid background canvases.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Full Screen Note + Left Column:</strong> Inspector for title, task, microtasks, and resources. Opens in a new window on iPad/Mac.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Voice Notes + On-Device Transcript:</strong> Record audio in note column with offline speech-to-text.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Rich Media & Math:</strong> Photos, code blocks, link embeds, and LaTeX math formulas.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">“/” Command Menu & Shortcuts:</strong> Instant block formatting and hardware keyboard control.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Fast Search & PDF Export:</strong> Search typed text, titles, and voice transcripts; export vector PDF.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Universal Inbox Capture:</strong> Text, voice, links, photos, files, share sheet, and handwriting.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Manual Filing & Asset Preservation:</strong> Notes keep attached audio, photo, ink, and files intact.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Life Areas & 3 Active Projects:</strong> All 7 sovereign categories, priorities, due dates, and archive.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">In-App Dashboard:</strong> Widget board with hold-to-arrange layout.
                      </div>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-white">Siri Quick Capture & Local Privacy:</strong> 100% private on-device processing.
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span>Standalone On-Device Workspace</span>
                <span className="text-emerald-400 font-bold">100% Free Forever</span>
              </div>
            </div>

            {/* IMPROVE PAID TIER CARD */}
            <div className="rounded-[32px] border-2 border-amber-500/40 bg-gradient-to-br from-amber-500/10 via-black to-black p-8 sm:p-10 flex flex-col justify-between space-y-8 relative shadow-[0_0_60px_rgba(245,158,11,0.15)] hover:border-amber-500/60 transition-all">
              {/* Highlight Pill */}
              <div className="absolute top-6 right-6">
                <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-[9px] font-mono font-bold uppercase tracking-widest shadow-lg">
                  Universal Suite Pass
                </span>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-amber-400 font-bold">
                      Tier 02 · Full Intelligence Pass
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 flex items-center gap-2">
                      <span>Improve</span>
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl sm:text-4xl font-black text-amber-400">$40</span>
                    <span className="text-[10px] block font-mono text-neutral-300 uppercase">Per Year</span>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed font-light">
                  Unlocks autonomous on-device AI, intelligent day planning, handwriting search, multi-device iCloud sync, and deep companion bridges with Productivity.
                </p>

                {/* Improve Superpowers List */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-amber-400 font-bold block">
                    Everything in Free, plus these Superpowers:
                  </span>

                  <ul className="space-y-4 text-xs text-neutral-200">
                    <li className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Brain className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-white block text-[13px]">Autonomous On-Device AI:</strong>
                        <span className="text-neutral-300">
                          Inbox sorting and auto-tagging, Summarize (key points in column, marked passages on page), reverse-engineering projects and tasks into micro-steps, and automated AI day plans.
                        </span>
                      </div>
                    </li>

                    <li className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Search className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-white block text-[13px]">Handwriting to Text:</strong>
                        <span className="text-neutral-300">
                          Full semantic search of your handwritten Apple Pencil notes, plus AI Summarize directly reading your handwriting.
                        </span>
                      </div>
                    </li>

                    <li className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Cloud className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-white block text-[13px]">Universal iCloud Sync:</strong>
                        <span className="text-neutral-300">
                          Instant private synchronization across iPhone, iPad, and Mac, including handwriting ink merged seamlessly between devices.
                        </span>
                      </div>
                    </li>

                    <li className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-white block text-[13px]">Calendar Day Board & AI Pacing:</strong>
                        <span className="text-neutral-300">
                          Day board, drag to schedule, on-device AI spreads work across days, and automatically re-plans missed work while your own sessions stay pinned.
                        </span>
                      </div>
                    </li>

                    <li className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Zap className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-white block text-[13px]">Goals ⇄ Projects with Productivity:</strong>
                        <span className="text-neutral-300">
                          Direct live bridge. Focus timers check off sub-steps with live write-back, and Screen Time shields lock distracting apps automatically.
                        </span>
                      </div>
                    </li>

                    <li className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Smartphone className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-white block text-[13px]">Home & Lock Screen Widgets:</strong>
                        <span className="text-neutral-300">
                          Real-time day board status, active project rings, and one-tap capture widgets for your Apple Lock and Home Screens.
                        </span>
                      </div>
                    </li>

                    <li className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <Sliders className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-white block text-[13px]">Siri & Shortcuts (All 10 Actions):</strong>
                        <span className="text-neutral-300">
                          Automate your workspace with complete access to all 10 deep system intents and voice triggers.
                        </span>
                      </div>
                    </li>

                    <li className="p-3 rounded-xl bg-white/[0.03] border border-amber-500/20 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                        <InfinityIcon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <strong className="text-white block text-[13px]">Unlimited Projects:</strong>
                        <span className="text-neutral-300">
                          Create unlimited active project branches across all 7 life categories (bypassing the 3-project free limit).
                        </span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-6 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-[11px] font-mono text-amber-400">
                  <span>Single subscription unlocks all sibling apps.</span>
                </div>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bebas text-sm tracking-[0.2em] uppercase font-black transition-all flex items-center justify-center gap-2 group cursor-pointer shadow-lg"
                >
                  <span>Start with Improve</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════
            MODE 2: DETAILED FEATURE MATRIX TABLE
           ══════════════════════════════════════════════════════════ */}
        {viewMode === "matrix" && (
          <div className="space-y-6">
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setActiveCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer ${
                    activeCategory === c.id
                      ? "bg-amber-500 text-black font-bold shadow-md"
                      : "bg-white/[0.03] text-neutral-400 hover:text-white border border-white/10"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Matrix Table */}
            <div className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.04]">
                      <th className="px-6 py-4 font-mono font-bold text-neutral-300 uppercase tracking-wider w-1/2">
                        Capability / Feature
                      </th>
                      <th className="px-6 py-4 font-mono font-bold text-neutral-300 uppercase tracking-wider w-1/4">
                        Free Core Tier
                      </th>
                      <th className="px-6 py-4 font-mono font-bold text-amber-400 uppercase tracking-wider w-1/4 bg-amber-500/10">
                        Improve (Full Suite)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-light">
                    {filteredFeatures.map((feat, idx) => (
                      <tr
                        key={idx}
                        className={`hover:bg-white/[0.02] transition-colors ${
                          feat.highlight ? "bg-amber-500/[0.02]" : ""
                        }`}
                      >
                        <td className="px-6 py-4 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{feat.name}</span>
                            {feat.badge && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-white/10 text-neutral-300">
                                {feat.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-400 text-xs leading-relaxed max-w-xl">
                            {feat.description}
                          </p>
                        </td>

                        {/* Free Col */}
                        <td className="px-6 py-4 align-top">
                          {typeof feat.free === "boolean" ? (
                            feat.free ? (
                              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                                <Check className="w-4 h-4 shrink-0" />
                                <span>Included</span>
                              </div>
                            ) : (
                              <span className="text-white/20 font-mono">—</span>
                            )
                          ) : (
                            <span className="text-neutral-300 font-medium">{feat.free}</span>
                          )}
                        </td>

                        {/* Improve Col */}
                        <td className="px-6 py-4 align-top bg-amber-500/[0.03]">
                          {typeof feat.improve === "boolean" ? (
                            feat.improve ? (
                              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                                <Check className="w-4 h-4 shrink-0" />
                                <span>Included</span>
                              </div>
                            ) : (
                              <span className="text-white/20 font-mono">—</span>
                            )
                          ) : (
                            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
                              <Check className="w-4 h-4 text-amber-400 shrink-0" />
                              <span>{feat.improve}</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
