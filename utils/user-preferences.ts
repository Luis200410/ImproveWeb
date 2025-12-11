'use client'

// Lightweight per-user preference store using localStorage

type Prefs = Record<string, unknown>

function getKey(userId: string) {
    return `improve_prefs_${userId || 'defaultUser'}`
}

export function loadPrefs<T extends Prefs>(userId: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    try {
        const raw = localStorage.getItem(getKey(userId))
        if (!raw) return fallback
        const parsed = JSON.parse(raw)
        return { ...fallback, ...parsed }
    } catch {
        return fallback
    }
}

export function savePrefs<T extends Prefs>(userId: string, prefs: T) {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(getKey(userId), JSON.stringify(prefs))
    } catch {
        // ignore
    }
}
