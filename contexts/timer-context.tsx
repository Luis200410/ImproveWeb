'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type TimerPhase = 'idle' | 'work' | 'break' | 'complete'

interface TimerState {
    phase: TimerPhase
    timeLeft: number
    isRunning: boolean
    workDuration: number
    breakDuration: number
    habitName?: string
    habitId?: string
}

interface TimerContextType {
    timerState: TimerState
    startTimer: (work: number, breakDur: number, habitName?: string, habitId?: string) => void
    stopTimer: () => void
    pauseTimer: () => void
    resumeTimer: () => void
    progress: number
    isTimerActive: boolean
}

const TimerContext = createContext<TimerContextType | null>(null)

export function TimerProvider({ children }: { children: ReactNode }) {
    const [timerState, setTimerState] = useState<TimerState>({
        phase: 'idle',
        timeLeft: 0,
        isRunning: false,
        workDuration: 0,
        breakDuration: 0,
    })

    // Load timer state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('pomodoroTimer')
        if (saved) {
            const parsed = JSON.parse(saved)
            // Check if timer was running
            if (parsed.isRunning && parsed.timeLeft > 0) {
                setTimerState(parsed)
            }
        }
    }, [])

    // Save timer state to localStorage
    useEffect(() => {
        if (timerState.phase !== 'idle') {
            localStorage.setItem('pomodoroTimer', JSON.stringify(timerState))
        } else {
            localStorage.removeItem('pomodoroTimer')
        }
    }, [timerState])

    // Timer countdown effect
    useEffect(() => {
        if (!timerState.isRunning || timerState.timeLeft <= 0) return

        const interval = setInterval(() => {
            setTimerState((prev) => {
                const newTime = prev.timeLeft - 1

                if (newTime <= 0) {
                    // Auto-advance to next phase
                    if (prev.phase === 'work') {
                        return {
                            ...prev,
                            phase: 'break',
                            timeLeft: prev.breakDuration * 60,
                            isRunning: true,
                        }
                    } else if (prev.phase === 'break') {
                        return {
                            ...prev,
                            phase: 'complete',
                            timeLeft: 0,
                            isRunning: false,
                        }
                    }
                }

                return { ...prev, timeLeft: newTime }
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [timerState.isRunning, timerState.timeLeft])

    const startTimer = (work: number, breakDur: number, habitName?: string, habitId?: string) => {
        setTimerState({
            phase: 'work',
            timeLeft: work * 60,
            isRunning: true,
            workDuration: work,
            breakDuration: breakDur,
            habitName,
            habitId,
        })
    }

    const stopTimer = () => {
        setTimerState({
            phase: 'idle',
            timeLeft: 0,
            isRunning: false,
            workDuration: 0,
            breakDuration: 0,
        })
        localStorage.removeItem('pomodoroTimer')
    }

    const pauseTimer = () => {
        setTimerState((prev) => ({ ...prev, isRunning: false }))
    }

    const resumeTimer = () => {
        setTimerState((prev) => ({ ...prev, isRunning: true }))
    }

    const totalTime =
        timerState.phase === 'work'
            ? timerState.workDuration * 60
            : timerState.phase === 'break'
                ? timerState.breakDuration * 60
                : 0
    const progress = totalTime > 0 ? ((totalTime - timerState.timeLeft) / totalTime) * 100 : 0

    const isTimerActive = timerState.phase !== 'idle' && timerState.phase !== 'complete'

    return (
        <TimerContext.Provider
            value={{
                timerState,
                startTimer,
                stopTimer,
                pauseTimer,
                resumeTimer,
                progress,
                isTimerActive,
            }}
        >
            {children}
        </TimerContext.Provider>
    )
}

export function useTimer() {
    const context = useContext(TimerContext)
    if (!context) {
        throw new Error('useTimer must be used within TimerProvider')
    }
    return context
}
