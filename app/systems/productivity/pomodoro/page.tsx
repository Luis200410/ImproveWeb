'use client'

import { motion } from 'framer-motion'
import { Playfair_Display } from '@/lib/font-shim'
import { usePomodoro } from '@/components/productivity/pomodoro/pomodoro-context'
import { Play, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PomodoroSettings } from '@/components/productivity/pomodoro/pomodoro-settings'

const playfair = Playfair_Display({ subsets: ['latin'] })

export default function PomodoroDashboard() {
    const {
        isActive,
        pauseSession,
        startSession,
        stopSession,
        config,
        updateConfig,
        todayCompleted,
        todayAbandoned,
        level
    } = usePomodoro()

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-end md:items-end gap-6 mb-12 border-b border-white/10 pb-6">
                <div className="w-full md:w-auto text-center md:text-left">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-amber-500 mb-2 font-bold">Focus Mastery</div>
                    <h1 className={`${playfair.className} text-4xl mb-1`}>
                        Level <span className="text-amber-500">{level}</span>
                    </h1>
                </div>

                <div className="w-full md:w-auto text-center md:text-right">
                    <div className="text-[10px] uppercase tracking-widest text-white/30 mb-2">Daily Momentum</div>
                    <div className="font-mono text-xl mb-1 text-white/90">{String(todayCompleted).padStart(2, '0')} SESSION{todayCompleted !== 1 ? 'S' : ''}</div>
                    {todayAbandoned > 0 && (
                        <div className="text-[9px] uppercase tracking-wider text-rose-500 mt-1">{todayAbandoned} ABANDONED</div>
                    )}
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col"
            >
                <PomodoroSettings config={config} updateConfig={updateConfig} />

                <div className="flex justify-center mt-12 w-full">
                    {!isActive ? (
                        <Button
                            onClick={() => startSession(config.sprintDuration, 'WORK')}
                            size="lg"
                            className="w-full md:w-auto md:min-w-[400px] h-16 bg-white text-black hover:bg-white/90 font-bold text-xs tracking-[0.2em] uppercase rounded-full shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-3"
                        >
                            <Play className="w-5 h-5" /> Initialize Sprint
                        </Button>
                    ) : (
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center justify-center">
                            <Button
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to abandon the current session?")) {
                                        stopSession()
                                    }
                                }}
                                size="lg"
                                variant="outline"
                                className="border-white/10 text-white/70 hover:text-rose-500 hover:border-rose-500/50 hover:bg-rose-500/10 h-16 md:px-12 w-full sm:w-auto rounded-full uppercase tracking-[0.2em] text-xs font-bold transition-all"
                            >
                                <X className="w-4 h-4 mr-2" /> Abandon Session
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    )
}
