
'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { PomodoroConfig, DEFAULT_CONFIG } from './pomodoro-utils'

type SessionType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE'

interface PomodoroState {
    timeLeft: number // seconds
    isActive: boolean
    sessionType: SessionType
    currentSession: number
    totalSessions: number
    config: PomodoroConfig
    isSidebarOpen: boolean
    minimized: boolean
}

interface PomodoroContextType extends PomodoroState {
    startSession: (durationMinutes?: number, type?: SessionType) => void
    pauseSession: () => void
    stopSession: () => void
    toggleSidebar: () => void
    minimizeSidebar: () => void
    updateConfig: (updates: Partial<PomodoroConfig>) => void
    skipSession: () => void
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined)

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
    // State
    const [timeLeft, setTimeLeft] = useState(DEFAULT_CONFIG.sprintDuration * 60)
    const [isActive, setIsActive] = useState(false)
    const [sessionType, setSessionType] = useState<SessionType>('IDLE')
    const [currentSession, setCurrentSession] = useState(1) // 1-indexed count for the day
    const [totalSessions, setTotalSessions] = useState(0) // Total completed
    const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG)

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [minimized, setMinimized] = useState(false)

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Timer Logic
    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1)
            }, 1000)
        } else if (timeLeft === 0 && isActive) {
            // Timer Finished
            handleSessionComplete()
        }

        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [isActive, timeLeft])

    const handleSessionComplete = () => {
        setIsActive(false)
        if (timerRef.current) clearInterval(timerRef.current)

        // Logic for next session
        if (sessionType === 'WORK') {
            setTotalSessions(p => p + 1)
            const nextType = currentSession % config.sessionsBeforeLongBreak === 0 ? 'LONG_BREAK' : 'SHORT_BREAK'

            // Auto-start break logic could go here
            if (config.autoStartBreaks) {
                startSession(nextType === 'LONG_BREAK' ? config.longBreakDuration : config.shortBreakDuration, nextType)
            } else {
                setSessionType(nextType)
                setTimeLeft((nextType === 'LONG_BREAK' ? config.longBreakDuration : config.shortBreakDuration) * 60)
            }
        } else {
            // Break finished
            setCurrentSession(p => p + 1)
            if (config.autoStartSprints) {
                startSession(config.sprintDuration, 'WORK')
            } else {
                setSessionType('WORK')
                setTimeLeft(config.sprintDuration * 60)
            }
        }
    }

    const startSession = (durationMinutes?: number, type: SessionType = 'WORK') => {
        const duration = durationMinutes || (type === 'WORK' ? config.sprintDuration : type === 'SHORT_BREAK' ? config.shortBreakDuration : config.longBreakDuration)
        setSessionType(type)
        setTimeLeft(duration * 60)
        setIsActive(true)
        setIsSidebarOpen(true)
        setMinimized(false)
    }

    const pauseSession = () => setIsActive(false)

    // Stop resets to initial state of current session type
    const stopSession = () => {
        setIsActive(false)
        const duration = sessionType === 'WORK' ? config.sprintDuration : sessionType === 'SHORT_BREAK' ? config.shortBreakDuration : config.longBreakDuration
        setTimeLeft(duration * 60)
    }

    const skipSession = () => {
        handleSessionComplete(); // Cheat to next
    }

    const toggleSidebar = () => setIsSidebarOpen(prev => !prev)
    const minimizeSidebar = () => {
        setIsSidebarOpen(false)
        if (isActive) setMinimized(true)
    }

    const updateConfig = (updates: Partial<PomodoroConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }))
    }

    return (
        <PomodoroContext.Provider value={{
            timeLeft,
            isActive,
            sessionType,
            currentSession,
            totalSessions,
            config,
            isSidebarOpen,
            minimized,
            startSession,
            pauseSession,
            stopSession,
            toggleSidebar,
            minimizeSidebar,
            updateConfig,
            skipSession
        }}>
            {children}
        </PomodoroContext.Provider>
    )
}

export function usePomodoro() {
    const context = useContext(PomodoroContext)
    if (context === undefined) {
        throw new Error('usePomodoro must be used within a PomodoroProvider')
    }
    return context
}
