'use client'

import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { PomodoroConfig, DEFAULT_CONFIG, PomodoroDailyStats } from './pomodoro-utils'
import { createClient } from '@/utils/supabase/client'
import { dataStore } from '@/lib/data-store'

type SessionType = 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK' | 'IDLE'

interface PomodoroState {
    timeLeft: number // seconds
    isActive: boolean
    sessionType: SessionType
    currentSession: number
    todayCompleted: number
    todayAbandoned: number
    lifetimeCompleted: number
    level: number
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

    // Leveling & Stats State
    const [todayCompleted, setTodayCompleted] = useState(0)
    const [todayAbandoned, setTodayAbandoned] = useState(0)
    const [lifetimeCompleted, setLifetimeCompleted] = useState(0)
    const [level, setLevel] = useState(1)
    const [userId, setUserId] = useState<string | null>(null)
    const [todayEntryId, setTodayEntryId] = useState<string | null>(null)

    const [config, setConfig] = useState<PomodoroConfig>(DEFAULT_CONFIG)

    // UI State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [minimized, setMinimized] = useState(false)

    const timerRef = useRef<NodeJS.Timeout | null>(null)

    // Fetch User and Stats
    useEffect(() => {
        const initUser = async () => {
            const { data: { user } } = await createClient().auth.getUser()
            if (user) {
                setUserId(user.id)
                loadStats(user.id)
            }
        }
        initUser()
    }, [])

    const loadStats = async (uid: string) => {
        try {
            const entries = await dataStore.getEntries('pomodoro-daily-stats', uid);
            let lifetime = 0;
            const today = new Date().toISOString().split('T')[0];
            let foundTodayComplete = 0;
            let foundTodayAbandoned = 0;
            let foundEntryId = null;

            entries.forEach(entry => {
                const data = entry.data as PomodoroDailyStats;
                lifetime += (data.completed || 0);
                if (data.date === today) {
                    foundTodayComplete = data.completed || 0;
                    foundTodayAbandoned = data.abandoned || 0;
                    foundEntryId = entry.id;
                }
            });

            setLifetimeCompleted(lifetime);
            setLevel(Math.floor(lifetime / 10) + 1);
            setTodayCompleted(foundTodayComplete);
            setTodayAbandoned(foundTodayAbandoned);
            setTodayEntryId(foundEntryId);
        } catch (error) {
            console.error("Failed to load Pomodoro stats", error)
        }
    }

    const recordStat = async (type: 'completed' | 'abandoned') => {
        if (!userId) return;

        const today = new Date().toISOString().split('T')[0]

        let newCompleted = todayCompleted + (type === 'completed' ? 1 : 0);
        let newAbandoned = todayAbandoned + (type === 'abandoned' ? 1 : 0);
        let newLifetime = lifetimeCompleted + (type === 'completed' ? 1 : 0);

        setTodayCompleted(newCompleted);
        setTodayAbandoned(newAbandoned);
        if (type === 'completed') {
            setLifetimeCompleted(newLifetime);
            setLevel(Math.floor(newLifetime / 10) + 1);
        }

        const data: PomodoroDailyStats = {
            date: today,
            completed: newCompleted,
            abandoned: newAbandoned
        };

        try {
            if (todayEntryId) {
                await dataStore.updateEntry(todayEntryId, data);
            } else {
                const entry = await dataStore.addEntry(userId, 'pomodoro-daily-stats', data);
                setTodayEntryId(entry.id);
            }
        } catch (error) {
            console.error("Failed to save Pomodoro stat entry", error)
        }
    }

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

    const handleSessionComplete = async () => {
        setIsActive(false)
        if (timerRef.current) clearInterval(timerRef.current)

        // Logic for next session
        if (sessionType === 'WORK') {
            await recordStat('completed');
            try {
                if (userId) {
                    await dataStore.savePomodoroSession({
                        userId,
                        workDuration: config.sprintDuration,
                        breakDuration: config.shortBreakDuration,
                        wasAutoTriggered: config.autoStartBreaks,
                    })
                }
            } catch (err) {
                console.error("Failed to log pomodoro session for review stats", err)
            }
            const nextType = currentSession % config.sessionsBeforeLongBreak === 0 ? 'LONG_BREAK' : 'SHORT_BREAK'

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

    // Stop resets to initial state of current session type and records abandoned if working
    const stopSession = async () => {
        if (isActive && sessionType === 'WORK') {
            await recordStat('abandoned')
        }
        setIsActive(false)
        const duration = sessionType === 'WORK' ? config.sprintDuration : sessionType === 'SHORT_BREAK' ? config.shortBreakDuration : config.longBreakDuration
        setTimeLeft(duration * 60)
    }

    const skipSession = () => {
        handleSessionComplete(); // Cheat to finish it
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
            todayCompleted,
            todayAbandoned,
            lifetimeCompleted,
            level,
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
