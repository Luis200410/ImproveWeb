'use client'
import { createClient } from '@/utils/supabase/client'
import { LIFE_AREA_IDS, CATEGORY_MIGRATION_MAP } from '@/lib/life-areas'

// Always create a fresh client per operation to pick up the current browser session
const getSupabase = () => createClient()

export type ViewType = 'list' | 'calendar' | 'kanban' | 'table' | 'chart' | 'timeline' | 'gallery'

export interface FieldDefinition {
    name: string
    type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'checkbox' | 'url' | 'email' | 'relation' | 'time' | 'json'
    required: boolean
    options?: string[]
    min?: number
    max?: number
    placeholder?: string
    relationMicroappId?: string
    width?: 'full' | '1/2' | '1/3' | '2/3' | '1/4' | '3/4'
    description?: string
}

export interface Microapp {
    id: string
    systemId: string
    name: string
    description: string
    icon: string
    fields: FieldDefinition[]
    availableViews: ViewType[]
    defaultView: ViewType
    customPath?: string // Optional path for dedicated microapp pages
}

export interface System {
    id: string
    name: string
    icon: string
    color: string
    gradient: string
    description: string
    microapps: Microapp[]
}

export interface Entry {
    id: string
    userId: string // each entry belongs to a user
    microappId: string
    data: Record<string, any>
    createdAt: string
    updatedAt: string
    tags?: string[]
}

export interface PomodoroSession {
    id: string
    userId: string
    habitId?: string
    habitName?: string
    workDuration: number // minutes
    breakDuration: number // minutes
    completedAt: string
    wasAutoTriggered: boolean
}

export interface ReviewSession {
    id: string
    userId: string
    reviewType: 'weekly' | 'monthly' | 'yearly'
    periodStart: string
    periodEnd: string
    completedAt: string
    notes?: string
    insightsJson?: any
    actionItems?: string[]
}

export interface HabitStats {
    totalHabits: number
    completedCount: number
    completionRate: number
    bestStreak: number
    currentStreak: number
    habitBreakdown: Array<{
        habitId: string
        habitName: string
        completed: number
        total: number
        rate: number
    }>
}

export interface PomodoroStats {
    totalSessions: number
    totalFocusMinutes: number
    totalBreakMinutes: number
    averageSessionLength: number
    mostProductiveDay: string
    dailyBreakdown: Array<{
        date: string
        sessions: number
        focusMinutes: number
    }>
}

export interface FitnessGoal {
    id: string
    userId: string
    goal: string
    timeframe?: string
    priority?: 'Low' | 'Medium' | 'High'
    createdAt: string
}

export interface Exercise {
    id: string
    name: string
    primaryMuscles: string[]
    secondaryMuscles: string[]
    equipment: string
    pattern?: string
    modality: 'time' | 'reps'
    defaultDurationSec?: number
    defaultReps?: number
    weightRecommendation?: string
    difficulty?: 'easy' | 'medium' | 'hard'
    energyBand?: 'low' | 'medium' | 'high'
    tags?: string[]
    cues?: string
    instructions?: string
    videoUrl?: string
    restDefaultSec?: number
}

export interface FoodItem {
    id: string
    name: string
    defaultServingGrams?: number
    calories?: number
    protein?: number
    carbs?: number
    fats?: number
    micros?: Record<string, any>
    tags?: string[]
    sourceUrl?: string
    brand?: string
}

export interface LiveSession {
    id: string
    userId: string
    routineName?: string
    energyLevel?: 'low' | 'medium' | 'high'
    startedAt: string
    completedAt?: string
}

export interface ExerciseSet {
    id: string
    sessionId: string
    exerciseId: string
    userId: string
    mode: 'time' | 'reps'
    targetTimeSec?: number
    targetReps?: number
    actualTimeSec?: number
    actualReps?: number
    weight?: number
    rpe?: number
    intensity?: 'easy' | 'medium' | 'hard'
    energyAtStart?: 'low' | 'medium' | 'high'
    completedAt: string
}


class DataStore {
    // Helper retained for legacy fallback (not used for entries)
    private getItem<T>(key: string, defaultValue: T): T {
        if (typeof window === 'undefined') return defaultValue
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : defaultValue
    }

    private setItem(key: string, value: any): void {
        if (typeof window === 'undefined') return
        localStorage.setItem(key, JSON.stringify(value))
    }

