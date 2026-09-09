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
        <section className="bg-[var(--bg)] min-h-screen text-[var(--label)] py-28 px-6">
            <div className="max-w-7xl mx-auto space-y-28">
                <div className="text-center space-y-3">
                    <p className="kicker">The System</p>
                    <h2 className="type-large-title text-4xl md:text-6xl tracking-tight text-[var(--label)]">A Diagnostic Suite For Your Financial Velocity</h2>
                </div>
                
                <div className="space-y-32">
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
        <div ref={ref} className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
            <div className="space-y-6 max-w-lg">
                <p className="kicker">{`CHAPTER 0${index + 1}`}</p>
                <h3 className="type-title text-2xl md:text-4xl text-[var(--indigo)]">{chapter.title}</h3>
                <p className="type-body text-[var(--label-2)] leading-relaxed border-l-2 border-[var(--indigo)] pl-6 py-1">
                    "{chapter.text}"
                </p>
            </div>

            <div className="card-ios relative w-full aspect-[4/3] bg-[var(--card)] border border-[var(--separator)] p-6 overflow-hidden">
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
        <div className="space-y-4 p-5 bg-[var(--card-inset)] rounded-[14px]">
            <div className="flex items-center justify-between">
                <span className="type-kicker text-[var(--orange)] flex items-center gap-2">
                    <div className="icon-box-tint">
                        <AlertTriangle className="w-4 h-4 text-[var(--orange)]" />
                    </div>
                    High Priority Decision
                </span>
                <span className="type-subcaption text-[var(--label-3)] font-rounded">Today, 09:00 AM</span>
            </div>
            <h4 className="type-headline text-[var(--label)]">Reallocate $450 Surplus to Debt Reserve</h4>
            <p className="type-body text-[var(--label-2)]">Based on last week's spending rhythm, allocating this surplus will accelerate payoff by 18 days.</p>
            <div className="flex items-center gap-3 pt-2">
                <button className="btn-primary text-xs px-4 py-2">Approve ($450)</button>
                <button className="btn-secondary text-xs px-4 py-2">Adjust</button>
            </div>
        </div>
    )
}

function DemoCashFlow() {
    return (
        <div className="space-y-4 p-5 bg-[var(--card-inset)] rounded-[14px]">
            <div className="flex items-center justify-between">
                <span className="type-kicker text-[var(--green)] flex items-center gap-2">
                    <div className="icon-box-tint">
                        <TrendingUp className="w-4 h-4 text-[var(--green)]" />
                    </div>
                    90-Day Cash Flow Runway
                </span>
                <span className="type-subcaption font-rounded text-[var(--green)]">+14.2% projected</span>
            </div>
            <div className="h-32 w-full flex items-end justify-between gap-2 pt-4 px-2">
                {[40, 55, 35, 70, 65, 85, 90, 75, 95, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-[var(--indigo)] rounded-t transition-all duration-700 ease-out" style={{ height: `${h}%` }} />
                ))}
            </div>
            <div className="flex justify-between type-subcaption font-rounded text-[var(--label-3)] pt-2 border-t border-[var(--separator)]">
                <span>Month 1 ($4.2k)</span>
                <span>Month 2 ($5.8k)</span>
                <span>Month 3 ($7.1k)</span>
            </div>
        </div>
    )
}

function DemoEnvelopes() {
    return (
        <div className="space-y-3 p-5 bg-[var(--card-inset)] rounded-[14px]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--separator)]">
                <span className="type-kicker text-[var(--label-2)] flex items-center gap-2">
                    <div className="icon-box-tint">
                        <Wallet className="w-4 h-4 text-[var(--indigo)]" />
                    </div>
                    Active Spending Rhythm
                </span>
                <span className="tag-chip text-xs">6 Envelopes</span>
            </div>
            {[
                { label: "Dining & Social", spent: 340, total: 500, color: "bg-[var(--orange)]" },
                { label: "Groceries & Staples", spent: 620, total: 800, color: "bg-[var(--green)]" },
                { label: "Subscriptions", spent: 180, total: 200, color: "bg-[var(--purple)]" },
            ].map((env, i) => (
                <div key={i} className="space-y-1">
                    <div className="flex justify-between type-callout">
                        <span className="text-[var(--label)]">{env.label}</span>
                        <span className="font-rounded text-[var(--label-2)]">${env.spent} / ${env.total}</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--fill)] rounded-full overflow-hidden">
                        <div className={`h-full ${env.color}`} style={{ width: `${(env.spent / env.total) * 100}%` }} />
                    </div>
                </div>
            ))}
        </div>
    )
}

