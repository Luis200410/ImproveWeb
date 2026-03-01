'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Playfair_Display, Inter } from '@/lib/font-shim'
import { Switch } from '@/components/ui/switch'
import { Zap, Activity, Coffee, Settings2 } from 'lucide-react'
import { PomodoroConfig } from './pomodoro-utils'

const playfair = Playfair_Display({ subsets: ['latin'] })
const inter = Inter({ subsets: ['latin'] })

import { useState, useRef, useEffect, useCallback } from 'react'

type RingConfig = {
    key: 'sprint' | 'shortBreak' | 'longBreak'
    label: string
    radius: number
    color: string
    min: number
    max: number
    step: number
}

interface TripleWatchDialProps {
    config: PomodoroConfig
    onChange: (updates: Partial<PomodoroConfig>) => void
}

function TripleWatchDial({ config, onChange }: TripleWatchDialProps) {
    const rings: RingConfig[] = [
        { key: 'sprint', label: 'Focus Session', radius: 100, color: '#f59e0b', min: 10, max: 90, step: 5 },
        { key: 'shortBreak', label: 'Rest', radius: 75, color: '#34d399', min: 1, max: 15, step: 1 },
        { key: 'longBreak', label: 'Long Rest', radius: 50, color: '#fef08a', min: 10, max: 45, step: 5 },
    ]

    const [activeRing, setActiveRing] = useState<RingConfig['key'] | null>(null)
    const [hoveredRing, setHoveredRing] = useState<RingConfig['key'] | null>(null)
    const svgRef = useRef<SVGSVGElement>(null)

    // Helper to get value for a ring
    const getValue = (key: RingConfig['key']) => {
        if (key === 'sprint') return config.sprintDuration
        if (key === 'shortBreak') return config.shortBreakDuration
        return config.longBreakDuration
    }

    const handlePointerInteraction = useCallback((e: React.PointerEvent | PointerEvent, isDown: boolean = false) => {
        if (!svgRef.current) return

        const rect = svgRef.current.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        const centerY = rect.top + rect.height / 2

        const x = e.clientX - centerX
        const y = e.clientY - centerY

        // Distance from center in screen pixels
        const screenDistance = Math.sqrt(x * x + y * y)
        // Scale distance to SVG viewBox space (240x240)
        const scale = 240 / rect.width
        const distance = screenDistance * scale

        // Calculate angle from 12 o'clock (screen coordinates)
        let angle = Math.atan2(y, x) + Math.PI / 2
        if (angle < 0) angle += 2 * Math.PI
        const newProgress = angle / (2 * Math.PI)

        let targetRingKey = activeRing

        // On initial down, determine which ring we grabbed based on distance
        if (isDown) {
            if (distance > 87.5) {
                targetRingKey = 'sprint'      // Focus (100)
            } else if (distance > 62.5) {
                targetRingKey = 'shortBreak'  // Rest (75)
            } else {
                targetRingKey = 'longBreak'   // Long Rest (50)
            }
            setActiveRing(targetRingKey)
        }

        if (targetRingKey) {
            const ring = rings.find(r => r.key === targetRingKey)
            if (ring) {
                let newValue = ring.min + newProgress * (ring.max - ring.min)
                newValue = Math.round(newValue / ring.step) * ring.step
                newValue = Math.max(ring.min, Math.min(ring.max, newValue))

                // Map ring key to config property
                let configKey: keyof PomodoroConfig = 'sprintDuration'
                if (targetRingKey === 'shortBreak') configKey = 'shortBreakDuration'
                if (targetRingKey === 'longBreak') configKey = 'longBreakDuration'

                onChange({ [configKey]: newValue })
            }
        }
    }, [activeRing, config, onChange])

    const onPointerDown = (e: React.PointerEvent) => {
        // Prevent generic dragging
        e.currentTarget.setPointerCapture(e.pointerId)
        handlePointerInteraction(e, true)
    }

    useEffect(() => {
        const onPointerMove = (e: PointerEvent) => {
            if (activeRing) {
                handlePointerInteraction(e)
            } else if (svgRef.current) {
                // Hover detection
                const rect = svgRef.current.getBoundingClientRect()
                const centerX = rect.left + rect.width / 2
                const centerY = rect.top + rect.height / 2

                const x = e.clientX - centerX
                const y = e.clientY - centerY

                // Scale distance
                const screenDistance = Math.sqrt(x * x + y * y)
                const scale = 240 / rect.width
                const distance = screenDistance * scale

                // Focus Session (radius 100) -> 87.5 to 115
                // Rest (radius 75) -> 62.5 to 87.5
                // Long Rest (radius 50) -> 30 to 62.5
                if (distance > 87.5 && distance <= 115) setHoveredRing('sprint')
                else if (distance > 62.5 && distance <= 87.5) setHoveredRing('shortBreak')
                else if (distance > 30 && distance <= 62.5) setHoveredRing('longBreak')
                else setHoveredRing(null)
            }
        }

        const onPointerUp = () => {
            setActiveRing(null)
            setHoveredRing(null)
        }

        window.addEventListener('pointermove', onPointerMove)
        window.addEventListener('pointerup', onPointerUp)

        return () => {
            window.removeEventListener('pointermove', onPointerMove)
            window.removeEventListener('pointerup', onPointerUp)
        }
    }, [activeRing, handlePointerInteraction])

    // Center display logic
    const displayRing = activeRing || hoveredRing || 'sprint'
    const displayData = rings.find(r => r.key === displayRing)
    const displayValue = displayData ? getValue(displayData.key) : 0

    return (
        <div className="flex flex-col items-center justify-center relative select-none w-full max-w-[500px] mx-auto">
            <div className="relative w-full aspect-square">
                <svg
                    ref={svgRef}
                    className="absolute inset-0 -rotate-90 w-full h-full touch-none cursor-pointer drop-shadow-2xl"
                    viewBox="0 0 240 240" // Center at 120, 120
                    onPointerDown={onPointerDown}
                >
                    {/* Center point */}
                    <circle cx="120" cy="120" r="120" fill="transparent" />

                    {rings.map((ring) => {
                        const value = getValue(ring.key)
                        const progress = (value - ring.min) / (ring.max - ring.min)
                        const circumference = 2 * Math.PI * ring.radius
                        const strokeDashoffset = circumference - progress * circumference
                        const isFocus = activeRing === ring.key || hoveredRing === ring.key

                        return (
                            <g key={ring.key} className="transition-opacity duration-300" style={{ opacity: (!activeRing && !hoveredRing) || isFocus ? 1 : 0.3 }}>
                                {/* Rail */}
                                <circle
                                    cx="120"
                                    cy="120"
                                    r={ring.radius}
                                    fill="none"
                                    className="stroke-white/5"
                                    strokeWidth="18"
                                />
                                {/* Track */}
                                <motion.circle
                                    cx="120"
                                    cy="120"
                                    r={ring.radius}
                                    fill="none"
                                    stroke={ring.color}
                                    strokeWidth="18"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    animate={{ strokeDashoffset }}
                                    transition={{ type: "tween", duration: activeRing === ring.key ? 0.05 : 0.3, ease: "easeOut" }}
                                    style={{ filter: isFocus ? `drop-shadow(0 0 8px ${ring.color}80)` : 'none' }}
                                />
                                {/* Thumb/Indicator */}
                                <motion.circle
                                    cx="120"
                                    cy="120"
                                    r="4"
                                    fill="#222"
                                    stroke={ring.color}
                                    strokeWidth="2"
                                    style={{ transformOrigin: '120px 120px' }}
                                    animate={{
                                        rotate: progress * 360,
                                        cx: 120 + ring.radius
                                    }}
                                    transition={{ type: "tween", duration: activeRing === ring.key ? 0.05 : 0.3, ease: "easeOut" }}
                                />
                            </g>
                        )
                    })}
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
                    <span className={`${playfair.className} text-7xl font-bold tracking-tighter drop-shadow-lg transition-colors`} style={{ color: displayData?.color }}>
                        {displayValue}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.2em] mt-2 font-bold text-white/50 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                        {displayData?.label || 'MINUTES'}
                    </span>
                </div>
            </div>

            <div className={`mt-8 text-[10px] uppercase tracking-[0.2em] font-mono transition-opacity duration-300 ${activeRing ? 'text-white text-opacity-80' : 'text-white text-opacity-20 flex items-center gap-2'}`}>
                {activeRing ? `Adjusting ${displayData?.label}` : 'Drag rings to adjust'}
            </div>
        </div>
    )
}

interface PomodoroSettingsProps {
    config: PomodoroConfig
    updateConfig: (updates: Partial<PomodoroConfig>) => void
}

export function PomodoroSettings({ config, updateConfig }: PomodoroSettingsProps) {
    const dailyGoalOptions = [4, 8, 10, 12]

    return (
        <div className="w-full flex flex-col items-center justify-center max-w-5xl mx-auto px-4">
            {/* Center: Triple Watch Dial */}
            <div className="w-full min-w-[280px] max-w-[500px] flex items-center justify-center py-4 relative">
                <TripleWatchDial config={config} onChange={updateConfig} />
            </div>
        </div>
    )
}
