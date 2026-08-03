'use client'

import React, { useEffect, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Bebas_Neue } from "@/lib/font-shim"
import { CheckCircle2, AlertTriangle, ArrowUpRight, TrendingUp, Wallet, ShieldAlert, Calendar, PieChart } from 'lucide-react'

const bebas = Bebas_Neue({ subsets: ["latin"] })

const CHAPTERS = [
  {
    title: "01. Daily Decisions",
    text: "Most finance apps show you what happened. This one tells you what to do next. Every day you open to one decision, ranked by what matters most — approve it, adjust it, or come back tomorrow."
  },
  {
    title: "02. Cash Flow",
    text: "Your bank balance tells you where you are. This tells you where you are going. Every charge coming in the next 90 days is mapped on a single line — so you see problems before they happen."
  },
  {
    title: "03. Envelopes",
    text: "Monthly budgets fail because life doesn't run on calendar months. These envelopes learn your actual spending rhythm from your real transactions. When your pace shifts, you know before it becomes a problem."
  },
  {
    title: "04. Income",
    text: "Automated tracking handles your regular income. This screen handles everything else — freelance payments, irregular deposits, one-time windfalls. Classify them once and they feed your forecast automatically."
  },
  {
    title: "05. Subscriptions",
    text: "One number: everything leaving your account on autopilot every month. Review any subscription and the system queues a decision for you — keep it, cancel it, or revisit it next month."
  },
  {
    title: "06. Goals Simulator",
    text: "A savings goal without a trade-off is a wish. This simulator shows you exactly which spending envelopes get squeezed, by how much, and for how long — before you commit to anything."
  }
]

