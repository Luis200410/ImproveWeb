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

            <div className="liquid-glass-card relative w-full aspect-[4/3] p-6 overflow-hidden shadow-2xl">
                <div className="w-full h-full flex flex-col justify-center">
                    <DemoDailyDecisions />
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
