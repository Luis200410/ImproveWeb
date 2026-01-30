
'use client'

import { motion } from 'framer-motion'
import { Playfair_Display } from '@/lib/font-shim'
import { usePomodoro } from '@/components/productivity/pomodoro/pomodoro-context'
import { formatTime } from '@/components/productivity/pomodoro/pomodoro-utils'
import { Play, Pause, Zap, Activity, Coffee, Settings2, ToggleRight, ToggleLeft } from 'lucide-react'
import { useState } from 'react'
import { Switch } from '@/components/ui/switch'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function PomodoroDashboard() {
    const {
        startSession,
        config,
        updateConfig,
        totalSessions
    } = usePomodoro()

    // Configuration Presets
    const presets = [
        {
            id: 'sprint',
            title: 'Deep Work Sprint',
            subtitle: 'AGENT_01 // SPRINT',
            desc: 'Set the primary focus duration for cognitive immersion.',
            duration: config.sprintDuration,
            onUpdate: (val: number) => updateConfig({ sprintDuration: val }),
            icon: Zap,
            color: 'text-amber-500',
            bg: 'bg-amber-500',
            glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
            action: () => startSession(config.sprintDuration, 'WORK')
        },
        {
            id: 'recovery',
            title: 'Short Recovery',
            subtitle: 'AGENT_02 // RECOVERY',
            desc: 'Brief neural cooling phase between sprints.',
            duration: config.shortBreakDuration,
            onUpdate: (val: number) => updateConfig({ shortBreakDuration: val }),
            icon: Activity,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500',
            glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]',
            action: () => startSession(config.shortBreakDuration, 'SHORT_BREAK')
        },
        {
            id: 'extended',
            title: 'Extended Break',
            subtitle: 'AGENT_03 // EXTENDED',
            desc: 'Longer rest cycle after every 4 completed sessions.',
            duration: config.longBreakDuration,
            onUpdate: (val: number) => updateConfig({ longBreakDuration: val }),
            icon: Coffee,
            color: 'text-yellow-200',
            bg: 'bg-yellow-200',
            glow: 'shadow-[0_0_20px_rgba(254,240,138,0.2)]',
            action: () => startSession(config.longBreakDuration, 'LONG_BREAK')
        }
    ]

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            {/* Header */}
            <header className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-2 font-bold">Focus Mastery</div>
                    <h1 className={`${playfair.className} text-4xl mb-1`}>
                        Level <span className="text-amber-500">14</span>
                    </h1>
                </div>

                <div className="flex-1 max-w-md mx-auto text-center">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Daily Momentum</div>
                    <div className="font-mono text-xl mb-1">{String(totalSessions).padStart(2, '0')}/10</div>
                    <div className="text-[9px] uppercase tracking-wider text-white/20">Sessions</div>
                    {/* Progress Bar */}
                    <div className="h-1 w-24 mx-auto bg-white/10 mt-2 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-500 transition-all duration-500"
                            style={{ width: `${Math.min(100, (totalSessions / 10) * 100)}%` }}
                        />
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Config Mode</div>
                    <div className="font-mono text-xl tracking-wider">PROTOCOL EDIT</div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Main Cards System (3 Cols) */}
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {presets.map((preset) => (
                        <motion.div
                            key={preset.id}
                            whileHover={{ y: -5 }}
                            className={`
                                relative p-8 rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden group
                                hover:border-white/20 transition-all cursor-pointer h-[500px] flex flex-col justify-between
                            `}
                            onClick={preset.action}
                        >
                            {/* Top Content */}
                            <div>
                                <div className="flex justify-between items-start mb-8">
                                    <div className="text-[9px] uppercase tracking-widest text-white/30 font-mono">
                                        {preset.subtitle}
                                    </div>
                                    <preset.icon className={`w-5 h-5 ${preset.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                                </div>
                                <h3 className={`text-2xl font-serif mb-2 ${preset.color === 'text-white' ? 'text-white' : 'text-white'}`}>
                                    {preset.title}
                                </h3>
                                <p className="text-sm text-white/40 leading-relaxed font-light">
                                    {preset.desc}
                                </p>
                            </div>

                            {/* Center Dial / Visual */}
                            <div className="flex-1 flex items-center justify-center relative">
                                <div className={`w-40 h-40 rounded-full border border-white/5 flex items-center justify-center relative`}>
                                    {/* Simple ring for now */}
                                    <div className={`absolute inset-0 rounded-full border-t-2 ${preset.color.replace('text-', 'border-')} opacity-20 group-hover:opacity-100 transition-opacity rotate-45`} />
                                    <div className="text-center">
                                        <div className="text-5xl font-serif mb-1">{preset.duration}</div>
                                        <div className="text-[9px] uppercase tracking-widest text-white/30">Minutes</div>
                                    </div>
                                </div>
                            </div>

                            {/* Slider */}
                            <div className="w-full relative h-6 flex items-center group/slider" onClick={(e) => e.stopPropagation()}>
                                <div className="absolute w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${preset.bg} opacity-50 transition-all duration-300`}
                                        style={{ width: `${(preset.duration / (preset.id === 'sprint' ? 90 : 30)) * 100}%` }}
                                    />
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max={preset.id === 'sprint' ? "90" : "30"}
                                    value={preset.duration}
                                    onChange={(e) => preset.onUpdate(parseInt(e.target.value))}
                                    className="absolute w-full h-full opacity-0 cursor-ew-resize z-20"
                                />
                                <div
                                    className={`absolute h-3 w-3 rounded-full ${preset.bg} ${preset.glow} transition-all duration-75 pointer-events-none z-10`}
                                    style={{ left: `calc(${(preset.duration / (preset.id === 'sprint' ? 90 : 30)) * 100}% - 6px)` }}
                                />
                            </div>

                        </motion.div>
                    ))}
                </div>

                {/* Right Panel Strategy (1 Col) */}
                <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl p-6 h-fit space-y-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Settings2 className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Strategy</span>
                    </div>

                    {/* Daily Goal */}
                    <div className="space-y-3">
                        <label className="text-[10px] uppercase tracking-widest text-white/30">Daily Goal (Sessions)</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[4, 8, 10, 12].map(num => (
                                <button
                                    key={num}
                                    className={`py-2 text-xs font-mono border rounded transition-all ${num === 10 ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-white/10 text-white/30 hover:bg-white/5'}`}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* Automation Prefs */}
                    <div className="space-y-4">
                        <label className="text-[10px] uppercase tracking-widest text-white/30">Automation Prefs</label>

                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/70">Auto-start Breaks</span>
                            <Switch
                                checked={config.autoStartBreaks}
                                onCheckedChange={(c) => updateConfig({ autoStartBreaks: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-white/70">Auto-start Sprints</span>
                            <Switch
                                checked={config.autoStartSprints}
                                onCheckedChange={(c) => updateConfig({ autoStartSprints: c })}
                            />
                        </div>
                        <div className="flex items-center justify-between opacity-50">
                            <span className="text-xs text-white/70">Hard Mode Lock</span>
                            <Switch disabled checked={false} />
                        </div>
                    </div>

                    <div className="w-full h-px bg-white/5" />

                    {/* System Note */}
                    <div className="bg-white/5 rounded-lg p-4 text-[11px] text-white/50 leading-relaxed">
                        <span className="text-amber-500 font-bold block mb-1">SYSTEM NOTE</span>
                        Your current 50/7 configuration is optimized for deep creative flow based on last week's neural data.
                    </div>

                </div>
            </div>
        </div>
    )
}