    // Systems
    getSystems(): System[] {
        const stored = this.getItem<System[]>('systems', [])

        // Bootstrap from scratch only when localStorage is completely empty
        if (stored.length === 0) {
            const defaults = this.getDefaultSystems()
            this.setItem('systems', defaults)
            return defaults
        }

        // ── Surgical patch: only fix what's missing, never reset everything ──
        try {
            let patched = false
            const updated = stored.map(system => {
                // Productivity patches
                if (system.id === 'productivity') {
                    let microapps = [...(system.microapps || [])]

                    // 1. Add 'projection' microapp if missing
                    if (!microapps.some(m => m.id === 'projection')) {
                        microapps.push({
                            id: 'projection',
                            systemId: 'productivity',
                            name: 'Projection & Reflexión',
                            description: 'Annual goals, 4 Bigs, and monthly area reviews',
                            icon: '🗺️',
                            availableViews: ['list'],
                            defaultView: 'list',
                            fields: [],
                            customPath: '/systems/productivity/projection'
                        } as any)
                        patched = true
                    }

                    // 2. Replace 'Category' field with 'Life Area' in atomic-habits
                    microapps = microapps.map(m => {
                        if (m.id !== 'atomic-habits') return m
                        const hasLifeArea = m.fields?.some((f: any) => f.name === 'Life Area')
                        if (hasLifeArea) return m
                        patched = true
                        const fields = (m.fields || [])
                            .filter((f: any) => f.name !== 'Category')
                            .concat([{ name: 'Life Area', type: 'select', options: LIFE_AREA_IDS, required: true, width: 'full' }])
                        return { ...m, fields }
                    })

                    return { ...system, microapps }
                }

                // Relationships patches - add new microapps if missing
                if (system.id === 'relationships') {
                    const currentIds = (system.microapps || []).map((m: any) => m.id)
                    const newMicroapps: any[] = []

                    // Contacts microapp (update fields)
                    if (!currentIds.includes('contacts')) {
                        newMicroapps.push({
                            id: 'contacts',
                            systemId: 'relationships',
                            name: 'Contacts',
                            description: 'Dynamic directory with relationship tiers and context vault',
                            icon: '👥',
                            availableViews: ['list', 'kanban'],
                            defaultView: 'kanban',
                            customPath: '/systems/relationships/contacts',
                            fields: [
                                { name: 'Name', type: 'text', required: true },
                                { name: 'Relationship Tier', type: 'select', options: ['Immediate Family', 'Extended Family', 'Friends', 'Mentors', 'Colleagues', 'Acquaintances'], required: true },
                                { name: 'Connection Cadence', type: 'select', options: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'As Needed'], required: true },
                                { name: 'Last Interaction', type: 'date', required: false },
                                { name: 'Email', type: 'email', required: false },
                                { name: 'Phone', type: 'text', required: false },
                                { name: 'Access Token', type: 'text', required: false },
                                { name: 'How We Met', type: 'textarea', required: false },
                                { name: 'Interests', type: 'textarea', required: false },
                                { name: 'Gift Ideas', type: 'textarea', required: false },
                                { name: 'Life Events', type: 'textarea', required: false },
                                { name: 'Preferences', type: 'textarea', required: false },
                                { name: 'Notes', type: 'textarea', required: false }
                            ]
                        })
                    } else {
                        // Update existing contacts with custom path
                        const updated = (system.microapps || []).map((m: any) => {
                            if (m.id === 'contacts' && !m.customPath) {
                                return { ...m, customPath: '/systems/relationships/contacts' }
                            }
                            if (m.id === 'meetings' && !m.customPath) {
                                return { ...m, customPath: '/systems/relationships/meetings' }
                            }
                            if (m.id === 'interactions' && !m.customPath) {
                                return { ...m, customPath: '/systems/relationships/interactions' }
                            }
                            if (m.id === 'action-items' && !m.customPath) {
                                return { ...m, customPath: '/systems/relationships/action-items' }
                            }
                            if (m.id === 'schedule-requests' && !m.customPath) {
                                return { ...m, customPath: '/systems/relationships/schedule-requests' }
                            }
                            if (m.id === 'shared-spaces' && !m.customPath) {
                                return { ...m, customPath: '/systems/relationships/shared-spaces' }
                            }
                            if (m.id === 'ledger' && !m.customPath) {
                                return { ...m, customPath: '/systems/relationships/ledger' }
                            }
                            return m
                        })
                        return { ...system, microapps: updated }
                    }

                    // Other microapps
                    const microappDefs = [
                        { id: 'interactions', name: 'Interaction Log', icon: '💬', desc: 'Quick-entry system to log connections', customPath: '/systems/relationships/interactions', fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Contact', type: 'text', required: true },
                            { name: 'Type', type: 'select', options: ['Call', 'Video', 'Text', 'In-Person', 'Email', 'Event'], required: true },
                            { name: 'Summary', type: 'textarea', required: true },
                            { name: 'Key Topics', type: 'textarea', required: false },
                            { name: 'Follow Up Needed', type: 'select', options: ['Yes', 'No'], required: false }
                        ]},
                        { id: 'action-items', name: 'Action Items', icon: '✅', desc: 'Follow-up tasks and automated nudges', customPath: '/systems/relationships/action-items', fields: [
                            { name: 'Task', type: 'text', required: true },
                            { name: 'Contact', type: 'text', required: true },
                            { name: 'Due Date', type: 'date', required: true },
                            { name: 'Type', type: 'select', options: ['Follow Up', 'Send Message', 'Schedule Meet', 'Send Article', 'Wish Birthday', 'Send Gift', 'Other'], required: true },
                            { name: 'Notes', type: 'textarea', required: false },
                            { name: 'Status', type: 'select', options: ['Pending', 'Done'], required: true },
                            { name: 'Automated', type: 'select', options: ['Yes', 'No'], required: false }
                        ]},
                        { id: 'meetings', name: 'Meetings', icon: '📅', desc: 'Schedule and track your 1:1s and networking events', customPath: '/systems/relationships/meetings', fields: [
                            { name: 'Title', type: 'text', required: true },
                            { name: 'Contact', type: 'text', required: false },
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Time', type: 'text', required: false },
                            { name: 'Duration', type: 'select', options: ['15 min', '30 min', '45 min', '1 hour', '2 hours'], required: false },
                            { name: 'Type', type: 'select', options: ['Coffee', 'Meal', 'Call', 'Video', 'Networking Event', 'Date', 'Other'], required: true },
                            { name: 'Location', type: 'text', required: false },
                            { name: 'Notes', type: 'textarea', required: false },
                            { name: 'Status', type: 'select', options: ['Scheduled', 'Completed', 'Cancelled'], required: true }
                        ]},
                        { id: 'schedule-requests', name: 'Schedule Requests', icon: '📬', desc: 'External intake form and internal triage dashboard', customPath: '/systems/relationships/schedule-requests', fields: [
                            { name: 'Requester Name', type: 'text', required: true },
                            { name: 'Requester Email', type: 'email', required: true },
                            { name: 'Relationship Tier', type: 'text', required: false },
                            { name: 'Access Token', type: 'text', required: false },
                            { name: 'Request Type', type: 'select', options: ['Code Review', 'Advice', 'Meeting', 'Borrow Item', 'Collaboration', 'Other'], required: true },
                            { name: 'Description', type: 'textarea', required: true },
                            { name: 'Preferred Times', type: 'textarea', required: false },
                            { name: 'Status', type: 'select', options: ['New', 'Accepted', 'Proposed New Time', 'Declined', 'Completed'], required: true },
                            { name: 'Internal Notes', type: 'textarea', required: false },
                            { name: 'Scheduled Meeting', type: 'text', required: false }
                        ]},
                        { id: 'shared-spaces', name: 'Shared Spaces', icon: '🤝', desc: 'Bilateral upload space for links, photos, and notes', fields: [
                            { name: 'Space Name', type: 'text', required: true },
                            { name: 'Contact', type: 'text', required: true },
                            { name: 'Type', type: 'select', options: ['Memory Drop', 'Link', 'Photo', 'Note', 'Recommendation'], required: true },
                            { name: 'Content', type: 'textarea', required: true },
                            { name: 'Shared By', type: 'select', options: ['Me', 'Contact'], required: true },
                            { name: 'Date', type: 'date', required: true }
                        ]},
                        { id: 'ledger', name: 'Ledger', icon: '📒', desc: 'Track shared recommendations, borrowed items, and IOUs', fields: [
                            { name: 'Contact', type: 'text', required: true },
                            { name: 'Type', type: 'select', options: ['Borrowed Item', 'Shared Recommendation', 'IOU', 'Shared Expense', 'Other'], required: true },
                            { name: 'Description', type: 'textarea', required: true },
                            { name: 'Status', type: 'select', options: ['Outstanding', 'Returned', 'Settled'], required: true },
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Resolved Date', type: 'date', required: false }
                        ]},
                        { id: 'availability', name: 'Availability', icon: '🗓️', desc: 'Dynamic availability settings per relationship tier', fields: [
                            { name: 'Relationship Tier', type: 'select', options: ['Immediate Family', 'Extended Family', 'Friends', 'Mentors', 'Colleagues', 'Acquaintances'], required: true },
                            { name: 'Available Days', type: 'text', required: false },
                            { name: 'Time Window Start', type: 'text', required: false },
                            { name: 'Time Window End', type: 'text', required: false },
                            { name: 'Max Duration', type: 'select', options: ['15 min', '30 min', '45 min', '1 hour', '2 hours'], required: false },
                            { name: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true }
                        ]},
                        { id: 'status', name: 'Live Status', icon: '🔴', desc: 'Current capacity and availability status', fields: [
                            { name: 'Status', type: 'select', options: ['Available', 'In Deep Work', 'In Meeting', 'Do Not Disturb', 'Away'], required: true },
                            { name: 'Message', type: 'text', required: false },
                            { name: 'Until', type: 'text', required: false },
                            { name: 'Updated At', type: 'date', required: false }
                        ]}
                    ]

                    for (const def of microappDefs) {
                        if (!currentIds.includes(def.id)) {
                            newMicroapps.push({
                                id: def.id,
                                systemId: 'relationships',
                                name: def.name,
                                description: def.desc,
                                icon: def.icon,
                                availableViews: ['list'],
                                defaultView: 'list',
                                customPath: def.customPath,
                                fields: def.fields
                            })
                        }
                    }

                    if (newMicroapps.length > 0) {
                        patched = true
                        return {
                            ...system,
                            microapps: [...(system.microapps || []), ...newMicroapps]
                        }
                    }
                }

                // Money system patch
                if (system.id === 'money') {
                    const allDefaults = this.getDefaultSystems();
                    const moneyDefaults = allDefaults.find(d => d.id === 'money');
                    // Always ensure money system has the latest hardcoded microapps (plaid refurbishment)
                    if (moneyDefaults && system.microapps?.length !== moneyDefaults.microapps.length) {
                        patched = true;
                        return { ...system, microapps: moneyDefaults.microapps };
                    } else if (moneyDefaults && system.microapps?.[0]?.id !== moneyDefaults.microapps[0].id) {
                        patched = true;
                        return { ...system, microapps: moneyDefaults.microapps };
                    }
                }

                return system
            })

