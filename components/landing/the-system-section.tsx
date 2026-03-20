'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { Bebas_Neue } from "@/lib/font-shim"
import { TodayScreen } from '@/components/money/today-screen'
import { CashFlowChart } from '@/components/money/cash-flow'
import { Envelopes } from '@/components/money/envelopes'
import { IncomeManager } from '@/components/money/income'
import { Subscriptions } from '@/components/money/subscriptions'
import { GoalsSimulator } from '@/components/money/goals'

const bebas = Bebas_Neue({ subsets: ["latin"] })

const CHAPTERS = [
  {
    title: "01. Daily Decisions",
    audioSrc: "/audio/ch1-decisions.mp3", // Placeholders
    text: "Most finance apps show you what happened. This one tells you what to do next. Every day you open to one decision, ranked by what matters most — approve it, adjust it, or come back tomorrow."
  },
  {
    title: "02. Cash Flow",
    audioSrc: "/audio/ch2-cashflow.mp3",
    text: "Your bank balance tells you where you are. This tells you where you are going. Every charge coming in the next 90 days is mapped on a single line — so you see problems before they happen."
  },
  {
    title: "03. Envelopes",
    audioSrc: "/audio/ch3-envelopes.mp3",
    text: "Monthly budgets fail because life doesn't run on calendar months. These envelopes learn your actual spending rhythm from your real transactions. When your pace shifts, you know before it becomes a problem."
  },
  {
    title: "04. Income",
    audioSrc: "/audio/ch4-income.mp3",
    text: "Plaid knows your regular income. This screen handles everything else — freelance payments, irregular deposits, one-time windfalls. Classify them once and they feed your forecast automatically."
  },
  {
    title: "05. Subscriptions",
    audioSrc: "/audio/ch5-subscriptions.mp3",
    text: "One number: everything leaving your account on autopilot every month. Review any subscription and the system queues a decision for you — keep it, cancel it, or revisit it next month."
  },
  {
    title: "06. Goals Simulator",
    audioSrc: "/audio/ch6-goals.mp3",
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
    const isInView = useInView(ref, { margin: "-200px", once: false })
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        if (isInView && audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play().catch(() => {}) // Catch if no audio source
        } else if (!isInView && audioRef.current) {
            audioRef.current.pause()
        }
    }, [isInView])

    return (
        <div ref={ref} className="grid lg:grid-cols-2 gap-16 items-center min-h-[80vh]">
            <div className="space-y-8 max-w-lg">
                <h3 className={`${bebas.className} text-4xl md:text-6xl text-amber-500`}>{chapter.title}</h3>
                <p className="text-lg md:text-xl text-neutral-300 leading-relaxed font-light font-serif italic border-l-2 border-amber-500/30 pl-6 py-2">
                    "{chapter.text}"
                </p>
                <audio ref={audioRef} src={chapter.audioSrc} />
            </div>

            <div className="relative w-full aspect-[4/3] bg-neutral-900 border border-neutral-800 shadow-2xl overflow-hidden overflow-y-auto">
                {/* 
                    Device Frame wrap 
                    Animations inject 'isDemo' to component 
                */}
                <div className="scale-[0.85] origin-top w-full h-full p-6 pointer-events-none">
                    {index === 0 && <TodayScreen isDemo={isInView} />}
                    {index === 1 && <CashFlowChart isDemo={isInView} />}
                    {index === 2 && <Envelopes isDemo={isInView} />}
                    {index === 3 && <IncomeManager isDemo={isInView} />}
                    {index === 4 && <Subscriptions isDemo={isInView} />}
                    {index === 5 && <GoalsSimulator isDemo={isInView} />}
                </div>
            </div>
        </div>
    )
}
