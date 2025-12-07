'use client'
import { supabase } from '@/lib/supabase'

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
        // Check if we need to reset (version mismatch or no systems)
        const stored = this.getItem<System[]>('systems', [])

        const productivity = stored.find(s => s.id === 'productivity')
        const hasAtomicHabits = productivity?.microapps.some(m => m.id === 'atomic-habits')
        const hasPomodoro = productivity?.microapps.some(m => m.id === 'pomodoro')

        if (stored.length === 0 || stored.length !== 8 || !hasAtomicHabits || !hasPomodoro) {
            // Reset to defaults if wrong number of systems, outdated schema, or missing Atomic Habits
            const defaults = this.getDefaultSystems()
            this.setItem('systems', defaults)
            return defaults
        }
        return stored
        return stored
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
        let query = supabase.from('entries').select('*')

        if (microappId) {
            query = query.eq('microapp_id', microappId)
        }

        // If we have a userId, we could filter by it, but RLS should handle it securely on the server side.
        // However, for explicit client-side filtering (if needed):
        if (userId) {
            query = query.eq('user_id', userId)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching entries:', error)
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

    async addEntry(userId: string, microappId: string, data: Record<string, any>): Promise<void> {
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
    }

    async saveEntry(entry: Entry): Promise<void> {
        // Map Entry to Supabase table structure
        // If ID exists, upsert
        const payload = {
            id: entry.id, // Supabase/Postgres is UUID, ensure entry.id is UUID
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
        const { error } = await supabase
            .from('entries')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Error deleting entry:', error)
        }
    }

    // Pomodoro Sessions
    async savePomodoroSession(session: Omit<PomodoroSession, 'id' | 'completedAt'>): Promise<void> {
        try {
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
                        id: 'exercise',
                        systemId: 'body',
                        name: 'Exercise Tracker',
                        description: 'Track workouts and physical activities',
                        icon: '🏋️',
                        availableViews: ['list', 'calendar', 'chart'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Exercise Type', type: 'select', options: ['Cardio', 'Strength', 'Flexibility', 'Sports', 'Other'], required: true },
                            { name: 'Duration (min)', type: 'number', required: true, min: 1 },
                            { name: 'Intensity', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
                            { name: 'Notes', type: 'textarea', required: false }
                        ]
                    },
                    {
                        id: 'nutrition',
                        systemId: 'body',
                        name: 'Nutrition Log',
                        description: 'Track meals and nutritional intake',
                        icon: '🥗',
                        availableViews: ['list', 'table', 'chart'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Meal Type', type: 'select', options: ['Breakfast', 'Lunch', 'Dinner', 'Snack'], required: true },
                            { name: 'Description', type: 'textarea', required: true },
                            { name: 'Calories', type: 'number', required: false },
                            { name: 'Water (glasses)', type: 'number', required: false, min: 0, max: 20 }
                        ]
                    },
                    {
                        id: 'sleep',
                        systemId: 'body',
                        name: 'Sleep & Rest',
                        description: 'Monitor sleep quality and rest',
                        icon: '😴',
                        availableViews: ['list', 'calendar', 'chart'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Bedtime', type: 'time', required: true },
                            { name: 'Wake Time', type: 'time', required: true },
                            { name: 'Sleep Quality', type: 'select', options: ['Poor', 'Fair', 'Good', 'Excellent'], required: true },
                            { name: 'Notes', type: 'textarea', required: false }
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
                        id: 'budget',
                        systemId: 'money',
                        name: 'Budget Planner',
                        description: 'Plan and track monthly budgets',
                        icon: '📊',
                        availableViews: ['table', 'chart'],
                        defaultView: 'table',
                        fields: [
                            { name: 'Month', type: 'text', required: true },
                            { name: 'Category', type: 'select', options: ['Housing', 'Food', 'Transport', 'Entertainment', 'Savings', 'Other'], required: true },
                            { name: 'Budgeted Amount', type: 'number', required: true, min: 0 },
                            { name: 'Actual Amount', type: 'number', required: false, min: 0 }
                        ]
                    },
                    {
                        id: 'expenses',
                        systemId: 'money',
                        name: 'Expense Tracker',
                        description: 'Track daily expenses',
                        icon: '💸',
                        availableViews: ['list', 'table', 'chart'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Category', type: 'select', options: ['Housing', 'Food', 'Transport', 'Entertainment', 'Health', 'Other'], required: true },
                            { name: 'Amount', type: 'number', required: true, min: 0 },
                            { name: 'Description', type: 'text', required: true },
                            { name: 'Payment Method', type: 'select', options: ['Cash', 'Credit Card', 'Debit Card', 'Digital Wallet'], required: false }
                        ]
                    },
                    {
                        id: 'income',
                        systemId: 'money',
                        name: 'Income Tracker',
                        description: 'Track income sources',
                        icon: '💵',
                        availableViews: ['list', 'table', 'chart'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Source', type: 'text', required: true },
                            { name: 'Amount', type: 'number', required: true, min: 0 },
                            { name: 'Type', type: 'select', options: ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'], required: true },
                            { name: 'Notes', type: 'textarea', required: false }
                        ]
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
                        name: 'Project Manager',
                        description: 'Manage work projects',
                        icon: '📁',
                        availableViews: ['list', 'kanban', 'timeline'],
                        defaultView: 'kanban',
                        fields: [
                            { name: 'Project Name', type: 'text', required: true },
                            { name: 'Status', type: 'select', options: ['Not Started', 'In Progress', 'Blocked', 'Completed'], required: true },
                            { name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Urgent'], required: true },
                            { name: 'Due Date', type: 'date', required: false },
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
                        id: 'tasks',
                        systemId: 'productivity',
                        name: 'Task Manager',
                        description: 'GTD-style task management',
                        icon: '✅',
                        availableViews: ['list', 'kanban'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Task', type: 'text', required: true },
                            { name: 'Status', type: 'select', options: ['Next', 'Waiting', 'Someday', 'Done'], required: true },
                            { name: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'], required: true },
                            { name: 'Due Date', type: 'date', required: false },
                            { name: 'Context', type: 'select', options: ['@home', '@work', '@errands', '@calls', '@computer'], required: false }
                        ]
                    },
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
                            { name: 'Category', type: 'select', options: ['General', 'Work', 'Study', 'Health', 'Creative'], required: true, width: 'full' }
                        ]
                    },
                    {
                        id: 'pomodoro',
                        systemId: 'productivity',
                        name: 'Pomodoro Time',
                        description: 'Focus sessions with visual rewards',
                        icon: '⏱️',
                        availableViews: [],
                        defaultView: 'custom',
                        fields: [],
                        customPath: '/systems/productivity/pomodoro'
                    },
                    {
                        id: 'review',
                        systemId: 'productivity',
                        name: 'REVIEW',
                        description: 'Weekly, monthly & yearly GTD reviews',
                        icon: '📊',
                        availableViews: [],
                        defaultView: 'custom',
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
                        name: 'Contact Manager',
                        description: 'Manage important contacts',
                        icon: '👥',
                        availableViews: ['list', 'table'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Name', type: 'text', required: true },
                            { name: 'Relationship', type: 'select', options: ['Family', 'Friend', 'Colleague', 'Mentor', 'Other'], required: true },
                            { name: 'Email', type: 'email', required: false },
                            { name: 'Phone', type: 'text', required: false },
                            { name: 'Notes', type: 'textarea', required: false }
                        ]
                    },
                    {
                        id: 'interactions',
                        systemId: 'relationships',
                        name: 'Interaction Log',
                        description: 'Log meaningful interactions',
                        icon: '💬',
                        availableViews: ['list', 'timeline'],
                        defaultView: 'list',
                        fields: [
                            { name: 'Date', type: 'date', required: true },
                            { name: 'Person', type: 'text', required: true },
                            { name: 'Type', type: 'select', options: ['Call', 'Meeting', 'Message', 'Event', 'Other'], required: true },
                            { name: 'Summary', type: 'textarea', required: true }
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
                            { name: 'Project Name', type: 'text', required: true },
                            { name: 'Status', type: 'select', options: ['Active', 'On Hold', 'Completed'], required: true },
                            { name: 'Area', type: 'relation', required: true, relationMicroappId: 'areas-sb' },
                            { name: 'Description', type: 'textarea', required: false }
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
                            { name: 'Task', type: 'text', required: true },
                            { name: 'Status', type: 'checkbox', required: true },
                            { name: 'Start Date', type: 'date', required: true },
                            { name: 'End Date', type: 'date', required: false },
                            { name: 'Completion Date', type: 'date', required: false },
                            { name: 'Project', type: 'relation', required: false, relationMicroappId: 'projects-sb' },
                            { name: 'Notes', type: 'relation', required: false, relationMicroappId: 'notes-sb' },
                            { name: 'Resources', type: 'relation', required: false, relationMicroappId: 'resources-sb' },
                            { name: 'Assignee', type: 'text', required: false }
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
                            { name: 'Summary', type: 'textarea', required: false, width: 'full', placeholder: 'Summary of the main points...' }
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
                            { name: 'Name', type: 'text', required: true },
                            { name: 'Description', type: 'textarea', required: false }
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
                            { name: 'Title', type: 'text', required: true },
                            { name: 'Type', type: 'select', options: ['Article', 'Book', 'Video', 'Course', 'Tool', 'Other'], required: true },
                            { name: 'URL', type: 'url', required: false },
                            { name: 'Notes', type: 'textarea', required: false },
                            { name: 'Project', type: 'relation', required: false, relationMicroappId: 'projects-sb' },
                            { name: 'Area', type: 'relation', required: false, relationMicroappId: 'areas-sb' }
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
}

export const dataStore = new DataStore()