            if (patched) {
                this.setItem('systems', updated)
            }
            return updated
        } catch (e) {
            console.warn('[DataStore] getSystems patch failed, returning stored as-is:', e)
            return stored
        }
    }



    resetSystems(): void {
        const defaults = this.getDefaultSystems()
        this.setItem('systems', defaults)
    }

    getSystem(id: string): System | undefined {
        return this.getSystems().find(s => s.id === id)
    }

    // Microapps
    getAllMicroapps(): Microapp[] {
        return this.getSystems().flatMap(s => s.microapps)
    }

    getMicroapp(systemId: string, microappId: string): Microapp | undefined {
        const system = this.getSystem(systemId)
        return system?.microapps.find(m => m.id === microappId)
    }

    getMicroappById(microappId: string): Microapp | undefined {
        return this.getAllMicroapps().find(m => m.id === microappId)
    }

    // Entries - now persisted with Prisma (PostgreSQL)
    // Entries - now persisted with Supabase
    async getEntries(microappId?: string, userId?: string): Promise<Entry[]> {
        const supabase = getSupabase()
        let query = supabase.from('entries').select('*')

        if (microappId) {
            query = query.eq('microapp_id', microappId)
        }

        // Explicitly filter by user_id for correctness (RLS also enforces this)
        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching entries [DATA-STORE]:', error, 'microappId:', microappId, 'userId:', userId)
            return []
        }

        if (!data || data.length === 0) {
            console.warn('Zero entries returned [DATA-STORE] for microappId:', microappId, 'userId:', userId)
            return []
        }

        return data.map((item: any) => ({
            id: item.id,
            userId: item.user_id,
            microappId: item.microapp_id,
            data: item.data,
            createdAt: item.created_at,
            updatedAt: item.updated_at
        }))
    }

    async getEntry(id: string): Promise<Entry | undefined> {
        const supabase = getSupabase()
        const { data, error } = await supabase
            .from('entries')
            .select('*')
            .eq('id', id)
            .single()

        if (error || !data) return undefined

        return {
            id: data.id,
            userId: data.user_id,
            microappId: data.microapp_id,
            data: data.data,
            createdAt: data.created_at,
            updatedAt: data.updated_at
        }
    }

    async updateEntry(id: string, data: Record<string, any>): Promise<void> {
        const entry = await this.getEntry(id)
        if (!entry) throw new Error('Entry not found')

        const updatedEntry = {
            ...entry,
            data: { ...entry.data, ...data }, // Merge data
            updatedAt: new Date().toISOString()
        }
        await this.saveEntry(updatedEntry)
    }

    async addEntry(userId: string, microappId: string, data: Record<string, any>): Promise<Entry> {
        // Generate robust ID
        const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36);
        const now = new Date().toISOString()
        const entry: Entry = {
            id,
            userId,
            microappId,
            data,
            createdAt: now,
            updatedAt: now
        }
        await this.saveEntry(entry)
        return entry
    }

    async saveEntry(entry: Entry): Promise<void> {
        const supabase = getSupabase()
        // Map Entry to Supabase table structure
        const payload = {
            id: entry.id,
            user_id: entry.userId,
            microapp_id: entry.microappId,
            data: entry.data,
            updated_at: new Date().toISOString()
        }

        const { error } = await supabase
            .from('entries')
            .upsert(payload)

        if (error) {
            console.error('Error saving entry:', error)
            throw error;
        }
    }

    async deleteEntry(id: string): Promise<void> {
        const supabase = getSupabase()
        const { error } = await supabase
            .from('entries')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting entry:', error)
        }
    }

    // Money System Decisions Storage
    async saveMoneyDecision(userId: string, decision: any): Promise<void> {
        // We persist decisions in the 'entries' table, utilizing its generic JSON state capabilities.
        await this.addEntry(userId, 'money-decisions', {
            ...decision,
            timestamp: new Date().toISOString()
        });
    }

    async getMoneyDecisions(userId: string, filterDateStr?: string): Promise<any[]> {
        const rawEntries = await this.getEntries('money-decisions', userId);
        
        // Return structured data, optionally filtering by date (e.g. "2024-03-15")
        return rawEntries
            .filter(e => filterDateStr ? e.createdAt.startsWith(filterDateStr) : true)
            .map(e => ({
                entryId: e.id,
                ...e.data,
                createdAt: e.createdAt
            }));
    }

    // Rate Limit / Plaid API Caching
    async getPlaidCache(userId: string, endpointKey: string, maxAgeMinutes = 15): Promise<any | null> {
        const rawEntries = await this.getEntries(`plaid-cache-${endpointKey}`, userId);
        if (rawEntries.length === 0) return null;
        
        const sorted = rawEntries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const latest = sorted[0];
        
        const now = new Date();
        const cacheTime = new Date(latest.createdAt);
        const ageMinutes = (now.getTime() - cacheTime.getTime()) / (1000 * 60);
        
        if (ageMinutes <= maxAgeMinutes) {
            return latest.data;
        }
        return null;
    }

    async setPlaidCache(userId: string, endpointKey: string, data: any): Promise<void> {
        const entries = await this.getEntries(`plaid-cache-${endpointKey}`, userId);
        for(const entry of entries) {
            await this.deleteEntry(entry.id);
        }
        await this.addEntry(userId, `plaid-cache-${endpointKey}`, data);
    }

    // Money Daily Decisions Action Queue API
    async queueMoneyAction(userId: string, item: any): Promise<void> {
        const existing = await this.getEntries('money-queue', userId);
        if (!existing.some(e => e.data.id === item.id)) {
            await this.addEntry(userId, 'money-queue', item);
        }
    }

    async getMoneyQueue(userId: string): Promise<any[]> {
        const entries = await this.getEntries('money-queue', userId);
        return entries.map(e => ({ entryId: e.id, ...e.data }));
    }

    async removeMoneyQueueItem(userId: string, decisionId: string): Promise<void> {
        const entries = await this.getEntries('money-queue', userId);
        const target = entries.find(e => e.data.id === decisionId);
        if (target) {
            await this.deleteEntry(target.id);
        }
    }


    // Pomodoro Sessions
    async savePomodoroSession(session: Omit<PomodoroSession, 'id' | 'completedAt'>): Promise<void> {
        try {
            const supabase = getSupabase()
            const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2) + Date.now().toString(36)
            const completedAt = new Date().toISOString()

            const payload = {
                id,
                user_id: session.userId,
                habit_id: session.habitId || null,
                habit_name: session.habitName || null,
                work_duration: session.workDuration,
                break_duration: session.breakDuration,
                completed_at: completedAt,
                was_auto_triggered: session.wasAutoTriggered,
            }

            const { error } = await supabase
                .from('pomodoro_sessions')
                .insert(payload)

            if (error) {
                console.warn('Pomodoro sessions table not set up yet. Run the SQL schema to enable session tracking.')
            }
        } catch (e) {
            console.warn('Unable to save pomodoro session. Database table may not exist yet.')
        }
    }

    async getPomodoroSessions(userId: string, limit = 100): Promise<PomodoroSession[]> {
        try {
            const supabase = getSupabase()
            const { data, error } = await supabase
                .from('pomodoro_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })
                .limit(limit)

            if (error) {
                return []
            }

            return data.map((item: any) => ({
                id: item.id,
                userId: item.user_id,
                habitId: item.habit_id,
                habitName: item.habit_name,
                workDuration: item.work_duration,
                breakDuration: item.break_duration,
                completedAt: item.completed_at,
                wasAutoTriggered: item.was_auto_triggered,
            }))
        } catch (e) {
            return []
        }
    }

    async getTodayPomodoroCount(userId: string): Promise<number> {
        try {
            const supabase = getSupabase()
            const today = new Date().toISOString().split('T')[0]

            const { data, error } = await supabase
                .from('pomodoro_sessions')
                .select('id')
                .eq('user_id', userId)
                .gte('completed_at', `${today}T00:00:00`)
                .lte('completed_at', `${today}T23:59:59`)

            if (error) {
                return 0
            }

            return data.length
        } catch (e) {
            return 0
        }
    }

    // Get all entries for today across all systems
    // Get all entries for today across all systems
    async getTodayEntries(userId?: string): Promise<Entry[]> {
        const today = new Date().toISOString().split('T')[0]
        const entries = await this.getEntries(undefined, userId);
        return entries.filter(e => e.createdAt.startsWith(today));
    }

    // Default Systems Configuration
    private getDefaultSystems(): System[] {
        return [
            {
                id: 'body',
                name: 'Body',
                icon: '💪',
                color: 'from-red-500 to-orange-500',
                gradient: 'bg-gradient-to-br from-red-500 to-orange-500',
                description: 'Physical health, fitness, nutrition, and rest',
                microapps: [
                    {
                        id: 'routine-builder',
                        systemId: 'body',
                        name: 'Routine Builder',
                        description: 'Design weekly training blocks with minimal typing',
                        icon: '📐',
                        availableViews: ['list', 'calendar', 'table'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Program Name', type: 'text', required: true, width: 'full' },
                            { name: 'Goal', type: 'select', options: ['Strength', 'Hypertrophy', 'Endurance', 'Fat Loss', 'Athleticism', 'Mobility'], required: true, width: '1/2' },
                            { name: 'Split', type: 'select', options: ['Full Body', 'Upper / Lower', 'Push / Pull / Legs', 'Hybrid', 'Custom'], required: true, width: '1/2' },
                            { name: 'Sessions / Week', type: 'number', required: true, min: 1, max: 14, width: '1/3' },
                            { name: 'Session Length (min)', type: 'number', required: false, min: 20, max: 180, width: '1/3' },
                            { name: 'Next Session', type: 'date', required: false, width: '1/3' },
                            { name: 'Equipment Tier', type: 'select', options: ['Minimal', 'Gym', 'Home Gym', 'Outdoor'], required: false, width: '1/2' },
                            { name: 'Blocks', type: 'json', required: false, width: '1/2', placeholder: '[{\"block\":\"Warm-up\",\"minutes\":8},{\"block\":\"Strength\",\"sets\":4}]' },
                            { name: 'Notes', type: 'textarea', required: false, width: 'full' }
                        ]
                    },
                    {
                        id: 'recovery',
                        systemId: 'body',
                        name: 'Recovery',
                        description: 'Regulate readiness with smart resets',
                        icon: '🧘',
                        availableViews: ['list', 'calendar', 'chart'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true, width: '1/3' },
                            { name: 'Modality', type: 'select', options: ['Mobility', 'Breathwork', 'Soft Tissue', 'Cold / Heat', 'Walk', 'Contrast', 'Nap'], required: true, width: '1/3' },
                            { name: 'Focus Area', type: 'select', options: ['Neck / Shoulders', 'T-Spine', 'Hips', 'Knees / Ankles', 'Full Body', 'Mind'], required: false, width: '1/3' },
                            { name: 'Duration (min)', type: 'number', required: true, min: 5, max: 120, width: '1/4' },
                            { name: 'Readiness (1-10)', type: 'number', required: false, min: 1, max: 10, width: '1/4' },
                            { name: 'Intensity', type: 'select', options: ['Low', 'Medium', 'High'], required: false, width: '1/4' },
                            { name: 'Sleep Hours', type: 'number', required: false, min: 0, max: 14, width: '1/4' },
                            { name: 'Notes', type: 'textarea', required: false, width: 'full' }
                        ]
                    },
                    {
                        id: 'diet',
                        systemId: 'body',
                        name: 'Diet',
                        description: 'Fast logging for fueling and hydration',
                        icon: '🥗',
                        availableViews: ['list', 'table', 'chart'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true, width: '1/3' },
                            { name: 'Meal', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Shake'], required: true, width: '1/3' },
                            { name: 'Plate Build', type: 'select', options: ['Low-carb plate', 'Balanced plate', 'High-carb training', 'Protein-only snack', 'Plant-forward'], required: false, width: '1/3' },
                            { name: 'Calories', type: 'number', required: false, min: 0, width: '1/4' },
                            { name: 'Protein (g)', type: 'number', required: false, min: 0, width: '1/4' },
                            { name: 'Carbs (g)', type: 'number', required: false, min: 0, width: '1/4' },
                            { name: 'Fats (g)', type: 'number', required: false, min: 0, width: '1/4' },
                            { name: 'Prep Time (min)', type: 'number', required: false, min: 0, width: '1/4' },
                            { name: 'Mood After', type: 'select', options: ['Light & ready', 'Balanced', 'Sleepy', 'Bloated', 'Still hungry'], required: false, width: '1/3' },
                            { name: 'Hydration (glasses)', type: 'number', required: false, min: 0, max: 20, width: '1/3' },
                            { name: 'Notes', type: 'textarea', required: false, width: 'full' }
                        ]
                    }
                ]
            },
            {
                id: 'money',
                name: 'Money',
                icon: '💰',
                color: 'from-green-500 to-emerald-500',
                gradient: 'bg-gradient-to-br from-green-500 to-emerald-500',
                description: 'Financial management and wealth building',
                microapps: [
                    {
                        id: 'today',
                        systemId: 'money',
                        name: 'Today (Queue)',
                        description: 'Decision queue',
                        icon: '⚡',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/money/today'
                    },
                    {
                        id: 'cash-flow',
                        systemId: 'money',
                        name: 'Cash Flow',
                        description: 'Horizon line chart',
                        icon: '📈',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/money/cash-flow'
                    },
                    {
                        id: 'envelopes',
                        systemId: 'money',
                        name: 'Envelopes',
                        description: 'Behavioral spending zones',
                        icon: '🗂️',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/money/envelopes'
                    },
                    {
                        id: 'income',
                        systemId: 'money',
                        name: 'Income',
                        description: 'Irregular income classification',
                        icon: '💵',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/money/income'
                    },
                    {
                        id: 'subscriptions',
                        systemId: 'money',
                        name: 'Subscriptions',
                        description: 'Total structural outflow',
                        icon: '🔁',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/money/subscriptions'
                    },
                    {
                        id: 'simulator',
                        systemId: 'money',
                        name: 'Target Simulator',
                        description: 'Trade-off analysis',
                        icon: '🎯',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/money/simulator'
                    }
                ]
            },
            {
                id: 'work',
                name: 'Work',
                icon: '💼',
                color: 'from-blue-500 to-indigo-500',
                gradient: 'bg-gradient-to-br from-blue-500 to-indigo-500',
                description: 'Career development and professional growth',
                microapps: [
                    {
                        id: 'projects',
                        systemId: 'work',
                        name: 'Projects',
                        description: 'Active initiatives with deadlines',
                        icon: '🎯',
                        availableViews: ['list', 'kanban', 'timeline'],
                        defaultView: 'kanban',
                        fields: [
                            { name: 'Project Name', type: 'text', required: true },
                            { name: 'Status', type: 'select', options: ['Backlog', 'In Progress', 'In Review', 'Done'], required: true },
                            { name: 'Area', type: 'relation', relationMicroappId: 'areas-sb', required: false, width: '1/2' },
                            { name: 'Deadline', type: 'date', required: false, width: '1/2' },
                            { name: 'Description', type: 'textarea', required: false, width: 'full' }
                        ]
                    },
                    {
                        id: 'notebooks-sb',
                        systemId: 'second-brain',
                        name: 'Notebooks',
                        description: 'Collections of notes and tasks',
                        icon: '📓',
                        availableViews: ['list', 'gallery'],
                        defaultView: 'gallery',
                        fields: [
                            { name: 'Title', type: 'text', required: true, width: 'full' },
                            { name: 'Description', type: 'textarea', required: false, width: 'full' },
                            { name: 'Cover Image', type: 'url', required: false, width: 'full' },
                            { name: 'Area', type: 'relation', relationMicroappId: 'areas-sb', required: false, width: '1/2' }
                        ]
                    },
                    {
                        id: 'areas-sb',
                        systemId: 'second-brain',
                        name: 'Areas',
                        description: 'Long-term responsibilities',
                        icon: 'mnt',
                        availableViews: ['list', 'gallery'],
                        defaultView: 'gallery',
                        fields: [
                            { name: 'Area Name', type: 'text', required: true },
                            { name: 'Description', type: 'textarea', required: false }
                        ]
                    },
                    {
                        id: 'time-tracking',
                        systemId: 'work',
                        name: 'Time Tracker',
                        description: 'Track time spent on tasks',
                        icon: '⏱️',
                        availableViews: ['list', 'table', 'chart'],
                        defaultView: 'table',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Task', type: 'text', required: true },
                            { name: 'Duration (hours)', type: 'number', required: true, min: 0 },
                            { name: 'Category', type: 'select', options: ['Development', 'Meetings', 'Planning', 'Admin', 'Other'], required: true },
                            { name: 'Notes', type: 'textarea', required: false }
                        ]
                    }
                ]
            },
            {
                id: 'productivity',
                name: 'Productivity',
                icon: '⚡',
                color: 'from-yellow-500 to-amber-500',
                gradient: 'bg-gradient-to-br from-yellow-500 to-amber-500',
                description: 'Personal productivity and habit building',
                microapps: [
                    {
                        id: 'atomic-habits',
                        systemId: 'productivity',
                        name: 'Atomic Habits',
                        description: 'Track habits using the 4 Laws',
                        icon: '⚡',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Habit Name', type: 'text', required: true, width: 'full' },
                            { name: 'Time', type: 'time', required: true, width: '1/4' },
                            { name: 'Status', type: 'checkbox', required: false, width: '1/4' },
                            { name: 'Streak', type: 'number', required: false, width: '1/4', min: 0 },
                            { name: 'completedDates', type: 'json', required: false, width: 'full' },
                            { name: 'Cue', type: 'text', required: false, width: 'full' },
                            { name: 'Craving', type: 'text', required: false, width: 'full' },
                            { name: 'Response', type: 'text', required: false, width: 'full' },
                            { name: 'Reward', type: 'text', required: false, width: 'full' },
                            { name: 'frequency', type: 'select', options: ['daily', 'specific_days'], required: true, width: 'full' },
                            { name: 'repeatDays', type: 'json', required: false, width: 'full' },
                            { name: 'schedule', type: 'json', required: false, width: 'full', placeholder: '{"Mon": "09:00", "Tue": "10:00"}' },
                            { name: 'duration', type: 'number', required: true, width: '1/4', min: 1, placeholder: 'Minutes' },
                            { name: 'Life Area', type: 'select', options: LIFE_AREA_IDS, required: true, width: 'full' }
                        ]
                    },
                    {
                        id: 'projection',
                        systemId: 'productivity',
                        name: 'Projection & Reflexión',
                        description: 'Annual goals, 4 Bigs, and monthly area reviews',
                        icon: '🗺️',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/productivity/projection'
                    },
                    {
                        id: 'pomodoro',
                        systemId: 'productivity',
                        name: 'Pomodoro Time',
                        description: 'Focus sessions with visual rewards',
                        icon: '⏱️',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/productivity/pomodoro'
                    },
                    {
                        id: 'review',
                        systemId: 'productivity',
                        name: 'REVIEW',
                        description: 'Weekly, monthly & yearly GTD reviews',
                        icon: '📊',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [],
                        customPath: '/systems/productivity/review'
                    }
                ]
            },
            {
                id: 'relationships',
                name: 'Relationships',
                icon: '❤️',
                color: 'from-pink-500 to-rose-500',
                gradient: 'bg-gradient-to-br from-pink-500 to-rose-500',
                description: 'Nurture personal and professional connections',
                microapps: [
                    {
                        id: 'contacts',
                        systemId: 'relationships',
                        name: 'Contacts',
                        description: 'Dynamic directory with relationship tiers and context vault',
                        icon: '👥',
                        availableViews: ['list', 'kanban'],
                        defaultView: 'kanban',
                        fields: [
                            { name: 'Name', type: 'text', required: true },
                            { name: 'Relationship Tier', type: 'select', options: ['Immediate Family', 'Extended Family', 'Friends', 'Mentors', 'Colleagues', 'Acquaintances'], required: true },
                            { name: 'Connection Cadence', type: 'select', options: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'As Needed'], required: true },
                            { name: 'Last Interaction', type: 'date', required: false },
                            { name: 'Email', type: 'email', required: false },
                            { name: 'Phone', type: 'text', required: false },
                            { name: 'Access Token', type: 'text', required: false },
                            { name: 'How We Met', type: 'textarea', required: false },
                            { name: 'Interests', type: 'textarea', required: false },
                            { name: 'Gift Ideas', type: 'textarea', required: false },
                            { name: 'Life Events', type: 'textarea', required: false },
                            { name: 'Preferences', type: 'textarea', required: false },
                            { name: 'Notes', type: 'textarea', required: false }
                        ]
                    },
                    {
                        id: 'interactions',
                        systemId: 'relationships',
                        name: 'Interaction Log',
                        description: 'Quick-entry system to log connections',
                        icon: '💬',
                        availableViews: ['list', 'timeline'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Contact', type: 'text', required: true },
                            { name: 'Type', type: 'select', options: ['Call', 'Video', 'Text', 'In-Person', 'Email', 'Event'], required: true },
                            { name: 'Summary', type: 'textarea', required: true },
                            { name: 'Key Topics', type: 'textarea', required: false },
                            { name: 'Follow Up Needed', type: 'select', options: ['Yes', 'No'], required: false }
                        ]
                    },
                    {
                        id: 'action-items',
                        systemId: 'relationships',
                        name: 'Action Items',
                        description: 'Follow-up tasks and automated nudges',
                        icon: '✅',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Task', type: 'text', required: true },
                            { name: 'Contact', type: 'text', required: true },
                            { name: 'Due Date', type: 'date', required: true },
                            { name: 'Type', type: 'select', options: ['Follow Up', 'Send Message', 'Schedule Meet', 'Send Article', 'Wish Birthday', 'Send Gift', 'Other'], required: true },
                            { name: 'Notes', type: 'textarea', required: false },
                            { name: 'Status', type: 'select', options: ['Pending', 'Done'], required: true },
                            { name: 'Automated', type: 'select', options: ['Yes', 'No'], required: false }
                        ]
                    },
                    {
                        id: 'meetings',
                        systemId: 'relationships',
                        name: 'Meetings',
                        description: 'Schedule and track your 1:1s and networking events',
                        icon: '📅',
                        availableViews: ['list', 'calendar'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Title', type: 'text', required: true },
                            { name: 'Contact', type: 'text', required: false },
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Time', type: 'text', required: false },
                            { name: 'Duration', type: 'select', options: ['15 min', '30 min', '45 min', '1 hour', '2 hours'], required: false },
                            { name: 'Type', type: 'select', options: ['Coffee', 'Meal', 'Call', 'Video', 'Networking Event', 'Date', 'Other'], required: true },
                            { name: 'Location', type: 'text', required: false },
                            { name: 'Notes', type: 'textarea', required: false },
                            { name: 'Status', type: 'select', options: ['Scheduled', 'Completed', 'Cancelled'], required: true }
                        ]
                    },
                    {
                        id: 'schedule-requests',
                        systemId: 'relationships',
                        name: 'Schedule Requests',
                        description: 'External intake form and internal triage dashboard',
                        icon: '📬',
                        availableViews: ['list', 'kanban'],
                        defaultView: 'kanban',
                        fields: [
                            { name: 'Requester Name', type: 'text', required: true },
                            { name: 'Requester Email', type: 'email', required: true },
                            { name: 'Relationship Tier', type: 'text', required: false },
                            { name: 'Access Token', type: 'text', required: false },
                            { name: 'Request Type', type: 'select', options: ['Code Review', 'Advice', 'Meeting', 'Borrow Item', 'Collaboration', 'Other'], required: true },
                            { name: 'Description', type: 'textarea', required: true },
                            { name: 'Preferred Times', type: 'textarea', required: false },
                            { name: 'Status', type: 'select', options: ['New', 'Accepted', 'Proposed New Time', 'Declined', 'Completed'], required: true },
                            { name: 'Internal Notes', type: 'textarea', required: false },
                            { name: 'Scheduled Meeting', type: 'text', required: false }
                        ]
                    },
                    {
                        id: 'shared-spaces',
                        systemId: 'relationships',
                        name: 'Shared Spaces',
                        description: 'Bilateral upload space for links, photos, and notes',
                        icon: '🤝',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Space Name', type: 'text', required: true },
                            { name: 'Contact', type: 'text', required: true },
                            { name: 'Type', type: 'select', options: ['Memory Drop', 'Link', 'Photo', 'Note', 'Recommendation'], required: true },
                            { name: 'Content', type: 'textarea', required: true },
                            { name: 'Shared By', type: 'select', options: ['Me', 'Contact'], required: true },
                            { name: 'Date', type: 'date', required: true }
                        ]
                    },
                    {
                        id: 'ledger',
                        systemId: 'relationships',
                        name: 'Ledger',
                        description: 'Track shared recommendations, borrowed items, and IOUs',
                        icon: '📒',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Contact', type: 'text', required: true },
                            { name: 'Type', type: 'select', options: ['Borrowed Item', 'Shared Recommendation', 'IOU', 'Shared Expense', 'Other'], required: true },
                            { name: 'Description', type: 'textarea', required: true },
                            { name: 'Status', type: 'select', options: ['Outstanding', 'Returned', 'Settled'], required: true },
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Resolved Date', type: 'date', required: false }
                        ]
                    },
                    {
                        id: 'availability',
                        systemId: 'relationships',
                        name: 'Availability',
                        description: 'Dynamic availability settings per relationship tier',
                        icon: '🗓️',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Relationship Tier', type: 'select', options: ['Immediate Family', 'Extended Family', 'Friends', 'Mentors', 'Colleagues', 'Acquaintances'], required: true },
                            { name: 'Available Days', type: 'text', required: false },
                            { name: 'Time Window Start', type: 'text', required: false },
                            { name: 'Time Window End', type: 'text', required: false },
                            { name: 'Max Duration', type: 'select', options: ['15 min', '30 min', '45 min', '1 hour', '2 hours'], required: false },
                            { name: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true }
                        ]
                    },
                    {
                        id: 'status',
                        systemId: 'relationships',
                        name: 'Live Status',
                        description: 'Current capacity and availability status',
                        icon: '🔴',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Status', type: 'select', options: ['Available', 'In Deep Work', 'In Meeting', 'Do Not Disturb', 'Away'], required: true },
                            { name: 'Message', type: 'text', required: false },
                            { name: 'Until', type: 'text', required: false },
                            { name: 'Updated At', type: 'date', required: false }
                        ]
                    }
                ]
            },
            {
                id: 'mind-emotions',
                name: 'Mind & Emotions',
                icon: '🧠',
                color: 'from-purple-500 to-violet-500',
                gradient: 'bg-gradient-to-br from-purple-500 to-violet-500',
                description: 'Mental health and emotional well-being',
                microapps: [
                    {
                        id: 'journal',
                        systemId: 'mind-emotions',
                        name: 'Daily Journal',
                        description: 'Daily reflections and thoughts',
                        icon: '📔',
                        availableViews: ['list', 'calendar'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Entry', type: 'textarea', required: true },
                            { name: 'Mood', type: 'select', options: ['Great', 'Good', 'Okay', 'Bad', 'Terrible'], required: false }
                        ]
                    },
                    {
                        id: 'gratitude',
                        systemId: 'mind-emotions',
                        name: 'Gratitude Log',
                        description: 'Practice daily gratitude',
                        icon: '🙏',
                        availableViews: ['list', 'calendar'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Grateful For', type: 'textarea', required: true }
                        ]
                    },
                    {
                        id: 'mood',
                        systemId: 'mind-emotions',
                        name: 'Mood Tracker',
                        description: 'Track emotional patterns',
                        icon: '😊',
                        availableViews: ['list', 'calendar', 'chart'],
                        defaultView: 'chart',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Mood', type: 'select', options: ['Excellent', 'Good', 'Neutral', 'Low', 'Very Low'], required: true },
                            { name: 'Energy Level', type: 'number', required: false, min: 1, max: 10 },
                            { name: 'Notes', type: 'textarea', required: false }
                        ]
                    }
                ]
            },
            {
                id: 'legacy-fun',
                name: 'Legacy & Fun',
                icon: '🎨',
                color: 'from-cyan-500 to-teal-500',
                gradient: 'bg-gradient-to-br from-cyan-500 to-teal-500',
                description: 'Life experiences and creative pursuits',
                microapps: [
                    {
                        id: 'bucket-list',
                        systemId: 'legacy-fun',
                        name: 'Bucket List',
                        description: 'Life goals and dreams',
                        icon: '🪣',
                        availableViews: ['list', 'kanban'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Goal', type: 'text', required: true },
                            { name: 'Status', type: 'select', options: ['Dreaming', 'Planning', 'In Progress', 'Completed'], required: true },
                            { name: 'Category', type: 'select', options: ['Travel', 'Learning', 'Adventure', 'Creative', 'Other'], required: true },
                            { name: 'Notes', type: 'textarea', required: false }
                        ]
                    },
                    {
                        id: 'travel',
                        systemId: 'legacy-fun',
                        name: 'Travel Planner',
                        description: 'Plan and remember trips',
                        icon: '✈️',
                        availableViews: ['list', 'timeline', 'gallery'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Destination', type: 'text', required: true },
                            { name: 'Date', type: 'date', required: false },
                            { name: 'Status', type: 'select', options: ['Wishlist', 'Planning', 'Booked', 'Completed'], required: true },
                            { name: 'Notes', type: 'textarea', required: false }
                        ]
                    }
                ]
            },
            {
                id: 'second-brain',
                name: 'Second Brain',
                icon: '🗂️',
                color: 'from-slate-500 to-gray-500',
                gradient: 'bg-gradient-to-br from-slate-500 to-gray-500',
                description: 'PARA method knowledge management',
                microapps: [
                    {
                        id: 'projects-sb',
                        systemId: 'second-brain',
                        name: 'Projects',
                        description: 'Active initiatives with deadlines',
                        icon: '🎯',
                        availableViews: ['list', 'kanban'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Project Name', type: 'text', required: true, width: 'full' },
                            { name: 'Status', type: 'select', options: ['Active', 'On Hold', 'Completed'], required: true, width: '1/3' },
                            { name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'], required: true, width: '1/3' },
                            { name: 'Due Date', type: 'date', required: false, width: '1/3' },
                            { name: 'Area', type: 'relation', required: true, relationMicroappId: 'areas-sb', width: 'full' },
                            { name: 'Cover Image', type: 'url', required: false, width: 'full' },
                            { name: 'Description', type: 'textarea', required: false, width: 'full', placeholder: 'Scope, objectives, success criteria...' }
                        ]
                    },
                    {
                        id: 'tasks-sb',
                        systemId: 'second-brain',
                        name: 'Tasks',
                        description: 'Actionable items',
                        icon: '✅',
                        availableViews: ['list', 'kanban'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Task', type: 'text', required: true, width: 'full' },
                            { name: 'Status', type: 'select', options: ['Pending', 'Due', 'Working on', 'Done'], required: true, width: '1/4' },
                            { name: 'Start Date', type: 'date', required: true, width: '1/4' },
                            { name: 'End Date', type: 'date', required: false, width: '1/4' },
                            { name: 'Completion Date', type: 'date', required: false, width: '1/4' },
                            { name: 'Project', type: 'relation', required: false, relationMicroappId: 'projects-sb', width: '1/2' },
                            { name: 'Notes', type: 'relation', required: false, relationMicroappId: 'notes-sb', width: '1/2' },
                            { name: 'Resources', type: 'relation', required: false, relationMicroappId: 'resources-sb', width: 'full' },
                            { name: 'Assignee', type: 'text', required: false, width: 'full' }
                        ]
                    },
                    {
                        id: 'notes-sb',
                        systemId: 'second-brain',
                        name: 'Notes',
                        description: 'Ideas and insights',
                        icon: '📝',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Title', type: 'text', required: true, width: 'full' },
                            { name: 'Date', type: 'date', required: true, width: '1/3' },
                            { name: 'Project', type: 'relation', required: false, relationMicroappId: 'projects-sb', width: '1/3' },
                            { name: 'Area', type: 'relation', required: false, relationMicroappId: 'areas-sb', width: '1/3' },
                            { name: 'Cues', type: 'textarea', required: false, width: '1/3', placeholder: 'Keywords, Questions, Main Ideas...' },
                            { name: 'Main Notes', type: 'textarea', required: true, width: '2/3', placeholder: 'Detailed notes, definitions, examples...' },
                            { name: 'Summary', type: 'textarea', required: false, width: 'full', placeholder: 'Summary of the main points...' },
                            { name: 'Task', type: 'relation', required: false, relationMicroappId: 'tasks-sb', width: '1/3' }
                        ]
                    },
                    {
                        id: 'areas-sb',
                        systemId: 'second-brain',
                        name: 'Areas',
                        description: 'Ongoing responsibilities',
                        icon: '📋',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Name', type: 'text', required: true, width: 'full' },
                            { name: 'Description', type: 'textarea', required: false, width: 'full', placeholder: 'Standard of performance, maintenance requirements...' }
                        ]
                    },
                    {
                        id: 'resources-sb',
                        systemId: 'second-brain',
                        name: 'Resources',
                        description: 'Reference materials',
                        icon: '📚',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Title', type: 'text', required: true, width: 'full' },
                            { name: 'Type', type: 'select', options: ['Article', 'Book', 'Video', 'Course', 'Tool', 'Other'], required: true, width: '1/2' },
                            { name: 'URL', type: 'url', required: false, width: '1/2' },
                            { name: 'Project', type: 'relation', required: false, relationMicroappId: 'projects-sb', width: '1/2' },
                            { name: 'Area', type: 'relation', required: false, relationMicroappId: 'areas-sb', width: '1/2' },
                            { name: 'Notes', type: 'textarea', required: false, width: 'full' }
                        ]
                    },
                    {
                        id: 'inbox-sb',
                        systemId: 'second-brain',
                        name: 'Inbox',
                        description: 'Quick capture',
                        icon: '📥',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Note', type: 'textarea', required: true },
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Deadline', type: 'date', required: false },
                            { name: 'Processed', type: 'checkbox', required: false }
                        ]
                    },
                    {
                        id: 'archive-sb',
                        systemId: 'second-brain',
                        name: 'Archive',
                        description: 'Completed items',
                        icon: '📦',
                        availableViews: ['list'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Name', type: 'text', required: true },
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Original Location', type: 'text', required: false }
                        ]
                    }
                ]
            },

        ]
    }

    // REVIEW AGGREGATION METHODS

    // Get habit statistics for a period
    async getHabitStats(userId: string, startDate: string, endDate: string): Promise<HabitStats> {
        try {
            const supabase = getSupabase()
            const { data: entries } = await supabase
                .from('app_entries')
                .select('*')
                .eq('user_id', userId)
                .eq('system_id', 'atomic-habits')
                .gte('entry_date', startDate)
                .lte('entry_date', endDate)

            if (!entries) return this.getEmptyHabitStats()

            const habitMap = new Map<string, { name: string; completed: number; total: number }>()

            entries.forEach((entry: any) => {
                const data = entry.entry_data as any
                if (!habitMap.has(entry.microapp_id)) {
                    habitMap.set(entry.microapp_id, {
                        name: data.habitName || 'Unknown Habit',
                        completed: 0,
                        total: 0
                    })
                }
                const habit = habitMap.get(entry.microapp_id)!
                habit.total++
                if (data.completed) habit.completed++
            })

            const habitBreakdown = Array.from(habitMap.entries()).map(([id, data]) => ({
                habitId: id,
                habitName: data.name,
                completed: data.completed,
                total: data.total,
                rate: (data.completed / data.total) * 100
            }))

            const totalCompleted = habitBreakdown.reduce((sum, h) => sum + h.completed, 0)
            const totalHabits = habitBreakdown.reduce((sum, h) => sum + h.total, 0)

            return {
                totalHabits: habitMap.size,
                completedCount: totalCompleted,
                completionRate: totalHabits > 0 ? (totalCompleted / totalHabits) * 100 : 0,
                bestStreak: 0,
                currentStreak: 0,
                habitBreakdown
            }
        } catch (e) {
            return this.getEmptyHabitStats()
        }
    }

    // Get Pomodoro statistics for a period
    async getPomodoroStats(userId: string, startDate: string, endDate: string): Promise<PomodoroStats> {
        try {
            const supabase = getSupabase()
            const { data: sessions } = await supabase
                .from('pomodoro_sessions')
                .select('*')
                .eq('user_id', userId)
                .gte('completed_at', startDate)
                .lte('completed_at', endDate)
                .order('completed_at', { ascending: true })

            if (!sessions || sessions.length === 0) return this.getEmptyPomodoroStats()

            const dailyMap = new Map<string, { sessions: number; focusMinutes: number }>()
            let totalFocus = 0
            let totalBreak = 0

            sessions.forEach((s: any) => {
                const date = s.completed_at.split('T')[0]
                if (!dailyMap.has(date)) {
                    dailyMap.set(date, { sessions: 0, focusMinutes: 0 })
                }
                const day = dailyMap.get(date)!
                day.sessions++
                day.focusMinutes += s.work_duration
                totalFocus += s.work_duration
                totalBreak += s.break_duration
            })

            const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, data]) => ({
                date,
                ...data
            }))

            const mostProductive = dailyBreakdown.reduce((max, day) =>
                day.focusMinutes > max.focusMinutes ? day : max,
                dailyBreakdown[0]
            )

            return {
                totalSessions: sessions.length,
                totalFocusMinutes: totalFocus,
                totalBreakMinutes: totalBreak,
                averageSessionLength: totalFocus / sessions.length,
                mostProductiveDay: mostProductive.date,
                dailyBreakdown
            }
        } catch (e) {
            return this.getEmptyPomodoroStats()
        }
    }

    // Save review session
    async saveReviewSession(session: Omit<ReviewSession, 'id' | 'completedAt'>): Promise<void> {
        try {
            const supabase = getSupabase()
            const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2)
            const completedAt = new Date().toISOString()

            await supabase.from('review_sessions').insert({
                id,
                user_id: session.userId,
                review_type: session.reviewType,
                period_start: session.periodStart,
                period_end: session.periodEnd,
                completed_at: completedAt,
                notes: session.notes,
                insights_json: session.insightsJson,
                action_items: session.actionItems
            })
        } catch (e) {
            console.warn('Unable to save review session.')
        }
    }

    // Get review sessions
    async getReviewSessions(userId: string, reviewType?: 'weekly' | 'monthly' | 'yearly'): Promise<ReviewSession[]> {
        try {
            const supabase = getSupabase()
            let query = supabase
                .from('review_sessions')
                .select('*')
                .eq('user_id', userId)
                .order('completed_at', { ascending: false })

            if (reviewType) {
                query = query.eq('review_type', reviewType)
            }

            const { data } = await query
            if (!data) return []

            return data.map((r: any) => ({
                id: r.id,
                userId: r.user_id,
                reviewType: r.review_type,
                periodStart: r.period_start,
                periodEnd: r.period_end,
                completedAt: r.completed_at,
                notes: r.notes,
                insightsJson: r.insights_json,
                actionItems: r.action_items
            }))
        } catch (e) {
            return []
        }
    }

    // Fitness goals (for AI routine generation)
    async saveFitnessGoal(goal: Omit<FitnessGoal, 'id' | 'createdAt'>): Promise<void> {
        try {
            const supabase = getSupabase()
            const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
            const createdAt = new Date().toISOString()
            const payload = {
                id,
                user_id: goal.userId,
                goal: goal.goal,
                timeframe: goal.timeframe || null,
                priority: goal.priority || null,
                created_at: createdAt
            }
            const { error } = await supabase.from('fitness_goals').insert(payload)
            if (error) {
                console.warn('fitness_goals table not set up yet.')
            }
        } catch (e) {
            console.warn('Unable to save goal (table may not exist yet).')
        }
    }

    async getFitnessGoals(userId: string): Promise<FitnessGoal[]> {
        try {
            const supabase = getSupabase()
            const { data, error } = await supabase
                .from('fitness_goals')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (error || !data) return []
            return data.map((row: any) => ({
                id: row.id,
                userId: row.user_id,
                goal: row.goal,
                timeframe: row.timeframe || undefined,
                priority: row.priority || undefined,
                createdAt: row.created_at
            }))
        } catch (e) {
            return []
        }
    }

    // Libraries: Exercises
    async listExercises(options?: { search?: string; difficulty?: 'easy' | 'medium' | 'hard'; energy?: 'low' | 'medium' | 'high' }): Promise<Exercise[]> {
        try {
            const supabase = getSupabase()
            let query = supabase.from('exercise_library').select('*')
            if (options?.difficulty) query = query.eq('difficulty', options.difficulty)
            if (options?.energy) query = query.eq('energy_band', options.energy)
            if (options?.search) query = query.ilike('name', `%${options.search}%`)

            const { data, error } = await query.limit(100)
            if (error || !data) return []
            return data.map((row: any) => ({
                id: row.id,
                name: row.name,
                primaryMuscles: row.primary_muscles || [],
                secondaryMuscles: row.secondary_muscles || [],
                equipment: row.equipment || '',
                pattern: row.pattern || undefined,
                modality: row.modality,
                defaultDurationSec: row.default_duration_sec || undefined,
                defaultReps: row.default_reps || undefined,
                weightRecommendation: row.weight_recommendation || undefined,
                difficulty: row.difficulty || undefined,
                energyBand: row.energy_band || undefined,
                tags: row.tags || [],
                cues: row.cues || undefined,
                instructions: row.instructions || undefined,
                videoUrl: row.video_url || undefined,
                restDefaultSec: row.rest_default_sec || undefined,
            }))
        } catch (e) {
            return []
        }
    }

    async saveExercise(item: Partial<Exercise> & { name: string }): Promise<void> {
        try {
            const supabase = getSupabase()
            const payload = {
                id: item.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
                name: item.name,
                primary_muscles: item.primaryMuscles || [],
                secondary_muscles: item.secondaryMuscles || [],
                equipment: item.equipment || '',
                pattern: item.pattern || null,
                modality: item.modality || 'reps',
                default_duration_sec: item.defaultDurationSec || null,
                default_reps: item.defaultReps || null,
                weight_recommendation: item.weightRecommendation || null,
                difficulty: item.difficulty || null,
                energy_band: item.energyBand || null,
                tags: item.tags || [],
                cues: item.cues || null,
                instructions: item.instructions || null,
                video_url: item.videoUrl || null,
                rest_default_sec: item.restDefaultSec || null,
            }

            if (item.id) {
                const { error } = await supabase.from('exercise_library').update(payload).eq('id', item.id)
                if (error) console.warn('Unable to update exercise', error)
            } else {
                const { error } = await supabase.from('exercise_library').insert(payload)
                if (error) console.warn('Unable to insert exercise', error)
            }
        } catch (e) {
            console.warn('Unable to save exercise.')
        }
    }

    // Libraries: Food
    async listFoods(options?: { search?: string; tag?: string }): Promise<FoodItem[]> {
        try {
            const supabase = getSupabase()
            let query = supabase.from('food_library').select('*')
            if (options?.search) query = query.ilike('name', `%${options.search}%`)
            if (options?.tag) query = query.contains('tags', [options.tag])

            const { data, error } = await query.limit(100)
            if (error || !data) return []
            return data.map((row: any) => ({
                id: row.id,
                name: row.name,
                defaultServingGrams: row.default_serving_grams || undefined,
                calories: row.calories || undefined,
                protein: row.protein || undefined,
                carbs: row.carbs || undefined,
                fats: row.fats || undefined,
                micros: row.micros || undefined,
                tags: row.tags || [],
                sourceUrl: row.source_url || undefined,
                brand: row.brand || undefined
            }))
        } catch (e) {
            return []
        }
    }

    async saveFood(item: Partial<FoodItem> & { name: string }): Promise<void> {
        try {
            const supabase = getSupabase()
            const payload = {
                id: item.id || (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
                name: item.name,
                default_serving_grams: item.defaultServingGrams || null,
                calories: item.calories || null,
                protein: item.protein || null,
                carbs: item.carbs || null,
                fats: item.fats || null,
                micros: item.micros || null,
                tags: item.tags || [],
                source_url: item.sourceUrl || null,
                brand: item.brand || null
            }

            if (item.id) {
                const { error } = await supabase.from('food_library').update(payload).eq('id', item.id)
                if (error) console.warn('Unable to update food', error)
            } else {
                const { error } = await supabase.from('food_library').insert(payload)
                if (error) console.warn('Unable to insert food', error)
            }
        } catch (e) {
            console.warn('Unable to save food.')
        }
    }

    // Live sessions + sets
    async saveLiveSession(session: Omit<LiveSession, 'id' | 'startedAt'>): Promise<string | null> {
        try {
            const supabase = getSupabase()
            const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
            const startedAt = new Date().toISOString()
            const payload = {
                id,
                user_id: session.userId,
                routine_name: session.routineName || null,
                energy_level: session.energyLevel || null,
                started_at: startedAt,
                completed_at: session.completedAt || null
            }
            const { error } = await supabase.from('live_sessions').insert(payload)
            if (error) {
                console.warn('live_sessions table not set up yet.')
                return null
            }
            return id
        } catch (e) {
            console.warn('Unable to save live session.')
            return null
        }
    }

    async saveExerciseSets(sets: Array<Omit<ExerciseSet, 'id' | 'completedAt'>>): Promise<void> {
        if (sets.length === 0) return
        try {
            const supabase = getSupabase()
            const now = new Date().toISOString()
            const payload = sets.map(set => ({
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
                session_id: set.sessionId,
                exercise_id: set.exerciseId,
                user_id: set.userId,
                mode: set.mode,
                target_time_sec: set.targetTimeSec || null,
                target_reps: set.targetReps || null,
                actual_time_sec: set.actualTimeSec || null,
                actual_reps: set.actualReps || null,
                weight: set.weight ?? null,
                rpe: set.rpe ?? null,
                intensity: set.intensity || null,
                energy_at_start: set.energyAtStart || null,
                completed_at: now
            }))
            const { error } = await supabase.from('exercise_sets').insert(payload)
            if (error) {
                console.warn('exercise_sets table not set up yet.')
            }
        } catch (e) {
            console.warn('Unable to save exercise sets.')
        }
    }

    private getEmptyHabitStats(): HabitStats {
        return {
            totalHabits: 0,
            completedCount: 0,
            completionRate: 0,
            bestStreak: 0,
            currentStreak: 0,
            habitBreakdown: []
        }
    }

    private getEmptyPomodoroStats(): PomodoroStats {
        return {
            totalSessions: 0,
            totalFocusMinutes: 0,
            totalBreakMinutes: 0,
            averageSessionLength: 0,
            mostProductiveDay: '',
            dailyBreakdown: []
        }
    }

    // ─── HABITS MIGRATION ────────────────────────────────────────────────────
    /**
     * Migrates legacy `Category` field on atomic-habits entries → `Life Area`.
     * Safe to call repeatedly (skips entries that already have a Life Area).
     */
    async migrateHabitsToLifeAreas(userId: string): Promise<void> {
        try {
            const habits = await this.getEntries('atomic-habits', userId)
            const promises: Promise<void>[] = []
            for (const habit of habits) {
                const hasLifeArea = habit.data['Life Area'] && LIFE_AREA_IDS.includes(habit.data['Life Area'])
                if (!hasLifeArea) {
                    const oldCategory: string = habit.data['Category'] || 'General'
                    const mapped = CATEGORY_MIGRATION_MAP[oldCategory] ?? 'purpose'
                    const updatedData: Record<string, any> = { ...habit.data, 'Life Area': mapped }
                    delete updatedData['Category']
                    promises.push(this.saveEntry({ ...habit, data: updatedData }))
                }
            }
            if (promises.length > 0) {
                await Promise.all(promises)
                console.log(`[IMPROVE] Migrated ${promises.length} habits to Life Areas`)
            }
        } catch (e) {
            console.warn('[IMPROVE] Habit migration failed silently:', e)
        }
    }

    // ─── PROJECTION: LIFE AREA GOALS (macrodatabase — entries table) ──────────
    // Microapp: 'projection-goals'
    // Entry.data shape: { 'Life Area': LifeAreaId, year: number, goal: string, 'Is Big Four': boolean }

    async getLifeAreaGoals(userId: string, year: number): Promise<LifeAreaGoal[]> {
        try {
            const entries = await this.getEntries('projection-goals', userId)
            return entries
                .filter(e => Number(e.data['year']) === year)
                .map(e => ({
                    id: e.id,
                    userId,
                    lifeAreaId: e.data['Life Area'] as string,
                    year: Number(e.data['year']),
                    goal: e.data['goal'] as string ?? '',
                    isBigFour: Boolean(e.data['Is Big Four']),
                    createdAt: e.createdAt,
                    updatedAt: e.updatedAt ?? e.createdAt,
                }))
        } catch {
            return []
        }
    }

    async upsertLifeAreaGoal(userId: string, lifeAreaId: string, year: number, goal: string, isBigFour = false): Promise<void> {
        try {
            const entries = await this.getEntries('projection-goals', userId)
            const existing = entries.find(e => e.data['Life Area'] === lifeAreaId && Number(e.data['year']) === year)
            const payload = { 'Life Area': lifeAreaId, year, goal, 'Is Big Four': isBigFour }
            if (existing) {
                await this.updateEntry(existing.id, payload)
            } else {
                await this.addEntry(userId, 'projection-goals', payload)
            }
        } catch (e) {
            console.warn('[IMPROVE] upsertLifeAreaGoal error:', e)
        }
    }

    // ─── PROJECTION: MONTHLY REFLECTIONS (macrodatabase — entries table) ──────
    // Microapp: 'projection-reflections'
    // Entry.data shape: { 'Life Area': LifeAreaId, year: number, month: number, rating: number, journal: string }

    async getMonthlyReflections(userId: string, year: number): Promise<MonthlyReflection[]> {
        try {
            const entries = await this.getEntries('projection-reflections', userId)
            return entries
                .filter(e => Number(e.data['year']) === year)
                .map(e => ({
                    id: e.id,
                    userId,
                    lifeAreaId: e.data['Life Area'] as string,
                    year: Number(e.data['year']),
                    month: Number(e.data['month']),
                    rating: e.data['rating'] != null ? Number(e.data['rating']) : null,
                    journal: e.data['journal'] as string ?? null,
                    createdAt: e.createdAt,
                    updatedAt: e.updatedAt ?? e.createdAt,
                }))
        } catch {
            return []
        }
    }

    async upsertMonthlyReflection(userId: string, lifeAreaId: string, year: number, month: number, rating: number, journal: string): Promise<void> {
        try {
            const entries = await this.getEntries('projection-reflections', userId)
            const existing = entries.find(e =>
                e.data['Life Area'] === lifeAreaId &&
                Number(e.data['year']) === year &&
                Number(e.data['month']) === month
            )
            const payload = { 'Life Area': lifeAreaId, year, month, rating, journal }
            if (existing) {
                await this.updateEntry(existing.id, payload)
            } else {
                await this.addEntry(userId, 'projection-reflections', payload)
            }
        } catch (e) {
            console.warn('[IMPROVE] upsertMonthlyReflection error:', e)
        }
    }

    /**
     * Area Average Rating = (habit_completion_rate × 0.5) + (monthly_rating/10 × 0.5)
     * All data comes from the entries table — no custom tables needed.
     */
    async getAreaAverageRating(
        userId: string,
        lifeAreaId: string,
        year: number,
        month: number
    ): Promise<number | null> {
        try {
            // Get monthly reflection rating for this area
            const reflections = await this.getMonthlyReflections(userId, year)
            const reflection = reflections.find(r => r.lifeAreaId === lifeAreaId && r.month === month)
            const monthlyRating = reflection?.rating ?? null

            // Get all habits for this area and compute completion rate for this month
            const habits = await this.getEntries('atomic-habits', userId)
            const areaHabits = habits.filter(h => h.data['Life Area'] === lifeAreaId)

            let habitRate = 0
            if (areaHabits.length > 0) {
                const daysInMonth = new Date(year, month, 0).getDate()
                let totalPossible = 0
                let totalCompleted = 0

                for (const habit of areaHabits) {
                    let completedDates: string[] = []
                    try {
                        const raw = habit.data['completedDates']
                        if (Array.isArray(raw)) completedDates = raw
                        else if (typeof raw === 'string') completedDates = JSON.parse(raw)
                    } catch { /* ignore */ }

                    const frequency = habit.data['frequency'] || 'daily'
                    const repeatDays: string[] = (() => {
                        try { return JSON.parse(habit.data['repeatDays'] || '[]') } catch { return [] }
                    })()

                    const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
                    for (let d = 1; d <= daysInMonth; d++) {
                        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
                        const dayName = DAY_NAMES[new Date(year, month - 1, d).getDay()]
                        const isScheduled = frequency === 'daily' || (frequency === 'specific_days' && repeatDays.includes(dayName))
                        if (isScheduled) {
                            totalPossible++
                            if (completedDates.includes(dateStr)) totalCompleted++
                        }
                    }
                }
                habitRate = totalPossible > 0 ? totalCompleted / totalPossible : 0
            }

            if (monthlyRating === null && areaHabits.length === 0) return null
            if (monthlyRating === null) return Math.round(habitRate * 10 * 10) / 10
            if (areaHabits.length === 0) return monthlyRating

            const avg = (habitRate * 0.5 + (monthlyRating / 10) * 0.5) * 10
            return Math.round(avg * 10) / 10
        } catch {
            return null
        }
    }
}

export const dataStore = new DataStore()

// ─── PROJECTION TYPES ────────────────────────────────────────────────────────
export interface LifeAreaGoal {
    id: string
    userId: string
    lifeAreaId: string
    year: number
    goal: string
    isBigFour: boolean
    createdAt: string
    updatedAt: string
}

export interface MonthlyReflection {
    id: string
    userId: string
    lifeAreaId: string
    year: number
    month: number
    rating: number | null
    journal: string | null
    createdAt: string
    updatedAt: string
}
