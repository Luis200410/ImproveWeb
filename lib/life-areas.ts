/**
 * Life Areas — canonical constants for the IMPROVE system.
 * These are the 12 Life Areas + "4 Bigs" priority category used across
 * Habits, Projection, and Reflexión. They are fixed (not user-editable).
 */

export const LIFE_AREAS = [
    { id: '4-bigs', label: '4 Bigs', emoji: '🔥', color: '#fb7185', description: 'Your 4 most important annual goals' },
    { id: 'career', label: 'Career', emoji: '💼', color: '#f59e0b', description: 'Professional growth and work life' },
    { id: 'family', label: 'Family', emoji: '🏠', color: '#34d399', description: 'Relationships with family members' },
    { id: 'friends', label: 'Friends', emoji: '🤝', color: '#60a5fa', description: 'Friendships and social connections' },
    { id: 'growth', label: 'Growth', emoji: '🌱', color: '#4ade80', description: 'Learning, skills, and self-development' },
    { id: 'joy', label: 'Joy', emoji: '✨', color: '#fb923c', description: 'Fun, hobbies, and creative pursuits' },
    { id: 'mental-health', label: 'Mental Health', emoji: '🧘', color: '#818cf8', description: 'Emotional and psychological well-being' },
    { id: 'money', label: 'Money', emoji: '💰', color: '#86efac', description: 'Financial health and wealth building' },
    { id: 'eating', label: 'Eating', emoji: '🍎', color: '#10b981', description: 'Nutrition, meals, and dietary habits' },
    { id: 'physical-health', label: 'Physical Health', emoji: '💪', color: '#f87171', description: 'Fitness and body health' },
    { id: 'purpose', label: 'Purpose', emoji: '🎯', color: '#fbbf24', description: 'Mission, values, and legacy' },
    { id: 'romance', label: 'Romance', emoji: '💕', color: '#f472b6', description: 'Romantic relationship and intimacy' },
    { id: 'spiritual-health', label: 'Spiritual Health', emoji: '🙏', color: '#a78bfa', description: 'Faith, mindfulness, and inner peace' },
] as const

export type LifeAreaId = typeof LIFE_AREAS[number]['id']

export type LifeArea = typeof LIFE_AREAS[number]

/** Get a Life Area object by its id. Returns undefined if not found. */
export function getLifeArea(id: string): LifeArea | undefined {
    return LIFE_AREAS.find(a => a.id === id)
}

/** All Life Area ids as a string array (useful for field options) */
export const LIFE_AREA_IDS: string[] = LIFE_AREAS.map(a => a.id)

/** All Life Area labels as a string array */
export const LIFE_AREA_LABELS: string[] = LIFE_AREAS.map(a => a.label)

/**
 * Legacy Category → Life Area migration map.
 * Maps old atomic-habits Category values to new Life Area ids.
 */
export const CATEGORY_MIGRATION_MAP: Record<string, LifeAreaId> = {
    General: 'purpose',
    Work: 'career',
    Study: 'growth',
    Health: 'physical-health',
    Creative: 'joy',
}
