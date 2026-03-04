'use client'

import { useEffect, useRef } from 'react'
import { sileo } from 'sileo'
import { dataStore } from '@/lib/data-store'
import { createClient } from '@/utils/supabase/client'
import { Entry } from '@/lib/data-store'

// ── Helpers (mirrors parseEntryToPosition logic in habit-timeline.tsx) ────────

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getHabitMins(entry: Entry, dayKey: string): number {
    const daySched = entry.data['schedule']?.[dayKey]
    const rawTime =
        (typeof daySched === 'object' ? daySched?.time : daySched) ||
        entry.data['Time'] ||
        ''

    if (!rawTime) return -1

    const clean = String(rawTime).replace(/[^0-9:apmAPM\s]/g, '')
    const timeOnly = clean.replace(/[apmAPM\s]/g, '')
    const [hStr, mStr] = timeOnly.split(':')
    let h = parseInt(hStr || '0', 10)
    let m = parseInt(mStr || '0', 10)
    if (isNaN(h)) h = 0
    if (isNaN(m)) m = 0
    // Handle 12-hour PM
    if (String(rawTime).toLowerCase().includes('pm') && h < 12) h += 12
    if (String(rawTime).toLowerCase().includes('am') && h === 12) h = 0

    return h * 60 + m
}

function minsToDisplay(mins: number): string {
    const h = Math.floor(mins / 60) % 24
    const m = mins % 60
    const suffix = h >= 12 ? 'PM' : 'AM'
    const displayH = h % 12 || 12
    return `${displayH}:${m.toString().padStart(2, '0')} ${suffix}`
}

function nowMins(): number {
    const n = new Date()
    return n.getHours() * 60 + n.getMinutes()
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function HabitReminderProvider() {
    /** habitId_YYYY-MM-DD → already fired */
    const firedRef = useRef<Set<string>>(new Set())
    const userIdRef = useRef<string | null>(null)
    const habitsRef = useRef<Entry[]>([])

    // Load user once on mount
    useEffect(() => {
        const init = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            userIdRef.current = user?.id || null
        }
        init()
    }, [])

    // Reload habits every 5 minutes so we always have fresh data
    useEffect(() => {
        const loadHabits = async () => {
            if (!userIdRef.current) return
            try {
                const entries = await dataStore.getEntries('atomic-habits', userIdRef.current)
                habitsRef.current = entries
            } catch (e) {
                console.error('[HabitReminder] Failed to load habits:', e)
            }
        }

        // Wait a bit for userIdRef to populate, then load
        const initTimer = setTimeout(loadHabits, 2000)
        const refreshInterval = setInterval(loadHabits, 5 * 60 * 1000)
        return () => {
            clearTimeout(initTimer)
            clearInterval(refreshInterval)
        }
    }, [])

    // Check every 30 seconds
    useEffect(() => {
        const check = () => {
            const habits = habitsRef.current
            if (!habits.length) return

            const now = new Date()
            const current = nowMins()
            const todayKey = now.toISOString().split('T')[0]
            const dayKey = DAY_KEYS[now.getDay()]

            // Build list of habits active today, sorted by time
            const scheduled = habits
                .filter(h => {
                    if (h.data['Type'] === 'adaptation') return false
                    if (h.data['archived']) return false

                    // Check frequency
                    const freq = h.data['frequency'] || 'daily'
                    if (freq === 'specific_days') {
                        const days: string[] = h.data['repeatDays'] || []
                        if (!days.includes(dayKey)) return false
                    }

                    // Check excluded dates
                    const excluded: string[] = h.data['excludedDates'] || []
                    if (excluded.includes(todayKey)) return false

                    // Check already completed today
                    const completed: string[] = h.data['completedDates'] || []
                    if (completed.includes(todayKey)) return false

                    return true
                })
                .map(h => ({
                    entry: h,
                    mins: getHabitMins(h, dayKey),
                }))
                .filter(h => h.mins >= 0)
                .sort((a, b) => a.mins - b.mins)

            for (let i = 0; i < scheduled.length; i++) {
                const { entry, mins } = scheduled[i]
                const key = `${entry.id}_${todayKey}`
                if (firedRef.current.has(key)) continue

                const minutesUntil = mins - current

                // Fire between 5 minutes before AND at the exact minute (0)
                if (minutesUntil >= 0 && minutesUntil <= 5) {
                    firedRef.current.add(key)

                    // Next upcoming habit that isn't already fired
                    const nextItem = scheduled.slice(i + 1).find(
                        h => !firedRef.current.has(`${h.entry.id}_${todayKey}`)
                    )
                    const nextHint = nextItem
                        ? `Next: "${nextItem.entry.data['Habit Name'] || 'Habit'}" at ${minsToDisplay(nextItem.mins)}`
                        : '✓ Last habit of the day'

                    const habitName = entry.data['Habit Name'] || 'Your habit'
                    const label = minutesUntil === 0
                        ? `Starting now! · ${minsToDisplay(mins)}`
                        : `In ${minutesUntil} min · ${minsToDisplay(mins)}`

                    const markDone = async () => {
                        try {
                            const today = new Date().toISOString().split('T')[0]
                            const existing: string[] = Array.isArray(entry.data['completedDates'])
                                ? entry.data['completedDates']
                                : []
                            if (!existing.includes(today)) {
                                existing.push(today)
                                await dataStore.updateEntry(entry.id, {
                                    ...entry.data,
                                    completedDates: existing,
                                    Streak: (Number(entry.data['Streak'] || 0)) + 1,
                                })
                            }
                            sileo.success({
                                title: '✓ Logged',
                                description: `${habitName} marked complete for today.`,
                                duration: 3000,
                            })
                        } catch {
                            sileo.error({ description: 'Failed to mark habit as done.' })
                        }
                    }

                    sileo.action({
                        title: `⏰ ${habitName}`,
                        description: `${label}\n${nextHint}`,
                        duration: 5 * 60 * 1000, // stays for 5 mins
                        button: {
                            title: minutesUntil === 0 ? '✓ Done' : 'Mark Done',
                            onClick: markDone,
                        },
                    })
                }
            }
        }

        // First check after 3s (let habits load first)
        const boot = setTimeout(check, 3000)
        const interval = setInterval(check, 30_000)
        return () => {
            clearTimeout(boot)
            clearInterval(interval)
        }
    }, [])

    return null
}