export function TheSystemSection() {
    return (
        <section className="bg-black min-h-screen text-white py-32 px-6">
            <div className="max-w-7xl mx-auto space-y-32">
                <div className="text-center space-y-4">
                    <h2 className={`${bebas.className} text-6xl md:text-8xl tracking-tight uppercase`}>The System</h2>
                    <p className="text-xl text-neutral-400 font-mono uppercase tracking-widest">A diagnostic suite for your financial velocity</p>
                </div>
                
                <div className="space-y-40">
                    {CHAPTERS.map((chapter, i) => (
                        <SystemChapter key={i} chapter={chapter} index={i} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function SystemChapter({ chapter, index }: { chapter: any, index: number }) {
    const ref = useRef<HTMLDivElement>(null)

    return (
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            <div className="space-y-8 max-w-lg">
                <h3 className={`${bebas.className} text-4xl md:text-6xl text-amber-500`}>{chapter.title}</h3>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-light font-serif italic border-l-2 border-amber-500/30 pl-6 py-2">
                    "{chapter.text}"
                </p>
            </div>

            <div className="relative w-full aspect-[4/3] bg-neutral-950 border border-neutral-800 shadow-2xl rounded-xl overflow-hidden p-6">
                <div className="w-full h-full flex flex-col justify-center">
                    {index === 0 && <DemoDailyDecisions />}
                    {index === 1 && <DemoCashFlow />}
                    {index === 2 && <DemoEnvelopes />}
                    {index === 3 && <DemoIncome />}
                    {index === 4 && <DemoSubscriptions />}
                    {index === 5 && <DemoGoals />}
                </div>
            </div>
        </div>
    )
}

function DemoDailyDecisions() {
    return (
        <div className="space-y-4 p-4 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> High Priority Decision
                </span>
                <span className="text-xs font-mono text-neutral-500">Today, 09:00 AM</span>
            </div>
            <h4 className="text-lg font-medium text-white">Reallocate $450 Surplus to Debt Reserve</h4>
            <p className="text-sm text-neutral-400">Based on last week's spending rhythm, allocating this surplus will accelerate payoff by 18 days.</p>
            <div className="flex items-center gap-3 pt-2">
                <button className="px-4 py-2 bg-amber-500 text-black font-semibold text-xs rounded uppercase tracking-wider">Approve ($450)</button>
                <button className="px-4 py-2 border border-neutral-700 text-neutral-300 font-semibold text-xs rounded uppercase tracking-wider">Adjust</button>
            </div>
        </div>
    )
}

function DemoCashFlow() {
    return (
        <div className="space-y-4 p-4 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-widest text-emerald-400 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> 90-Day Cash Flow Runway
                </span>
                <span className="text-xs font-mono text-emerald-400">+14.2% projected</span>
            </div>
            <div className="h-32 w-full flex items-end justify-between gap-2 pt-4 px-2">
                {[40, 55, 35, 70, 65, 85, 90, 75, 95, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-gradient-to-t from-amber-500/20 to-amber-500 rounded-t" style={{ height: `${h}%` }} />
                ))}
            </div>
            <div className="flex justify-between text-xs font-mono text-neutral-500 pt-2 border-t border-neutral-800">
                <span>Month 1 ($4.2k)</span>
                <span>Month 2 ($5.8k)</span>
                <span>Month 3 ($7.1k)</span>
            </div>
        </div>
    )
}

function DemoEnvelopes() {
    return (
        <div className="space-y-3 p-4 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs uppercase font-mono tracking-widest text-neutral-400 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-amber-500" /> Active Spending Rhythm
                </span>
                <span className="text-xs font-mono text-neutral-400">6 Envelopes</span>
            </div>
            {[
                { label: "Dining & Social", spent: 340, total: 500, color: "bg-amber-500" },
                { label: "Groceries & Staples", spent: 620, total: 800, color: "bg-emerald-500" },
                { label: "Subscriptions", spent: 180, total: 200, color: "bg-purple-500" },
            ].map((env, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                        <span className="text-neutral-300">{env.label}</span>
                        <span className="text-neutral-400">${env.spent} / ${env.total}</span>
                    </div>
                    <div className="h-2 w-full bg-neutral-800 rounded-full overflow-hidden">
                        <div className={`h-full ${env.color}`} style={{ width: `${(env.spent / env.total) * 100}%` }} />
                    </div>
                </div>
            ))}
        </div>
    )
}

function DemoIncome() {
    return (
        <div className="space-y-3 p-4 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs uppercase font-mono tracking-widest text-neutral-400 flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Recent Income Events
                </span>
                <span className="text-xs font-mono text-emerald-400">+$6,420 / mo</span>
            </div>
            {[
                { source: "Primary Payroll Direct Deposit", amount: "+$4,500.00", status: "Verified" },
                { source: "Freelance Project Payout", amount: "+$1,200.00", status: "Classified" },
                { source: "Consulting Retainer", amount: "+$720.00", status: "Classified" }
            ].map((inc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-neutral-900 rounded border border-neutral-800/60">
                    <div>
                        <div className="text-xs font-medium text-white">{inc.source}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{inc.status}</div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-emerald-400">{inc.amount}</span>
                </div>
            ))}
        </div>
    )
}

function DemoSubscriptions() {
    return (
        <div className="space-y-3 p-4 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs uppercase font-mono tracking-widest text-neutral-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" /> Autopilot Outflow Queue
                </span>
                <span className="text-xs font-mono text-amber-400">$184 / mo</span>
            </div>
            {[
                { name: "Cloud Compute Workstation", cost: "$49/mo", action: "Keep" },
                { name: "Streaming Entertainment Pass", cost: "$18/mo", action: "Review" },
                { name: "Dev Tools Suite Pro", cost: "$29/mo", action: "Keep" }
            ].map((sub, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-neutral-900 rounded border border-neutral-800/60">
                    <div>
                        <div className="text-xs font-medium text-white">{sub.name}</div>
                        <div className="text-[10px] text-neutral-500 font-mono">{sub.cost}</div>
                    </div>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded border ${sub.action === 'Keep' ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400'}`}>{sub.action}</span>
                </div>
            ))}
        </div>
    )
}

function DemoGoals() {
    return (
        <div className="space-y-4 p-4 bg-neutral-900/60 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-widest text-amber-400 flex items-center gap-2">
                    <PieChart className="w-4 h-4" /> Goal Trade-Off Simulator
                </span>
                <span className="text-xs font-mono text-neutral-400">Target: $15,000</span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                    <span className="text-neutral-300">Emergency Fund Target</span>
                    <span className="text-amber-400">82% Complete</span>
                </div>
                <div className="h-3 w-full bg-neutral-800 rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '82%' }} />
                </div>
            </div>
            <p className="text-xs text-neutral-400 font-serif italic border-l border-amber-500/30 pl-3">
                Squeezing "Dining Out" envelope by $120/mo accelerates target completion by 3 months.
            </p>
        </div>
    )
}