function DemoIncome() {
    return (
        <div className="space-y-3 p-5 bg-[var(--card-inset)] rounded-[14px]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--separator)]">
                <span className="type-kicker text-[var(--label-2)] flex items-center gap-2">
                    <div className="icon-box-tint">
                        <ArrowUpRight className="w-4 h-4 text-[var(--green)]" />
                    </div>
                    Recent Income Events
                </span>
                <span className="font-rounded type-callout text-[var(--green)]">+$6,420 / mo</span>
            </div>
            {[
                { source: "Primary Payroll Direct Deposit", amount: "+$4,500.00", status: "Verified" },
                { source: "Freelance Project Payout", amount: "+$1,200.00", status: "Classified" },
                { source: "Consulting Retainer", amount: "+$720.00", status: "Classified" }
            ].map((inc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--card)] rounded-[10px] border border-[var(--separator)]">
                    <div>
                        <div className="type-callout text-[var(--label)]">{inc.source}</div>
                        <div className="type-subcaption text-[var(--label-3)]">{inc.status}</div>
                    </div>
                    <span className="font-rounded type-callout text-[var(--green)]">{inc.amount}</span>
                </div>
            ))}
        </div>
    )
}

function DemoSubscriptions() {
    return (
        <div className="space-y-3 p-5 bg-[var(--card-inset)] rounded-[14px]">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--separator)]">
                <span className="type-kicker text-[var(--label-2)] flex items-center gap-2">
                    <div className="icon-box-tint">
                        <ShieldAlert className="w-4 h-4 text-[var(--orange)]" />
                    </div>
                    Autopilot Outflow Queue
                </span>
                <span className="font-rounded type-callout text-[var(--orange)]">$184 / mo</span>
            </div>
            {[
                { name: "Cloud Compute Workstation", cost: "$49/mo", action: "Keep" },
                { name: "Streaming Entertainment Pass", cost: "$18/mo", action: "Review" },
                { name: "Dev Tools Suite Pro", cost: "$29/mo", action: "Keep" }
            ].map((sub, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--card)] rounded-[10px] border border-[var(--separator)]">
                    <div>
                        <div className="type-callout text-[var(--label)]">{sub.name}</div>
                        <div className="type-subcaption font-rounded text-[var(--label-3)]">{sub.cost}</div>
                    </div>
                    <span className={`tag-chip text-xs ${sub.action === 'Keep' ? 'text-[var(--green)]' : 'text-[var(--orange)]'}`}>{sub.action}</span>
                </div>
            ))}
        </div>
    )
}

function DemoGoals() {
    return (
        <div className="space-y-4 p-5 bg-[var(--card-inset)] rounded-[14px]">
            <div className="flex items-center justify-between">
                <span className="type-kicker text-[var(--label-2)] flex items-center gap-2">
                    <div className="icon-box-tint">
                        <PieChart className="w-4 h-4 text-[var(--indigo)]" />
                    </div>
                    Goal Trade-Off Simulator
                </span>
                <span className="type-subcaption font-rounded text-[var(--label-2)]">Target: $15,000</span>
            </div>
            <div className="space-y-2">
                <div className="flex justify-between type-callout">
                    <span className="text-[var(--label)]">Emergency Fund Target</span>
                    <span className="font-rounded text-[var(--orange)]">82% Complete</span>
                </div>
                <div className="h-3 w-full bg-[var(--fill)] rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-[var(--orange)] rounded-full transition-all duration-1000 ease-out" style={{ width: '82%' }} />
                </div>
            </div>
            <p className="type-caption text-[var(--label-2)] italic border-l-2 border-[var(--orange)] pl-3">
                Squeezing "Dining Out" envelope by $120/mo accelerates target completion by 3 months.
            </p>
        </div>
    )
}
